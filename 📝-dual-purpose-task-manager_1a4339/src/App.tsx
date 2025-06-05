import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  Settings,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Target,
  Briefcase,
  User,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  X,
  FileText,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns';
import styles from './styles/styles.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'work';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  personal: number;
  work: number;
}

type ViewMode = 'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'settings';
type FilterCategory = 'all' | 'personal' | 'work';
type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high';
type SortBy = 'dueDate' | 'priority' | 'created' | 'title';

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

function App() {
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Task form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as 'personal' | 'work',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    tags: ''
  });

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const calculateStats = (): TaskStats => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => t.status !== 'completed' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length,
      personal: tasks.filter(t => t.category === 'personal').length,
      work: tasks.filter(t => t.category === 'work').length
    };
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) return;

    const newTask: Task = {
      id: generateId(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      status: 'pending',
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    setTasks(prev => [...prev, newTask]);
    resetForm();
  };

  const handleUpdateTask = () => {
    if (!editingTask || !formData.title.trim()) return;

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? {
            ...task,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            priority: formData.priority,
            dueDate: formData.dueDate,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          }
        : task
    ));
    resetForm();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setShowDeleteConfirm(null);
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
          }
        : task
    ));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      tags: ''
    });
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags.join(', ')
    });
    setShowTaskForm(true);
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.dueDate === date);
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTasksCSV = () => {
    const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Created', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        `"${task.description}"`,
        task.category,
        task.priority,
        task.status,
        task.dueDate,
        format(parseISO(task.createdAt), 'yyyy-MM-dd'),
        `"${task.tags.join(', ')}"`
      ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target?.result as string) as Task[];
        const validTasks = importedTasks.filter(task => 
          task.id && task.title && task.category && task.priority && task.status
        );
        setTasks(prev => [...prev, ...validTasks]);
      } catch (error) {
        console.error('Error importing tasks:', error);
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAllData = () => {
    setTasks([]);
    localStorage.removeItem('tasks');
  };

  const stats = calculateStats();
  const filteredTasks = getFilteredAndSortedTasks();

  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.first_name || 'Developer'}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Here's your productivity overview for today
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="btn btn-primary flex items-center gap-2"
          id="create-task-btn"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-desc">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-green-600">{stats.completed}</div>
          <div className="stat-desc">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-blue-600">{stats.inProgress}</div>
          <div className="stat-desc">Active tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Overdue</div>
          <div className="stat-value text-red-600">{stats.overdue}</div>
          <div className="stat-desc">Need attention</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
          <div className="space-y-3">
            {tasks.filter(task => isToday(parseISO(task.dueDate))).slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <button
                  onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  className="text-gray-500 hover:text-green-600"
                >
                  {task.status === 'completed' ? 
                    <CheckCircle className="w-5 h-5 text-green-600" /> : 
                    <Circle className="w-5 h-5" />
                  }
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${task.category === 'work' ? 'badge-info' : 'badge-success'}`}>
                      {task.category}
                    </span>
                    <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {tasks.filter(task => isToday(parseISO(task.dueDate))).length === 0 && (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">No tasks due today</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {tasks
              .filter(task => task.status !== 'completed' && !isToday(parseISO(task.dueDate)))
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${isPast(parseISO(task.dueDate)) ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {isTomorrow(parseISO(task.dueDate)) ? 'Tomorrow' : 
                       isThisWeek(parseISO(task.dueDate)) ? format(parseISO(task.dueDate), 'EEEE') :
                       format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              ))
            }
            {tasks.filter(task => task.status !== 'completed').length === 0 && (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6" id="tasks-view">
      <div className="flex-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <button
          onClick={() => setShowTaskForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              id="search-tasks"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="input"
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
            className="input"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="input"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
          
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 flex items-center gap-2"
          >
            {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {sortDirection === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4" id="tasks-list">
        {filteredTasks.map(task => (
          <div key={task.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleStatusChange(task.id, 
                  task.status === 'pending' ? 'in-progress' : 
                  task.status === 'in-progress' ? 'completed' : 'pending'
                )}
                className="mt-1 text-gray-500 hover:text-green-600"
              >
                {task.status === 'completed' ? 
                  <CheckCircle className="w-5 h-5 text-green-600" /> : 
                  task.status === 'in-progress' ?
                  <Clock className="w-5 h-5 text-blue-600" /> :
                  <Circle className="w-5 h-5" />
                }
              </button>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 dark:text-slate-400 mt-1">{task.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(task.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <span className={`badge ${task.category === 'work' ? 'badge-info' : 'badge-success'}`}>
                    {task.category === 'work' ? <Briefcase className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {task.category}
                  </span>
                  <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`badge ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    {isPast(parseISO(task.dueDate)) && task.status !== 'completed' && (
                      <AlertCircle className="w-3 h-3 text-red-500 ml-1" />
                    )}
                  </span>
                </div>
                
                {task.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {task.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 text-lg">No tasks found</p>
            <p className="text-gray-400 dark:text-slate-500 mt-2">Try adjusting your filters or create a new task</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay.getTime() - (firstDay.getDay() * 24 * 60 * 60 * 1000));
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      days.push(date);
    }

    return (
      <div className="space-y-6" id="calendar-view">
        <div className="flex-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-center">
              {format(today, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayTasks = getTasksForDate(dateStr);
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              
              return (
                <div
                  key={index}
                  className={`p-2 min-h-[80px] border border-gray-200 dark:border-slate-600 ${
                    isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'
                  } ${isToday ? 'ring-2 ring-primary-500' : ''} hover:bg-gray-50 dark:hover:bg-slate-700`}
                >
                  <div className={`text-sm ${isCurrentMonth ? 'font-medium' : 'text-gray-400'} ${
                    isToday ? 'text-primary-600 font-bold' : ''
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        +{dayTasks.length - 2} more
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

  const renderAnalytics = () => {
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    const productivityTrend = tasks.filter(t => t.completedAt).length;
    
    return (
      <div className="space-y-6" id="analytics-view">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Task Completion Rate</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{Math.round(completionRate)}%</div>
              <p className="text-gray-500 dark:text-slate-400 mt-2">Overall completion rate</p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Work</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.work}</span>
                  <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.work / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span>Personal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.personal}</span>
                  <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.personal / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{productivityTrend}</div>
            <p className="text-gray-500 dark:text-slate-400">Tasks Completed</p>
          </div>
          
          <div className="card text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-gray-500 dark:text-slate-400">Active Tasks</p>
          </div>
          
          <div className="card text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-gray-500 dark:text-slate-400">Overdue Tasks</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6" id="settings-view">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dark Mode</label>
                <p className="text-sm text-gray-500 dark:text-slate-400">Toggle dark mode theme</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`theme-toggle ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                id="theme-toggle"
              >
                <span className="theme-toggle-thumb">
                  {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={exportTasksCSV}
              className="w-full btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
              id="export-csv"
            >
              <Download className="w-4 h-4" />
              Export Tasks (CSV)
            </button>
            <button
              onClick={exportTasks}
              className="w-full btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export Tasks (JSON)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full btn bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2"
              id="import-tasks"
            >
              <Upload className="w-4 h-4" />
              Import Tasks
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importTasks}
              className="hidden"
            />
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
                  clearAllData();
                }
              }}
              className="w-full btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskForm = () => (
    <div className="modal-backdrop" onClick={resetForm}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={resetForm} className="text-gray-400 hover:text-gray-500">
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
              id="task-title-input"
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
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'personal' | 'work' }))}
                className="input"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
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
          <button onClick={resetForm} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={editingTask ? handleUpdateTask : handleCreateTask}
            disabled={!formData.title.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDeleteConfirm = () => (
    <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Delete</h3>
          <button onClick={() => setShowDeleteConfirm(null)} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-slate-400">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        
        <div className="modal-footer">
          <button 
            onClick={() => setShowDeleteConfirm(null)} 
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => showDeleteConfirm && handleDeleteTask(showDeleteConfirm)}
            className="btn bg-red-500 text-white hover:bg-red-600"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showTaskForm) resetForm();
        if (showDeleteConfirm) setShowDeleteConfirm(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showTaskForm, showDeleteConfirm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster Pro</h1>
              <div className="hidden md:flex items-center gap-1" id="generation_issue_fallback">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'dashboard' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  id="nav-dashboard"
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('tasks')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tasks' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  id="nav-tasks"
                >
                  <CheckCircle className="w-4 h-4 mr-2 inline" />
                  Tasks
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  id="nav-calendar"
                >
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'analytics' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  id="nav-analytics"
                >
                  <TrendingUp className="w-4 h-4 mr-2 inline" />
                  Analytics
                </button>
                <button
                  onClick={() => setViewMode('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'settings' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  id="nav-settings"
                >
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Settings
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  {currentUser?.first_name || 'Developer'}
                </span>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden mt-4">
            <div className="flex overflow-x-auto gap-1 pb-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'dashboard' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('tasks')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'tasks' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'analytics' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setViewMode('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'settings' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-8">
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'tasks' && renderTasks()}
        {viewMode === 'calendar' && renderCalendar()}
        {viewMode === 'analytics' && renderAnalytics()}
        {viewMode === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      {showTaskForm && renderTaskForm()}
      {showDeleteConfirm && renderDeleteConfirm()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 mt-12">
        <div className="container-wide text-center text-gray-500 dark:text-slate-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;