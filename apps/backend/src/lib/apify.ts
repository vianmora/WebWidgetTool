import axios from 'axios';
import { GoogleReview, PlaceReviewsResult } from './google';

const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR_ID = 'compass~google-maps-reviews-scraper';

// ─── Read an existing dataset ─────────────────────────────────────────────────
export async function fetchDatasetItems(datasetId: string): Promise<PlaceReviewsResult | null> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;

  try {
    const response = await axios.get(
      `${APIFY_BASE}/datasets/${datasetId}/items`,
      { params: { token, clean: true }, timeout: 15_000 },
    );

    const items: any[] = Array.isArray(response.data) ? response.data : [];
    if (items.length === 0) return null;

    const first = items[0] || {};
    const averageRating: number | undefined =
      typeof first.totalScore === 'number' ? first.totalScore : undefined;
    const totalReviews: number | undefined =
      typeof first.reviewsCount === 'number' ? first.reviewsCount : undefined;

    const reviews: GoogleReview[] = items.map((item) => ({
      author_name: item.name || '',
      rating: typeof item.stars === 'number' ? item.stars : 0,
      text: item.text || '',
      time: item.publishedAtDate
        ? Math.floor(new Date(item.publishedAtDate).getTime() / 1000)
        : 0,
      profile_photo_url: item.reviewerPhotoUrl || '',
      relative_time_description: item.publishAt || '',
      review_photos: Array.isArray(item.reviewImageUrls) ? item.reviewImageUrls : [],
    }));

    return { reviews, averageRating, totalReviews };
  } catch (err: any) {
    console.error('[apify] fetchDatasetItems failed:', err?.message);
    return null;
  }
}

// ─── Create a schedule (every 7 days) + trigger an immediate first run ────────
// Returns { datasetId, scheduleId } to be stored on the Widget row.
export async function createScheduleAndRun(
  placeId: string,
  language: string,
  maxReviews: number,
): Promise<{ datasetId: string; scheduleId: string }> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('APIFY_TOKEN not configured');

  const placeUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}&hl=${language}`;
  const actorInput = {
    startUrls: [{ url: placeUrl }],
    maxReviews,
    language,
    reviewsSort: 'mostRelevant',
    scrapeReviewerInfo: true,
  };

  // 1. Create a named dataset so we can always read from the same ID
  const datasetRes = await axios.post(
    `${APIFY_BASE}/datasets`,
    { name: `wwt-${placeId}-${language}` },
    { params: { token }, timeout: 10_000 },
  );
  const datasetId: string = datasetRes.data?.data?.id;
  if (!datasetId) throw new Error('Failed to create Apify dataset');

  // 2. Create a schedule: every 7 days
  const scheduleRes = await axios.post(
    `${APIFY_BASE}/schedules`,
    {
      name: `wwt-${placeId}-${language}`,
      cronExpression: '0 3 */7 * *', // every 7 days at 03:00
      isEnabled: true,
      isExclusive: true,
      actions: [
        {
          type: 'RUN_ACTOR',
          actorId: ACTOR_ID,
          runInput: {
            body: JSON.stringify(actorInput),
            contentType: 'application/json',
          },
          runOptions: {
            build: 'latest',
            timeoutSecs: 120,
            memoryMbytes: 1024,
            outputDatasetId: datasetId,
          },
        },
      ],
    },
    { params: { token }, timeout: 10_000 },
  );
  const scheduleId: string = scheduleRes.data?.data?.id;
  if (!scheduleId) throw new Error('Failed to create Apify schedule');

  // 3. Trigger an immediate first run writing into our named dataset
  await axios.post(
    `${APIFY_BASE}/acts/${ACTOR_ID}/runs`,
    actorInput,
    {
      params: { token, outputDatasetId: datasetId, memory: 1024 },
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
    },
  );

  return { datasetId, scheduleId };
}

// ─── Delete a schedule ────────────────────────────────────────────────────────
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return;

  try {
    await axios.delete(
      `${APIFY_BASE}/schedules/${scheduleId}`,
      { params: { token }, timeout: 10_000 },
    );
  } catch (err: any) {
    // Non-blocking — if the schedule was already deleted, that's fine
    console.error('[apify] deleteSchedule failed:', err?.message);
  }
}

// ─── Fetch Google Reviews via Apify (run-sync fallback) ───────────────────────
// Used only when no dataset exists yet (first load without Apify configured,
// or as a one-time fallback). Result is cached 7 days in node-cache.
export async function fetchReviewsViaApify(
  placeId: string,
  maxReviews: number,
  language: string,
): Promise<PlaceReviewsResult> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('APIFY_TOKEN not configured');

  const placeUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}&hl=${language}`;

  const response = await axios.post(
    `${APIFY_BASE}/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
    {
      startUrls: [{ url: placeUrl }],
      maxReviews,
      language,
      reviewsSort: 'mostRelevant',
      scrapeReviewerInfo: true,
    },
    {
      params: {
        token,
        timeout: 120,
        memory: 1024,
      },
      timeout: 130_000,
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const items: any[] = Array.isArray(response.data) ? response.data : [];

  if (items.length > 0) {
    console.log('[apify] first item keys:', Object.keys(items[0]));
    console.log('[apify] first item sample:', JSON.stringify(items[0], null, 2).slice(0, 800));
  }

  const first = items[0] || {};
  const averageRating: number | undefined =
    typeof first.totalScore === 'number' ? first.totalScore : undefined;
  const totalReviews: number | undefined =
    typeof first.reviewsCount === 'number' ? first.reviewsCount : undefined;

  const reviews: GoogleReview[] = items.map((item) => ({
    author_name: item.name || '',
    rating: typeof item.stars === 'number' ? item.stars : 0,
    text: item.text || '',
    time: item.publishedAtDate
      ? Math.floor(new Date(item.publishedAtDate).getTime() / 1000)
      : 0,
    profile_photo_url: item.reviewerPhotoUrl || '',
    relative_time_description: item.publishAt || '',
    review_photos: Array.isArray(item.reviewImageUrls) ? item.reviewImageUrls : [],
  }));

  return { reviews, averageRating, totalReviews };
}
