import React, { useState, useEffect, useRef, useCallback, FormEvent, ChangeEvent } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { 
  Plus, Edit3, Trash2, CheckSquare, Square, Search, Filter, ArrowDownUp, 
  CalendarDays, Tag, Settings, LogOut, Sun, Moon, BrainCircuit, ListChecks, 
  Archive, Download, AlertTriangle, Info, X, ChevronDown, ChevronUp, RotateCcw, Star, AlignLeft
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  categoryId?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface AppSettings {
  darkMode: boolean;
  defaultView: FilterStatus;
  showDashboard: boolean;
}

type FilterStatus = 'all' | 'pending' | 'completed';
type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

interface AIParsedTask {
  title?: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority?: Priority;
  categoryName?: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();

  // --- State --- 
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('todoAppSettings_v2');
    return savedSettings ? JSON.parse(savedSettings) : { darkMode: false, defaultView: 'all', showDashboard: true };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(appSettings.defaultView);
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentTaskData, setCurrentTaskData] = useState<Partial<Task>>({});

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentCategoryData, setCurrentCategoryData] = useState<Partial<Category>>({ color: '#cccccc' });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // Task ID or 'all-tasks'
  const [showClearCategoriesConfirm, setShowClearCategoriesConfirm] = useState(false);

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAIHelper, setShowAIHelper] = useState(false);

  const taskFormRef = useRef<HTMLFormElement>(null);

  // --- Effects --- 
  useEffect(() => {
    if (appSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('todoAppSettings_v2', JSON.stringify(appSettings));
  }, [appSettings.darkMode, appSettings.defaultView, appSettings.showDashboard]);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedTasks = localStorage.getItem('todoTasks_v2');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        
        const savedCategories = localStorage.getItem('todoCategories_v2');
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        else {
            // Initialize with default categories if none exist
            const defaultCategories: Category[] = [
                { id: 'cat1', name: 'Work', color: '#3b82f6' },
                { id: 'cat2', name: 'Personal', color: '#10b981' },
                { id: 'cat3', name: 'Shopping', color: '#f59e0b' },
            ];
            setCategories(defaultCategories);
            localStorage.setItem('todoCategories_v2', JSON.stringify(defaultCategories));
        }
      } catch (error) {
        console.error("Failed to load data from localStorage", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('todoTasks_v2', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('todoCategories_v2', JSON.stringify(categories));
    }
  }, [categories, isLoading]);
  
  // Escape key for modals
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isTaskModalOpen) closeModal(setIsTaskModalOpen);
        if (isSettingsModalOpen) closeModal(setIsSettingsModalOpen);
        if (isCategoryModalOpen) closeModal(setIsCategoryModalOpen);
        if (showDeleteConfirm) setShowDeleteConfirm(null);
        if (showClearCategoriesConfirm) setShowClearCategoriesConfirm(false);
        if (showAIHelper) setShowAIHelper(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isTaskModalOpen, isSettingsModalOpen, isCategoryModalOpen, showDeleteConfirm, showClearCategoriesConfirm, showAIHelper]);


  // --- Helper Functions --- 
  const getPriorityValue = (priority: Priority): number => {
    if (priority === Priority.HIGH) return 3;
    if (priority === Priority.MEDIUM) return 2;
    return 1;
  };

  const getCategoryName = (categoryId?: string): string => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Uncategorized';
  };

  const getCategoryColor = (categoryId?: string): string => {
    return categories.find(cat => cat.id === categoryId)?.color || '#9ca3af'; // gray-400
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No due date';
    try {
      return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };
  
  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0); // Compare dates only
    try {
        return new Date(dueDate + 'T00:00:00') < today;
    } catch {
        return false;
    }
  };

  const openModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    document.body.classList.add('modal-open');
    setter(true);
  };

  const closeModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    document.body.classList.remove('modal-open');
    setter(false);
  };

  // --- Task Handlers --- 
  const handleTaskFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentTaskData.title?.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    const now = new Date().toISOString();
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...currentTaskData, updatedAt: now } as Task : t));
    } else {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        title: currentTaskData.title || 'Untitled Task',
        description: currentTaskData.description || '',
        dueDate: currentTaskData.dueDate,
        priority: currentTaskData.priority || Priority.MEDIUM,
        completed: false,
        categoryId: currentTaskData.categoryId,
        createdAt: now,
        updatedAt: now,
      };
      setTasks([newTask, ...tasks]);
    }
    closeModal(setIsTaskModalOpen);
    setEditingTask(null);
    setCurrentTaskData({});
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setCurrentTaskData(task);
    openModal(setIsTaskModalOpen);
  };

  const toggleComplete = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setShowDeleteConfirm(null);
  };

  // --- Category Handlers ---
  const handleCategoryFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategoryData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentCategoryData.name?.trim()) {
      alert("Category name cannot be empty.");
      return;
    }
    const categoryNameExists = categories.some(cat => cat.name.toLowerCase() === currentCategoryData.name?.toLowerCase() && cat.id !== editingCategory?.id);
    if (categoryNameExists) {
      alert("A category with this name already exists.");
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...editingCategory, ...currentCategoryData } as Category : c));
    } else {
      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        name: currentCategoryData.name || 'Untitled Category',
        color: currentCategoryData.color || '#cccccc',
      };
      setCategories([...categories, newCategory]);
    }
    closeModal(setIsCategoryModalOpen);
    setEditingCategory(null);
    setCurrentCategoryData({ color: '#cccccc' });
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCurrentCategoryData(category);
    openModal(setIsCategoryModalOpen);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Optionally: unassign tasks from this category or reassign to a default
    setTasks(tasks.map(task => task.categoryId === categoryId ? { ...task, categoryId: undefined } : task));
    setCategories(categories.filter(c => c.id !== categoryId));
  };

  const handleClearAllCategories = () => {
    setCategories([]);
    setTasks(tasks.map(task => ({ ...task, categoryId: undefined })));
    setShowClearCategoriesConfirm(false);
  };

  // --- Filtering & Sorting --- 
  const filteredAndSortedTasks = useCallback(() => {
    let tempTasks = [...tasks];

    if (searchTerm) {
      tempTasks = tempTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(task.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      tempTasks = tempTasks.filter(task => filterStatus === 'completed' ? task.completed : !task.completed);
    }

    if (filterPriority !== 'all') {
      tempTasks = tempTasks.filter(task => task.priority === filterPriority);
    }

    if (filterCategory !== 'all') {
      tempTasks = tempTasks.filter(task => task.categoryId === filterCategory);
    }

    tempTasks.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dueDate') {
        comparison = (new Date(a.dueDate || 0).getTime()) - (new Date(b.dueDate || 0).getTime());
        // Handle tasks without due dates - push them to the end for asc, beginning for desc
        if (!a.dueDate && b.dueDate) comparison = sortOrder === 'asc' ? 1 : -1;
        if (a.dueDate && !b.dueDate) comparison = sortOrder === 'asc' ? -1 : 1;
        if (!a.dueDate && !b.dueDate) comparison = 0;
      } else if (sortField === 'priority') {
        comparison = getPriorityValue(b.priority) - getPriorityValue(a.priority); // Higher priority first
      } else if (sortField === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return tempTasks;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, sortField, sortOrder, categories]);

  // --- AI Handler ---
  const handleSendToAI = () => {
    if (!aiPromptText.trim()) {
      setAiError("Please enter a task description for the AI.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    const today = new Date().toISOString().split('T')[0];
    const categoryNames = categories.map(c => c.name).join(', ');

    const engineeredPrompt = `Parse the following natural language task into a structured JSON object. 
    The user input is: "${aiPromptText}".
    Today's date is ${today}.
    Available categories are: [${categoryNames}]. If the user mentions a category that matches one of these, use its exact name. Otherwise, leave categoryName blank or suggest a new one if very obvious.
    Extract the following fields:
    - title: A concise title for the task.
    - description: Any additional details or notes for the task (optional).
    - dueDate: The due date in YYYY-MM-DD format. Interpret relative dates like 'tomorrow', 'next Friday', etc., based on today's date.
    - priority: The task priority (Low, Medium, High). Infer if possible, default to Medium if unsure.
    - categoryName: The name of an existing category if it's mentioned or strongly implied.
    Respond ONLY with a valid JSON object with these keys. If a field cannot be determined, set its value to null or omit the key. Example response: 
    { "title": "Submit report", "description": "Final version of Q3 financial report", "dueDate": "2024-08-16", "priority": "High", "categoryName": "Work" }
    `;

    aiLayerRef.current?.sendToAI(engineeredPrompt);
  };

  useEffect(() => {
    if (aiResult) {
      try {
        const parsed: AIParsedTask = JSON.parse(aiResult);
        const taskToSet: Partial<Task> = {};
        if (parsed.title) taskToSet.title = parsed.title;
        if (parsed.description) taskToSet.description = parsed.description;
        if (parsed.dueDate) taskToSet.dueDate = parsed.dueDate;
        if (parsed.priority) taskToSet.priority = parsed.priority;
        if (parsed.categoryName) {
          const foundCategory = categories.find(c => c.name.toLowerCase() === parsed.categoryName?.toLowerCase());
          if (foundCategory) taskToSet.categoryId = foundCategory.id;
        }
        setCurrentTaskData(prev => ({ ...prev, ...taskToSet }));
        openModal(setIsTaskModalOpen);
        setShowAIHelper(false);
        setAiPromptText(''); // Clear AI input after successful parsing
      } catch (error) {
        console.error("Error parsing AI result:", error);
        setAiError("AI returned an invalid format. Please try rephrasing or enter manually.");
      }
    }
  }, [aiResult, categories]);

  // --- Data Management ---
  const handleClearAllTasks = () => {
    setTasks([]);
    setShowDeleteConfirm(null);
  };

  const downloadTasksCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Due Date', 'Priority', 'Completed', 'Category', 'Created At', 'Updated At'];
    const csvRows = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`, // Escape double quotes
        `"${(task.description || '').replace(/"/g, '""')}"`, 
        task.dueDate || '',
        task.priority,
        task.completed,
        getCategoryName(task.categoryId),
        task.createdAt,
        task.updatedAt
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tasks.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const priorityColors: Record<Priority, string> = {
    [Priority.HIGH]: 'border-red-500 dark:border-red-400',
    [Priority.MEDIUM]: 'border-yellow-500 dark:border-yellow-400',
    [Priority.LOW]: 'border-green-500 dark:border-green-400',
  };

  const priorityTextColors: Record<Priority, string> = {
    [Priority.HIGH]: 'text-red-600 dark:text-red-400',
    [Priority.MEDIUM]: 'text-yellow-600 dark:text-yellow-400',
    [Priority.LOW]: 'text-green-600 dark:text-green-400',
  };

  if (isLoading && !currentUser) {
    return (
      <div className="flex-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="skeleton h-12 w-12 rounded-full"></div>
        <div className="ml-4 space-y-2">
            <div className="skeleton-text h-4 w-32"></div>
            <div className="skeleton-text h-4 w-24"></div>
        </div>
      </div>
    );
  }

  const tasksToDisplay = filteredAndSortedTasks();

  // Dashboard Data
  const tasksByPriorityData = Object.values(Priority).map(p => ({
    name: p,
    count: tasks.filter(t => t.priority === p && !t.completed).length
  }));
  const tasksByStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.completed).length, color: '#4ade80' }, // green-400
    { name: 'Pending', value: tasks.filter(t => !t.completed).length, color: '#facc15' }, // yellow-400
  ];

  return (
    <div id="welcome_fallback" className={`min-h-screen theme-transition-all flex flex-col ${appSettings.darkMode ? 'dark' : ''}`}>
      <AILayer 
        ref={aiLayerRef}
        prompt={aiPromptText} // The prompt passed here is the *engineered* prompt for AI
        onResult={setAiResult}
        onError={setAiError}
        onLoading={setAiIsLoading}
      />

      {/* Header */}
      <header className="bg-primary-600 dark:bg-slate-800 text-white shadow-md p-4 flex-between sticky top-0 z-[var(--z-sticky)]">
        <h1 className="text-xl sm:text-2xl font-bold">TodoMaster AI</h1>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser && <span className="text-sm hidden sm:inline">Hi, {currentUser.first_name}!</span>}
          <button 
            onClick={() => setAppSettings(s => ({...s, darkMode: !s.darkMode}))}
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 theme-transition"
            aria-label={appSettings.darkMode ? "Switch to light mode" : "Switch to dark mode"}
            id="theme_toggle_button"
          >
            {appSettings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => openModal(setIsSettingsModalOpen)}
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 theme-transition"
            aria-label="Open settings"
            id="settings_button"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={logout}
            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
            aria-label="Logout"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide py-6 px-4 theme-transition-bg bg-slate-50 dark:bg-slate-900">
        {/* Add Task & AI Helper Section */}
        <div className="card card-responsive mb-6 theme-transition-all">
          <div className="flex-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Add New Task</h2>
            <button 
              onClick={() => setShowAIHelper(s => !s)}
              className="btn btn-sm bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-1"
              id="ai_helper_toggle"
            >
              <BrainCircuit size={16} /> AI Helper {showAIHelper ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
          </div>
          {showAIHelper && (
            <div className="mb-4 p-4 border border-indigo-300 dark:border-indigo-700 rounded-md bg-indigo-50 dark:bg-indigo-900/30 theme-transition">
              <label htmlFor="aiPromptText" className="form-label text-indigo-700 dark:text-indigo-300">Describe your task for AI processing:</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="text"
                  id="aiPromptText"
                  name="aiPromptText"
                  className="input input-responsive flex-grow"
                  placeholder="e.g., 'Schedule dentist appointment for next Tuesday afternoon'"
                  value={aiPromptText}
                  onChange={(e) => setAiPromptText(e.target.value)}
                  aria-label="AI task input"
                />
                <button 
                  onClick={handleSendToAI}
                  className="btn btn-primary btn-responsive flex items-center gap-1" 
                  disabled={aiIsLoading}
                  id="send_to_ai_button"
                >
                  {aiIsLoading ? <RotateCcw size={16} className="animate-spin"/> : <BrainCircuit size={16} />} Process
                </button>
              </div>
              {aiError && <p className="form-error mt-1">{typeof aiError === 'string' ? aiError : 'An error occurred with AI processing.'}</p>}
            </div>
          )}
          <button
            onClick={() => { setEditingTask(null); setCurrentTaskData({priority: Priority.MEDIUM}); openModal(setIsTaskModalOpen); }}
            className="btn btn-primary btn-responsive w-full sm:w-auto flex items-center justify-center gap-2"
            id="generation_issue_fallback"
          >
            <Plus size={18} /> Add Task Manually
          </button>
        </div>

        {/* Filters and Sort Section */}
        <div className="card card-responsive mb-6 theme-transition-all">
          <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-slate-200">Filter & Sort Tasks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="searchTerm" className="form-label">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="searchTerm"
                  className="input input-responsive pr-10"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search tasks"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
              </div>
            </div>
            <div>
              <label htmlFor="filterStatus" className="form-label">Status</label>
              <select id="filterStatus" name="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} className="input input-responsive" aria-label="Filter by status">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterPriority" className="form-label">Priority</label>
              <select id="filterPriority" name="filterPriority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')} className="input input-responsive" aria-label="Filter by priority">
                <option value="all">All Priorities</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterCategory" className="form-label">Category</label>
              <select id="filterCategory" name="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input input-responsive" aria-label="Filter by category">
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex gap-2">
                <select 
                  id="sortField" 
                  name="sortField" 
                  value={sortField} 
                  onChange={(e) => setSortField(e.target.value as SortField)} 
                  className="input input-responsive flex-grow"
                  aria-label="Sort by field"
                >
                  <option value="createdAt">Date Added</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 p-2.5 theme-transition"
                  aria-label={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  <ArrowDownUp size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section Toggle */}
        {tasks.length > 0 && (
          <div className="mb-4 flex justify-end">
            <button 
              onClick={() => setAppSettings(s => ({...s, showDashboard: !s.showDashboard}))}
              className="btn btn-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1 theme-transition"
              id="toggle_dashboard_button"
            >
             {appSettings.showDashboard ? 'Hide' : 'Show'} Dashboard {appSettings.showDashboard ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
          </div>
        )}

        {/* Dashboard Section */}
        {appSettings.showDashboard && tasks.length > 0 && (
            <div className="card card-responsive mb-6 theme-transition-all" id="dashboard_section">
                <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-slate-200">Task Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={styles.chartContainer}>
                        <h4 className="text-md font-medium mb-2 text-center text-gray-600 dark:text-slate-300">Pending Tasks by Priority</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tasksByPriorityData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                                <XAxis dataKey="name" tick={{ fill: appSettings.darkMode ? '#cbd5e1' : '#4b5563' }} />
                                <YAxis allowDecimals={false} tick={{ fill: appSettings.darkMode ? '#cbd5e1' : '#4b5563' }} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: appSettings.darkMode ? '#1e293b' : '#ffffff', border: '1px solid #334155' }} 
                                  labelStyle={{ color: appSettings.darkMode ? '#e2e8f0' : '#1f2937' }}
                                />
                                <Legend wrapperStyle={{ color: appSettings.darkMode ? '#e2e8f0' : '#1f2937' }} />
                                <Bar dataKey="count" name="Tasks" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartContainer}>
                        <h4 className="text-md font-medium mb-2 text-center text-gray-600 dark:text-slate-300">Tasks by Status</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie data={tasksByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {tasksByStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ backgroundColor: appSettings.darkMode ? '#1e293b' : '#ffffff', border: '1px solid #334155' }} 
                                  labelStyle={{ color: appSettings.darkMode ? '#e2e8f0' : '#1f2937' }}
                                />
                                <Legend wrapperStyle={{ color: appSettings.darkMode ? '#e2e8f0' : '#1f2937' }} />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}

        {/* Task List */}
        <div className="theme-transition-all" id="task_list_container">
          {tasksToDisplay.length === 0 && !isLoading && (
            <div className="card card-responsive text-center py-10 theme-transition-all">
              <Archive size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-slate-300">No tasks found.</h3>
              <p className="text-gray-500 dark:text-slate-400 mt-2">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' 
                  ? "Try adjusting your filters or search term."
                  : "Get started by adding a new task!"}
              </p>
            </div>
          )}
          {tasksToDisplay.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasksToDisplay.map(task => (
                <div 
                  key={task.id} 
                  id={`task_item_${task.id}`}
                  className={`card card-responsive theme-transition-all relative overflow-hidden border-l-4 ${priorityColors[task.priority]} ${task.completed ? 'opacity-60 dark:opacity-50 bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}
                >
                  {task.completed && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full transform rotate-12">
                      DONE
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-semibold theme-transition-text ${task.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-800 dark:text-slate-100'}`}>{task.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityTextColors[task.priority]} bg-opacity-10 ${task.priority === Priority.HIGH ? 'bg-red-100 dark:bg-red-900/30' : task.priority === Priority.MEDIUM ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                        {task.priority}
                    </span>
                  </div>
                  {task.description && <p className={`text-sm text-gray-600 dark:text-slate-300 mb-3 whitespace-pre-wrap ${styles.taskDescription}`}>{task.description}</p>}
                  
                  <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1 mb-4">
                    {task.dueDate && (
                        <div className={`flex items-center gap-1.5 ${isOverdue(task.dueDate) && !task.completed ? 'text-red-500 font-medium' : ''}`}>
                            <CalendarDays size={14} /> 
                            <span>{formatDate(task.dueDate)} {isOverdue(task.dueDate) && !task.completed && '(Overdue)'}</span>
                        </div>
                    )}
                    {task.categoryId && (
                        <div className="flex items-center gap-1.5">
                            <Tag size={14} style={{ color: getCategoryColor(task.categoryId) }} /> 
                            <span style={{ color: getCategoryColor(task.categoryId) }}>{getCategoryName(task.categoryId)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                         <AlignLeft size={14} /><span>Added: {formatDate(task.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                    <button 
                      onClick={() => toggleComplete(task.id)}
                      className={`btn btn-sm flex items-center gap-1.5 ${task.completed ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                      aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {task.completed ? <Square size={16}/> : <CheckSquare size={16}/>} {task.completed ? 'Pending' : 'Done'}
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => openEditTaskModal(task)}
                            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white p-2"
                            aria-label="Edit task"
                        >
                            <Edit3 size={16}/>
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(task.id)}
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white p-2"
                            aria-label="Delete task"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-slate-100 dark:bg-slate-800 text-sm text-gray-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="modal-backdrop theme-transition-all" onClick={() => closeModal(setIsTaskModalOpen)} role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
          <div className="modal-content theme-transition-all w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="task-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button onClick={() => closeModal(setIsTaskModalOpen)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1" aria-label="Close modal"><X size={24}/></button>
            </div>
            <form onSubmit={handleTaskSubmit} ref={taskFormRef} className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title <span className="text-red-500">*</span></label>
                <input type="text" id="title" name="title" value={currentTaskData.title || ''} onChange={handleTaskFormChange} className="input" required aria-required="true" />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea id="description" name="description" value={currentTaskData.description || ''} onChange={handleTaskFormChange} className="input" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input type="date" id="dueDate" name="dueDate" value={currentTaskData.dueDate || ''} onChange={handleTaskFormChange} className="input" />
                </div>
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select id="priority" name="priority" value={currentTaskData.priority || Priority.MEDIUM} onChange={handleTaskFormChange} className="input">
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="categoryId" className="form-label">Category</label>
                <select id="categoryId" name="categoryId" value={currentTaskData.categoryId || ''} onChange={handleTaskFormChange} className="input">
                  <option value="">Uncategorized</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => closeModal(setIsTaskModalOpen)} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 theme-transition">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Save Changes' : 'Add Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="modal-backdrop theme-transition-all" onClick={() => closeModal(setIsSettingsModalOpen)} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
          <div className="modal-content theme-transition-all w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="settings-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">Settings</h3>
              <button onClick={() => closeModal(setIsSettingsModalOpen)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1" aria-label="Close settings modal"><X size={24}/></button>
            </div>
            <div className="mt-4 space-y-6">
                {/* General Settings */}
                <section id="settings_general_section">
                    <h4 className="text-lg font-medium mb-2 text-gray-700 dark:text-slate-200">General</h4>
                    <div className="form-group">
                        <label htmlFor="defaultView" className="form-label">Default Task View</label>
                        <select 
                            id="defaultView" 
                            name="defaultView" 
                            value={appSettings.defaultView} 
                            onChange={(e) => setAppSettings(s => ({...s, defaultView: e.target.value as FilterStatus}))} 
                            className="input"
                        >
                            <option value="all">All Tasks</option>
                            <option value="pending">Pending Tasks</option>
                            <option value="completed">Completed Tasks</option>
                        </select>
                    </div>
                </section>

                {/* Category Management */}
                <section id="settings_category_management_section">
                    <div className="flex-between mb-2">
                        <h4 className="text-lg font-medium text-gray-700 dark:text-slate-200">Manage Categories</h4>
                        <button onClick={() => { setEditingCategory(null); setCurrentCategoryData({name: '', color: '#cccccc'}); openModal(setIsCategoryModalOpen); }} className="btn btn-sm btn-primary flex items-center gap-1" id="add_category_button"><Plus size={16}/> Add Category</button>
                    </div>
                    {categories.length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-400">No categories defined yet.</p>
                    ) : (
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {categories.map(cat => (
                            <li key={cat.id} id={`category_list_item_${cat.id}`} className="flex-between p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 theme-transition">
                                <div className="flex items-center gap-2">
                                    <span style={{ backgroundColor: cat.color }} className="w-4 h-4 rounded-full inline-block"></span>
                                    <span className="text-gray-700 dark:text-slate-200">{cat.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditCategoryModal(cat)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit category ${cat.name}`}><Edit3 size={16}/></button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete category ${cat.name}`}><Trash2 size={16}/></button>
                                </div>
                            </li>
                        ))}
                        </ul>
                    )}
                     {categories.length > 0 && (
                        <button 
                            onClick={() => setShowClearCategoriesConfirm(true)} 
                            className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/50 mt-3 flex items-center gap-1"
                        >
                            <Trash2 size={16}/> Clear All Categories
                        </button>
                    )}
                </section>

                {/* Data Management */}
                <section id="settings_data_management_section">
                    <h4 className="text-lg font-medium mb-2 text-gray-700 dark:text-slate-200">Data Management</h4>
                    <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-3">
                        <button onClick={downloadTasksCSV} className="btn btn-secondary btn-responsive w-full sm:w-auto flex items-center justify-center gap-1" id="download_tasks_button"><Download size={16}/> Download Tasks (CSV)</button>
                        <button onClick={() => setShowDeleteConfirm('all-tasks')} className="btn bg-red-500 hover:bg-red-600 text-white btn-responsive w-full sm:w-auto flex items-center justify-center gap-1" id="clear_all_tasks_button"><AlertTriangle size={16}/> Clear All Tasks</button>
                    </div>
                </section>
            </div>
            <div className="modal-footer mt-6">
              <button type="button" onClick={() => closeModal(setIsSettingsModalOpen)} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 theme-transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-backdrop theme-transition-all" onClick={() => closeModal(setIsCategoryModalOpen)} role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
            <div className="modal-content theme-transition-all w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 id="category-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                    <button onClick={() => closeModal(setIsCategoryModalOpen)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1" aria-label="Close category modal"><X size={24}/></button>
                </div>
                <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
                    <div className="form-group">
                        <label htmlFor="categoryName" className="form-label">Category Name <span className="text-red-500">*</span></label>
                        <input type="text" id="categoryName" name="name" value={currentCategoryData.name || ''} onChange={handleCategoryFormChange} className="input" required aria-required="true" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryColor" className="form-label">Category Color</label>
                        <input type="color" id="categoryColor" name="color" value={currentCategoryData.color || '#cccccc'} onChange={handleCategoryFormChange} className={`input h-10 ${styles.colorInput}`} />
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={() => closeModal(setIsCategoryModalOpen)} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 theme-transition">Cancel</button>
                        <button type="submit" className="btn btn-primary">{editingCategory ? 'Save Changes' : 'Add Category'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop theme-transition-all" onClick={() => setShowDeleteConfirm(null)} role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title">
          <div className="modal-content theme-transition-all w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4"/>
              <h3 id="delete-confirm-title" className="text-lg font-medium text-gray-900 dark:text-slate-100">Are you sure?</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                {showDeleteConfirm === 'all-tasks' 
                  ? "This will permanently delete all your tasks. This action cannot be undone."
                  : "This will permanently delete the selected task. This action cannot be undone."}
              </p>
            </div>
            <div className="modal-footer mt-6">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 theme-transition">Cancel</button>
              <button 
                onClick={() => showDeleteConfirm === 'all-tasks' ? handleClearAllTasks() : handleDeleteTask(showDeleteConfirm)}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Categories Confirmation Modal */}
      {showClearCategoriesConfirm && (
        <div className="modal-backdrop theme-transition-all" onClick={() => setShowClearCategoriesConfirm(false)} role="alertdialog" aria-modal="true" aria-labelledby="clear-categories-confirm-title">
          <div className="modal-content theme-transition-all w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4"/>
              <h3 id="clear-categories-confirm-title" className="text-lg font-medium text-gray-900 dark:text-slate-100">Clear All Categories?</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                This will remove all categories and tasks will become uncategorized. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer mt-6">
              <button onClick={() => setShowClearCategoriesConfirm(false)} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 theme-transition">Cancel</button>
              <button 
                onClick={handleClearAllCategories}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Clear Categories
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
