
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'General', prefix: 'G', color: 'bg-blue-500' },
  { id: '2', name: 'Priority', prefix: 'P', color: 'bg-red-500' },
  { id: '3', name: 'Inquiry', prefix: 'I', color: 'bg-emerald-500' },
];

export const STORAGE_KEY = 'queuemaster_pro_state';
