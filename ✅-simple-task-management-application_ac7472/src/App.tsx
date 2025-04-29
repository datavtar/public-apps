import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Trash2, Edit, Check, X, Search, ArrowUp, ArrowDown, Filter, ListTodo, Moon, Sun, ArrowUpDown } from 'lucide-react'; // Added ArrowUpDown
import styles from './styles/styles.module.css';

// Types
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc';

// Constants
const LOCAL_STORAGE_KEY_TASKS = 'todoAppTasks';
const LOCAL_STORAGE_KEY_THEME = 'todoAppTheme';

// Main App Component
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date-desc');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return savedTheme === 'dark' || 
      (savedTheme === null && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks) as Task[]);
      } else {
        // Add sample tasks if none exist
        setTasks([
          { id: crypto.randomUUID(), text: 'Welcome! Add your first task above.', completed: false, createdAt: Date.now() - 1000 },
          { id: crypto.randomUUID(), text: 'Click the checkmark to complete.', completed: false, createdAt: Date.now() - 500 },
          { id: crypto.randomUUID(), text: 'Try editing or deleting this task.', completed: true, createdAt: Date.now() },
        ]);
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
      setTasks([]); // Reset to empty array on error
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
    }
  }, [tasks]);

  // Handle theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = newTaskText.trim();
    if (!trimmedText) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]); // Add to the beginning
    setNewTaskText('');
    inputRef.current?.focus(); // Keep focus on input
  };

  // Toggle Task Completion
  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Start Editing Task
  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
    setEditText(task.text);
    setTimeout(() => editInputRef.current?.focus(), 0); // Focus after modal renders
  };

  // Cancel Editing Task
  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
    setEditText('');
  }, []);

  // Save Edited Task
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = editText.trim();
    if (!trimmedText || !editingTask) return;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingTask.id ? { ...task, text: trimmedText } : task
      )
    );
    handleCancelEdit();
  };

  // Filter and Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'active') return !task.completed && matchesSearch;
      if (filter === 'completed') return task.completed && matchesSearch;
      return matchesSearch; // 'all'
    });

    filtered.sort((a, b) => {
      switch (sort) {
        case 'alpha-asc':
          return a.text.localeCompare(b.text);
        case 'alpha-desc':
          return b.text.localeCompare(a.text);
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'date-desc':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [tasks, searchTerm, filter, sort]);

  // Theme Toggle Component
  const ThemeToggle = () => (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="theme-toggle focus:ring-offset-0 focus:ring-primary-500/50 p-1 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  );

  // Handle Esc key for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingTask) {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingTask, handleCancelEdit]);


  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appBackground}`}>
      {/* Header */}
      <header className="bg-primary-600 dark:bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10 no-print theme-transition-bg">
        <div className="container-narrow flex-between">
          <div className="flex items-center gap-2">
             <ListTodo size={24} />
            <h1 className="text-xl md:text-2xl font-semibold">Simple To-Do</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow py-6 md:py-8">
        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6 md:mb-8 flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText((e.target as HTMLInputElement).value)}
            placeholder="What needs to be done?"
            className="input-responsive flex-grow dark:placeholder-slate-500"
            aria-label="New task description"
            name="new-task-input"
          />
          <button
            type="submit"
            className="btn-responsive btn-primary flex-shrink-0 flex items-center gap-1"
            aria-label="Add new task"
            name="add-task-button"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>

        {/* Controls: Search, Filter, Sort */}
        <div className="card card-responsive mb-6 md:mb-8 p-4 bg-gray-50 dark:bg-slate-800 theme-transition-bg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="form-group reset-spacing">
              <label htmlFor="search" className="form-label flex items-center gap-1 text-xs mb-1"><Search size={14}/> Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                className="input-responsive text-sm dark:placeholder-slate-500"
                aria-label="Search tasks"
                name="search-input"
              />
            </div>

            {/* Filter */}
            <div className="form-group reset-spacing">
              <label htmlFor="filter" className="form-label flex items-center gap-1 text-xs mb-1"><Filter size={14}/> Filter</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter((e.target as HTMLSelectElement).value as FilterType)}
                className="input-responsive text-sm appearance-none bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"
                aria-label="Filter tasks"
                name="filter-select"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="form-group reset-spacing">
              {/* Changed ArrowDownUp to ArrowUpDown */}
              <label htmlFor="sort" className="form-label flex items-center gap-1 text-xs mb-1"><ArrowUpDown size={14}/> Sort</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort((e.target as HTMLSelectElement).value as SortType)}
                className="input-responsive text-sm appearance-none bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"
                aria-label="Sort tasks"
                name="sort-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="alpha-asc">A-Z</option>
                <option value="alpha-desc">Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 fade-in">
          {filteredAndSortedTasks.length > 0 ? (
            filteredAndSortedTasks.map(task => (
              <div
                key={task.id}
                className={`card card-responsive p-3 flex items-center gap-3 transition-all duration-200 ease-in-out ${task.completed ? 'bg-gray-50 dark:bg-slate-800 opacity-70' : 'bg-white dark:bg-slate-700'} theme-transition-all shadow-sm hover:shadow-md`}
                role="listitem"
              >
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`flex-shrink-0 p-1.5 rounded-full border-2 transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-slate-500 text-gray-300 dark:text-slate-500 hover:border-green-500 hover:text-green-500'}`}
                  aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                  name={`toggle-${task.id}`}
                >
                  <Check size={16} />
                </button>
                <span className={`flex-grow truncate ${task.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-800 dark:text-slate-100'}`}>
                  {task.text}
                </span>
                <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleStartEdit(task)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-slate-600"
                    aria-label={`Edit task: ${task.text}`}
                    name={`edit-${task.id}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                    aria-label={`Delete task: ${task.text}`}
                    name={`delete-${task.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8 italic">
              {tasks.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your current filter/search."}
            </div>
          )}
        </div>
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="modal-backdrop theme-transition-bg no-print fade-in"
          onClick={handleCancelEdit} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="modal-content theme-transition-all w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="modal-header">
              <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Edit size={20} /> Edit Task
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close edit modal"
                name="close-edit-modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="mt-4">
              <div className="form-group">
                <label htmlFor="edit-task-input" className="form-label">Task description:</label>
                <input
                  ref={editInputRef}
                  id="edit-task-input"
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText((e.target as HTMLInputElement).value)}
                  className="input w-full dark:placeholder-slate-500"
                  aria-label="Edit task description"
                  name="edit-task-input"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  name="cancel-edit-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!editText.trim() || editText.trim() === editingTask.text}
                  name="save-edit-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-all no-print">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
