import { Router } from 'express';
import { sendMail } from '../lib/mailer';

const router = Router();

// POST /api/docs-feedback
// Open CORS (handled in index.ts) — called from the static docs site
router.post('/', async (req, res) => {
  const { page_url, page_title, rating, comment } = req.body;

  if (!rating) {
    res.status(400).json({ error: 'rating is required' });
    return;
  }

  const to = process.env.FEEDBACK_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) {
    res.status(500).json({ error: 'No recipient email configured (FEEDBACK_EMAIL or ADMIN_EMAIL)' });
    return;
  }

  const stars = '★'.repeat(Number(rating)) + '☆'.repeat(5 - Number(rating));
  const isComment = comment && comment.trim();

  try {
    const subject = isComment
      ? `[Docs feedback] ${stars} + comment — ${page_title || page_url}`
      : `[Docs feedback] ${stars} — ${page_title || page_url}`;

    await sendMail({
      to,
      subject,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#F8F8F8;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:6px;overflow:hidden">
    <div style="background:#7c3aed;padding:24px 32px">
      <h1 style="color:#FFFFFF;margin:0;font-size:18px;font-weight:700">WebWidgetTool Docs — Feedback</h1>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 8px;color:#555;font-size:13px">Page</p>
      <p style="margin:0 0 20px;font-weight:600;font-size:15px">
        <a href="${page_url}" style="color:#7c3aed">${page_title || page_url}</a>
      </p>

      <p style="margin:0 0 8px;color:#555;font-size:13px">Rating</p>
      <p style="margin:0 0 20px;font-size:22px;letter-spacing:2px">${stars} <span style="font-size:14px;color:#888">(${rating}/5)</span></p>

      ${isComment ? `
      <p style="margin:0 0 8px;color:#555;font-size:13px">Comment</p>
      <p style="margin:0;background:#f5f3ff;border-left:3px solid #7c3aed;padding:12px 16px;border-radius:4px;font-size:14px;line-height:1.6;color:#333">${comment}</p>
      ` : ''}
    </div>
  </div>
</body>
</html>`,
    });

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[docs-feedback] mail error:', err?.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
