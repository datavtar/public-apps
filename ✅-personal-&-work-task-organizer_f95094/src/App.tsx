import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  CheckCircle, Circle, Plus, Search, Filter, Calendar, BarChart3, Settings,
  User, Briefcase, Star, Clock, AlertCircle, TrendingUp, Target, Brain,
  Download, Upload, Trash2, Edit, X, ChevronDown, Moon, Sun, LogOut,
  FileText, Tag, Users, Home, BookOpen, Coffee, Laptop, Phone, Mail,
  ArrowUp, ArrowDown, ChevronRight, PieChart, Activity, Zap
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'work';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  tags: string[];
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  subtasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskTemplate {
  id: string;
  name: string;
  category: 'personal' | 'work';
  tasks: Omit<Task, 'id' | 'createdAt' | 'completedAt'>[];
}

interface AppSettings {
  theme: 'light' | 'dark';
  defaultCategory: 'personal' | 'work';
  notifications: boolean;
  language: string;
  timezone: string;
  workingHours: { start: string; end: string };
}

type ViewMode = 'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'templates' | 'settings';
type FilterMode = 'all' | 'personal' | 'work' | 'today' | 'upcoming' | 'completed';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    defaultCategory: 'personal',
    notifications: true,
    language: 'en',
    timezone: 'UTC',
    workingHours: { start: '09:00', end: '17:00' }
  });

  // UI State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'personal' as 'personal' | 'work',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    estimatedTime: 30,
    tags: [] as string[],
    subtasks: [] as SubTask[]
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todo-tasks');
    const savedTemplates = localStorage.getItem('todo-templates');
    const savedSettings = localStorage.getItem('todo-settings');

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to parse saved tasks:', error);
      }
    }

    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Failed to parse saved templates:', error);
      }
    } else {
      // Initialize with default templates
      const defaultTemplates: TaskTemplate[] = [
        {
          id: '1',
          name: 'Weekly Planning',
          category: 'work',
          tasks: [
            {
              title: 'Review last week\'s progress',
              description: 'Analyze completed tasks and blockers',
              category: 'work',
              priority: 'high',
              status: 'todo',
              tags: ['planning', 'review'],
              dueDate: new Date().toISOString().split('T')[0],
              estimatedTime: 30,
              subtasks: []
            },
            {
              title: 'Plan upcoming week',
              description: 'Set priorities and schedule tasks',
              category: 'work',
              priority: 'high',
              status: 'todo',
              tags: ['planning'],
              dueDate: new Date().toISOString().split('T')[0],
              estimatedTime: 45,
              subtasks: []
            }
          ]
        },
        {
          id: '2',
          name: 'Health & Wellness',
          category: 'personal',
          tasks: [
            {
              title: 'Morning exercise',
              description: '30 minutes of physical activity',
              category: 'personal',
              priority: 'medium',
              status: 'todo',
              tags: ['health', 'routine'],
              dueDate: new Date().toISOString().split('T')[0],
              estimatedTime: 30,
              subtasks: []
            },
            {
              title: 'Meal prep',
              description: 'Prepare healthy meals for the week',
              category: 'personal',
              priority: 'medium',
              status: 'todo',
              tags: ['health', 'cooking'],
              dueDate: new Date().toISOString().split('T')[0],
              estimatedTime: 90,
              subtasks: []
            }
          ]
        }
      ];
      setTemplates(defaultTemplates);
    }

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setIsDarkMode(parsed.theme === 'dark');
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // Initialize with sample data if no tasks exist
    if (!savedTasks) {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Draft and review the Q2 project proposal for client presentation',
          category: 'work',
          priority: 'high',
          status: 'in-progress',
          tags: ['project', 'client', 'proposal'],
          dueDate: '2025-06-07',
          createdAt: '2025-06-01T09:00:00Z',
          estimatedTime: 120,
          subtasks: [
            { id: 's1', title: 'Research requirements', completed: true },
            { id: 's2', title: 'Draft proposal', completed: false },
            { id: 's3', title: 'Review with team', completed: false }
          ]
        },
        {
          id: '2',
          title: 'Grocery shopping',
          description: 'Buy ingredients for meal prep this week',
          category: 'personal',
          priority: 'medium',
          status: 'todo',
          tags: ['shopping', 'food'],
          dueDate: '2025-06-06',
          createdAt: '2025-06-03T10:30:00Z',
          estimatedTime: 45,
          subtasks: []
        },
        {
          id: '3',
          title: 'Team standup meeting',
          description: 'Daily sync with development team',
          category: 'work',
          priority: 'medium',
          status: 'completed',
          tags: ['meeting', 'team'],
          dueDate: '2025-06-05',
          createdAt: '2025-06-05T08:00:00Z',
          completedAt: '2025-06-05T09:15:00Z',
          estimatedTime: 30,
          actualTime: 25,
          subtasks: []
        }
      ];
      setTasks(sampleTasks);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todo-templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('todo-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper functions
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === today && task.status !== 'completed');
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate > today && dueDate <= nextWeek && task.status !== 'completed';
    });
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply filter mode
    switch (filterMode) {
      case 'personal':
        filtered = filtered.filter(task => task.category === 'personal');
        break;
      case 'work':
        filtered = filtered.filter(task => task.category === 'work');
        break;
      case 'today':
        filtered = getTodayTasks();
        break;
      case 'upcoming':
        filtered = getUpcomingTasks();
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by priority and due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const getProductivityStats = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    const personalCompleted = completedTasks.filter(task => task.category === 'personal').length;
    const workCompleted = completedTasks.filter(task => task.category === 'work').length;
    
    const avgTimeAccuracy = completedTasks
      .filter(task => task.estimatedTime && task.actualTime)
      .reduce((acc, task) => {
        const accuracy = Math.abs(task.actualTime! - task.estimatedTime!) / task.estimatedTime!;
        return acc + (1 - accuracy);
      }, 0) / completedTasks.length * 100 || 0;

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate,
      personalCompleted,
      workCompleted,
      avgTimeAccuracy
    };
  };

  // Task operations
  const createTask = (taskData: typeof taskForm) => {
    const newTask: Task = {
      id: generateId(),
      ...taskData,
      status: 'todo',
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [newTask, ...prev]);
    resetTaskForm();
    setShowTaskModal(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        if (updates.status === 'completed' && task.status !== 'completed') {
          updatedTask.completedAt = new Date().toISOString();
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    let newStatus: Task['status'];
    if (task.status === 'todo') newStatus = 'in-progress';
    else if (task.status === 'in-progress') newStatus = 'completed';
    else newStatus = 'todo';
    
    updateTask(taskId, { status: newStatus });
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      category: settings.defaultCategory,
      priority: 'medium',
      dueDate: '',
      estimatedTime: 30,
      tags: [],
      subtasks: []
    });
    setEditingTask(null);
  };

  const editTask = (task: Task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      estimatedTime: task.estimatedTime || 30,
      tags: task.tags,
      subtasks: task.subtasks
    });
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (!taskForm.title.trim()) return;
    
    if (editingTask) {
      updateTask(editingTask.id, taskForm);
      setEditingTask(null);
    } else {
      createTask(taskForm);
    }
    
    resetTaskForm();
    setShowTaskModal(false);
  };

  // AI operations
  const handleAiSuggestion = (type: 'tasks' | 'productivity' | 'planning') => {
    let prompt = '';
    
    switch (type) {
      case 'tasks':
        prompt = `Based on my current tasks and productivity patterns, suggest 3-5 new tasks that would help me be more productive. Current tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, category: t.category, priority: t.priority })))}. Return JSON with structure: {"suggestions": [{"title": "", "description": "", "category": "personal|work", "priority": "low|medium|high", "estimatedTime": 30}]}`;
        break;
      case 'productivity':
        prompt = `Analyze my task completion patterns and provide productivity insights. Task data: ${JSON.stringify(getProductivityStats())}. Return JSON with structure: {"insights": [{"type": "strength|improvement", "title": "", "description": "", "actionable_tips": [""]}]}`;
        break;
      case 'planning':
        prompt = `Help me plan my upcoming week based on current tasks and priorities. Tasks: ${JSON.stringify(getFilteredTasks().slice(0, 10))}. Return JSON with structure: {"weekly_plan": {"monday": [{"task": "", "time_slot": ""}], "tuesday": [], "recommendations": [""]}}`;
        break;
    }
    
    setAiPrompt(prompt);
    setShowAiPanel(true);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to get AI suggestions');
    }
  };

  const processAiResult = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      
      if (parsed.suggestions) {
        // Add suggested tasks
        const newTasks = parsed.suggestions.map((suggestion: any) => ({
          id: generateId(),
          ...suggestion,
          status: 'todo' as const,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          tags: ['ai-suggested'],
          subtasks: []
        }));
        
        setTasks(prev => [...newTasks, ...prev]);
      }
      
      setAiResult(result);
    } catch (error) {
      setAiResult(result); // Show raw result if not JSON
    }
  };

  // Template operations
  const createTemplate = (name: string, category: 'personal' | 'work', selectedTasks: Task[]) => {
    const template: TaskTemplate = {
      id: generateId(),
      name,
      category,
      tasks: selectedTasks.map(task => ({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: 'todo' as const,
        tags: task.tags,
        dueDate: '',
        estimatedTime: task.estimatedTime,
        subtasks: task.subtasks
      }))
    };
    
    setTemplates(prev => [template, ...prev]);
  };

  const applyTemplate = (template: TaskTemplate) => {
    const newTasks = template.tasks.map(taskData => ({
      id: generateId(),
      ...taskData,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }));
    
    setTasks(prev => [...newTasks, ...prev]);
  };

  // Data export/import
  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Tags', 'Estimated Time'];
      const csvData = tasks.map(task => [
        task.title,
        task.description,
        task.category,
        task.priority,
        task.status,
        task.dueDate,
        task.tags.join('; '),
        task.estimatedTime?.toString() || ''
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const data = { tasks, templates, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (data.tasks) setTasks(data.tasks);
          if (data.templates) setTemplates(data.templates);
          if (data.settings) setSettings(data.settings);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
          const importedTasks = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, ''));
              return {
                id: generateId(),
                title: values[0] || '',
                description: values[1] || '',
                category: (values[2] as 'personal' | 'work') || 'personal',
                priority: (values[3] as 'low' | 'medium' | 'high') || 'medium',
                status: (values[4] as 'todo' | 'in-progress' | 'completed') || 'todo',
                dueDate: values[5] || new Date().toISOString().split('T')[0],
                tags: values[6] ? values[6].split('; ') : [],
                estimatedTime: parseInt(values[7]) || 30,
                createdAt: new Date().toISOString(),
                subtasks: []
              };
            });
          
          setTasks(prev => [...importedTasks, ...prev]);
        }
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Tags', 'Estimated Time'],
      ['Sample Task', 'Task description', 'personal', 'medium', 'todo', '2025-06-10', 'tag1; tag2', '30'],
      ['Work Meeting', 'Team standup', 'work', 'high', 'todo', '2025-06-08', 'meeting; team', '60']
    ];
    
    const csvContent = templateData
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render components
  const renderSidebar = () => (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">TodoPro</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Personal & Work</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'tasks', icon: CheckCircle, label: 'Tasks' },
          { id: 'calendar', icon: Calendar, label: 'Calendar' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'templates', icon: FileText, label: 'Templates' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setCurrentView(item.id as ViewMode)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600 dark:text-slate-300" />
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
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
            {currentView}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {currentView === 'tasks' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 pr-4 py-2 w-64"
                />
              </div>
              
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as FilterMode)}
                className="input py-2 w-32"
              >
                <option value="all">All</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );

  const renderDashboard = () => {
    const stats = getProductivityStats();
    const todayTasks = getTodayTasks();
    const upcomingTasks = getUpcomingTasks();
    
    return (
      <div id="welcome_fallback" className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-desc">
              <span className="text-green-600">{stats.completedTasks} completed</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Completion Rate</div>
            <div className="stat-value">{stats.completionRate.toFixed(1)}%</div>
            <div className="stat-desc">
              <span className={stats.completionRate > 75 ? 'text-green-600' : 'text-orange-600'}>
                {stats.completionRate > 75 ? '↗︎ Great progress' : '→ Keep going'}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Work Tasks</div>
            <div className="stat-value">{stats.workCompleted}</div>
            <div className="stat-desc">Completed</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Personal Tasks</div>
            <div className="stat-value">{stats.personalCompleted}</div>
            <div className="stat-desc">Completed</div>
          </div>
        </div>
        
        {/* AI Suggestions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              AI Productivity Assistant
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              id="ai-task-suggestions"
              onClick={() => handleAiSuggestion('tasks')}
              className="btn bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-300 p-4 text-left"
              disabled={aiLoading}
            >
              <Target className="w-6 h-6 mb-2" />
              <div className="font-medium">Task Suggestions</div>
              <div className="text-sm opacity-75">Get AI-powered task recommendations</div>
            </button>
            
            <button
              onClick={() => handleAiSuggestion('productivity')}
              className="btn bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 p-4 text-left"
              disabled={aiLoading}
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <div className="font-medium">Productivity Insights</div>
              <div className="text-sm opacity-75">Analyze your work patterns</div>
            </button>
            
            <button
              onClick={() => handleAiSuggestion('planning')}
              className="btn bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 p-4 text-left"
              disabled={aiLoading}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <div className="font-medium">Weekly Planning</div>
              <div className="text-sm opacity-75">Plan your upcoming week</div>
            </button>
          </div>
        </div>
        
        {/* Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Today's Tasks ({todayTasks.length})
            </h3>
            
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${
                        task.category === 'work' ? 'badge-info' : 'badge-success'
                      }`}>
                        {task.category === 'work' ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {task.category}
                      </span>
                      <span className={`badge ${
                        task.priority === 'high' ? 'badge-error' :
                        task.priority === 'medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {todayTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks for today!</p>
                  <p className="text-sm">Great job staying on top of things.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Upcoming Tasks */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-blue-600" />
              Upcoming Tasks ({upcomingTasks.length})
            </h3>
            
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <span className={`badge ${
                    task.category === 'work' ? 'badge-info' : 'badge-success'
                  }`}>
                    {task.category === 'work' ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  </span>
                </div>
              ))}
              
              {upcomingTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming tasks!</p>
                  <p className="text-sm">Time to plan ahead.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    const filteredTasks = getFilteredTasks();
    
    return (
      <div id="generation_issue_fallback" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tasks ({filteredTasks.length})
            </h3>
          </div>
          
          <button
            id="add-new-task"
            onClick={() => {
              resetTaskForm();
              setShowTaskModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
        
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className={`card hover:shadow-lg transition-shadow ${
              task.status === 'completed' ? 'opacity-75' : ''
            }`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : task.status === 'in-progress'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : task.status === 'in-progress' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-lg font-medium ${
                        task.status === 'completed'
                          ? 'line-through text-gray-500 dark:text-slate-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>
                      
                      {task.description && (
                        <p className="text-gray-600 dark:text-slate-300 mt-1">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={`badge ${
                          task.category === 'work' ? 'badge-info' : 'badge-success'
                        }`}>
                          {task.category === 'work' ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {task.category}
                        </span>
                        
                        <span className={`badge ${
                          task.priority === 'high' ? 'badge-error' :
                          task.priority === 'medium' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {task.priority === 'high' ? <AlertCircle className="w-3 h-3" /> :
                           task.priority === 'medium' ? <Clock className="w-3 h-3" /> :
                           <ArrowDown className="w-3 h-3" />}
                          {task.priority}
                        </span>
                        
                        <span className="badge bg-gray-100 text-gray-700 dark:bg-slate-600 dark:text-slate-300">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        
                        {task.estimatedTime && (
                          <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime}m
                          </span>
                        )}
                        
                        {task.tags.map(tag => (
                          <span key={tag} className="badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {task.subtasks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {task.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                              <div className={`w-3 h-3 rounded border ${
                                subtask.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`} />
                              <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-slate-300'}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => editTask(task)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-4">
                {searchQuery || filterMode !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first task to get started!'}
              </p>
              <button
                onClick={() => {
                  resetTaskForm();
                  setShowTaskModal(true);
                }}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTaskModal = () => {
    if (!showTaskModal) return null;
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTaskModal(false);
        resetTaskForm();
      }
    };
    
    return (
      <div 
        className="modal-backdrop"
        onClick={() => {
          setShowTaskModal(false);
          resetTaskForm();
        }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div 
          className="modal-content max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              onClick={() => {
                setShowTaskModal(false);
                resetTaskForm();
              }}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                className="input"
                rows={3}
                placeholder="Enter task description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value as 'personal' | 'work' }))}
                  className="input"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Estimated Time (minutes)</label>
              <input
                type="number"
                value={taskForm.estimatedTime}
                onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                className="input"
                min="5"
                step="5"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => {
                setShowTaskModal(false);
                resetTaskForm();
              }}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={saveTask}
              disabled={!taskForm.title.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const stats = getProductivityStats();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayTasks = tasks.filter(task => 
        new Date(task.createdAt).toDateString() === date.toDateString()
      );
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'completed').length
      };
    }).reverse();
    
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Overview */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              Productivity Overview
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Completion Rate</span>
                <span className="font-medium">{stats.completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-semibold text-green-700 dark:text-green-300">
                    {stats.personalCompleted}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Personal</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                    {stats.workCompleted}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Work</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weekly Activity */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Weekly Activity
            </h3>
            
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-600 dark:text-slate-400">
                    {day.day}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${day.created * 10}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-slate-400 w-8">
                      {day.created}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Task Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Task Distribution
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">By Status</h4>
              <div className="space-y-2">
                {[
                  { status: 'todo', label: 'To Do', color: 'bg-gray-500' },
                  { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
                  { status: 'completed', label: 'Completed', color: 'bg-green-500' }
                ].map(item => {
                  const count = tasks.filter(task => task.status === item.status).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${item.color}`} />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-slate-400">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* By Priority */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">By Priority</h4>
              <div className="space-y-2">
                {[
                  { priority: 'high', label: 'High', color: 'bg-red-500' },
                  { priority: 'medium', label: 'Medium', color: 'bg-yellow-500' },
                  { priority: 'low', label: 'Low', color: 'bg-green-500' }
                ].map(item => {
                  const count = tasks.filter(task => task.priority === item.priority).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  
                  return (
                    <div key={item.priority} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${item.color}`} />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-slate-400">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* By Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">By Category</h4>
              <div className="space-y-2">
                {[
                  { category: 'work', label: 'Work', color: 'bg-blue-500' },
                  { category: 'personal', label: 'Personal', color: 'bg-green-500' }
                ].map(item => {
                  const count = tasks.filter(task => task.category === item.category).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  
                  return (
                    <div key={item.category} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${item.color}`} />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-slate-400">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Theme</label>
              <p className="text-xs text-gray-500 dark:text-slate-400">Choose your preferred theme</p>
            </div>
            <button
              onClick={() => {
                const newTheme = settings.theme === 'light' ? 'dark' : 'light';
                setSettings(prev => ({ ...prev, theme: newTheme }));
                setIsDarkMode(newTheme === 'dark');
              }}
              className="theme-toggle"
            >
              <span className="theme-toggle-thumb" />
            </button>
          </div>
          
          <div className="form-group">
            <label className="form-label">Default Category</label>
            <select
              value={settings.defaultCategory}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultCategory: e.target.value as 'personal' | 'work' }))}
              className="input w-48"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="input w-48"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="input w-48"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Working Hours</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, start: e.target.value }
              }))}
              className="input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, end: e.target.value }
              }))}
              className="input"
            />
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => exportData('csv')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            
            <button
              onClick={() => exportData('json')}
              className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            
            <button
              onClick={downloadTemplate}
              className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Template
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Data
              <input
                type="file"
                accept=".csv,.json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                  setTasks([]);
                  setTemplates([]);
                  localStorage.removeItem('todo-tasks');
                  localStorage.removeItem('todo-templates');
                }
              }}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAiPanel = () => {
    if (!showAiPanel) return null;
    
    return (
      <div 
        className="modal-backdrop"
        onClick={() => setShowAiPanel(false)}
      >
        <div 
          className="modal-content max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              AI Productivity Assistant
            </h3>
            <button
              onClick={() => setShowAiPanel(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {aiLoading && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-blue-700 dark:text-blue-300">AI is analyzing your data...</span>
              </div>
            )}
            
            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="w-5 h-5" />
                Error: {aiError}
              </div>
            )}
            
            {aiResult && (
              <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Response:</h4>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                    {aiResult}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => setShowAiPanel(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={processAiResult}
        onError={setAiError}
        onLoading={setAiLoading}
      />
      
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderHeader()}
        
        <main className="flex-1 overflow-auto">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'tasks' && renderTasks()}
          {currentView === 'analytics' && renderAnalytics()}
          {currentView === 'settings' && renderSettings()}
        </main>
        
        <footer className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
          <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </footer>
      </div>
      
      {renderTaskModal()}
      {renderAiPanel()}
    </div>
  );
};

export default App;