import React, { useState, useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { Plus, Trash2, Pencil, Check, Search, Sun, Moon, X } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define the structure for a To-Do item
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

// Define filter types
type FilterType = 'all' | 'active' | 'completed';

const App: React.FC = () => {
  // --- State Variables ---
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos_homemaker');
      return savedTodos ? JSON.parse(savedTodos) : [
        { id: crypto.randomUUID(), text: 'Buy groceries (milk, eggs, bread)', completed: false, createdAt: Date.now() },
        { id: crypto.randomUUID(), text: 'Plan weekly meals', completed: false, createdAt: Date.now() - 10000 },
        { id: crypto.randomUUID(), text: 'Clean the kitchen', completed: true, createdAt: Date.now() - 20000 },
      ];
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      return [];
    }
  });

  const [newTodoText, setNewTodoText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedMode = localStorage.getItem('darkMode_homemaker');
      if (savedMode !== null) {
        return JSON.parse(savedMode);
      }
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch (error) {
      console.error('Failed to load dark mode setting:', error);
      return false;
    }
  });

  // --- Refs ---
  const editInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Load initial dark mode state and update body class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('darkMode_homemaker', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  }, [isDarkMode]);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todos_homemaker', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  }, [todos]);

  // Focus edit input when modal opens
  useEffect(() => {
    if (editingTodo && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTodo]);

  // Handle Escape key to close modal
  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
    if (event.key === 'Escape' && editingTodo) {
      closeEditModal();
    }
  }, [editingTodo]); // Add editingTodo dependency

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Add handleKeyDown dependency

  // --- Event Handlers ---

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(event.target.value);
  };

  const handleAddTodo = (event: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (newTodoText.trim() === '') return;
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTodos([newTodo, ...todos]); // Add new todo to the beginning
    setNewTodoText('');
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleEditClick = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    document.body.classList.add('modal-open');
  };

  const closeEditModal = () => {
    setEditingTodo(null);
    setEditText('');
    document.body.classList.remove('modal-open');
  };

  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditText(event.target.value);
  };

  const handleSaveEdit = () => {
    if (!editingTodo || editText.trim() === '') return;
    setTodos(
      todos.map(todo =>
        todo.id === editingTodo.id ? { ...todo, text: editText.trim() } : todo
      )
    );
    closeEditModal();
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveEdit();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- Filtering and Sorting Logic ---

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && !todo.completed) || 
        (filter === 'completed' && todo.completed);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first

  // --- Render ---

  return (
    <div className={`min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''} ${styles.appContainer}`}>
      <div className="container-narrow mx-auto px-4 py-8 theme-transition-bg">
        {/* Header */}
        <header className="flex-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 theme-transition-text">Homemaker's Helper</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            name="theme-toggle"
            role="switch"
            aria-checked={isDarkMode}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </header>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={handleInputChange}
            placeholder="What needs doing? (e.g., Fold laundry)"
            className="input input-responsive flex-grow"
            aria-label="New task input"
            name="new-task-input"
          />
          <button
            type="submit"
            className="btn btn-primary btn-responsive flex-center gap-1 flex-shrink-0"
            name="add-task-button"
            role="button"
            aria-label="Add new task"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </form>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="input input-responsive pl-10"
              aria-label="Search tasks input"
              name="search-input"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Filter:</span>
            {(['all', 'active', 'completed'] as FilterType[]).map(filterType => (
              <button
                key={filterType}
                onClick={() => handleFilterChange(filterType)}
                className={`btn btn-sm capitalize ${filter === filterType
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                } theme-transition-all`}
                aria-pressed={filter === filterType}
                name={`filter-${filterType}-button`}
                role="button"
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length > 0 ? (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`card card-sm flex items-center justify-between gap-3 theme-transition-all fade-in ${todo.completed ? 'opacity-60' : ''}`}
                role="listitem"
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <button
                    onClick={() => handleToggleComplete(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${todo.completed
                      ? 'border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400'
                      : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
                    }`}
                    aria-label={todo.completed ? 'Mark task as active' : 'Mark task as complete'}
                    name={`toggle-${todo.id}`}
                  >
                    {todo.completed && <Check size={16} className="text-white" />}
                  </button>
                  <span
                    className={`flex-grow truncate ${todo.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'} theme-transition-text`}
                    title={todo.text}
                  >
                    {todo.text}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditClick(todo)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded transition-colors"
                    aria-label={`Edit task: ${todo.text}`}
                    name={`edit-${todo.id}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-slate-700 rounded transition-colors"
                    aria-label={`Delete task: ${todo.text}`}
                    name={`delete-${todo.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8 theme-transition-text">
              {todos.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your current filter/search."}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingTodo && (
          <div
            className="modal-backdrop fade-in"
            onClick={closeEditModal}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div
              className="modal-content card-responsive theme-transition-all slide-in w-full max-w-md"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="modal-header">
                <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
                <button
                  onClick={closeEditModal}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close edit modal"
                  name="close-edit-modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4">
                <label htmlFor="edit-task-input" className="form-label">Task description:</label>
                <input
                  id="edit-task-input"
                  type="text"
                  ref={editInputRef}
                  value={editText}
                  onChange={handleEditInputChange}
                  onKeyDown={handleEditKeyDown}
                  className="input input-responsive"
                  name="edit-task-input"
                  aria-label="Edit task description"
                />
              </div>
              <div className="modal-footer">
                <button
                  onClick={closeEditModal}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition-all"
                  name="cancel-edit-button"
                  role="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary"
                  name="save-edit-button"
                  role="button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* Footer */}
      <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
