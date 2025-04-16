import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, Edit, Check, X, Search, ArrowUp, ArrowDown, Sun, Moon, Filter,
  ArrowUpDown // Corrected import: Added ArrowUpDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define the Todo item structure
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Store timestamp for sorting
}

// Define sorting options
type SortCriteria = 'newest' | 'oldest' | 'alphabetical' | 'completed' | 'incomplete';

// Define filtering options
type FilterCriteria = 'all' | 'active' | 'completed';

// --- App Component --- 
const App: React.FC = () => {
  // --- State --- 
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('newest');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- Effects --- 

  // Load todos from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      } else {
        // Add some initial sample todos if none exist
        setTodos([
          { id: Date.now().toString() + '1', text: 'Learn React', completed: true, createdAt: Date.now() - 200000 },
          { id: Date.now().toString() + '2', text: 'Build a To-Do App', completed: false, createdAt: Date.now() - 100000 },
          { id: Date.now().toString() + '3', text: 'Deploy the App', completed: false, createdAt: Date.now() },
        ]);
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
      // Initialize with default samples if loading fails
      setTodos([
        { id: Date.now().toString() + '1', text: 'Learn React', completed: true, createdAt: Date.now() - 200000 },
        { id: Date.now().toString() + '2', text: 'Build a To-Do App', completed: false, createdAt: Date.now() - 100000 },
        { id: Date.now().toString() + '3', text: 'Deploy the App', completed: false, createdAt: Date.now() },
      ]);
    }
  }, []);

  // Save todos to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error("Failed to save todos to localStorage:", error);
    }
  }, [todos]);

  // Apply dark mode class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancelEdit();
      }
    };
    if (editingTodo) {
      document.addEventListener('keydown', handleEsc);
    } else {
      document.removeEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [editingTodo, handleCancelEdit]); // Added handleCancelEdit to dependency array

  // --- Event Handlers ---

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(event.target.value);
  };

  const handleAddTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = newTodoText.trim();
    if (trimmedText) {
      const newTodo: Todo = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7), // Simple unique enough ID
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      };
      setTodos(prevTodos => [newTodo, ...prevTodos]); // Add new todo to the beginning
      setNewTodoText(''); // Clear input
    }
  };

  const handleToggleComplete = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    document.body.classList.add('modal-open');
  };

  const handleSaveEdit = () => {
    if (editingTodo && editText.trim()) {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodo.id ? { ...todo, text: editText.trim() } : todo
        )
      );
      handleCancelEdit(); // Close modal after saving
    } else if (editingTodo && !editText.trim()) {
        // Optional: Show an error or prevent saving empty text
        console.warn("Cannot save empty todo text.");
    } 
  };

  const handleCancelEdit = useCallback(() => {
    setEditingTodo(null);
    setEditText('');
    document.body.classList.remove('modal-open');
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (criteria: SortCriteria) => {
    setSortCriteria(criteria);
  };

  const handleFilterChange = (criteria: FilterCriteria) => {
    setFilterCriteria(criteria);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- Derived State (Filtering and Sorting) ---
  const filteredAndSortedTodos = useMemo(() => {
    let processedTodos = [...todos];

    // Filtering
    if (filterCriteria === 'active') {
      processedTodos = processedTodos.filter(todo => !todo.completed);
    } else if (filterCriteria === 'completed') {
      processedTodos = processedTodos.filter(todo => todo.completed);
    }

    // Searching
    if (searchTerm) {
      processedTodos = processedTodos.filter(todo =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    processedTodos.sort((a, b) => {
      switch (sortCriteria) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'completed':
          return (a.completed === b.completed) ? b.createdAt - a.createdAt : a.completed ? -1 : 1;
        case 'incomplete':
            return (a.completed === b.completed) ? b.createdAt - a.createdAt : a.completed ? 1 : -1;
        default:
          return 0;
      }
    });

    return processedTodos;
  }, [todos, filterCriteria, searchTerm, sortCriteria]);

  // --- Render --- 
  return (
    <div className={`min-h-screen theme-transition-bg ${isDarkMode ? 'dark' : ''}`}>
      <div className="container-narrow mx-auto py-8 px-4 fade-in">
        {/* Header */}
        <header className="flex-between mb-6">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">To-Do List</h1>
          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <Sun size={18} className="text-yellow-500" />
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              role="switch"
              aria-checked={isDarkMode}
              name="theme-toggle"
            >
              <span className="theme-toggle-thumb"></span>
            </button>
            <Moon size={18} className="text-slate-400" />
          </div>
        </header>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6 slide-in">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={handleInputChange}
              placeholder="What needs to be done?"
              className="input input-responsive flex-grow dark:placeholder-slate-400"
              aria-label="New todo text"
              name="new-todo-input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex-shrink-0 flex items-center justify-center gap-1"
              aria-label="Add new todo"
              name="add-todo-button"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Filter, Search, and Sort Controls */}
        <div className="card card-responsive mb-6 bg-gray-50 dark:bg-slate-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search todos..."
                        className="input input-responsive w-full pl-8 dark:placeholder-slate-400"
                        aria-label="Search todos"
                        name="search-input"
                    />
                    <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                </div>

                {/* Filter */}
                <div className="flex items-center justify-center gap-2">
                    <Filter size={16} className="text-gray-500 dark:text-slate-400 flex-shrink-0"/>
                    <select
                        value={filterCriteria}
                        onChange={(e) => handleFilterChange(e.target.value as FilterCriteria)}
                        className="input input-responsive w-full md:w-auto dark:bg-slate-700"
                        aria-label="Filter todos by status"
                        name="filter-select"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-center md:justify-end gap-2">
                    <ArrowUpDown size={16} className="text-gray-500 dark:text-slate-400 flex-shrink-0"/> {/* Corrected usage */}
                    <select
                        value={sortCriteria}
                        onChange={(e) => handleSortChange(e.target.value as SortCriteria)}
                        className="input input-responsive w-full md:w-auto dark:bg-slate-700"
                        aria-label="Sort todos"
                        name="sort-select"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="completed">Completed First</option>
                        <option value="incomplete">Incomplete First</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Todo List */}
        <div className="card card-responsive">
          {filteredAndSortedTodos.length > 0 ? (
            <ul className="space-y-3">
              {filteredAndSortedTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center justify-between p-3 rounded-md transition-colors duration-200 ${todo.completed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-slate-700'} shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 ${styles.todoItem}`}
                  role="listitem"
                >
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <button
                       onClick={() => handleToggleComplete(todo.id)}
                       className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-primary-500 border-primary-500 hover:bg-primary-600' : 'border-gray-300 dark:border-slate-500 hover:border-primary-400'}`}
                       aria-label={todo.completed ? `Mark ${todo.text} as incomplete` : `Mark ${todo.text} as complete`}
                       name={`toggle-${todo.id}`}
                    >
                        {todo.completed && <Check size={16} className="text-white" />}
                    </button>
                    <span
                      className={`flex-grow truncate cursor-pointer ${todo.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-800 dark:text-slate-100'}`}
                      onClick={() => handleToggleComplete(todo.id)} // Allow clicking text to toggle
                      title={todo.text}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleEditClick(todo)}
                      className="btn btn-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700 p-1.5 rounded"
                      aria-label={`Edit ${todo.text}`}
                      name={`edit-${todo.id}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 p-1.5 rounded"
                      aria-label={`Delete ${todo.text}`}
                      name={`delete-${todo.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400 py-4">
              {searchTerm ? 'No todos match your search.' : filterCriteria !== 'all' ? `No ${filterCriteria} todos.` : 'No todos yet. Add one above!'}
            </p>
          )}
        </div>

        {/* Edit Modal */}
        {editingTodo && (
          <div
            className="modal-backdrop fade-in flex items-center justify-center"
            onClick={handleCancelEdit} // Close on backdrop click
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div
              className="modal-content w-full max-w-md slide-in"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="modal-header">
                <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Todo</h3>
                <button
                   onClick={handleCancelEdit}
                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                   aria-label="Close edit modal"
                   name="close-modal-button"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={editText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                  className="input w-full"
                  aria-label="Edit todo text"
                  name="edit-todo-input"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} // Save on Enter key
                />
              </div>
              <div className="modal-footer">
                <button
                  onClick={handleCancelEdit}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                  name="cancel-edit-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary"
                  disabled={!editText.trim()} // Disable if input is empty
                  name="save-edit-button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-slate-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;
