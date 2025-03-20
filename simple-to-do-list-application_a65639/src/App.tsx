import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit, X, Plus, Sun, Moon, Search } from 'lucide-react';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';

type TodoPriority = 'low' | 'medium' | 'high';
type TodoStatus = 'pending' | 'completed';

interface Todo {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  priority: TodoPriority;
  status: TodoStatus;
}

const App: React.FC = () => {
  // State management
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        return JSON.parse(savedTodos, (key, value) => {
          if (key === 'createdAt') return new Date(value);
          return value;
        });
      } catch (e) {
        console.error('Error parsing todos from localStorage:', e);
        return [];
      }
    }
    return [];
  });

  const [newTodo, setNewTodo] = useState<Omit<Todo, 'id' | 'createdAt' | 'status'>>({ 
    title: '', 
    description: '', 
    priority: 'medium' 
  });
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<TodoPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Event handlers
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const validateTodoForm = (todo: { title: string; description: string }): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!todo.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (todo.title.length > 50) {
      newErrors.title = 'Title must be less than 50 characters';
    }
    
    if (todo.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    
    return newErrors;
  };

  const handleAddTodo = () => {
    setIsValidating(true);
    const validationErrors = validateTodoForm(newTodo);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      const newTodoItem: Todo = {
        id: crypto.randomUUID(),
        ...newTodo,
        createdAt: new Date(),
        status: 'pending'
      };
      
      setTodos(prevTodos => [...prevTodos, newTodoItem]);
      setNewTodo({ title: '', description: '', priority: 'medium' });
      setShowAddForm(false);
      setIsValidating(false);
    }
  };

  const handleUpdateTodo = () => {
    if (!editingTodo) return;
    
    setIsValidating(true);
    const validationErrors = validateTodoForm(editingTodo);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === editingTodo.id ? editingTodo : todo
        )
      );
      setEditingTodo(null);
      setIsValidating(false);
    }
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id 
          ? { ...todo, status: todo.status === 'completed' ? 'pending' : 'completed' } 
          : todo
      )
    );
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setErrors({});
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewTodo({ title: '', description: '', priority: 'medium' });
    setErrors({});
  };

  // Derived data
  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? a.createdAt.getTime() - b.createdAt.getTime() 
          : b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        const priorityValues = { 'low': 1, 'medium': 2, 'high': 3 };
        return sortOrder === 'asc' 
          ? priorityValues[a.priority] - priorityValues[b.priority] 
          : priorityValues[b.priority] - priorityValues[a.priority];
      }
    });

  const getPriorityBadgeClasses = (priority: TodoPriority) => {
    switch (priority) {
      case 'high': return 'badge badge-error';
      case 'medium': return 'badge badge-warning';
      case 'low': return 'badge badge-info';
      default: return 'badge';
    }
  };

  // Render functions
  const renderAddTodoForm = () => (
    <div className="card mb-8 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Task</h3>
        <button 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleCancelAdd}
          aria-label="Cancel adding todo"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="form-group">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          id="title"
          type="text"
          value={newTodo.title}
          onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
          className={`input ${isValidating && errors.title ? 'border-red-500' : ''}`}
          placeholder="What needs to be done?"
          aria-invalid={!!errors.title}
          name="title"
          role="textbox"
        />
        {isValidating && errors.title && (
          <p className="form-error" role="alert">{errors.title}</p>
        )}
      </div>
      
      <div className="form-group mt-4">
        <label htmlFor="description" className="form-label">Description (optional)</label>
        <textarea
          id="description"
          value={newTodo.description}
          onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
          className={`input h-24 ${isValidating && errors.description ? 'border-red-500' : ''}`}
          placeholder="Add details about your task"
          aria-invalid={!!errors.description}
          name="description"
          role="textbox"
        />
        {isValidating && errors.description && (
          <p className="form-error" role="alert">{errors.description}</p>
        )}
      </div>
      
      <div className="form-group mt-4">
        <label htmlFor="priority" className="form-label">Priority</label>
        <select
          id="priority"
          value={newTodo.priority}
          onChange={e => setNewTodo({ ...newTodo, priority: e.target.value as TodoPriority })}
          className="input"
          name="priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div className="modal-footer mt-6">
        <button 
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={handleCancelAdd}
          role="button"
          name="cancel"
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary ml-4"
          onClick={handleAddTodo}
          role="button"
          name="add"
        >
          Add Task
        </button>
      </div>
    </div>
  );

  const renderEditTodoForm = () => {
    if (!editingTodo) return null;
    
    return (
      <div className="card mb-8 fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={handleCancelEdit}
            aria-label="Cancel editing todo"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="edit-title" className="form-label">Title</label>
          <input
            id="edit-title"
            type="text"
            value={editingTodo.title}
            onChange={e => setEditingTodo({ ...editingTodo, title: e.target.value })}
            className={`input ${isValidating && errors.title ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.title}
            name="edit-title"
            role="textbox"
          />
          {isValidating && errors.title && (
            <p className="form-error" role="alert">{errors.title}</p>
          )}
        </div>
        
        <div className="form-group mt-4">
          <label htmlFor="edit-description" className="form-label">Description (optional)</label>
          <textarea
            id="edit-description"
            value={editingTodo.description}
            onChange={e => setEditingTodo({ ...editingTodo, description: e.target.value })}
            className={`input h-24 ${isValidating && errors.description ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.description}
            name="edit-description"
            role="textbox"
          />
          {isValidating && errors.description && (
            <p className="form-error" role="alert">{errors.description}</p>
          )}
        </div>
        
        <div className="form-group mt-4">
          <label htmlFor="edit-priority" className="form-label">Priority</label>
          <select
            id="edit-priority"
            value={editingTodo.priority}
            onChange={e => setEditingTodo({ ...editingTodo, priority: e.target.value as TodoPriority })}
            className="input"
            name="edit-priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="form-group mt-4">
          <label htmlFor="edit-status" className="form-label">Status</label>
          <select
            id="edit-status"
            value={editingTodo.status}
            onChange={e => setEditingTodo({ ...editingTodo, status: e.target.value as TodoStatus })}
            className="input"
            name="edit-status"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="modal-footer mt-6">
          <button 
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={handleCancelEdit}
            role="button"
            name="cancel-edit"
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary ml-4"
            onClick={handleUpdateTodo}
            role="button"
            name="update"
          >
            Update Task
          </button>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="filters-container p-4 rounded-lg bg-white dark:bg-gray-800 shadow mb-6 theme-transition">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-10"
              placeholder="Search tasks..."
              aria-label="Search tasks"
              name="search"
              role="searchbox"
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as TodoPriority | 'all')}
            className="input"
            aria-label="Filter by priority"
            name="filter-priority"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as TodoStatus | 'all')}
            className="input"
            aria-label="Filter by status"
            name="filter-status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="md:col-span-3">
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'priority')}
              className="input w-1/2"
              aria-label="Sort by"
              name="sort-by"
            >
              <option value="date">Date</option>
              <option value="priority">Priority</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="input w-1/2"
              aria-label="Sort order"
              name="sort-order"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTodoList = () => {
    if (filteredAndSortedTodos.length === 0) {
      return (
        <div className="card text-center py-16 fade-in">
          <div className="flex flex-col items-center">
            <div className={styles.emptyStateIcon}></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {todos.length === 0
                ? "You don't have any tasks yet. Add one to get started!"
                : "No tasks match your current filters."}
            </p>
            {todos.length > 0 && (
              <button 
                className="btn btn-secondary mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setFilterPriority('all');
                  setFilterStatus('all');
                }}
                role="button"
                name="clear-filters"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredAndSortedTodos.map(todo => (
          <div 
            key={todo.id} 
            className={`card-responsive ${todo.status === 'completed' ? 'border-l-4 border-green-500' : ''} ${styles.todoCard} fade-in`}
          >
            <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
              <div className="flex items-start md:items-center flex-1 gap-3">
                <button 
                  className={`${styles.checkButton} ${todo.status === 'completed' ? styles.checked : ''}`}
                  onClick={() => handleToggleStatus(todo.id)}
                  aria-label={todo.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  role="checkbox"
                  name="toggle-status"
                  aria-checked={todo.status === 'completed'}
                >
                  {todo.status === 'completed' && <Check size={16} />}
                </button>
                
                <div className="flex-1">
                  <h3 
                    className={`text-base sm:text-lg font-medium ${todo.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}
                  >
                    {todo.title}
                  </h3>
                  
                  {todo.description && (
                    <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${todo.status === 'completed' ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-2 space-x-3 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {format(todo.createdAt, 'MMM d, yyyy')}
                    </span>
                    <span className={getPriorityBadgeClasses(todo.priority)}>
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                    <span className={`badge ${todo.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 w-full md:w-auto">
                <button 
                  className="btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex-1 md:flex-none"
                  onClick={() => setEditingTodo(todo)}
                  aria-label={`Edit ${todo.title}`}
                  role="button"
                  name="edit"
                >
                  <Edit size={16} className="inline mr-1" /> Edit
                </button>
                <button 
                  className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 flex-1 md:flex-none"
                  onClick={() => handleDeleteTodo(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                  role="button"
                  name="delete"
                >
                  <Trash2 size={16} className="inline mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="container-fluid py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            My Todo App
          </h1>
          <button 
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition"
            onClick={handleToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={isDarkMode}
            name="theme-toggle"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container-narrow py-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value">{todos.length}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Pending</div>
            <div className="stat-value">{todos.filter(t => t.status === 'pending').length}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Completed</div>
            <div className="stat-value">{todos.filter(t => t.status === 'completed').length}</div>
          </div>
        </div>
        
        {/* Add todo button */}
        {!showAddForm && !editingTodo && (
          <button 
            className={`btn btn-primary w-full mb-6 ${styles.addButton}`}
            onClick={() => setShowAddForm(true)}
            aria-label="Add a new task"
            role="button"
            name="show-add-form"
          >
            <Plus size={20} className="mr-2" /> Add New Task
          </button>
        )}
        
        {/* Forms */}
        {showAddForm && renderAddTodoForm()}
        {editingTodo && renderEditTodoForm()}
        
        {/* Filters */}
        {(todos.length > 0 || searchTerm || filterPriority !== 'all' || filterStatus !== 'all') && renderFilters()}
        
        {/* Todo list */}
        {renderTodoList()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner theme-transition py-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;