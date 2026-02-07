
import React, { useState, useEffect } from 'react';
import { ViewType, Teller, Category, UserRole, TicketStatus, User } from './types';
import { useQueueStore } from './store/useQueueStore';
import { announceTicket, initializeSpeech } from './services/speechService'; // Changed import
import SetupView from './components/SetupView';
import ReceptionistPanel from './components/ReceptionistPanel';
import TellerPanel from './components/TellerPanel';
import MonitorDisplay from './components/MonitorDisplay';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const { 
    state, 
    currentUser, 
    login, 
    logout, 
    setupSystem, 
    createTicket, 
    callNext, 
    updateTicketStatus, 
    updateMonitorConfig,
    addUser,
    removeUser,
    resetSystem 
  } = useQueueStore();

  const [view, setView] = useState<ViewType>('LOGIN');
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Initialize speech synthesis on app start
  useEffect(() => {
    initializeSpeech();
  }, []);

  // If first run, force Setup
  useEffect(() => {
    if (state.isFirstRun) {
      setView('SETUP');
    } else if (currentUser) {
      setView('DASHBOARD');
    } else {
      setView('LOGIN');
    }
  }, [state.isFirstRun, currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginInput)) {
      setLoginError(false);
      setView('DASHBOARD');
    } else {
      setLoginError(true);
    }
  };

  const handleCallNext = async (tellerId: string) => {
    const ticket = callNext(tellerId);
    if (ticket) {
      const teller = state.tellers.find(t => t.id === tellerId);
      if (teller) await announceTicket(ticket.displayId, teller.name);
    }
  };

  const renderView = () => {
    if (state.isFirstRun) {
      return <SetupView onComplete={setupSystem} />;
    }

    if (!currentUser && view !== 'MONITOR') {
      return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
           <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl mb-8 shadow-xl">
             <i className="fas fa-lock"></i>
           </div>
           <h2 className="text-3xl font-black text-center text-slate-900 tracking-tighter mb-2">Access Portal</h2>
           <p className="text-slate-500 text-center mb-8 font-medium">Please sign in to your workstation.</p>
           <form onSubmit={handleLogin} className="space-y-4">
             <div className="relative">
               <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
               <input 
                className={`w-full py-5 pl-14 pr-6 rounded-2xl border ${loginError ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-bold text-lg transition-all`}
                placeholder="Username..." 
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
               />
             </div>
             {loginError && <p className="text-red-500 text-xs font-bold text-center">Invalid username. Please check again.</p>}
             <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-2xl transition-transform active:scale-[0.98]">Continue</button>
           </form>
           <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-4">
             <button onClick={() => setView('MONITOR')} className="text-indigo-600 font-bold text-sm hover:underline">View Public Monitor Display</button>
             <p className="text-[10px] text-slate-300 text-center uppercase font-black tracking-widest">Default Admin: admin</p>
           </div>
        </div>
      );
    }

    switch (view) {
      case 'SETUP':
        return <SetupView onComplete={setupSystem} />;
      case 'RECEPTIONIST':
        return <ReceptionistPanel categories={state.categories} onCreateTicket={createTicket} />;
      case 'TELLER':
        const tellerId = currentUser?.tellerId;
        const teller = state.tellers.find(t => t.id === tellerId);
        return teller ? (
          <TellerPanel 
            teller={teller} 
            tickets={state.tickets} 
            categories={state.categories}
            onCallNext={() => handleCallNext(teller.id)}
            onUpdateStatus={updateTicketStatus}
            onAnnounce={async (num, name) => await announceTicket(num, name)}
          />
        ) : (
          <div className="max-w-md mx-auto p-10 bg-white rounded-3xl text-center border border-red-100">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-6"></i>
            <h3 className="text-xl font-bold">No Station Assigned</h3>
            <p className="text-slate-500 mt-2">Contact administrator to link your account to a teller station.</p>
          </div>
        );
      case 'ADMIN':
        return (
          <AdminPanel 
            state={state} 
            onUpdateMonitor={updateMonitorConfig} 
            onAddUser={addUser} 
            onRemoveUser={removeUser}
            onReset={resetSystem} 
          />
        );
      case 'MONITOR':
        return <MonitorDisplay tickets={state.tickets} tellers={state.tellers} categories={state.categories} config={state.monitorConfig} />;
      case 'DASHBOARD':
      default:
        return (
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 text-xl font-bold">
                  {currentUser?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Welcome, {currentUser?.username}</h2>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentUser?.role}</p>
                </div>
              </div>
              <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-power-off"></i></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.RECEPTIONIST) && (
                <DashboardCard title="Kiosk Panel" desc="Issue new service tickets" icon="fa-id-card" color="bg-blue-600" onClick={() => setView('RECEPTIONIST')} />
              )}
              {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.TELLER) && (
                <DashboardCard title="Workstation" desc="Handle active customers" icon="fa-user-tie" color="bg-indigo-600" onClick={() => setView('TELLER')} />
              )}
              <DashboardCard title="Live Monitor" desc="Open public lobby display" icon="fa-tv" color="bg-slate-900" onClick={() => setView('MONITOR')} />
              {currentUser?.role === UserRole.ADMIN && (
                <DashboardCard title="Admin Core" desc="System & User Management" icon="fa-shield-alt" color="bg-amber-600" onClick={() => setView('ADMIN')} />
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
               <h3 className="text-2xl font-black mb-10 text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                 Lobby Metrics
               </h3>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Tickets" value={state.tickets.length} icon="fa-ticket-alt" color="text-slate-900" />
                  <StatCard label="In Queue" value={state.tickets.filter(t => t.status === TicketStatus.PENDING).length} icon="fa-hourglass-half" color="text-amber-500" />
                  <StatCard label="Being Served" value={state.tickets.filter(t => [TicketStatus.SERVING, TicketStatus.CALLING].includes(t.status)).length} icon="fa-user-friends" color="text-indigo-600" />
                  <StatCard label="Completed" value={state.tickets.filter(t => t.status === TicketStatus.COMPLETED).length} icon="fa-check-circle" color="text-emerald-500" />
               </div>
            </div>
          </div>
        );
    }
  };

  // Pre-calculating logic to avoid TypeScript narrowing issues within the JSX expression (fix for line 193)
  const isMonitorActive = view === 'MONITOR';
  const shouldShowNavbar = !isMonitorActive && !state.isFirstRun && !!currentUser;

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar is hidden when viewing the full-screen lobby monitor */}
      {shouldShowNavbar && (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('DASHBOARD')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                <i className="fas fa-layer-group"></i>
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 hidden sm:block">QueueMaster</span>
            </div>
            
            <div className="flex gap-2">
              <NavBtn active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} icon="fa-home" />
              {currentUser.role === UserRole.ADMIN && <NavBtn active={view === 'ADMIN'} onClick={() => setView('ADMIN')} icon="fa-cog" />}
              {/* Fix: use the pre-calculated isMonitorActive variable to avoid unintentional narrowing error */}
              <NavBtn active={isMonitorActive} onClick={() => setView('MONITOR')} icon="fa-tv" />
            </div>
          </div>
        </nav>
      )}

      <main className={`${isMonitorActive ? '' : 'p-4 md:p-10'}`}>
        {renderView()}
      </main>
    </div>
  );
};

const DashboardCard: React.FC<{ title: string; desc: string; icon: string; color: string; onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
  <button onClick={onClick} className="bg-white p-8 rounded-[2rem] border border-slate-100 text-left hover:border-transparent hover:shadow-2xl hover:-translate-y-1 transition-all group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-xl`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
  </button>
);

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
    <i className={`fas ${icon}`}></i>
  </button>
);

const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
    <i className={`fas ${icon} absolute -right-4 -bottom-4 text-6xl opacity-5 group-hover:scale-125 transition-transform duration-700`}></i>
    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">{label}</span>
    <span className={`text-4xl font-black tracking-tighter ${color}`}>{value}</span>
  </div>
);

export default App;
