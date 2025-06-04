import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Plus, Trash2, Edit, Filter, Search, Calendar, List, LayoutGrid,
  Clock, Flag, Tag, User, Settings, Download, Upload, BarChart3,
  CheckSquare, Square, Play, Pause, RotateCcw, TrendingUp,
  FileText, Zap, Brain, Target, Trophy, Moon, Sun, LogOut,
  ChevronDown, ChevronRight, ArrowUp, ArrowDown, X, Check,
  PenTool, Users, MessageCircle, Paperclip
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  timeSpent: number; // in minutes
  isRunning: boolean;
  lastStartTime?: number;
  subtasks: Subtask[];
  tags: string[];
  assignee?: string;
  estimatedTime?: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Settings {
  theme: 'light' | 'dark';
  defaultView: 'list' | 'board' | 'calendar';
  timeTracking: boolean;
  notifications: boolean;
  autoArchive: boolean;
  language: string;
  timezone: string;
}

type ViewType = 'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'settings';
type TaskView = 'list' | 'board' | 'calendar';
type FilterType = 'all' | 'active' | 'completed' | 'overdue' | 'today';
type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical';

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Work', color: '#3B82F6', icon: '💼' },
  { id: '2', name: 'Personal', color: '#10B981', icon: '🏠' },
  { id: '3', name: 'Health', color: '#F59E0B', icon: '🏥' },
  { id: '4', name: 'Learning', color: '#8B5CF6', icon: '📚' },
  { id: '5', name: 'Finance', color: '#EF4444', icon: '💰' }
];

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the Q2 project proposal with budget and timeline',
    completed: false,
    priority: 'high',
    category: 'Work',
    dueDate: '2025-06-06',
    createdAt: '2025-06-04T10:00:00Z',
    timeSpent: 45,
    isRunning: false,
    subtasks: [
      { id: 's1', title: 'Research competitors', completed: true },
      { id: 's2', title: 'Create budget breakdown', completed: false },
      { id: 's3', title: 'Review with team', completed: false }
    ],
    tags: ['urgent', 'client', 'proposal'],
    assignee: 'John Doe',
    estimatedTime: 120
  },
  {
    id: '2',
    title: 'Weekly grocery shopping',
    description: 'Buy groceries for the week including fresh vegetables',
    completed: true,
    priority: 'medium',
    category: 'Personal',
    dueDate: '2025-06-04',
    createdAt: '2025-06-03T09:00:00Z',
    completedAt: '2025-06-04T15:30:00Z',
    timeSpent: 30,
    isRunning: false,
    subtasks: [],
    tags: ['shopping', 'weekly'],
    estimatedTime: 60
  },
  {
    id: '3',
    title: 'Learn React Hooks',
    description: 'Complete the advanced React Hooks tutorial series',
    completed: false,
    priority: 'low',
    category: 'Learning',
    dueDate: '2025-06-10',
    createdAt: '2025-06-02T14:00:00Z',
    timeSpent: 90,
    isRunning: false,
    subtasks: [
      { id: 's4', title: 'useState and useEffect', completed: true },
      { id: 's5', title: 'useContext and useReducer', completed: false },
      { id: 's6', title: 'Custom hooks', completed: false }
    ],
    tags: ['programming', 'react', 'tutorial'],
    estimatedTime: 300
  }
];

export default function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    defaultView: 'list',
    timeTracking: true,
    notifications: true,
    autoArchive: false,
    language: 'en',
    timezone: 'UTC'
  });
  
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [taskView, setTaskView] = useState<TaskView>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: '',
    dueDate: '',
    tags: '',
    assignee: '',
    estimatedTime: ''
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📋'
  });
  
  // AI state
  const [promptText, setPromptText] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Timer state
  const [timerIntervals, setTimerIntervals] = useState<{[key: string]: NodeJS.Timeout}>({});
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Save data whenever tasks or categories change
  useEffect(() => {
    if (tasks.length > 0 || categories.length > 0) {
      saveData();
    }
  }, [tasks, categories, settings]);
  
  // Timer effect
  useEffect(() => {
    const runningTasks = tasks.filter(task => task.isRunning);
    
    runningTasks.forEach(task => {
      if (!timerIntervals[task.id]) {
        const interval = setInterval(() => {
          setTasks(prev => prev.map(t => 
            t.id === task.id 
              ? { ...t, timeSpent: t.timeSpent + 1 }
              : t
          ));
        }, 60000); // Update every minute
        
        setTimerIntervals(prev => ({ ...prev, [task.id]: interval }));
      }
    });
    
    // Clear intervals for stopped tasks
    Object.keys(timerIntervals).forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (!task?.isRunning) {
        clearInterval(timerIntervals[taskId]);
        setTimerIntervals(prev => {
          const { [taskId]: removed, ...rest } = prev;
          return rest;
        });
      }
    });
    
    return () => {
      Object.values(timerIntervals).forEach(clearInterval);
    };
  }, [tasks, timerIntervals]);
  
  // Theme effect
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);
  
  const loadData = () => {
    try {
      const savedTasks = localStorage.getItem('todoApp_tasks');
      const savedCategories = localStorage.getItem('todoApp_categories');
      const savedSettings = localStorage.getItem('todoApp_settings');
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(SAMPLE_TASKS);
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setTasks(SAMPLE_TASKS);
    }
  };
  
  const saveData = () => {
    try {
      localStorage.setItem('todoApp_tasks', JSON.stringify(tasks));
      localStorage.setItem('todoApp_categories', JSON.stringify(categories));
      localStorage.setItem('todoApp_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };
  
  const isToday = (dueDate: string) => {
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };
  
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }
    
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'overdue':
        return !task.completed && isOverdue(task.dueDate);
      case 'today':
        return isToday(task.dueDate);
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });
  
  const handleCreateTask = () => {
    if (!taskForm.title.trim()) return;
    
    const newTask: Task = {
      id: generateId(),
      title: taskForm.title,
      description: taskForm.description,
      completed: false,
      priority: taskForm.priority,
      category: taskForm.category || categories[0]?.name || 'General',
      dueDate: taskForm.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      timeSpent: 0,
      isRunning: false,
      subtasks: [],
      tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      assignee: taskForm.assignee,
      estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : undefined
    };
    
    setTasks(prev => [...prev, newTask]);
    resetTaskForm();
    setShowTaskModal(false);
  };
  
  const handleUpdateTask = () => {
    if (!editingTask || !taskForm.title.trim()) return;
    
    const updatedTask: Task = {
      ...editingTask,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      category: taskForm.category || editingTask.category,
      dueDate: taskForm.dueDate || editingTask.dueDate,
      tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      assignee: taskForm.assignee,
      estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : editingTask.estimatedTime
    };
    
    setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
    resetTaskForm();
    setEditingTask(null);
    setShowTaskModal(false);
  };
  
  const handleDeleteTask = (taskId: string) => {
    setConfirmMessage('Are you sure you want to delete this task?');
    setConfirmAction(() => () => {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };
  
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined,
          isRunning: false
        };
        
        if (timerIntervals[taskId]) {
          clearInterval(timerIntervals[taskId]);
          setTimerIntervals(prev => {
            const { [taskId]: removed, ...rest } = prev;
            return rest;
          });
        }
        
        return updatedTask;
      }
      return task;
    }));
  };
  
  const handleToggleTimer = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newIsRunning = !task.isRunning;
        return {
          ...task,
          isRunning: newIsRunning,
          lastStartTime: newIsRunning ? Date.now() : undefined
        };
      } else if (task.isRunning) {
        // Stop other running timers
        return { ...task, isRunning: false, lastStartTime: undefined };
      }
      return task;
    }));
  };
  
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          )
        };
      }
      return task;
    }));
  };
  
  const handleAddSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [...task.subtasks, {
            id: generateId(),
            title: title.trim(),
            completed: false
          }]
        };
      }
      return task;
    }));
  };
  
  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate,
        tags: task.tags.join(', '),
        assignee: task.assignee || '',
        estimatedTime: task.estimatedTime?.toString() || ''
      });
    } else {
      setEditingTask(null);
      resetTaskForm();
    }
    setShowTaskModal(true);
  };
  
  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      dueDate: '',
      tags: '',
      assignee: '',
      estimatedTime: ''
    });
  };
  
  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) return;
    
    const newCategory: Category = {
      id: generateId(),
      name: categoryForm.name,
      color: categoryForm.color,
      icon: categoryForm.icon
    };
    
    setCategories(prev => [...prev, newCategory]);
    setCategoryForm({ name: '', color: '#3B82F6', icon: '📋' });
    setShowCategoryModal(false);
  };
  
  const handleAIAnalysis = () => {
    if (!promptText.trim()) {
      setAiError('Please provide a task description or request for AI analysis.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    const enhancedPrompt = `Analyze this task and provide suggestions: "${promptText}". Please provide a JSON response with the following structure: {"title": "improved title", "description": "detailed description", "subtasks": ["subtask 1", "subtask 2"], "tags": ["tag1", "tag2"], "priority": "high/medium/low", "estimatedTime": "time in minutes", "tips": "productivity tips"}`;
    
    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };
  
  const handleImportTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedTasks: Task[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4) {
            const task: Task = {
              id: generateId(),
              title: values[0]?.trim() || '',
              description: values[1]?.trim() || '',
              priority: (values[2]?.trim() as Task['priority']) || 'medium',
              category: values[3]?.trim() || 'General',
              dueDate: values[4]?.trim() || new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              completed: false,
              timeSpent: 0,
              isRunning: false,
              subtasks: [],
              tags: values[5] ? values[5].split(';').map(tag => tag.trim()).filter(Boolean) : [],
              assignee: values[6]?.trim() || '',
              estimatedTime: values[7] ? parseInt(values[7]) : undefined
            };
            
            if (task.title) {
              importedTasks.push(task);
            }
          }
        }
        
        setTasks(prev => [...prev, ...importedTasks]);
        alert(`Successfully imported ${importedTasks.length} tasks`);
      } catch (error) {
        alert('Error importing tasks. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleExportTasks = () => {
    const headers = ['Title', 'Description', 'Priority', 'Category', 'Due Date', 'Tags', 'Assignee', 'Estimated Time'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.title,
        task.description,
        task.priority,
        task.category,
        task.dueDate,
        task.tags.join(';'),
        task.assignee || '',
        task.estimatedTime || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadTemplate = () => {
    const headers = ['Title', 'Description', 'Priority', 'Category', 'Due Date', 'Tags', 'Assignee', 'Estimated Time'];
    const sample = ['Sample Task', 'Task description here', 'high', 'Work', '2025-06-10', 'urgent;important', 'John Doe', '60'];
    const csvContent = [headers.join(','), sample.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all tasks and reset the app? This action cannot be undone.');
    setConfirmAction(() => () => {
      setTasks([]);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.removeItem('todoApp_tasks');
      localStorage.removeItem('todoApp_categories');
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };
  
  // Analytics calculations
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = tasks.filter(task => !task.completed).length;
  const overdueTasks = tasks.filter(task => !task.completed && isOverdue(task.dueDate)).length;
  const todayTasks = tasks.filter(task => isToday(task.dueDate)).length;
  
  const categoryStats = categories.map(category => ({
    name: category.name,
    total: tasks.filter(task => task.category === category.name).length,
    completed: tasks.filter(task => task.category === category.name && task.completed).length
  }));
  
  const priorityStats = [
    { name: 'Urgent', value: tasks.filter(task => task.priority === 'urgent').length, color: '#EF4444' },
    { name: 'High', value: tasks.filter(task => task.priority === 'high').length, color: '#F97316' },
    { name: 'Medium', value: tasks.filter(task => task.priority === 'medium').length, color: '#EAB308' },
    { name: 'Low', value: tasks.filter(task => task.priority === 'low').length, color: '#22C55E' }
  ];
  
  const weeklyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      completed: tasks.filter(task => task.completedAt?.split('T')[0] === dateStr).length,
      created: tasks.filter(task => task.createdAt.split('T')[0] === dateStr).length
    };
  }).reverse();
  
  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.first_name}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
          id="quick-add-task"
        >
          <Plus className="w-4 h-4" />
          Quick Add Task
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" id="total-tasks-stat">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-desc flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Active workspace
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-green-600">{completedTasks}</div>
          <div className="stat-desc">
            {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% completion rate
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active</div>
          <div className="stat-value text-blue-600">{activeTasks}</div>
          <div className="stat-desc">
            {todayTasks} due today
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Overdue</div>
          <div className="stat-value text-red-600">{overdueTasks}</div>
          <div className="stat-desc">
            Need attention
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => { setCurrentView('tasks'); setFilter('today'); }}
            className="flex items-center gap-2 p-3 text-left rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">Today's Tasks</div>
              <div className="text-sm text-blue-600 dark:text-blue-300">{todayTasks} tasks</div>
            </div>
          </button>
          
          <button
            onClick={() => { setCurrentView('tasks'); setFilter('overdue'); }}
            className="flex items-center gap-2 p-3 text-left rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
          >
            <Flag className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-900 dark:text-red-100">Overdue</div>
              <div className="text-sm text-red-600 dark:text-red-300">{overdueTasks} tasks</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 p-3 text-left rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors"
            id="ai-assistant-button"
          >
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-purple-900 dark:text-purple-100">AI Assistant</div>
              <div className="text-sm text-purple-600 dark:text-purple-300">Optimize tasks</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('analytics')}
            className="flex items-center gap-2 p-3 text-left rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">Analytics</div>
              <div className="text-sm text-green-600 dark:text-green-300">View insights</div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            Recent Tasks
          </h2>
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
              <button
                onClick={() => handleToggleTask(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-500 dark:border-slate-500'
                }`}
              >
                {task.completed && <Check className="w-3 h-3" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                  <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                  <span>{task.category}</span>
                  {task.dueDate && (
                    <span className={isOverdue(task.dueDate) ? 'text-red-600' : ''}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {settings.timeTracking && (
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {formatTime(task.timeSpent)}
                </div>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tasks yet. Create your first task to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const renderTaskList = () => (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <div key={task.id} className={`card hover:shadow-lg transition-shadow ${
          task.completed ? 'opacity-75' : ''
        } ${task.isRunning ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleTask(task.id)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
                task.completed 
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500 dark:border-slate-500'
              }`}
            >
              {task.completed && <Check className="w-4 h-4" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {settings.timeTracking && (
                    <button
                      onClick={() => handleToggleTimer(task.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        task.isRunning 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                      disabled={task.completed}
                    >
                      {task.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  )}
                  
                  <button
                    onClick={() => openTaskModal(task)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Task metadata */}
              <div className="flex items-center gap-3 mt-3 text-sm">
                <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
                
                <span className="text-gray-600 dark:text-slate-400">
                  {task.category}
                </span>
                
                {task.dueDate && (
                  <span className={`flex items-center gap-1 ${
                    isOverdue(task.dueDate) ? 'text-red-600' : 
                    isToday(task.dueDate) ? 'text-orange-600' : 'text-gray-600 dark:text-slate-400'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                
                {settings.timeTracking && (
                  <span className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(task.timeSpent)}
                    {task.estimatedTime && ` / ${formatTime(task.estimatedTime)}`}
                  </span>
                )}
                
                {task.assignee && (
                  <span className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    {task.assignee}
                  </span>
                )}
              </div>
              
              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">Subtasks:</h4>
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSubtask(task.id, subtask.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          subtask.completed 
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500 dark:border-slate-500'
                        }`}
                      >
                        {subtask.completed && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`text-sm ${
                        subtask.completed 
                          ? 'line-through text-gray-500'
                          : 'text-gray-700 dark:text-slate-300'
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            {filter !== 'all' ? `No ${filter} tasks match your criteria.` : 'Create your first task to get started!'}
          </p>
          <button
            onClick={() => openTaskModal()}
            className="btn btn-primary"
          >
            Create Task
          </button>
        </div>
      )}
    </div>
  );
  
  const renderAnalytics = () => (
    <div className="space-y-6" id="analytics-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics Dashboard
        </h1>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Completion Rate</div>
          <div className="stat-value text-green-600">
            {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
          </div>
          <div className="stat-desc">{completedTasks} of {tasks.length} completed</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Time Tracked</div>
          <div className="stat-value text-blue-600">
            {formatTime(tasks.reduce((sum, task) => sum + task.timeSpent, 0))}
          </div>
          <div className="stat-desc">Across all tasks</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Average Task Time</div>
          <div className="stat-value text-purple-600">
            {completedTasks > 0 
              ? formatTime(Math.round(tasks.filter(t => t.completed).reduce((sum, task) => sum + task.timeSpent, 0) / completedTasks))
              : '0m'
            }
          </div>
          <div className="stat-desc">Per completed task</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Productivity Score</div>
          <div className="stat-value text-orange-600">
            {tasks.length > 0 ? Math.round(((completedTasks / tasks.length) * 0.7 + (Math.max(0, tasks.length - overdueTasks) / tasks.length) * 0.3) * 100) : 0}
          </div>
          <div className="stat-desc">Based on completion & timeliness</div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-text-base)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="completed" fill="#22C55E" name="Completed" />
              <Bar dataKey="created" fill="#3B82F6" name="Created" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {priorityStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Category Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Performance</h3>
        <div className="space-y-4">
          {categoryStats.map(category => {
            const completionRate = category.total > 0 ? (category.completed / category.total) * 100 : 0;
            return (
              <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg">
                    {categories.find(c => c.name === category.name)?.icon || '📋'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {category.completed} of {category.total} completed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {Math.round(completionRate)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="space-y-6" id="settings-page">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings
      </h1>
      
      {/* Appearance */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Theme</label>
              <p className="text-sm text-gray-500 dark:text-slate-400">Choose your preferred theme</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
              className="theme-toggle"
              aria-label={settings.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <span className="theme-toggle-thumb flex items-center justify-center">
                {settings.theme === 'light' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Preferences */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Time Tracking</label>
              <p className="text-sm text-gray-500 dark:text-slate-400">Enable time tracking for tasks</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, timeTracking: !prev.timeTracking }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.timeTracking ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.timeTracking ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Notifications</label>
              <p className="text-sm text-gray-500 dark:text-slate-400">Get notified about due tasks</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Auto Archive</label>
              <p className="text-sm text-gray-500 dark:text-slate-400">Automatically archive completed tasks after 30 days</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, autoArchive: !prev.autoArchive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoArchive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoArchive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-2"
            id="add-category-button"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-lg">{category.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {tasks.filter(task => task.category === category.name).length} tasks
                </div>
              </div>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Data Management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadTemplate}
              className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 flex items-center gap-2"
              id="download-template-button"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
            
            <label className="btn bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Tasks
              <input
                type="file"
                accept=".csv"
                onChange={handleImportTasks}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleExportTasks}
              className="btn bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Tasks
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
            <button
              onClick={clearAllData}
              className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              This will permanently delete all tasks and reset the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderTaskModal = () => (
    <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button 
            onClick={() => setShowTaskModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); editingTask ? handleUpdateTask() : handleCreateTask(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              placeholder="Enter task title..."
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              rows={3}
              placeholder="Enter task description..."
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="task-category">Category</label>
              <select
                id="task-category"
                value={taskForm.category}
                onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="task-estimated-time">Estimated Time (minutes)</label>
              <input
                id="task-estimated-time"
                type="number"
                value={taskForm.estimatedTime}
                onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className="input"
                placeholder="e.g., 60"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">Assignee</label>
            <input
              id="task-assignee"
              type="text"
              value={taskForm.assignee}
              onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
              className="input"
              placeholder="Assign to someone..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="task-tags">Tags</label>
            <input
              id="task-tags"
              type="text"
              value={taskForm.tags}
              onChange={(e) => setTaskForm(prev => ({ ...prev, tags: e.target.value }))}
              className="input"
              placeholder="urgent, important, project (comma separated)"
            />
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!taskForm.title.trim()}
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="generation_issue_fallback">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg z-30 border-r border-gray-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">TaskMaster</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">Pro Todo App</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              id="dashboard-nav"
            >
              <LayoutGrid className="w-5 h-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === 'tasks'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              id="tasks-nav"
            >
              <List className="w-5 h-5" />
              Tasks
              <span className="ml-auto bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
                {activeTasks}
              </span>
            </button>
            
            <button
              onClick={() => setCurrentView('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === 'analytics'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>
        
        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentUser?.first_name} {currentUser?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Header */}
        {currentView === 'tasks' && (
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                
                {/* View Toggle */}
                <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setTaskView('list')}
                    className={`p-2 rounded-md transition-colors ${
                      taskView === 'list'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskView('board')}
                    className={`p-2 rounded-md transition-colors ${
                      taskView === 'board'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskView('calendar')}
                    className={`p-2 rounded-md transition-colors ${
                      taskView === 'calendar'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="search-tasks"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="input input-sm"
                    id="filter-tasks"
                  >
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="today">Due Today</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input input-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="input input-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="created">Created</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
                
                <button
                  onClick={() => openTaskModal()}
                  className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
                  id="add-task-button"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'tasks' && renderTaskList()}
          {currentView === 'analytics' && renderAnalytics()}
          {currentView === 'settings' && renderSettings()}
        </div>
      </div>
      
      {/* Modals */}
      {showTaskModal && renderTaskModal()}
      
      {showCategoryModal && (
        <div className="modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Category</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }} className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="category-name">Name *</label>
                <input
                  id="category-name"
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter category name..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="category-icon">Icon</label>
                  <input
                    id="category-icon"
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="input"
                    placeholder="📋"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="category-color">Color</label>
                  <input
                    id="category-color"
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                    className="input h-10"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!categoryForm.name.trim()}
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Action</h3>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-4">
              <p className="text-gray-600 dark:text-slate-400">{confirmMessage}</p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showAiModal && (
        <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Task Assistant
              </h3>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="ai-prompt">Describe your task or ask for help</label>
                <textarea
                  id="ai-prompt"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="e.g., 'Help me break down a project proposal task' or 'Optimize my workout routine task'"
                />
              </div>
              
              {isAiLoading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Analyzing with AI...
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <span>Error: {aiError.message || aiError}</span>
                </div>
              )}
              
              {aiResult && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">AI Suggestions:</h4>
                  <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {aiResult}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAiModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={handleAIAnalysis}
                disabled={!promptText.trim() || isAiLoading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? 'Analyzing...' : 'Get AI Suggestions'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="ml-64 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}