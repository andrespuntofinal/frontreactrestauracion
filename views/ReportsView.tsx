import React, { useState, useMemo } from 'react';
import { 
  BarChart3, PieChart, Calendar, Search, Filter, 
  ArrowUpCircle, ArrowDownCircle, Users, CheckCircle, 
  X, Download, Church, User as UserIcon, Tag, Wallet, CreditCard,
  Scale
} from 'lucide-react';
import { 
  Transaction, Person, Category, Ministry, 
  TransactionType, Population, PersonStatus, PaymentMethod
} from '../types';

interface Props {
  transactions: Transaction[];
  people: Person[];
  categories: Category[];
  ministries: Ministry[];
}

const ReportsView: React.FC<Props> = ({ transactions, people, categories, ministries }) => {
  const [activeReport, setActiveReport] = useState<'FINANCIAL' | 'COMMUNITY'>('FINANCIAL');
  
  // Filtros Financieros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPerson, setSelectedPerson] = useState('ALL');

  // Filtros Comunidad
  const [personName, setPersonName] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('ALL');
  const [selectedPop, setSelectedPop] = useState('ALL');
  const [baptizedOnly, setBaptizedOnly] = useState<boolean | null>(null);

  const filteredReportCategories = useMemo(() => {
    if (selectedType === 'ALL') return categories;
    return categories.filter(c => c.type === selectedType);
  }, [categories, selectedType]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const dateMatch = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
      const typeMatch = selectedType === 'ALL' || t.type === selectedType;
      const methodMatch = selectedMethod === 'ALL' || t.medioTrx === selectedMethod;
      const catMatch = selectedCategory === 'ALL' || t.categoryId === selectedCategory;
      const personMatch = selectedPerson === 'ALL' || t.personId === selectedPerson;
      return dateMatch && typeMatch && methodMatch && catMatch && personMatch;
    });
  }, [transactions, startDate, endDate, selectedType, selectedMethod, selectedCategory, selectedPerson]);

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.value, 0);
    const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.value, 0);
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const nameMatch = p.fullName.toLowerCase().includes(personName.toLowerCase());
      const minMatch = selectedMinistry === 'ALL' || p.ministryId === selectedMinistry;
      const popMatch = selectedPop === 'ALL' || p.populationGroup === selectedPop;
      const bapMatch = baptizedOnly === null || p.isBaptized === baptizedOnly;
      return nameMatch && minMatch && popMatch && bapMatch;
    });
  }, [people, personName, selectedMinistry, selectedPop, baptizedOnly]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 style={{ color: 'var(--color-primary)' }} className="w-8 h-8" />
            Centro de Analítica & Reportes
          </h1>
          <p className="text-slate-500 text-sm">Analiza el pulso financiero y el crecimiento de tu comunidad en tiempo real.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveReport('FINANCIAL')}
            style={{
              backgroundColor: activeReport === 'FINANCIAL' ? 'var(--color-primary)' : undefined,
              color: activeReport === 'FINANCIAL' ? '#ffffff' : undefined
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeReport === 'FINANCIAL' ? 'shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Finanzas
          </button>
          <button 
            onClick={() => setActiveReport('COMMUNITY')}
            style={{
              backgroundColor: activeReport === 'COMMUNITY' ? 'var(--color-primary)' : undefined,
              color: activeReport === 'COMMUNITY' ? '#ffffff' : undefined
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeReport === 'COMMUNITY' ? 'shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Comunidad
          </button>
        </div>
      </header>

      {activeReport === 'FINANCIAL' ? (
        <div className="space-y-8">
          {/* Filtros Financieros */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-indigo-500" /> Desde
              </label>
              <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-indigo-500" /> Hasta
              </label>
              <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Filter className="w-3 h-3 text-indigo-500" /> Tipo
              </label>
              <select 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" 
                value={selectedType} 
                onChange={e => {
                  setSelectedType(e.target.value as any);
                  setSelectedCategory('ALL');
                }}
              >
                <option value="ALL">Todos los tipos</option>
                <option value={TransactionType.INCOME}>Ingresos</option>
                <option value={TransactionType.EXPENSE}>Gastos</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Wallet className="w-3 h-3 text-indigo-500" /> Medio
              </label>
              <select 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" 
                value={selectedMethod} 
                onChange={e => setSelectedMethod(e.target.value as any)}
              >
                <option value="ALL">Todos los medios</option>
                <option value={PaymentMethod.CASH}>Efectivo</option>
                <option value={PaymentMethod.TRANSFER}>Transferencia</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-indigo-500" /> Categoría
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="ALL">Todas las categorías</option>
                {filteredReportCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <UserIcon className="w-3 h-3 text-indigo-500" /> Persona
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)}>
                <option value="ALL">Todas las personas</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
          </div>

          {/* Resumen Financiero Dinámico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Ingresos en Periodo" value={`$${stats.income.toLocaleString()}`} icon={<ArrowUpCircle className="text-emerald-600" />} color="bg-emerald-50" />
            <StatCard title="Egresos en Periodo" value={`$${stats.expense.toLocaleString()}`} icon={<ArrowDownCircle className="text-rose-600" />} color="bg-rose-50" />
            <StatCard title="Saldo Neto" value={`$${stats.net.toLocaleString()}`} icon={<Scale className="text-indigo-600" />} color="bg-indigo-50" />
          </div>

          {/* Tabla de Resultados */}
          <div 
            className="rounded-3xl border overflow-hidden shadow-sm transition-all"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-sm">Registros Encontrados ({filteredTransactions.length})</h2>
              <button 
                style={{ backgroundColor: 'var(--color-primary)' }}
                className="text-white font-bold text-xs flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm hover:opacity-90"
              >
                <Download className="w-4 h-4" /> Exportar Datos
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-table-header-bg)', color: 'var(--color-table-header-text)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Categoría / Medio</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Observaciones</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">{t.date}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{categories.find(c => c.id === t.categoryId)?.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {t.medioTrx === PaymentMethod.CASH ? (
                            <span className="text-[9px] font-bold text-amber-700 uppercase bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">Efectivo</span>
                          ) : (
                            <span className="text-[9px] font-bold text-blue-700 uppercase bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">Transferencia</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {people.find(p => p.id === t.personId)?.fullName || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{t.observations || '—'}</td>
                      <td className={`px-6 py-4 text-right font-black text-base ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ${t.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium text-xs">No se encontraron transacciones con los filtros aplicados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Filtros Comunidad */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-500" /> Buscar Persona
              </label>
              <input type="text" placeholder="Nombre o ID..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={personName} onChange={e => setPersonName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Church className="w-3.5 h-3.5 text-indigo-500" /> Ministerio
              </label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={selectedMinistry} onChange={e => setSelectedMinistry(e.target.value)}>
                <option value="ALL">Todos los ministerios</option>
                {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" /> Población
              </label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100" value={selectedPop} onChange={e => setSelectedPop(e.target.value)}>
                <option value="ALL">Todos los grupos</option>
                {Object.values(Population).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Estado Bautismo</label>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setBaptizedOnly(null)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${baptizedOnly === null ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Todos</button>
                <button onClick={() => setBaptizedOnly(true)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${baptizedOnly === true ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'}`}>SÍ</button>
                <button onClick={() => setBaptizedOnly(false)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${baptizedOnly === false ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'}`}>NO</button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl flex items-center justify-between border border-slate-200 bg-white shadow-sm">
            <span className="text-xs font-bold text-slate-600">Mostrando {filteredPeople.length} personas de {people.length} en total</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4" /> Bautizados: {filteredPeople.filter(p => p.isBaptized).length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPeople.map(p => (
              <div 
                key={p.id} 
                className="p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all group"
                style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <img src={p.photoUrl || `https://picsum.photos/seed/${p.id}/100`} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" alt="" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate leading-snug">{p.fullName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{p.identification}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                    <Church className="w-3 h-3" style={{ color: 'var(--color-primary)' }} /> {ministries.find(m => m.id === p.ministryId)?.name || 'Sin Min.'}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight">{p.populationGroup}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${p.isBaptized ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                      {p.isBaptized ? 'BAUTIZADO' : 'SIN BAUTIZAR'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredPeople.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 inline-block">
                  <X className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 font-bold text-xs">No se encontraron personas con estos criterios.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div 
    className="p-6 rounded-3xl border flex items-center justify-between shadow-sm transition-all"
    style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
  >
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
    <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-8 h-8' })}
    </div>
  </div>
);

export default ReportsView;
