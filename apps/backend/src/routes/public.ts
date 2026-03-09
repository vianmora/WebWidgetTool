import { Router } from 'express';
import axios from 'axios';
import prisma from '../lib/prisma';
import cache from '../lib/cache';
import { fetchGoogleReviewsWithPhotos } from '../lib/google';
import { scrapeGoogleReviews } from '../lib/scraper';
import { isSaaS } from '../lib/mode';
import { hasReachedViewLimit } from '../lib/planLimits';

const router = Router();

const USE_SCRAPER = process.env.PLAYWRIGHT_SCRAPER === 'true';

// Accepts any Google CDN host (profile photos + scraped review photos)
function isAllowedImageHost(hostname: string): boolean {
  return (
    hostname.endsWith('.googleusercontent.com') ||
    hostname.endsWith('.googleapis.com') ||
    hostname === 'lh3.googleusercontent.com' ||
    hostname === 'lh4.googleusercontent.com' ||
    hostname === 'lh5.googleusercontent.com' ||
    hostname === 'lh6.googleusercontent.com'
  );
}

const imageCache = new Map<string, { data: Buffer; contentType: string }>();

// ─── Image proxy (Google photos: profile + review) ────────────────────────────
router.get('/image', async (req, res) => {
  const url = req.query.url as string;
  if (!url) { res.status(400).end(); return; }

  let parsed: URL;
  try { parsed = new URL(url); } catch { res.status(400).end(); return; }

  if (!isAllowedImageHost(parsed.hostname)) { res.status(403).end(); return; }

  if (imageCache.has(url)) {
    const { data, contentType } = imageCache.get(url)!;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(data);
    return;
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';
    imageCache.set(url, { data, contentType });
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(data);
  } catch {
    res.status(502).end();
  }
});

// ─── Generic widget data endpoint ─────────────────────────────────────────────
async function getWidgetData(widgetId: string, req: any) {
  const widget = await prisma.widget.findUnique({ where: { id: widgetId } });
  if (!widget) return null;

  const config = widget.config as any;

  switch (widget.type) {
    case 'google_reviews': {
      const language: string = config.language || 'fr';
      const minRating: number = Number(config.minRating ?? 1);
      const maxReviews: number = Number(config.maxReviews ?? 5);
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      let rawReviews: Awaited<ReturnType<typeof fetchGoogleReviewsWithPhotos>>;

      if (USE_SCRAPER) {
        try {
          rawReviews = await scrapeGoogleReviews(config.placeId, maxReviews, language);
        } catch (scraperErr) {
          console.error('[scraper] Playwright failed, falling back to Places API:', scraperErr);
          const apiKey = process.env.GOOGLE_MAPS_API_KEY || config.apiKey;
          rawReviews = apiKey
            ? await fetchGoogleReviewsWithPhotos(config.placeId, apiKey, language)
            : [];
        }
      } else {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || config.apiKey;
        rawReviews = await fetchGoogleReviewsWithPhotos(config.placeId, apiKey, language);
      }

      const filtered = rawReviews
        .filter((r) => r.rating >= minRating)
        .slice(0, maxReviews)
        .map((r) => ({
          ...r,
          profile_photo_url: r.profile_photo_url
            ? `${baseUrl}/widget/image?url=${encodeURIComponent(r.profile_photo_url)}`
            : r.profile_photo_url,
          review_photos: (r.review_photos || []).map(
            (url) => `${baseUrl}/widget/image?url=${encodeURIComponent(url)}`,
          ),
        }));

      return { reviews: filtered };
    }

    // Static/config-only widgets — data comes from config itself
    case 'testimonials':
    case 'whatsapp_button':
    case 'telegram_button':
    case 'social_share':
    case 'social_icons':
    case 'business_hours':
    case 'faq':
    case 'pricing_table':
    case 'team_members':
    case 'countdown_timer':
    case 'back_to_top':
    case 'cookie_banner':
    case 'logo_carousel':
    case 'image_gallery':
    case 'google_map':
    case 'rating_badge':
      return {};

    default:
      return {};
  }
}

// ─── GET /widget/:id/data (new generic endpoint) ───────────────────────────────
router.get('/:id/data', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `data:${id}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const widget = await prisma.widget.findUnique({ where: { id } });
    if (!widget || !widget.isActive) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }

    const config = widget.config as any;

    // View quota check (SaaS only)
    let quotaExceeded = false;
    let poweredBy = false;

    if (isSaaS() && widget.userId) {
      const user = await prisma.user.findUnique({ where: { id: widget.userId } });
      if (user) {
        // Reset monthly counter if needed
        const now = new Date();
        const resetAt = new Date(user.monthlyViewResetAt);
        const needsReset = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();
        if (needsReset) {
          await prisma.user.update({
            where: { id: user.id },
            data: { monthlyViewCount: 1, monthlyViewResetAt: now },
          });
        } else {
          if (hasReachedViewLimit(user.plan, user.monthlyViewCount)) {
            quotaExceeded = true;
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { monthlyViewCount: { increment: 1 } },
            });
          }
        }
        poweredBy = user.plan === 'free';
      }
    }

    // Track analytics
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.widgetView.upsert({
        where: { widgetId_date: { widgetId: id, date: today } },
        create: { widgetId: id, date: today, count: 1 },
        update: { count: { increment: 1 } },
      });
    } catch {
      // analytics failure is non-blocking
    }

    const data = await getWidgetData(id, req);
    if (data === null) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }

    const result = {
      widget: {
        id: widget.id,
        name: widget.name,
        type: widget.type,
        config: {
          theme: config.theme || 'light',
          accentColor: config.accentColor || '#621B7A',
          layout: config.layout || 'list',
          ...config,
        },
      },
      data,
      _poweredBy: poweredBy,
      _quotaExceeded: quotaExceeded,
    };

    // Only cache non-quota-exceeded responses with actual content
    const hasContent = !data || (data as any).reviews === undefined || (data as any).reviews?.length > 0;
    if (!quotaExceeded && hasContent) {
      cache.set(cacheKey, result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Legacy alias: /widget/:id/reviews → /widget/:id/data ─────────────────────
router.get('/:id/reviews', async (req, res) => {
  // Forward to the new endpoint logic for backwards compatibility
  req.url = `/${req.params.id}/data`;
  res.redirect(307, `/widget/${req.params.id}/data`);
});

export default router;
