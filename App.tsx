
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
  Settings,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { storage } from './services/storage';
import { 
  User, 
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

import { PermissionModule } from './types';

import { AuthError, getAuthToken, setAuthCredentials } from './services/auth';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'PUBLIC' | 'APP'>('PUBLIC');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<PermissionModule | 'HOME' | 'ASSISTANT'>('HOME');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop toggle
  const [isSyncing, setIsSyncing] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

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
       if (!currentUser || viewMode !== 'APP') return;
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
  }, [currentUser, viewMode]);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      // TODO: aquí vamos a llamar Firebase + API users/email en el siguiente paso
      const apiUser = await storage.getUserByEmail(loginEmail);
      if (!apiUser) throw new Error('Usuario no encontrado');
      const normalizedUser = {
  ...apiUser,
  permissions: normalizePermissions(apiUser.permissions as unknown as string[])
};
      setCurrentUser(normalizedUser);
      setViewMode('APP');
      setActiveTab('HOME');
    } catch (error: any) {
      setLoginError(error?.message || 'Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
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

  const normalizePermissions = (perms: string[]): PermissionModule[] => {
  const map: Record<string, PermissionModule> = {
    'Ministerios': PermissionModule.MINISTRIES,
    'Personas': PermissionModule.PEOPLE,
    'Categorías': PermissionModule.CATEGORIES,
    'Transacciones': PermissionModule.TRANSACTIONS,
    'Reportes': PermissionModule.REPORTS,
    'Administración': PermissionModule.ADMIN,
    'Parámetros sitio': PermissionModule.SITE_PARAMS,
  };

  return perms
    .map(p => map[p.trim()])
    .filter(Boolean) as PermissionModule[];
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

  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const normalizedEmail = email.trim();

      try {
        setLoginEmail(normalizedEmail);
        setLoginPassword(password);
        await handleLoginWithCredentials(normalizedEmail, password);
            } catch (err: any) {
        const raw =
          err instanceof AuthError
            ? err.code
            : String(err?.message || err?.toString?.() || '');
        const code = raw.toUpperCase();

        if (code.includes('INVALID_LOGIN_CREDENTIALS')) {
          setError('Credenciales inválidas. Verifica tu correo y contraseña.');
        } else {
          setError(err?.message || 'Error al iniciar sesión.');
        }
      } finally {
        setLoading(false);
      }
    };

const handleLoginWithCredentials = async (email: string, password: string) => {
  
  setAuthCredentials(email, password);
  await getAuthToken();
  const apiUser = await storage.getUserByEmail(email);
  if (!apiUser) throw new Error('Usuario no encontrado');
  const normalizedUser = {
    ...apiUser,
    permissions: normalizePermissions(apiUser.permissions as unknown as string[])
  };
  setCurrentUser(normalizedUser);
  setViewMode('APP');
  setActiveTab('HOME');
};

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-100/50 rounded-full blur-3xl animate-pulse" />

        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative z-10 animate-in zoom-in-95 duration-300">
 

          <div className="w-30 h-30 bg-white rounded-[2rem] flex items-center justify-center">
          <img
            src="https://lh3.googleusercontent.com/pw/AP1GczO2h8HUXvW83XeacGoZGj3V366ohT8Zp7XzN1v4Xk7DzSrswY5i00-8GlWXIwMluxM-yZw3oqOZHjDRPiUJfYEMthtlLjF63JMkVihj9VayuArZQhRK9DrIb1UrFq-Joy3GCd67HZTr2IQqv91jNs6KZA=w1259-h839-s-no-gm?authuser=0"
            alt="Church"
            className="w-42 h-32 object-cover rounded-[1.5rem] shadow-lg shadow-blue-500"
          />
          
        </div>     
                   <div className="text-center mb-10 mt-6">
            
            <h1 className="text-2xl font-bold text-slate-400">PANEL DE CONTROL</h1>
           
          </div>
                     
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  required
                  type="email" 
                  placeholder="ejemplo@comunidad.pro"
                  autoComplete="username"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all font-medium text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all font-medium text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700">Recordarme</span>
              </label>
              <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">¿Olvidaste tu clave?</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Ingresar al Panel
                  <ChevronRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

         <button 
            onClick={() => setViewMode('PUBLIC')} 
            className="mb-8 text-slate-400 hover:text-indigo-600 flex items-center gap-2 mx-auto font-bold text-sm transition-colors mt-6"
          >
            &larr; Volver al sitio público
          </button>
        </div>
      </div>
    );
  };

  if (viewMode === 'PUBLIC' && siteParams) {
    return <LandingView params={siteParams} onAdminAccess={() => setViewMode('APP')} />;
  }

  if (!currentUser) return <LoginScreen />;

  return (
   <div className="min-h-[100dvh] flex bg-slate-50 overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar Colapsable */}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${!isSidebarOpen && (isSidebarCollapsed ? 'md:w-20' : 'md:w-64')}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className={`flex items-center gap-3 mb-8 px-2 ${isSidebarCollapsed && !isSidebarOpen ? 'justify-center' : ''}`}>
                     <div className="w-30 h-30 bg-white rounded-[2rem] flex items-center justify-center">
          <img
            src="https://lh3.googleusercontent.com/pw/AP1GczO2h8HUXvW83XeacGoZGj3V366ohT8Zp7XzN1v4Xk7DzSrswY5i00-8GlWXIwMluxM-yZw3oqOZHjDRPiUJfYEMthtlLjF63JMkVihj9VayuArZQhRK9DrIb1UrFq-Joy3GCd67HZTr2IQqv91jNs6KZA=w1259-h839-s-no-gm?authuser=0"
            alt="Church"
            className="w-42 h-32 object-cover rounded-[1.5rem] shadow-lg shadow-blue-500"
          />
          
        </div>  
            {(!isSidebarCollapsed || isSidebarOpen) && <span className="text-xl font-black text-slate-900 truncate"></span>}
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            <NavItem 
              icon={<HomeIcon />} 
              label="Inicio" 
              active={activeTab === 'HOME'} 
              collapsed={isSidebarCollapsed && !isSidebarOpen} 
              onClick={() => {setActiveTab('HOME'); setIsSidebarOpen(false);}} 
            />
            <NavItem 
              icon={<MessageSquareText />} 
              label="Asistente IA" 
              active={activeTab === 'ASSISTANT'} 
              collapsed={isSidebarCollapsed && !isSidebarOpen} 
              onClick={() => {setActiveTab('ASSISTANT'); setIsSidebarOpen(false);}} 
            />
            
            {(!isSidebarCollapsed || isSidebarOpen) && (
              <div className="pt-6 pb-2 px-3 uppercase text-[10px] font-bold text-slate-400 tracking-widest">Gestión</div>
            )}
            
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
                  collapsed={isSidebarCollapsed && !isSidebarOpen} 
                  onClick={() => {setActiveTab(module); setIsSidebarOpen(false);}} 
                />
              )
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className={`hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-xs ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <><PanelLeftClose className="w-5 h-5" /> Colapsar</>}
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs ${isSidebarCollapsed && !isSidebarOpen ? 'justify-center' : ''}`}>
              <LogOut className="w-5 h-5" /> {(!isSidebarCollapsed || isSidebarOpen) && 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </aside>

            {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 md:hidden hover:bg-slate-50 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-black text-slate-900 md:text-lg">
              {activeTab === 'HOME' ? 'Dashboard' : activeTab}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-xs font-black text-slate-900">{currentUser.name}</span>
               <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{currentUser.role}</span>
             </div>
             <img src={currentUser.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover ring-2 ring-indigo-50" alt="" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar bg-slate-50">
          <div className="max-w-6xl mx-auto">{renderModule()}</div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button 
    onClick={onClick} 
    title={collapsed ? label : ''}
    className={`
      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm
      ${active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
      }
      ${collapsed ? 'justify-center' : ''}
    `}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5 flex-shrink-0' })} 
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);
export default App;