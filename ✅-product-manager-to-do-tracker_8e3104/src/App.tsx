import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  SortAsc,
  BarChart3,
  PieChart as PieChartIcon,
  ListTodo,
  AlertTriangle,
  CalendarCheck,
  Sun,
  Moon
} from 'lucide-react';
import { format, isBefore, isAfter, addDays } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'done';

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

interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  statusDistribution: { name: string; value: number; fill: string }[];
  priorityDistribution: { name: string; value: number; fill: string }[];
}

const PriorityMap: Record<Priority, { color: string; label: string; chartColor: string }> = {
  high: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'High', chartColor: '#ef4444' }, // red-500
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Medium', chartColor: '#f59e0b' }, // amber-500
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Low', chartColor: '#22c55e' }, // green-500
};

const StatusMap: Record<Status, { color: string; label: string; chartColor: string }> = {
  'todo': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'To Do', chartColor: '#6b7280' }, // gray-500
  'in-progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'In Progress', chartColor: '#3b82f6' }, // blue-500
  'done': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Done', chartColor: '#10b981' }, // emerald-500
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
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    priority: 'high',
    status: 'todo',
    tags: ['sprint', 'planning']
  },
  {
    id: '3',
    title: 'Review mockups from design team',
    description: 'Provide feedback on the latest UI designs',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due Soon
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
    try {
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    } catch (e) {
      console.error("Failed to parse tasks from localStorage", e);
      return initialTasks;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const savedTags = localStorage.getItem('productManagerTags');
    try {
        const parsedTags = savedTags ? JSON.parse(savedTags) : ['research', 'design', 'planning', 'backlog', 'UI', 'sprint', 'roadmap', 'market analysis', 'refinement', 'presentation'];
        // Ensure it's an array of strings
        return Array.isArray(parsedTags) && parsedTags.every(tag => typeof tag === 'string') ? parsedTags : [];
      } catch (e) {
        console.error("Failed to parse tags from localStorage", e);
        return ['research', 'design', 'planning', 'backlog', 'UI', 'sprint', 'roadmap', 'market analysis', 'refinement', 'presentation'];
      }
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
    if (typeof window === 'undefined') return false; // Guard for SSR or non-browser env
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Update localStorage whenever tasks or tags change
  useEffect(() => {
    localStorage.setItem('productManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('productManagerTags', JSON.stringify(availableTags));
  }, [availableTags]);

  // Apply dark mode
  useEffect(() => {
    if (typeof document === 'undefined') return; // Guard for non-browser env
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
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
  }, []); // Empty dependency array ensures this runs only once

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      // Close modal only if clicking outside the modal content itself
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
         // Check if the click was on the backdrop directly
         const backdrop = document.querySelector('.modal-backdrop');
         if (backdrop === event.target) {
            closeModal();
         }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]); // Re-run if modal state changes

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setEditMode(false);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
    }
  };

  const openAddTaskModal = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd') + 'T12:00:00.000Z', // Default due date 1 week from now
      priority: 'medium',
      status: 'todo',
      tags: [],
    };
    setCurrentTask(newTask);
    setIsModalOpen(true);
    setEditMode(false);
    if (typeof document !== 'undefined') {
        document.body.classList.add('modal-open');
    }
  };

  const openEditTaskModal = (task: Task) => {
    setCurrentTask({ ...task });
    setIsModalOpen(true);
    setEditMode(true);
    if (typeof document !== 'undefined') {
        document.body.classList.add('modal-open');
    }
  };

  const handleTagAdd = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && currentTask && !currentTask.tags.includes(trimmedTag)) {
      setCurrentTask({ ...currentTask, tags: [...currentTask.tags, trimmedTag] });
      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags([...availableTags, trimmedTag]);
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
      const { name, value } = e.target;
      setCurrentTask({
        ...currentTask,
        [name]: value,
      });
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentTask) {
        const { name, value } = e.target;
        // Ensure the date is stored with a fixed time to avoid timezone issues
        // Using noon (T12:00:00.000Z) is a common practice
        const isoString = value ? new Date(`${value}T12:00:00.000Z`).toISOString() : new Date().toISOString(); 
        setCurrentTask({
            ...currentTask,
            [name]: isoString,
        });
    }
  };

  const handleTaskSave = () => {
    if (currentTask && currentTask.title.trim()) { // Ensure title is not empty
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

  const handleStatusChange = (id: string, newStatus: Status) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
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
    setIsFilterDropdownOpen(false); // Close dropdown on reset
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

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const lowerSearchQuery = filters.searchQuery.toLowerCase();
        const matchesSearch = task.title.toLowerCase().includes(lowerSearchQuery) ||
                             task.description.toLowerCase().includes(lowerSearchQuery);
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
        const matchesStatus = filters.status === 'all' || task.status === filters.status;
        const matchesTags = filters.tags.length === 0 || 
                           filters.tags.every(tag => task.tags.includes(tag)); // Changed to 'every' for stricter matching
        
        return matchesSearch && matchesPriority && matchesStatus && matchesTags;
      })
      .sort((a, b) => {
        const sortMultiplier = filters.sortDirection === 'asc' ? 1 : -1;
        
        if (filters.sortBy === 'dueDate') {
          return sortMultiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        }
        
        if (filters.sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortMultiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        
        if (filters.sortBy === 'createdAt') {
          return sortMultiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        
        return 0;
      });
    }, [tasks, filters]);

  const dashboardData: DashboardData = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => t.status !== 'done' && isBefore(new Date(t.dueDate), now)).length;
    const dueSoonTasks = tasks.filter(t => 
      t.status !== 'done' && 
      isAfter(new Date(t.dueDate), now) && 
      isBefore(new Date(t.dueDate), threeDaysFromNow)
    ).length;

    const statusDistribution = Object.entries(StatusMap).map(([key, value]) => ({
      name: value.label,
      value: tasks.filter(t => t.status === key).length,
      fill: value.chartColor,
    }));

    const priorityDistribution = Object.entries(PriorityMap).map(([key, value]) => ({
      name: value.label,
      value: tasks.filter(t => t.priority === key).length,
      fill: value.chartColor,
    }));

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      dueSoonTasks,
      statusDistribution,
      priorityDistribution,
    };
  }, [tasks]);

  const getDueDateStatusClass = (dueDate: string, status: Status) => {
    if (status === 'done') return 'text-gray-500 dark:text-slate-400';
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare date part only
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    if (isBefore(due, today)) {
      return 'text-red-600 dark:text-red-400'; // Overdue
    } else if (isBefore(due, addDays(today, 3))) { // Due within 3 days (including today)
      return 'text-yellow-600 dark:text-yellow-400'; // Due soon
    } else {
      return 'text-gray-600 dark:text-gray-400'; // Due later
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Don't render label if slice is too small

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-700 p-2 border border-gray-200 dark:border-slate-600 rounded shadow-lg text-sm">
                <p className="label text-gray-800 dark:text-slate-200 font-semibold">{`${label || payload[0]?.name || ''} : ${payload[0]?.value || 0}`}</p>
            </div>
        );
    }
    return null;
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition sticky top-0 z-[var(--z-sticky)]">
        <div className="container-fluid py-3 md:py-4">
          <div className="flex-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ListTodo size={24} />
              <span>PM Task Board</span>
            </h1>
            <div className="flex gap-3 md:gap-4 items-center">
              <button
                className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 theme-transition"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="btn btn-primary flex-center gap-1 md:gap-2 btn-responsive"
                onClick={openAddTaskModal}
                aria-label="Add new task"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-4 md:py-6 flex-1">
        {/* Dashboard Section */}
        <section className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card theme-transition">
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value">{dashboardData.totalTasks}</div>
              <div className="stat-desc flex items-center gap-1 text-gray-500 dark:text-slate-400">
                <ListTodo size={14} /> {dashboardData.pendingTasks} Pending / {dashboardData.completedTasks} Done
              </div>
            </div>
            <div className="stat-card theme-transition">
              <div className="stat-title">Overdue Tasks</div>
              <div className={`stat-value ${dashboardData.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{dashboardData.overdueTasks}</div>
              <div className="stat-desc flex items-center gap-1 text-gray-500 dark:text-slate-400">
                <AlertTriangle size={14} /> Needs attention
              </div>
            </div>
            <div className="stat-card theme-transition">
                <div className="stat-title">Due Soon (Next 3 Days)</div>
                <div className={`stat-value ${dashboardData.dueSoonTasks > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>{dashboardData.dueSoonTasks}</div>
                <div className="stat-desc flex items-center gap-1 text-gray-500 dark:text-slate-400">
                  <CalendarCheck size={14} /> Upcoming deadlines
                </div>
            </div>
             <div className="stat-card theme-transition">
                <div className="stat-title">Completion Rate</div>
                <div className={`stat-value ${dashboardData.totalTasks > 0 ? '' : 'text-gray-500'}`}>{dashboardData.totalTasks > 0 ? `${((dashboardData.completedTasks / dashboardData.totalTasks) * 100).toFixed(0)}%` : 'N/A'}</div>
                <div className="stat-desc flex items-center gap-1 text-gray-500 dark:text-slate-400">
                    <CheckCircle size={14} /> Tasks marked as done
                </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card theme-transition card-responsive">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChartIcon size={20}/> Task Status Distribution</h3>
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconSize={10} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <p className="text-center text-gray-500 dark:text-slate-400 py-10">No task data for status chart.</p>
              )}
            </div>
            <div className="card theme-transition card-responsive">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 size={20}/> Task Priority Distribution</h3>
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.priorityDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'}/>
                    <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#cbd5e1' : '#374151', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: isDarkMode ? '#cbd5e1' : '#374151', fontSize: 12 }}/>
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                    <Bar dataKey="value" barSize={40}>
                        {dashboardData.priorityDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <p className="text-center text-gray-500 dark:text-slate-400 py-10">No task data for priority chart.</p>
              )}
            </div>
          </div>
        </section>

        {/* Search and filters */}
        <section className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Task List</h2>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                id="search-tasks"
                className="input pl-10 input-responsive theme-transition"
                placeholder="Search tasks by title or description..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                aria-label="Search tasks"
              />
              <label htmlFor="search-tasks" className="sr-only">Search Tasks</label>
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex gap-2 md:gap-4 items-center">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex-center gap-2 btn-responsive theme-transition"
                  onClick={toggleFilterDropdown}
                  aria-label="Open filter menu"
                  aria-expanded={isFilterDropdownOpen}
                  aria-controls="filter-dropdown"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                  <ChevronDown size={16} className={`transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterDropdownOpen && (
                  <div 
                    id="filter-dropdown"
                    className="card absolute right-0 mt-2 w-72 z-[var(--z-dropdown)] shadow-lg theme-transition"
                    role="menu"
                  >
                    <div className="space-y-4 p-4">
                      <div>
                        <label className="form-label text-sm" htmlFor="priority-filter">Priority</label>
                        <select
                          id="priority-filter"
                          className="input input-sm mt-1 theme-transition"
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
                        <label className="form-label text-sm" htmlFor="status-filter">Status</label>
                        <select
                          id="status-filter"
                          className="input input-sm mt-1 theme-transition"
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
                        <label className="form-label text-sm" htmlFor="sort-by">Sort By</label>
                        <div className="flex gap-2">
                          <select
                            id="sort-by"
                            className="input input-sm mt-1 flex-1 theme-transition"
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            aria-label="Sort by field"
                          >
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="createdAt">Created Date</option>
                          </select>
                          <button
                            className="mt-1 bg-gray-100 dark:bg-slate-600 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 theme-transition"
                            onClick={toggleSortDirection}
                            aria-label={`Sort ${filters.sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                            title={`Sort ${filters.sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                          >
                            {filters.sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="form-label text-sm block mb-1">Filter by Tags</span>
                        <div className={`flex flex-wrap gap-1 mt-1 ${availableTags.length > 5 ? 'max-h-24 overflow-y-auto' : ''} ${styles.tagScrollbar}`}> 
                         {availableTags.length > 0 ? (
                           availableTags.sort().map((tag) => (
                             <button
                               key={tag}
                               onClick={() => handleTagFilterToggle(tag)}
                               className={`badge text-xs ${filters.tags.includes(tag) ? 'badge-info' : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-300'} cursor-pointer transition-colors hover:opacity-80`}
                               aria-pressed={filters.tags.includes(tag)}
                               aria-label={`Filter by tag: ${tag}`}
                             >
                               {tag}
                             </button>
                           ))
                         ) : (
                           <p className="text-xs text-gray-500 dark:text-slate-400">No tags available</p>
                         )}
                       </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-slate-600">
                        <button
                          className="btn btn-sm bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-500 theme-transition"
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
            </div>
          </div>
        </section>

        {/* Task list */}
        <section className="space-y-3 md:space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`card card-responsive p-4 theme-transition hover:shadow-md ${task.status === 'done' ? 'opacity-70 dark:bg-slate-800/70 bg-white/70' : 'dark:bg-slate-800 bg-white'}`}
                role="listitem"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status Toggle Buttons */}
                    <div className="flex flex-col items-center gap-1 mt-1">
                        <button
                            onClick={() => handleStatusChange(task.id, 'todo')}
                            disabled={task.status === 'todo'}
                            className={`p-1 rounded-full ${task.status === 'todo' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'}`}
                            aria-label="Mark as To Do" title="Mark as To Do"
                        >
                            <Circle size={16} fill={task.status === 'todo' ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => handleStatusChange(task.id, 'in-progress')}
                            disabled={task.status === 'in-progress'}
                            className={`p-1 rounded-full ${task.status === 'in-progress' ? 'bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200' : 'text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50'}`}
                            aria-label="Mark as In Progress" title="Mark as In Progress"
                        >
                            <Circle size={16} fill={task.status === 'in-progress' ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => handleStatusChange(task.id, 'done')}
                            disabled={task.status === 'done'}
                            className={`p-1 rounded-full ${task.status === 'done' ? 'bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200' : 'text-gray-400 hover:text-green-500 dark:hover:text-green-400 disabled:opacity-50'}`}
                            aria-label="Mark as Done" title="Mark as Done"
                        >
                            <CheckCircle size={16} />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-medium break-words ${task.status === 'done' ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white'}
                        ${styles.taskTitle}`}>
                        {task.title}
                      </h3>
                      <p className={`mt-1 text-xs sm:text-sm break-words ${task.status === 'done' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-600 dark:text-slate-300'}
                          ${styles.taskDescription}`}>
                        {task.description || <span className="italic text-gray-400 dark:text-slate-500">No description</span>}
                      </p>
                      <div className="flex flex-wrap mt-2 gap-x-2 gap-y-1">
                        <span className={`badge ${PriorityMap[task.priority].color} text-xs`}>
                          {PriorityMap[task.priority].label}
                        </span>
                        <span className={`badge ${StatusMap[task.status].color} text-xs`}>
                          {StatusMap[task.status].label}
                        </span>
                        {task.tags.map((tag) => (
                          <span key={tag} className="badge bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row mt-2 text-xs sm:text-sm gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                          <Calendar size={14} />
                          Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span className={`flex items-center gap-1 ${getDueDateStatusClass(task.dueDate, task.status)}`}>
                          <Clock size={14} />
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 items-start sm:items-center flex-shrink-0 self-end sm:self-start">
                    <button
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 theme-transition rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => openEditTaskModal(task)}
                      aria-label="Edit task"
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 theme-transition rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => handleTaskDelete(task.id)}
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-10 md:py-16 theme-transition">
              <div className="flex-center flex-col">
                <Smile size={40} className="text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white">No tasks found</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm md:text-base">
                  {tasks.length === 0 ? "You haven't added any tasks yet." : "No tasks match your current filters."}
                </p>
                <button className="btn btn-primary mt-4 btn-responsive" onClick={tasks.length === 0 ? openAddTaskModal : resetFilters}>
                  {tasks.length === 0 ? "Add your first task" : "Clear filters"}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Task Modal */}
      {isModalOpen && currentTask && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[var(--z-modal)] p-4" onClick={closeModal} aria-modal="true" role="dialog" aria-labelledby="modal-title">
          <div className="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-xl w-full theme-transition max-h-[90vh] overflow-y-auto" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center z-10">
              <h3 id="modal-title" className="text-lg md:text-xl font-medium text-gray-900 dark:text-white">
                {editMode ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 theme-transition p-1 rounded-full -mr-2"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleTaskSave(); }} className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Task Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input mt-1 theme-transition w-full"
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
                  className="input mt-1 h-24 theme-transition w-full"
                  value={currentTask.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description (optional)"
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
                    className="input mt-1 theme-transition w-full"
                    value={format(new Date(currentTask.dueDate), 'yyyy-MM-dd')} // Format for input type=date
                    onChange={handleDateChange}
                    min={format(new Date(), 'yyyy-MM-dd')} // Prevent setting past dates
                    aria-label="Due date"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    className="input mt-1 theme-transition w-full"
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
                  className="input mt-1 theme-transition w-full"
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
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                  {currentTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-center gap-1 text-xs"
                    >
                      {tag}
                      <button
                        type="button" // Important: prevent form submission
                        onClick={() => handleTagRemove(tag)}
                        className="ml-0.5 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 p-0.5"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex mt-1 gap-2">
                  <input
                    type="text"
                    className="input input-sm flex-1 theme-transition"
                    placeholder="Add a tag (press Enter or click Add)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        handleTagAdd();
                      }
                    }}
                    aria-label="New tag input"
                    list="available-tags"
                  />
                  <datalist id="available-tags">
                    {availableTags.sort().map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                  <button
                    type="button" // Important: prevent form submission
                    className="btn btn-secondary btn-sm"
                    onClick={handleTagAdd}
                    disabled={!newTag.trim()}
                    aria-label="Add tag"
                  >
                    Add
                  </button>
                </div>
              </div>

            <div className="modal-footer sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 mt-6 -mx-6 -mb-6 rounded-b-lg z-10">
              <button
                type="button" // Important: prevent form submission
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 theme-transition"
                onClick={closeModal}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="submit" // Submit button
                className="btn btn-primary theme-transition"
                disabled={!currentTask.title.trim()} // Disable if title is empty
                aria-label={editMode ? 'Update task' : 'Create task'}
              >
                {editMode ? 'Update Task' : 'Create Task'}
              </button>
            </div>
           </form> 
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition mt-auto">
        <div className="container-fluid px-4 md:px-6">
          <p className="text-center text-gray-500 dark:text-slate-400 text-xs md:text-sm">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;