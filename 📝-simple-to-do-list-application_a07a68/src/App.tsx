import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, Search, Filter, Calendar, List, Grid3X3, Settings, Download, Upload, Trash2, Edit, Check, X, ChevronDown, Star, Clock, AlertCircle, CheckCircle2, BarChart3, Brain, FileText, Zap, Moon, Sun, Users, Target, TrendingUp, Tag, Archive, RotateCcw, Play, Pause, Timer, Bell } from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Todo {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  dueDate?: string;
  createdDate: string;
  completedDate?: string;
  tags: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  subtasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

type ViewMode = 'list' | 'board' | 'calendar';
type FilterType = 'all' | 'todo' | 'in-progress' | 'completed' | 'overdue' | 'today' | 'upcoming';
type SortType = 'created' | 'dueDate' | 'priority' | 'title' | 'category';

interface Settings {
  theme: 'light' | 'dark';
  defaultView: ViewMode;
  notifications: boolean;
  autoArchive: boolean;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
}

interface PomodoroSession {
  id: string;
  todoId: string;
  startTime: string;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
}

const App: React.FC = () => {
  // AI Layer Integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Core State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Work', color: '#3B82F6', icon: '💼' },
    { id: '2', name: 'Personal', color: '#10B981', icon: '🏠' },
    { id: '3', name: 'Health', color: '#F59E0B', icon: '🏃' },
    { id: '4', name: 'Learning', color: '#8B5CF6', icon: '📚' },
    { id: '5', name: 'Shopping', color: '#EF4444', icon: '🛒' }
  ]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    defaultView: 'list',
    notifications: true,
    autoArchive: false,
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15
  });
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);

  // UI State
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState<'main' | 'settings' | 'analytics'>('main');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('created');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [draggedTodo, setDraggedTodo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    dueDate: '',
    tags: '',
    estimatedTime: ''
  });

  // Pomodoro State
  const [currentPomodoro, setCurrentPomodoro] = useState<{
    todoId: string;
    startTime: Date;
    duration: number;
    type: 'work' | 'short-break' | 'long-break';
    timeLeft: number;
    isRunning: boolean;
  } | null>(null);
  const [pomodoroInterval, setPomodoroInterval] = useState<NodeJS.Timeout | null>(null);

  // Load data on mount
  useEffect(() => {
    loadDataFromStorage();
    applyTheme();
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveDataToStorage();
  }, [todos, categories, settings, pomodoroSessions]);

  // Apply theme
  useEffect(() => {
    applyTheme();
  }, [settings.theme]);

  // Pomodoro timer effect
  useEffect(() => {
    if (currentPomodoro?.isRunning && pomodoroInterval) {
      return () => clearInterval(pomodoroInterval);
    }
  }, [currentPomodoro, pomodoroInterval]);

  const loadDataFromStorage = () => {
    try {
      const storedTodos = localStorage.getItem('todos');
      const storedCategories = localStorage.getItem('categories');
      const storedSettings = localStorage.getItem('settings');
      const storedSessions = localStorage.getItem('pomodoroSessions');
      
      if (storedTodos) setTodos(JSON.parse(storedTodos));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedSettings) setSettings({ ...settings, ...JSON.parse(storedSettings) });
      if (storedSessions) setPomodoroSessions(JSON.parse(storedSessions));
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  };

  const saveDataToStorage = () => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('settings', JSON.stringify(settings));
      localStorage.setItem('pomodoroSessions', JSON.stringify(pomodoroSessions));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  const applyTheme = () => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // AI Integration Functions
  const handleAiTaskCreation = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please provide a description of the tasks you want to create.');
      return;
    }

    setAiResult(null);
    setAiError(null);
    
    const enhancedPrompt = `Parse the following text and extract todo tasks. Return a JSON array of tasks with the structure: [{"title": "string", "description": "string", "category": "Work|Personal|Health|Learning|Shopping", "priority": "low|medium|high|urgent", "dueDate": "YYYY-MM-DD or null", "tags": ["string"], "estimatedTime": number_in_minutes}]. Text to parse: "${aiPrompt}"`;
    
    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    try {
      const parsedTasks = JSON.parse(result);
      if (Array.isArray(parsedTasks)) {
        parsedTasks.forEach(task => {
          if (task.title) {
            const newTodo: Todo = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              title: task.title,
              description: task.description || '',
              category: categories.find(c => c.name === task.category)?.id || categories[0].id,
              priority: task.priority || 'medium',
              status: 'todo',
              dueDate: task.dueDate || undefined,
              createdDate: new Date().toISOString(),
              tags: Array.isArray(task.tags) ? task.tags : [],
              estimatedTime: task.estimatedTime || undefined,
              subtasks: []
            };
            setTodos(prev => [...prev, newTodo]);
          }
        });
        setShowAiModal(false);
        setAiPrompt('');
      }
    } catch (error) {
      console.error('Error parsing AI result:', error);
    }
  };

  // CRUD Operations
  const addTodo = () => {
    if (!formData.title.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      category: formData.category || categories[0].id,
      priority: formData.priority,
      status: 'todo',
      dueDate: formData.dueDate || undefined,
      createdDate: new Date().toISOString(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      subtasks: []
    };

    setTodos(prev => [...prev, newTodo]);
    setShowAddModal(false);
    resetForm();
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates, ...(updates.status === 'completed' ? { completedDate: new Date().toISOString() } : {}) }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setShowDeleteConfirm(null);
  };

  const toggleTodoStatus = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newStatus = todo.status === 'completed' ? 'todo' : 'completed';
    updateTodo(id, { 
      status: newStatus,
      ...(newStatus === 'completed' ? { completedDate: new Date().toISOString() } : { completedDate: undefined })
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      tags: '',
      estimatedTime: ''
    });
    setEditingTodo(null);
  };

  // Filtering and Sorting
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos.filter(todo => {
      // Search filter
      if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !todo.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && todo.category !== selectedCategory) {
        return false;
      }

      // Status filter
      switch (filterType) {
        case 'todo':
          return todo.status === 'todo';
        case 'in-progress':
          return todo.status === 'in-progress';
        case 'completed':
          return todo.status === 'completed';
        case 'overdue':
          return todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';
        case 'today':
          return todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString();
        case 'upcoming':
          return todo.dueDate && new Date(todo.dueDate) > new Date();
        default:
          return todo.status !== 'archived';
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });

    return filtered;
  }, [todos, searchTerm, selectedCategory, filterType, sortType]);

  // Analytics Data
  const analyticsData = useMemo(() => {
    const statusCounts = {
      todo: todos.filter(t => t.status === 'todo').length,
      'in-progress': todos.filter(t => t.status === 'in-progress').length,
      completed: todos.filter(t => t.status === 'completed').length,
      archived: todos.filter(t => t.status === 'archived').length
    };

    const priorityCounts = {
      low: todos.filter(t => t.priority === 'low').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      high: todos.filter(t => t.priority === 'high').length,
      urgent: todos.filter(t => t.priority === 'urgent').length
    };

    const categoryData = categories.map(category => ({
      name: category.name,
      count: todos.filter(t => t.category === category.id).length,
      color: category.color
    }));

    // Productivity over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const productivityData = last7Days.map(date => {
      const completed = todos.filter(t => 
        t.completedDate && t.completedDate.split('T')[0] === date
      ).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed
      };
    });

    return {
      statusCounts,
      priorityCounts,
      categoryData,
      productivityData,
      totalTodos: todos.length,
      completionRate: todos.length > 0 ? Math.round((statusCounts.completed / todos.length) * 100) : 0
    };
  }, [todos, categories]);

  // Pomodoro Functions
  const startPomodoro = (todoId: string, type: 'work' | 'short-break' | 'long-break' = 'work') => {
    const duration = type === 'work' ? settings.pomodoroLength : 
                    type === 'short-break' ? settings.shortBreakLength : settings.longBreakLength;
    
    setCurrentPomodoro({
      todoId,
      startTime: new Date(),
      duration,
      type,
      timeLeft: duration * 60,
      isRunning: true
    });

    const interval = setInterval(() => {
      setCurrentPomodoro(prev => {
        if (!prev || prev.timeLeft <= 1) {
          clearInterval(interval);
          if (prev) {
            // Save completed session
            const session: PomodoroSession = {
              id: Date.now().toString(),
              todoId: prev.todoId,
              startTime: prev.startTime.toISOString(),
              duration: prev.duration,
              type: prev.type,
              completed: true
            };
            setPomodoroSessions(sessions => [...sessions, session]);
          }
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    setPomodoroInterval(interval);
  };

  const pausePomodoro = () => {
    if (pomodoroInterval) {
      clearInterval(pomodoroInterval);
      setPomodoroInterval(null);
    }
    setCurrentPomodoro(prev => prev ? { ...prev, isRunning: false } : null);
  };

  const stopPomodoro = () => {
    if (pomodoroInterval) {
      clearInterval(pomodoroInterval);
      setPomodoroInterval(null);
    }
    setCurrentPomodoro(null);
  };

  // Data Export/Import
  const exportData = () => {
    const data = {
      todos,
      categories,
      settings,
      pomodoroSessions,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.todos) setTodos(data.todos);
        if (data.categories) setCategories(data.categories);
        if (data.settings) setSettings(data.settings);
        if (data.pomodoroSessions) setPomodoroSessions(data.pomodoroSessions);
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setTodos([]);
      setPomodoroSessions([]);
      localStorage.removeItem('todos');
      localStorage.removeItem('pomodoroSessions');
    }
  };

  // Utility Functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'archived': return 'text-gray-600';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Functions
  const renderHeader = () => (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="container-wide">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div id="welcome_fallback" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TodoPro</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-1 ml-8">
              <button
                onClick={() => setCurrentPage('main')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'main' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Tasks
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'analytics' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {currentPomodoro && (
              <div className={`${styles.pomodoroTimer} flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`}>
                <Timer className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(currentPomodoro.timeLeft)}</span>
                <button
                  onClick={currentPomodoro.isRunning ? pausePomodoro : () => {
                    const interval = setInterval(() => {
                      setCurrentPomodoro(prev => {
                        if (!prev || prev.timeLeft <= 1) {
                          clearInterval(interval);
                          return null;
                        }
                        return { ...prev, timeLeft: prev.timeLeft - 1 };
                      });
                    }, 1000);
                    setPomodoroInterval(interval);
                    setCurrentPomodoro(prev => prev ? { ...prev, isRunning: true } : null);
                  }}
                  className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                >
                  {currentPomodoro.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={stopPomodoro}
                  className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <button
              id="settings-button"
              onClick={() => setCurrentPage('settings')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const renderSearchAndFilters = () => (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div className="container-wide py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="search-input"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="input-sm"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="input-sm"
            >
              <option value="created">Sort by Created</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden">
              <button
                onClick={() => setCurrentView('list')}
                className={`p-2 text-sm ${
                  currentView === 'list' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('board')}
                className={`p-2 text-sm ${
                  currentView === 'board' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`p-2 text-sm ${
                  currentView === 'calendar' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="ai-add-button"
              onClick={() => setShowAiModal(true)}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Create
            </button>
            <button
              id="add-task-button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTodoCard = (todo: Todo) => {
    const category = categories.find(c => c.id === todo.category);
    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';
    
    return (
      <div
        key={todo.id}
        className={`card hover:shadow-lg transition-all duration-200 border-l-4 ${styles.todoCard}`}
        style={{ borderLeftColor: category?.color || '#3B82F6' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => toggleTodoStatus(todo.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {todo.status === 'completed' && <Check className="w-3 h-3" />}
              </button>
              <h3 className={`font-semibold text-gray-900 dark:text-white ${
                todo.status === 'completed' ? 'line-through opacity-60' : ''
              }`}>
                {todo.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                {todo.priority}
              </span>
            </div>

            {todo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{todo.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
              {category && (
                <span className="flex items-center gap-1">
                  <span>{category.icon}</span>
                  {category.name}
                </span>
              )}
              {todo.dueDate && (
                <span className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 dark:text-red-400' : ''
                }`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(todo.dueDate).toLocaleDateString()}
                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                </span>
              )}
              {todo.estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {todo.estimatedTime}m
                </span>
              )}
            </div>

            {todo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {todo.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => startPomodoro(todo.id)}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              title="Start Pomodoro"
            >
              <Timer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingTodo(todo);
                setFormData({
                  title: todo.title,
                  description: todo.description,
                  category: todo.category,
                  priority: todo.priority,
                  dueDate: todo.dueDate || '',
                  tags: todo.tags.join(', '),
                  estimatedTime: todo.estimatedTime?.toString() || ''
                });
                setShowAddModal(true);
              }}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(todo.id)}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="container-wide py-6">
      <div id="generation_issue_fallback" className="space-y-4">
        {filteredAndSortedTodos.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </button>
          </div>
        ) : (
          filteredAndSortedTodos.map(renderTodoCard)
        )}
      </div>
    </div>
  );

  const renderBoardView = () => {
    const columns = [
      { id: 'todo', title: 'To Do', status: 'todo' as const },
      { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
      { id: 'completed', title: 'Completed', status: 'completed' as const }
    ];

    return (
      <div className="container-wide py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => {
            const columnTodos = filteredAndSortedTodos.filter(todo => todo.status === column.status);
            
            return (
              <div key={column.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                  {column.title}
                  <span className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-sm">
                    {columnTodos.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {columnTodos.map(renderTodoCard)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    const getTodosForDate = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return filteredAndSortedTodos.filter(todo => todo.dueDate === dateStr);
    };

    return (
      <div className="container-wide py-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <div className="grid grid-cols-7 gap-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                {day}
              </div>
            ))}
            
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = date.toDateString() === today.toDateString();
              const dayTodos = getTodosForDate(date);
              
              return (
                <div
                  key={index}
                  className={`p-2 min-h-[100px] border-b border-r border-gray-200 dark:border-slate-700 ${
                    isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'
                  } ${isToday ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                  } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTodos.slice(0, 3).map(todo => {
                      const category = categories.find(c => c.id === todo.category);
                      return (
                        <div
                          key={todo.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: category?.color + '20', color: category?.color }}
                          title={todo.title}
                          onClick={() => {
                            setEditingTodo(todo);
                            setFormData({
                              title: todo.title,
                              description: todo.description,
                              category: todo.category,
                              priority: todo.priority,
                              dueDate: todo.dueDate || '',
                              tags: todo.tags.join(', '),
                              estimatedTime: todo.estimatedTime?.toString() || ''
                            });
                            setShowAddModal(true);
                          }}
                        >
                          {todo.title}
                        </div>
                      );
                    })}
                    {dayTodos.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayTodos.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="container-wide py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your productivity and task completion patterns</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{analyticsData.totalTodos}</div>
          <div className="stat-desc">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-green-600">{analyticsData.statusCounts.completed}</div>
          <div className="stat-desc">{analyticsData.completionRate}% completion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-blue-600">{analyticsData.statusCounts['in-progress']}</div>
          <div className="stat-desc">Active tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pomodoros</div>
          <div className="stat-value text-red-600">{pomodoroSessions.filter(s => s.completed).length}</div>
          <div className="stat-desc">Focus sessions completed</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'To Do', value: analyticsData.statusCounts.todo, color: '#EF4444' },
                  { name: 'In Progress', value: analyticsData.statusCounts['in-progress'], color: '#3B82F6' },
                  { name: 'Completed', value: analyticsData.statusCounts.completed, color: '#10B981' },
                  { name: 'Archived', value: analyticsData.statusCounts.archived, color: '#6B7280' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  { name: 'To Do', value: analyticsData.statusCounts.todo, color: '#EF4444' },
                  { name: 'In Progress', value: analyticsData.statusCounts['in-progress'], color: '#3B82F6' },
                  { name: 'Completed', value: analyticsData.statusCounts.completed, color: '#10B981' },
                  { name: 'Archived', value: analyticsData.statusCounts.archived, color: '#6B7280' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill={(entry: any) => entry.color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productivity Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Productivity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.productivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} name="Completed Tasks" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="container-wide py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Customize your todo experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General</h3>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default View</label>
              <select
                value={settings.defaultView}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultView: e.target.value as ViewMode }))}
                className="input"
              >
                <option value="list">List</option>
                <option value="board">Board</option>
                <option value="calendar">Calendar</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="form-label mb-0">Notifications</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive task reminders</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="form-label mb-0">Auto Archive</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Auto-archive completed tasks after 30 days</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoArchive: !prev.autoArchive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoArchive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoArchive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Pomodoro Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pomodoro Timer</h3>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Work Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.pomodoroLength}
                onChange={(e) => setSettings(prev => ({ ...prev, pomodoroLength: parseInt(e.target.value) || 25 }))}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakLength}
                onChange={(e) => setSettings(prev => ({ ...prev, shortBreakLength: parseInt(e.target.value) || 5 }))}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakLength}
                onChange={(e) => setSettings(prev => ({ ...prev, longBreakLength: parseInt(e.target.value) || 15 }))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Categories Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
          
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{category.color}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {todos.filter(t => t.category === category.id).length} tasks
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={exportData}
                className="btn btn-primary flex items-center gap-2 w-full justify-center"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download all your tasks and settings</p>
            </div>

            <div>
              <label className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 w-full justify-center cursor-pointer">
                <Upload className="w-4 h-4" />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Import tasks from a JSON file</p>
            </div>

            <div>
              <button
                onClick={clearAllData}
                className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex items-center gap-2 w-full justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permanently delete all tasks and data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddEditModal = () => (
    <div className="modal-backdrop" onClick={() => { setShowAddModal(false); resetForm(); }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {editingTodo ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={() => { setShowAddModal(false); resetForm(); }}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Time (minutes)</label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className="input"
                placeholder="30"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="input"
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => { setShowAddModal(false); resetForm(); }}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (editingTodo) {
                updateTodo(editingTodo.id, {
                  title: formData.title,
                  description: formData.description,
                  category: formData.category || categories[0].id,
                  priority: formData.priority,
                  dueDate: formData.dueDate || undefined,
                  tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                  estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined
                });
                setShowAddModal(false);
                resetForm();
              } else {
                addTodo();
              }
            }}
            disabled={!formData.title.trim()}
            className="btn btn-primary"
          >
            {editingTodo ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAiModal = () => (
    <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Task Creation
          </h3>
          <button
            onClick={() => setShowAiModal(false)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Describe your tasks in natural language and AI will parse them into structured todo items.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
              Example: "I need to finish the project report by Friday, buy groceries this evening, and schedule a dentist appointment for next week."
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="input"
              rows={4}
              placeholder="Describe the tasks you want to create..."
              autoFocus
            />
          </div>

          {aiError && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4" />
              {typeof aiError === 'string' ? aiError : 'An error occurred while processing your request.'}
            </div>
          )}

          {aiResult && (
            <div className="alert alert-success">
              <CheckCircle2 className="w-4 h-4" />
              Tasks created successfully!
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={() => setShowAiModal(false)}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAiTaskCreation}
            disabled={!aiPrompt.trim() || isAiLoading}
            className="btn btn-primary flex items-center gap-2"
          >
            {isAiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Create Tasks
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDeleteConfirmModal = () => (
    showDeleteConfirm && (
      <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Task</h3>
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteTodo(showDeleteConfirm)}
              className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowAiModal(false);
        setShowDeleteConfirm(null);
      }
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowAddModal(true);
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        setShowAiModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer Integration */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {renderHeader()}
      
      {currentPage === 'main' && (
        <>
          {renderSearchAndFilters()}
          {currentView === 'list' && renderListView()}
          {currentView === 'board' && renderBoardView()}
          {currentView === 'calendar' && renderCalendarView()}
        </>
      )}
      
      {currentPage === 'analytics' && renderAnalytics()}
      {currentPage === 'settings' && renderSettings()}

      {/* Modals */}
      {showAddModal && renderAddEditModal()}
      {showAiModal && renderAiModal()}
      {renderDeleteConfirmModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 mt-auto">
        <div className="container-wide">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;