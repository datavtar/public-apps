import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, Edit, Check, X, Search, Sun, Moon, Filter as FilterIcon, SortAsc, SortDesc } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Filter = 'all' | 'active' | 'completed';
type Sort = 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc';

function App() {
  // State
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('date-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Event Handlers
  const handleAddTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = newTodoText.trim();
    if (!trimmedText) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prevTodos => [newTodo, ...prevTodos]);
    setNewTodoText('');
  };

  const handleToggleComplete = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    if (editingTodoId === id) {
        setEditingTodoId(null);
        setEditingTodoText('');
    }
  }, [editingTodoId]);

  const handleStartEdit = useCallback((todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTodoId(null);
    setEditingTodoText('');
  }, []);

  const handleUpdateTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = editingTodoText.trim();
    if (!trimmedText || !editingTodoId) return;
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === editingTodoId ? { ...todo, text: trimmedText } : todo
      )
    );
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: Sort) => {
    setSort(newSort);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Derived State: Filtered and Sorted Todos
  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        switch (filter) {
          case 'active':
            return !todo.completed;
          case 'completed':
            return todo.completed;
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => {
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
  }, [todos, filter, sort, searchQuery]);

  // Theme Toggle Component Logic
  const ThemeToggle = () => (
    <button
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-wide mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">Minimal To-Do</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow mx-auto px-4 py-6 sm:py-8">
        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6 sm:mb-8">
          <div className="form-group flex items-center gap-2 sm:gap-3">
            <label htmlFor="new-todo" className="sr-only">Add new todo</label>
            <input
              id="new-todo"
              name="new-todo"
              type="text"
              className="input flex-grow input-responsive"
              placeholder="What needs to be done?"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              aria-label="New todo input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex-shrink-0"
              aria-label="Add todo"
            >
              <Plus size={20} className="sm:mr-1" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </form>

        {/* Filter, Sort, Search Controls */}
        <div className="mb-6 sm:mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow card-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Search */}
            <div className="form-group">
                <label htmlFor="search-todo" className="form-label sr-only">Search Todos</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        id="search-todo"
                        name="search-todo"
                        type="search"
                        className="input input-responsive w-full pl-10"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        aria-label="Search todos"
                    />
                </div>
            </div>

            {/* Filter */}
            <div className="form-group">
              <label htmlFor="filter-select" className="form-label sr-only">Filter Todos</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon size={18} className="text-gray-400 dark:text-gray-500" />
                 </div>
                 <select
                    id="filter-select"
                    name="filter-select"
                    className="input input-responsive w-full appearance-none pl-10"
                    value={filter}
                    onChange={(e) => handleFilterChange(e.target.value as Filter)}
                    aria-label="Filter todos"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
            </div>

            {/* Sort */}
            <div className="form-group">
              <label htmlFor="sort-select" className="form-label sr-only">Sort Todos</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {sort.includes('asc') ? <SortAsc size={18} className="text-gray-400 dark:text-gray-500" /> : <SortDesc size={18} className="text-gray-400 dark:text-gray-500"/>}
                 </div>
                 <select
                    id="sort-select"
                    name="sort-select"
                    className="input input-responsive w-full appearance-none pl-10"
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value as Sort)}
                    aria-label="Sort todos"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="alpha-asc">Alphabetical (A-Z)</option>
                    <option value="alpha-desc">Alphabetical (Z-A)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAndSortedTodos.map(todo => (
            <li key={todo.id} className="py-3 sm:py-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {/* Checkbox */}
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id={`todo-${todo.id}`}
                    className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.id)}
                  />
                </div>
                {/* Todo Text */}
                <div className="flex-1 min-w-0">
                  {editingTodoId === todo.id ? (
                    <form onSubmit={handleUpdateTodo}>
                      <input
                        type="text"
                        value={editingTodoText}
                        onChange={(e) => setEditingTodoText(e.target.value)}
                        onBlur={handleCancelEdit}
                        className="input input-responsive"
                      />
                    </form>
                  ) : (
                    <label htmlFor={`todo-${todo.id}`} className={`block text-sm font-medium text-gray-900 dark:text-white ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                      {todo.text}
                    </label>
                  )}
                </div>

                {/* Actions */}
                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                  {editingTodoId === todo.id ? (
                    <>
                      <button onClick={handleUpdateTodo} aria-label="Save todo" className="btn btn-icon">
                        <Check size={16} />
                      </button>
                      <button onClick={handleCancelEdit} aria-label="Cancel edit" className="btn btn-icon">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleStartEdit(todo)} aria-label="Edit todo" className="btn btn-icon">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteTodo(todo.id)} aria-label="Delete todo" className="btn btn-icon">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner theme-transition">
        <div className="container-wide mx-auto px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;