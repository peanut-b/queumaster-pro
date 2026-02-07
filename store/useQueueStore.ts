
import { useState, useEffect, useCallback } from 'react';
import { QueuingState, Ticket, TicketStatus, Category, Teller, User, UserRole, MonitorConfig } from '../types';
import { STORAGE_KEY, DEFAULT_CATEGORIES } from '../constants';

const initialMonitorConfig: MonitorConfig = {
  layout: 'grid',
  showCategory: true,
  showTellerName: true,
  businessName: 'QueueMaster Pro Services',
  themeColor: '#4f46e5',
};

const initialState: QueuingState = {
  categories: DEFAULT_CATEGORIES,
  tellers: [],
  tickets: [],
  users: [
    { id: 'admin-1', username: 'admin', role: UserRole.ADMIN }
  ],
  lastTicketNumbers: {},
  monitorConfig: initialMonitorConfig,
  isFirstRun: true,
};

export const useQueueStore = () => {
  const [state, setState] = useState<QueuingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('queuemaster_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const saveState = useCallback((newState: QueuingState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (username: string) => {
    const user = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('queuemaster_auth', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('queuemaster_auth');
  };

  const setupSystem = (tellers: Teller[], categories: Category[], adminUser: User) => {
    saveState({
      ...state,
      tellers,
      categories,
      users: [adminUser, ...state.users.filter(u => u.role !== UserRole.ADMIN)],
      tickets: [],
      lastTicketNumbers: {},
      isFirstRun: false
    });
  };

  const updateMonitorConfig = (config: Partial<MonitorConfig>) => {
    saveState({
      ...state,
      monitorConfig: { ...state.monitorConfig, ...config }
    });
  };

  const createTicket = (categoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    if (!category) return;

    const currentNum = (state.lastTicketNumbers[category.prefix] || 100) + 1;
    const ticketId = crypto.randomUUID();
    const displayId = `${category.prefix}-${currentNum}`;
    
    // Simple QR code generation using a public API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketId)}`;

    const newTicket: Ticket = {
      id: ticketId,
      number: currentNum,
      displayId,
      categoryId,
      status: TicketStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      qrCodeUrl,
    };

    saveState({
      ...state,
      tickets: [...state.tickets, newTicket],
      lastTicketNumbers: {
        ...state.lastTicketNumbers,
        [category.prefix]: currentNum,
      },
    });
    return newTicket;
  };

  const callNext = (tellerId: string) => {
    const teller = state.tellers.find(t => t.id === tellerId);
    if (!teller) return null;

    const updatedTickets = state.tickets.map(t => 
      (t.tellerId === tellerId && (t.status === TicketStatus.CALLING || t.status === TicketStatus.SERVING))
        ? { ...t, status: TicketStatus.COMPLETED, updatedAt: Date.now() }
        : t
    );

    const nextTicketIndex = updatedTickets.findIndex(t => 
      t.status === TicketStatus.PENDING && teller.assignedCategoryIds.includes(t.categoryId)
    );

    if (nextTicketIndex === -1) {
      saveState({ ...state, tickets: updatedTickets });
      return null;
    }

    const nextTicket = { 
      ...updatedTickets[nextTicketIndex], 
      status: TicketStatus.CALLING, 
      tellerId, 
      updatedAt: Date.now() 
    };
    updatedTickets[nextTicketIndex] = nextTicket;

    saveState({ ...state, tickets: updatedTickets });
    return nextTicket;
  };

  const addUser = (user: User) => {
    saveState({ ...state, users: [...state.users, user] });
  };

  const removeUser = (userId: string) => {
    saveState({ ...state, users: state.users.filter(u => u.id !== userId) });
  };

  return {
    state,
    currentUser,
    login,
    logout,
    setupSystem,
    createTicket,
    callNext,
    updateTicketStatus: (ticketId: string, status: TicketStatus) => {
      const updatedTickets = state.tickets.map(t => 
        t.id === ticketId ? { ...t, status, updatedAt: Date.now() } : t
      );
      saveState({ ...state, tickets: updatedTickets });
    },
    updateMonitorConfig,
    addUser,
    removeUser,
    resetSystem: () => {
      if (confirm("Reset all tickets?")) {
        saveState({ ...state, tickets: [], lastTicketNumbers: {} });
      }
    }
  };
};
