import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import prisma from './prisma';
import { sendMail, emailVerificationTemplate, passwordResetTemplate, welcomeTemplate } from './mailer';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production',

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe WebWidgetTool',
        html: passwordResetTemplate(url),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: 'Vérifiez votre adresse email WebWidgetTool',
        html: emailVerificationTemplate(url),
      });
    },
    afterEmailVerification: async (user) => {
      await sendMail({
        to: user.email,
        subject: 'Bienvenue sur WebWidgetTool !',
        html: welcomeTemplate(user.email),
      });
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),
    ...(process.env.FACEBOOK_CLIENT_ID && {
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      },
    }),
    ...(process.env.GITHUB_CLIENT_ID && {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    }),
  },

  user: {
    additionalFields: {
      plan: {
        type: 'string',
        defaultValue: 'free',
      },
      stripeCustomerId: {
        type: 'string',
        required: false,
      },
      stripeSubscriptionId: {
        type: 'string',
        required: false,
      },
      monthlyViewCount: {
        type: 'number',
        defaultValue: 0,
      },
      monthlyViewResetAt: {
        type: 'date',
        defaultValue: () => new Date(),
      },
    },
  },
});

export type Auth = typeof auth;
