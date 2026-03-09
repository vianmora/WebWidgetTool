import { useEffect, useState } from 'react';
import api from '../lib/api';

interface UserRow {
  id: string;
  email: string;
  plan: string;
  monthlyViewCount: number;
  createdAt: string;
  _count: { widgets: number };
}

interface Stats {
  totalUsers: number;
  totalWidgets: number;
  byPlan: Array<{ plan: string; _count: { id: number } }>;
}

const PLAN_OPTIONS = ['free', 'starter', 'pro', 'agency'];
const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-primary',
  agency: 'bg-accent/20 text-accent-dark',
};

export default function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [usersRes, statsRes] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/stats'),
    ]);
    setUsers(usersRes.data);
    setStats(statsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const changePlan = async (userId: string, plan: string) => {
    await api.patch(`/api/admin/users/${userId}`, { plan });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Chargement...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-brand-text mb-6">Administration</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500">Utilisateurs</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-primary">{stats.totalWidgets}</div>
            <div className="text-xs text-gray-500">Widgets</div>
          </div>
          {stats.byPlan.map(bp => (
            <div key={bp.plan} className="card">
              <div className="text-2xl font-bold text-primary">{bp._count.id}</div>
              <div className="text-xs text-gray-500">{bp.plan}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-subtle border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Widgets</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Vues/mois</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-brand-subtle">
                <td className="px-4 py-3 text-brand-text">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.plan}
                    onChange={e => changePlan(u.id, e.target.value)}
                    className={`text-xs font-semibold rounded px-2 py-1 border-0 cursor-pointer ${PLAN_COLORS[u.plan] || ''}`}
                  >
                    {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-600">{u._count.widgets}</td>
                <td className="px-4 py-3 text-gray-600">{u.monthlyViewCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
