import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export default function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Rename modal
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Duplicate
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWidgets();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function loadWidgets() {
    try {
      const { data } = await api.get('/api/widgets');
      setWidgets(data);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  function openRename(widget: Widget) {
    setRenameId(widget.id);
    setRenameName(widget.name);
    setOpenMenu(null);
  }

  async function handleRename() {
    if (!renameId || !renameName.trim()) return;
    setRenaming(true);
    try {
      const { data } = await api.patch(`/api/widgets/${renameId}`, { name: renameName.trim() });
      setWidgets(ws => ws.map(w => w.id === renameId ? { ...w, name: data.name } : w));
      setRenameId(null);
    } finally {
      setRenaming(false);
    }
  }

  function openDeleteConfirm(id: string) {
    setDeleteId(id);
    setOpenMenu(null);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/widgets/${deleteId}`);
      setWidgets(ws => ws.filter(w => w.id !== deleteId));
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDuplicate(widget: Widget) {
    setDuplicating(widget.id);
    setOpenMenu(null);
    try {
      const { data: full } = await api.get(`/api/widgets/${widget.id}`);
      const { data: copy } = await api.post('/api/widgets', {
        name: `Copie de ${full.name}`,
        type: full.type,
        config: full.config,
      });
      setWidgets(ws => [copy, ...ws]);
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={menuRef}>
            {widgets.map((widget) => (
              <div key={widget.id} className="group">
                <Link to={`/widgets/${widget.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">

                    {/* Header row: icon | tag + 3-dot menu (inline, no overlap) */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">⭐</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                          {widget.type === 'google_reviews' ? 'Avis Google' : widget.type === 'google_reviews_webhook' ? 'Webhook JSON' : widget.type}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenu(openMenu === widget.id ? null : widget.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Actions"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="2.5" r="1.5"/>
                              <circle cx="8" cy="8" r="1.5"/>
                              <circle cx="8" cy="13.5" r="1.5"/>
                            </svg>
                          </button>

                          {openMenu === widget.id && (
                            <div
                              className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl border border-gray-200 shadow-lg py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => { e.preventDefault(); navigate(`/widgets/${widget.id}`); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <span>✏️</span> Modifier
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); openRename(widget); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <span>🏷️</span> Renommer
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); handleDuplicate(widget); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <span>📋</span> Dupliquer
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={(e) => { e.preventDefault(); openDeleteConfirm(widget.id); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <span>🗑️</span> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-sm">
                      {duplicating === widget.id ? 'Duplication…' : widget.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Créé le {new Date(widget.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
            <Link to="/widgets/new" className="h-full min-h-[100px]">
              <div className="h-full bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-gray-300 leading-none">+</span>
                <span className="text-xs text-gray-400 font-medium">Nouveau widget</span>
              </div>
            </Link>
          </div>
        )}
      </main>

      {/* Rename modal */}
      {renameId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Renommer le widget</h2>
            <input
              type="text"
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleRename}
                disabled={renaming || !renameName.trim()}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {renaming ? 'Sauvegarde…' : 'Renommer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Supprimer le widget ?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Cette action est irréversible. Le widget et son code d'intégration cesseront de fonctionner.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
