import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Tag, X, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { storage } from '../services/storage';

interface Props {
  categories: Category[];
  setCategories: (data: Category[]) => void;
}

const CategoriesView: React.FC<Props> = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await storage.updateCategories(editingItem.id, formData);
        setCategories(categories.map(c =>
          c.id === editingItem.id ? { ...c, ...formData } : c
        ));
      } else {
        const newCategory: Category = {
          id: crypto.randomUUID(),
          ...formData
        };
        await storage.saveCategories([...categories, newCategory]);
        const updatedCategories = await storage.getCategories();
        setCategories(updatedCategories);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar categoría:', error);
      alert(error.message || 'Error al guardar la categoría');
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await storage.deleteCategories(itemToDelete);
        const newCategories = categories.filter(c => c.id !== itemToDelete);
        setCategories(newCategories);
        setItemToDelete(null);
      } catch (error: any) {
        console.error('❌ Error al eliminar categoría:', error);
        alert(error.message || 'Error al eliminar');
      }
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [categories, searchTerm, filterType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Categorías</h1>
          <p className="text-slate-500 text-sm">Configura los conceptos de ingresos y gastos ({filteredCategories.length} categorías).</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar categoría por nombre..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType(TransactionType.INCOME)}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterType === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setFilterType(TransactionType.EXPENSE)}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterType === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Gastos
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium bg-white rounded-3xl border border-slate-200">
            No se encontraron categorías registradas.
          </div>
        ) : (
          filteredCategories.map(c => (
            <div
              key={c.id}
              className="p-5 rounded-3xl border shadow-sm flex items-center justify-between group transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${c.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {c.type === TransactionType.INCOME ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-base leading-snug">{c.name}</span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {c.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal(c)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setItemToDelete(c.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-6 text-white shrink-0" style={{ backgroundColor: 'var(--color-form-header-bg)' }}>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--color-form-title-color)' }}>{editingItem ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Nombre de la Categoría</label>
                <input
                  required
                  autoFocus
                  type="text"
                  style={{ color: 'var(--color-form-input-text)' }}
                  placeholder="Ej. Diezmos, Mantenimiento, Eventos..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Tipo de Transacción</label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Gasto
                  </button>
                </div>
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
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center">Eliminar Categoría</h3>
            <p className="text-sm text-slate-500 text-center">
              ¿Estás seguro de que deseas eliminar esta categoría?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView;
