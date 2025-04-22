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
  SortAsc,
} from 'lucide-react';
import { format } from 'date-fns';
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

const PriorityMap: Record<Priority, { color: string; label: string }> = {
  high: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Medium' },
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Low' },
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Manager Task Board</h1>
            <div className="flex gap-4 items-center">
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <button
                className="btn btn-primary flex-center gap-2"
                onClick={openAddTaskModal}
                aria-label="Add new task"
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              className="input pl-10"
              placeholder="Search tasks..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              aria-label="Search tasks"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex gap-2 md:gap-4">
            <div className="relative" ref={filterDropdownRef}>
              <button
                className="btn bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 flex-center gap-2"
                onClick={toggleFilterDropdown}
                aria-label="Open filter menu"
                aria-expanded={isFilterDropdownOpen}
                aria-controls="filter-dropdown"
              >
                <Filter size={18} />
                <span>Filters</span>
                <ChevronDown size={16} />
              </button>

              {isFilterDropdownOpen && (
                <div 
                  id="filter-dropdown"
                  className="card absolute right-0 mt-2 w-72 z-[var(--z-dropdown)] shadow-lg"
                >
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

                    <div>
                      <span className="form-label block mb-2">Filter by Tags</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {availableTags.length > 0 ? (
                          availableTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleTagFilterToggle(tag)}
                              className={`badge ${filters.tags.includes(tag) ? 'badge-info' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'} cursor-pointer transition-colors`}
                              aria-pressed={filters.tags.includes(tag)}
                              aria-label={`Filter by tag: ${tag}`}
                            >
                              {tag}
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-slate-400">No tags available</p>
                        )}
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
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`card transition-all hover:shadow-md ${task.status === 'done' ? 'dark:bg-slate-800/70 bg-white/60' : 'dark:bg-slate-800 bg-white'}`}
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
      </main>

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

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-auto">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
