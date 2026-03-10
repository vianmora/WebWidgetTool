import axios from 'axios';
import { GoogleReview, PlaceReviewsResult } from './google';

const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR_ID = 'compass~google-maps-reviews-scraper';

// ─── Fetch Google Reviews via Apify ───────────────────────────────────────────
// Uses the compass/google-maps-reviews-scraper actor.
// Runs synchronously (blocks until complete) — result is cached 7 days so the
// latency on first load (~30-60s) is acceptable.
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
        timeout: 120,  // seconds — Apify will abort the run after this
        memory: 1024,  // MB
      },
      timeout: 130_000, // axios timeout slightly above Apify timeout
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const items: any[] = Array.isArray(response.data) ? response.data : [];

  if (items.length > 0) {
    console.log('[apify] first item keys:', Object.keys(items[0]));
    console.log('[apify] first item sample:', JSON.stringify(items[0], null, 2).slice(0, 800));
  }

  // Place-level fields are on the first item (totalScore, reviewsCount)
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
