import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell as RechartsCell } from 'recharts';
import { Plus, Edit, Trash2, Search, ArrowDownUp, Sun, Moon, X, CheckCircle2, Circle, Calendar, Flag, ListChecks, Hourglass, AlertTriangle, Info } from 'lucide-react';
import styles from './styles/styles.module.css';

// Type Definitions
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

type FilterType = 'all' | 'active' | 'completed';
type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'dueDate_asc' | 'dueDate_desc' | 'priority_desc' | 'priority_asc';

const PRIORITY_MAP: { [key in Task['priority']]: { label: string; color: string; value: number } } = {
  low: { label: 'Low', color: 'bg-green-500', value: 1 },
  medium: { label: 'Medium', color: 'bg-yellow-500', value: 2 },
  high: { label: 'High', color: 'bg-red-500', value: 3 },
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'createdAt_desc', label: 'Date Created (Newest)' },
  { value: 'createdAt_asc', label: 'Date Created (Oldest)' },
  { value: 'dueDate_asc', label: 'Due Date (Soonest)' },
  { value: 'dueDate_desc', label: 'Due Date (Latest)' },
  { value: 'priority_desc', label: 'Priority (High to Low)' },
  { value: 'priority_asc', label: 'Priority (Low to High)' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    text: 'Grocery Shopping',
    completed: false,
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    priority: 'medium',
    notes: 'Buy milk, eggs, bread, and cheese.',
  },
  {
    id: crypto.randomUUID(),
    text: 'Book Doctor Appointment',
    completed: true,
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    priority: 'high',
    notes: 'Annual check-up.',
  },
  {
    id: crypto.randomUUID(),
    text: 'Pay Bills',
    completed: false,
    createdAt: Date.now() - 86400000, // Yesterday
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
    priority: 'high',
    notes: 'Electricity and internet bills.',
  },
  {
    id: crypto.randomUUID(),
    text: 'Plan Weekend Trip',
    completed: false,
    createdAt: Date.now(),
    priority: 'low',
  },
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('todoAppTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as Task[];
        // Basic validation to ensure parsedTasks is an array of objects with id and text
        if (Array.isArray(parsedTasks) && parsedTasks.every(task => typeof task === 'object' && task !== null && 'id' in task && 'text' in task)) {
          return parsedTasks;
        }
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
      }
    }
    return INITIAL_TASKS;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt_desc');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showStats, setShowStats] = useState<boolean>(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('todoAppTheme');
      if (savedMode) return savedMode === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const newTaskTextRef = useRef<HTMLInputElement>(null);
  const editTaskTextRef = useRef<HTMLInputElement>(null);
  const editTaskNotesRef = useRef<HTMLTextAreaElement>(null);
  const editTaskDueDateRef = useRef<HTMLInputElement>(null);
  const editTaskPriorityRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    localStorage.setItem('todoAppTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('todoAppTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('todoAppTheme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (taskToDelete) setTaskToDelete(null);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen, taskToDelete]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const text = newTaskTextRef.current?.value.trim();
    if (text) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
        priority: 'medium', // Default priority
      };
      setTasks([newTask, ...tasks]);
      if (newTaskTextRef.current) newTaskTextRef.current.value = '';
    }
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    // Delay focus to ensure modal is rendered and refs are available
    setTimeout(() => {
        if (editTaskTextRef.current) editTaskTextRef.current.focus();
    }, 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (e: FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const updatedText = editTaskTextRef.current?.value.trim();
    const updatedNotes = editTaskNotesRef.current?.value.trim();
    const updatedDueDate = editTaskDueDateRef.current?.value;
    const updatedPriority = editTaskPriorityRef.current?.value as Task['priority'] | undefined;

    if (updatedText) {
      setTasks(tasks.map(task => task.id === editingTask.id ? {
        ...task,
        text: updatedText,
        notes: updatedNotes || undefined,
        dueDate: updatedDueDate || undefined,
        priority: updatedPriority || task.priority,
      } : task));
      closeModal();
    }
  };

  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOption) {
      case 'createdAt_asc': return a.createdAt - b.createdAt;
      case 'createdAt_desc': return b.createdAt - a.createdAt;
      case 'dueDate_asc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'dueDate_desc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      case 'priority_asc': return (PRIORITY_MAP[a.priority]?.value ?? 0) - (PRIORITY_MAP[b.priority]?.value ?? 0);
      case 'priority_desc': return (PRIORITY_MAP[b.priority]?.value ?? 0) - (PRIORITY_MAP[a.priority]?.value ?? 0);
      default: return 0;
    }
  });

  const tasksCompleted = tasks.filter(task => task.completed).length;
  const tasksPending = tasks.length - tasksCompleted;
  const taskStatsData = [
    { name: 'Completed', value: tasksCompleted, fill: '#4ade80' }, // green-400
    { name: 'Pending', value: tasksPending, fill: '#facc15' }, // yellow-400
  ];

  const formatDate = (timestampOrDateString?: number | string) => {
    if (!timestampOrDateString) return 'N/A';
    try {
      const date = typeof timestampOrDateString === 'number' ? new Date(timestampOrDateString) : new Date(timestampOrDateString);
      // Adjust for potential timezone offset if it's a YYYY-MM-DD string by appending time
      if (typeof timestampOrDateString === 'string' && timestampOrDateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(timestampOrDateString + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col theme-transition-bg ${styles.appContainer} ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-primary-600 dark:bg-slate-800 text-white p-4 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-all">
        <div className="container-wide flex-between">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><ListChecks size={28} /> TodoMaster</h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={showStats ? "Hide Statistics" : "Show Statistics"}
            >
              <Hourglass size={20}/>
            </button>
            <div className="flex items-center">
              <Sun size={20} className={`mr-2 ${isDarkMode ? 'text-slate-400' : 'text-yellow-300'}`} />
              <button 
                onClick={toggleDarkMode} 
                className="theme-toggle" 
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <Moon size={20} className={`ml-2 ${isDarkMode ? 'text-blue-300' : 'text-slate-500'}`} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container-wide py-6 sm:py-8 px-4">
        <form onSubmit={handleAddTask} className="mb-6 sm:mb-8 p-4 card card-responsive fade-in">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
            <div className="form-group w-full">
              <label htmlFor="newTask" className="form-label">New Task</label>
              <input 
                id="newTask" 
                type="text" 
                ref={newTaskTextRef} 
                className="input input-responsive" 
                placeholder="What needs to be done?"
                required
                aria-label="New task description"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-responsive w-full sm:w-auto flex-center gap-2">
              <Plus size={20} /> Add Task
            </button>
          </div>
        </form>

        {showStats && (
          <div className="mb-6 sm:mb-8 card card-responsive fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Info size={22}/> Task Overview</h2>
            {tasks.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <RechartsPieChart>
                    <Pie data={taskStatsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {taskStatsData.map((entry, index) => (
                        <RechartsCell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-slate-400">No tasks available to show statistics.</p>
            )}
          </div>
        )}

        <div className="mb-6 card card-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div className="form-group">
              <label htmlFor="searchTask" className="form-label">Search Tasks</label>
              <div className="relative">
                <input 
                  id="searchTask" 
                  type="text" 
                  className="input input-responsive pl-10" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  aria-label="Search tasks"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="filterTasks" className="form-label">Filter Tasks</label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'active', 'completed'] as FilterType[]).map(filterType => (
                  <button 
                    key={filterType} 
                    onClick={() => setFilter(filterType)} 
                    className={`btn btn-responsive capitalize ${filter === filterType ? 'btn-primary' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                    aria-pressed={filter === filterType}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="sortTasks" className="form-label">Sort Tasks</label>
              <div className="relative">
                <select 
                  id="sortTasks" 
                  className="input input-responsive appearance-none pr-8" 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  aria-label="Sort tasks by"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ArrowDownUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {sortedTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <ListChecks size={48} className="mx-auto mb-2" />
              <p className="text-lg">No tasks found.</p>
              {tasks.length > 0 && <p>Try adjusting your search or filter criteria.</p>}
              {tasks.length === 0 && <p>Add a new task to get started!</p>}
            </div>
          )}

          <ul className="space-y-3">
            {sortedTasks.map(task => (
              <li 
                key={task.id} 
                className={`card card-sm p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-300 hover:shadow-lg ${task.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-700/50' : 'bg-white dark:bg-slate-800'} ${styles.taskItem}`}
              >
                <div className="flex items-start gap-3 flex-grow">
                  <button 
                    onClick={() => toggleComplete(task.id)} 
                    className={`mt-1 p-1 rounded-full focus:outline-none focus:ring-2 ${task.completed ? 'text-green-500 focus:ring-green-400' : 'text-gray-400 dark:text-slate-500 focus:ring-primary-500'}`} 
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    aria-pressed={task.completed}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-grow">
                    <p className={`font-medium text-gray-800 dark:text-slate-100 ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Flag size={12} className={PRIORITY_MAP[task.priority]?.color.replace('bg-', 'text-')} /> {PRIORITY_MAP[task.priority]?.label || 'N/A'}
                      </span>
                      {task.dueDate && 
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> Due: {formatDate(task.dueDate)}
                        </span>
                      }
                      <span className="flex items-center gap-1">
                         <Hourglass size={12} /> Created: {formatDate(task.createdAt)}
                      </span>
                    </div>
                    {task.notes && <p className="mt-1 text-sm text-gray-600 dark:text-slate-300 italic">Notes: {task.notes.length > 50 ? task.notes.substring(0,50)+'...' : task.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0 self-end sm:self-center flex-shrink-0">
                  <button 
                    onClick={() => openEditModal(task)} 
                    className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex-center gap-1"
                    aria-label={`Edit task ${task.text}`}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => confirmDeleteTask(task)} 
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex-center gap-1"
                    aria-label={`Delete task ${task.text}`}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {isModalOpen && editingTask && (
        <div 
            className="modal-backdrop theme-transition-all" 
            onClick={closeModal} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="edit-task-modal-title"
        >
          <div className="modal-content theme-transition-all w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="edit-task-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Edit size={22}/> Edit Task</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300" aria-label="Close edit task modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditTask} className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="editText" className="form-label">Task Description</label>
                <input id="editText" type="text" ref={editTaskTextRef} defaultValue={editingTask.text} className="input" required />
              </div>
              <div className="form-group">
                <label htmlFor="editDueDate" className="form-label">Due Date</label>
                <input id="editDueDate" type="date" ref={editTaskDueDateRef} defaultValue={editingTask.dueDate} className="input" />
              </div>
              <div className="form-group">
                <label htmlFor="editPriority" className="form-label">Priority</label>
                <select id="editPriority" ref={editTaskPriorityRef} defaultValue={editingTask.priority} className="input">
                  {(Object.keys(PRIORITY_MAP) as Array<Task['priority']>).map(prio => (
                    <option key={prio} value={prio}>{PRIORITY_MAP[prio].label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editNotes" className="form-label">Notes</label>
                <textarea id="editNotes" ref={editTaskNotesRef} defaultValue={editingTask.notes} className="input h-24" placeholder="Add any extra details..."></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div 
            className="modal-backdrop theme-transition-all" 
            onClick={() => setTaskToDelete(null)} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="delete-confirm-modal-title"
        >
          <div className="modal-content theme-transition-all w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3 id="delete-confirm-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle size={22} className="text-red-500"/> Confirm Deletion
                </h3>
                <button onClick={() => setTaskToDelete(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300" aria-label="Close delete confirmation modal">
                    <X size={24} />
                </button>
            </div>
            <p className="mt-2 text-gray-600 dark:text-slate-300">
              Are you sure you want to delete the task "<strong>{taskToDelete.text}</strong>"?
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button type="button" onClick={() => setTaskToDelete(null)} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteTask} className="btn btn-danger bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-slate-100 dark:bg-slate-900 text-center p-4 text-sm text-gray-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
