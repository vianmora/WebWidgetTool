import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'WebWidgetTool <noreply@webwidget.app>',
    to,
    subject,
    html,
  });
}

// --- Email templates ---

export function emailVerificationTemplate(verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#F8F8F8;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:6px;overflow:hidden">
    <div style="background:#621B7A;padding:32px 40px">
      <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700">WebWidgetTool</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1D1E18;font-size:18px;margin:0 0 16px">Vérifiez votre adresse email</h2>
      <p style="color:#1D1E18;line-height:1.6;margin:0 0 24px">
        Cliquez sur le bouton ci-dessous pour activer votre compte WebWidgetTool.
        Ce lien expire dans 24 heures.
      </p>
      <a href="${verificationUrl}"
         style="display:inline-block;background:#621B7A;color:#FFFFFF;text-decoration:none;
                padding:12px 24px;border-radius:5px;font-weight:600;font-size:14px">
        Vérifier mon email
      </a>
      <p style="color:#888;font-size:12px;margin:24px 0 0">
        Si vous n'avez pas créé de compte, ignorez cet email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function passwordResetTemplate(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#F8F8F8;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:6px;overflow:hidden">
    <div style="background:#621B7A;padding:32px 40px">
      <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700">WebWidgetTool</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1D1E18;font-size:18px;margin:0 0 16px">Réinitialisation du mot de passe</h2>
      <p style="color:#1D1E18;line-height:1.6;margin:0 0 24px">
        Vous avez demandé à réinitialiser votre mot de passe.
        Cliquez sur le bouton ci-dessous. Ce lien expire dans 1 heure.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#621B7A;color:#FFFFFF;text-decoration:none;
                padding:12px 24px;border-radius:5px;font-weight:600;font-size:14px">
        Réinitialiser mon mot de passe
      </a>
      <p style="color:#888;font-size:12px;margin:24px 0 0">
        Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeTemplate(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#F8F8F8;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:6px;overflow:hidden">
    <div style="background:#621B7A;padding:32px 40px">
      <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700">WebWidgetTool</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1D1E18;font-size:18px;margin:0 0 16px">Bienvenue sur WebWidgetTool !</h2>
      <p style="color:#1D1E18;line-height:1.6;margin:0 0 24px">
        Votre compte <strong>${email}</strong> est activé.
        Vous pouvez maintenant créer vos premiers widgets intégrables.
      </p>
      <a href="${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}"
         style="display:inline-block;background:#621B7A;color:#FFFFFF;text-decoration:none;
                padding:12px 24px;border-radius:5px;font-weight:600;font-size:14px">
        Accéder au dashboard
      </a>
    </div>
  </div>
</body>
</html>`;
}
