import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { useUser } from '../context/UserContext';

// Detect if running in SaaS mode (injected by backend or env)
const IS_SAAS = import.meta.env.VITE_APP_MODE === 'saas';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refetch } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (IS_SAAS) {
        // Better Auth sign-in
        await api.post('/api/auth/sign-in/email', { email, password });
      } else {
        // Self-hosted JWT login
        const { data } = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
      }
      await refetch();
      navigate('/');
    } catch {
      setError('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-subtle flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-sm overflow-hidden">
        <div className="px-8 pt-6 pb-5">
          <img src="/logo.png" alt="WebWidgetTool" className="h-8 w-auto" />
        </div>
        <hr className="border-gray-200" />
        <div className="px-8 pt-6 pb-4">
          <h1 className="text-lg font-bold text-brand-text mb-6">Connexion</h1>

          {params.get('reset') && (
            <p className="text-sm text-green-600 mb-4 bg-green-50 rounded-btn px-3 py-1.5">Mot de passe mis à jour. Connectez-vous.</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}

            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {IS_SAAS && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Mot de passe oublié ?</Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {IS_SAAS && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Créer un compte</Link>
            </p>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">Propulsé par WebWidgetTool</p>
    </div>
  );
}
