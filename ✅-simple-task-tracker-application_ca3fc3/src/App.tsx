import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, Moon, Sun, Filter } from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types --- //

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Store timestamp for potential sorting
}

type FilterType = 'all' | 'active' | 'completed';

// --- Constants --- //
const LOCAL_STORAGE_KEY_TODOS = 'minimalistTodos';
const LOCAL_STORAGE_KEY_THEME = 'minimalistTodoTheme';

// --- Main App Component --- //

function App(): JSX.Element {
  // --- State --- //
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return savedTheme === 'dark';
    // We don't check system preference here to keep it simpler, user toggle is primary
  });

  const newTodoInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // --- Effects --- //

  // Load todos from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY_TODOS);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      // Optionally: show an error message to the user
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TODOS, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
      // Optionally: show an error message to the user
    }
  }, [todos]);

  // Apply dark mode class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTodoId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select(); // Select text for easy replacement
    }
  }, [editingTodoId]);

  // --- Event Handlers --- //

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNewTodoText(event.target.value);
  };

  const handleAddTodo = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmedText = newTodoText.trim();
    if (trimmedText) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      };
      setTodos([newTodo, ...todos]); // Add new todo to the beginning
      setNewTodoText('');
    }
  };

  const toggleComplete = (id: string): void => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string): void => {
    setTodos(todos.filter((todo) => todo.id !== id));
    // If deleting the item being edited, cancel edit mode
    if (editingTodoId === id) {
        cancelEdit();
    }
  };

  const startEditing = (todo: Todo): void => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEditingTodoText(event.target.value);
  };

  const saveEdit = (): void => {
    const trimmedText = editingTodoText.trim();
    if (editingTodoId && trimmedText) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodoId ? { ...todo, text: trimmedText } : todo
        )
      );
    }
    // Always cancel edit mode after attempting save
    cancelEdit();
  };

  const cancelEdit = (): void => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  // Handle Enter key press in edit input to save
  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleFilterChange = (newFilter: FilterType): void => {
    setFilter(newFilter);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const toggleDarkMode = (): void => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // --- Filtering and Searching Logic --- //

  const filteredTodos = todos.filter((todo) => {
    // Filter by status
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);

    // Filter by search term (case-insensitive)
    const matchesSearch = 
      searchTerm === '' ||
      todo.text.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // --- Render --- //

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appBackground}`}>
      {/* Header */}
      <header className="container-narrow py-4 md:py-6 flex-between theme-transition-bg">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 theme-transition-text">
          Minimalist To-Do
        </h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          role="switch"
          aria-checked={isDarkMode}
          name="theme-toggle"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-400 theme-transition-text" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 theme-transition-text" />
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container-narrow py-4 md:py-8">
        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6">
          <div className="form-group flex items-center gap-2">
            <input
              ref={newTodoInputRef}
              type="text"
              id="new-todo"
              name="new-todo"
              className="input-responsive flex-grow theme-transition-all" // Use responsive input
              placeholder="What needs to be done?"
              value={newTodoText}
              onChange={handleInputChange}
              aria-label="New todo input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex-shrink-0 theme-transition-all flex items-center justify-center gap-1"
              aria-label="Add new todo"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </form>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="form-group flex-grow relative">
            <label htmlFor="search-todo" className="sr-only">Search Todos</label>
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-slate-500" />
            </span>
            <input
              type="search"
              id="search-todo"
              name="search-todo"
              className="input-responsive pl-10 w-full theme-transition-all"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search todos"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-shrink-0">
             <span className="hidden sm:flex items-center text-sm text-gray-500 dark:text-slate-400 mr-2">
                <Filter className="w-4 h-4 mr-1"/> Filter:
             </span>
            {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => handleFilterChange(filterType)}
                className={`btn btn-sm capitalize theme-transition-all ${filter === filterType
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                aria-pressed={filter === filterType}
                name={`filter-${filterType}`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3" role="list">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                role="listitem"
                className={`card-responsive card-sm flex items-center gap-3 theme-transition-all ${todo.completed ? styles.completedTodo : ''}`}
              >
                {editingTodoId === todo.id ? (
                  // --- Edit Mode ---
                  <>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTodoText}
                      onChange={handleEditInputChange}
                      onKeyDown={handleEditKeyDown} // Handle Enter/Esc
                      onBlur={saveEdit} // Save on blur as well
                      className="input-responsive flex-grow theme-transition-all"
                      aria-label={`Edit todo text for ${todo.text}`}
                      name={`edit-input-${todo.id}`}
                    />
                    <button
                      onClick={saveEdit}
                      className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex-shrink-0 theme-transition-all"
                      aria-label={`Save changes for todo ${todo.text}`}
                      name={`save-button-${todo.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn btn-sm bg-gray-400 hover:bg-gray-500 text-white flex-shrink-0 theme-transition-all"
                      aria-label={`Cancel editing todo ${todo.text}`}
                      name={`cancel-button-${todo.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  // --- Display Mode ---
                  <>
                    <button
                        onClick={() => toggleComplete(todo.id)}
                        className={`flex-shrink-0 p-1 rounded-full border-2 ${todo.completed ? 'bg-primary-500 border-primary-500 hover:bg-primary-600' : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'} theme-transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800`}
                        aria-pressed={todo.completed}
                        aria-label={`Mark todo ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
                        name={`toggle-button-${todo.id}`}
                        role="checkbox"
                        aria-checked={todo.completed}
                    >
                        {/* Custom checkmark appearance */}
                        <span className={`block w-4 h-4 ${todo.completed ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                            <Check className="w-full h-full text-white" />
                        </span>
                        <span className={`block w-4 h-4 ${!todo.completed ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                            {/* Empty space for unchecked state */} 
                        </span>
                    </button>
                    <span
                      className={`flex-grow text-sm sm:text-base cursor-pointer truncate ${todo.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-800 dark:text-slate-100'} theme-transition-all`}
                      onClick={() => startEditing(todo)} // Allow clicking text to edit
                      title={todo.text} // Show full text on hover if truncated
                    >
                      {todo.text}
                    </span>
                    <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-slate-700 theme-transition-all"
                        aria-label={`Edit todo ${todo.text}`}
                        name={`edit-button-${todo.id}`}
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded hover:bg-red-100 dark:hover:bg-slate-700 theme-transition-all"
                        aria-label={`Delete todo ${todo.text}`}
                        name={`delete-button-${todo.id}`}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-10 theme-transition-text">
              {searchTerm || filter !== 'all' 
                ? 'No tasks match your current filter/search.' 
                : 'No tasks yet! Add one above.'}
            </div>
          )}
        </div>
      </main>

      {/* Footer */} 
      <footer className="py-4 text-center text-xs text-gray-500 dark:text-slate-400 theme-transition-all mt-auto">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
