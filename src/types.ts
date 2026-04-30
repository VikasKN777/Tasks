import { format } from 'date-fns';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  priority: Priority;
  status: Status;
  category: string;
}

export const CATEGORIES = ['Personal', 'Work', 'Health', 'Finance', 'Social'];

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};
