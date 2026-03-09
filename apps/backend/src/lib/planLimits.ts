export type Plan = 'free' | 'starter' | 'pro' | 'agency' | 'admin';

interface PlanLimit {
  widgets: number;
  monthlyViews: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimit> = {
  free:    { widgets: 1,         monthlyViews: 500 },
  starter: { widgets: 5,         monthlyViews: 10_000 },
  pro:     { widgets: 20,        monthlyViews: 100_000 },
  agency:  { widgets: Infinity,  monthlyViews: Infinity },
  admin:   { widgets: Infinity,  monthlyViews: Infinity },
};

export function getPlanLimits(plan: string): PlanLimit {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}

export function hasReachedWidgetLimit(plan: string, currentCount: number): boolean {
  const limit = getPlanLimits(plan);
  return currentCount >= limit.widgets;
}

export function hasReachedViewLimit(plan: string, currentViews: number): boolean {
  const limit = getPlanLimits(plan);
  return currentViews >= limit.monthlyViews;
}
