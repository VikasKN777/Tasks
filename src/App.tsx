import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday,
  parseISO
} from 'date-fns';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  List, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Search,
  MoreVertical,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, Priority, Status, CATEGORIES, PRIORITY_COLORS } from './types';

// Mock initial data
const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Design System Review',
    description: 'Review the new design system components with the team',
    dueDate: new Date().toISOString(),
    priority: 'high',
    status: 'todo',
    category: 'Work'
  },
  {
    id: '2',
    title: 'Morning Yoga',
    description: 'Stretch and breathe',
    dueDate: new Date().toISOString(),
    priority: 'medium',
    status: 'completed',
    category: 'Health'
  }
];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('lunar-tasks-todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState('Personal');

  useEffect(() => {
    localStorage.setItem('lunar-tasks-todos', JSON.stringify(todos));
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [todos, searchQuery]);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, status: t.status === 'todo' ? 'completed' : 'todo' } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const saveTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    if (editingTodo) {
      setTodos(todos.map(t => t.id === editingTodo.id ? {
        ...t,
        title: newTitle,
        description: newDesc,
        dueDate: new Date(newDate).toISOString(),
        priority: newPriority,
        category: newCategory
      } : t));
    } else {
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: newTitle,
        description: newDesc,
        dueDate: new Date(newDate).toISOString(),
        priority: newPriority,
        status: 'todo',
        category: newCategory
      };
      setTodos([...todos, todo]);
    }

    closeModal();
  };

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
      setNewTitle(todo.title);
      setNewDesc(todo.description || '');
      setNewDate(format(parseISO(todo.dueDate), 'yyyy-MM-dd'));
      setNewPriority(todo.priority);
      setNewCategory(todo.category);
    } else {
      setEditingTodo(null);
      setNewTitle('');
      setNewDesc('');
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      setNewPriority('medium');
      setNewCategory('Personal');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-main text-text-main font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border-main flex flex-col py-6 z-20 shrink-0">
        <div className="flex items-center gap-2 px-6 mb-8 font-extrabold text-xl text-primary tracking-tight">
          <span className="text-2xl">◈</span>
          <span>TaskFlow</span>
        </div>

        <nav className="flex flex-col">
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all ${view === 'list' ? 'nav-item-active' : 'text-text-muted hover:bg-gray-50'}`}
          >
            <List size={18} />
            <span>Inbox</span>
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all ${view === 'calendar' ? 'nav-item-active' : 'text-text-muted hover:bg-gray-50'}`}
          >
            <CalendarIcon size={18} />
            <span>Calendar</span>
          </button>
          <div className="flex items-center gap-3 px-6 py-2.5 text-sm font-medium text-text-muted opacity-50 cursor-not-allowed">
            <CheckCircle2 size={18} />
            <span>Completed</span>
          </div>
        </nav>

        <div className="mt-8">
          <div className="px-6 mb-3 text-[11px] font-semibold text-text-muted uppercase tracking-widest">Projects</div>
          <div className="flex flex-col">
            {CATEGORIES.map((cat, i) => (
              <button 
                key={cat} 
                className="flex items-center justify-between px-6 py-2 text-sm font-medium text-text-muted hover:bg-gray-50 transition-colors"
                onClick={() => setSearchQuery(cat)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-amber-400', 'bg-purple-400'][i % 5]}`} />
                  {cat}
                </div>
                <span className="text-[10px] text-text-muted opacity-60">
                  {todos.filter(t => t.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-border-main shrink-0">
          <div className="flex items-center gap-6">
            {view === 'calendar' ? (
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold min-w-[140px]">{format(currentDate, 'MMMM yyyy')}</span>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 border border-border-main rounded-md hover:bg-gray-50 transition-colors"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 border border-border-main rounded-md hover:bg-gray-50 transition-colors"><ChevronRight size={16} /></button>
                </div>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-sm font-medium border border-border-main rounded-md hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
              </div>
            ) : (
              <div className="text-lg font-bold">My Inbox</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-border-main rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48 transition-all focus:w-64"
              />
            </div>
            <button 
              onClick={() => openModal()}
              className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-hidden p-6 flex gap-6">
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AnimatePresence mode="wait">
              {view === 'list' ? (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {['todo', 'completed'].map((status) => {
                    const groupTodos = filteredTodos.filter(t => t.status === status);
                    if (groupTodos.length === 0 && status === 'completed') return null;
                    
                    return (
                      <div key={status}>
                        <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">
                          {status === 'todo' ? 'Today\'s Agenda' : 'Finished'}
                        </h2>
                        <div className="bg-white border border-border-main rounded-xl overflow-hidden divide-y divide-border-main">
                          {groupTodos.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(todo => (
                            <div 
                              key={todo.id}
                              className="group p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
                            >
                              <button 
                                onClick={() => toggleTodo(todo.id)}
                                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  todo.status === 'completed' 
                                    ? 'bg-success-main border-success-main text-white' 
                                    : 'border-border-main hover:border-primary'
                                }`}
                              >
                                {todo.status === 'completed' && <Check size={14} />}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className={`text-sm font-semibold truncate ${todo.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                                    {todo.title}
                                  </h3>
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[todo.priority]}`}>
                                    {todo.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-text-muted line-clamp-1 mb-2 italic">
                                  {todo.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon size={12} />
                                    {format(parseISO(todo.dueDate), 'MMM d, yyyy')}
                                  </div>
                                  <span>·</span>
                                  <span className="font-semibold">{todo.category}</span>
                                </div>
                              </div>

                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <button 
                                  onClick={() => openModal(todo)}
                                  className="p-1.5 hover:bg-white border border-transparent hover:border-border-main rounded text-text-muted"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                <button 
                                  onClick={() => deleteTodo(todo.id)}
                                  className="p-1.5 hover:bg-white border border-transparent hover:border-red-100 rounded text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {filteredTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted py-20">
                      <div className="w-12 h-12 rounded-full border border-dashed border-border-main flex items-center justify-center mb-4">
                        <Check size={20} />
                      </div>
                      <p className="text-sm font-medium">All tasks cleared.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className="bg-white border border-border-main rounded-xl overflow-hidden flex flex-col h-full"
                >
                  <Calendar 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    todos={filteredTodos} 
                    onSelectTodo={openModal}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Pane (Summary/Pro Card) */}
          <div className="w-80 hidden lg:flex flex-col gap-6 shrink-0">
            <div className="bg-white border border-border-main rounded-xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Filter size={16} className="text-primary" />
                Productivity Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2 font-medium">
                    <span className="text-text-muted">Task Completion</span>
                    <span className="text-primary">
                      {todos.length > 0 ? Math.round((todos.filter(t => t.status === 'completed').length / todos.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${todos.length > 0 ? (todos.filter(t => t.status === 'completed').length / todos.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{todos.filter(t => t.status === 'todo').length}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase">Pending</div>
                  </div>
                  <div className="p-3 bg-primary-light rounded-lg">
                    <div className="text-lg font-bold text-primary">{todos.filter(t => t.status === 'completed').length}</div>
                    <div className="text-[10px] font-bold text-primary uppercase">Done</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary rounded-xl p-5 text-white shadow-lg shadow-primary/20">
              <h4 className="text-sm font-bold mb-2">Power User Tip</h4>
              <p className="text-[11px] opacity-90 leading-relaxed mb-4">
                Try searching by category (like "Work" or "Health") to quickly filter your task list and stay focused.
              </p>
              <div className="h-1 bg-white/20 rounded-full">
                <div className="h-full bg-white w-1/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-border-main"
            >
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-primary rounded-full" />
                  {editingTodo ? 'Update Task' : 'New Task'}
                </h2>
                
                <form onSubmit={saveTodo} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-0.5">Task Title</label>
                    <input 
                      autoFocus
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Weekly Sync"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-0.5">Description</label>
                    <textarea 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Add details..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-0.5">Due Date</label>
                      <input 
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-0.5">Category</label>
                      <select 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest pl-0.5">Priority Level</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewPriority(p)}
                          className={`flex-1 py-2 rounded-md text-[11px] font-extrabold uppercase transition-all border ${
                            newPriority === p 
                              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                              : 'border-border-main bg-white text-text-muted hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border-main mt-8">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 text-sm font-semibold text-text-muted hover:text-text-main transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/10 active:scale-[0.98]"
                    >
                      {editingTodo ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
}

function Calendar({ currentDate, setCurrentDate, todos, onSelectTodo }: CalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-border-main bg-gray-50/50">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="py-3 text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {days.map((day, i) => {
          const dayTodos = todos.filter(t => isSameDay(parseISO(t.dueDate), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDay = isToday(day);
          
          return (
            <div 
              key={day.toString()} 
              className={`calendar-cell min-h-[120px] divide-y divide-transparent ${!isCurrentMonth ? 'bg-gray-50/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded ${
                  isTodayDay ? 'bg-primary text-white' : isCurrentMonth ? 'text-text-main' : 'text-text-muted opacity-40'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayTodos.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />}
              </div>
              
              <div className="space-y-1">
                {dayTodos.slice(0, 3).map(todo => (
                  <button
                    key={todo.id}
                    onClick={() => onSelectTodo(todo)}
                    className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate transition-all ${
                      todo.status === 'completed' 
                        ? 'bg-gray-100 text-text-muted/60 line-through' 
                        : 'bg-primary-light text-primary border border-primary/10 hover:border-primary/30'
                    }`}
                  >
                    {todo.title}
                  </button>
                ))}
                {dayTodos.length > 3 && (
                  <div className="text-[9px] font-bold text-text-muted pl-1">
                    + {dayTodos.length - 3} others
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
