import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forget-password', { email, redirectTo: `${window.location.origin}/reset-password` });
      setDone(true);
    } catch {
      setError('Une erreur est survenue. Vérifiez votre email.');
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
          <h1 className="text-lg font-bold text-brand-text mb-6">Mot de passe oublié</h1>

          {done ? (
            <div className="text-center">
              <p className="text-sm text-gray-600">Si un compte existe pour <strong>{email}</strong>, vous recevrez un email avec un lien de réinitialisation.</p>
              <Link to="/login" className="text-primary text-sm font-semibold hover:underline mt-4 block">Retour à la connexion</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}
              <div>
                <label className="label">Votre email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="vous@exemple.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <Link to="/login" className="text-center text-sm text-gray-500 hover:text-primary">Retour</Link>
            </form>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">Propulsé par WebWidgetTool</p>
    </div>
  );
}
