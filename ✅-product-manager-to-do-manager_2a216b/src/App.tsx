import React, { useState, useEffect, useRef } from 'react';
import { Check, Clock, Edit, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface FilterOptions {
  status: string;
  priority: string;
  searchQuery: string;
  tag: string;
}

const App: React.FC = () => {
  // State management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    searchQuery: '',
    tag: 'all'
  });
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Default todo template
  const defaultTodo: Todo = {
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '',
    updatedAt: '',
    tags: []
  };

  // Sample data for initial load
  const sampleTodos: Todo[] = [
    {
      id: '1',
      title: 'Create product roadmap',
      description: 'Outline the product strategy and timeline for Q3',
      priority: 'high',
      status: 'in-progress',
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
      })(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['strategy', 'planning']
    },
    {
      id: '2',
      title: 'Review competitor analysis',
      description: 'Review the competitive landscape and identify opportunities',
      priority: 'medium',
      status: 'pending',
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date.toISOString().split('T')[0];
      })(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['research', 'competition']
    },
    {
      id: '3',
      title: 'User interview preparation',
      description: 'Prepare questions for upcoming user interviews',
      priority: 'medium',
      status: 'completed',
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
      })(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['research', 'users']
    },
    {
      id: '4',
      title: 'Sprint planning meeting',
      description: 'Prepare agenda for sprint planning with development team',
      priority: 'high',
      status: 'pending',
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
      })(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['meeting', 'development']
    },
    {
      id: '5',
      title: 'Update product metrics dashboard',
      description: 'Add new KPIs to the product metrics dashboard',
      priority: 'low',
      status: 'pending',
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date.toISOString().split('T')[0];
      })(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['analytics', 'reporting']
    }
  ];

  // Load todos from localStorage or use sample data if none exists
  useEffect(() => {
    // Load dark mode preference
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
    if (storedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load todos
    const storedTodos = localStorage.getItem('productManagerTodos');
    setTimeout(() => { // Simulate loading for UI feedback
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      } else {
        setTodos(sampleTodos);
        localStorage.setItem('productManagerTodos', JSON.stringify(sampleTodos));
      }
      setLoading(false);
    }, 500);

    // Listen for Escape key to close modal
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('productManagerTodos', JSON.stringify(todos));
    }
  }, [todos, loading]);

  // Focus title input when modal opens
  useEffect(() => {
    if (showModal && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showModal]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  // Filter todos based on filter options
  const filteredTodos = todos.filter((todo) => {
    const matchesStatus = filterOptions.status === 'all' || todo.status === filterOptions.status;
    const matchesPriority = filterOptions.priority === 'all' || todo.priority === filterOptions.priority;
    const matchesSearch = todo.title.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) || 
                         todo.description.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
    const matchesTag = filterOptions.tag === 'all' || (todo.tags && todo.tags.includes(filterOptions.tag));

    return matchesStatus && matchesPriority && matchesSearch && matchesTag;
  });

  // Sort todos by due date and then by priority
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Sort by due date (closest first)
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    const dateDiff = dateA - dateB;

    // If dates are the same, sort by priority
    if (dateDiff === 0) {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    }

    return dateDiff;
  });

  // Get all unique tags from todos
  const allTags = [...new Set(todos.flatMap(todo => todo.tags || []))];

  // Add or update a todo
  const handleSaveTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high';
    const status = formData.get('status') as 'pending' | 'in-progress' | 'completed';
    const dueDate = formData.get('dueDate') as string;
    const tagsString = formData.get('tags') as string;
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);

    const now = new Date().toISOString();
    const updatedTodo: Todo = {
      id: currentTodo?.id || Date.now().toString(),
      title,
      description,
      priority,
      status,
      dueDate,
      createdAt: currentTodo?.createdAt || now,
      updatedAt: now,
      tags
    };

    if (isEditing) {
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
      );
    } else {
      setTodos(prevTodos => [...prevTodos, updatedTodo]);
    }

    // Close modal and reset form
    setShowModal(false);
    setCurrentTodo(null);
    setIsEditing(false);
  };

  // Delete a todo
  const handleDeleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    }
  };

  // Edit a todo
  const handleEditTodo = (todo: Todo) => {
    setCurrentTodo(todo);
    setIsEditing(true);
    setShowModal(true);
  };

  // Add a new todo
  const handleAddTodo = () => {
    setCurrentTodo({...defaultTodo, id: Date.now().toString()});
    setIsEditing(false);
    setShowModal(true);
  };

  // Update filter options
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle modal click outside
  const handleModalClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  // Format date for UI
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if a todo is overdue
  const isOverdue = (todo: Todo): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.dueDate);
    return todo.status !== 'completed' && dueDate < today;
  };

  // Check if a todo is due today
  const isDueToday = (todo: Todo): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return todo.status !== 'completed' && dueDate.getTime() === today.getTime();
  };

  // Render priority badge
  const renderPriorityBadge = (priority: string) => {
    const colorMap = {
      low: 'badge-info',
      medium: 'badge-warning',
      high: 'badge-error'
    };
    return (
      <span className={`badge ${colorMap[priority as keyof typeof colorMap]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colorMap = {
      'pending': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'in-progress': 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'completed': 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    const displayText = status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className={`badge ${colorMap[status as keyof typeof colorMap]}`}>
        {displayText}
      </span>
    );
  };

  // Get counts for the dashboard
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.status === 'completed').length;
  const inProgressTodos = todos.filter(todo => todo.status === 'in-progress').length;
  const pendingTodos = todos.filter(todo => todo.status === 'pending').length;
  const overdueTodos = todos.filter(isOverdue).length;
  const dueTodayTodos = todos.filter(isDueToday).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <Check className="text-primary-600 dark:text-primary-400" size={28} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ProductManager Tasks</h1>
            </div>
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle" 
              aria-label="Toggle dark mode"
            >
              <span className="theme-toggle-thumb"></span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid py-6">
        {/* Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="stat-card bg-white dark:bg-slate-800">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value">{totalTodos}</div>
          </div>
          <div className="stat-card bg-white dark:bg-slate-800">
            <div className="stat-title">Completed</div>
            <div className="stat-value text-green-600 dark:text-green-400">{completedTodos}</div>
          </div>
          <div className="stat-card bg-white dark:bg-slate-800">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-blue-600 dark:text-blue-400">{inProgressTodos}</div>
          </div>
          <div className="stat-card bg-white dark:bg-slate-800">
            <div className="stat-title">Pending</div>
            <div className="stat-value text-gray-600 dark:text-gray-400">{pendingTodos}</div>
          </div>
          <div className="stat-card bg-white dark:bg-slate-800">
            <div className="stat-title">Overdue</div>
            <div className="stat-value text-red-600 dark:text-red-400">{overdueTodos}</div>
          </div>
          <div className="stat-card bg-white dark:bg-slate-800">
            <div className="stat-title">Due Today</div>
            <div className="stat-value text-yellow-600 dark:text-yellow-400">{dueTodayTodos}</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="form-group mb-0 flex-1">
                <label htmlFor="status-filter" className="form-label sr-only">Status</label>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                  <select
                    id="status-filter"
                    name="status"
                    value={filterOptions.status}
                    onChange={handleFilterChange}
                    className="input input-sm flex-1"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group mb-0 flex-1">
                <label htmlFor="priority-filter" className="form-label sr-only">Priority</label>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                  <select
                    id="priority-filter"
                    name="priority"
                    value={filterOptions.priority}
                    onChange={handleFilterChange}
                    className="input input-sm flex-1"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              {allTags.length > 0 && (
                <div className="form-group mb-0 flex-1">
                  <label htmlFor="tag-filter" className="form-label sr-only">Tag</label>
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                    <select
                      id="tag-filter"
                      name="tag"
                      value={filterOptions.tag}
                      onChange={handleFilterChange}
                      className="input input-sm flex-1"
                    >
                      <option value="all">All Tags</option>
                      {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="form-group mb-0 md:w-64">
              <label htmlFor="search" className="form-label sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  name="searchQuery"
                  value={filterOptions.searchQuery}
                  onChange={handleFilterChange}
                  placeholder="Search tasks..."
                  className="input input-sm pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredTodos.length} of {todos.length} tasks
            </p>
            <button
              onClick={handleAddTodo}
              className="btn btn-primary btn-sm flex items-center gap-2"
              aria-label="Add new task"
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedTodos.length > 0 ? (
          <div className="space-y-4">
            {sortedTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 md:p-6 border-l-4 ${isOverdue(todo) ? 'border-red-500' : isDueToday(todo) ? 'border-yellow-500' : 'border-transparent'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{todo.title}</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{todo.description}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {renderPriorityBadge(todo.priority)}
                      {renderStatusBadge(todo.status)}
                      <span className={`badge flex items-center ${isOverdue(todo) ? 'badge-error' : isDueToday(todo) ? 'badge-warning' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        <Clock size={12} className="mr-1" />
                        {formatDate(todo.dueDate)}
                      </span>
                      {todo.tags && todo.tags.map(tag => (
                        <span key={tag} className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                      aria-label={`Edit ${todo.title}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 flex items-center justify-center"
                      aria-label={`Delete ${todo.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Add a new task or adjust your filters.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-4 mt-auto">
        <div className="container-fluid">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal for add/edit todo */}
      {showModal && (
        <div 
          className="modal-backdrop theme-transition-all" 
          onClick={handleModalClickOutside}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <div 
            ref={modalRef} 
            className="modal-content w-full max-w-lg theme-transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="task-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveTodo}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={currentTodo?.title || ''}
                    required
                    className="input"
                    placeholder="Task title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={currentTodo?.description || ''}
                    className="input h-24"
                    placeholder="Task description"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      defaultValue={currentTodo?.priority || 'medium'}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={currentTodo?.status || 'pending'}
                      className="input"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    defaultValue={currentTodo?.dueDate || defaultTodo.dueDate}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tags" className="form-label">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    defaultValue={currentTodo?.tags?.join(', ') || ''}
                    className="input"
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    E.g. meeting, planning, research
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditing ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;