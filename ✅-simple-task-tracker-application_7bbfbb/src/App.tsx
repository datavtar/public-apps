import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, X, Edit, Trash2, ChevronUp, ChevronDown, Sun, Moon, Filter, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import styles from './styles/styles.module.css';

// Define the Todo type
type TodoPriority = 'low' | 'medium' | 'high';
type TodoStatus = 'incomplete' | 'completed';

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: TodoPriority;
  dueDate: string;
  status: TodoStatus;
  createdAt: string;
  completedAt: string | null;
}

type SortKey = 'title' | 'priority' | 'dueDate' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Omit<Todo, 'id' | 'status' | 'createdAt' | 'completedAt'>>({ 
    title: '', 
    description: '', 
    priority: 'medium', 
    dueDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<TodoPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load todos from localStorage on initial render
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
    
    // Check for saved theme preference
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode === 'true' || (savedMode === null && prefersDark);
    
    setIsDarkMode(initialDarkMode);
  }, []);

  // Save todos to localStorage whenever the todos state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

  // Modal click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  // Filter and sort todos
  const filteredAndSortedTodos = todos
    .filter(todo => {
      // Apply search query filter
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           todo.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply priority filter
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      
      // Apply status filter
      const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortKey === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        const valueA = priorityValues[a.priority];
        const valueB = priorityValues[b.priority];
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (a[sortKey] < b[sortKey]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortKey] > b[sortKey]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Toggle sorting
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Add new todo
  const addTodo = () => {
    // Simple validation
    if (!newTodo.title.trim()) {
      alert('Title is required');
      return;
    }

    const currentTime = new Date().toISOString();
    const todo: Todo = {
      id: crypto.randomUUID(),
      ...newTodo,
      status: 'incomplete',
      createdAt: currentTime,
      completedAt: null
    };

    setTodos([...todos, todo]);
    resetNewTodo();
    closeModal();
  };

  // Reset new todo form
  const resetNewTodo = () => {
    setNewTodo({ 
      title: '', 
      description: '', 
      priority: 'medium', 
      dueDate: format(new Date(), 'yyyy-MM-dd')
    });
  };

  // Update existing todo
  const updateTodo = () => {
    if (!editTodo) return;
    
    // Simple validation
    if (!editTodo.title.trim()) {
      alert('Title is required');
      return;
    }

    setTodos(todos.map(todo => 
      todo.id === editTodo.id ? editTodo : todo
    ));
    
    setEditTodo(null);
    closeModal();
  };

  // Delete todo
  const deleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  // Toggle todo status
  const toggleTodoStatus = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const isCompleted = todo.status === 'completed';
        return {
          ...todo,
          status: isCompleted ? 'incomplete' : 'completed',
          completedAt: isCompleted ? null : new Date().toISOString()
        };
      }
      return todo;
    }));
  };

  // Open edit modal
  const openEditModal = (todo: Todo) => {
    setEditTodo(todo);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Open add modal
  const openAddModal = () => {
    setEditTodo(null);
    resetNewTodo();
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Priority badge class helper
  const getPriorityBadgeClass = (priority: TodoPriority): string => {
    switch (priority) {
      case 'high':
        return 'badge badge-error';
      case 'medium':
        return 'badge badge-warning';
      case 'low':
        return 'badge badge-info';
      default:
        return 'badge';
    }
  };

  // Get sorting icon
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="container-fluid min-h-screen pb-8 theme-transition">
      {/* Header */}
      <header className="sticky top-0 z-fixed bg-white dark:bg-slate-800 shadow-sm mb-6 py-4 theme-transition">
        <div className="container-wide">
          <div className="flex-between">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Task Manager</h1>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              {isDarkMode ? <Sun size={16} className="ml-6" /> : <Moon size={16} className="mr-6" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container-wide">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              className="input pl-10"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tasks"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-500 dark:text-slate-400" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500 dark:text-slate-400" />
              <select 
                className="input-sm py-1.5 border-gray-300"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as TodoPriority | 'all')}
                aria-label="Filter by priority"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-gray-500 dark:text-slate-400" />
              <select 
                className="input-sm py-1.5 border-gray-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TodoStatus | 'all')}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="incomplete">Incomplete</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button 
              className="btn btn-primary flex-none"
              onClick={openAddModal}
              aria-label="Add new task"
            >
              <Plus size={16} className="mr-1" /> Add Task
            </button>
          </div>
        </div>

        {/* Todo List */}
        {filteredAndSortedTodos.length > 0 ? (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-left">
                    <th className="w-10">Status</th>
                    <th 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-3" 
                      onClick={() => toggleSort('title')}
                    >
                      <div className="flex items-center">
                        <span>Title</span>
                        {getSortIcon('title')}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-3" 
                      onClick={() => toggleSort('priority')}
                    >
                      <div className="flex items-center">
                        <span>Priority</span>
                        {getSortIcon('priority')}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-3 hidden md:table-cell" 
                      onClick={() => toggleSort('dueDate')}
                    >
                      <div className="flex items-center">
                        <span>Due Date</span>
                        {getSortIcon('dueDate')}
                      </div>
                    </th>
                    <th className="w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTodos.map((todo) => (
                    <tr 
                      key={todo.id} 
                      className={`border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 ${todo.status === 'completed' ? 'bg-gray-50 dark:bg-slate-800' : ''}`}
                    >
                      <td className="p-3">
                        <button 
                          className={`flex-center h-6 w-6 rounded-full text-white ${todo.status === 'completed' ? 'bg-green-500' : 'border-2 border-gray-300'}`}
                          onClick={() => toggleTodoStatus(todo.id)}
                          aria-label={todo.status === 'completed' ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {todo.status === 'completed' && <Check size={14} />}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className={`${todo.status === 'completed' ? 'line-through text-gray-500 dark:text-slate-400' : ''}`}>
                          <div className="font-medium">{todo.title}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400 line-clamp-1">{todo.description}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={getPriorityBadgeClass(todo.priority)}>
                          {todo.priority}
                        </span>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-500 dark:text-slate-400" />
                          <span className="text-sm">
                            {todo.dueDate ? format(parseISO(todo.dueDate), 'MMM d, yyyy') : 'No date'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button 
                            className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                            onClick={() => openEditModal(todo)}
                            aria-label="Edit task"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                            onClick={() => deleteTodo(todo.id)}
                            aria-label="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card flex-center flex-col py-12">
            <div className={`${styles.emptyState} text-gray-400 dark:text-slate-500 mb-4`}>
              <Check size={40} />
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">
              {searchQuery || filterPriority !== 'all' || filterStatus !== 'all' ? 
                'No matching tasks found' : 
                'No tasks added yet'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-center mb-6">
              {searchQuery || filterPriority !== 'all' || filterStatus !== 'all' ? 
                'Try adjusting your filters or search query' : 
                'Create your first task to get started'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={openAddModal}
              aria-label="Add first task"
            >
              <Plus size={16} className="mr-1" /> Add Your First Task
            </button>
          </div>
        )}

        {/* Task Summary */}
        {todos.length > 0 && (
          <div className="mt-6">
            <div className="card p-4">
              <div className="flex flex-wrap gap-4 justify-between">
                <div className="stat-card flex-1 min-w-[180px]">
                  <div className="stat-title">Total Tasks</div>
                  <div className="stat-value">{todos.length}</div>
                </div>
                <div className="stat-card flex-1 min-w-[180px]">
                  <div className="stat-title">Completed</div>
                  <div className="stat-value">
                    {todos.filter(todo => todo.status === 'completed').length}
                  </div>
                </div>
                <div className="stat-card flex-1 min-w-[180px]">
                  <div className="stat-title">Pending</div>
                  <div className="stat-value">
                    {todos.filter(todo => todo.status === 'incomplete').length}
                  </div>
                </div>
                <div className="stat-card flex-1 min-w-[180px]">
                  <div className="stat-title">High Priority</div>
                  <div className="stat-value">
                    {todos.filter(todo => todo.priority === 'high').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Todo Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content animate-fade-in animate-slide-in md:w-[600px]"
          >
            <div className="modal-header">
              <h2 className="text-xl font-semibold" id="modal-title">
                {editTodo ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 mt-4">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title <span className="text-red-500">*</span></label>
                <input 
                  id="title"
                  type="text" 
                  className="input" 
                  placeholder="Task title"
                  value={editTodo ? editTodo.title : newTodo.title}
                  onChange={(e) => {
                    if (editTodo) {
                      setEditTodo({ ...editTodo, title: e.target.value });
                    } else {
                      setNewTodo({ ...newTodo, title: e.target.value });
                    }
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea 
                  id="description"
                  className="input min-h-[100px]" 
                  placeholder="Task description"
                  value={editTodo ? editTodo.description : newTodo.description}
                  onChange={(e) => {
                    if (editTodo) {
                      setEditTodo({ ...editTodo, description: e.target.value });
                    } else {
                      setNewTodo({ ...newTodo, description: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select 
                    id="priority"
                    className="input" 
                    value={editTodo ? editTodo.priority : newTodo.priority}
                    onChange={(e) => {
                      const value = e.target.value as TodoPriority;
                      if (editTodo) {
                        setEditTodo({ ...editTodo, priority: value });
                      } else {
                        setNewTodo({ ...newTodo, priority: value });
                      }
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input 
                    id="dueDate"
                    type="date" 
                    className="input" 
                    value={editTodo ? editTodo.dueDate : newTodo.dueDate}
                    onChange={(e) => {
                      if (editTodo) {
                        setEditTodo({ ...editTodo, dueDate: e.target.value });
                      } else {
                        setNewTodo({ ...newTodo, dueDate: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                onClick={closeModal}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={editTodo ? updateTodo : addTodo}
                aria-label={editTodo ? 'Save changes' : 'Add task'}
              >
                {editTodo ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-gray-500 dark:text-slate-400 text-sm">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

// Define Search icon component
const Search: React.FC<{ size: number, className?: string }> = ({ size, className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
};

export default App;