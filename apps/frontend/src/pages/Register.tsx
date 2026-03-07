import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/sign-up/email', { email, password, name: email.split('@')[0] });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-brand-subtle flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="font-bold text-lg text-brand-text mb-2">Vérifiez votre email</h2>
          <p className="text-sm text-gray-500">Un lien de confirmation a été envoyé à <strong>{email}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-subtle flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-sm overflow-hidden">
        <div className="px-8 pt-6 pb-5">
          <img src="/logo.png" alt="WebWidgetTool" className="h-8 w-auto" />
        </div>
        <hr className="border-gray-200" />
        <div className="px-8 pt-6 pb-4">
          <h1 className="text-lg font-bold text-brand-text mb-6">Créer un compte</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}

            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="8 caractères minimum" />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Répétez le mot de passe" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">Propulsé par WebWidgetTool</p>
    </div>
  );
}
