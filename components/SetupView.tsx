
import React, { useState } from 'react';
import { Category, Teller, User, UserRole } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface SetupViewProps {
  onComplete: (tellers: Teller[], categories: Category[], admin: User) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tellers, setTellers] = useState<Teller[]>([
    { id: '1', name: 'Teller Station A', assignedCategoryIds: ['1', '2', '3'] },
  ]);
  const [adminUsername, setAdminUsername] = useState('admin');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const addTeller = () => {
    const id = (tellers.length + 1).toString();
    setTellers([...tellers, { id, name: `Teller Station ${String.fromCharCode(64 + tellers.length + 1)}`, assignedCategoryIds: categories.map(c => c.id) }]);
  };

  const removeTeller = (id: string) => setTellers(tellers.filter(t => t.id !== id));

  const toggleCategory = (tellerId: string, catId: string) => {
    setTellers(tellers.map(t => {
      if (t.id !== tellerId) return t;
      const ids = t.assignedCategoryIds.includes(catId)
        ? t.assignedCategoryIds.filter(i => i !== catId)
        : [...t.assignedCategoryIds, catId];
      return { ...t, assignedCategoryIds: ids };
    }));
  };

  const handleFinish = () => {
    const admin: User = { id: 'admin-1', username: adminUsername, role: UserRole.ADMIN };
    onComplete(tellers, categories, admin);
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 md:mt-10 p-4 md:p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Setup Wizard</h2>
          <p className="text-slate-500 text-sm">Step {step} of 3</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-2 rounded-full transition-all ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold mb-4">Branding & Categories</h3>
          <p className="text-slate-500 mb-6">Confirm service categories and their prefixes.</p>
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-white font-bold`}>{cat.prefix}</div>
                  <span className="font-bold">{cat.name}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">ID: {cat.id}</span>
              </div>
            ))}
          </div>
          <button onClick={nextStep} className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Next: Configure Tellers</button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Teller Stations</h3>
            <button onClick={addTeller} className="text-indigo-600 font-bold flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              <i className="fas fa-plus"></i> Add
            </button>
          </div>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {tellers.map(teller => (
              <div key={teller.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <input 
                    className="bg-transparent font-bold text-lg border-b border-slate-200 focus:border-indigo-500 focus:outline-none w-full" 
                    value={teller.name} 
                    onChange={e => setTellers(tellers.map(t => t.id === teller.id ? {...t, name: e.target.value} : t))}
                  />
                  <button onClick={() => removeTeller(teller.id)} className="text-slate-400 hover:text-red-500 p-2"><i className="fas fa-times"></i></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => toggleCategory(teller.id, c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${teller.assignedCategoryIds.includes(c.id) ? `${c.color} text-white` : 'bg-white border text-slate-400'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Back</button>
            <button onClick={nextStep} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Next: Admin User</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h3 className="text-xl font-bold mb-4">Admin Credentials</h3>
          <p className="text-slate-500 mb-6">Set your administrator username to manage the system.</p>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Username</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              placeholder="Enter admin username..."
            />
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Back</button>
            <button onClick={handleFinish} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Finish & Launch</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupView;
