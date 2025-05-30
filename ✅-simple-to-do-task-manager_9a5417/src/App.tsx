import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Sun, Moon, Plus, Edit, Trash2, Search, Filter, ArrowDownUp, Check, X, Calendar, AlertTriangle, ChevronUp, ChevronDown, List, ListChecks, ListX } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  priority: Priority;
}

type Priority = 'low' | 'medium' | 'high';

type FilterType = 'all' | 'active' | 'completed';

type SortType = 'createdAt_asc' | 'createdAt_desc' | 'dueDate_asc' | 'dueDate_desc' | 'priority_asc' | 'priority_desc';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [newTodoDueDate, setNewTodoDueDate] = useState<string>('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortType>('createdAt_desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editModalText, setEditModalText] = useState<string>('');
  const [editModalDueDate, setEditModalDueDate] = useState<string>('');
  const [editModalPriority, setEditModalPriority] = useState<Priority>('medium');

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Initial sample data
  const initialTodos: Todo[] = [
    {
      id: '1',
      text: 'Complete project proposal',
      completed: false,
      createdAt: Date.now() - 86400000 * 2, // 2 days ago
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
      priority: 'high',
    },
    {
      id: '2',
      text: 'Buy groceries',
      completed: true,
      createdAt: Date.now() - 86400000, // 1 day ago
      priority: 'medium',
    },
    {
      id: '3',
      text: 'Read a book chapter',
      completed: false,
      createdAt: Date.now(),
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 1 week from now
      priority: 'low',
    },
  ];

  // Load todos from localStorage
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      setTodos(initialTodos); // Load initial sample data if nothing in localStorage
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Modal Escape key listener
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEditModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: newTodoDueDate || undefined,
      priority: newTodoPriority,
    };
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
    setNewTodoDueDate('');
    setNewTodoPriority('medium');
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setEditModalText(todo.text);
    setEditModalDueDate(todo.dueDate || '');
    setEditModalPriority(todo.priority);
    document.body.classList.add('modal-open');
    setTimeout(() => editInputRef.current?.focus(), 0); 
  };

  const closeEditModal = () => {
    setEditingTodo(null);
    document.body.classList.remove('modal-open');
  };

  const handleEditTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTodo || editModalText.trim() === '') return;
    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id
          ? { 
              ...todo, 
              text: editModalText.trim(), 
              dueDate: editModalDueDate || undefined,
              priority: editModalPriority,
            }
          : todo
      )
    );
    closeEditModal();
  };

  const priorityOrder: Record<Priority, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const filteredAndSortedTodos = todos
    .filter((todo) => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter((todo) =>
      todo.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
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
        case 'priority_asc': return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'priority_desc': return priorityOrder[b.priority] - priorityOrder[a.priority];
        default: return 0;
      }
    });

  const getPriorityBadgeColor = (priority: Priority): string => {
    switch (priority) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-info';
      default: return 'badge-info';
    }
  };
  
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <ChevronUp size={16} className="text-yellow-500" />;
      case 'low': return <ChevronDown size={16} className="text-blue-500" />;
      default: return null;
    }
  }

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''} bg-bg-secondary dark:bg-slate-900`}>
      <header className="bg-bg-primary dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-wide py-4 flex-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">My To-Do List</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-slate-300">Light</span>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>
            <span className="text-sm text-gray-600 dark:text-slate-300">Dark</span>
            {isDarkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-yellow-500" />}
          </div>
        </div>
      </header>

      <main className="container-wide flex-grow py-6 sm:py-8">
        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="card card-responsive mb-6 sm:mb-8 fade-in">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-100">Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="form-group lg:col-span-2">
              <label htmlFor="newTodoText" className="form-label">Task Description</label>
              <input
                id="newTodoText"
                type="text"
                ref={inputRef}
                value={newTodoText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
                placeholder="What needs to be done?"
                className="input input-responsive"
                aria-label="New task description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newTodoDueDate" className="form-label">Due Date (Optional)</label>
              <input
                id="newTodoDueDate"
                type="date"
                value={newTodoDueDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodoDueDate(e.target.value)}
                className="input input-responsive"
                aria-label="New task due date"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newTodoPriority" className="form-label">Priority</label>
              <select
                id="newTodoPriority"
                value={newTodoPriority}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewTodoPriority(e.target.value as Priority)}
                className="input input-responsive"
                aria-label="New task priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-responsive mt-4 w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus size={20} /> Add Task
          </button>
        </form>

        {/* Filters and Sort */}
        <div className="card card-responsive mb-6 sm:mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="form-group">
              <label htmlFor="searchTerm" className="form-label">Search Tasks</label>
              <div className="relative">
                <input
                  id="searchTerm"
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="input input-responsive pl-10"
                  aria-label="Search tasks"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="filter" className="form-label">Filter By</label>
              <div className="relative">
                <select
                  id="filter"
                  value={filter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as FilterType)}
                  className="input input-responsive pl-10"
                  aria-label="Filter tasks"
                >
                  <option value="all">All Tasks</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sortOrder" className="form-label">Sort By</label>
              <div className="relative">
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as SortType)}
                  className="input input-responsive pl-10"
                  aria-label="Sort tasks"
                >
                  <option value="createdAt_desc">Date Created (Newest)</option>
                  <option value="createdAt_asc">Date Created (Oldest)</option>
                  <option value="dueDate_asc">Due Date (Asc)</option>
                  <option value="dueDate_desc">Due Date (Desc)</option>
                  <option value="priority_desc">Priority (High-Low)</option>
                  <option value="priority_asc">Priority (Low-High)</option>
                </select>
                <ArrowDownUp size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              </div>
            </div>
            <div className="form-group flex items-end">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                    Showing {filteredAndSortedTodos.length} of {todos.length} tasks.
                </p>
            </div>
          </div>
        </div>

        {/* Todo List */}
        {filteredAndSortedTodos.length === 0 && (
          <div className="card card-responsive text-center py-8 fade-in" style={{ animationDelay: '0.2s' }}>
            <ListX size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
            <p className="text-gray-600 dark:text-slate-400">
              {searchTerm ? 'No tasks match your search.' : (filter !== 'all' ? 'No tasks match your filter.' : 'No tasks yet! Add one above.')}
            </p>
          </div>
        )}
        <ul className="space-y-3">
          {filteredAndSortedTodos.map((todo, index) => (
            <li
              key={todo.id}
              className={`card card-sm flex items-center justify-between p-3 sm:p-4 theme-transition fade-in ${styles.todoItem}`}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              <div className="flex items-center flex-grow min-w-0">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`mr-3 sm:mr-4 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-700 ${todo.completed ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' : 'border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 focus:ring-primary-500'}`}
                  aria-pressed={todo.completed}
                  aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {todo.completed ? <Check size={18} className="text-white" /> : <span className="block w-[18px] h-[18px]"></span>}
                </button>
                <div className="flex-grow min-w-0">
                  <span
                    className={`block text-sm sm:text-base text-gray-800 dark:text-slate-100 break-words ${todo.completed ? 'line-through text-gray-500 dark:text-slate-500' : ''}`}
                  >
                    {todo.text}
                  </span>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {getPriorityIcon(todo.priority)}
                    <span className={`badge ${getPriorityBadgeColor(todo.priority)} capitalize`}>{todo.priority}</span>
                    {todo.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2 ml-2">
                <button
                  onClick={() => openEditModal(todo)}
                  className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white p-2 flex items-center justify-center"
                  aria-label={`Edit task: ${todo.text}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="btn btn-sm bg-red-500 hover:bg-red-600 text-white p-2 flex items-center justify-center"
                  aria-label={`Delete task: ${todo.text}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Stats Cards - Example */}
        {todos.length > 0 && (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="stat-card">
                    <div className="stat-title flex items-center gap-2"><List size={16}/>Total Tasks</div>
                    <div className="stat-value">{todos.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title flex items-center gap-2"><ListChecks size={16}/>Completed</div>
                    <div className="stat-value">{todos.filter(t => t.completed).length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title flex items-center gap-2"><ListX size={16}/>Pending</div>
                    <div className="stat-value">{todos.filter(t => !t.completed).length}</div>
                </div>
            </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingTodo && (
        <div
          className="modal-backdrop fade-in"
          onClick={closeEditModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div className="modal-content slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
              <button 
                onClick={closeEditModal} 
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full" 
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditTodo}>
              <div className="form-group">
                <label htmlFor="editModalText" className="form-label">Task Description</label>
                <input
                  id="editModalText"
                  type="text"
                  ref={editInputRef}
                  value={editModalText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditModalText(e.target.value)}
                  className="input input-responsive"
                  aria-label="Edit task description"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editModalDueDate" className="form-label">Due Date (Optional)</label>
                <input
                  id="editModalDueDate"
                  type="date"
                  value={editModalDueDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditModalDueDate(e.target.value)}
                  className="input input-responsive"
                  aria-label="Edit task due date"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editModalPriority" className="form-label">Priority</label>
                <select
                  id="editModalPriority"
                  value={editModalPriority}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditModalPriority(e.target.value as Priority)}
                  className="input input-responsive"
                  aria-label="Edit task priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center justify-center gap-2"
                  aria-label="Save changes"
                >
                  <Check size={20} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-bg-primary dark:bg-slate-800 text-center py-4 mt-auto theme-transition">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
