
import React, { useState } from 'react';
import { QueuingState, User, UserRole, MonitorConfig } from '../types';

interface AdminPanelProps {
  state: QueuingState;
  onUpdateMonitor: (config: Partial<MonitorConfig>) => void;
  onAddUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
  onReset: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateMonitor, onAddUser, onRemoveUser, onReset }) => {
  const [activeTab, setActiveTab] = useState<'display' | 'users' | 'system'>('display');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.TELLER);
  const [selectedTellerId, setSelectedTellerId] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) return;
    const user: User = {
      id: crypto.randomUUID(),
      username: newUsername,
      role: newRole,
      tellerId: newRole === UserRole.TELLER ? selectedTellerId : undefined
    };
    onAddUser(user);
    setNewUsername('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <i className="fas fa-tools"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black">Admin Command</h2>
              <p className="text-slate-400 text-sm font-medium">System Configuration & Users</p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1.5 rounded-2xl">
            <TabBtn active={activeTab === 'display'} onClick={() => setActiveTab('display')} icon="fa-tv" label="Monitor" />
            <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="fa-users" label="Users" />
            <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon="fa-microchip" label="System" />
          </div>
        </div>

        <div className="p-6 md:p-10">
          {activeTab === 'display' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xl font-bold mb-8">Monitor Display Settings</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Business Name</label>
                    <input 
                      type="text" 
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-lg"
                      value={state.monitorConfig.businessName}
                      onChange={e => onUpdateMonitor({ businessName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <ToggleOption 
                        label="Show Category" 
                        active={state.monitorConfig.showCategory} 
                        onToggle={() => onUpdateMonitor({ showCategory: !state.monitorConfig.showCategory })}
                      />
                     <ToggleOption 
                        label="Show Teller" 
                        active={state.monitorConfig.showTellerName} 
                        onToggle={() => onUpdateMonitor({ showTellerName: !state.monitorConfig.showTellerName })}
                      />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Display Layout</label>
                    <div className="grid grid-cols-2 gap-4">
                      <LayoutBtn active={state.monitorConfig.layout === 'grid'} onClick={() => onUpdateMonitor({ layout: 'grid' })} icon="fa-th-large" label="Grid" />
                      <LayoutBtn active={state.monitorConfig.layout === 'list'} onClick={() => onUpdateMonitor({ layout: 'list' })} icon="fa-list" label="List" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Theme Color</label>
                    <div className="flex gap-4">
                      {['#4f46e5', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'].map(color => (
                        <button 
                          key={color} 
                          onClick={() => onUpdateMonitor({ themeColor: color })}
                          className={`w-12 h-12 rounded-2xl transition-all shadow-lg ${state.monitorConfig.themeColor === color ? 'ring-4 ring-offset-4 ring-slate-200' : 'hover:scale-110'}`} 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bold mb-6">Add New User</h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <input 
                      className="w-full p-4 rounded-2xl border border-slate-200 font-bold" 
                      placeholder="Username..." 
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                    />
                    <select 
                      className="w-full p-4 rounded-2xl border border-slate-200 font-bold appearance-none bg-slate-50"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as UserRole)}
                    >
                      <option value={UserRole.TELLER}>Teller</option>
                      <option value={UserRole.RECEPTIONIST}>Receptionist</option>
                      <option value={UserRole.ADMIN}>Administrator</option>
                    </select>
                    {newRole === UserRole.TELLER && (
                      <select 
                        className="w-full p-4 rounded-2xl border border-slate-200 font-bold appearance-none bg-slate-50"
                        value={selectedTellerId}
                        onChange={e => setSelectedTellerId(e.target.value)}
                        required
                      >
                        <option value="">Select Station...</option>
                        {state.tellers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    )}
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Create Access</button>
                  </form>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold mb-6">User Accounts</h3>
                  <div className="space-y-3">
                    {state.users.map(u => (
                      <div key={u.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${u.role === UserRole.ADMIN ? 'bg-slate-900' : u.role === UserRole.RECEPTIONIST ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                            <i className={`fas ${u.role === UserRole.ADMIN ? 'fa-shield-alt' : u.role === UserRole.RECEPTIONIST ? 'fa-id-card' : 'fa-user-tie'}`}></i>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{u.username}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{u.role} {u.tellerId ? `• Station ${u.tellerId}` : ''}</p>
                          </div>
                        </div>
                        {u.role !== UserRole.ADMIN && (
                          <button onClick={() => onRemoveUser(u.id)} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash"></i></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-xl">
              <h3 className="text-xl font-bold mb-6">Danger Zone</h3>
              <div className="p-8 rounded-[2rem] border-2 border-dashed border-red-100 bg-red-50/30">
                <h4 className="font-black text-red-600 mb-2">Reset Daily Queue</h4>
                <p className="text-slate-500 mb-6 text-sm">This will permanently delete all today's tickets and reset all counters to their starting values. This action cannot be undone.</p>
                <button 
                  onClick={onReset}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-xl shadow-red-100"
                >
                  Confirm Full Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`px-4 md:px-6 py-2 rounded-xl flex items-center gap-3 transition-all ${active ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white'}`}>
    <i className={`fas ${icon}`}></i>
    <span className="font-bold text-sm hidden sm:inline">{label}</span>
  </button>
);

const ToggleOption: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <button onClick={onToggle} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
    <i className={`fas ${active ? 'fa-check-circle' : 'fa-circle'} text-xl`}></i>
    <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

const LayoutBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
    <i className={`fas ${icon} text-2xl`}></i>
    <span className="font-black uppercase tracking-widest text-xs">{label}</span>
  </button>
);

export default AdminPanel;
