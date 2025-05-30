import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useAuth } from './contexts/authContext';
import { Plus, Edit, Trash2, Check, X, Search, Filter, ArrowDownUp, Sun, Moon, Settings, LogOut, BrainCircuit, Download, FileText, Calendar as CalendarIcon, ChevronDown, ChevronUp, AlertCircle, Info, ArrowUp, ArrowDown } from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

// Styles are in styles/styles.module.css
import styles from './styles/styles.module.css';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: number;
  subTasks?: Task[];
}

enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

const priorityOrder: Record<Priority, number> = {
  [Priority.HIGH]: 3,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 1,
};

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [Priority.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

type StatusFilter = 'all' | 'active' | 'completed';
type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';
type CurrentPage = 'tasks' | 'settings' | 'calendar';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('todo_tasks_app_theme');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [currentPage, setCurrentPage] = useState<CurrentPage>('tasks');
  const [showClearDataConfirm, setShowClearDataConfirm] = useState<boolean>(false);

  // AI State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState<boolean>(false);

  // Initial data load & theme setup
  useEffect(() => {
    const storedTasks = localStorage.getItem('todo_tasks_app_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Add initial sample tasks if none exist
      setTasks([
        { id: '1', title: 'Grocery Shopping', description: 'Buy milk, eggs, bread, and cheese.', completed: false, priority: Priority.HIGH, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], createdAt: Date.now() - 24*60*60*1000 },
        { id: '2', title: 'Book Doctor Appointment', completed: true, priority: Priority.MEDIUM, createdAt: Date.now() - 2*24*60*60*1000 }, 
        { id: '3', title: 'Plan Weekend Trip', description: 'Research destinations and book accommodation.', completed: false, priority: Priority.LOW, createdAt: Date.now() },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todo_tasks_app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('todo_tasks_app_theme', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('todo_tasks_app_theme', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Modal Handling
  const openModal = (taskToEdit?: Task) => {
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setTaskForm({ ...taskToEdit });
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: Priority.MEDIUM, completed: false });
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setTaskForm({});
    setAiResult(null);
    setShowAiSuggestions(false);
    document.body.classList.remove('modal-open');
  };
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Task Form Handling
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setTaskForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!taskForm.title?.trim()) {
      alert('Task title cannot be empty.');
      return;
    }

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...taskForm } as Task : t));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskForm.title || 'Untitled Task',
        description: taskForm.description,
        completed: taskForm.completed || false,
        priority: taskForm.priority || Priority.MEDIUM,
        dueDate: taskForm.dueDate,
        createdAt: Date.now(),
      };
      setTasks([newTask, ...tasks]);
    }
    closeModal();
  };

  // Task Operations
  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  // AI Task Breakdown
  const handleAiBreakdown = () => {
    if (!taskForm.title?.trim()) {
      setAiError('Please enter a task title first.');
      return;
    }
    const promptForAI = `Break down the following task into a list of 2 to 4 actionable sub-tasks: "${taskForm.title}". If the task is simple, return an empty list. Return a JSON array of strings, where each string is a sub-task title. Example: For "Plan birthday party", return ["Create guest list", "Send invitations", "Order cake"].`;
    setAiPrompt(promptForAI);
    setAiResult(null);
    setAiError(null);
    setShowAiSuggestions(true);
    // The AILayer component will automatically call sendToAI when aiPrompt changes and it's rendered
    // For direct call: aiLayerRef.current?.sendToAI(promptForAI);
  };

  const addSuggestedTasks = (suggestedTitles: string[]) => {
    const newSubTasks: Task[] = suggestedTitles.map((title, index) => ({
      id: `${editingTask ? editingTask.id : 'new'}-sub-${Date.now() + index}`,
      title,
      completed: false,
      priority: taskForm.priority || Priority.MEDIUM,
      createdAt: Date.now(),
    }));
    
    if (editingTask) {
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, subTasks: [...(t.subTasks || []), ...newSubTasks] } : t));
    } else {
        // For new tasks, attach to form temporarily, will be saved with main task
        setTaskForm(prev => ({...prev, subTasks: [...(prev.subTasks || []), ...newSubTasks]}));
    }
    setShowAiSuggestions(false);
    setAiResult(null); // Clear AI result after use
  };

  useEffect(() => {
    if (aiResult && showAiSuggestions) {
      try {
        const suggestions = JSON.parse(aiResult);
        if (Array.isArray(suggestions) && suggestions.length > 0 && suggestions.every(s => typeof s === 'string')) {
          // Successfully parsed suggestions
        } else {
          setAiError("AI couldn't provide valid sub-tasks.");
        }
      } catch (error) {
        setAiError('Failed to parse AI suggestions.');
        console.error('AI Result Parsing Error:', error);
      }
    }
  }, [aiResult, showAiSuggestions]);


  // Filtering and Sorting
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'completed' && task.completed) || (filterStatus === 'active' && !task.completed);
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case 'dueDate':
          comparison = (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
          break;
        case 'priority':
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]; // Higher priority first
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
        default:
          comparison = b.createdAt - a.createdAt; // Newest first by default
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const toggleSortDirection = (option: SortOption) => {
    if (sortOption === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc'); // Default to ascending for new sort option
    }
  }

  // Settings Page Functions
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
      setTasks([]);
      localStorage.removeItem('todo_tasks_app_tasks');
      setShowClearDataConfirm(false);
      alert('All tasks have been deleted.');
    }
  };

  const handleDownloadData = () => {
    if (tasks.length === 0) {
      alert('No data to download.');
      return;
    }
    const csvHeader = 'ID,Title,Description,Completed,Priority,Due Date,Created At,Subtasks\n';
    const csvRows = tasks.map(task => {
      const subTasksString = (task.subTasks || []).map(st => st.title).join('; ');
      return `${task.id},"${task.title.replace(/"/g, '""')}","${(task.description || '').replace(/"/g, '""')}",${task.completed},${task.priority},${task.dueDate || ''},${new Date(task.createdAt).toISOString()},"${subTasksString.replace(/"/g, '""')}"`;
    }).join('\n');
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tasks_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!currentUser) {
    // This part is usually handled by a routing mechanism in larger apps
    // For this structure, useAuth likely handles redirecting to login if no currentUser
    return <div className="flex items-center justify-center h-screen text-xl">Loading user...</div>;
  }

  const SortIndicator = ({ option }: { option: SortOption }) => {
    if (sortOption !== option) return null;
    return sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  // Calendar View (Simple)
  const CalendarView = () => {
    const tasksWithDueDate = tasks.filter(task => task.dueDate);
    const groupedTasks = tasksWithDueDate.reduce((acc, task) => {
      const date = task.dueDate!;
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const sortedDates = Object.keys(groupedTasks).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    return (
      <div className="p-4 md:p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Tasks by Due Date</h2>
        {sortedDates.length === 0 && <p className="text-gray-600 dark:text-gray-400">No tasks with due dates.</p>}
        {sortedDates.map(date => (
          <div key={date} className="mb-4">
            <h3 className="text-lg font-medium text-primary-600 dark:text-primary-400 mb-2">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <ul className="space-y-2">
              {groupedTasks[date].map(task => (
                <li key={task.id} className={`card card-sm ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className={`${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>{task.title}</span>
                    <span className={`badge text-xs ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className={`flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900 theme-transition ${styles.appContainer}`}>
      <header className="bg-primary-600 dark:bg-slate-800 text-white shadow-md sticky top-0 z-sticky no-print">
        <div className="container-wide mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ProductivePanda Tasks</h1>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">Welcome, {currentUser.first_name}!</span>
            <button
              id="theme-toggle-button"
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={logout}
              className="btn bg-red-500 hover:bg-red-600 text-white btn-sm flex items-center gap-1"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <nav className="bg-primary-700 dark:bg-slate-700">
          <div className="container-wide mx-auto px-4 flex items-center space-x-1 md:space-x-2">
            {['tasks', 'calendar', 'settings'].map((page) => (
              <button
                key={page}
                id={`${page}-nav-button`}
                onClick={() => setCurrentPage(page as CurrentPage)}
                className={`py-2 px-3 md:px-4 text-sm md:text-base font-medium rounded-t-md transition-colors hover:bg-primary-500 dark:hover:bg-slate-600 ${currentPage === page ? 'bg-gray-100 dark:bg-slate-900 text-primary-700 dark:text-white' : 'text-white'}`}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-grow container-wide mx-auto p-4 md:p-6">
        {currentPage === 'tasks' && (
          <div className="space-y-6">
            <div className="card card-responsive">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">Your Tasks</h2>
                <button
                  id="add-task-button" 
                  onClick={() => openModal()}
                  className="btn btn-primary btn-responsive flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus size={20} /> Add New Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input 
                  type="search"
                  id="search-task-input"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-responsive md:col-span-1"
                  aria-label="Search tasks"
                />
                <select
                  id="filter-status-dropdown"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
                  className="input input-responsive md:col-span-1"
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  id="filter-priority-dropdown"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                  className="input input-responsive md:col-span-1"
                  aria-label="Filter by priority"
                >
                  <option value="all">All Priorities</option>
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Sort Buttons */} 
              <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Sort by:</span>
                {(['createdAt', 'dueDate', 'priority', 'title'] as SortOption[]).map(option => (
                  <button 
                    key={option}
                    onClick={() => toggleSortDirection(option)}
                    className={`flex items-center gap-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 ${sortOption === option ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1')}
                    <SortIndicator option={option} />
                  </button>
                ))}
              </div> 

              {filteredAndSortedTasks.length === 0 && (
                 <div id="generation_issue_fallback" className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <Info size={48} className="mx-auto mb-2" />
                    <p className="text-lg">No tasks match your criteria.</p>
                    <p>Try adjusting your search or filters, or add a new task!</p>
                </div>
              )}
              <div id="task-list-container" className="space-y-4">
                {filteredAndSortedTasks.map(task => (
                  <div key={task.id} className={`card card-sm p-4 ${styles.taskItem} ${task.completed ? styles.completedTask : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskComplete(task.id)}
                            className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                            aria-labelledby={`task-title-${task.id}`}
                          />
                          <h3 id={`task-title-${task.id}`} className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>{task.title}</h3>
                        </div>
                        {task.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 break-words">{task.description}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className={`badge ${priorityColors[task.priority]}`}>{task.priority}</span>
                          {task.dueDate && <span className="badge badge-info flex items-center gap-1"><CalendarIcon size={12}/> Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                          <span className="text-gray-500 dark:text-gray-400">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                        <button onClick={() => openModal(task)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1" aria-label={`Edit task ${task.title}`}><Edit size={14}/> <span className='hidden sm:inline'>Edit</span></button>
                        <button onClick={() => deleteTask(task.id)} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1" aria-label={`Delete task ${task.title}`}><Trash2 size={14}/> <span className='hidden sm:inline'>Delete</span></button>
                      </div>
                    </div>
                    {task.subTasks && task.subTasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sub-tasks:</h4>
                            <ul className="list-disc list-inside space-y-1 pl-1">
                                {task.subTasks.map(sub => (
                                    <li key={sub.id} className={`text-sm flex items-center justify-between ${sub.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                      <span>{sub.title}</span>
                                      {/* Basic toggle for sub-tasks, could be expanded */}
                                      <input type="checkbox" checked={sub.completed} onChange={() => {
                                        setTasks(prevTasks => prevTasks.map(pt => 
                                            pt.id === task.id ? 
                                            {...pt, subTasks: (pt.subTasks || []).map(s => s.id === sub.id ? {...s, completed: !s.completed} : s)}
                                            : pt
                                        )) 
                                      }} className="form-checkbox h-4 w-4 text-primary-500 rounded ml-2" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'calendar' && <CalendarView />}

        {currentPage === 'settings' && (
          <div className="card card-responsive space-y-6" id="settings-page-content">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>
            
            <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-md">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Data Management</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleDownloadData}
                  className="btn btn-secondary btn-responsive flex items-center justify-center gap-2"
                  aria-label="Download all tasks as CSV"
                  id="download-data-button"
                >
                  <Download size={18} /> Download All Tasks (CSV)
                </button>
                <button 
                  onClick={() => setShowClearDataConfirm(true)}
                  className="btn bg-red-600 hover:bg-red-700 text-white btn-responsive flex items-center justify-center gap-2"
                  aria-label="Delete all tasks"
                  id="delete-all-data-button"
                >
                  <Trash2 size={18} /> Delete All Tasks
                </button>
              </div>
            </div>

            {showClearDataConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[var(--z-modal-backdrop)]" onClick={() => setShowClearDataConfirm(false)}>
                <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
                    <button onClick={() => setShowClearDataConfirm(false)} className="text-gray-400 hover:text-gray-500"><X size={20}/></button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete all your tasks? This action is irreversible.</p>
                  <div className="modal-footer">
                    <button onClick={() => setShowClearDataConfirm(false)} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                    <button onClick={handleClearAllData} className="btn btn-danger bg-red-600 hover:bg-red-700 text-white">Delete All</button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-md">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">User Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Username: {currentUser.username}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email: {currentUser.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Name: {currentUser.first_name} {currentUser.last_name}</p>
            </div>

          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="modal-backdrop theme-transition-all" onClick={closeModal}>
          <div className={`modal-content max-w-lg ${styles.taskModal}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><X size={24}/></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="title" className="form-label">Title</label>
                <input 
                  id="task-input-field" 
                  type="text" 
                  name="title" 
                  value={taskForm.title || ''} 
                  onChange={handleFormChange} 
                  className="input input-responsive" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="description" className="form-label">Description (Optional)</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={taskForm.description || ''} 
                  onChange={handleFormChange} 
                  rows={3} 
                  className="input input-responsive"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select 
                    id="priority" 
                    name="priority" 
                    value={taskForm.priority || Priority.MEDIUM} 
                    onChange={handleFormChange} 
                    className="input input-responsive"
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="form-label">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    id="dueDate" 
                    name="dueDate" 
                    value={taskForm.dueDate || ''} 
                    onChange={handleFormChange} 
                    className="input input-responsive"
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
                </div>
              </div>
              
              {/* AI Task Breakdown Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-200">AI Task Breakdown</h4>
                  <button 
                    type="button"
                    onClick={handleAiBreakdown}
                    className="btn btn-sm bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1"
                    disabled={isAiLoading || !taskForm.title?.trim()}
                    id="ai-breakdown-button"
                    aria-label="Use AI to break down task"
                  >
                    <BrainCircuit size={16} /> {isAiLoading ? 'Analyzing...' : 'Suggest Sub-tasks'}
                  </button>
                </div>
                {aiError && <p className="form-error mt-1">AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
                {showAiSuggestions && isAiLoading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">AI is thinking...</p>}
                {showAiSuggestions && aiResult && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">AI Suggestions:</p>
                    {(() => {
                      try {
                        const suggestions = JSON.parse(aiResult);
                        if (Array.isArray(suggestions) && suggestions.length > 0 && suggestions.every(s => typeof s === 'string')) {
                          return (
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                              {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                              <button type="button" onClick={() => addSuggestedTasks(suggestions)} className="btn btn-sm btn-primary mt-2">Add these sub-tasks</button>
                            </ul>
                          );
                        } else if (Array.isArray(suggestions) && suggestions.length === 0) {
                            return <p className="text-sm text-gray-600 dark:text-gray-400">AI suggests this task is simple enough and doesn't need further breakdown.</p>
                        }
                        return <p className="text-sm text-red-600 dark:text-red-400">AI response was not in the expected format.</p>;
                      } catch (e) {
                        return <p className="text-sm text-red-600 dark:text-red-400">Error parsing AI suggestions.</p>;
                      }
                    })()}
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Save Changes' : 'Add Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt} // Will trigger when aiPrompt is set and AILayer is rendered
        onResult={(res) => { setAiResult(res); if(showAiSuggestions) setShowAiSuggestions(true);}}
        onError={(err) => { setAiError(err); if(showAiSuggestions) setShowAiSuggestions(true);}}
        onLoading={setIsAiLoading}
      />

      <footer className="bg-gray-200 dark:bg-slate-800 text-center py-4 text-sm text-gray-600 dark:text-gray-400 no-print theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
