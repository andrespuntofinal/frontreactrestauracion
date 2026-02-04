
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
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
        // Actualizar ministerio existente
        console.log('📝 Actualizando ministerio:', editingItem.id);
        await storage.updateMinistries(editingItem.id, formData);
        
        // Actualizar estado local
        setMinistries(ministries.map(m => 
          m.id === editingItem.id ? { ...m, ...formData } : m
        ));
        console.log('✅ Ministerio actualizado correctamente');
      } else {
        // Crear nuevo ministerio
        console.log('➕ Creando nuevo ministerio');
        const newMinistry: Ministry = {
          id: crypto.randomUUID(),
          ...formData
        };
        
        // Intentar guardar en la API
        await storage.saveMinistries([...ministries, newMinistry]);
        
        // Si es exitoso, refrescar la lista desde la API
        const updatedMinistries = await storage.getMinistries();
        setMinistries(updatedMinistries);
        
        console.log('✅ Ministerio creado correctamente');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar ministerio:', error);
      const errorMessage = error.message || 'Error desconocido al guardar';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ministerio?')) {
      try {
        console.log('🗑️ Eliminando ministerio:', id);
        await storage.deleteMinistries(id);
        
        // Actualizar estado local
        setMinistries(ministries.filter(m => m.id !== id));
        console.log('✅ Ministerio eliminado correctamente');
      } catch (error) {
        console.error('❌ Error al eliminar ministerio:', error);
        alert('Error al eliminar. Por favor intenta de nuevo.');
      }
    }
  };

  const filtered = ministries.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ministerios</h1>
          <p className="text-slate-500">Organiza las áreas de servicio de tu comunidad.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Nuevo Ministerio
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Ministerio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{m.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      m.status === MinistryStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(m)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron ministerios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">{editingItem ? 'Editar Ministerio' : 'Nuevo Ministerio'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombre del Ministerio</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Estado</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MinistryStatus })}
                >
                  <option value={MinistryStatus.ACTIVE}>{MinistryStatus.ACTIVE}</option>
                  <option value={MinistryStatus.INACTIVE}>{MinistryStatus.INACTIVE}</option>
                </select>
              </div>
              <div className="pt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  Guardar Cambios
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