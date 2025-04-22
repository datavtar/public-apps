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
  ChartPie,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { format, isToday, isPast, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
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

const PriorityMap: Record<Priority, { color: string; label: string, chartColor: string, darkChartColor: string }> = {
  high: { color: 'badge badge-error', label: 'High', chartColor: '#ef4444', darkChartColor: '#f87171' }, // Red
  medium: { color: 'badge badge-warning', label: 'Medium', chartColor: '#f59e0b', darkChartColor: '#fbbf24' }, // Amber
  low: { color: 'badge badge-success', label: 'Low', chartColor: '#10b981', darkChartColor: '#34d399' }, // Emerald
};

const StatusMap: Record<Status, { color: string; label: string, chartColor: string, darkChartColor: string }> = {
  'todo': { color: 'badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'To Do', chartColor: '#9ca3af', darkChartColor: '#6b7280' }, // Gray
  'in-progress': { color: 'badge badge-info', label: 'In Progress', chartColor: '#3b82f6', darkChartColor: '#60a5fa' }, // Blue
  'done': { color: 'badge badge-success', label: 'Done', chartColor: '#10b981', darkChartColor: '#34d399' }, // Emerald
};

// Extend Task interface for analytics if needed later, for now calculate directly

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
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Due tomorrow
    priority: 'high',
    status: 'todo',
    tags: ['sprint', 'planning']
  },
  {
    id: '3',
    title: 'Review mockups from design team',
    description: 'Provide feedback on the latest UI designs',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date().toISOString(), // Due today
    priority: 'medium',
    status: 'todo',
    tags: ['design', 'UI']
  },
  {
    id: '4',
    title: 'Prepare presentation for stakeholders',
    description: 'Create slides summarizing the product roadmap',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('productManagerTasks');
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    } catch (error) {
      console.error("Error parsing tasks from localStorage:", error);
      return initialTasks; // Fallback to initial data
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    try {
      const savedTags = localStorage.getItem('productManagerTags');
      // Ensure unique tags and combine with initial tags if needed
      const parsedTags = savedTags ? JSON.parse(savedTags) : [];
      const initialDefaultTags = ['research', 'design', 'planning', 'backlog', 'UI', 'sprint', 'roadmap', 'market analysis', 'refinement', 'presentation'];
      return [...new Set([...initialDefaultTags, ...parsedTags])];
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
  const [showAnalytics, setShowAnalytics] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Update localStorage whenever tasks or tags change
  useEffect(() => {
    try {
      localStorage.setItem('productManagerTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('productManagerTags', JSON.stringify(availableTags));
    } catch (error) {
      console.error("Error saving tags to localStorage:", error);
    }
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

  // Close modal/dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isFilterDropdownOpen) setIsFilterDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, isFilterDropdownOpen]); // Re-add dependencies

  // Close dropdowns/modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close filter dropdown
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      // Close modal (only if click is on backdrop)
      if (modalRef.current && event.target === modalRef.current?.parentElement) {
         closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]); // Re-add dependencies

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setEditMode(false);
    setNewTag(''); // Reset new tag input on close
    if (document.body.classList.contains('modal-open')) {
      document.body.classList.remove('modal-open');
    }
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
    setCurrentTask({ ...task }); // Create a copy to avoid modifying the original state directly
    setIsModalOpen(true);
    setEditMode(true);
    document.body.classList.add('modal-open');
  };

  const handleTagAdd = () => {
    if (newTag && currentTask && !currentTask.tags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim();
      setCurrentTask(prev => prev ? { ...prev, tags: [...prev.tags, trimmedTag] } : null);
      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags(prev => [...prev, trimmedTag]);
      }
      setNewTag('');
    }
  };

  const handleTagRemove = (tag: string) => {
    if (currentTask) {
      setCurrentTask(prev => prev ? {
        ...prev,
        tags: prev.tags.filter((t) => t !== tag),
      } : null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentTask) {
        const { name, value } = e.target;
        setCurrentTask(prev => prev ? {
            ...prev,
            [name]: value,
        } : null);
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
    } else {
      // Optionally show an error message if validation fails
      console.error("Task title cannot be empty.");
    }
  };

  const handleTaskDelete = (id: string) => {
    // Optional: Add a confirmation step here
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleStatusChange = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          let newStatus: Status;
          switch (task.status) {
            case 'todo': newStatus = 'in-progress'; break;
            case 'in-progress': newStatus = 'done'; break;
            case 'done': newStatus = 'todo'; break;
            default: newStatus = 'todo';
          }
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
      const lowerSearchQuery = filters.searchQuery.toLowerCase();
      const matchesSearch = task.title.toLowerCase().includes(lowerSearchQuery) ||
                           task.description.toLowerCase().includes(lowerSearchQuery) ||
                           task.tags.some(tag => tag.toLowerCase().includes(lowerSearchQuery));

      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesTags = filters.tags.length === 0 ||
                         filters.tags.every(filterTag => task.tags.includes(filterTag));

      return matchesSearch && matchesPriority && matchesStatus && matchesTags;
    })
    .sort((a, b) => {
      const sortMultiplier = filters.sortDirection === 'asc' ? 1 : -1;

      if (filters.sortBy === 'dueDate') {
        return sortMultiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      }

      if (filters.sortBy === 'priority') {
        const priorityOrder: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        return sortMultiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      }

      if (filters.sortBy === 'createdAt') {
        return sortMultiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      return 0;
    }), [tasks, filters]);

  const getDueDateStatus = (dueDate: string, status: Status) => {
    if (status === 'done') return 'text-gray-500 dark:text-slate-400'; // Don't highlight due date if done
    const due = new Date(dueDate);
    if (isPast(due) && !isToday(due)) {
      return 'text-red-600 dark:text-red-400 font-medium'; // Overdue
    } else if (isToday(due)) {
      return 'text-yellow-600 dark:text-yellow-400 font-medium'; // Due Today
    } else {
      return 'text-gray-600 dark:text-gray-400'; // Upcoming
    }
  };

  // Analytics Data Calculation
  const analyticsData = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => t.status !== 'done' && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length;
    const dueTodayTasks = tasks.filter(t => t.status !== 'done' && isToday(new Date(t.dueDate))).length;

    const statusDistribution = Object.entries(StatusMap).map(([key, { label }]) => ({
      name: label,
      value: tasks.filter(t => t.status === key).length,
    }));

    const priorityDistribution = Object.entries(PriorityMap).map(([key, { label }]) => ({
        name: label,
        value: tasks.filter(t => t.priority === key).length,
    }));

    return {
        totalTasks,
        completedTasks,
        overdueTasks,
        dueTodayTasks,
        statusDistribution: statusDistribution.filter(item => item.value > 0), // Only show categories with tasks
        priorityDistribution: priorityDistribution.filter(item => item.value > 0),
    };
  }, [tasks]);

  // Colors for Charts
  const statusColors = useMemo(() => 
    analyticsData.statusDistribution.map(item => 
        isDarkMode ? StatusMap[item.name.toLowerCase().replace(' ', '-') as Status]?.darkChartColor : StatusMap[item.name.toLowerCase().replace(' ', '-') as Status]?.chartColor
    ).filter(Boolean) as string[], 
  [analyticsData.statusDistribution, isDarkMode]);

  const priorityColors = useMemo(() => 
    analyticsData.priorityDistribution.map(item => 
      isDarkMode ? PriorityMap[item.name.toLowerCase() as Priority]?.darkChartColor : PriorityMap[item.name.toLowerCase() as Priority]?.chartColor
    ).filter(Boolean) as string[], 
  [analyticsData.priorityDistribution, isDarkMode]);


  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-700 p-2 rounded shadow text-sm text-gray-800 dark:text-slate-200">
          <p className="label">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-[var(--z-sticky)]">
        <div className="container-fluid py-3 sm:py-4">
          <div className="flex-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">✅ Product Manager Task Board</h1>
            <div className="flex gap-2 sm:gap-4 items-center">
              <button
                className="theme-toggle theme-transition-all"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="theme-toggle-thumb theme-transition-all"></span>
                <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              </button>
              <button
                className="btn btn-primary btn-responsive flex-center gap-1 sm:gap-2"
                onClick={openAddTaskModal}
                aria-label="Add new task"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Task</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-4 sm:py-6 flex-grow">
        {/* Analytics Section */}
        <div className="mb-4 sm:mb-6">
          <button 
            className="w-full btn bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-between mb-4 text-left" 
            onClick={() => setShowAnalytics(!showAnalytics)}
            aria-expanded={showAnalytics}
            aria-controls="analytics-section"
          >
            <span className="flex items-center gap-2 font-medium">
              <ChartPie size={18} />
              Task Analytics
            </span>
            {showAnalytics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showAnalytics && (
            <div id="analytics-section" className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
              {/* Stat Cards */}
              <div className="stat-card">
                <div className="stat-title">Total Tasks</div>
                <div className="stat-value">{analyticsData.totalTasks}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-green-600 dark:text-green-400">{analyticsData.completedTasks}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title flex items-center gap-1"> 
                    <AlertCircle size={14} className="text-red-500"/> Overdue
                </div>
                <div className={`stat-value ${analyticsData.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{analyticsData.overdueTasks}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title flex items-center gap-1">
                    <Clock size={14} className="text-yellow-500"/> Due Today
                </div>
                <div className={`stat-value ${analyticsData.dueTodayTasks > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{analyticsData.dueTodayTasks}</div>
              </div>

              {/* Charts */} 
              {analyticsData.statusDistribution.length > 0 && (
                <div className="stat-card sm:col-span-1 lg:col-span-2">
                  <h4 className="stat-title mb-2">Task Status</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={analyticsData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {analyticsData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={10} wrapperStyle={{fontSize: '0.8rem'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {analyticsData.priorityDistribution.length > 0 && (
                <div className="stat-card sm:col-span-1 lg:col-span-2">
                  <h4 className="stat-title mb-2">Task Priority</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={analyticsData.priorityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {analyticsData.priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={priorityColors[index % priorityColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={10} wrapperStyle={{fontSize: '0.8rem'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search and filters */}
        <div className="mb-4 sm:mb-6 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              className="input input-responsive pl-10"
              placeholder="Search tasks by title, description, or tag..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              aria-label="Search tasks"
              name="search-tasks"
              role="searchbox"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex gap-2 md:gap-3">
            <div className="relative" ref={filterDropdownRef}>
              <button
                className="btn btn-responsive bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 flex-center gap-1 sm:gap-2"
                onClick={toggleFilterDropdown}
                aria-label="Open filter menu"
                aria-expanded={isFilterDropdownOpen}
                aria-controls="filter-dropdown"
              >
                <Filter size={16} />
                <span>Filters</span>
                <ChevronDown size={16} className={`${isFilterDropdownOpen ? 'transform rotate-180' : ''} transition-transform`} />
              </button>

              {isFilterDropdownOpen && (
                <div
                  id="filter-dropdown"
                  className="card absolute right-0 mt-2 w-72 z-[var(--z-dropdown)] shadow-lg fade-in"
                  role="menu"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="form-label" htmlFor="priority-filter">Priority</label>
                      <select
                        id="priority-filter"
                        name="priority-filter"
                        className="input input-responsive mt-1"
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
                        name="status-filter"
                        className="input input-responsive mt-1"
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
                          name="sort-by"
                          className="input input-responsive mt-1 flex-1"
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          aria-label="Sort by field"
                        >
                          <option value="dueDate">Due Date</option>
                          <option value="priority">Priority</option>
                          <option value="createdAt">Created Date</option>
                        </select>
                        <button
                          className="mt-1 btn-responsive bg-gray-100 dark:bg-slate-700 p-2 rounded-md flex-center" // Ensures icon is centered
                          onClick={toggleSortDirection}
                          aria-label={`Change sort direction, current is ${filters.sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                        >
                          {filters.sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="form-label block mb-1">Filter by Tags</span>
                      <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                        {availableTags.length > 0 ? (
                          availableTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleTagFilterToggle(tag)}
                              className={`badge ${filters.tags.includes(tag) ? 'badge-info' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'} cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-slate-600`}
                              aria-pressed={filters.tags.includes(tag)}
                              aria-label={`Toggle filter by tag: ${tag}`}
                              role="checkbox"
                            >
                              {tag}
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-slate-400 italic">No tags created yet</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-slate-700">
                      <button
                        className="btn btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
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

        {/* Task list */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`card card-responsive transition-all hover:shadow-lg ${task.status === 'done' ? 'opacity-70 dark:bg-slate-800/70 bg-white/60' : 'dark:bg-slate-800 bg-white'}`}
                role="listitem"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* Status Toggle & Main Content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0"> {/* Added min-w-0 for text ellipsis */}
                    <button
                      className="mt-1 text-gray-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex-shrink-0"
                      onClick={() => handleStatusChange(task.id)}
                      aria-label={`Mark task as ${task.status === 'todo' ? 'in progress' : task.status === 'in-progress' ? 'done' : 'todo'}`}
                      title={`Click to change status to: ${task.status === 'todo' ? 'In Progress' : task.status === 'in-progress' ? 'Done' : 'To Do'}`}
                    >
                      {task.status === 'done' ? (
                        <CheckCircle size={20} className="text-green-500 dark:text-green-400" />
                      ) : task.status === 'in-progress' ? (
                        <Circle size={20} className="text-blue-500 dark:text-blue-400 animate-pulse" /> /* Optional pulse for in-progress */
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0"> {/* Added min-w-0 */}
                      <h3 className={`text-base sm:text-lg font-medium truncate ${task.status === 'done' ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`}
                         title={task.title}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mt-1 text-xs sm:text-sm ${task.status === 'done' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-600 dark:text-slate-300'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center mt-2 sm:mt-3 gap-x-3 gap-y-1 text-xs sm:text-sm">
                        <span className={`${PriorityMap[task.priority].color} text-xs`}>
                          {PriorityMap[task.priority].label}
                        </span>
                        <span className={`${StatusMap[task.status].color} text-xs`}>
                          {StatusMap[task.status].label}
                        </span>
                        {task.tags.slice(0, 3).map((tag) => ( // Limit visible tags initially
                          <span key={tag} className="badge bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && <span className="text-xs text-gray-400 dark:text-slate-500">+{task.tags.length - 3} more</span>}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-2 sm:mt-3 text-xs sm:text-sm gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          <Calendar size={13} />
                          Created: {format(new Date(task.createdAt), 'MMM d, yy')}
                        </span>
                        <span className={`flex items-center gap-1 ${getDueDateStatus(task.dueDate, task.status)} whitespace-nowrap`}>
                          <Clock size={13} />
                          Due: {format(new Date(task.dueDate), 'MMM d, yy')}
                          {task.status !== 'done' && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && <span className='ml-1'>(Overdue)</span>}
                          {task.status !== 'done' && isToday(new Date(task.dueDate)) && <span className='ml-1'>(Today)</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      className="p-1 sm:p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                      onClick={() => openEditTaskModal(task)}
                      aria-label={`Edit task: ${task.title}`}
                      title="Edit Task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 sm:p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      onClick={() => handleTaskDelete(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card card-responsive text-center py-10 sm:py-16">
              <div className="flex-center flex-col max-w-md mx-auto">
                <Smile size={40} className="text-gray-300 dark:text-slate-600 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">No tasks found</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
                  {tasks.length === 0 ? "Ready to organize your product roadmap? Add your first task!" : "No tasks match your current filters. Try adjusting them or clearing all filters."}
                </p>
                <button className="btn btn-primary btn-responsive mt-4 sm:mt-6" onClick={tasks.length === 0 ? openAddTaskModal : resetFilters}>
                  {tasks.length === 0 ? "Add your first task" : "Clear filters"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */} 
      {isModalOpen && currentTask && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={closeModal}>
          <div className="modal-content max-w-lg w-full" ref={modalRef} onClick={(e) => e.stopPropagation()}> 
            <div className="modal-header">
              <h3 id="modal-title" className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                {editMode ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Task Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input input-responsive mt-1"
                  value={currentTask.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Define MVP for login feature"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="input input-responsive mt-1 h-24"
                  value={currentTask.description}
                  onChange={handleInputChange}
                  placeholder="Add details, context, or acceptance criteria..."
                  aria-label="Task description"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="dueDate">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    className="input input-responsive mt-1"
                    value={currentTask.dueDate ? format(new Date(currentTask.dueDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      // Ensure time is preserved or set default if needed
                      const isoString = dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : new Date().toISOString(); 
                      handleInputChange({ 
                         target: { name: 'dueDate', value: isoString }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')} // Prevent selecting past dates, allow today
                    aria-label="Due date"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    className="input input-responsive mt-1"
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
                  className="input input-responsive mt-1"
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
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge badge-info flex items-center gap-1"
                      role="listitem"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex mt-2 gap-2">
                  <input
                    type="text"
                    className="input input-responsive flex-1"
                    placeholder="Add a new tag (e.g., Q3-goal)"
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
                    name="new-tag"
                  />
                  <datalist id="available-tags">
                    {availableTags.map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                  <button
                    type="button" // Prevent form submission if nested
                    className="btn btn-secondary btn-responsive"
                    onClick={handleTagAdd}
                    disabled={!newTag.trim()}
                    aria-label="Add tag"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-responsive bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={closeModal}
                aria-label="Cancel task creation or edit"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-responsive"
                onClick={handleTaskSave}
                disabled={!currentTask.title.trim()} // Basic validation
                aria-label={editMode ? 'Update task' : 'Create task'}
              >
                {editMode ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */} 
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-3 sm:py-4 mt-auto">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
