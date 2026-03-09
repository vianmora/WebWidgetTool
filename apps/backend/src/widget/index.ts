import { injectStyles, BASE_CSS } from './core/styles';
import { renderPoweredBy, renderQuotaBanner } from './core/badge';
import { render as renderGoogleReviews } from './renderers/google_reviews';
import { render as renderWhatsApp } from './renderers/whatsapp_button';
import { render as renderTelegram } from './renderers/telegram_button';
import { render as renderSocialIcons } from './renderers/social_icons';
import { render as renderSocialShare } from './renderers/social_share';
import { render as renderCountdown } from './renderers/countdown_timer';
import { render as renderBusinessHours } from './renderers/business_hours';
import { render as renderFaq } from './renderers/faq';
import { render as renderPricingTable } from './renderers/pricing_table';
import { render as renderTeamMembers } from './renderers/team_members';
import { render as renderCookieBanner } from './renderers/cookie_banner';
import { render as renderBackToTop } from './renderers/back_to_top';
import { render as renderLogoCarousel } from './renderers/logo_carousel';
import { render as renderImageGallery } from './renderers/image_gallery';
import { render as renderGoogleMap } from './renderers/google_map';
import { render as renderPdfViewer } from './renderers/pdf_viewer';
import { render as renderTestimonials } from './renderers/testimonials';
import { render as renderRatingBadge } from './renderers/rating_badge';

// Determine API base URL: same origin (prod) or explicit VITE_API_URL (dev)
const API_BASE = (window as any).__WW_API_BASE__ || '';

type RendererFn = (container: HTMLElement, config: any, data: any) => void;

// Widgets that append to body instead of the container (floating elements)
const BODY_WIDGETS = new Set(['whatsapp_button', 'telegram_button', 'back_to_top', 'cookie_banner']);

const RENDERERS: Record<string, RendererFn> = {
  google_reviews:  (c, cfg, d) => renderGoogleReviews(c, cfg, d),
  testimonials:    (c, cfg)    => renderTestimonials(c, cfg),
  rating_badge:    (c, cfg, d) => renderRatingBadge(c, cfg, d),
  whatsapp_button: (c, cfg)    => renderWhatsApp(c, cfg),
  telegram_button: (c, cfg)    => renderTelegram(c, cfg),
  social_icons:    (c, cfg)    => renderSocialIcons(c, cfg),
  social_share:    (c, cfg)    => renderSocialShare(c, cfg),
  countdown_timer: (c, cfg)    => renderCountdown(c, cfg),
  business_hours:  (c, cfg)    => renderBusinessHours(c, cfg),
  faq:             (c, cfg)    => renderFaq(c, cfg),
  pricing_table:   (c, cfg)    => renderPricingTable(c, cfg),
  team_members:    (c, cfg)    => renderTeamMembers(c, cfg),
  cookie_banner:   (c, cfg)    => renderCookieBanner(c, cfg),
  back_to_top:     (c, cfg)    => renderBackToTop(c, cfg),
  logo_carousel:   (c, cfg)    => renderLogoCarousel(c, cfg),
  image_gallery:   (c, cfg)    => renderImageGallery(c, cfg),
  google_map:      (c, cfg)    => renderGoogleMap(c, cfg),
  pdf_viewer:      (c, cfg)    => renderPdfViewer(c, cfg),
};

async function initWidget(container: HTMLElement): Promise<void> {
  const widgetId = container.dataset.wwId;
  if (!widgetId) return;

  // Avoid double-init
  if (container.dataset.wwInit) return;
  container.dataset.wwInit = '1';

  injectStyles(BASE_CSS, 'base');
  container.classList.add('ww-widget');

  try {
    const res = await fetch(`${API_BASE}/widget/${widgetId}/data`);
    if (!res.ok) {
      const msg = res.status >= 500 ? 'Erreur de chargement du widget.' : 'Widget introuvable.';
      container.innerHTML = `<div style="color:#9ca3af;font-size:12px;padding:8px">${msg}</div>`;
      return;
    }

    const { widget, data, _poweredBy, _quotaExceeded } = await res.json();
    const type: string = widget.type;
    const config: any = widget.config;
    const renderer = RENDERERS[type];

    if (_quotaExceeded) {
      container.insertAdjacentHTML('beforeend', renderQuotaBanner());
    }

    if (renderer) {
      if (BODY_WIDGETS.has(type)) {
        // Floating widgets — rendered to body, container just acts as anchor
        renderer(container, config, data);
      } else {
        renderer(container, config, data);
      }
    } else {
      container.innerHTML = `<div style="color:#9ca3af;font-size:12px;padding:8px">Type de widget non supporté : ${type}</div>`;
    }

    if (_poweredBy && !BODY_WIDGETS.has(type)) {
      container.insertAdjacentHTML('beforeend', renderPoweredBy());
    }

  } catch (err) {
    container.innerHTML = `<div style="color:#9ca3af;font-size:12px;padding:8px">Erreur de chargement du widget.</div>`;
  }
}

function initAll(): void {
  document.querySelectorAll<HTMLElement>('[data-ww-id]').forEach(initWidget);
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// Also expose for dynamic usage
(window as any).WebWidgetTool = { init: initWidget, initAll };
