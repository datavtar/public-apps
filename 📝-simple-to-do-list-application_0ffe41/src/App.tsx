import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, CheckCircle2, Circle, Search, Sun, Moon, Filter } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our to-do items
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  category: string;
}

type FilterStatus = 'all' | 'active' | 'completed';
type SortOption = 'newest' | 'oldest' | 'alphabetical';

const App: React.FC = () => {
  // State for todos and UI
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [newTodoCategory, setNewTodoCategory] = useState<string>('personal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchText, setSearchText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Categories for todo items
  const categories = [
    { id: 'personal', name: 'Personal' },
    { id: 'work', name: 'Work' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'health', name: 'Health' },
    { id: 'education', name: 'Education' }
  ];

  // Load todos from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error parsing todos from localStorage:', error);
        setTodos([]);
      }
    } else {
      // Set default sample todos if none exist
      const sampleTodos: Todo[] = [
        {
          id: '1',
          text: 'Complete React TypeScript project',
          completed: false,
          createdAt: new Date().toISOString(),
          category: 'work'
        },
        {
          id: '2',
          text: 'Buy groceries for the week',
          completed: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          category: 'shopping'
        },
        {
          id: '3',
          text: 'Go for a 30-minute walk',
          completed: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          category: 'health'
        }
      ];
      setTodos(sampleTodos);
      localStorage.setItem('todos', JSON.stringify(sampleTodos));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Add a new todo
  const addTodo = () => {
    if (newTodoText.trim() === '') return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      createdAt: new Date().toISOString(),
      category: newTodoCategory
    };
    
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
  };

  // Update a todo's completion status
  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Start editing a todo
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  // Save edited todo
  const saveEdit = () => {
    if (editingId && editText.trim() !== '') {
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, text: editText } : todo
      ));
      setEditingId(null);
      setEditText('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Handle keypresses in the new todo input
  const handleNewTodoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  // Handle keypresses in the edit todo input
  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Filter and sort todos based on current settings
  const filteredAndSortedTodos = [...todos]
    .filter(todo => {
      if (filterStatus === 'active') return !todo.completed;
      if (filterStatus === 'completed') return todo.completed;
      return true; // 'all'
    })
    .filter(todo => 
      todo.text.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else { // 'alphabetical'
        return a.text.localeCompare(b.text);
      }
    });

  // Count todos by status
  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  // Get category color class
  const getCategoryColorClass = (category: string): string => {
    switch(category) {
      case 'work': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'shopping': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'health': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'education': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <div className="container-narrow py-8 px-4 sm:px-6">
        {/* Header */}
        <header className="flex-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TaskMaster</h1>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value">{todos.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Tasks</div>
            <div className="stat-value">{activeTodosCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Completed</div>
            <div className="stat-value">{completedTodosCount}</div>
          </div>
        </div>

        {/* Add new todo form */}
        <div className="card mb-6">
          <div className="form-group mb-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyPress={handleNewTodoKeyPress}
                  className="input w-full"
                  placeholder="Add a new task..."
                  role="textbox"
                  aria-label="New task input"
                />
              </div>
              <div>
                <select
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value)}
                  className="input w-full sm:w-auto"
                  aria-label="Task category"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  onClick={addTodo} 
                  className="btn btn-primary w-full sm:w-auto flex-center gap-2"
                  role="button"
                  aria-label="Add task"
                >
                  <PlusCircle size={18} /> Add Task
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filter */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input pl-10"
                placeholder="Search tasks..."
                role="searchbox"
                aria-label="Search tasks"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="input py-2"
                  aria-label="Filter by status"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="input py-2"
                aria-label="Sort tasks"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Todo list */}
        <div className="card">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchText ? 'No tasks match your search' : 'No tasks found. Add one above!'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedTodos.map(todo => (
                <li key={todo.id} className="py-4 theme-transition">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {todo.completed ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleEditKeyPress}
                            className="input flex-1"
                            autoFocus
                            aria-label="Edit task"
                          />
                          <button
                            onClick={saveEdit}
                            className="btn bg-green-500 hover:bg-green-600 text-white"
                            aria-label="Save changes"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn bg-gray-500 hover:bg-gray-600 text-white"
                            aria-label="Cancel editing"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center">
                            <p className={`text-base ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {todo.text}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 items-center">
                            <span className={`badge ${getCategoryColorClass(todo.category)}`}>
                              {categories.find(c => c.id === todo.category)?.name || todo.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(todo.createdAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {editingId !== todo.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(todo)}
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                          aria-label="Edit task"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
                          aria-label="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
