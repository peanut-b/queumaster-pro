
import React from 'react';
import { Teller, Ticket, TicketStatus, Category } from '../types';

interface TellerPanelProps {
  teller: Teller;
  tickets: Ticket[];
  categories: Category[];
  onCallNext: () => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onAnnounce: (ticketId: string, tellerName: string) => void;
}

const TellerPanel: React.FC<TellerPanelProps> = ({ 
  teller, 
  tickets, 
  categories, 
  onCallNext, 
  onUpdateStatus,
  onAnnounce
}) => {
  const currentTicket = tickets.find(t => t.tellerId === teller.id && (t.status === TicketStatus.CALLING || t.status === TicketStatus.SERVING));
  
  const pendingCount = tickets.filter(t => 
    t.status === TicketStatus.PENDING && teller.assignedCategoryIds.includes(t.categoryId)
  ).length;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{teller.name}</h2>
            <p className="text-indigo-100 text-sm">Assigned: {
              categories
                .filter(c => teller.assignedCategoryIds.includes(c.id))
                .map(c => c.name)
                .join(', ')
            }</p>
          </div>
          <div className="bg-indigo-500/50 px-4 py-2 rounded-lg text-center">
            <span className="block text-xs uppercase opacity-75">Waiting</span>
            <span className="text-2xl font-black">{pendingCount}</span>
          </div>
        </div>

        <div className="p-8">
          {currentTicket ? (
            <div className="space-y-6">
              <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Now Serving</span>
                <div className="text-7xl font-black text-slate-800 my-4 tracking-tighter">
                  {currentTicket.displayId}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  currentTicket.status === TicketStatus.CALLING ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {currentTicket.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onAnnounce(currentTicket.displayId, teller.name)}
                  className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-[0.98]"
                >
                  <i className="fas fa-bullhorn text-xl mb-2"></i>
                  <span className="text-sm font-bold">Recall</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(currentTicket.id, TicketStatus.SERVING)}
                  disabled={currentTicket.status === TicketStatus.SERVING}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-[0.98] ${
                    currentTicket.status === TicketStatus.SERVING
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 opacity-50'
                      : 'bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  <i className="fas fa-play text-xl mb-2"></i>
                  <span className="text-sm font-bold">Start Serving</span>
                </button>
              </div>

              <button
                onClick={() => onUpdateStatus(currentTicket.id, TicketStatus.COMPLETED)}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                Complete Ticket
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-clock text-3xl text-slate-300"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800">No active ticket</h3>
              <p className="text-slate-500 mt-2 mb-8">Call the next available person in your assigned categories.</p>
              
              <button
                onClick={onCallNext}
                disabled={pendingCount === 0}
                className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                  pendingCount > 0 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-forward"></i>
                Call Next Person
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TellerPanel;
