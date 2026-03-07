import { useState, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { setError('Minimum 8 caractères.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: password });
      navigate('/login?reset=1');
    } catch {
      setError('Lien invalide ou expiré. Refaites une demande de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-subtle flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-sm overflow-hidden">
        <div className="px-8 pt-6 pb-5">
          <img src="/logo.png" alt="WebWidgetTool" className="h-8 w-auto" />
        </div>
        <hr className="border-gray-200" />
        <div className="px-8 pt-6 pb-4">
          <h1 className="text-lg font-bold text-brand-text mb-6">Nouveau mot de passe</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus placeholder="8 caractères minimum" />
            </div>
            <div>
              <label className="label">Confirmer</label>
              <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
        <hr className="border-gray-200" />
        <p className="text-center text-xs text-gray-400 py-3">Propulsé par WebWidgetTool</p>
      </div>
    </div>
  );
}
