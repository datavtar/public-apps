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
  PieChart as PieChartIcon, // Renamed to avoid conflict with recharts component
  AlertTriangle,
  ListChecks
} from 'lucide-react';
import { format, isBefore, startOfDay, subDays, parseISO } from 'date-fns';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import styles from './styles/styles.module.css';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO string format
  dueDate: string; // ISO string format
  priority: Priority;
  status: Status;
  tags: string[];
  completedAt?: string; // Add completedAt field
}

interface FilterState {
  searchQuery: string;
  priority: Priority | 'all';
  status: Status | 'all';
  tags: string[];
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

const PriorityMap: Record<Priority, { color: string; label: string; value: number }> = {
  high: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'High', value: 3 },
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Medium', value: 2 },
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Low', value: 1 },
};

const StatusMap: Record<Status, { color: string; label: string }> = {
  'todo': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'To Do' },
  'in-progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'In Progress' },
  'done': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Done' },
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
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['backlog', 'refinement']
  }
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('productManagerTasks');
    try {
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    } catch (error) {
      console.error("Error parsing tasks from localStorage:", error);
      return initialTasks; // Fallback to initial tasks
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const savedTags = localStorage.getItem('productManagerTags');
    try {
      const parsedTags = savedTags ? JSON.parse(savedTags) : ['research', 'design', 'planning', 'backlog', 'UI', 'sprint', 'roadmap', 'market analysis', 'refinement', 'presentation'];
      return Array.isArray(parsedTags) ? parsedTags : []; // Ensure it's an array
    } catch (error) {
      console.error("Error parsing tags from localStorage:", error);
      return ['research', 'design', 'planning', 'backlog', 'UI', 'sprint', 'roadmap', 'market analysis', 'refinement', 'presentation']; // Fallback
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
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' ||
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('productManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('productManagerTags', JSON.stringify(availableTags));
  }, [availableTags]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      // Only close modal if clicking outside the modal content itself
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isModalOpen && event.target === modalRef.current?.parentElement) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setEditMode(false);
    setNewTag(''); // Clear tag input on close
    document.body.classList.remove('modal-open');
  };

  const openAddTaskModal = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default due date 1 week from now
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
    setCurrentTask({ ...task }); // Create a copy to avoid modifying original state directly
    setIsModalOpen(true);
    setEditMode(true);
    document.body.classList.add('modal-open');
  };

  const handleTagAdd = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && currentTask && !currentTask.tags.includes(trimmedTag)) {
      setCurrentTask(prev => prev ? { ...prev, tags: [...prev.tags, trimmedTag] } : null);
      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags(prev => [...prev, trimmedTag]);
      }
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    if (currentTask) {
      setCurrentTask(prev => prev ? {
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      } : null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (currentTask) {
      setCurrentTask(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleTaskSave = () => {
    if (currentTask && currentTask.title.trim()) {
      // Ensure dates are valid ISO strings
      const taskToSave = {
        ...currentTask,
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString() : new Date().toISOString(),
        createdAt: currentTask.createdAt ? new Date(currentTask.createdAt).toISOString() : new Date().toISOString(),
      };

      if (editMode) {
        setTasks(tasks.map((task) => (task.id === taskToSave.id ? taskToSave : task)));
      } else {
        setTasks([...tasks, taskToSave]);
      }
      closeModal();
    }
  };

  const handleTaskDelete = (id: string) => {
    // Optionally add confirmation here
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleStatusChange = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          let newStatus: Status;
          let completedAt: string | undefined = task.completedAt;

          switch (task.status) {
            case 'todo':        newStatus = 'in-progress'; completedAt = undefined; break;
            case 'in-progress': newStatus = 'done'; completedAt = new Date().toISOString(); break;
            case 'done':        newStatus = 'todo'; completedAt = undefined; break;
            default:            newStatus = task.status; break;
          }
          return { ...task, status: newStatus, completedAt };
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

  const filteredTasks = useMemo(() => tasks
    .filter((task) => {
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = task.title.toLowerCase().includes(searchLower) ||
                           task.description.toLowerCase().includes(searchLower);
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesTags = filters.tags.length === 0 ||
                         filters.tags.every(filterTag => task.tags.includes(filterTag)); // Changed to 'every' for stricter filtering

      return matchesSearch && matchesPriority && matchesStatus && matchesTags;
    })
    .sort((a, b) => {
      const sortMultiplier = filters.sortDirection === 'asc' ? 1 : -1;

      if (filters.sortBy === 'dueDate') {
        // Handle potentially invalid dates gracefully
        const dateA = a.dueDate ? parseISO(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? parseISO(b.dueDate).getTime() : 0;
        return sortMultiplier * (dateA - dateB);
      }

      if (filters.sortBy === 'priority') {
        return sortMultiplier * (PriorityMap[b.priority].value - PriorityMap[a.priority].value); // Sort high to low by default
      }

      if (filters.sortBy === 'createdAt') {
        const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : 0;
        return sortMultiplier * (dateA - dateB);
      }

      return 0;
    }), [tasks, filters]);

  const getDueDateStatus = (dueDate: string, status: Status) => {
    if (status === 'done') return 'text-gray-500 dark:text-slate-400'; // Don't show urgency for done tasks
    const today = startOfDay(new Date());
    const due = startOfDay(parseISO(dueDate));

    if (isBefore(due, today)) {
      return 'text-red-600 dark:text-red-400 font-medium'; // Overdue
    }
    const differenceMs = due.getTime() - today.getTime();
    const differenceDays = Math.ceil(differenceMs / (1000 * 3600 * 24));

    if (differenceDays <= 2) {
      return 'text-yellow-600 dark:text-yellow-400 font-medium'; // Due soon
    }
    return 'text-gray-600 dark:text-gray-400'; // Due later
  };

  // --- Analytics Calculations ---
  const analyticsData = useMemo(() => {
    const totalTasks = tasks.length;
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Status, number>);

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    const overdueTasksCount = tasks.filter(task =>
      task.status !== 'done' && task.dueDate && isBefore(parseISO(task.dueDate), startOfDay(new Date()))
    ).length;

    const sevenDaysAgo = subDays(startOfDay(new Date()), 7);
    const completedLast7Days = tasks.filter(task =>
        task.status === 'done' && task.completedAt && !isBefore(parseISO(task.completedAt), sevenDaysAgo)
    ).length;

    const statusChartData = Object.entries(tasksByStatus).map(([name, value]) => ({ name: StatusMap[name as Status].label, value }));
    const priorityChartData = Object.entries(tasksByPriority).map(([name, value]) => ({ name: PriorityMap[name as Priority].label, value }));

    return {
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasksCount,
      completedLast7Days,
      statusChartData,
      priorityChartData,
    };
  }, [tasks]);

  const STATUS_COLORS = ['#9CA3AF', '#60A5FA', '#34D399']; // Gray, Blue, Green
  const PRIORITY_COLORS = ['#EF4444', '#F59E0B', '#10B981']; // Red, Yellow, Green (matching labels)

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-700 p-2 border border-gray-200 dark:border-slate-600 rounded shadow-lg">
          <p className="label text-sm font-medium text-gray-900 dark:text-white">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-fluid py-3">
          <div className="flex-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ListChecks size={24} className="text-primary-600"/>
              <span>PM Task Tracker</span>
            </h1>
            <div className="flex gap-2 sm:gap-4 items-center">
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <button
                className="btn btn-primary btn-responsive flex-center gap-1 sm:gap-2"
                onClick={openAddTaskModal}
                aria-label="Add new task"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Task</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="container-fluid py-6 flex-grow">
        {/* Analytics Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">Task Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Cards */}
            <div className="stat-card">
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value">{analyticsData.totalTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Overdue Tasks</div>
              <div className={`stat-value ${analyticsData.overdueTasksCount > 0 ? 'text-red-600 dark:text-red-500' : ''}`}>
                {analyticsData.overdueTasksCount}
              </div>
              {analyticsData.overdueTasksCount > 0 && (
                 <div className="stat-desc text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle size={14} /> Action required
                 </div>
              )}
            </div>
            <div className="stat-card">
              <div className="stat-title">Completed (Last 7d)</div>
              <div className="stat-value">{analyticsData.completedLast7Days}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Tasks</div>
              <div className="stat-value">
                {(analyticsData.tasksByStatus['todo'] ?? 0) + (analyticsData.tasksByStatus['in-progress'] ?? 0)}
              </div>
              <div className="stat-desc">
                To Do: {analyticsData.tasksByStatus['todo'] ?? 0}, In Progress: {analyticsData.tasksByStatus['in-progress'] ?? 0}
              </div>
            </div>

             {/* Charts */}
            <div className="card sm:col-span-2 lg:col-span-2 h-72 flex flex-col">
                <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Tasks by Status</h3>
                {analyticsData.statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      {/* <Legend /> */}
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="flex-grow flex-center text-gray-500 dark:text-slate-400">No status data</div>
                )}
            </div>

            <div className="card sm:col-span-2 lg:col-span-2 h-72 flex flex-col">
                 <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Tasks by Priority</h3>
                 {analyticsData.priorityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={analyticsData.priorityChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                            {analyticsData.priorityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                           {/* <Legend /> */}
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex-grow flex-center text-gray-500 dark:text-slate-400">No priority data</div>
                 )}
            </div>
          </div>
        </section>

        {/* Search and filters */}
        <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">Manage Tasks</h2>
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative flex-1">
                <input
                type="text"
                className="input pl-10 input-responsive"
                placeholder="Search tasks by title or description..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                aria-label="Search tasks"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex gap-2 md:gap-4 flex-wrap">
                <div className="relative" ref={filterDropdownRef}>
                <button
                    className="btn btn-responsive bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 flex-center gap-2"
                    onClick={toggleFilterDropdown}
                    aria-label="Open filter menu"
                    aria-expanded={isFilterDropdownOpen}
                    aria-controls="filter-dropdown"
                >
                    <Filter size={18} />
                    <span>Filters & Sort</span>
                    <ChevronDown size={16} className={`transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterDropdownOpen && (
                    <div
                    id="filter-dropdown"
                    className="card absolute right-0 mt-2 w-72 z-[var(--z-dropdown)] shadow-lg theme-transition-all"
                    >
                    <div className="space-y-4">
                        <div>
                        <label className="form-label" htmlFor="priority-filter">Priority</label>
                        <select
                            id="priority-filter"
                            className="input input-sm mt-1"
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value as Priority | 'all')}
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
                            className="input input-sm mt-1"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value as Status | 'all')}
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
                            className="input input-sm mt-1 flex-1"
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
                            aria-label="Sort by field"
                            >
                                <option value="dueDate">Due Date</option>
                                <option value="priority">Priority</option>
                                <option value="createdAt">Created Date</option>
                            </select>
                            <button
                            className="mt-1 bg-gray-100 dark:bg-slate-700 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            onClick={toggleSortDirection}
                            aria-label={`Sort direction: ${filters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}. Toggle.`}
                            >
                            {filters.sortDirection === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                            </button>
                        </div>
                        </div>

                        <div>
                        <span className="form-label block mb-2">Filter by Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                            {availableTags.length > 0 ? (
                            availableTags.sort().map((tag) => (
                                <button
                                key={tag}
                                onClick={() => handleTagFilterToggle(tag)}
                                className={`badge ${filters.tags.includes(tag) ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ring-1 ring-primary-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'} cursor-pointer transition-all text-xs`}
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

                        <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-slate-700">
                        <button
                            className="btn btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                            onClick={resetFilters}
                            aria-label="Reset all filters and sorting"
                        >
                            Reset
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
        <section role="list" aria-label="Task list">
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
                {filteredTasks.map((task) => (
                <div
                    key={task.id}
                    className={`card card-responsive transition-all hover:shadow-lg ${task.status === 'done' ? 'opacity-70 dark:bg-slate-800/70 bg-white/60' : 'dark:bg-slate-800 bg-white'}`}
                    role="listitem"
                    aria-labelledby={`task-title-${task.id}`}
                >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <button
                        className="mt-1 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex-shrink-0"
                        onClick={() => handleStatusChange(task.id)}
                        aria-label={`Mark task ${task.title} as ${task.status === 'todo' ? 'in progress' : task.status === 'in-progress' ? 'done' : 'todo'}`}
                        aria-controls={`task-content-${task.id}`} // Indicate control over content appearance
                        aria-live="polite" // Announce status changes
                        >
                        {task.status === 'done' ? (
                            <CheckCircle size={22} className="text-green-500" />
                        ) : task.status === 'in-progress' ? (
                             <Circle size={22} className="text-blue-500 animate-pulse" />
                        ) : (
                            <Circle size={22} />
                        )}
                        </button>
                        <div id={`task-content-${task.id}`} className="flex-1">
                        <h3 id={`task-title-${task.id}`} className={`text-base sm:text-lg font-medium ${task.status === 'done' ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className={`mt-1 text-sm ${task.status === 'done' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-600 dark:text-slate-300'}`}>
                            {task.description}
                            </p>
                        )}
                        <div className="flex flex-wrap mt-3 gap-2 items-center">
                            <span className={`badge ${PriorityMap[task.priority].color}`}>
                            {PriorityMap[task.priority].label}
                            </span>
                            <span className={`badge ${StatusMap[task.status].color}`}>
                            {StatusMap[task.status].label}
                            </span>
                            {task.tags.slice(0, 3).map((tag) => ( // Show limited tags initially
                            <span key={tag} className="badge bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                                <Tag size={12} className="mr-1" />
                                {tag}
                            </span>
                            ))}
                            {task.tags.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-slate-400">+{task.tags.length - 3} more</span>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center mt-3 text-xs sm:text-sm gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                            <Calendar size={14} />
                            Created: {format(parseISO(task.createdAt), 'MMM d, yyyy')}
                            </span>
                            <span className={`flex items-center gap-1 ${getDueDateStatus(task.dueDate, task.status)}`}>
                            <Clock size={14} />
                            Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                            </span>
                             {task.status === 'done' && task.completedAt && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <CheckCircle size={14} />
                                    Completed: {format(parseISO(task.completedAt), 'MMM d, yyyy')}
                                </span>
                             )}
                        </div>
                        </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0 self-start sm:self-center">
                        <button
                        className="p-1.5 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => openEditTaskModal(task)}
                        aria-label={`Edit task ${task.title}`}
                        >
                        <Edit size={16} />
                        </button>
                        <button
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={() => handleTaskDelete(task.id)}
                        aria-label={`Delete task ${task.title}`}
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
          ) : (
            <div className="card text-center py-12 theme-transition-all">
              <div className="flex-center flex-col">
                <Smile size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">No tasks found</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-xs">
                  {tasks.length === 0 ? "Let's get productive! Add your first task to get started." : "No tasks match your current filters. Try adjusting them or resetting."}
                </p>
                <button className="btn btn-primary mt-4" onClick={tasks.length === 0 ? openAddTaskModal : resetFilters}>
                  {tasks.length === 0 ? "Add Your First Task" : "Clear Filters"}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Task Modal */}
      {isModalOpen && currentTask && (
        <div
          className="modal-backdrop fade-in"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-content max-w-xl w-full slide-in theme-transition-all"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-xl font-medium text-gray-900 dark:text-white">
                {editMode ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleTaskSave(); }} className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Task Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input mt-1"
                  value={currentTask.title ?? ''}
                  onChange={handleInputChange}
                  placeholder="E.g., Define Q3 roadmap goals"
                  required
                  aria-required="true"
                />
                 {!currentTask.title.trim() && <p className="form-error">Title is required.</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  className="input mt-1 h-24"
                  value={currentTask.description ?? ''}
                  onChange={handleInputChange}
                  placeholder="Add more details about the task..."
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
                    // Ensure value is in 'yyyy-MM-dd' format for the input type='date'
                    value={currentTask.dueDate ? format(parseISO(currentTask.dueDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      // Convert yyyy-MM-dd back to ISO string, preserving time if possible or setting default
                      const isoString = dateValue ? new Date(dateValue + 'T12:00:00Z').toISOString() : new Date().toISOString();
                       handleInputChange({
                        target: { name: 'dueDate', value: isoString },
                       } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')} // Prevent selecting past dates as due dates
                    aria-label="Due date"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    className="input mt-1"
                    value={currentTask.priority ?? 'medium'}
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
                  value={currentTask.status ?? 'todo'}
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
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {(currentTask.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-center gap-1 text-sm"
                    >
                      {tag}
                      <button
                        type="button" // Prevent form submission
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 p-0.5 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                 {currentTask.tags.length === 0 && <p className="text-xs text-gray-500 italic">No tags added yet.</p>}
                </div>
                <div className="flex mt-2 gap-2">
                  <input
                    type="text"
                    className="input flex-1 input-sm"
                    placeholder="Add a tag (e.g., Q3, Mobile)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission on Enter key
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
                    type="button" // Prevent form submission
                    className="btn btn-secondary btn-sm"
                    onClick={handleTagAdd}
                    disabled={!newTag.trim()}
                    aria-label="Add tag"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button" // Prevent form submission
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={closeModal}
                  aria-label="Cancel and close modal"
                >
                  Cancel
                </button>
                <button
                  type="submit" // Submit button
                  className="btn btn-primary"
                  disabled={!currentTask.title.trim()}
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
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition-bg mt-auto no-print">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
