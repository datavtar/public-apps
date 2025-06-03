import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { format, parseISO, isValid, addDays, parse } from 'date-fns';
import { Plus, Edit3, Trash2, CheckCircle, Circle, Search, Filter, ArrowDownUp, Sun, Moon, Settings, LogOut, User, ListChecks, Brain, FileDown, X, ChevronDown, ChevronUp, CalendarDays, Tag, AlertTriangle, Info, Check, ArrowUp, ArrowDown, Trash } from 'lucide-react';

import styles from './styles/styles.module.css';

// --- Type Definitions ---
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  category: string; // Category ID
  createdAt: string;
  updatedAt: string;
}

enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

interface Category {
  id: string;
  name: string;
}

type FilterStatus = 'all' | 'active' | 'completed';
interface Filters {
  status: FilterStatus;
  priority: Priority | 'all';
  category: string | 'all'; // Category ID or 'all'
}

type SortKey = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'text';
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

interface AIParseResult {
  taskText?: string;
  dueDate?: string; // Expect YYYY-MM-DD
  priority?: Priority;
  categoryName?: string; // Name of the category, not ID
}

// --- Constants ---
const LOCAL_STORAGE_KEY_TASKS = 'todoApp.tasks';
const LOCAL_STORAGE_KEY_CATEGORIES = 'todoApp.categories';
const LOCAL_STORAGE_KEY_THEME = 'todoApp.theme';
const LOCAL_STORAGE_KEY_FILTERS = 'todoApp.filters';
const LOCAL_STORAGE_KEY_SORT = 'todoApp.sort';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Personal' },
  { id: 'cat-2', name: 'Work' },
  { id: 'cat-3', name: 'Shopping' },
];

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // --- State Variables ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({ status: 'all', priority: 'all', category: 'all' });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState<Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>>({});

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const [aiPromptText, setAiPromptText] = useState<string>(''); // For smart add input
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --- Effects ---
  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as 'light' | 'dark' | null;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setCurrentTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const storedTasksJSON = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    if (storedTasksJSON) {
        try {
            const parsedTasks = JSON.parse(storedTasksJSON);
            setTasks(Array.isArray(parsedTasks) ? parsedTasks : []);
        } catch (e) {
            console.error('Error parsing tasks from localStorage:', e);
            setTasks([]); // Fallback to empty array on error
        }
    } else {
        setTasks([]); // Initialize if nothing in storage
    }

    const storedCategoriesJSON = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
    if (storedCategoriesJSON) {
        try {
            const parsedCategories = JSON.parse(storedCategoriesJSON);
            setCategories(Array.isArray(parsedCategories) ? parsedCategories : DEFAULT_CATEGORIES);
        } catch (e) {
            console.error('Error parsing categories from localStorage:', e);
            setCategories(DEFAULT_CATEGORIES); // Fallback to default on error
        }
    } else {
        setCategories(DEFAULT_CATEGORIES); // If nothing in storage, use default
    }

    const storedFilters = localStorage.getItem(LOCAL_STORAGE_KEY_FILTERS);
    if (storedFilters) {
        try {
            const parsedFilters = JSON.parse(storedFilters);
            setFilters(parsedFilters || { status: 'all', priority: 'all', category: 'all' });
        } catch (e) {
            console.error('Error parsing filters from localStorage:', e);
            setFilters({ status: 'all', priority: 'all', category: 'all' });
        }
    }

    const storedSort = localStorage.getItem(LOCAL_STORAGE_KEY_SORT);
    if (storedSort) {
        try {
            const parsedSort = JSON.parse(storedSort);
            setSortConfig(parsedSort || { key: 'createdAt', direction: 'desc' });
        } catch (e) {
            console.error('Error parsing sort config from localStorage:', e);
            setSortConfig({ key: 'createdAt', direction: 'desc' });
        }
    }

  }, []);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_FILTERS, JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_SORT, JSON.stringify(sortConfig)); }, [sortConfig]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isAddTaskModalOpen) closeModal('add');
        if (isEditTaskModalOpen) closeModal('edit');
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (showUserDropdown) setShowUserDropdown(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isAddTaskModalOpen, isEditTaskModalOpen, isSettingsOpen, showUserDropdown]);

  useEffect(() => {
    if(toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Helper Functions ---
  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const formatDate = (dateString: string | null) => dateString ? format(parseISO(dateString), 'MMM dd, yyyy') : 'No due date';
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // --- Task Management Functions ---
  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (type: 'add' | 'edit', task?: Task) => {
    if (type === 'add') {
      setTaskFormData({ text: '', priority: Priority.MEDIUM, dueDate: null, category: categories[0]?.id || '', completed: false });
      setIsAddTaskModalOpen(true);
    } else if (type === 'edit' && task) {
      setEditingTask(task);
      setTaskFormData({ 
        text: task.text,
        priority: task.priority,
        dueDate: task.dueDate,
        category: task.category,
        completed: task.completed
      });
      setIsEditTaskModalOpen(true);
    }
    document.body.classList.add('modal-open');
  };

  const closeModal = (type: 'add' | 'edit') => {
    if (type === 'add') setIsAddTaskModalOpen(false);
    if (type === 'edit') {
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
    }
    setTaskFormData({});
    setAiResult(null); // Clear AI result when closing modal
    document.body.classList.remove('modal-open');
  };

  const handleSaveTask = () => {
    if (!taskFormData.text?.trim()) {
      showToast('Task text cannot be empty.', 'error');
      return;
    }

    const now = new Date().toISOString();
    if (editingTask) { // Editing existing task
      setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? { 
        ...editingTask, 
        ...taskFormData,
        text: taskFormData.text!, 
        priority: taskFormData.priority!,
        dueDate: taskFormData.dueDate || null,
        category: taskFormData.category!,
        updatedAt: now 
      } : t));
      showToast('Task updated successfully!', 'success');
      closeModal('edit');
    } else { // Adding new task
      const newTask: Task = {
        id: generateId(),
        text: taskFormData.text!,
        completed: false,
        priority: taskFormData.priority || Priority.MEDIUM,
        dueDate: taskFormData.dueDate || null,
        category: taskFormData.category || (categories[0]?.id ?? ''),
        createdAt: now,
        updatedAt: now,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      showToast('Task added successfully!', 'success');
      closeModal('add');
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task));
    showToast('Task status updated!', 'info');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    showToast('Task deleted!', 'success');
  };

  // --- Category Management Functions ---
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      showToast('Category name cannot be empty.', 'error');
      return;
    }
    if (categories.find(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())){
      showToast('Category already exists.', 'error');
      return;
    }
    const newCat = { id: generateId(), name: newCategoryName.trim() };
    setCategories(prevCategories => [...prevCategories, newCat]);
    setNewCategoryName('');
    showToast('Category added!', 'success');
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
    const defaultCategoryId = (categories.find(c => c.id !== categoryId)?.id) || ''; 
    setTasks(prevTasks => prevTasks.map(task => task.category === categoryId ? { ...task, category: defaultCategoryId } : task));
    showToast('Category deleted!', 'success');
  };

  // --- Search, Filter, Sort Functions ---
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]; // Create a new array to avoid mutating state directly if tasks were not guaranteed to be new

    // Search
    if (searchTerm.trim()) {
      result = result.filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter
    if (filters.status !== 'all') {
      result = result.filter(task => filters.status === 'completed' ? task.completed : !task.completed);
    }
    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }
    if (filters.category !== 'all') {
      result = result.filter(task => task.category === filters.category);
    }

    // Sort
    result.sort((a, b) => { // Sort in place is fine for the 'result' local variable
      let valA: any, valB: any;
      switch (sortConfig.key) {
        case 'dueDate':
          valA = a.dueDate ? parseISO(a.dueDate).getTime() : Infinity;
          valB = b.dueDate ? parseISO(b.dueDate).getTime() : Infinity;
          break;
        case 'priority':
          const priorityOrder = { [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
          valA = priorityOrder[a.priority];
          valB = priorityOrder[b.priority];
          break;
        case 'createdAt':
        case 'updatedAt':
          valA = parseISO(a[sortConfig.key]!).getTime();
          valB = parseISO(b[sortConfig.key]!).getTime();
          break;
        default: // text
          valA = a.text.toLowerCase();
          valB = b.text.toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, searchTerm, filters, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // --- Theme Toggle Function ---
  const toggleTheme = () => setCurrentTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // --- Settings Page Functions ---
  const handleDownloadData = () => {
    const csvHeader = "ID,Text,Completed,Priority,DueDate,Category,CreatedAt,UpdatedAt\n";
    const csvRows = tasks.map(task => 
      `"${task.id}","${task.text.replace(/"/g, '""')}",${task.completed},${task.priority},${task.dueDate || ''},"${categories.find(c=>c.id === task.category)?.name || 'N/A'}",${task.createdAt},${task.updatedAt}`
    ).join("\n");
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tasks.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Tasks downloaded as CSV!', 'success');
    }
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL tasks and categories? This action cannot be undone.')) {
      setTasks([]);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.removeItem(LOCAL_STORAGE_KEY_TASKS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_CATEGORIES);
      showToast('All data deleted!', 'success');
    }
  };

  // --- AI Functions ---
  const handleSmartAddTask = () => {
    if (!aiPromptText.trim()) {
      showToast('Please enter a task description for Smart Add.', 'error');
      return;
    }
    const promptForAI = JSON.stringify({
      instruction: "Analyze the user input to extract task details. Identify the main task description, a due date (if present, in YYYY-MM-DD format, considering 'today', 'tomorrow', 'next Monday' relative to current date: " + format(new Date(), 'yyyy-MM-dd') + "), a priority (Low, Medium, High), and a category name (e.g., Work, Personal, Shopping).",
      userInput: aiPromptText,
      responseFormat: {
        taskText: "string (e.g., 'Buy groceries')",
        dueDate: "YYYY-MM-DD | null (e.g., '2024-07-20')",
        priority: "Low | Medium | High | null (e.g., 'Medium')",
        categoryName: "string | null (e.g., 'Shopping')"
      }
    });

    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(promptForAI);
  };

  useEffect(() => {
    if (aiResult) {
      try {
        const parsedResult: AIParseResult = JSON.parse(aiResult);
        const newFormData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = {};
        if (parsedResult.taskText) newFormData.text = parsedResult.taskText;
        if (parsedResult.dueDate) {
          let finalDueDate = parsedResult.dueDate;
          if (parsedResult.dueDate.toLowerCase() === 'today') {
            finalDueDate = format(new Date(), 'yyyy-MM-dd');
          } else if (parsedResult.dueDate.toLowerCase() === 'tomorrow') {
            finalDueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
          } else {
            try {
              const parsedDate = parse(parsedResult.dueDate, 'yyyy-MM-dd', new Date());
              if (isValid(parsedDate)) {
                finalDueDate = format(parsedDate, 'yyyy-MM-dd');
              } else { 
                const commonParsedDate = parseISO(parsedResult.dueDate); 
                if(isValid(commonParsedDate)) finalDueDate = format(commonParsedDate, 'yyyy-MM-dd');
                else finalDueDate = parsedResult.dueDate; 
              }
            } catch (e) { finalDueDate = parsedResult.dueDate; }
          }
          newFormData.dueDate = finalDueDate;
        }
        if (parsedResult.priority) newFormData.priority = parsedResult.priority;
        if (parsedResult.categoryName) {
          const existingCategory = categories.find(cat => cat.name.toLowerCase() === parsedResult.categoryName?.toLowerCase());
          if (existingCategory) {
            newFormData.category = existingCategory.id;
          } else {
            const newCatId = generateId();
            setCategories(prev => [...prev, {id: newCatId, name: parsedResult.categoryName!}]);
            newFormData.category = newCatId;
            showToast(`New category '${parsedResult.categoryName}' created.`, 'info');
          }
        } else {
          newFormData.category = categories[0]?.id || '';
        }

        setTaskFormData(current => ({...current, ...newFormData}));
        if (!isAddTaskModalOpen) openModal('add');
        setAiPromptText(''); 
        showToast('Task details populated by AI. Review and save.', 'info');
      } catch (error) {
        console.error('Error parsing AI result:', error);
        setAiError('Failed to parse AI suggestion. Please try again or enter manually.');
        showToast('Error processing AI suggestion.', 'error');
      }
    }
  }, [aiResult, categories, isAddTaskModalOpen]); // Added categories and isAddTaskModalOpen to dependency array for correctness, openModal, showToast, generateId could also be deps if not stable. For simplicity, assuming they are stable or useCallback is used. Adding only obvious ones for now.

  const renderPriorityBadge = (priority: Priority) => {
    let colorClasses = '';
    switch (priority) {
      case Priority.HIGH: colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'; break;
      case Priority.MEDIUM: colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'; break;
      case Priority.LOW: colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'; break;
    }
    return <span className={`badge ${colorClasses} text-xs`}>{priority}</span>;
  };

  const getCategoryName = (categoryId: string): string => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Uncategorized';
  };

  const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 inline ml-1" /> : <ArrowDown className="w-4 h-4 inline ml-1" />;
    }
    return <ArrowDownUp className="w-4 h-4 inline ml-1 opacity-50" />;
  };

  // --- JSX Structure ---
  return (
    <div id="welcome_fallback" className={`min-h-screen flex flex-col theme-transition-all ${currentTheme === 'dark' ? 'dark' : ''} bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200`}>
      {/* AI Layer Component (Headless) */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText} 
        onResult={setAiResult}
        onError={setAiError}
        onLoading={setAiIsLoading}
      />
      <div id="generation_issue_fallback" className="hidden"></div>

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-[var(--z-popover)] text-white ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} flex items-center gap-2 theme-transition`}
          role="alert"
        >
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-lg font-semibold">&times;</button>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary-600 dark:bg-slate-800 text-white p-4 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-wide mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ListChecks className="w-8 h-8" />
            <h1 className="text-2xl font-bold">AI To-Do Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              id="theme-toggle-switch"
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 theme-transition" 
              aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {currentTheme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            {currentUser && (
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)} 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-primary-700 dark:hover:bg-slate-700 theme-transition"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden md:inline">{currentUser.first_name || currentUser.username}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-[var(--z-dropdown)] theme-transition-all">
                    <button 
                      id="settings-navigation-link"
                      onClick={() => { setIsSettingsOpen(true); setShowUserDropdown(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2 theme-transition"
                    >
                      <Settings className="w-4 h-4"/> Settings
                    </button>
                    <button 
                      onClick={() => { logout(); setShowUserDropdown(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2 theme-transition"
                    >
                      <LogOut className="w-4 h-4"/> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container-wide mx-auto p-4 md:p-6 flex-grow">
        {isSettingsOpen ? (
          // --- Settings Page ---
          <div className="card card-responsive fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            {/* Theme Setting (already in header, but good for context) */}
            <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Theme</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm">Light</span>
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        <span className={`theme-toggle-thumb ${currentTheme === 'dark' ? 'translate-x-full' : ''}`}></span>
                    </button>
                    <span className="text-sm">Dark</span>
                </div>
            </div>

            {/* Category Management */}
            <div id="category-management-section" className="mb-6">
              <h3 className="text-lg font-medium mb-2">Manage Categories</h3>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="New category name" 
                  className="input input-responsive flex-grow"
                />
                <button onClick={handleAddCategory} className="btn btn-primary btn-responsive flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
              </div>
              <ul className="space-y-1 max-h-40 overflow-y-auto pr-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                    <span>{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Management */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Data Management</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <button id="download-data-button" onClick={handleDownloadData} className="btn btn-secondary btn-responsive flex items-center justify-center gap-1"><FileDown className="w-4 h-4"/> Download Tasks (CSV)</button>
                <button onClick={handleDeleteAllData} className="btn bg-red-600 hover:bg-red-700 text-white btn-responsive flex items-center justify-center gap-1"><Trash className="w-4 h-4"/> Delete All Data</button>
              </div>
            </div>
          </div>
        ) : (
          // --- Main Task View ---
          <div className="space-y-6">
            {/* Smart Add Task Section */}
            <div className="card card-responsive">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><Brain className="w-6 h-6 text-primary-500"/> Smart Add Task</h2>
              <div className="flex flex-col sm:flex-row gap-2 items-start">
                <input 
                  id="smart-add-task-input"
                  type="text" 
                  value={aiPromptText} 
                  onChange={(e) => setAiPromptText(e.target.value)} 
                  placeholder="e.g., Buy milk tomorrow high priority #shopping" 
                  className="input input-responsive flex-grow"
                  aria-label="Smart add task input"
                  onKeyDown={(e) => e.key === 'Enter' && handleSmartAddTask()}
                />
                <button onClick={handleSmartAddTask} className="btn btn-primary btn-responsive w-full sm:w-auto flex items-center justify-center gap-1" disabled={aiIsLoading}>
                  {aiIsLoading ? 'Processing...' : <><Plus className="w-4 h-4"/> Add with AI</>}
                </button>
              </div>
              {aiError && <p className="form-error mt-2">AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Try typing a task with due date (like 'tomorrow', 'next Friday', 'Aug 15'), priority (low, medium, high), and category (e.g. #work). AI will try to parse it!</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-semibold">Your Tasks</h2>
                <button id="add-task-modal-button" onClick={() => openModal('add')} className="btn btn-primary btn-responsive w-full md:w-auto flex items-center justify-center gap-1">
                    <Plus className="w-5 h-5" /> Add New Task Manually
                </button>
            </div>

            {/* Filter and Sort Controls */}
            <div className="card card-responsive">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="search-task" className="form-label">Search Tasks</label>
                        <div className="relative">
                            <input 
                                id="search-task"
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="input input-responsive pl-10"
                            />
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="filter-status" className="form-label">Filter by Status</label>
                        <select id="filter-status" name="status" value={filters.status} onChange={(e) => setFilters(f => ({...f, status: e.target.value as FilterStatus}))} className="input input-responsive">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filter-priority" className="form-label">Filter by Priority</label>
                        <select id="filter-priority-dropdown" name="priority" value={filters.priority} onChange={(e) => setFilters(f => ({...f, priority: e.target.value as Priority | 'all'}))} className="input input-responsive">
                            <option value="all">All Priorities</option>
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filter-category" className="form-label">Filter by Category</label>
                        <select id="filter-category" name="category" value={filters.category} onChange={(e) => setFilters(f => ({...f, category: e.target.value}))} className="input input-responsive">
                            <option value="all">All Categories</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Task List Section */}
            <div id="task-list-section" className="card card-responsive">
                {filteredAndSortedTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead className="table-header">
                        <tr>
                          <th className="p-3 text-left w-12">Status</th>
                          <th className="p-3 text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => handleSort('text')}>Task <SortIndicator columnKey='text' /></th>
                          <th className="p-3 text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 hidden md:table-cell" onClick={() => handleSort('priority')}>Priority <SortIndicator columnKey='priority' /></th>
                          <th className="p-3 text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 hidden sm:table-cell" onClick={() => handleSort('dueDate')}>Due Date <SortIndicator columnKey='dueDate' /></th>
                          <th className="p-3 text-left hidden lg:table-cell">Category</th>
                          <th className="p-3 text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 hidden md:table-cell" onClick={() => handleSort('createdAt')}>Created <SortIndicator columnKey='createdAt'/></th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedTasks.map(task => (
                          <tr key={task.id} className={`border-b dark:border-slate-700 ${task.completed ? 'bg-slate-50 dark:bg-slate-800 opacity-70' : 'bg-white dark:bg-slate-800/50'} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-150`}>
                            <td className="p-3">
                              <button onClick={() => handleToggleComplete(task.id)} className={`p-1 rounded-full ${task.completed ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`} aria-label={task.completed ? 'Mark as active' : 'Mark as completed'}>
                                {task.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                              </button>
                            </td>
                            <td className={`p-3 ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>{task.text}</td>
                            <td className="p-3 hidden md:table-cell">{renderPriorityBadge(task.priority)}</td>
                            <td className="p-3 hidden sm:table-cell">{task.dueDate ? formatDate(task.dueDate) : 'N/A'}</td>
                            <td className="p-3 hidden lg:table-cell">
                                <span className="badge badge-info text-xs">{getCategoryName(task.category)}</span>
                            </td>
                            <td className="p-3 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400">{formatDate(task.createdAt)}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <button onClick={() => openModal('edit', task)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label="Edit task"><Edit3 className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label="Delete task"><Trash2 className="w-5 h-5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">No tasks found. Try adjusting your filters or add a new task!</p>
                )}
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Task Modal */}
      {(isAddTaskModalOpen || isEditTaskModalOpen) && (
        <div className="modal-backdrop theme-transition-all" onClick={() => closeModal(isAddTaskModalOpen ? 'add' : 'edit')}>
          <div className="modal-content w-full max-w-lg theme-transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-semibold">{isAddTaskModalOpen ? 'Add New Task' : 'Edit Task'}</h3>
              <button onClick={() => closeModal(isAddTaskModalOpen ? 'add' : 'edit')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full" aria-label="Close modal">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="taskText" className="form-label">Task Description</label>
                <textarea id="taskText" name="text" value={taskFormData.text || ''} onChange={handleTaskFormChange} className="input input-responsive h-24" placeholder="What needs to be done?" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select id="priority" name="priority" value={taskFormData.priority || Priority.MEDIUM} onChange={handleTaskFormChange} className="input input-responsive">
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input id="dueDate" type="date" name="dueDate" value={taskFormData.dueDate || ''} onChange={handleTaskFormChange} className="input input-responsive" />
                </div>
              </div>
              <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select id="category" name="category" value={taskFormData.category || ''} onChange={handleTaskFormChange} className="input input-responsive">
                    {categories.length === 0 && <option value="" disabled>No categories available. Add one in Settings.</option>}
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => closeModal(isAddTaskModalOpen ? 'add' : 'edit')} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
              <button onClick={handleSaveTask} className="btn btn-primary">{isAddTaskModalOpen ? 'Add Task' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center p-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
