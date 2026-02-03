
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Category, TransactionType } from '../types';

interface Props {
  categories: Category[];
  setCategories: (data: Category[]) => void;
}

const CategoriesView: React.FC<Props> = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: TransactionType.INCOME
  });

  const handleOpenModal = (item?: Category) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, type: item.type });
    } else {
      setEditingItem(null);
      setFormData({ name: '', type: TransactionType.INCOME });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setCategories(categories.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
    } else {
      setCategories([...categories, { id: crypto.randomUUID(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar categoría?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="text-slate-500">Configura los conceptos de ingresos y gastos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${c.type === TransactionType.INCOME ? 'bg-green-50' : 'bg-red-50'}`}>
                <Tag className={`w-6 h-6 ${c.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">{c.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${c.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
                  {c.type}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleOpenModal(c)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">{editingItem ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre de la Categoría</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  placeholder="Ej. Diezmos, Servicios..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Transacción</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                      formData.type === TransactionType.INCOME ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Ingreso
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                      formData.type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Gasto
                  </button>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView;
