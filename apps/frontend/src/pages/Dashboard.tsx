import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Widget {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/widgets').then(({ data }) => {
      setWidgets(data);
      setLoading(false);
    });
  }, []);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">WebWidget Tool</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/widgets/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Nouveau widget
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-gray-500 mb-6">Aucun widget pour l'instant.</p>
            <Link
              to="/widgets/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Créer mon premier widget
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widget) => (
              <Link key={widget.id} to={`/widgets/${widget.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">⭐</span>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                      {widget.type === 'google_reviews' ? 'Avis Google' : widget.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{widget.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Créé le {new Date(widget.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </Link>
            ))}
            <Link to="/widgets/new" className="h-full">
              <div className="h-full bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-gray-300 leading-none">+</span>
                <span className="text-xs text-gray-400 font-medium">Nouveau widget</span>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
