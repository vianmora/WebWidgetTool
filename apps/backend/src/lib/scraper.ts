import * as fs from 'fs';

export interface ScrapedReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
  relative_time_description: string;
  review_photos: string[];
}

// ── playwright-core is loaded lazily so the backend starts even if it's not
//    installed yet (fallback to Places API kicks in instead of a crash). ────────
let sharedBrowser: any = null;

function getChromiumPath(): string {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const candidates = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  for (const p of candidates) {
    try { fs.accessSync(p); return p; } catch {}
  }
  return '/usr/bin/chromium-browser';
}

async function getBrowser(): Promise<any> {
  if (sharedBrowser?.isConnected()) return sharedBrowser;

  // Dynamic import — fails gracefully if playwright-core is not installed
  const { chromium } = await import('playwright-core');

  sharedBrowser = await chromium.launch({
    executablePath: getChromiumPath(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  sharedBrowser.on('disconnected', () => { sharedBrowser = null; });
  return sharedBrowser;
}

// ── Main scraper ───────────────────────────────────────────────────────────────
export async function scrapeGoogleReviews(
  placeId: string,
  maxReviews = 10,
  language = 'fr',
): Promise<ScrapedReview[]> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: language === 'fr' ? 'fr-FR' : 'en-US',
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  try {
    const url = `https://www.google.com/maps/place/?q=place_id:${placeId}&hl=${language}`;
    console.log(`[scraper] navigating to ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // ── Dismiss GDPR consent (EU) ──────────────────────────────────────────────
    try {
      const consent = page
        .locator('button:has-text("Tout accepter"), button:has-text("Accept all")')
        .first();
      if (await consent.isVisible({ timeout: 5000 })) {
        console.log('[scraper] dismissing GDPR consent');
        await consent.click();
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
        // After consent Google may redirect away from the place URL — re-navigate
        const urlAfterConsent = page.url();
        console.log(`[scraper] URL after consent: ${urlAfterConsent}`);
        if (!urlAfterConsent.includes(placeId)) {
          console.log('[scraper] redirected away from place, re-navigating...');
          await page.goto(
            `https://www.google.com/maps/place/?q=place_id:${placeId}&hl=${language}`,
            { waitUntil: 'networkidle', timeout: 30_000 },
          ).catch(() => page.waitForTimeout(5000));
        }
      }
    } catch {}

    // Diagnostics
    console.log(`[scraper] current URL: ${page.url()}`);
    console.log(`[scraper] page title: "${await page.title()}"`);

    // ── Click on the "Avis" / "Reviews" tab ───────────────────────────────────
    let tabClicked = false;

    // Strategy 1: [role="tab"] elements
    {
      const tabs = page.locator('[role="tab"]');
      const count = await tabs.count();
      console.log(`[scraper] [role=tab] count: ${count}`);
      for (let i = 0; i < count; i++) {
        const text = (await tabs.nth(i).textContent()) ?? '';
        console.log(`[scraper]   tab ${i}: "${text}"`);
        if (/avis|review/i.test(text)) {
          await tabs.nth(i).click();
          await page.waitForTimeout(2000);
          tabClicked = true;
          break;
        }
      }
    }

    // Strategy 2: button/link with text "Avis" or "Reviews" (only if strategy 1 found nothing)
    if (!tabClicked) {
      const reviewsBtn = page
        .locator('button, a, [role="button"]')
        .filter({ hasText: /^(Avis|Reviews)$/ })
        .first();
      if (await reviewsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[scraper] found Avis button via text filter, clicking...');
        await reviewsBtn.click();
        await page.waitForTimeout(2000);
        tabClicked = true;
      }
    }

    console.log(`[scraper] tab clicked: ${tabClicked}`);

    // ── Scroll the reviews feed to load more ──────────────────────────────────
    // Find the scrollable feed element (short timeout — fall back to window scroll)
    const feedEl = await page
      .locator('[role="feed"], div.m6QErb.DxyBCb, div.m6QErb')
      .first()
      .elementHandle({ timeout: 3000 })
      .catch(() => null);

    const scrollPasses = Math.ceil(maxReviews / 5) + 2;
    console.log(`[scraper] scrolling ${scrollPasses} passes (feedEl found: ${!!feedEl})`);
    for (let i = 0; i < scrollPasses; i++) {
      if (feedEl) {
        await feedEl.evaluate((el: Element) => el.scrollBy(0, 1400)).catch(() => {});
      } else {
        await page.evaluate(() => window.scrollBy(0, 1400));
      }
      await page.waitForTimeout(800);
    }

    // ── Expand "Voir plus" / "More" buttons ───────────────────────────────────
    const expandBtns = page.locator('button.w8nwRe, button.kyuRq');
    const btnCount = await expandBtns.count();
    for (let i = 0; i < btnCount; i++) {
      await expandBtns.nth(i).click({ timeout: 2000 }).catch(() => {});
    }
    if (btnCount > 0) await page.waitForTimeout(400);

    // ── Extract review cards ──────────────────────────────────────────────────
    // Try data-review-id first, fallback to jJc9Ad class (alternate Google Maps HTML)
    let cards = page.locator('[data-review-id]');
    let total = await cards.count();
    if (total === 0) {
      cards = page.locator('div.jJc9Ad');
      total = await cards.count();
    }
    console.log(`[scraper] found ${total} review cards`);
    const reviews: ScrapedReview[] = [];

    // Log first card HTML to identify correct selectors
    if (total > 0) {
      const firstCardHtml = await cards.first().innerHTML().catch(() => '');
      console.log(`[scraper] first card HTML (first 800 chars):\n${firstCardHtml.substring(0, 800)}`);
    }

    const T = { timeout: 2000 }; // short timeout — skip missing fields fast

    for (let i = 0; i < Math.min(total, maxReviews); i++) {
      const card = cards.nth(i);
      try {
        // Author name — try class selector, fallback to WEBjve aria-label
        let author_name =
          (await card.locator('div.d4r55, span.X43Kjb').first().textContent(T).catch(() => null))?.trim() ?? '';
        if (!author_name) {
          const ariaLabel = await card.locator('button.WEBjve').first().getAttribute('aria-label', T).catch(() => '');
          author_name = (ariaLabel ?? '').replace(/^Photo de /i, '').trim();
        }

        const ratingLabel =
          (await card
            .locator('span.kvMYJc, span[aria-label*="étoile"], span[aria-label*="star"]')
            .first()
            .getAttribute('aria-label', { timeout: 5000 })
            .catch(() => '')) ?? '';
        const ratingMatch = ratingLabel.match(/(\d+(?:[.,]\d+)?)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : 5; // default 5 if not parseable

        const text =
          (await card.locator('span.wiI7pd').first().textContent(T).catch(() => ''))?.trim() ?? '';

        const relative_time_description =
          (await card.locator('span.rsqaWe').first().textContent(T).catch(() => ''))?.trim() ?? '';

        const profile_photo_url =
          (await card.locator('img.NBa7we').first().getAttribute('src', T).catch(() => '')) ?? '';

        const photoEls = card.locator('button.Tya61d img, div.KtCyie img, button.aoRNLd img');
        const photoCount = await photoEls.count();
        const review_photos: string[] = [];
        for (let j = 0; j < photoCount; j++) {
          const src = await photoEls.nth(j).getAttribute('src', T).catch(() => '');
          if (src && src.startsWith('http')) {
            review_photos.push(src.replace(/=w\d+-h\d+.*$/, '=w600-h600-k-no'));
          }
        }

        reviews.push({
          author_name,
          rating,
          text,
          time: Math.floor(Date.now() / 1000),
          profile_photo_url,
          relative_time_description,
          review_photos,
        });
      } catch (err) {
        console.log(`[scraper] card ${i} error: ${err}`);
      }
    }

    console.log(`[scraper] returning ${reviews.length} reviews`);
    return reviews;
  } finally {
    await context.close();
  }
}
