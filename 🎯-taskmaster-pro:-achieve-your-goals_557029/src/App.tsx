import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Plus, Edit, Trash2, Filter, Search, Calendar, BarChart3, Settings, 
  CheckCircle, Clock, AlertCircle, Target, TrendingUp, TrendingDown,
  Download, Upload, Moon, Sun, Layout, List, Kanban, X, Check,
  Brain, Zap, Star, Tag, User, LogOut, FileText, PieChart,
  ChevronDown, ChevronUp, Play, Pause, RotateCcw
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  timeSpent: number; // in minutes
  tags: string[];
  estimatedTime?: number; // in minutes
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTimePerTask: number;
  productivityTrend: 'up' | 'down' | 'stable';
  categoryBreakdown: { [key: string]: number };
  dailyCompletion: { date: string; completed: number; created: number }[];
}

interface Settings {
  theme: 'light' | 'dark';
  defaultView: 'list' | 'kanban' | 'calendar';
  notifications: boolean;
  autoSave: boolean;
  timeTracking: boolean;
  language: string;
  dateFormat: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'analytics' | 'settings'>('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    defaultView: 'list',
    notifications: true,
    autoSave: true,
    timeTracking: true,
    language: 'en',
    dateFormat: 'MM/dd/yyyy'
  });

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    estimatedTime: 60,
    tags: [] as string[]
  });

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Time tracking state
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskmaster_tasks');
    const savedCategories = localStorage.getItem('taskmaster_categories');
    const savedSettings = localStorage.getItem('taskmaster_settings');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Initialize default categories
      const defaultCategories: Category[] = [
        { id: '1', name: 'Work', color: '#3b82f6', icon: '💼' },
        { id: '2', name: 'Personal', color: '#10b981', icon: '🏠' },
        { id: '3', name: 'Health', color: '#f59e0b', icon: '🏃' },
        { id: '4', name: 'Learning', color: '#8b5cf6', icon: '📚' },
        { id: '5', name: 'Shopping', color: '#ef4444', icon: '🛒' }
      ];
      setCategories(defaultCategories);
      localStorage.setItem('taskmaster_categories', JSON.stringify(defaultCategories));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskmaster_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('taskmaster_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Task operations
  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      category: taskData.category || '',
      priority: taskData.priority || 'medium',
      status: 'todo',
      dueDate: taskData.dueDate || '',
      createdAt: new Date().toISOString(),
      timeSpent: 0,
      tags: taskData.tags || [],
      estimatedTime: taskData.estimatedTime || 60
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (activeTimer === taskId) {
      stopTimer();
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'todo' : 
                     task.status === 'todo' ? 'in-progress' : 'completed';
    
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    updateTask(taskId, updates);
  };

  // Timer operations
  const startTimer = (taskId: string) => {
    setActiveTimer(taskId);
    setTimerStart(Date.now());
    updateTask(taskId, { status: 'in-progress' });
  };

  const stopTimer = () => {
    if (activeTimer && timerStart) {
      const timeSpent = Math.floor((Date.now() - timerStart) / 60000);
      const currentTask = tasks.find(t => t.id === activeTimer);
      if (currentTask) {
        updateTask(activeTimer, { timeSpent: currentTask.timeSpent + timeSpent });
      }
    }
    setActiveTimer(null);
    setTimerStart(null);
  };

  const pauseTimer = () => {
    if (activeTimer && timerStart) {
      const timeSpent = Math.floor((Date.now() - timerStart) / 60000);
      const currentTask = tasks.find(t => t.id === activeTimer);
      if (currentTask) {
        updateTask(activeTimer, { timeSpent: currentTask.timeSpent + timeSpent });
      }
    }
    setActiveTimer(null);
    setTimerStart(null);
  };

  // Form handlers
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskForm.title,
        description: taskForm.description,
        category: taskForm.category,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        estimatedTime: taskForm.estimatedTime,
        tags: taskForm.tags
      });
      setEditingTask(null);
    } else {
      createTask(taskForm);
    }

    // Reset form
    setTaskForm({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      estimatedTime: 60,
      tags: []
    });
    setShowTaskForm(false);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      estimatedTime: task.estimatedTime || 60,
      tags: task.tags
    });
    setShowTaskForm(true);
  };

  // AI operations
  const handleAiAnalysis = () => {
    if (!aiPrompt.trim()) return;

    const additionalContext = `
    Analyze the following task request and extract structured data. Return JSON with these exact fields:
    {
      "title": "clear task title",
      "description": "detailed description", 
      "category": "one of: Work, Personal, Health, Learning, Shopping",
      "priority": "one of: low, medium, high, urgent",
      "estimatedTime": "number in minutes",
      "tags": ["array", "of", "relevant", "tags"],
      "suggestions": "additional suggestions for the user"
    }
    
    User request: ${aiPrompt}
    `;

    setAiResult(null);
    setAiError(null);
    
    aiLayerRef.current?.sendToAI(additionalContext);
  };

  const processAiResult = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      if (parsed.title) {
        setTaskForm({
          title: parsed.title || '',
          description: parsed.description || '',
          category: parsed.category || '',
          priority: parsed.priority || 'medium',
          dueDate: '',
          estimatedTime: parsed.estimatedTime || 60,
          tags: parsed.tags || []
        });
        setShowTaskForm(true);
        setShowAiPanel(false);
        setAiPrompt('');
      }
    } catch {
      // If not JSON, show as markdown
      setAiResult(result);
    }
  };

  // Filter and search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Analytics calculations
  const calculateAnalytics = (): Analytics => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const avgTime = completedTasks > 0 
      ? tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.timeSpent, 0) / completedTasks
      : 0;

    const categoryBreakdown: { [key: string]: number } = {};
    tasks.forEach(task => {
      categoryBreakdown[task.category] = (categoryBreakdown[task.category] || 0) + 1;
    });

    // Generate sample daily data
    const dailyCompletion = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 8) + 1,
        created: Math.floor(Math.random() * 5) + 2
      };
    }).reverse();

    return {
      totalTasks,
      completedTasks,
      completionRate,
      averageTimePerTask: avgTime,
      productivityTrend: completionRate > 70 ? 'up' : completionRate > 40 ? 'stable' : 'down',
      categoryBreakdown,
      dailyCompletion
    };
  };

  // Export/Import functions
  const exportTasks = () => {
    const csvContent = [
      ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Time Spent (min)', 'Tags'].join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        `"${task.description}"`,
        task.category,
        task.priority,
        task.status,
        task.dueDate,
        task.timeSpent,
        `"${task.tags.join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const templateContent = [
      ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Estimated Time (min)', 'Tags'].join(','),
      [
        '"Sample Task"',
        '"This is a sample task description"',
        'Work',
        'medium',
        'todo',
        '2025-06-15',
        '60',
        '"sample, template"'
      ].join(',')
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedTasks: Task[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
          const task: Task = {
            id: Date.now().toString() + i,
            title: values[0]?.replace(/"/g, '') || '',
            description: values[1]?.replace(/"/g, '') || '',
            category: values[2] || '',
            priority: (values[3] as Task['priority']) || 'medium',
            status: (values[4] as Task['status']) || 'todo',
            dueDate: values[5] || '',
            createdAt: new Date().toISOString(),
            timeSpent: 0,
            tags: values[7]?.replace(/"/g, '').split(', ').filter(Boolean) || [],
            estimatedTime: parseInt(values[6]) || 60
          };
          importedTasks.push(task);
        }
      }
      
      setTasks(prev => [...importedTasks, ...prev]);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    setTasks([]);
    setCategories([]);
    localStorage.removeItem('taskmaster_tasks');
    localStorage.removeItem('taskmaster_categories');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={processAiResult}
        onError={setAiError}
        onLoading={setAiLoading}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster Pro</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{currentUser.first_name} {currentUser.last_name}</span>
              </div>

              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layout },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <div className="flex gap-3">
                <button
                  id="ai-assistant-btn"
                  onClick={() => setShowAiPanel(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  AI Assistant
                </button>
                <button
                  id="new-task-btn"
                  onClick={() => setShowTaskForm(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Total Tasks', 
                  value: tasks.length, 
                  icon: FileText, 
                  color: 'blue',
                  change: '+12%'
                },
                { 
                  title: 'Completed', 
                  value: tasks.filter(t => t.status === 'completed').length, 
                  icon: CheckCircle, 
                  color: 'green',
                  change: '+8%'
                },
                { 
                  title: 'In Progress', 
                  value: tasks.filter(t => t.status === 'in-progress').length, 
                  icon: Clock, 
                  color: 'orange',
                  change: '+5%'
                },
                { 
                  title: 'Pending', 
                  value: tasks.filter(t => t.status === 'todo').length, 
                  icon: AlertCircle, 
                  color: 'red',
                  change: '-3%'
                }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{stat.change}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Add Task', icon: Plus, action: () => setShowTaskForm(true) },
                  { label: 'AI Help', icon: Brain, action: () => setShowAiPanel(true) },
                  { label: 'Export Data', icon: Download, action: exportTasks },
                  { label: 'View Analytics', icon: BarChart3, action: () => setActiveTab('analytics') }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Tasks</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h2>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Kanban className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <button
                  onClick={() => setShowAiPanel(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  AI Help
                </button>

                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Task Views */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.status === 'completed' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3 h-3" />}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {task.category}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.timeSpent}m spent
                            </span>
                          </div>

                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status === 'in-progress' && (
                          <div className="flex gap-1">
                            {activeTimer === task.id ? (
                              <button
                                onClick={pauseTimer}
                                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 rounded-lg"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => startTimer(task.id)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => startEdit(task)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Create your first task to get started!</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { status: 'todo', title: 'To Do', color: 'gray' },
                  { status: 'in-progress', title: 'In Progress', color: 'blue' },
                  { status: 'completed', title: 'Completed', color: 'green' }
                ].map((column) => (
                  <div key={column.status} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className={`font-semibold mb-4 text-${column.color}-600 dark:text-${column.color}-400`}>
                      {column.title} ({filteredTasks.filter(t => t.status === column.status).length})
                    </h3>
                    
                    <div className="space-y-3">
                      {filteredTasks
                        .filter(task => task.status === column.status)
                        .map((task) => (
                          <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                              <span className={`w-2 h-2 rounded-full ${
                                task.priority === 'urgent' ? 'bg-red-500' :
                                task.priority === 'high' ? 'bg-orange-500' :
                                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                            
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>{task.category}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEdit(task)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - date.getDay() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayTasks = filteredTasks.filter(task => task.dueDate === dateStr);
                    
                    return (
                      <div key={i} className="min-h-[80px] p-1 border border-gray-200 dark:border-gray-700 rounded">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div key={task.id} className={`text-xs p-1 rounded truncate ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            
            {(() => {
              const analytics = calculateAnalytics();
              
              return (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completionRate.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Time/Task</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageTimePerTask.toFixed(0)}m</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTasks}</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {analytics.productivityTrend === 'up' ? '📈' : analytics.productivityTrend === 'down' ? '📉' : '➡️'}
                          </p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          {analytics.productivityTrend === 'up' ? 
                            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" /> :
                            <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
                          const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
                          const categoryData = categories.find(c => c.name === category);
                          
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: categoryData?.color || '#6b7280' }}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: categoryData?.color || '#6b7280'
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Daily Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Activity</h3>
                      <div className="space-y-3">
                        {analytics.dailyCompletion.map((day) => (
                          <div key={day.date} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{day.completed}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{day.created}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insights & Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Peak Productivity</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          You complete most tasks on weekdays. Consider scheduling important tasks during these days.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Time Management</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your average task completion time is {analytics.averageTimePerTask.toFixed(0)} minutes. Great job staying focused!
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>

            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                    className="select w-32"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default View</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Default task view mode</p>
                  </div>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultView: e.target.value as any }))}
                    className="select w-32"
                  >
                    <option value="list">List</option>
                    <option value="kanban">Kanban</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interface language</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="select w-32"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Categories Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <button
                      onClick={() => {
                        const updatedCategories = categories.filter(c => c.id !== category.id);
                        setCategories(updatedCategories);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={exportTasks}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Tasks
                </button>

                <button
                  onClick={downloadTemplate}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download Template
                </button>

                <label className="btn btn-secondary flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Tasks
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    const confirmed = window.confirm('Are you sure you want to delete all data? This action cannot be undone.');
                    if (confirmed) clearAllData();
                  }}
                  className="btn btn-error flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                  setTaskForm({
                    title: '',
                    description: '',
                    category: '',
                    priority: 'medium',
                    dueDate: '',
                    estimatedTime: 60,
                    tags: []
                  });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full min-h-[80px] resize-y"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                    className="select w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="select w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Time (min)
                  </label>
                  <input
                    type="number"
                    value={taskForm.estimatedTime}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 60 }))}
                    className="input w-full"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={taskForm.tags.join(', ')}
                  onChange={(e) => setTaskForm(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="input w-full"
                  placeholder="work, urgent, meeting"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                    setTaskForm({
                      title: '',
                      description: '',
                      category: '',
                      priority: 'medium',
                      dueDate: '',
                      estimatedTime: 60,
                      tags: []
                    });
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingTask ? 'Update' : 'Create'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Panel Modal */}
      {showAiPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Task Assistant
              </h3>
              <button
                onClick={() => {
                  setShowAiPanel(false);
                  setAiPrompt('');
                  setAiResult(null);
                  setAiError(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe your task or ask for help
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'Create a task to prepare for the quarterly team meeting including agenda preparation and room booking'"
                  className="input w-full min-h-[100px] resize-y"
                  rows={4}
                />
              </div>

              <button
                onClick={handleAiAnalysis}
                disabled={!aiPrompt.trim() || aiLoading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze with AI
                  </>
                )}
              </button>

              {aiError && (
                <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Error: {aiError.message || 'Something went wrong. Please try again.'}
                  </p>
                </div>
              )}

              {aiResult && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">AI Response:</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-blue-700 dark:text-blue-300">
                      {aiResult}
                    </pre>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 <strong>Tip:</strong> The AI can help you break down complex projects, suggest priorities, 
                  estimate time requirements, and even create multiple related tasks. 
                  Note that AI responses may contain inaccuracies, so please review before using.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;