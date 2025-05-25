import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Plus, Search, Filter, Calendar, BarChart3, Settings, Moon, Sun,
  CheckCircle2, Circle, Star, Clock, AlertCircle, Trash2, Edit3,
  ArrowUp, ArrowDown, ArrowRight, User, Target, TrendingUp,
  Download, Upload, Play, Pause, RotateCcw, Brain, Zap,
  ChevronDown, ChevronUp, Tag, MapPin, FileText, Users,
  BookOpen, Briefcase, Home, Heart, Coffee, LogOut, Menu, X
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status = 'pending' | 'in-progress' | 'completed' | 'cancelled';
type ViewMode = 'list' | 'board' | 'calendar' | 'analytics';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  subtasks: SubTask[];
  progress: number; // 0-100
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

interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
}

interface TaskTemplate {
  id: string;
  name: string;
  tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[];
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // State Management
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as Priority,
    dueDate: '',
    tags: '',
    estimatedTime: 60
  });

  // Default Categories
  const defaultCategories: Category[] = [
    { id: '1', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
    { id: '2', name: 'Personal', color: '#10B981', icon: 'User' },
    { id: '3', name: 'Health', color: '#F59E0B', icon: 'Heart' },
    { id: '4', name: 'Learning', color: '#8B5CF6', icon: 'BookOpen' },
    { id: '5', name: 'Home', color: '#06B6D4', icon: 'Home' }
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    const savedCategories = localStorage.getItem('todoCategories');
    const savedTimeEntries = localStorage.getItem('todoTimeEntries');
    const savedTemplates = localStorage.getItem('todoTemplates');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Error parsing saved tasks:', e);
        setTasks([]);
      }
    }
    
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Error parsing saved categories:', e);
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
    }
    
    if (savedTimeEntries) {
      try {
        setTimeEntries(JSON.parse(savedTimeEntries));
      } catch (e) {
        console.error('Error parsing saved time entries:', e);
        setTimeEntries([]);
      }
    }
    
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Error parsing saved templates:', e);
        setTemplates([]);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('todoCategories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('todoTimeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);
  
  useEffect(() => {
    localStorage.setItem('todoTemplates', JSON.stringify(templates));
  }, [templates]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTaskModal(false);
        setShowAiModal(false);
        setShowFilters(false);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          document.getElementById('search-input')?.focus();
        }
        if (e.key === 'n') {
          e.preventDefault();
          handleAddTask();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Utility Functions
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  const getPriorityColor = (priority: Priority) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority];
  };
  
  const getStatusColor = (status: Status) => {
    const colors = {
      pending: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
      'in-progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
      completed: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
      cancelled: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status];
  };

  // Task Management
  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      category: categories[0]?.id || '',
      priority: 'medium',
      dueDate: '',
      tags: '',
      estimatedTime: 60
    });
    setShowTaskModal(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags.join(', '),
      estimatedTime: task.estimatedTime
    });
    setShowTaskModal(true);
  };
  
  const handleSaveTask = () => {
    if (!taskForm.title.trim()) return;
    
    const taskData = {
      title: taskForm.title,
      description: taskForm.description,
      category: taskForm.category,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      estimatedTime: taskForm.estimatedTime,
      actualTime: 0,
      subtasks: [],
      progress: 0
    };
    
    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task
      ));
    } else {
      const newTask: Task = {
        id: generateId(),
        ...taskData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks(prev => [...prev, newTask]);
    }
    
    setShowTaskModal(false);
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };
  
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return {
          ...task,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : 0,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  };
  
  const handleBulkAction = (action: 'complete' | 'delete' | 'priority') => {
    if (action === 'delete') {
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    } else if (action === 'complete') {
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task.id) 
          ? { ...task, status: 'completed' as Status, progress: 100, updatedAt: new Date().toISOString() }
          : task
      ));
    }
    setSelectedTasks([]);
  };

  // Timer Functions
  const startTimer = (taskId: string) => {
    if (activeTimer) {
      stopTimer();
    }
    setActiveTimer(taskId);
    setTimerStart(new Date());
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'in-progress' as Status } : task
    ));
  };
  
  const stopTimer = () => {
    if (activeTimer && timerStart) {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - timerStart.getTime()) / (1000 * 60));
      
      const timeEntry: TimeEntry = {
        id: generateId(),
        taskId: activeTimer,
        startTime: timerStart.toISOString(),
        endTime: endTime.toISOString(),
        duration
      };
      
      setTimeEntries(prev => [...prev, timeEntry]);
      setTasks(prev => prev.map(task => 
        task.id === activeTimer 
          ? { ...task, actualTime: task.actualTime + duration }
          : task
      ));
    }
    
    setActiveTimer(null);
    setTimerStart(null);
  };

  // AI Functions
  const handleAiAnalysis = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please provide a prompt for AI analysis.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };
  
  const handleAiTaskCreation = () => {
    setAiPrompt('Analyze my current tasks and suggest 3-5 new tasks that would help me achieve my goals. Consider my existing categories and priorities. Respond with a JSON array of task objects with title, description, category, priority, and estimatedTime fields.');
    setShowAiModal(true);
  };
  
  const processAiResult = (result: string) => {
    try {
      const aiTasks = JSON.parse(result);
      if (Array.isArray(aiTasks)) {
        const newTasks = aiTasks.map((taskData: any) => ({
          id: generateId(),
          title: taskData.title || 'AI Generated Task',
          description: taskData.description || '',
          category: categories.find(c => c.name.toLowerCase() === taskData.category?.toLowerCase())?.id || categories[0]?.id || '',
          priority: taskData.priority || 'medium',
          status: 'pending' as Status,
          dueDate: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: taskData.tags || [],
          estimatedTime: taskData.estimatedTime || 60,
          actualTime: 0,
          subtasks: [],
          progress: 0
        }));
        setTasks(prev => [...prev, ...newTasks]);
        setShowAiModal(false);
      }
    } catch (e) {
      console.error('Error processing AI result:', e);
    }
  };

  // Filter and Sort Functions
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  }).sort((a, b) => {
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
      default:
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Analytics Data
  const getAnalyticsData = () => {
    const statusData = [
      { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#6B7280' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3B82F6' },
      { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10B981' },
      { name: 'Cancelled', value: tasks.filter(t => t.status === 'cancelled').length, color: '#EF4444' }
    ];
    
    const priorityData = [
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#3B82F6' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#F97316' },
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#EF4444' }
    ];
    
    const categoryData = categories.map(cat => ({
      name: cat.name,
      value: tasks.filter(t => t.category === cat.id).length,
      color: cat.color
    }));
    
    return { statusData, priorityData, categoryData };
  };

  // Export Functions
  const exportTasks = () => {
    const csvContent = [
      ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Created', 'Tags', 'Estimated Time', 'Actual Time'],
      ...tasks.map(task => [
        task.title,
        task.description,
        categories.find(c => c.id === task.category)?.name || '',
        task.priority,
        task.status,
        task.dueDate,
        new Date(task.createdAt).toLocaleDateString(),
        task.tags.join('; '),
        task.estimatedTime.toString(),
        task.actualTime.toString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render Functions
  const renderTaskCard = (task: Task) => {
    const category = categories.find(c => c.id === task.category);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    
    return (
      <div
        key={task.id}
        className={`card p-4 mb-4 transition-all duration-200 hover:shadow-lg ${
          selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''
        } ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
        id={`task-${task.id}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
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
              className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex-1">
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {category && (
                  <span
                    className="badge text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.name}
                  </span>
                )}
                
                <span className={`badge text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                
                <span className={`badge text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                
                {task.dueDate && (
                  <span className={`badge text-xs px-2 py-1 rounded-full ${
                    isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="badge text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeTimer === task.id ? (
              <button
                onClick={stopTimer}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                title="Stop Timer"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => startTimer(task.id)}
                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                title="Start Timer"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => handleEditTask(task)}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {task.progress > 0 && task.progress < 100 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTaskModal = () => (
    <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={() => setShowTaskModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              placeholder="Enter task title"
              autoFocus
            />
          </div>
          
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              rows={3}
              placeholder="Enter task description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                value={taskForm.category}
                onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Priority }))}
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
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="form-label">Estimated Time (minutes)</label>
              <input
                type="number"
                value={taskForm.estimatedTime}
                onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 60 }))}
                className="input"
                min="1"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              value={taskForm.tags}
              onChange={(e) => setTaskForm(prev => ({ ...prev, tags: e.target.value }))}
              className="input"
              placeholder="work, important, urgent"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            onClick={() => setShowTaskModal(false)}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTask}
            className="btn btn-primary"
            disabled={!taskForm.title.trim()}
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAiModal = () => (
    <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Task Assistant
          </h3>
          <button
            onClick={() => setShowAiModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">AI Prompt</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="input"
              rows={4}
              placeholder="Ask AI to analyze your tasks, suggest improvements, or create new tasks..."
            />
          </div>
          
          {aiLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">AI is thinking...</span>
            </div>
          )}
          
          {aiError && (
            <div className="alert alert-error">
              <AlertCircle className="h-5 w-5" />
              <p>Error: {aiError.message || 'An error occurred while processing your request.'}</p>
            </div>
          )}
          
          {aiResult && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">AI Response:</h4>
              <pre className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {aiResult}
              </pre>
              <button
                onClick={() => processAiResult(aiResult)}
                className="btn btn-primary mt-3"
              >
                Apply AI Suggestions
              </button>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button
            onClick={() => setShowAiModal(false)}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAiAnalysis}
            className="btn btn-primary"
            disabled={!aiPrompt.trim() || aiLoading}
          >
            <Zap className="h-4 w-4 mr-2" />
            Analyze with AI
          </button>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Target className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="p-4 space-y-2">
        <button
          onClick={() => setCurrentView('list')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentView === 'list' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          id="nav-list"
        >
          <FileText className="h-5 w-5" />
          <span>Task List</span>
        </button>
        
        <button
          onClick={() => setCurrentView('board')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentView === 'board' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          id="nav-board"
        >
          <Target className="h-5 w-5" />
          <span>Kanban Board</span>
        </button>
        
        <button
          onClick={() => setCurrentView('calendar')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentView === 'calendar' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          id="nav-calendar"
        >
          <Calendar className="h-5 w-5" />
          <span>Calendar</span>
        </button>
        
        <button
          onClick={() => setCurrentView('analytics')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentView === 'analytics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          id="nav-analytics"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Analytics</span>
        </button>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all' ? 'bg-gray-100 dark:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-sm">All Tasks</span>
            <span className="text-xs bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id ? 'bg-gray-100 dark:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </div>
              <span className="text-xs bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-full">
                {tasks.filter(t => t.category === category.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const { statusData, priorityData, categoryData } = getAnalyticsData();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-desc">All time</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Completed</div>
            <div className="stat-value text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="stat-desc">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}% completion rate
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-blue-600">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="stat-desc">Active tasks</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Overdue</div>
            <div className="stat-value text-red-600">
              {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
            </div>
            <div className="stat-desc">Need attention</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Task Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Priority Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={(entry) => entry.color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderKanbanBoard = () => {
    const columns = [
      { status: 'pending' as Status, title: 'To Do', color: 'border-gray-300' },
      { status: 'in-progress' as Status, title: 'In Progress', color: 'border-blue-300' },
      { status: 'completed' as Status, title: 'Completed', color: 'border-green-300' },
      { status: 'cancelled' as Status, title: 'Cancelled', color: 'border-red-300' }
    ];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => (
          <div key={column.status} className={`bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border-t-4 ${column.color}`}>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              {column.title}
              <span className="text-sm bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-full">
                {filteredTasks.filter(t => t.status === column.status).length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {filteredTasks
                .filter(task => task.status === column.status)
                .map(task => (
                  <div key={task.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`badge text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" id="welcome_fallback">
      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className="relative" id="generation_issue_fallback">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search tasks... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white w-64"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                    Welcome, {currentUser.first_name}
                  </span>
                )}
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Action Bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddTask}
                className="btn btn-primary flex items-center space-x-2"
                id="add-task-btn"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
              
              <button
                onClick={handleAiTaskCreation}
                className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center space-x-2"
                id="ai-suggest-btn"
              >
                <Brain className="h-4 w-4" />
                <span>AI Suggest</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedTasks.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTasks.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('complete')}
                    className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              )}
              
              <button
                onClick={exportTasks}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 flex items-center space-x-2"
                id="export-btn"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input input-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="created">Created Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="input input-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="input input-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="input input-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'list' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Task List
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({filteredTasks.length} tasks)
                  </span>
                </h2>
              </div>
              
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No tasks found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new task.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddTask}
                      className="btn btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {filteredTasks.map(renderTaskCard)}
                </div>
              )}
            </div>
          )}
          
          {currentView === 'board' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Kanban Board
                </h2>
              </div>
              {renderKanbanBoard()}
            </div>
          )}
          
          {currentView === 'calendar' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Calendar View
                </h2>
              </div>
              <div className="card p-8 text-center">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Calendar View Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We're working on an interactive calendar view for your tasks.
                </p>
              </div>
            </div>
          )}
          
          {currentView === 'analytics' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h2>
              </div>
              {renderAnalytics()}
            </div>
          )}
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </footer>
      </div>
      
      {/* Modals */}
      {showTaskModal && renderTaskModal()}
      {showAiModal && renderAiModal()}
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;