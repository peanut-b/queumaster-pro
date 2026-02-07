
import React, { useState } from 'react';
import { Category, Ticket } from '../types';

interface ReceptionistPanelProps {
  categories: Category[];
  onCreateTicket: (categoryId: string) => Ticket | undefined;
}

const ReceptionistPanel: React.FC<ReceptionistPanelProps> = ({ categories, onCreateTicket }) => {
  const [lastCreated, setLastCreated] = useState<Ticket | null>(null);
  const [showPrinter, setShowPrinter] = useState(false);

  const handleCreate = (catId: string) => {
    const ticket = onCreateTicket(catId);
    if (ticket) {
      setLastCreated(ticket);
      setShowPrinter(true);
    }
  };

  const handlePrint = () => {
    window.print(); // Simple standard print trigger
    setShowPrinter(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 md:p-8 bg-slate-900 text-white text-center relative">
          <div className="absolute top-4 right-4 bg-emerald-500 w-3 h-3 rounded-full animate-pulse" />
          <i className="fas fa-print text-4xl mb-4 text-indigo-400"></i>
          <h2 className="text-2xl md:text-3xl font-black">Ticket Kiosk</h2>
          <p className="text-slate-400 mt-2 text-sm">Please select a service to get your number</p>
        </div>

        <div className="p-4 md:p-8 grid gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCreate(category.id)}
              className="group flex items-center justify-between p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-white hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${category.color} flex items-center justify-center text-white text-xl font-black shadow-inner`}>
                  {category.prefix}
                </div>
                <div className="text-left">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">{category.name}</h3>
                  <p className="text-slate-500 text-xs md:text-sm font-medium">Click to issue next ticket</p>
                </div>
              </div>
              <i className="fas fa-plus-circle text-slate-300 group-hover:text-indigo-500 text-xl transition-all"></i>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Print Preview Modal */}
      {showPrinter && lastCreated && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center" id="printable-ticket">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Your Ticket</div>
              <div className="text-sm font-bold text-indigo-600 mb-1">QueueMaster Pro</div>
              <div className="w-full h-px bg-slate-100 my-4" />
              
              <div className="text-7xl font-black text-slate-900 tracking-tighter mb-2">
                {lastCreated.displayId}
              </div>
              <div className="text-slate-500 font-bold uppercase text-xs mb-8">
                {categories.find(c => c.id === lastCreated.categoryId)?.name}
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <img src={lastCreated.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-medium">
                Issued: {new Date(lastCreated.createdAt).toLocaleString()}
                <br />Scan to check live queue status
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button onClick={() => setShowPrinter(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Close</button>
              <button onClick={handlePrint} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-print"></i> Print
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ReceptionistPanel;
