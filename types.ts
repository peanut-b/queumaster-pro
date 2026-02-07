
export enum TicketStatus {
  PENDING = 'PENDING',
  CALLING = 'CALLING',
  SERVING = 'SERVING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  TELLER = 'TELLER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  tellerId?: string; // If role is TELLER
}

export interface Category {
  id: string;
  name: string;
  prefix: string;
  color: string;
}

export interface Ticket {
  id: string;
  number: number;
  displayId: string;
  categoryId: string;
  status: TicketStatus;
  tellerId?: string;
  createdAt: number;
  updatedAt: number;
  qrCodeUrl: string;
}

export interface Teller {
  id: string;
  name: string;
  assignedCategoryIds: string[];
}

export interface MonitorConfig {
  layout: 'grid' | 'list';
  showCategory: boolean;
  showTellerName: boolean;
  businessName: string;
  themeColor: string;
}

export interface QueuingState {
  categories: Category[];
  tellers: Teller[];
  tickets: Ticket[];
  users: User[];
  lastTicketNumbers: Record<string, number>;
  monitorConfig: MonitorConfig;
  isFirstRun: boolean;
}

export type ViewType = 'SETUP' | 'RECEPTIONIST' | 'TELLER' | 'MONITOR' | 'DASHBOARD' | 'ADMIN' | 'LOGIN';
