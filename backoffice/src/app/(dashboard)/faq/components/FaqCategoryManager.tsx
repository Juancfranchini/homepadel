'use client';

import { useState } from 'react';
import { CirclePlus, FilePenLine, Trash2, ListChecks, X, Check } from 'lucide-react';

interface Props {
  categories: string[];
  onAdd: (cat: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  onDelete: (cat: string) => void;
}

type View = 'list' | 'add' | 'edit' | 'delete';

export default function FaqCategoryManager({ categories, onAdd, onEdit, onDelete }: Props) {
  const [view, setView] = useState<View>('list');
  const [newCat, setNewCat] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editValue, setEditValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState('');

  const handleAdd = () => {
    if (newCat.trim()) {
      onAdd(newCat.trim().toUpperCase());
      setNewCat('');
      setView('list');
    }
  };

  const handleEdit = () => {
    if (editValue.trim()) {
      onEdit(editTarget, editValue.trim().toUpperCase());
      setEditValue('');
      setEditTarget('');
      setView('list');
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget('');
      setView('list');
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0 flex flex-col gap-1">
          <button onClick={() => setView('list')} className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + (view === 'list' ? 'bg-white border border-[#C8FF00] text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-100')}>
            <ListChecks className="w-4 h-4" />Ver categorias
          </button>
          <button onClick={() => setView('add')} className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + (view === 'add' ? 'bg-white border border-[#C8FF00] text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-100')}>
            <CirclePlus className="w-4 h-4" />Nueva
          </button>
          <button onClick={() => setView('edit')} className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + (view === 'edit' ? 'bg-white border border-[#C8FF00] text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-100')}>
            <FilePenLine className="w-4 h-4" />Editar
          </button>
          <button onClick={() => setView('delete')} className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + (view === 'delete' ? 'bg-white border border-[#C8FF00] text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-100')}>
            <Trash2 className="w-4 h-4" />Eliminar
          </button>
        </div>

        <div className="w-px bg-gray-200 flex-shrink-0" />

        <div className="flex-1">
          {view === 'list' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorias disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span key={cat} className="text-xs font-medium bg-white text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {view === 'add' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Nueva categoria</h3>
              <div className="flex gap-2">
                <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value.toUpperCase())} placeholder="Ej: GARANTIA" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40" />
                <button onClick={handleAdd} disabled={!newCat.trim()} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold disabled:opacity-50"><Check className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {view === 'edit' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Editar categoria</h3>
              <div className="space-y-3">
                <select value={editTarget} onChange={(e) => { setEditTarget(e.target.value); setEditValue(e.target.value); }} className="w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm">
                  <option value="">Seleccionar categoria</option>
                  {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                {editTarget && (
                  <div className="flex gap-2">
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value.toUpperCase())} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40" />
                    <button onClick={handleEdit} disabled={!editValue.trim()} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold disabled:opacity-50"><Check className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'delete' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Eliminar categoria</h3>
              <select value={deleteTarget} onChange={(e) => setDeleteTarget(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-3">
                <option value="">Seleccionar categoria</option>
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              {deleteTarget && (
                <button onClick={handleDelete} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00]">Eliminar {deleteTarget}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}