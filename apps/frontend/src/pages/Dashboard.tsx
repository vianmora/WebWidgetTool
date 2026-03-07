import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getWidgetDef } from '../data/widgetCatalog';

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
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => { loadWidgets(); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-brand-text">Mes widgets</h1>
        <Link to="/widgets/new" className="btn-primary">+ Nouveau widget</Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : widgets.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🚀</div>
          <p className="text-gray-500 mb-6 text-sm">Aucun widget pour l'instant. Créez votre premier !</p>
          <Link to="/widgets/new" className="btn-primary">Créer mon premier widget</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={menuRef}>
          {widgets.map((widget) => {
            const def = getWidgetDef(widget.type);
            return (
              <div key={widget.id} className="group relative">
                <Link to={`/widgets/${widget.id}`}>
                  <div className="card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer min-h-[100px]">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{def?.icon || '🔧'}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                          {def?.name || widget.type}
                        </span>
                        <div className="relative">
                          <button
                            onClick={e => { e.preventDefault(); e.stopPropagation(); setOpenMenu(openMenu === widget.id ? null : widget.id); }}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="2.5" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13.5" r="1.5"/>
                            </svg>
                          </button>
                          {openMenu === widget.id && (
                            <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg border border-gray-200 shadow-lg py-1" onClick={e => e.stopPropagation()}>
                              <button onClick={e => { e.preventDefault(); navigate(`/widgets/${widget.id}`); }} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-subtle flex items-center gap-2">✏️ Modifier</button>
                              <button onClick={e => { e.preventDefault(); openRename(widget); }} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-subtle flex items-center gap-2">🏷️ Renommer</button>
                              <button onClick={e => { e.preventDefault(); handleDuplicate(widget); }} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-subtle flex items-center gap-2">📋 Dupliquer</button>
                              <hr className="my-1 border-gray-100" />
                              <button onClick={e => { e.preventDefault(); setDeleteId(widget.id); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">🗑️ Supprimer</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-brand-text text-sm">{duplicating === widget.id ? 'Duplication...' : widget.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Créé le {new Date(widget.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </Link>
              </div>
            );
          })}
          <Link to="/widgets/new" className="h-full min-h-[100px]">
            <div className="h-full bg-white rounded-lg border-2 border-dashed border-gray-200 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[100px]">
              <span className="text-3xl text-gray-300 leading-none">+</span>
              <span className="text-xs text-gray-400 font-medium">Nouveau widget</span>
            </div>
          </Link>
        </div>
      )}

      {/* Rename modal */}
      {renameId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-brand-text mb-4">Renommer le widget</h2>
            <input className="input mb-4" value={renameName} onChange={e => setRenameName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename()} autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameId(null)} className="btn-secondary">Annuler</button>
              <button onClick={handleRename} disabled={renaming || !renameName.trim()} className="btn-primary">{renaming ? 'Sauvegarde...' : 'Renommer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-brand-text mb-2">Supprimer ce widget ?</h2>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible. Le snippet d'intégration cessera de fonctionner.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700">{deleting ? 'Suppression...' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
