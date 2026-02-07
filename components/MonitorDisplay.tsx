
import React, { useMemo } from 'react';
import { Ticket, Teller, TicketStatus, Category, MonitorConfig } from '../types';

interface MonitorDisplayProps {
  tickets: Ticket[];
  tellers: Teller[];
  categories: Category[];
  config: MonitorConfig;
}

const MonitorDisplay: React.FC<MonitorDisplayProps> = ({ tickets, tellers, categories, config }) => {
  const servingTickets = useMemo(() => {
    return tellers.map(teller => {
      const activeTicket = tickets.find(t => 
        t.tellerId === teller.id && 
        (t.status === TicketStatus.CALLING || t.status === TicketStatus.SERVING)
      );
      return { teller, ticket: activeTicket };
    });
  }, [tickets, tellers]);

  const recentCompleted = useMemo(() => {
    return tickets
      .filter(t => t.status === TicketStatus.COMPLETED)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8);
  }, [tickets]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 font-sans flex flex-col gap-6 md:gap-10">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl gap-4 md:gap-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: config.themeColor }}>
            <i className="fas fa-bolt text-3xl"></i>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">{config.businessName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase opacity-60">System Online</p>
            </div>
          </div>
        </div>
        <div className="text-center md:text-right flex flex-col md:flex-row gap-4 md:gap-10 items-center">
          <div className="hidden md:block">
            <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-1">Local Time</div>
            <div className="text-4xl font-mono font-black text-indigo-400 tracking-tighter">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      </header>

      <div className={`grid ${config.layout === 'grid' ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1'} gap-6 md:gap-10 flex-1`}>
        {/* Active Tellers Display */}
        <div className={`${config.layout === 'grid' ? 'xl:col-span-3' : ''} grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8`}>
          {servingTickets.map(({ teller, ticket }) => (
            <div 
              key={teller.id} 
              className={`group rounded-[3rem] border-4 transition-all duration-700 overflow-hidden flex flex-col relative ${
                ticket?.status === TicketStatus.CALLING 
                  ? 'border-indigo-500 bg-indigo-600 shadow-[0_0_80px_-20px_rgba(79,70,229,0.8)] scale-[1.02] z-10' 
                  : 'border-white/5 bg-white/5 backdrop-blur-md'
              }`}
            >
              {ticket?.status === TicketStatus.CALLING && (
                <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
              )}
              
              <div className={`p-6 md:p-8 flex justify-between items-center border-b ${ticket?.status === TicketStatus.CALLING ? 'border-white/20' : 'border-white/5'}`}>
                {config.showTellerName && (
                  <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${ticket?.status === TicketStatus.CALLING ? 'text-white' : 'text-slate-400'}`}>
                    {teller.name}
                  </h3>
                )}
                <div className={`px-4 py-2 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest ${ticket?.status === TicketStatus.CALLING ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-500'}`}>
                  Station {teller.id}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center py-10 md:py-16">
                {ticket ? (
                  <>
                    <div className={`text-8xl md:text-[10rem] font-black tracking-tighter leading-none transition-transform duration-500 ${ticket.status === TicketStatus.CALLING ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'text-indigo-400'}`}>
                      {ticket.displayId}
                    </div>
                    {config.showCategory && (
                      <div className={`mt-4 px-8 py-3 rounded-full font-black text-lg md:text-xl uppercase tracking-widest shadow-2xl ${
                        ticket.status === TicketStatus.CALLING ? 'bg-white text-indigo-700 animate-bounce' : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}>
                        {ticket.status === TicketStatus.CALLING ? 'PROCEED NOW' : categories.find(c => c.id === ticket.categoryId)?.name}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-white/10 flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
                    <i className="fas fa-clock text-6xl mb-6"></i>
                    <p className="text-xl font-black uppercase tracking-[0.3em]">Ready</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Status / History Sidebar */}
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl flex-1">
            <h3 className="text-xl font-black mb-8 flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <i className="fas fa-history"></i>
              </div>
              LATEST ACTIVITY
            </h3>
            <div className="space-y-4">
              {recentCompleted.map(ticket => (
                <div key={ticket.id} className="group flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/50 hover:bg-white/10 transition-all">
                  <span className="text-2xl md:text-3xl font-black text-slate-100 group-hover:scale-110 transition-transform">{ticket.displayId}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">DONE</span>
                  </div>
                </div>
              ))}
              {recentCompleted.length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <i className="fas fa-layer-group text-4xl mb-4"></i>
                  <p className="font-bold">No history yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl">
            <i className="fas fa-mobile-alt absolute -bottom-10 -right-10 text-[14rem] text-white/10 transform rotate-12 group-hover:scale-125 transition-transform duration-1000"></i>
            <h2 className="text-3xl font-black mb-4 relative z-10 leading-none">CHECK LIVE STATUS</h2>
            <p className="text-indigo-100 font-bold mb-6 relative z-10 opacity-80">Scan the QR code on your printed ticket to track your position in real-time from your phone.</p>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                 <i className="fas fa-qrcode text-xl"></i>
              </div>
              <span className="font-black text-sm uppercase tracking-widest">Mobile Queue Enabled</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-intense {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.9; filter: brightness(1.2); }
        }
        .animate-pulse-intense {
          animation: pulse-intense 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default MonitorDisplay;
