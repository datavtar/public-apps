import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Plus, Edit3, Trash2, CheckSquare, Square, Search, Sun, Moon, ListFilter, X, RotateCcw, ChevronDown, ChevronUp, ListChecks, CalendarDays, SortAsc, SortDesc } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

type FilterOption = 'all' | 'active' | 'completed';
type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'text_asc' | 'text_desc';

const LOCAL_STORAGE_KEY_TASKS = 'todoApp.tasks';
const LOCAL_STORAGE_KEY_THEME = 'todoApp.theme';

const initialTasks: Task[] = [
  { id: '1', text: 'Learn Tailwind CSS', completed: true, createdAt: Date.now() - 200000, updatedAt: Date.now() - 100000 },
  { id: '2', text: 'Build a React To-Do App', completed: false, createdAt: Date.now() - 100000, updatedAt: Date.now() - 100000 },
  { id: '3', text: 'Add dark mode', completed: false, createdAt: Date.now(), updatedAt: Date.now() },
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    return storedTasks ? JSON.parse(storedTasks) : initialTasks;
  });
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('createdAt_desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (storedTheme) return storedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const editTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && isEditModalOpen) {
        closeEditModal();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isEditModalOpen]);

  useEffect(() => {
    if (isEditModalOpen && editingTask) {
      setEditText(editingTask.text);
      editTaskInputRef.current?.focus();
    }
  }, [isEditModalOpen, editingTask]);

  const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const handleAddTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: generateId(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]); // Add to top for createdAt_desc default sort
    setNewTaskText('');
    newTaskInputRef.current?.focus();
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed, updatedAt: Date.now() } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditText(task.text);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
    setEditText('');
  };

  const handleUpdateTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask || editText.trim() === '') return;
    setTasks(tasks.map(task =>
      task.id === editingTask.id ? { ...task, text: editText.trim(), updatedAt: Date.now() } : task
    ));
    closeEditModal();
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };
  
  const handleResetTasks = () => {
    setTasks(initialTasks);
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(initialTasks));
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task => 
      task.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'createdAt_asc': return a.createdAt - b.createdAt;
      case 'text_asc': return a.text.localeCompare(b.text);
      case 'text_desc': return b.text.localeCompare(a.text);
      case 'createdAt_desc':
      default: return b.createdAt - a.createdAt;
    }
  });

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appBackground} ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-primary-600 dark:bg-slate-800 text-white p-4 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-wide mx-auto flex-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Yet Another To-Do App</h1>
          <div className="flex items-center gap-4">
            <button 
                onClick={handleResetTasks}
                className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1 p-2 theme-transition"
                aria-label="Reset tasks to initial set"
                title="Reset Tasks"
            >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white theme-transition"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container-wide mx-auto p-4 sm:p-6 md:p-8">
        <div className="card card-responsive mb-6 fade-in">
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
            <input
              ref={newTaskInputRef}
              type="text"
              value={newTaskText}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="input input-responsive flex-grow"
              aria-label="New task input"
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-responsive flex-center gap-2 w-full sm:w-auto"
              aria-label="Add new task"
            >
              <Plus size={20} /> Add Task
            </button>
          </form>
        </div>

        {tasks.length > 0 && (
        <div className="card card-responsive mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label htmlFor="search-task" className="form-label">Search Tasks</label>
                    <div className="relative">
                        <input 
                            id="search-task"
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="input input-responsive w-full pr-10"
                            aria-label="Search tasks"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="filter-tasks" className="form-label">Filter By</label>
                    <select 
                        id="filter-tasks"
                        value={filter} 
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as FilterOption)}
                        className="input input-responsive w-full"
                        aria-label="Filter tasks"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sort-tasks" className="form-label">Sort By</label>
                    <select 
                        id="sort-tasks"
                        value={sort} 
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortOption)}
                        className="input input-responsive w-full"
                        aria-label="Sort tasks"
                    >
                        <option value="createdAt_desc">Date (Newest First)</option>
                        <option value="createdAt_asc">Date (Oldest First)</option>
                        <option value="text_asc">Text (A-Z)</option>
                        <option value="text_desc">Text (Z-A)</option>
                    </select>
                </div>
            </div>

            {totalTasksCount > 0 && (
                <div className="mb-4">
                    <div className="flex-between text-sm text-gray-600 dark:text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{completedTasksCount} / {totalTasksCount} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 theme-transition">
                        <div 
                            className="bg-primary-500 h-2.5 rounded-full theme-transition-all"
                            style={{ width: `${progressPercentage}%` }}
                            role="progressbar"
                            aria-valuenow={progressPercentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        ></div>
                    </div>
                </div>
            )}

            {sortedTasks.length === 0 && searchTerm && (
                 <div className="text-center py-6 text-gray-500 dark:text-slate-400">
                    <Search size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-lg">No tasks match your search "<strong>{searchTerm}</strong>".</p>
                </div>
            )}
             {sortedTasks.length === 0 && !searchTerm && tasks.length > 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-slate-400">
                    <ListChecks size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-lg">All tasks for this filter are cleared!</p>
                </div>
            )}
        </div>
        )}

        {sortedTasks.length > 0 ? (
          <ul className="space-y-3">
            {sortedTasks.map((task, index) => (
              <li 
                key={task.id} 
                className={`card card-responsive flex items-center justify-between slide-in theme-transition-all ${task.completed ? 'opacity-60 dark:opacity-50 ' + styles.completedTask : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                role="listitem"
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <button 
                    onClick={() => handleToggleComplete(task.id)}
                    className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 theme-transition ${task.completed ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.completed ? <CheckSquare size={24} /> : <Square size={24} />}
                  </button>
                  <span className={`truncate ${task.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'}`}>
                    {task.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button 
                    onClick={() => openEditModal(task)} 
                    className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex-center gap-1 p-2 theme-transition"
                    aria-label={`Edit task: ${task.text}`}
                  >
                    <Edit3 size={16} /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)} 
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex-center gap-1 p-2 theme-transition"
                    aria-label={`Delete task: ${task.text}`}
                  >
                    <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : tasks.length === 0 && (
            <div className="text-center py-10 card card-responsive">
                <CalendarDays size={64} className="mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300 mb-2">No tasks yet!</h2>
                <p className="text-gray-500 dark:text-slate-400">Add a task above to get started.</p>
            </div>
        )}

        {tasks.filter(task => task.completed).length > 0 && (
          <div className="mt-8 flex justify-end fade-in" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={handleClearCompleted}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 btn-responsive flex-center gap-2"
              aria-label="Clear all completed tasks"
            >
              <ListFilter size={18} /> Clear Completed
            </button>
          </div>
        )}
      </main>

      {isEditModalOpen && editingTask && (
        <div 
          className="modal-backdrop fade-in theme-transition-bg"
          onClick={closeEditModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-task-modal-title"
        >
          <div 
            className="modal-content slide-in theme-transition-all w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="edit-task-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">Edit Task</h3>
              <button 
                onClick={closeEditModal} 
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 theme-transition"
                aria-label="Close edit modal"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="mt-4">
              <div className="form-group">
                <label htmlFor="edit-task-input" className="form-label">Task Text</label>
                <input
                  id="edit-task-input"
                  ref={editTaskInputRef}
                  type="text"
                  value={editText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                  className="input input-lg w-full"
                  aria-label="Edit task text"
                />
              </div>
              <div className="modal-footer mt-6">
                <button 
                  type="button"
                  onClick={closeEditModal} 
                  className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 btn-responsive"
                  aria-label="Cancel editing task"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-responsive"
                  aria-label="Save changes to task"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center p-4 text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 mt-auto theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
