import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Circle,
  Trash2,
  Search,
  Plus,
  Edit,
  X,
  Calendar,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Tag,
  Smile,
  ChartPie,
  ChartBar,
  ChartLine,
  Gauge,
  List,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  LayoutDashboard,
  ListChecks,
  BarChart3,
  FileText,
  Menu,
  Layers,
  Columns,
  MoveRight,
  Square,
  LucideIcon,
  Kanban
} from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'done';
type ViewMode = 'dashboard' | 'list' | 'kanban';

interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  tags: string[];
}

interface FilterState {
  searchQuery: string;
  priority: Priority | 'all';
  status: Status | 'all';
  tags: string[];
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  highPriorityTasks: number;
  completionRate: number;
}

interface TagStats {
  name: string;
  count: number;
}

interface PriorityStats {
  name: string;
  value: number;
}

interface StatusStats {
  name: string;
  value: number;
}

interface DailyTasksStats {
  date: string;
  created: number;
  completed: number;
}

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  view: ViewMode;
}

const PriorityMap: Record<Priority, { color: string; label: string; pieColor: string }> = {
  high: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'High', pieColor: '#ef4444' },
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Medium', pieColor: '#f59e0b' },
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Low', pieColor: '#10b981' },
};

const StatusMap: Record<Status, { color: string; label: string; pieColor: string }> = {
  'todo': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'To Do', pieColor: '#6b7280' },
  'in-progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'In Progress', pieColor: '#3b82f6' },
  'done': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Done', pieColor: '#10b981' },
};

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete market research for new feature',
    description: 'Analyze competitor products and identify market gaps',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'in-progress',
    tags: ['research', 'market analysis']
  },
  {
    id: '2',
    title: 'Create user stories for sprint planning',
    description: 'Draft user stories for the upcoming features in next sprint',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'todo',
    tags: ['sprint', 'planning']
  },
  {
    id: '3',
    title: 'Review mockups from design team',
    description: 'Provide feedback on the latest UI designs',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'todo',
    tags: ['design', 'UI']
  },
  {
    id: '4',
    title: 'Prepare presentation for stakeholders',
    description: 'Create slides summarizing the product roadmap',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'todo',
    tags: ['presentation', 'roadmap']
  },
  {
    id: '5',
    title: 'Update product backlog',
    description: 'Prioritize and refine the product backlog items',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    status: 'done',
    tags: ['backlog', 'refinement']
  }
];

const App: React.FC = () => {
  // Check if tasks exist in localStorage, otherwise use initialTasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('productManagerTasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const savedTags = localStorage.getItem('productManagerTags');
    return savedTags ? JSON.parse(savedTags) : ['research', 'design', 'planning', 'backlog', 'UI', 'sprint', 'roadmap', 'market analysis', 'refinement', 'presentation'];
  });

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
    status: 'all',
    tags: [],
    sortBy: 'dueDate',
    sortDirection: 'asc',
  });

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    dueSoonTasks: 0,
    highPriorityTasks: 0,
    completionRate: 0
  });
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [priorityStats, setPriorityStats] = useState<PriorityStats[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats[]>([]);
  const [dailyTasksStats, setDailyTasksStats] = useState<DailyTasksStats[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Navigation items for sidebar
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { name: 'Task List', icon: ListChecks, view: 'list' },
    { name: 'Kanban Board', icon: Kanban, view: 'kanban' }
  ];

  // Update localStorage whenever tasks or tags change
  useEffect(() => {
    localStorage.setItem('productManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('productManagerTags', JSON.stringify(availableTags));
  }, [availableTags]);

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

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        setIsFilterDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);
  
  // Handle mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
        setIsMobileMenuOpen(false);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate dashboard statistics
  useEffect(() => {
    // Calculate basic statistics
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    
    // Calculate overdue and due soon tasks
    const today = new Date();
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== 'done';
    }).length;
    
    const dueSoonTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const diffDays = differenceInDays(dueDate, today);
      return diffDays >= 0 && diffDays <= 2 && task.status !== 'done';
    }).length;
    
    // Calculate completion rate
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    setDashboardStats({
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      dueSoonTasks,
      highPriorityTasks,
      completionRate
    });
    
    // Tag statistics
    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const newTagStats = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags
    
    setTagStats(newTagStats);
    
    // Priority statistics
    const priorityCounts: Record<Priority, number> = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
    
    const newPriorityStats = Object.entries(priorityCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
    
    setPriorityStats(newPriorityStats);
    
    // Status statistics
    const statusCounts: Record<Status, number> = {
      'todo': todoTasks,
      'in-progress': inProgressTasks,
      'done': completedTasks
    };
    
    const newStatusStats = Object.entries(statusCounts).map(([key, value]) => ({
      name: StatusMap[key as Status].label,
      value
    }));
    
    setStatusStats(newStatusStats);
    
    // Daily task statistics (last 7 days)
    const last7Days: DailyTasksStats[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM d');
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Count tasks created on this day
      const tasksCreatedCount = tasks.filter(task => {
        const taskDate = format(new Date(task.createdAt), 'yyyy-MM-dd');
        return taskDate === formattedDate;
      }).length;
      
      // Count tasks completed on this day (approximation since we don't track completion date)
      // Here we're using createdAt date as a proxy which isn't ideal but works for demo purposes
      const tasksCompletedCount = tasks.filter(task => {
        const taskDate = format(new Date(task.createdAt), 'yyyy-MM-dd');
        return taskDate === formattedDate && task.status === 'done';
      }).length;
      
      last7Days.push({
        date: dateStr,
        created: tasksCreatedCount,
        completed: tasksCompletedCount
      });
    }
    
    setDailyTasksStats(last7Days);
    
  }, [tasks]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setEditMode(false);
    document.body.classList.remove('modal-open');
  };

  const openAddTaskModal = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      priority: 'medium',
      status: 'todo',
      tags: [],
    };
    setCurrentTask(newTask);
    setIsModalOpen(true);
    setEditMode(false);
    document.body.classList.add('modal-open');
  };

  const openEditTaskModal = (task: Task) => {
    setCurrentTask({ ...task });
    setIsModalOpen(true);
    setEditMode(true);
    document.body.classList.add('modal-open');
  };

  const handleTagAdd = () => {
    if (newTag && currentTask && !currentTask.tags.includes(newTag)) {
      setCurrentTask({ ...currentTask, tags: [...currentTask.tags, newTag] });
      if (!availableTags.includes(newTag)) {
        setAvailableTags([...availableTags, newTag]);
      }
      setNewTag('');
    }
  };

  const handleTagRemove = (tag: string) => {
    if (currentTask) {
      setCurrentTask({
        ...currentTask,
        tags: currentTask.tags.filter((t) => t !== tag),
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentTask) {
      setCurrentTask({
        ...currentTask,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleTaskSave = () => {
    if (currentTask) {
      if (editMode) {
        setTasks(tasks.map((task) => (task.id === currentTask.id ? currentTask : task)));
      } else {
        setTasks([...tasks, currentTask]);
      }
      closeModal();
    }
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleStatusChange = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const newStatus: Status = 
            task.status === 'todo' ? 'in-progress' : 
            task.status === 'in-progress' ? 'done' : 'todo';
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const handleFilterChange = (name: keyof FilterState, value: any) => {
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      priority: 'all',
      status: 'all',
      tags: [],
      sortBy: 'dueDate',
      sortDirection: 'asc',
    });
  };

  const handleTagFilterToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ ...filters, tags: newTags });
  };

  const toggleSortDirection = () => {
    setFilters({
      ...filters,
      sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
    });
  };

  const filteredTasks = tasks
    .filter((task) => {
      // Search query filter
      const matchesSearch = task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      // Priority filter
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      
      // Status filter
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      
      // Tags filter
      const matchesTags = filters.tags.length === 0 || 
                         filters.tags.some(tag => task.tags.includes(tag));
      
      return matchesSearch && matchesPriority && matchesStatus && matchesTags;
    })
    .sort((a, b) => {
      const sortMultiplier = filters.sortDirection === 'asc' ? 1 : -1;
      
      if (filters.sortBy === 'dueDate') {
        return sortMultiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      }
      
      if (filters.sortBy === 'priority') {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        return sortMultiplier * (priorityMap[a.priority] - priorityMap[b.priority]);
      }
      
      if (filters.sortBy === 'createdAt') {
        return sortMultiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      
      return 0;
    });

  const getDueDateStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const differenceMs = due.getTime() - today.getTime();
    const differenceDays = Math.ceil(differenceMs / (1000 * 3600 * 24));
    
    if (differenceDays < 0) {
      return 'text-red-600 dark:text-red-400';
    } else if (differenceDays <= 2) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  // Helper function to format numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Helper function to format percentages
  const formatPercentage = (num: number) => {
    return `${Math.round(num)}%`;
  };

  // Group tasks by status for Kanban view
  const kanbanColumns: Record<Status, Task[]> = {
    'todo': filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    'done': filteredTasks.filter(task => task.status === 'done')
  };

  return (
    <div className={`min-h-screen w-full bg-gray-50 dark:bg-slate-900 transition-all flex`}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative bg-white dark:bg-slate-800 z-50 lg:z-0 h-screen transition-transform duration-300`}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Layers className="text-primary-600 h-8 w-8" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster</h1>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                className={`${styles.navItem} ${viewMode === item.view ? styles.navItemActive : ''} flex items-center gap-3 w-full p-3 rounded-lg transition-colors`}
                onClick={() => setViewMode(item.view)}
                aria-current={viewMode === item.view ? 'page' : undefined}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
                {viewMode === item.view && <MoveRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Tags Section */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagFilterToggle(tag)}
                  className={`badge text-xs ${filters.tags.includes(tag) ? 'badge-info' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'}`}
                  aria-pressed={filters.tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
              {availableTags.length > 8 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{availableTags.length - 8} more</span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4 mb-8">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Status</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{dashboardStats.totalTasks}</p>
              </div>
              <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">{dashboardStats.completedTasks}</p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatPercentage(dashboardStats.completionRate)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${dashboardStats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Theme Toggle & Create Task Button */}
          <div className="mt-auto space-y-3">
            <div className="flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
            <button
              className="btn btn-primary w-full flex-center gap-2"
              onClick={openAddTaskModal}
              aria-label="Add new task"
            >
              <Plus size={18} />
              <span>Add New Task</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewMode === 'dashboard' && 'Dashboard'}
                {viewMode === 'list' && 'Task List'}
                {viewMode === 'kanban' && 'Kanban Board'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search - Only in List and Kanban views */}
              {viewMode !== 'dashboard' && (
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    className="input py-2 pl-10 pr-4 w-60"
                    placeholder="Search tasks..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    aria-label="Search tasks"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              )}
              
              {/* Filter Button - Only in List and Kanban views */}
              {viewMode !== 'dashboard' && (
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex-center gap-2"
                    onClick={toggleFilterDropdown}
                    aria-expanded={isFilterDropdownOpen}
                    aria-label="Filter tasks"
                  >
                    <Filter size={18} />
                    <span className="hidden sm:inline">Filters</span>
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="card absolute right-0 mt-2 w-72 z-[var(--z-dropdown)] shadow-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="form-label" htmlFor="priority-filter">Priority</label>
                          <select
                            id="priority-filter"
                            className="input mt-1"
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            aria-label="Filter by priority"
                          >
                            <option value="all">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        <div>
                          <label className="form-label" htmlFor="status-filter">Status</label>
                          <select
                            id="status-filter"
                            className="input mt-1"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            aria-label="Filter by status"
                          >
                            <option value="all">All Statuses</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>

                        <div>
                          <label className="form-label" htmlFor="sort-by">Sort By</label>
                          <div className="flex gap-2">
                            <select
                              id="sort-by"
                              className="input mt-1 flex-1"
                              value={filters.sortBy}
                              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                              aria-label="Sort by field"
                            >
                              <option value="dueDate">Due Date</option>
                              <option value="priority">Priority</option>
                              <option value="createdAt">Created Date</option>
                            </select>
                            <button
                              className="mt-1 bg-gray-100 dark:bg-slate-700 p-2 rounded-md"
                              onClick={toggleSortDirection}
                              aria-label={`Sort ${filters.sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                            >
                              {filters.sortDirection === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-slate-700">
                          <button
                            className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                            onClick={resetFilters}
                            aria-label="Reset all filters"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Search - Only in List and Kanban views */}
          {viewMode !== 'dashboard' && (
            <div className="px-4 pb-4 md:hidden">
              <div className="relative">
                <input
                  type="text"
                  className="input py-2 pl-10 pr-4 w-full"
                  placeholder="Search tasks..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  aria-label="Search tasks"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {viewMode === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${styles.dashboardCard} bg-gradient-to-br from-blue-500 to-blue-600 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-blue-100">Total Tasks</p>
                      <h3 className="text-3xl font-bold mt-2">{formatNumber(dashboardStats.totalTasks)}</h3>
                    </div>
                    <div className={styles.iconCircle}>
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-blue-100">
                    <span>Completion Rate:</span>
                    <span className="font-medium ml-auto">{formatPercentage(dashboardStats.completionRate)}</span>
                  </div>
                </div>
                
                <div className={`${styles.dashboardCard} bg-gradient-to-br from-purple-500 to-purple-600 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-purple-100">Progress</p>
                      <div className="mt-2 flex gap-2">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold">{dashboardStats.todoTasks}</span>
                          <span className="text-xs text-purple-200">To Do</span>
                        </div>
                        <div className="text-purple-300 font-light text-xl">|</div>
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold">{dashboardStats.inProgressTasks}</span>
                          <span className="text-xs text-purple-200">In Progress</span>
                        </div>
                        <div className="text-purple-300 font-light text-xl">|</div>
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold">{dashboardStats.completedTasks}</span>
                          <span className="text-xs text-purple-200">Done</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.iconCircle}>
                      <Gauge size={20} />
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-purple-400 bg-opacity-30 rounded-full h-2.5">
                    <div className="flex">
                      <div 
                        className="bg-purple-200 h-2.5 rounded-l-full" 
                        style={{ width: `${dashboardStats.todoTasks / dashboardStats.totalTasks * 100}%` }}
                      ></div>
                      <div 
                        className="bg-purple-300 h-2.5" 
                        style={{ width: `${dashboardStats.inProgressTasks / dashboardStats.totalTasks * 100}%` }}
                      ></div>
                      <div 
                        className="bg-white h-2.5 rounded-r-full" 
                        style={{ width: `${dashboardStats.completedTasks / dashboardStats.totalTasks * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.dashboardCard} bg-gradient-to-br from-amber-500 to-amber-600 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-amber-100">Task Deadlines</p>
                      <div className="mt-2 flex gap-2">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold">{dashboardStats.overdueTasks}</span>
                          <span className="text-xs text-amber-200">Overdue</span>
                        </div>
                        <div className="text-amber-300 font-light text-xl">|</div>
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold">{dashboardStats.dueSoonTasks}</span>
                          <span className="text-xs text-amber-200">Due Soon</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.iconCircle}>
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-amber-100">
                    <span>Tasks needing attention:</span>
                    <span className="font-medium ml-auto">
                      {dashboardStats.overdueTasks + dashboardStats.dueSoonTasks}
                    </span>
                  </div>
                </div>
                
                <div className={`${styles.dashboardCard} bg-gradient-to-br from-green-500 to-green-600 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-100">Productivity</p>
                      <h3 className="text-3xl font-bold mt-2">{formatNumber(dashboardStats.completedTasks)}</h3>
                    </div>
                    <div className={styles.iconCircle}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-100">
                    <span>Tasks completed</span>
                    <span className="font-medium ml-auto">
                      <CheckSquare size={16} className="inline mr-1" />
                      {formatPercentage(dashboardStats.completionRate)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status distribution pie chart */}
                <div className={`card ${styles.chartCard}`}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Status Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusStats.map((entry, index) => {
                            // Use status colors from StatusMap
                            const status = Object.keys(StatusMap).find(
                              key => StatusMap[key as Status].label === entry.name
                            ) as Status | undefined;
                            
                            const color = status ? StatusMap[status].pieColor : '#8884d8';
                            
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Priority distribution pie chart */}
                <div className={`card ${styles.chartCard}`}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Priority Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {priorityStats.map((entry, index) => {
                            // Convert entry name to lowercase to match priority keys
                            const priority = entry.name.toLowerCase() as Priority;
                            const color = PriorityMap[priority]?.pieColor || '#8884d8';
                            
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Popular tags bar chart */}
                <div className={`card ${styles.chartCard}`}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Top Tags</h3>
                  {tagStats.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={tagStats.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={70} />
                          <Tooltip 
                            formatter={(value: number) => [`${value} tasks`, 'Count']}
                          />
                          <Bar dataKey="count" fill="#8884d8" barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400 py-8 text-center">No tags used yet</p>
                  )}
                </div>
              </div>
              
              {/* Activity chart */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Task Activity (Last 7 Days)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyTasksStats}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value} tasks`, undefined]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="created" name="Tasks Created" fill="#3b82f6" />
                      <Bar dataKey="completed" name="Tasks Completed" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`${styles.taskCard} transition-all`}
                    role="listitem"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          className="mt-1 text-gray-400 hover:text-primary-500 transition-colors"
                          onClick={() => handleStatusChange(task.id)}
                          aria-label={`Mark task as ${task.status === 'todo' ? 'in progress' : task.status === 'in-progress' ? 'done' : 'todo'}`}
                        >
                          {task.status === 'done' ? (
                            <CheckCircle size={22} className="text-green-500" />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className={`text-lg font-medium ${task.status === 'done' ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                          </h3>
                          <p className={`mt-1 text-sm ${task.status === 'done' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-600 dark:text-slate-300'}`}>
                            {task.description}
                          </p>
                          <div className="flex flex-wrap mt-3 gap-2">
                            <span className={`badge ${PriorityMap[task.priority].color}`}>
                              {PriorityMap[task.priority].label}
                            </span>
                            <span className={`badge ${StatusMap[task.status].color}`}>
                              {StatusMap[task.status].label}
                            </span>
                            {task.tags.map((tag) => (
                              <span key={tag} className="badge bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                                <Tag size={12} className="mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex mt-3 text-sm gap-4">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                              <Calendar size={14} />
                              Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                            </span>
                            <span className={`flex items-center gap-1 ${getDueDateStatus(task.dueDate)}`}>
                              <Clock size={14} />
                              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                          onClick={() => openEditTaskModal(task)}
                          aria-label="Edit task"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => handleTaskDelete(task.id)}
                          aria-label="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12">
                  <div className="flex-center flex-col">
                    <Smile size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No tasks found</h3>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">
                      {tasks.length === 0 ? "You don't have any tasks yet" : "No tasks match your current filters"}
                    </p>
                    <button className="btn btn-primary mt-4" onClick={tasks.length === 0 ? openAddTaskModal : resetFilters}>
                      {tasks.length === 0 ? "Add your first task" : "Clear filters"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'kanban' && (
            <div className={styles.kanbanContainer}>
              {/* Kanban columns */}
              {Object.entries(StatusMap).map(([statusKey, statusData]) => {
                const status = statusKey as Status;
                const tasksInColumn = kanbanColumns[status];
                
                return (
                  <div key={status} className={styles.kanbanColumn}>
                    <div className={`${styles.kanbanColumnHeader} ${statusData.color}`}>
                      <h3 className="font-medium">{statusData.label}</h3>
                      <span className={styles.taskCount}>{tasksInColumn.length}</span>
                    </div>
                    <div className={styles.kanbanCards}>
                      {tasksInColumn.length > 0 ? (
                        tasksInColumn.map(task => (
                          <div key={task.id} className={styles.kanbanCard}>
                            <div className="flex justify-between items-start">
                              <span className={`badge ${PriorityMap[task.priority].color}`}>
                                {PriorityMap[task.priority].label}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  className="text-gray-400 hover:text-primary-500 transition-colors p-1"
                                  onClick={() => openEditTaskModal(task)}
                                  aria-label="Edit task"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  onClick={() => handleTaskDelete(task.id)}
                                  aria-label="Delete task"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mt-2">{task.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 line-clamp-2">{task.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded">
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">+{task.tags.length - 2}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-3 text-xs text-gray-500 dark:text-slate-400">
                              <span className={`flex items-center gap-1 ${getDueDateStatus(task.dueDate)}`}>
                                <Calendar size={12} />
                                {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                              <button
                                className="text-gray-400 hover:text-primary-500 transition-colors"
                                onClick={() => handleStatusChange(task.id)}
                                aria-label={`Move task to ${task.status === 'todo' ? 'in progress' : task.status === 'in-progress' ? 'done' : 'to do'}`}
                              >
                                <MoveRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex-center flex-col py-8 text-center text-gray-500 dark:text-slate-400">
                          <Square size={24} className="mb-2 opacity-50" />
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                      {/* Add task button at bottom of column */}
                      <button 
                        className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex-center gap-2"
                        onClick={openAddTaskModal}
                        aria-label={`Add task in ${statusData.label}`}
                      >
                        <Plus size={14} />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-auto">
          <div className="px-6">
            <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Task Modal */}
      {isModalOpen && currentTask && (
        <div className="modal-backdrop" onClick={closeModal} aria-modal="true" role="dialog">
          <div className="modal-content max-w-xl w-full" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {editMode ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Task Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input mt-1"
                  value={currentTask.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="input mt-1 h-24"
                  value={currentTask.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  aria-label="Task description"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="dueDate">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    className="input mt-1"
                    value={currentTask.dueDate.split('T')[0]}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      const isoString = new Date(`${dateValue}T12:00:00`).toISOString();
                      handleInputChange({
                        target: { name: 'dueDate', value: isoString },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    aria-label="Due date"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    className="input mt-1"
                    value={currentTask.priority}
                    onChange={handleInputChange}
                    aria-label="Task priority"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  className="input mt-1"
                  value={currentTask.status}
                  onChange={handleInputChange}
                  aria-label="Task status"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex mt-2 gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagAdd();
                      }
                    }}
                    aria-label="New tag input"
                    list="available-tags"
                  />
                  <datalist id="available-tags">
                    {availableTags.map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                  <button
                    className="btn btn-secondary"
                    onClick={handleTagAdd}
                    disabled={!newTag}
                    aria-label="Add tag"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={closeModal}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleTaskSave}
                disabled={!currentTask.title.trim()}
                aria-label="Save task"
              >
                {editMode ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
