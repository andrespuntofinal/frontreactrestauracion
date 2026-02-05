
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, PieChart, Calendar, Search, Filter, 
  ArrowUpCircle, ArrowDownCircle, Users, CheckCircle, 
  X, Download, Church, User as UserIcon, Tag, Wallet, CreditCard
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

  // Categorías filtradas por el tipo seleccionado
  const filteredReportCategories = useMemo(() => {
    if (selectedType === 'ALL') return categories;
    return categories.filter(c => c.type === selectedType);
  }, [categories, selectedType]);

  // Lógica de Filtrado Financiero
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

  // Lógica de Filtrado Comunidad
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-indigo-600 w-8 h-8" />
            Centro de Reportes
          </h1>
          <p className="text-slate-500">Analiza el pulso financiero y el crecimiento de tu comunidad.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveReport('FINANCIAL')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeReport === 'FINANCIAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Finanzas
          </button>
          <button 
            onClick={() => setActiveReport('COMMUNITY')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeReport === 'COMMUNITY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Comunidad
          </button>
        </div>
      </header>

      {activeReport === 'FINANCIAL' ? (
        <div className="space-y-8">
          {/* Filtros Financieros Expandidos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Desde
              </label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Hasta
              </label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Filter className="w-3 h-3" /> Tipo
              </label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
                value={selectedType} 
                onChange={e => {
                  setSelectedType(e.target.value as any);
                  setSelectedCategory('ALL');
                }}
              >
                <option value="ALL">Todos los tipos</option>
                <option value={TransactionType.INCOME}>Solo Ingresos</option>
                <option value={TransactionType.EXPENSE}>Solo Gastos</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Wallet className="w-3 h-3" /> Medio
              </label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
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
                <Tag className="w-3 h-3" /> Categoría
              </label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="ALL">Todas las categorías</option>
                {filteredReportCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <UserIcon className="w-3 h-3" /> Persona
              </label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)}>
                <option value="ALL">Todas las personas</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
          </div>

          {/* Resumen Financiero Dinámico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Ingresos en Periodo" value={`$${stats.income.toLocaleString()}`} icon={<ArrowUpCircle className="text-green-600" />} color="bg-green-50" />
            <StatCard title="Egresos en Periodo" value={`$${stats.expense.toLocaleString()}`} icon={<ArrowDownCircle className="text-red-600" />} color="bg-red-50" />
            <StatCard title="Saldo Neto" value={`$${stats.net.toLocaleString()}`} icon={<BarChart3 className="text-indigo-600" />} color="bg-indigo-50" />
          </div>

          {/* Tabla de Resultados */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800">Registros Encontrados ({filteredTransactions.length})</h2>
              <button className="text-indigo-600 font-bold text-xs flex items-center gap-2 hover:bg-white px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-indigo-100">
                <Download className="w-4 h-4" /> Exportar a Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Categoría / Medio</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Concepto</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">{t.date}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{categories.find(c => c.id === t.categoryId)?.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {t.paymentMethod === PaymentMethod.CASH ? (
                            <span className="text-[9px] font-bold text-amber-600 uppercase bg-amber-50 px-1 py-0.5 rounded">Efectivo</span>
                          ) : (
                            <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-1 py-0.5 rounded">Transferencia</span>
                          )}
                          <span className="text-[9px] text-slate-400 font-medium">
                            • {people.find(p => p.id === t.personId)?.fullName || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{t.observations}</td>
                      <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                        ${t.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No se encontraron transacciones con los filtros aplicados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Filtros Comunidad */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Search className="w-3 h-3" /> Buscar Persona
              </label>
              <input type="text" placeholder="Nombre o ID..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={personName} onChange={e => setPersonName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Church className="w-3 h-3" /> Ministerio
              </label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={selectedMinistry} onChange={e => setSelectedMinistry(e.target.value)}>
                <option value="ALL">Todos los ministerios</option>
                {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Población
              </label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={selectedPop} onChange={e => setSelectedPop(e.target.value)}>
                <option value="ALL">Todos los grupos</option>
                {Object.values(Population).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Estado Bautismo</label>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setBaptizedOnly(null)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${baptizedOnly === null ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Todos</button>
                <button onClick={() => setBaptizedOnly(true)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${baptizedOnly === true ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>SÍ</button>
                <button onClick={() => setBaptizedOnly(false)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${baptizedOnly === false ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>NO</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
            <span className="text-sm font-bold text-slate-600">Mostrando {filteredPeople.length} personas de {people.length} totales</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100">
                <CheckCircle className="w-4 h-4" /> Bautizados: {filteredPeople.filter(p => p.isBaptized).length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPeople.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <img src={p.photoUrl || `https://picsum.photos/seed/${p.id}/100`} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50" alt="" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-tight">{p.fullName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{p.identification}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                    <Church className="w-3 h-3 text-indigo-500" /> {ministries.find(m => m.id === p.ministryId)?.name || 'Sin Min.'}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">{p.populationGroup}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${p.isBaptized ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {p.isBaptized ? 'BAUTIZADO' : 'SIN BAUTIZAR'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredPeople.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-white p-10 rounded-[3rem] border border-dashed border-slate-200 inline-block">
                  <X className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No se encontraron personas con estos criterios.</p>
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
  <div className={`p-6 rounded-3xl border border-slate-200 bg-white flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-4 duration-500`}>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
    <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' })}
    </div>
  </div>
);

export default ReportsView;
