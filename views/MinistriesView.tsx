import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Church } from 'lucide-react';
import { Ministry, MinistryStatus } from '../types';
import { storage } from '../services/storage';

interface Props {
  ministries: Ministry[];
  setMinistries: (data: Ministry[]) => void;
}

const MinistriesView: React.FC<Props> = ({ ministries, setMinistries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ministry | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    status: MinistryStatus.ACTIVE
  });

  const handleOpenModal = (item?: Ministry) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, status: item.status });
    } else {
      setEditingItem(null);
      setFormData({ name: '', status: MinistryStatus.ACTIVE });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await storage.updateMinistries(editingItem.id, formData);
        setMinistries(ministries.map(m =>
          m.id === editingItem.id ? { ...m, ...formData } : m
        ));
      } else {
        const newMinistry: Ministry = {
          id: crypto.randomUUID(),
          ...formData
        };
        await storage.saveMinistries([...ministries, newMinistry]);
        const updatedMinistries = await storage.getMinistries();
        setMinistries(updatedMinistries);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar ministerio:', error);
      alert(error.message || 'Error al guardar ministerio');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ministerio?')) {
      try {
        await storage.deleteMinistries(id);
        setMinistries(ministries.filter(m => m.id !== id));
      } catch (error: any) {
        console.error('❌ Error al eliminar ministerio:', error);
        alert(error.message || 'Error al eliminar');
      }
    }
  };

  const filtered = ministries.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ministerios</h1>
          <p className="text-slate-500 text-sm">Organiza las áreas de servicio y trabajo de la comunidad ({filtered.length} ministerios).</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Nuevo Ministerio
        </button>
      </div>

      {/* Main Table Card */}
      <div
        className="rounded-3xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar ministerio por nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: 'var(--color-table-header-bg)', color: 'var(--color-table-header-text)' }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nombre del Ministerio</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl" style={{ color: 'var(--color-primary)' }}>
                        <Church className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${m.status === MinistryStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(m)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium text-xs">
                    No se encontraron ministerios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-6 text-white shrink-0" style={{ backgroundColor: 'var(--color-form-header-bg)' }}>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--color-form-title-color)' }}>{editingItem ? 'Editar Ministerio' : 'Nuevo Ministerio'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Nombre del Ministerio</label>
                <input
                  required
                  type="text"
                  style={{ color: 'var(--color-form-input-text)' }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Estado</label>
                <select
                  style={{ color: 'var(--color-form-input-text)' }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm font-bold"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MinistryStatus })}
                >
                  <option value={MinistryStatus.ACTIVE}>{MinistryStatus.ACTIVE}</option>
                  <option value={MinistryStatus.INACTIVE}>{MinistryStatus.INACTIVE}</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs">
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="text-white px-8 py-2.5 rounded-2xl font-bold text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  Guardar Ministerio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinistriesView;