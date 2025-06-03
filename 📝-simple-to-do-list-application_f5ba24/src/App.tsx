import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Plus, Search, Filter, ArrowDownUp, Calendar, Grid3X3, List,
  Settings, LogOut, Bell, TrendingUp, CheckCircle2, Circle,
  Clock, Flag, Tag, Edit, Trash2, Download, Upload, Menu,
  X, ChevronDown, Star, BarChart3, PieChart, Target,
  FileText, Brain, Zap, Sun, Moon, Globe, Palette
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  defaultView: 'list' | 'grid' | 'calendar';
  showCompletedTasks: boolean;
  autoArchiveCompleted: boolean;
  dailyGoal: number;
}

type ViewType = 'dashboard' | 'tasks' | 'categories' | 'analytics' | 'settings';
type TaskView = 'list' | 'grid' | 'calendar';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [taskView, setTaskView] = useState<TaskView>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    defaultView: 'list',
    showCompletedTasks: true,
    autoArchiveCompleted: false,
    dailyGoal: 5
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'priority' | 'created'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    tags: '',
    estimatedTime: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'Tag',
    description: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todo-tasks');
    const savedCategories = localStorage.getItem('todo-categories');
    const savedSettings = localStorage.getItem('todo-settings');

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories(getDefaultCategories());
      }
    } else {
      setCategories(getDefaultCategories());
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todo-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('todo-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme
  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === 'dark' || 
          (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    applyTheme();
    
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  const getDefaultCategories = (): Category[] => [
    { id: '1', name: 'Work', color: '#3B82F6', icon: 'Target', description: 'Work-related tasks' },
    { id: '2', name: 'Personal', color: '#10B981', icon: 'User', description: 'Personal tasks and goals' },
    { id: '3', name: 'Shopping', color: '#F59E0B', icon: 'ShoppingBag', description: 'Shopping lists and purchases' },
    { id: '4', name: 'Health', color: '#EF4444', icon: 'Heart', description: 'Health and wellness tasks' },
    { id: '5', name: 'Learning', color: '#8B5CF6', icon: 'BookOpen', description: 'Learning and education' }
  ];

  const handleCreateTask = () => {
    if (!taskForm.title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      category: taskForm.category || categories[0]?.id || '',
      priority: taskForm.priority,
      status: 'pending',
      dueDate: taskForm.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
      estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : undefined
    };

    setTasks(prev => [newTask, ...prev]);
    resetTaskForm();
    setShowTaskModal(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !taskForm.title.trim()) return;

    const updatedTask: Task = {
      ...editingTask,
      title: taskForm.title,
      description: taskForm.description,
      category: taskForm.category,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      updatedAt: new Date().toISOString(),
      tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
      estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : undefined
    };

    setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
    resetTaskForm();
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return task;
    }));
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      tags: '',
      estimatedTime: ''
    });
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags.join(', '),
      estimatedTime: task.estimatedTime?.toString() || ''
    });
    setShowTaskModal(true);
  };

  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryForm.name,
      color: categoryForm.color,
      icon: categoryForm.icon,
      description: categoryForm.description
    };

    setCategories(prev => [...prev, newCategory]);
    resetCategoryForm();
    setShowCategoryModal(false);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryForm.name.trim()) return;

    const updatedCategory: Category = {
      ...editingCategory,
      name: categoryForm.name,
      color: categoryForm.color,
      icon: categoryForm.icon,
      description: categoryForm.description
    };

    setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
    resetCategoryForm();
    setEditingCategory(null);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    // Update tasks that use this category
    setTasks(prev => prev.map(task => 
      task.category === categoryId 
        ? { ...task, category: categories[0]?.id || '', updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      color: '#3B82F6',
      icon: 'Tag',
      description: ''
    });
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color,
      icon: category.icon,
      description: category.description
    });
    setShowCategoryModal(true);
  };

  const openConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || task.category === filterCategory;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesStatus = !filterStatus || task.status === filterStatus;
    const showCompleted = settings.showCompletedTasks || task.status !== 'completed';

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && showCompleted;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'created':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const handleBulkAction = (action: 'complete' | 'delete' | 'priority') => {
    if (action === 'complete') {
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task.id) 
          ? { ...task, status: 'completed' as const, updatedAt: new Date().toISOString() }
          : task
      ));
    } else if (action === 'delete') {
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    }
    setSelectedTasks([]);
  };

  const handleExportData = () => {
    const dataToExport = {
      tasks,
      categories,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const csvContent = tasks.map(task => {
      const category = categories.find(cat => cat.id === task.category);
      return [
        task.title,
        task.description,
        category?.name || '',
        task.priority,
        task.status,
        task.dueDate,
        task.tags.join(';'),
        task.estimatedTime || '',
        task.actualTime || '',
        task.createdAt
      ].join(',');
    });
    
    const csvHeader = 'Title,Description,Category,Priority,Status,Due Date,Tags,Estimated Time,Actual Time,Created At\n';
    const csvData = csvHeader + csvContent.join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        const importedTasks: Task[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 6 && values[0].trim()) {
            const newTask: Task = {
              id: Date.now().toString() + i,
              title: values[0].trim(),
              description: values[1] || '',
              category: categories.find(cat => cat.name === values[2])?.id || categories[0]?.id || '',
              priority: (values[3] as Task['priority']) || 'medium',
              status: (values[4] as Task['status']) || 'pending',
              dueDate: values[5] || '',
              tags: values[6] ? values[6].split(';').map(tag => tag.trim()) : [],
              estimatedTime: values[7] ? parseInt(values[7]) : undefined,
              actualTime: values[8] ? parseInt(values[8]) : undefined,
              createdAt: values[9] || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            importedTasks.push(newTask);
          }
        }
        
        setTasks(prev => [...importedTasks, ...prev]);
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const templateContent = 'Title,Description,Category,Priority,Status,Due Date,Tags,Estimated Time,Actual Time,Created At\nSample Task,This is a sample task description,Work,medium,pending,2025-06-10,urgent;important,60,,2025-06-03T10:00:00.000Z';
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAiTaskSuggestion = () => {
    if (!aiPrompt.trim()) return;
    
    const enhancedPrompt = `Generate task suggestions based on: "${aiPrompt}". Return a JSON array of tasks with the following structure: [{"title": "Task title", "description": "Task description", "priority": "low|medium|high|urgent", "category": "Work|Personal|Shopping|Health|Learning", "estimatedTime": number_in_minutes, "tags": ["tag1", "tag2"]}]. Provide 3-5 relevant tasks.`;
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(enhancedPrompt);
  };

  const handleProcessAiResult = () => {
    if (!aiResult) return;
    
    try {
      const suggestions = JSON.parse(aiResult);
      if (Array.isArray(suggestions)) {
        const newTasks: Task[] = suggestions.map((suggestion, index) => ({
          id: (Date.now() + index).toString(),
          title: suggestion.title || 'Untitled Task',
          description: suggestion.description || '',
          category: categories.find(cat => cat.name === suggestion.category)?.id || categories[0]?.id || '',
          priority: suggestion.priority || 'medium',
          status: 'pending' as const,
          dueDate: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: suggestion.tags || [],
          estimatedTime: suggestion.estimatedTime
        }));
        
        setTasks(prev => [...newTasks, ...prev]);
        setShowAiModal(false);
        setAiPrompt('');
        setAiResult(null);
      }
    } catch (error) {
      setAiError('Failed to process AI suggestions');
    }
  };

  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate
    };
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const stats = getStats();

  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.first_name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Here's your productivity overview for today.
          </p>
        </div>
        <button
          onClick={() => setShowAiModal(true)}
          className="btn btn-primary flex items-center gap-2"
          id="ai-suggestions-btn"
        >
          <Brain className="w-4 h-4" />
          AI Task Suggestions
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-overview">
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-desc">All your tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-green-600">{stats.completedTasks}</div>
          <div className="stat-desc">{stats.completionRate}% completion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-blue-600">{stats.inProgressTasks}</div>
          <div className="stat-desc">Currently working on</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Overdue</div>
          <div className="stat-value text-red-600">{stats.overdueTasks}</div>
          <div className="stat-desc">Need attention</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card" id="recent-tasks">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {sortedTasks.slice(0, 5).map(task => {
            const category = categories.find(cat => cat.id === task.category);
            return (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <button
                  onClick={() => handleToggleTaskStatus(task.id)}
                  className="flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-primary-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {category && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {category.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="quick-actions">
        <button
          onClick={() => {
            setEditingTask(null);
            resetTaskForm();
            setShowTaskModal(true);
          }}
          className="card hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400"
        >
          <div className="text-center py-4">
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Add New Task</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Create a new task quickly</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentView('categories')}
          className="card hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="text-center py-4">
            <Tag className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Manage Categories</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{categories.length} categories</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentView('analytics')}
          className="card hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="text-center py-4">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">View Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Track your progress</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6" id="generation_issue_fallback">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTask(null);
              resetTaskForm();
              setShowTaskModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
            id="add-task-btn"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" id="task-filters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input input-sm"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-slate-400">View:</span>
            <div className="flex bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setTaskView('list')}
                className={`p-2 rounded ${taskView === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTaskView('grid')}
                className={`p-2 rounded ${taskView === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {selectedTasks.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedTasks.length} task(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTasks([])}
                  className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Display */}
      <div id="tasks-display">
        {sortedTasks.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              {searchTerm || filterCategory || filterPriority || filterStatus
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            <button
              onClick={() => {
                setEditingTask(null);
                resetTaskForm();
                setShowTaskModal(true);
              }}
              className="btn btn-primary"
            >
              Add Your First Task
            </button>
          </div>
        ) : (
          <div className={taskView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {sortedTasks.map(task => {
              const category = categories.find(cat => cat.id === task.category);
              const isOverdue = task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date();
              
              return (
                <div
                  key={task.id}
                  className={`card hover:shadow-lg transition-all duration-200 ${selectedTasks.includes(task.id) ? 'ring-2 ring-primary-500' : ''
                    } ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(prev => [...prev, task.id]);
                        } else {
                          setSelectedTasks(prev => prev.filter(id => id !== task.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <button
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-primary-600" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditTask(task)}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {category && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                            {category.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6" id="categories-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetCategoryForm();
            setShowCategoryModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
          id="add-category-btn"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const categoryTasks = tasks.filter(task => task.category === category.id);
          const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
          
          return (
            <div key={category.id} className="card hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    <Tag className="w-6 h-6" /> {/* Note: This uses a static Tag icon, not category.icon */}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {categoryTasks.length} task(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditCategory(category)}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {completedTasks}/{categoryTasks.length} completed
                </div>
                <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: category.color,
                      width: `${categoryTasks.length > 0 ? (completedTasks / categoryTasks.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6" id="analytics-section">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Completion Rate</div>
          <div className="stat-value text-green-600">{stats.completionRate}%</div>
          <div className="stat-desc">Overall progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Average Time</div>
          <div className="stat-value">
            {tasks.filter(t => t.actualTime).length > 0
              ? Math.round(tasks.filter(t => t.actualTime).reduce((sum, t) => sum + (t.actualTime || 0), 0) / tasks.filter(t => t.actualTime).length)
              : 0}m
          </div>
          <div className="stat-desc">Per completed task</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">This Week</div>
          <div className="stat-value">
            {tasks.filter(t => {
              const taskDate = new Date(t.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return taskDate >= weekAgo;
            }).length}
          </div>
          <div className="stat-desc">Tasks created</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Productivity Score</div>
          <div className="stat-value text-blue-600">
            {Math.round((stats.completionRate + (stats.overdueTasks === 0 ? 100 : Math.max(0, 100 - stats.overdueTasks * 10))) / 2)}
          </div>
          <div className="stat-desc">Based on completion & timeliness</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h2>
        <div className="space-y-4">
          {categories.map(category => {
            const categoryTasks = tasks.filter(task => task.category === category.id);
            const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
            const percentage = categoryTasks.length > 0 ? (completedTasks / categoryTasks.length) * 100 : 0;
            
            return (
              <div key={category.id} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600 dark:text-slate-400 truncate">
                  {category.name}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: category.color,
                      width: `${percentage}%`
                    }}
                  />
                </div>
                <div className="w-20 text-sm text-gray-600 dark:text-slate-400 text-right">
                  {completedTasks}/{categoryTasks.length}
                </div>
                <div className="w-12 text-sm text-gray-600 dark:text-slate-400 text-right">
                  {Math.round(percentage)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['urgent', 'high', 'medium', 'low'] as const).map(priority => {
            const priorityTasks = tasks.filter(task => task.priority === priority);
            const completed = priorityTasks.filter(task => task.status === 'completed').length;
            
            return (
              <div key={priority} className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg ${priority === 'urgent' ? 'bg-red-500' :
                  priority === 'high' ? 'bg-orange-500' :
                  priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                  {priorityTasks.length}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {priority}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {completed} completed
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="settings-section">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      {/* Appearance Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as AppSettings['theme'] }))}
              className="input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Default View</label>
            <select
              value={settings.defaultView}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultView: e.target.value as AppSettings['defaultView'] }))}
              className="input"
            >
              <option value="list">List</option>
              <option value="grid">Grid</option>
              <option value="calendar">Calendar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Task Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Show Completed Tasks</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Display completed tasks in task lists</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCompletedTasks}
                onChange={(e) => setSettings(prev => ({ ...prev, showCompletedTasks: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Auto-archive Completed Tasks</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Automatically hide tasks after completion</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoArchiveCompleted}
                onChange={(e) => setSettings(prev => ({ ...prev, autoArchiveCompleted: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div>
            <label className="form-label">Daily Goal (tasks)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.dailyGoal}
              onChange={(e) => setSettings(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 5 }))}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Data Management
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              id="export-data-btn"
            >
              <Download className="w-4 h-4" />
              Export Data (CSV)
            </button>
            
            <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Data (CSV)
              <input
                type="file"
                accept=".csv"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
            
            <button
              onClick={downloadTemplate}
              className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Template
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <button
              onClick={() => {
                openConfirmDialog(
                  'Delete All Data',
                  'Are you sure you want to delete all data? This action cannot be undone.',
                  () => {
                    setTasks([]);
                    setCategories(getDefaultCategories());
                    localStorage.removeItem('todo-tasks');
                    localStorage.removeItem('todo-categories');
                    closeConfirmDialog();
                  }
                );
              }}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {currentUser?.first_name} {currentUser?.last_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{currentUser?.email}</div>
          </div>
          <button
            onClick={logout}
            className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const handleModalOuterClose = () => {
    setShowTaskModal(false);
    setShowCategoryModal(false);
    setShowAiModal(false);
    closeConfirmDialog();
    setEditingTask(null);
    setEditingCategory(null);
  };

  const renderModal = () => {
    if (!showTaskModal && !showCategoryModal && !showAiModal && !confirmDialog.isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalOuterClose();
      }
    };

    return (
      <div className="modal-backdrop" onClick={handleModalOuterClose}>
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {showTaskModal && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                editingTask ? handleUpdateTask() : handleCreateTask();
              }} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Estimated Time (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={taskForm.estimatedTime}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="input"
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={taskForm.tags}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="input"
                    placeholder="e.g., urgent, important, work"
                  />
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      setEditingTask(null);
                    }}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </>
          )}

          {showCategoryModal && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                editingCategory ? handleUpdateCategory() : handleCreateCategory();
              }} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={2}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-slate-600"
                    />
                    <input
                      type="text"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                      className="input flex-1"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                    }}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </>
          )}

          {showAiModal && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Task Suggestions
                </h3>
                <button
                  onClick={() => {
                    setShowAiModal(false);
                    setAiPrompt('');
                    setAiResult(null);
                    setAiError(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Describe what you need to do</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="e.g., I need to prepare for a presentation next week, plan a birthday party, organize my workspace..."
                    autoFocus
                  />
                </div>
                
                {aiError && (
                  <div className="alert alert-error">
                    <X className="w-4 h-4" />
                    <p>{aiError?.message || 'An error occurred while generating suggestions'}</p>
                  </div>
                )}
                
                {aiResult && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Generated Suggestions:</h4>
                    <pre className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">{aiResult}</pre>
                    <button
                      onClick={handleProcessAiResult}
                      className="btn btn-primary mt-3"
                    >
                      Add These Tasks
                    </button>
                  </div>
                )}
                
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiModal(false);
                      setAiPrompt('');
                      setAiResult(null);
                      setAiError(null);
                    }}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAiTaskSuggestion}
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Suggestions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {confirmDialog.isOpen && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {confirmDialog.title}
                </h3>
                <button
                  onClick={closeConfirmDialog}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-4">
                <p className="text-sm text-gray-700 dark:text-slate-300">{confirmDialog.message}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeConfirmDialog}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt} // This prop might be for AILayer's internal use or display
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id as ViewType);
                      setSidebarOpen(false); // Close sidebar on mobile after navigation
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    id={`nav-${item.id}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {currentUser?.first_name} {currentUser?.last_name}
              </span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'tasks' && renderTasks()}
          {currentView === 'categories' && renderCategories()}
          {currentView === 'analytics' && renderAnalytics()}
          {currentView === 'settings' && renderSettings()}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {renderModal()}
    </div>
  );
};

export default App;
