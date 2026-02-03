
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Tags, 
  ArrowLeftRight, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  Church,
  ChevronRight,
  Home as HomeIcon,
  TrendingUp,
  TrendingDown,
  Sparkles,
  MessageSquareText,
  CloudCheck,
  RefreshCw,
  BarChart3,
  Cake,
  PartyPopper,
  Settings
} from 'lucide-react';
import { storage } from './services/storage';
import { 
  User, 
  PermissionModule, 
  Ministry, 
  Person, 
  Category, 
  Transaction,
  TransactionType,
  SiteParameters
} from './types';
import MinistriesView from './views/MinistriesView';
import PeopleView from './views/PeopleView';
import CategoriesView from './views/CategoriesView';
import TransactionsView from './views/TransactionsView';
import AdminView from './views/AdminView';
import AssistantView from './views/AssistantView';
import ReportsView from './views/ReportsView';
import LandingView from './views/LandingView';
import SiteParamsView from './views/SiteParamsView';
import { getFinancialInsights } from './services/gemini';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'PUBLIC' | 'APP'>('PUBLIC');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<PermissionModule | 'HOME' | 'ASSISTANT'>('HOME');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Global State
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [siteParams, setSiteParams] = useState<SiteParameters | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      const [m, p, c, t, u, s] = await Promise.all([
        storage.getMinistries(),
        storage.getPeople(),
        storage.getCategories(),
        storage.getTransactions(),
        storage.getUsers(),
        storage.getSiteParams()
      ]);
      setMinistries(m);
      setPeople(p);
      setCategories(c);
      setTransactions(t);
      setUsers(u);
      setSiteParams(s);
      setIsSyncing(false);
    };
    loadData();
  }, []);

  const handleLogin = (demoUser: User) => {
    setCurrentUser(demoUser);
    setViewMode('APP');
    setActiveTab('HOME');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('PUBLIC');
    setActiveTab('HOME');
  };

  const generateAiInsights = async () => {
    setLoadingAi(true);
    const insight = await getFinancialInsights(transactions, categories, people);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const hasAccess = (module: PermissionModule) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions.includes(module);
  };

  const birthdaysToday = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    return people.filter(p => {
      if (!p.birthDate) return false;
      const [year, month, day] = p.birthDate.split('-').map(Number);
      return month === todayMonth && day === todayDay;
    });
  }, [people]);

  const renderModule = () => {
    switch (activeTab) {
      case PermissionModule.MINISTRIES:
        return <MinistriesView ministries={ministries} setMinistries={async (m) => { setMinistries(m); await storage.saveMinistries(m); }} />;
      case PermissionModule.PEOPLE:
        return <PeopleView people={people} setPeople={async (p) => { setPeople(p); await storage.savePeople(p); }} ministries={ministries} />;
      case PermissionModule.CATEGORIES:
        return <CategoriesView categories={categories} setCategories={async (c) => { setCategories(c); await storage.saveCategories(c); }} />;
      case PermissionModule.TRANSACTIONS:
        return <TransactionsView 
          transactions={transactions} 
          setTransactions={async (t) => { setTransactions(t); await storage.saveTransactions(t); }} 
          categories={categories} 
          people={people} 
        />;
      case PermissionModule.REPORTS:
        return <ReportsView transactions={transactions} people={people} categories={categories} ministries={ministries} />;
      case PermissionModule.ADMIN:
        return <AdminView users={users} setUsers={async (u) => { setUsers(u); await storage.saveUsers(u); }} />;
      case PermissionModule.SITE_PARAMS:
        return siteParams ? <SiteParamsView params={siteParams} setParams={async (s) => { setSiteParams(s); await storage.saveSiteParams(s); }} /> : null;
      case 'ASSISTANT':
        return <AssistantView people={people} ministries={ministries} transactions={transactions} categories={categories} />;
      case 'HOME':
      default:
        return <HomeDashboard />;
    }
  };

  const HomeDashboard = () => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.value, 0);
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.value, 0);

    return (
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Bienvenido, {currentUser?.name || 'Visitante'}
              {isSyncing && <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />}
            </h1>
            <p className="text-slate-500">Resumen general de tu comunidad.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('ASSISTANT')}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all font-medium border border-indigo-100"
            >
              <MessageSquareText className="w-4 h-4" />
              Chat con IA
            </button>
            <button 
              onClick={generateAiInsights}
              disabled={loadingAi}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 font-medium"
            >
              <Sparkles className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
              {loadingAi ? 'Analizando...' : 'Análisis IA'}
            </button>
          </div>
        </header>

        {birthdaysToday.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><PartyPopper className="w-32 h-32" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4"><Cake className="w-6 h-6" /><h2 className="text-xl font-bold">¡Cumpleañeros de Hoy!</h2></div>
              <div className="flex flex-wrap gap-4">
                {birthdaysToday.map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pr-5 rounded-2xl border border-white/20">
                    <img src={p.photoUrl || `https://picsum.photos/seed/${p.id}/100`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div><p className="font-bold text-sm">{p.fullName}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Ingresos" value={`$${totalIncome.toLocaleString()}`} icon={<TrendingUp className="text-green-600" />} color="bg-green-50" />
          <StatCard title="Egresos" value={`$${totalExpense.toLocaleString()}`} icon={<TrendingDown className="text-red-600" />} color="bg-red-50" />
          <StatCard title="Personas" value={people.length.toString()} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        </div>

        {aiInsight && (
          <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600"><Sparkles className="w-5 h-5" /> Análisis IA</h2>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{aiInsight}</div>
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className={`p-6 rounded-3xl border border-slate-200 bg-white flex items-center justify-between shadow-sm`}>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    </div>
  );

  const LoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 text-center">
        <button onClick={() => setViewMode('PUBLIC')} className="mb-6 text-slate-400 hover:text-indigo-600 flex items-center gap-2 mx-auto font-bold text-sm">
          &larr; Volver al sitio público
        </button>
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
          <Church className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Acceso ComunidadPro</h1>
        <p className="text-slate-500 mb-10">Ingresa para gestionar tu comunidad</p>
        
        <div className="space-y-4">
          <button onClick={() => handleLogin(users[0])} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Entrar como Administrador
          </button>
          <button 
            onClick={() => handleLogin({ ...users[0], id: 'user-1', name: 'Colaborador', role: 'user', permissions: [PermissionModule.PEOPLE] })}
            className="w-full border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Entrar como Colaborador
          </button>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'PUBLIC' && siteParams) {
    return <LandingView params={siteParams} onAdminAccess={() => setViewMode('APP')} />;
  }

  if (!currentUser) return <LoginScreen />;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Church className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-bold text-slate-900">ComunidadPro</span>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            <NavItem icon={<HomeIcon />} label="Inicio" active={activeTab === 'HOME'} onClick={() => {setActiveTab('HOME'); setIsSidebarOpen(false);}} />
            <NavItem icon={<MessageSquareText />} label="Asistente IA" active={activeTab === 'ASSISTANT'} onClick={() => {setActiveTab('ASSISTANT'); setIsSidebarOpen(false);}} />
            
            <div className="pt-6 pb-2 px-2 uppercase text-[10px] font-bold text-slate-400 tracking-widest">Gestión</div>
            {Object.values(PermissionModule).map(module => (
              hasAccess(module) && (
                <NavItem 
                  key={module}
                  icon={
                    module === PermissionModule.MINISTRIES ? <Church /> :
                    module === PermissionModule.PEOPLE ? <Users /> :
                    module === PermissionModule.CATEGORIES ? <Tags /> :
                    module === PermissionModule.TRANSACTIONS ? <ArrowLeftRight /> :
                    module === PermissionModule.REPORTS ? <BarChart3 /> :
                    module === PermissionModule.SITE_PARAMS ? <Settings /> :
                    <ShieldCheck />
                  } 
                  label={module} 
                  active={activeTab === module} 
                  onClick={() => {setActiveTab(module); setIsSidebarOpen(false);}} 
                />
              )
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-[10px] font-bold">
              <CloudCheck className="w-3.5 h-3.5" /> MODO PERSISTENCIA
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-slate-900">ComunidadPro</span>
          <div className="w-8" />
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">{renderModule()}</div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
    {React.cloneElement(icon, { className: 'w-5 h-5' })} {label}
  </button>
);

export default App;
