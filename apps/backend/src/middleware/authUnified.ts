import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isSaaS } from '../lib/mode';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; plan?: string };
}

/**
 * Unified auth middleware.
 * - selfhosted: validates JWT signed with JWT_SECRET (existing behaviour)
 * - saas: validates Better Auth session via the session context injected by Better Auth
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (isSaaS()) {
    return requireBetterAuth(req, res, next);
  }
  return requireJwt(req, res, next);
}

// --- Self-hosted: JWT from Authorization header ---
function requireJwt(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { email: string };
    req.user = { id: 'admin', email: decoded.email, plan: 'admin' };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- SaaS: Better Auth session (set by Better Auth handler) ---
async function requireBetterAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Better Auth exposes the session on req via its Express handler.
    // We read the session that Better Auth has already validated.
    const { auth } = await import('../lib/auth');
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      plan: (session.user as any).plan || 'free',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
