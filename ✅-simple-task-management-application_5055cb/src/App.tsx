import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  ArrowUp, 
  ArrowDown,
  Filter
} from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types and Enums ---
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Inputs = {
  newTodoText: string;
};

enum FilterStatus {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

enum SortKey {
  CreatedAt = 'createdAt',
  Text = 'text',
  Completed = 'completed',
}

// --- Initial Data ---
const initialTodos: Todo[] = [
  { id: crypto.randomUUID(), text: 'Learn React', completed: true, createdAt: Date.now() - 200000 },
  { id: crypto.randomUUID(), text: 'Learn TypeScript', completed: false, createdAt: Date.now() - 100000 },
  { id: crypto.randomUUID(), text: 'Build a To-Do App', completed: false, createdAt: Date.now() },
];

// --- Main App Component ---
const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.All);
  const [sortKey, setSortKey] = useState<SortKey>(SortKey.CreatedAt);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<Inputs>();

  // --- Effects ---
  useEffect(() => {
    // Load todos from localStorage on initial render
    setIsLoading(true);
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      } else {
        // Set initial data if localStorage is empty
        setTodos(initialTodos);
        localStorage.setItem('todos', JSON.stringify(initialTodos));
      }
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('Failed to load your tasks. Please try refreshing the page.');
      setTodos(initialTodos); // Fallback to initial data on error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save todos to localStorage whenever they change
    // Avoid saving during initial load or if there was a load error
    if (!isLoading && !error) {
      try {
        localStorage.setItem('todos', JSON.stringify(todos));
      } catch (err) {
        console.error('Failed to save todos:', err);
        setError('Failed to save your tasks.');
      }
    }
  }, [todos, isLoading, error]);

  useEffect(() => {
    // Apply dark mode class to document element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    // Handle Escape key to cancel editing
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            cancelEditing();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- Memoized Filtered and Sorted Todos ---
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        filterStatus === FilterStatus.All ||
        (filterStatus === FilterStatus.Completed && todo.completed) ||
        (filterStatus === FilterStatus.Active && !todo.completed);
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let compareA: string | number | boolean;
      let compareB: string | number | boolean;

      switch (sortKey) {
        case SortKey.Text:
          compareA = a.text.toLowerCase();
          compareB = b.text.toLowerCase();
          break;
        case SortKey.Completed:
          compareA = a.completed;
          compareB = b.completed;
          break;
        case SortKey.CreatedAt:
        default:
          compareA = a.createdAt;
          compareB = b.createdAt;
          break;
      }

      let comparison = 0;
      if (compareA > compareB) {
        comparison = 1;
      } else if (compareA < compareB) {
        comparison = -1;
      }
      
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return filtered;
  }, [todos, searchTerm, filterStatus, sortKey, sortDirection]);

  // --- Event Handlers (useCallback for stable references) ---
  const addTodo: SubmitHandler<Inputs> = useCallback((data) => {
    const text = data.newTodoText.trim();
    if (text) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      };
      setTodos(prevTodos => [newTodo, ...prevTodos]); // Add to the beginning
      reset(); // Clear the form
    }
  }, [reset]);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    if (editingTodoId === id) { // Cancel edit if deleting the item being edited
        cancelEditing();
    }
  }, [editingTodoId]);

  const startEditing = useCallback((todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingTodoId(null);
    setEditingTodoText('');
  }, []);

  const saveEdit = useCallback((id: string) => {
    const trimmedText = editingTodoText.trim();
    if (trimmedText) {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, text: trimmedText } : todo
        )
      );
      cancelEditing();
    } else {
      // Optionally delete if text is empty after trim, or just cancel
      // deleteTodo(id);
      cancelEditing(); // Or just cancel edit
    }
  }, [editingTodoText, cancelEditing]);

  const handleSort = useCallback((key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc'); // Default to ascending when changing key
    }
  }, [sortKey]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // --- Render Helper for Sort Icon ---
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 inline-block ml-1" /> : <ArrowDown className="h-4 w-4 inline-block ml-1" />;
  };

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 theme-transition">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-slate-900`}>
      <main className="flex-grow container-narrow py-8 px-4">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4 sm:mb-0">My Tasks</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={isDarkMode}
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </header>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-4" role="alert">
             <X className="h-5 w-5" />
            <p>{error}</p>
             <button onClick={() => setError(null)} className="ml-auto p-1 rounded hover:bg-red-100 dark:hover:bg-red-800" aria-label="Dismiss error">
                <X className="h-4 w-4"/>
             </button>
          </div>
        )}

        {/* Add Todo Form */}
        <form onSubmit={handleSubmit(addTodo)} className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-grow form-group mb-0">
              <label htmlFor="newTodoText" className="sr-only">New task description</label>
              <input
                id="newTodoText"
                type="text"
                placeholder="What needs to be done?"
                className={`input input-responsive ${errors.newTodoText ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'} dark:bg-slate-800 dark:text-white`}
                {...register('newTodoText', { required: 'Task description cannot be empty' })}
                aria-invalid={errors.newTodoText ? "true" : "false"}
                aria-describedby="newTodoError"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex items-center justify-center gap-2 flex-shrink-0"
              aria-label="Add new task"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
            {errors.newTodoText && (
                <p id="newTodoError" className="form-error mt-1 sm:mt-2" role="alert">
                    {errors.newTodoText.message}
                </p>
            )}
        </form>

        {/* Filters and Search */}
        <div className="card card-responsive bg-white dark:bg-slate-800 shadow-md mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search Input */}
            <div className="form-group mb-0 col-span-1 md:col-span-1">
              <label htmlFor="search" className="sr-only">Search tasks</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-slate-500"/>
                 </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-responsive pl-10 w-full dark:bg-slate-700"
                  aria-label="Search tasks"
                />
               </div>
            </div>

            {/* Filter Buttons */}
            <div className="form-group mb-0 col-span-1 md:col-span-2 flex flex-wrap justify-center md:justify-end items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400 mr-2 hidden sm:inline">Filter:</span>
              {(Object.keys(FilterStatus) as Array<keyof typeof FilterStatus>).map((key) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(FilterStatus[key])}
                  className={`btn btn-sm btn-responsive capitalize flex items-center gap-1 ${filterStatus === FilterStatus[key] ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                  aria-pressed={filterStatus === FilterStatus[key]}
                >
                  <Filter className="h-4 w-4"/>
                  {FilterStatus[key]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
         {/* Sort Controls - Optional: Could be integrated better or hidden */}
        <div className="flex justify-end items-center gap-2 mb-4 text-sm text-gray-600 dark:text-slate-400">
            <span>Sort by:</span>
            <button onClick={() => handleSort(SortKey.CreatedAt)} className="font-medium hover:text-primary-600 dark:hover:text-primary-400">Date {renderSortIcon(SortKey.CreatedAt)}</button>
            <button onClick={() => handleSort(SortKey.Text)} className="font-medium hover:text-primary-600 dark:hover:text-primary-400">Text {renderSortIcon(SortKey.Text)}</button>
            <button onClick={() => handleSort(SortKey.Completed)} className="font-medium hover:text-primary-600 dark:hover:text-primary-400">Status {renderSortIcon(SortKey.Completed)}</button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredAndSortedTodos.length > 0 ? (
            filteredAndSortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`card card-responsive bg-white dark:bg-slate-800 shadow-sm p-4 flex items-center gap-3 transition-opacity duration-300 ${todo.completed ? 'opacity-60' : 'opacity-100'}`}
              >
                {editingTodoId === todo.id ? (
                  // Edit Mode
                  <>
                    <input
                      type="text"
                      value={editingTodoText}
                      onChange={(e) => setEditingTodoText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(todo.id); }} // Save on Enter
                      className="input input-responsive flex-grow dark:bg-slate-700"
                      autoFocus // Focus on the input when editing starts
                      aria-label={`Edit task: ${todo.text}`}
                    />
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="btn btn-sm bg-green-500 hover:bg-green-600 text-white p-2"
                      aria-label={`Save changes for task: ${editingTodoText || todo.text}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white p-2"
                      aria-label="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  // View Mode
                  <>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      id={`todo-${todo.id}`}
                      className="form-checkbox h-5 w-5 text-primary-600 dark:text-primary-400 rounded border-gray-300 dark:border-slate-600 focus:ring-primary-500 dark:bg-slate-700 dark:focus:ring-offset-slate-800 flex-shrink-0"
                      aria-labelledby={`todo-label-${todo.id}`}
                    />
                    <label 
                        htmlFor={`todo-${todo.id}`} 
                        id={`todo-label-${todo.id}`}
                        className={`flex-grow cursor-pointer text-gray-800 dark:text-slate-200 ${todo.completed ? 'line-through' : ''}`}
                    >
                        {todo.text}
                    </label>
                     <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0 hidden sm:inline">
                        {new Date(todo.createdAt).toLocaleDateString()}    
                     </span>
                    <button
                      onClick={() => startEditing(todo)}
                      className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white p-2 ml-auto flex-shrink-0"
                      aria-label={`Edit task: ${todo.text}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="btn btn-sm bg-red-500 hover:bg-red-600 text-white p-2 flex-shrink-0"
                      aria-label={`Delete task: ${todo.text}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-slate-400">
                    {todos.length === 0 ? "You haven't added any tasks yet!" : "No tasks match your current filters."}
                </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-8 theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
