import React, { useState, useEffect, useCallback, useMemo, ChangeEvent, KeyboardEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import { Sun, Moon, Plus, Edit, Trash2, Search, X, Check, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define Types within App.tsx
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Store timestamp for sorting
}

type FilterStatus = 'all' | 'active' | 'completed';

interface SortCriteria {
  key: keyof TodoItem | 'default';
  direction: 'asc' | 'desc';
}

interface FormData {
  newTodoText: string;
}

// --- Main Application Component ---
const App: React.FC = () => {
  // --- State Management ---
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>({ key: 'createdAt', direction: 'desc' });
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- React Hook Form for Add Todo ---
  const { register, handleSubmit, reset, setFocus } = useForm<FormData>();

  // --- Local Storage Effects ---
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
      // Optionally clear corrupted storage or show an error message
      // localStorage.removeItem('todos');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Prevent saving during initial load
    if (!isLoading) {
      try {
        localStorage.setItem('todos', JSON.stringify(todos));
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
        // Optionally show an error message to the user
      }
    }
  }, [todos, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // --- Event Handlers & Logic ---
  const addTodo: SubmitHandler<FormData> = (data) => {
    const text = data.newTodoText.trim();
    if (text) {
      const newTodo: TodoItem = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
      reset(); // Reset the form input
    }
  };

  const toggleTodo = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  const startEditing = useCallback((todo: TodoItem) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingTodoId(null);
    setEditingTodoText('');
  }, []);

  const saveEdit = useCallback(() => {
    if (editingTodoId && editingTodoText.trim()) {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodoId ? { ...todo, text: editingTodoText.trim() } : todo
        )
      );
    }
    cancelEdit(); // Always exit editing mode after attempt
  }, [editingTodoId, editingTodoText, cancelEdit]);

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingTodoText(e.target.value);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleFilterChange = (newFilter: FilterStatus) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (key: keyof TodoItem | 'default') => {
    setSortCriteria(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;

    // Filtering
    if (filter === 'active') {
      result = result.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      result = result.filter(todo => todo.completed);
    }

    // Searching
    if (searchTerm) {
      result = result.filter(todo =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    if (sortCriteria.key !== 'default') {
      result.sort((a, b) => {
        const key = sortCriteria.key as keyof TodoItem; // Cast here
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }

        return sortCriteria.direction === 'asc' ? comparison : comparison * -1;
      });
    }

    return result;
  }, [todos, filter, searchTerm, sortCriteria]);

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="space-y-3 p-6">
          <div className="skeleton-text w-1/2 mx-auto"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
          <div className="skeleton-text w-full mt-4"></div>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all font-sans flex flex-col ${styles.appContainer}`}>
      {/* Header */} 
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 theme-transition">
        <div className="container-wide mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">Simple To-Do</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Light</span>
            <button
              onClick={toggleDarkMode}
              className={`${styles.themeToggle} ${isDarkMode ? styles.dark : ''}`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span className={styles.themeToggleThumb}></span>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Dark</span>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="flex-grow container-wide mx-auto p-4 sm:p-6 lg:p-8">
        {/* Add Todo Form */} 
        <form onSubmit={handleSubmit(addTodo)} className="mb-6">
          <div className="form-group flex flex-col sm:flex-row gap-2">
            <label htmlFor="newTodoText" className="sr-only">Add new todo</label>
            <input
              id="newTodoText"
              type="text"
              {...register('newTodoText', { required: true })}
              className="input input-responsive flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="What needs to be done?"
              aria-label="New todo text"
            />
            <button type="submit" className="btn btn-primary btn-responsive flex items-center justify-center gap-2">
              <Plus size={18} /> Add Todo
            </button>
          </div>
        </form>

        {/* Filter, Search, Sort Controls */} 
        <div className="card mb-6 bg-white dark:bg-gray-800 theme-transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */} 
            <div className="form-group flex-grow md:max-w-xs">
              <label htmlFor="searchTodo" className="sr-only">Search Todos</label>
              <div className="relative">
                <input
                  id="searchTodo"
                  type="text"
                  className="input input-responsive w-full pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search todos"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {/* Filters */} 
            <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Filter:</span>
              {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`btn btn-sm capitalize ${filter === status ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                  aria-pressed={filter === status}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Sort */} 
            <div className="flex items-center justify-center space-x-2">
               <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Sort:</span>
               <button
                 onClick={() => handleSortChange('text')}
                 className={`btn btn-sm flex items-center gap-1 ${sortCriteria.key === 'text' ? 'btn-secondary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                 aria-label={`Sort by text ${sortCriteria.key === 'text' ? (sortCriteria.direction === 'asc' ? '(ascending)' : '(descending)') : ''}`}
               >
                 Text
                 {sortCriteria.key === 'text' && (
                    sortCriteria.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                 )}
               </button>
               <button
                 onClick={() => handleSortChange('createdAt')}
                 className={`btn btn-sm flex items-center gap-1 ${sortCriteria.key === 'createdAt' ? 'btn-secondary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                 aria-label={`Sort by date ${sortCriteria.key === 'createdAt' ? (sortCriteria.direction === 'asc' ? '(ascending)' : '(descending)') : ''}`}
               >
                 Date
                 {sortCriteria.key === 'createdAt' && (
                    sortCriteria.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                 )}
               </button>
            </div>
          </div>
        </div>

        {/* Todo List */} 
        {filteredAndSortedTodos.length > 0 ? (
          <ul className="space-y-3">
            {filteredAndSortedTodos.map((todo) => (
              <li
                key={todo.id}
                className={`card card-responsive flex items-center justify-between gap-3 theme-transition-all bg-white dark:bg-gray-800 ${todo.completed ? 'opacity-60' : ''}`}
              >
                {editingTodoId === todo.id ? (
                  // --- Editing State ---
                  <div className="flex-grow flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTodoText}
                      onChange={handleEditInputChange}
                      onKeyDown={handleEditKeyDown}
                      className="input input-responsive flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      autoFocus
                      aria-label="Edit todo text"
                    />
                    <button onClick={saveEdit} className="btn btn-sm btn-success flex items-center justify-center gap-1" aria-label="Save changes">
                       <Check size={16} /> Save
                    </button>
                    <button onClick={cancelEdit} className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-1" aria-label="Cancel edit">
                       <X size={16} /> Cancel
                    </button>
                  </div>
                ) : (
                  // --- Display State ---
                  <>
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      <input
                        type="checkbox"
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500 dark:text-primary-500 dark:focus:ring-primary-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        aria-labelledby={`todo-text-${todo.id}`}
                      />
                      <span
                        id={`todo-text-${todo.id}`}
                        className={`flex-grow truncate ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                        title={todo.text}
                      >
                        {todo.text}
                      </span>
                       <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-auto hidden sm:inline">
                          {format(new Date(todo.createdAt), 'PPp')}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEditing(todo)}
                        className="btn btn-sm btn-secondary flex items-center justify-center gap-1 transition-transform hover:scale-105"
                        aria-label={`Edit todo: ${todo.text}`}
                      >
                        <Edit size={16} /> <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-1 transition-transform hover:scale-105"
                        aria-label={`Delete todo: ${todo.text}`}
                      >
                        <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <p>No todos found. {searchTerm ? 'Try adjusting your search.' : filter !== 'all' ? 'Try a different filter.' : 'Add a new task above!'}</p>
          </div>
        )}
      </main>

      {/* Footer */} 
      <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 theme-transition">
         Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
