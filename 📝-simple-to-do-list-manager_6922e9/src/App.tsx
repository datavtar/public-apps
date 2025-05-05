import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Edit, Check, X, Search, Filter as FilterIcon, 
  ArrowDownUp, Sun, Moon, ListTodo, AlertCircle 
} from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types --- //
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'date-desc' | 'date-asc' | 'text-asc' | 'text-desc';

// --- Constants --- //
const LOCAL_STORAGE_KEY = 'simple_todo_tasks';
const DARK_MODE_KEY = 'simple_todo_dark_mode';

// --- Initial Data --- //
const getInitialTasks = (): Task[] => {
  try {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      // Basic validation
      if (Array.isArray(parsedTasks) && parsedTasks.every(t => typeof t.id === 'string' && typeof t.text === 'string' && typeof t.completed === 'boolean' && typeof t.createdAt === 'number')) {
        return parsedTasks;
      }
    }
  } catch (error) {
    console.error('Error parsing tasks from localStorage:', error);
  }
  // Default tasks if none in localStorage or parsing fails
  return [
    { id: crypto.randomUUID(), text: 'Learn React', completed: true, createdAt: Date.now() - 100000 },
    { id: crypto.randomUUID(), text: 'Learn TypeScript', completed: false, createdAt: Date.now() - 50000 },
    { id: crypto.randomUUID(), text: 'Build a To-Do App', completed: false, createdAt: Date.now() },
  ];
};

const getInitialDarkMode = (): boolean => {
  try {
    const storedMode = localStorage.getItem(DARK_MODE_KEY);
    if (storedMode) {
      return JSON.parse(storedMode);
    }
    // Fallback to system preference if no setting stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch (error) {
    console.error('Error parsing dark mode setting from localStorage:', error);
    return false;
  }
};

function App() {
  // --- State --- //
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDarkMode);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  // --- Effects --- //

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      setTasks(getInitialTasks());
    } catch (err) {
      setError('Failed to load tasks. Please try refreshing the page.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    // Don't save during initial load
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        setError('Failed to save tasks. Changes might be lost.');
        console.error(err);
      }
    }
  }, [tasks, isLoading]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode));
    } catch (err) {
      setError('Failed to save theme preference.');
      console.error(err);
    }
  }, [isDarkMode]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  // Add ESC key listener to cancel editing
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelEdit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- Event Handlers --- //

  const handleAddTask = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = newTaskText.trim();
    if (!trimmedText) {
      setError('Task text cannot be empty.');
      return;
    }
    setError(null); // Clear previous error
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskText('');
  }, [newTaskText]);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    if (editingTaskId === id) {
        cancelEdit(); // Cancel edit if the deleted task was being edited
    }
  }, [editingTaskId]);

  const startEditing = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditText('');
  }, []);

  const saveEdit = useCallback((id: string) => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      setError('Task text cannot be empty.');
      // Optionally, keep the edit mode active or revert to original text
      // For simplicity, we'll just cancel the edit if the text is empty
      cancelEdit();
      return;
    }
    setError(null);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, text: trimmedText } : task
      )
    );
    cancelEdit();
  }, [editText, cancelEdit]);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (e.key === 'Enter') {
          saveEdit(id);
      } else if (e.key === 'Escape') {
          cancelEdit();
      }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as FilterType);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortType);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Derived State (Filtering, Searching, Sorting) --- //
  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...tasks];

    // Filtering
    if (filter === 'active') {
      processedTasks = processedTasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      processedTasks = processedTasks.filter(task => task.completed);
    }

    // Searching
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      processedTasks = processedTasks.filter(task =>
        task.text.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Sorting
    processedTasks.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'text-asc':
          return a.text.localeCompare(b.text);
        case 'text-desc':
          return b.text.localeCompare(a.text);
        case 'date-desc':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return processedTasks;
  }, [tasks, filter, searchTerm, sort]);

  // --- Render --- //
  return (
    <div className={`min-h-screen flex flex-col theme-transition-bg ${styles.appContainer}`}>
      {/* Header */} 
      <header className="bg-primary-600 dark:bg-slate-900 text-white p-4 shadow-md theme-transition-bg no-print">
        <div className="container-narrow flex-between">
          <div className="flex items-center gap-2">
            <ListTodo size={24} />
            <h1 className="text-xl md:text-2xl font-bold">Simple To-Do</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 dark:focus:ring-offset-slate-900 focus:ring-white transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={isDarkMode}
            name="theme-toggle"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */} 
      <main className="flex-grow container-narrow py-6 md:py-8">
        {/* Add Task Form */} 
        <form onSubmit={handleAddTask} className="mb-6 md:mb-8 no-print">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="input-responsive flex-grow"
              aria-label="New task description"
              name="new-task-input"
              required
            />
            <button type="submit" className="btn btn-primary btn-responsive flex-shrink-0 flex items-center justify-center gap-2" name="add-task-button">
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </div>
          {error && (
            <div role="alert" className="alert alert-error mt-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0"/>
                <span>{error}</span>
            </div>
            )}
        </form>

        {/* Filters, Sort, Search */} 
        <div className="card card-responsive mb-6 md:mb-8 no-print theme-transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */} 
            <div className="form-group reset-spacing">
              <label htmlFor="search" className="form-label flex items-center gap-1"><Search size={14}/>Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="input-responsive"
                aria-label="Search tasks"
                name="search-input"
              />
            </div>

            {/* Filter */} 
            <div className="form-group reset-spacing">
              <label htmlFor="filter" className="form-label flex items-center gap-1"><FilterIcon size={14}/>Filter</label>
              <select
                id="filter"
                value={filter}
                onChange={handleFilterChange}
                className="input-responsive"
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
              <label htmlFor="sort" className="form-label flex items-center gap-1"><ArrowDownUp size={14}/>Sort By</label>
              <select
                id="sort"
                value={sort}
                onChange={handleSortChange}
                className="input-responsive"
                aria-label="Sort tasks"
                name="sort-select"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="text-asc">Text (A-Z)</option>
                <option value="text-desc">Text (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */} 
        {isLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-12 w-full"></div>
            <div className="skeleton h-12 w-full"></div>
            <div className="skeleton h-12 w-full"></div>
          </div>
        ) : filteredAndSortedTasks.length > 0 ? (
          <ul className="space-y-3">
            {filteredAndSortedTasks.map((task) => (
              <li
                key={task.id}
                className={`card card-sm theme-transition-all flex items-center gap-3 ${task.completed ? 'opacity-60' : ''}`}
                role="listitem"
              >
                {editingTaskId === task.id ? (
                  // Edit Mode
                  <>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editText}
                      onChange={handleEditInputChange}
                      onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                      className="input input-sm flex-grow"
                      aria-label={`Edit task: ${task.text}`}
                      name={`edit-input-${task.id}`}
                    />
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="btn btn-sm btn-primary p-1.5" // Adjusted padding
                      aria-label="Save changes"
                      name={`save-button-${task.id}`}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn btn-sm bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 p-1.5" // Adjusted padding
                      aria-label="Cancel editing"
                      name={`cancel-button-${task.id}`}
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  // View Mode
                  <>
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`p-1.5 rounded border ${task.completed ? 'bg-green-500 border-green-600 dark:bg-green-700 dark:border-green-800 text-white' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'} transition-colors`}
                      aria-pressed={task.completed}
                      aria-label={task.completed ? `Mark task '${task.text}' as active` : `Mark task '${task.text}' as completed`}
                      name={`toggle-button-${task.id}`}
                    >
                      {task.completed ? <Check size={16} /> : <span className="block w-4 h-4"></span>}{/* Placeholder for alignment */}
                    </button>
                    <span className={`flex-grow text-sm md:text-base ${task.completed ? 'line-through text-gray-500 dark:text-slate-500' : ''} break-words`}>
                      {task.text}
                    </span>
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      <button
                        onClick={() => startEditing(task)}
                        className="btn btn-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 p-1.5" // Adjusted padding
                        aria-label={`Edit task '${task.text}'`}
                        name={`edit-button-${task.id}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="btn btn-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 p-1.5" // Adjusted padding
                        aria-label={`Delete task '${task.text}'`}
                        name={`delete-button-${task.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 dark:text-slate-400 py-10">
            <p>{searchTerm ? 'No tasks match your search.' : filter === 'active' ? 'No active tasks.' : filter === 'completed' ? 'No completed tasks.' : 'No tasks yet! Add one above.'}</p>
          </div>
        )}
      </main>

      {/* Footer */} 
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-all mt-auto no-print">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
