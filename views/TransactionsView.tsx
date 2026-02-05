
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Filter, Download, FileText, ArrowUpCircle, ArrowDownCircle, Edit2, Wallet, CreditCard, AlertTriangle } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, Category, Person } from '../types';
import { storage } from '../services/storage';

interface Props {
  transactions: Transaction[];
  setTransactions: (data: Transaction[]) => void;
  categories: Category[];
  people: Person[];
}

const TransactionsView: React.FC<Props> = ({ transactions, setTransactions, categories, people }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [displayValue, setDisplayValue] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);  // ← AGREGAR ESTO
  const itemsPerPage = 5;  // ← AGREGAR ESTO

  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: TransactionType.INCOME,
    medioTrx: PaymentMethod.CASH,
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    value: 0,
    personId: '',
    observations: '',
    attachmentUrl: '',
    attachmentName: ''
  });

  const filteredFormCategories = useMemo(() => {
    return categories.filter(c => c.type === formData.type);
  }, [categories, formData.type]);

  const formatNumber = (num: string) => {
    const cleanValue = num.replace(/\D/g, '');
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatNumber(rawValue);
    setDisplayValue(formattedValue);
    
    const numericValue = parseInt(rawValue.replace(/\D/g, ''), 10) || 0;
    setFormData({ ...formData, value: numericValue });
  };

  const handleOpenModal = (item?: Transaction) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
      setDisplayValue(item.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    } else {
      setEditingItem(null);
      setFormData({
        type: TransactionType.INCOME,
        medioTrx: PaymentMethod.CASH,
        categoryId: categories.find(c => c.type === TransactionType.INCOME)?.id || '',
        date: new Date().toISOString().split('T')[0],
        value: 0,
        personId: '',
        observations: '',
        attachmentUrl: '',
        attachmentName: ''
      });
      setDisplayValue('');
    }
    setIsModalOpen(true);
  };

  const handleTypeChange = (type: TransactionType) => {
    const firstCatOfType = categories.find(c => c.type === type);
    setFormData({ 
      ...formData, 
      type, 
      categoryId: firstCatOfType ? firstCatOfType.id : '' 
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, attachmentName: file.name, attachmentUrl: URL.createObjectURL(file) });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedFormData: Omit<Transaction, 'id'> = {
      ...formData,
      personId: formData.personId ? formData.personId : undefined
    };
    
    try {
      if (editingItem) {
        // Actualizar transacción existente
        console.log('📝 Actualizando transacción:', editingItem.id);
        await storage.updateTransactions(editingItem.id, normalizedFormData);
        
        // Actualizar estado local
        setTransactions(transactions.map(t => 
          t.id === editingItem.id ? { ...t, ...normalizedFormData } : t
        ));
        console.log('✅ Transacción actualizada correctamente');
      } else {
        // Crear nueva transacción
        console.log('➕ Creando nueva transacción');
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          ...normalizedFormData
        };
        
        // Intentar guardar en la API
        await storage.saveTransactions([...transactions, newTransaction]);
        
        // Si es exitoso, refrescar la lista desde la API
        const updatedTransactions = await storage.getTransactions();
        setTransactions(updatedTransactions);
        
        console.log('✅ Transacción creada correctamente');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar transacción:', error);
      const errorMessage = error.message || 'Error desconocido al guardar';
      alert(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        console.log('🗑️ Eliminando transacción:', itemToDelete);
        await storage.deleteTransactions(itemToDelete);
        
        // Actualizar estado local
        const newTransactions = transactions.filter(t => t.id !== itemToDelete);
        setTransactions(newTransactions);
        setItemToDelete(null);
        
        console.log('✅ Transacción eliminada correctamente');
      } catch (error: any) {
        console.error('❌ Error al eliminar transacción:', error);
        const errorMessage = error.message || 'Error desconocido al eliminar';
        alert(errorMessage);
      }
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.observations.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: TransactionType | 'ALL') => {
    setFilterType(type);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transacciones</h1>
          <p className="text-slate-500">Registro histórico de ingresos y egresos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Nueva Transacción
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por observaciones..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-100"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value as any)}
            >
              <option value="ALL">Todos los tipos</option>
              <option value={TransactionType.INCOME}>Solo Ingresos</option>
              <option value={TransactionType.EXPENSE}>Solo Gastos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría / Medio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-600">{t.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">
                      {categories.find(c => c.id === t.categoryId)?.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {t.medioTrx === PaymentMethod.CASH ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded">
                          <Wallet className="w-3 h-3" /> Efectivo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                          <CreditCard className="w-3 h-3" /> Transferencia
                        </span>
                      )}
                      {t.personId && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          • {people.find(p => p.id === t.personId)?.fullName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 max-w-xs truncate">{t.observations || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-1.5 font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.INCOME ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                      ${t.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {t.attachmentUrl && (
                        <a href={t.attachmentUrl} download={t.attachmentName} title={t.attachmentName} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => setItemToDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Paginador */}
        <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium">
            Mostrando <span className="font-bold">{startIndex + 1}</span> a <span className="font-bold">{Math.min(endIndex, filtered.length)}</span> de <span className="font-bold">{filtered.length}</span> registros
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-slate-600"
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-slate-600"
            >
              Siguiente →
            </button>
          </div>
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900">{editingItem ? 'Editar Transacción' : 'Nueva Transacción'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Transacción</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button 
                      type="button"
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.type === TransactionType.INCOME ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                      onClick={() => handleTypeChange(TransactionType.INCOME)}
                    >
                      Ingreso
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                      onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                    >
                      Gasto
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Medio de Transacción</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button 
                      type="button"
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.medioTrx === PaymentMethod.CASH ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
                      onClick={() => setFormData({ ...formData, medioTrx: PaymentMethod.CASH })}
                    >
                      Efectivo
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.medioTrx === PaymentMethod.TRANSFER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                      onClick={() => setFormData({ ...formData, medioTrx: PaymentMethod.TRANSFER })}
                    >
                      Transferencia
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Transacción</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      required
                      type="text"
                      placeholder="0"
                      className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xl focus:ring-2 focus:ring-indigo-100 text-slate-900"
                      value={displayValue}
                      onChange={handleValueChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría ({formData.type})</label>
                  <select 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {filteredFormCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Persona (Opcional)</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
                    value={formData.personId}
                    onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  >
                    <option value="">Ninguna seleccionada</option>
                    {people.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.identification})</option>)}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Observaciones</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none min-h-[100px] focus:ring-2 focus:ring-indigo-100"
                    placeholder="Detalles adicionales..."
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Soporte</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-6 flex items-center gap-6 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <FileText className="text-slate-400 w-6 h-6" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate">{formData.attachmentName || 'Sin adjunto'}</p>
                    </div>
                    <label className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-600 cursor-pointer hover:shadow-md transition-all shadow-sm">
                      Adjuntar
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex items-center justify-end gap-3 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-12 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingItem ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-3">Eliminar Transacción</h3>
            <p className="text-slate-600 text-center mb-8">
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100"
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

export default TransactionsView;
