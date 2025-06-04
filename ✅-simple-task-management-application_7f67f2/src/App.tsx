import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
    Plus, Edit3, Trash2, CheckCircle2, Circle, CalendarDays, BarChartBig, Settings2, Filter as FilterIcon, 
    Sun, Moon, LogOut, ChevronDown, ChevronUp, UploadCloud, DownloadCloud, ListChecks, FileText, 
    Brain, Search as SearchIcon, RotateCcw, Palette, XCircle, Info, AlertTriangle, Square, CheckSquare, Tag, MoreVertical, Package, Home, Briefcase, BookOpen, Users, ListFilter, Eye, EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell as RechartsCell, LineChart, Line } from 'recharts';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, isValid, getDay, addDays, startOfWeek,differenceInDays } from 'date-fns';

// Types and Interfaces
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  category: string; // Category ID
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

interface Category {
  id: string;
  name: string;
  color: string; // Hex color
}

interface AISubTaskSuggestion {
  title: string;
  priority?: 'Low' | 'Medium' | 'High';
}

type View = 'tasks' | 'calendar' | 'analytics' | 'settings';
type FilterStatus = 'all' | 'active' | 'completed';
type SortKey = 'dueDate' | 'priority' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

interface ModalState {
  type: 'addTask' | 'editTask' | 'addCategory' | 'editCategory' | 'confirmDelete' | 'viewTask' | 'aiSubtasks' | null;
  data?: any;
}

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const APP_VERSION = '1.0.0';
const LOCAL_STORAGE_TASKS_KEY = 'todoAppTasks_v1';
const LOCAL_STORAGE_CATEGORIES_KEY = 'todoAppCategories_v1';
const LOCAL_STORAGE_THEME_KEY = 'todoAppTheme_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'todoAppSettings_v1';

const PRIORITIES: Array<Task['priority']> = ['Low', 'Medium', 'High'];
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work', color: '#3b82f6' }, // blue-500
  { id: 'cat-personal', name: 'Personal', color: '#10b981' }, // emerald-500
  { id: 'cat-shopping', name: 'Shopping', color: '#f59e0b' }, // amber-500
];

const TODAY_REFERENCE_DATE = new Date('2025-06-04T12:00:00Z'); // Use for analytics dummy data

// Helper Functions
const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

const priorityValue = (priority: Task['priority']): number => {
  if (priority === 'High') return 3;
  if (priority === 'Medium') return 2;
  return 1;
};

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'createdAt', order: 'desc' });
  
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(TODAY_REFERENCE_DATE);

  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiSuggestedSubtasks, setAiSuggestedSubtasks] = useState<AISubTaskSuggestion[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {} 
  });

  // Load data from localStorage and set theme
  useEffect(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else {
      // Add some sample tasks if none exist
      const sampleTasks: Task[] = [
        { id: generateId(), title: 'Project Proposal Due', dueDate: format(addDays(TODAY_REFERENCE_DATE, 2), 'yyyy-MM-dd'), priority: 'High', completed: false, category: 'cat-work', createdAt: TODAY_REFERENCE_DATE.toISOString() },
        { id: generateId(), title: 'Grocery Shopping', dueDate: format(TODAY_REFERENCE_DATE, 'yyyy-MM-dd'), priority: 'Medium', completed: true, category: 'cat-shopping', createdAt: subDays(TODAY_REFERENCE_DATE, 1).toISOString(), completedAt: TODAY_REFERENCE_DATE.toISOString() },
        { id: generateId(), title: 'Book Flight Tickets', dueDate: format(addDays(TODAY_REFERENCE_DATE, 7), 'yyyy-MM-dd'), priority: 'High', completed: false, category: 'cat-personal', createdAt: subDays(TODAY_REFERENCE_DATE, 2).toISOString() },
      ];
      setTasks(sampleTasks);
    }

    const savedCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else setCategories(DEFAULT_CATEGORIES);

    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    const initialIsDarkMode = savedTheme ? JSON.parse(savedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(initialIsDarkMode);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  // Apply dark mode class and save theme preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  // Notification dismiss timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Modal escape key handler
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmationDialog.isOpen) closeConfirmationDialog();
        else closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [confirmationDialog.isOpen]); // Add other modal states if they need Esc key handling

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const openConfirmationDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationDialog({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleConfirmAction = () => {
    confirmationDialog.onConfirm();
    closeConfirmationDialog();
  };

  // Task CRUD operations
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString(), completed: false };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    showNotification('Task added successfully!', 'success');
  };

  const editTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    showNotification('Task updated successfully!', 'success');
  };

  const deleteTask = (taskId: string) => {
    openConfirmationDialog('Delete Task', 'Are you sure you want to delete this task?', () => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      showNotification('Task deleted successfully!', 'success');
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : undefined }
        : task
    ));
    showNotification('Task status updated!', 'info');
  };

  // Category CRUD operations
  const addCategory = (category: Omit<Category, 'id'>) => {
    if (categories.find(c => c.name.toLowerCase() === category.name.toLowerCase())) {
      showNotification('Category with this name already exists.', 'error');
      return;
    }
    const newCategory: Category = { ...category, id: generateId() };
    setCategories(prevCategories => [...prevCategories, newCategory]);
    showNotification('Category added successfully!', 'success');
  };

  const editCategory = (updatedCategory: Category) => {
    setCategories(prevCategories => prevCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
    showNotification('Category updated successfully!', 'success');
  };

  const deleteCategory = (categoryId: string) => {
    openConfirmationDialog('Delete Category', 'Are you sure you want to delete this category? Tasks in this category will not be deleted but will lose their category association.', () => {
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
      setTasks(prevTasks => prevTasks.map(task => task.category === categoryId ? { ...task, category: '' } : task));
      showNotification('Category deleted successfully!', 'success');
    });
  };

  // Modal handling
  const openModal = (type: ModalState['type'], data?: any) => {
    setModal({ type, data });
    if (type === 'aiSubtasks' && data?.taskTitle) {
      setAiPromptText(`Break down this task: "${data.taskTitle}" (description: "${data.taskDescription || ''}") into smaller, actionable sub-tasks. Return a JSON array of objects, where each object has a "title" (string) and an optional "priority" ('Low', 'Medium', 'High'). Example: [{"title": "Sub-task 1", "priority": "High"}, {"title": "Sub-task 2"}]`);
    }
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModal({ type: null });
    setAiResult(null);
    setAiError(null);
    setAiSuggestedSubtasks([]);
    document.body.classList.remove('modal-open');
  };

  // AI Layer interaction
  const handleSendToAI = () => {
    if (!aiPromptText?.trim()) {
      setAiError("Please provide a task description to get suggestions.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    setAiIsLoading(true);
    aiLayerRef.current?.sendToAI(aiPromptText);
  };

  useEffect(() => {
    if (aiResult) {
      try {
        const parsedResult = JSON.parse(aiResult);
        if (Array.isArray(parsedResult)) {
          setAiSuggestedSubtasks(parsedResult.filter((item: any) => typeof item.title === 'string'));
        }
      } catch (e) {
        setAiError("AI response was not in the expected format.");
        setAiSuggestedSubtasks([]);
      }
    }
  }, [aiResult]);
  
  const addSuggestedSubtaskAsNewTask = (subtask: AISubTaskSuggestion) => {
    const parentTaskDueDate = modal.data?.taskDueDate || format(new Date(), 'yyyy-MM-dd');
    addTask({
      title: subtask.title,
      description: `Sub-task of "${modal.data?.taskTitle || 'Main Task'}"`, 
      dueDate: parentTaskDueDate,
      priority: subtask.priority || 'Medium',
      category: modal.data?.taskCategory || (categories.length > 0 ? categories[0].id : ''),
    });
    showNotification(`Sub-task "${subtask.title}" added.`, 'success');
  };

  // Filtering and Sorting
  const filteredAndSortedTasks = useMemo(() => {
    let tempTasks = [...tasks];

    if (searchTerm) {
      tempTasks = tempTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      tempTasks = tempTasks.filter(task => filterStatus === 'completed' ? task.completed : !task.completed);
    }

    if (filterPriority !== 'all') {
      tempTasks = tempTasks.filter(task => task.priority === filterPriority);
    }

    if (filterCategory !== 'all') {
      tempTasks = tempTasks.filter(task => task.category === filterCategory);
    }

    tempTasks.sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'priority') {
        comparison = priorityValue(b.priority) - priorityValue(a.priority); // Higher priority first
      } else if (sortConfig.key === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortConfig.key === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortConfig.key === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return tempTasks;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => ({
      key,
      order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calendar View Logic
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentCalendarDate);
    const monthEnd = endOfMonth(currentCalendarDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday as start of week
    const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6*7-1); // Display 6 weeks
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentCalendarDate]);

  const tasksForDay = (day: Date): Task[] => {
    return tasks.filter(task => isValid(parseISO(task.dueDate)) && isSameDay(parseISO(task.dueDate), day));
  };

  // Analytics Data
  const analyticsData = useMemo(() => {
    const tasksByStatus = [
      { name: 'Active', value: tasks.filter(t => !t.completed).length },
      { name: 'Completed', value: tasks.filter(t => t.completed).length },
    ];

    const tasksByPriority = PRIORITIES.map(p => ({
      name: p,
      count: tasks.filter(t => t.priority === p && !t.completed).length,
    }));

    // Tasks completed in the last 7 days relative to TODAY_REFERENCE_DATE
    const completedLast7Days = Array(7).fill(0).map((_, i) => {
      const day = subDays(TODAY_REFERENCE_DATE, 6 - i);
      const count = tasks.filter(t => t.completed && t.completedAt && isSameDay(parseISO(t.completedAt), day)).length;
      return { date: format(day, 'MMM d'), count };
    });
    
    return { tasksByStatus, tasksByPriority, completedLast7Days };
  }, [tasks]);
  
  const PIE_CHART_COLORS = ['#ef4444', '#22c55e']; // red-500, green-500 for Active/Completed
  const BAR_CHART_COLORS = ['#a3e635', '#facc15', '#dc2626']; // lime, yellow, red for Low, Medium, High

  // Settings - Data Export/Import
  const exportTasksToCSV = () => {
    const headers = ['id', 'title', 'description', 'dueDate', 'priority', 'completed', 'categoryName', 'createdAt', 'completedAt'];
    const csvRows = [
      headers.join(','),
      ...tasks.map(task => {
        const category = categories.find(c => c.id === task.category);
        return [
          task.id,
          `"${task.title.replace(/"/g, '""')}"`, // Escape quotes
          `"${(task.description || '').replace(/"/g, '""')}"`,
          task.dueDate,
          task.priority,
          task.completed,
          category ? `"${category.name.replace(/"/g, '""')}"` : '',
          task.createdAt,
          task.completedAt || ''
        ].join(',');
      })
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tasks_${format(new Date(), 'yyyyMMddHHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Tasks exported successfully!', 'success');
    } else {
      showNotification('CSV export not supported by your browser.', 'error');
    }
  };

  const importTasksFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        showNotification('Failed to read file.', 'error');
        return;
      }
      try {
        const rows = text.split('\n').map(row => row.split(',')); // Basic CSV parsing, needs improvement for quoted fields
        const headers = rows[0].map(h => h.trim());
        const importedTasks: Task[] = [];

        for (let i = 1; i < rows.length; i++) {
          if (rows[i].length < headers.length) continue; // Skip malformed rows
          const taskData: any = {};
          headers.forEach((header, index) => taskData[header] = rows[i][index]);
          
          let categoryId = '';
          if (taskData.categoryName) {
            let category = categories.find(c => c.name.toLowerCase() === taskData.categoryName.toLowerCase());
            if (!category) {
              category = { id: generateId(), name: taskData.categoryName, color: '#cccccc' }; // Default color for new category
              setCategories(prev => [...prev, category!]);
            }
            categoryId = category.id;
          }

          const newTask: Task = {
            id: taskData.id || generateId(),
            title: taskData.title || 'Untitled Task',
            description: taskData.description || '',
            dueDate: isValid(parseISO(taskData.dueDate)) ? taskData.dueDate : format(new Date(), 'yyyy-MM-dd'),
            priority: PRIORITIES.includes(taskData.priority) ? taskData.priority : 'Medium',
            completed: taskData.completed === 'true',
            category: categoryId,
            createdAt: isValid(parseISO(taskData.createdAt)) ? taskData.createdAt : new Date().toISOString(),
            completedAt: taskData.completedAt && isValid(parseISO(taskData.completedAt)) ? taskData.completedAt : undefined,
          };
          importedTasks.push(newTask);
        }
        setTasks(prevTasks => [...prevTasks, ...importedTasks.filter(it => !prevTasks.find(pt => pt.id === it.id))]);
        showNotification(`${importedTasks.length} tasks imported successfully!`, 'success');
      } catch (error) {
        showNotification('Error importing tasks. Please check file format.', 'error');
        console.error("CSV Import Error:", error);
      }
    };
    reader.readAsText(file);
    (event.target as HTMLInputElement).value = ''; // Reset file input
  };

  const downloadCSVTemplate = () => {
    const headers = ['id', 'title', 'description', 'dueDate', 'priority', 'completed', 'categoryName', 'createdAt', 'completedAt'];
    const exampleRow = ['task_123', 'Sample Task Title', 'Detailed description here', '2025-12-31', 'Medium', 'false', 'Work', new Date().toISOString(), ''];
    const csvString = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tasks_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllData = () => {
    openConfirmationDialog('Clear All Data', 'Are you sure you want to delete ALL tasks and categories? This action cannot be undone.', () => {
      setTasks([]);
      setCategories(DEFAULT_CATEGORIES); // Reset to defaults or empty array
      localStorage.removeItem(LOCAL_STORAGE_TASKS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_CATEGORIES_KEY);
      showNotification('All data cleared successfully!', 'success');
    });
  };

  const TaskForm: React.FC<{ task?: Task; onSubmit: (task: any) => void; onCancel: () => void }> = ({ task, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [dueDate, setDueDate] = useState(task?.dueDate || format(new Date(), 'yyyy-MM-dd'));
    const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'Medium');
    const [category, setCategory] = useState(task?.category || (categories.length > 0 ? categories[0].id : ''));
    const [formError, setFormError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        setFormError('Title is required.');
        return;
      }
      if (!dueDate) {
        setFormError('Due date is required.');
        return;
      }
      const taskData = { title, description, dueDate, priority, category };
      onSubmit(task ? { ...task, ...taskData } : taskData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">Title</label>
          <input id="task-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="input input-responsive" required />
        </div>
        <div className="form-group">
          <label htmlFor="task-description" className="form-label">Description (Optional)</label>
          <textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} className="input input-responsive" rows={3}></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="task-dueDate" className="form-label">Due Date</label>
            <input id="task-dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input input-responsive" required />
          </div>
          <div className="form-group">
            <label htmlFor="task-priority" className="form-label">Priority</label>
            <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="input input-responsive">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="task-category" className="form-label">Category</label>
          {categories.length > 0 ? (
            <select id="task-category" value={category} onChange={e => setCategory(e.target.value)} className="input input-responsive">
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">No categories available. Add categories in Settings.</p>
          )}
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <div className="modal-footer">
          {!task && (
            <button 
              type="button" 
              onClick={() => openModal('aiSubtasks', { taskTitle: title, taskDescription: description, taskDueDate: dueDate, taskCategory: category })}
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white mr-auto flex items-center gap-1 btn-responsive"
              title="Suggest Sub-tasks with AI"
              disabled={!title.trim()} // Disable if title is empty
            >
              <Brain size={18} /> AI Suggest
            </button>
          )}
          <button type="button" onClick={onCancel} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 btn-responsive">Cancel</button>
          <button type="submit" className="btn btn-primary btn-responsive">{task ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </form>
    );
  };

  const CategoryForm: React.FC<{ category?: Category; onSubmit: (category: any) => void; onCancel: () => void }> = ({ category, onSubmit, onCancel }) => {
    const [name, setName] = useState(category?.name || '');
    const [color, setColor] = useState(category?.color || '#3b82f6');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        setFormError('Category name is required.');
        return;
      }
      onSubmit(category ? { ...category, name, color } : { name, color });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="category-name" className="form-label">Name</label>
          <input id="category-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input input-responsive" required />
        </div>
        <div className="form-group">
          <label htmlFor="category-color" className="form-label">Color</label>
          <div className="flex items-center gap-2">
            <input id="category-color" type="color" value={color} onChange={e => setColor(e.target.value)} className={`${styles.colorInput} input-responsive w-16 h-10 rounded-md`}/>
            <span className="p-2 rounded text-sm" style={{ backgroundColor: color, color: tinycolor(color).isDark() ? 'white' : 'black' }}>Preview</span>
          </div>
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 btn-responsive">Cancel</button>
          <button type="submit" className="btn btn-primary btn-responsive">{category ? 'Save Changes' : 'Add Category'}</button>
        </div>
      </form>
    );
  };

  const renderTaskItem = (task: Task) => {
    const category = categories.find(c => c.id === task.category);
    const isOverdue = !task.completed && new Date(task.dueDate) < new Date() && !isSameDay(new Date(task.dueDate), new Date());
    
    return (
      <div key={task.id} id={`task-${task.id}`} className={`card card-responsive theme-transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${task.completed ? 'opacity-60 dark:opacity-50' : ''} ${isOverdue ? 'border-l-4 border-red-500' : `border-l-4 ${category?.color || 'border-transparent'}` }`}>
        <div className="flex-grow cursor-pointer" onClick={() => openModal('viewTask', task)}>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(task.id); }}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-400 dark:border-slate-500 hover:border-primary-500'}`}
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.completed && <CheckCircle2 size={16} className="text-white" />}
            </button>
            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</h3>
          </div>
          {task.description && <p className={`mt-1 text-sm text-gray-600 dark:text-slate-300 ${task.completed ? 'line-through' : ''}`}>{task.description.substring(0,100)}{task.description.length > 100 ? '...' : ''}</p>}
          <div className="mt-2 flex flex-wrap gap-2 items-center text-xs">
            <span className={`px-2 py-1 rounded-full text-white text-xs ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>{task.priority}</span>
            {category && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: category.color, color: tinycolor(category.color).isDark() ? 'white' : 'black' }}><Tag size={12} className="inline mr-1"/>{category.name}</span>}
            <span className="text-gray-500 dark:text-slate-400 flex items-center"><CalendarDays size={12} className="mr-1" /> {format(parseISO(task.dueDate), 'MMM d, yyyy')} {isOverdue && <span className="ml-1 text-red-500 font-semibold">(Overdue)</span>}</span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-3 sm:mt-0 flex items-center gap-2">
          <button onClick={() => openModal('editTask', task)} className="p-2 text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors" title="Edit Task"><Edit3 size={18} /></button>
          <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors" title="Delete Task"><Trash2 size={18} /></button>
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <header id="generation_issue_fallback" className="bg-white dark:bg-slate-800 shadow-md p-4 theme-transition-all sticky top-0 z-[var(--z-sticky)]">
      <div className="container-wide mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ListChecks size={32} className="text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My To-Do App</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" 
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            id="tour-theme-toggle"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
          {currentUser && (
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <Users size={20} className="text-gray-700 dark:text-slate-200" />
                <span className="font-medium text-gray-700 dark:text-slate-200 hidden sm:inline">{currentUser.first_name || currentUser.username}</span>
                <ChevronDown size={16} className="text-gray-500 dark:text-slate-400" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-[var(--z-dropdown)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-95 group-hover:scale-100 origin-top-right">
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const renderNavigation = () => {
    const navItems = [
      { view: 'tasks' as View, label: 'Tasks', icon: ListChecks },
      { view: 'calendar' as View, label: 'Calendar', icon: CalendarDays },
      { view: 'analytics' as View, label: 'Analytics', icon: BarChartBig, id: 'tour-analytics-nav' },
      { view: 'settings' as View, label: 'Settings', icon: Settings2, id: 'tour-settings-nav' },
    ];
    return (
      <nav className="bg-gray-50 dark:bg-slate-900 p-3 shadow theme-transition-all">
        <div className="container-wide mx-auto flex justify-center sm:justify-start space-x-2 sm:space-x-4 overflow-x-auto">
          {navItems.map(item => (
            <button 
              key={item.view} 
              id={item.id}
              onClick={() => setCurrentView(item.view)} 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap 
                ${currentView === item.view 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
      </nav>
    );
  };

  const renderTasksView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">My Tasks ({filteredAndSortedTasks.length})</h2>
        <button id="tour-add-task-button" onClick={() => openModal('addTask')} className="btn btn-primary btn-responsive flex items-center gap-2"><Plus size={18} /> Add New Task</button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow theme-transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-grow w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="input input-responsive pl-10 w-full"
            />
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 btn-responsive flex items-center gap-2">
            <FilterIcon size={16} /> Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {showFilters && (
          <div id="tour-filter-tasks" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div>
              <label className="form-label">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} className="input input-responsive">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Task['priority'] | 'all')} className="input input-responsive">
                <option value="all">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input input-responsive">
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Sort By</label>
              <div className="flex items-center gap-2">
                <select value={sortConfig.key} onChange={e => handleSort(e.target.value as SortKey)} className="input input-responsive flex-grow">
                  <option value="createdAt">Creation Date</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button onClick={() => handleSort(sortConfig.key)} className="btn bg-gray-200 dark:bg-slate-700 p-2" title={`Sort ${sortConfig.order === 'asc' ? 'Descending' : 'Ascending'}`}>
                  {sortConfig.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {filteredAndSortedTasks.length > 0 ? (
        <div id="tour-task-list" className="space-y-4">
          {filteredAndSortedTasks.map(renderTaskItem)}
        </div>
      ) : (
        <div className="text-center py-10">
          <Package size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
          <p className="text-gray-500 dark:text-slate-400">No tasks found. {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' ? 'Try adjusting your filters or search term.' : 'Add a new task to get started!'}</p>
        </div>
      )}
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow theme-transition-all">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setCurrentCalendarDate(subMonths(currentCalendarDate, 1))} className="btn btn-responsive"><ChevronUp className="rotate-[-90deg]" size={18}/> Prev</button>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">{format(currentCalendarDate, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentCalendarDate(addMonths(currentCalendarDate, 1))} className="btn btn-responsive">Next <ChevronDown className="rotate-[-90deg]" size={18}/></button>
      </div>
      <div className="grid grid-cols-7 gap-px border border-gray-200 dark:border-slate-700 bg-gray-200 dark:bg-slate-700">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
          <div key={dayName} className="p-2 text-center font-medium text-xs sm:text-sm text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800">{dayName}</div>
        ))}
        {calendarDays.map((day, index) => {
          const dayTasks = tasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentCalendarDate);
          const isToday = isSameDay(day, TODAY_REFERENCE_DATE);
          return (
            <div 
              key={index} 
              className={`p-2 min-h-[80px] sm:min-h-[120px] ${isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-900 opacity-70'} relative theme-transition-bg`}
            >
              <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-primary-600 dark:text-primary-400 font-bold' : isCurrentMonth ? 'text-gray-700 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>
                {format(day, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0,2).map(task => {
                    const category = categories.find(c => c.id === task.category);
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => openModal('viewTask', task)}
                        className={`p-1 rounded text-[10px] sm:text-xs truncate cursor-pointer hover:opacity-80 ${task.completed ? 'line-through opacity-60' : ''}`}
                        style={{ backgroundColor: category?.color || '#e5e7eb', color: tinycolor(category?.color || '#e5e7eb').isDark() ? 'white' : 'black' }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400">+{dayTasks.length - 2} more</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Task Analytics</h2>
      {tasks.length === 0 ? (
        <div className="card card-responsive text-center">
          <BarChartBig size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
          <p className="text-gray-500 dark:text-slate-400">No task data available for analytics. Add some tasks to see your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card card-responsive">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={analyticsData.tasksByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {analyticsData.tasksByStatus.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="card card-responsive">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Active Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.tasksByPriority} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" className="text-xs fill-current text-gray-600 dark:text-slate-300" />
                <YAxis allowDecimals={false} className="text-xs fill-current text-gray-600 dark:text-slate-300" />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? 'rgb(30 41 59)' : 'white', borderRadius: '0.375rem', borderColor: isDarkMode ? 'rgb(51 65 85)' : 'rgb(229 231 235)'}}
                  itemStyle={{ color: isDarkMode ? 'rgb(203 213 225)' : 'rgb(31 41 55)'}}
                />
                <Legend />
                <Bar dataKey="count" name="Tasks">
                  {analyticsData.tasksByPriority.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={BAR_CHART_COLORS[index % BAR_CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card card-responsive lg:col-span-2">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Tasks Completed (Last 7 Days - Relative to {format(TODAY_REFERENCE_DATE, 'MMM d')})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.completedLast7Days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" className="text-xs fill-current text-gray-600 dark:text-slate-300" />
                <YAxis allowDecimals={false} className="text-xs fill-current text-gray-600 dark:text-slate-300" />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? 'rgb(30 41 59)' : 'white', borderRadius: '0.375rem', borderColor: isDarkMode ? 'rgb(51 65 85)' : 'rgb(229 231 235)'}}
                  itemStyle={{ color: isDarkMode ? 'rgb(203 213 225)' : 'rgb(31 41 55)'}}
                />
                <Legend />
                <Line type="monotone" dataKey="count" name="Tasks Completed" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>
      
      {/* Manage Categories */}
      <div className="card card-responsive">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Manage Categories</h3>
          <button onClick={() => openModal('addCategory')} className="btn btn-primary btn-sm flex items-center gap-1"><Plus size={16}/> Add Category</button>
        </div>
        {categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-md theme-transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-gray-700 dark:text-slate-200">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal('editCategory', cat)} className="p-1 text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"><Edit3 size={16} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-slate-400">No categories defined. Add one to get started!</p>
        )}
      </div>

      {/* Data Management */}
      <div className="card card-responsive">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Data Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-slate-200">Export Tasks</h4>
            <button onClick={exportTasksToCSV} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive w-full flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export to CSV</button>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-slate-200">Import Tasks</h4>
            <label htmlFor="csv-import" className="btn bg-blue-500 hover:bg-blue-600 text-white btn-responsive w-full flex items-center justify-center gap-2 cursor-pointer">
              <UploadCloud size={18}/> Import from CSV
            </label>
            <input type="file" id="csv-import" accept=".csv" onChange={importTasksFromCSV} className="hidden" />
            <button onClick={downloadCSVTemplate} className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline w-full text-center">Download CSV Template</button>
          </div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="card card-responsive border border-red-500 dark:border-red-400">
        <h3 className="text-lg font-medium mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
        <button onClick={clearAllData} className="btn bg-red-600 hover:bg-red-700 text-white btn-responsive w-full flex items-center justify-center gap-2"><AlertTriangle size={18}/> Clear All Data</button>
        <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">This will permanently delete all your tasks and categories.</p>
      </div>
      
      {/* App Info */}
      <div className="card card-responsive">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">App Information</h3>
        <p className="text-sm text-gray-600 dark:text-slate-300">Version: {APP_VERSION}</p>
        <p className="text-sm text-gray-600 dark:text-slate-300">Built with React, TypeScript, and Tailwind CSS.</p>
      </div>
    </div>
  );
  
  const renderTaskDetailModal = () => {
    if (!modal.data || typeof modal.data !== 'object') return null;
    const task = modal.data as Task;
    const category = categories.find(c => c.id === task.category);
    const isOverdue = !task.completed && new Date(task.dueDate) < new Date() && !isSameDay(new Date(task.dueDate), new Date());

    return (
      <div className="space-y-4">
        <h3 className={`text-2xl font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
        {task.description && <p className={`text-gray-700 dark:text-slate-300 prose dark:prose-invert max-w-none ${task.completed ? 'line-through' : ''}`}>{task.description}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="block text-gray-500 dark:text-slate-400">Priority:</strong> 
            <span className={`px-2 py-1 rounded-full text-white text-xs ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>{task.priority}</span>
          </div>
          <div>
            <strong className="block text-gray-500 dark:text-slate-400">Due Date:</strong> 
            <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>{format(parseISO(task.dueDate), 'EEEE, MMM d, yyyy')} {isOverdue && '(Overdue)'}</span>
          </div>
          {category && (
            <div>
              <strong className="block text-gray-500 dark:text-slate-400">Category:</strong>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: category.color, color: tinycolor(category.color).isDark() ? 'white' : 'black' }}><Tag size={12} className="inline mr-1"/>{category.name}</span>
            </div>
          )}
          <div>
            <strong className="block text-gray-500 dark:text-slate-400">Status:</strong> 
            {task.completed ? <span className="text-green-500 flex items-center"><CheckCircle2 size={16} className="mr-1"/> Completed</span> : <span className="text-yellow-600 flex items-center"><Circle size={16} className="mr-1"/> Active</span>}
          </div>
          <div>
            <strong className="block text-gray-500 dark:text-slate-400">Created:</strong> {format(parseISO(task.createdAt), 'MMM d, yyyy, h:mm a')}
          </div>
          {task.completedAt && (
            <div>
              <strong className="block text-gray-500 dark:text-slate-400">Completed:</strong> {format(parseISO(task.completedAt), 'MMM d, yyyy, h:mm a')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={() => { closeModal(); openModal('editTask', task); }} className="btn bg-yellow-500 hover:bg-yellow-600 text-white btn-responsive flex items-center gap-1"><Edit3 size={16}/> Edit</button>
          <button onClick={closeModal} className="btn btn-primary btn-responsive">Close</button>
        </div>
      </div>
    );
  };

  const renderAISubtasksModal = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">AI Sub-task Suggestions</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">For task: "{modal.data?.taskTitle || 'Current Task'}"</p>
        {!aiResult && !aiError && !aiIsLoading && (
          <div className="form-group">
            <label htmlFor="ai-prompt" className="form-label">AI Prompt (auto-generated, editable):</label>
            <textarea id="ai-prompt" value={aiPromptText} onChange={e => setAiPromptText(e.target.value)} rows={4} className="input input-responsive"></textarea>
            <button onClick={handleSendToAI} className="btn btn-primary mt-2 btn-responsive w-full">Get Suggestions</button>
          </div>
        )}
        {aiIsLoading && <div className="flex-center py-6"><RotateCcw size={24} className="animate-spin text-primary-500" /> <p className="ml-2">AI is thinking...</p></div>}
        {aiError && <div className="alert alert-error"><AlertTriangle size={20}/> {typeof aiError === 'string' ? aiError : 'An unknown AI error occurred.'}</div>}
        {aiSuggestedSubtasks.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            <h4 className="font-medium">Suggested Sub-tasks:</h4>
            {aiSuggestedSubtasks.map((subtask, index) => (
              <div key={index} className="p-2 bg-gray-100 dark:bg-slate-700 rounded flex justify-between items-center">
                <span>{subtask.title} {subtask.priority && `(${subtask.priority})`}</span>
                <button onClick={() => addSuggestedSubtaskAsNewTask(subtask)} className="btn btn-sm btn-primary flex items-center gap-1"><Plus size={14}/> Add</button>
              </div>
            ))}
          </div>
        )}
        <div className="modal-footer">
          <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 btn-responsive">Close</button>
        </div>
      </div>
    );
  };

  // Main content rendering
  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar': return renderCalendarView();
      case 'analytics': return renderAnalyticsView();
      case 'settings': return renderSettingsView();
      case 'tasks':
      default: return renderTasksView();
    }
  };
  
  const renderNotification = () => {
    if (!notification) return null;
    let bgColor, textColor, Icon;
    switch (notification.type) {
      case 'success': bgColor = 'bg-green-100 dark:bg-green-900'; textColor = 'text-green-700 dark:text-green-200'; Icon = CheckCircle2; break;
      case 'error': bgColor = 'bg-red-100 dark:bg-red-900'; textColor = 'text-red-700 dark:text-red-200'; Icon = XCircle; break;
      case 'info': bgColor = 'bg-blue-100 dark:bg-blue-900'; textColor = 'text-blue-700 dark:text-blue-200'; Icon = Info; break;
    }

    return (
      <div 
        className={`fixed top-20 right-4 sm:right-6 md:right-8 p-4 rounded-md shadow-lg flex items-center gap-3 z-[var(--z-popover)] theme-transition-all ${bgColor} ${textColor} animate-slide-in`}
        role="alert"
      >
        <Icon size={20} />
        <span>{notification.message}</span>
        <button onClick={() => setNotification(null)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-current hover:bg-opacity-20 hover:bg-current transition-colors"><XCircle size={18}/></button>
      </div>
    );
  };
  
  // Color contrast helper (simplified)
  // For a robust solution, use a library like 'tinycolor2'
  const tinycolor = (color: string) => { // Basic implementation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return { isDark: () => yiq < 128 };
  };

  return (
    <div id="welcome_fallback" className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-slate-900 theme-transition-bg`}>
      {renderHeader()}
      {renderNavigation()}
      <main className="flex-grow container-wide mx-auto p-4 sm:p-6 md:p-8 theme-transition-all">
        {renderCurrentView()}
      </main>
      
      {/* Modals */}
      {modal.type && (
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content theme-transition-all w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {modal.type === 'addTask' && 'Add New Task'}
                {modal.type === 'editTask' && 'Edit Task'}
                {modal.type === 'addCategory' && 'Add New Category'}
                {modal.type === 'editCategory' && 'Edit Category'}
                {modal.type === 'viewTask' && 'Task Details'}
                {modal.type === 'aiSubtasks' && 'AI Sub-task Suggestions'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"><XCircle size={24}/></button>
            </div>
            <div className="mt-4">
              {modal.type === 'addTask' && <TaskForm onSubmit={taskData => { addTask(taskData); closeModal(); }} onCancel={closeModal} />}
              {modal.type === 'editTask' && modal.data && <TaskForm task={modal.data} onSubmit={taskData => { editTask(taskData); closeModal(); }} onCancel={closeModal} />}
              {modal.type === 'addCategory' && <CategoryForm onSubmit={catData => { addCategory(catData); closeModal(); }} onCancel={closeModal} />}
              {modal.type === 'editCategory' && modal.data && <CategoryForm category={modal.data} onSubmit={catData => { editCategory(catData); closeModal(); }} onCancel={closeModal} />}
              {modal.type === 'viewTask' && renderTaskDetailModal()}
              {modal.type === 'aiSubtasks' && renderAISubtasksModal()}
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {confirmationDialog.isOpen && (
        <div className="modal-backdrop" onClick={closeConfirmationDialog} role="dialog" aria-modal="true" aria-labelledby="confirmation-dialog-title">
          <div className="modal-content theme-transition-all w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="confirmation-dialog-title" className="text-xl font-semibold text-gray-800 dark:text-white">{confirmationDialog.title}</h3>
              <button onClick={closeConfirmationDialog} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"><XCircle size={24}/></button>
            </div>
            <p className="mt-4 text-gray-600 dark:text-slate-300">{confirmationDialog.message}</p>
            <div className="modal-footer">
              <button onClick={closeConfirmationDialog} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 btn-responsive">Cancel</button>
              <button onClick={handleConfirmAction} className="btn btn-primary btn-responsive bg-red-500 hover:bg-red-600 focus:ring-red-400">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer (headless) */}
      <AILayer 
        ref={aiLayerRef}
        prompt={aiPromptText}
        onResult={setAiResult}
        onError={setAiError}
        onLoading={setAiIsLoading}
      />
      
      {/* Notification Area */}
      {renderNotification()}

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
        Copyright © 2025 Datavtar Private Limited. All rights reserved. (To-Do App v{APP_VERSION})
      </footer>
    </div>
  );
};

export default App;
