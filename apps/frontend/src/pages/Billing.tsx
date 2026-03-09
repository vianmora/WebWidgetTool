import { useState } from 'react';
import { useUser } from '../context/UserContext';
import api from '../lib/api';

const PLANS = [
  { id: 'free',    name: 'Gratuit',  price: '0',  period: 'mois', widgets: 1,         views: '500',      features: ['1 widget', '500 vues/mois', 'Badge "Powered by"'] },
  { id: 'starter', name: 'Starter',  price: '9',  period: 'mois', widgets: 5,         views: '10 000',   features: ['5 widgets', '10 000 vues/mois', 'Sans badge'] },
  { id: 'pro',     name: 'Pro',      price: '19', period: 'mois', widgets: 20,        views: '100 000',  features: ['20 widgets', '100 000 vues/mois', 'Analytics', 'CSS personnalisé'] },
  { id: 'agency',  name: 'Agency',   price: '49', period: 'mois', widgets: Infinity,  views: 'Illimitées', features: ['Widgets illimités', 'Vues illimitées', 'Support prioritaire', 'Tout inclus'] },
];

const PLAN_LABELS: Record<string, string> = { free: 'Gratuit', starter: 'Starter', pro: 'Pro', agency: 'Agency' };

export default function Billing() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await api.post('/api/billing/checkout', { plan: planId });
      window.location.href = res.data.url;
    } catch {
      alert('Erreur lors de la création de la session de paiement.');
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading('portal');
    try {
      const res = await api.post('/api/billing/portal');
      window.location.href = res.data.url;
    } catch {
      alert('Erreur lors de l\'ouverture du portail de facturation.');
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = user?.plan || 'free';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-brand-text mb-1">Facturation</h1>
        <p className="text-sm text-gray-500">
          Plan actuel : <span className="font-semibold text-primary">{PLAN_LABELS[currentPlan] || currentPlan}</span>
        </p>
      </div>

      {/* Manage subscription button if paid plan */}
      {currentPlan !== 'free' && (
        <div className="card mb-8 flex items-center justify-between">
          <div>
            <div className="font-semibold text-brand-text text-sm">Gérer mon abonnement</div>
            <div className="text-xs text-gray-500">Modifier votre moyen de paiement, télécharger vos factures ou annuler.</div>
          </div>
          <button onClick={handlePortal} disabled={loading === 'portal'} className="btn-secondary">
            {loading === 'portal' ? 'Chargement...' : 'Portail Stripe'}
          </button>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan;
          const isDowngrade = PLANS.findIndex(p => p.id === currentPlan) > PLANS.findIndex(p => p.id === plan.id);
          return (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-5 flex flex-col gap-3 ${isCurrent ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}`}
            >
              <div>
                <div className="font-bold text-brand-text">{plan.name}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-primary">{plan.price}€</span>
                  <span className="text-xs text-gray-500">/{plan.period}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-brand-text">
                    <span className="text-accent-dark font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || plan.id === 'free' || loading === plan.id}
                className={isCurrent ? 'btn-accent w-full cursor-default' : 'btn-primary w-full'}
              >
                {loading === plan.id ? 'Chargement...' : isCurrent ? 'Plan actuel' : isDowngrade ? 'Rétrograder' : 'Choisir'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
