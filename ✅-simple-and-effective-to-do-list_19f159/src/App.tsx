import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { Home, Settings as SettingsIcon, Lightbulb, Plus, Edit3, Trash2, Search, Filter, ArrowDownUp, CheckSquare, Square, Sun, Moon, LogOut, X, AlertTriangle, Download, CalendarDays, ChevronDown, ChevronUp, FileText, Brain } from 'lucide-react';
import { format, parseISO, isValid, addDays, differenceInDays, isPast } from 'date-fns';

// Interfaces
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string
  dueDate?: string; // ISO string
  priority: 'low' | 'medium' | 'high';
}

interface UserSettings {
  showCompletedLast: boolean;
}

type Page = 'todos' | 'settings' | 'ai_suggester';
type FilterStatus = 'all' | 'active' | 'completed';
type SortOption = 'createdAt_asc' | 'createdAt_desc' | 'dueDate_asc' | 'dueDate_desc' | 'priority_desc' | 'priority_asc';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Editing states
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Deletion confirmation
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoItem | null>(null);

  // Settings page states
  const [showClearAllDataConfirmModal, setShowClearAllDataConfirmModal] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // UI States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt_desc');
  const [userSettings, setUserSettings] = useState<UserSettings>({ showCompletedLast: true });

  // AI Layer states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiGoal, setAiGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null); // Raw JSON from AILayer

  const APP_VERSION = '1.0.0';
  const TODAY_REFERENCE_DATE = '2025-06-05';

  // Load todos from localStorage
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      try {
        const storedTodos = localStorage.getItem(`todos-${currentUser.id}`);
        const storedSettings = localStorage.getItem(`userSettings-${currentUser.id}`);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        } else {
          // Add sample todos for new users
          const sampleTodos: TodoItem[] = [
            { id: crypto.randomUUID(), text: 'Welcome! Add your first task using the form above.', completed: false, createdAt: new Date().toISOString(), priority: 'medium' },
            { id: crypto.randomUUID(), text: 'Try the AI Task Suggester (brain icon) to get ideas!', completed: false, createdAt: new Date().toISOString(), priority: 'low', dueDate: addDays(new Date(TODAY_REFERENCE_DATE), 3).toISOString() },
          ];
          setTodos(sampleTodos);
        }
        if (storedSettings) {
          setUserSettings(JSON.parse(storedSettings));
        }
      } catch (e) {
        setError('Failed to load tasks or settings. Data might be corrupted.');
        setTodos([]);
      }
      setIsLoading(false);
    }
  }, [currentUser]);

  // Save todos to localStorage
  useEffect(() => {
    if (currentUser && !isLoading) { // only save if not initial loading phase
      localStorage.setItem(`todos-${currentUser.id}`, JSON.stringify(todos));
    }
  }, [todos, currentUser, isLoading]);

  // Save user settings to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`userSettings-${currentUser.id}`, JSON.stringify(userSettings));
    }
  }, [userSettings, currentUser]);

  // Dark mode effect
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const initialDarkMode = savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(initialDarkMode);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Modal escape key handler
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEditModal) setShowEditModal(false);
        if (showDeleteConfirmModal) setShowDeleteConfirmModal(false);
        if (showClearAllDataConfirmModal) setShowClearAllDataConfirmModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showEditModal, showDeleteConfirmModal, showClearAllDataConfirmModal]);

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) {
      setError('Task text cannot be empty.');
      return;
    }
    setError(null);
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: newTodoDueDate ? new Date(newTodoDueDate).toISOString() : undefined,
      priority: newTodoPriority,
    };
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
    setNewTodoDueDate('');
    setNewTodoPriority('medium');
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    setShowDeleteConfirmModal(false);
    setTodoToDelete(null);
  };

  const openDeleteConfirmModal = (todo: TodoItem) => {
    setTodoToDelete(todo);
    setShowDeleteConfirmModal(true);
  };

  const handleEditTodo = (updatedTodo: TodoItem) => {
    if (!updatedTodo.text.trim()) {
      setError('Task text cannot be empty in edit mode.');
      return;
    }
    setError(null);
    setTodos(
      todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
    setShowEditModal(false);
    setEditingTodo(null);
  };

  const openEditModal = (todo: TodoItem) => {
    setEditingTodo(todo);
    setShowEditModal(true);
  };

  const priorityCompare = (a: TodoItem, b: TodoItem): number => {
    const priorities = { high: 3, medium: 2, low: 1 };
    return priorities[b.priority] - priorities[a.priority]; // Descending
  };
  
  const filteredAndSortedTodos = todos
    .filter((todo) => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'completed' ? todo.completed : !todo.completed);
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (userSettings.showCompletedLast) {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
      }
      switch (sortOption) {
        case 'createdAt_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdAt_desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dueDate_asc': 
          if (!a.dueDate) return 1; if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'dueDate_desc':
          if (!a.dueDate) return 1; if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'priority_asc': return priorityCompare(b, a); // Reversed for ascending
        case 'priority_desc': return priorityCompare(a, b);
        default: return 0;
      }
    });

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getDueDateInfo = (dueDate?: string) => {
    if (!dueDate) return { text: 'No due date', color: 'text-gray-500 dark:text-gray-400' };
    const date = parseISO(dueDate);
    if (!isValid(date)) return { text: 'Invalid date', color: 'text-red-500' };
    const diff = differenceInDays(date, new Date()); // Use current date, not fixed reference
    if (isPast(date) && !isToday(date)) return { text: `Overdue by ${Math.abs(diff)} day(s)`, color: 'text-red-500 font-semibold' };
    if (isToday(date)) return { text: 'Due today', color: 'text-orange-500 font-semibold' };
    if (diff === 1) return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: `Due in ${diff} days`, color: 'text-green-600 dark:text-green-400' };
  };
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleSendToAI = () => {
    if (!aiGoal.trim()) {
      setAiError("Please provide a goal for AI task suggestions.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    setAiSuggestions([]);
    
    const prompt = `Based on the goal: '${aiGoal}', suggest up to 5 actionable to-do items. Return as a JSON array of strings. Example: ['Task 1', 'Task 2'].`;
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (e) {
      setAiError("Failed to send request to AI. Please try again.");
      setAiIsLoading(false); // Ensure loading is reset if sendToAI itself throws sync error
    }
  };

  useEffect(() => {
    if (aiResult) {
      try {
        const parsedSuggestions = JSON.parse(aiResult);
        if (Array.isArray(parsedSuggestions) && parsedSuggestions.every(s => typeof s === 'string')) {
          setAiSuggestions(parsedSuggestions);
        } else {
          setAiError("AI returned an unexpected format. Expected an array of strings.");
          setAiSuggestions([]);
        }
      } catch (e) {
        setAiError("Failed to parse AI suggestions. Response was: " + aiResult);
        setAiSuggestions([]);
      }
    }
  }, [aiResult]);

  const addSuggestedTask = (taskText: string) => {
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: 'medium', // Default priority for AI suggested tasks
    };
    setTodos(prevTodos => [newTodo, ...prevTodos]);
    // Optionally, provide feedback to user
  };

  const renderTodoList = () => (
    <div className="space-y-4 mt-6" id="task_list_area">
      {filteredAndSortedTodos.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 dark:text-gray-400">No tasks found. Try adding some or changing filters!</p>
      )}
      {filteredAndSortedTodos.map((todo) => (
        <div key={todo.id} className={`card card-responsive theme-transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${todo.completed ? 'opacity-60' : ''}`}>
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleToggleComplete(todo.id)} 
                aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                {todo.completed ? <CheckSquare size={24} className="text-green-500" /> : <Square size={24} className="text-gray-400 dark:text-gray-500" />}
              </button>
              <span className={`text-lg ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {todo.text}
              </span>
            </div>
            <div className="mt-2 sm:ml-10 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <div className='flex items-center gap-2'>
                <span className={`badge ${getPriorityColor(todo.priority)}`}>{todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
                 <span className="font-mono">ID: {todo.id.substring(0,8)}</span>
              </div>
              <p>Created: {format(parseISO(todo.createdAt), 'MMM d, yyyy HH:mm')}</p>
              {todo.dueDate && (
                <p className={getDueDateInfo(todo.dueDate).color}>Due: {format(parseISO(todo.dueDate), 'MMM d, yyyy')} - {getDueDateInfo(todo.dueDate).text}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0 self-end sm:self-center">
            <button onClick={() => openEditModal(todo)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1" aria-label={`Edit task ${todo.text}`}>
              <Edit3 size={16} /> Edit
            </button>
            <button onClick={() => openDeleteConfirmModal(todo)} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1" aria-label={`Delete task ${todo.text}`}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderTodoPage = () => (
    <div className="container-wide py-8">
      <form onSubmit={handleAddTodo} className="card card-responsive theme-transition-all mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Add New Task</h2>
        {error && <div className="alert alert-error mb-4"><AlertTriangle size={20}/> <p>{error}</p></div>}
        <div className="form-group">
          <label htmlFor="newTodoText" className="form-label">Task Description</label>
          <input
            id="newTodoText"
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText((e.target as HTMLInputElement).value)}
            className="input input-responsive"
            placeholder="What needs to be done?"
            aria-label="Task description"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="newTodoDueDate" className="form-label">Due Date (Optional)</label>
            <input
              id="newTodoDueDate"
              type="date"
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate((e.target as HTMLInputElement).value)}
              className="input input-responsive"
              aria-label="Due date"
              min={format(new Date(), 'yyyy-MM-dd')} // Tasks can't be due in the past
            />
          </div>
          <div className="form-group">
            <label htmlFor="newTodoPriority" className="form-label">Priority</label>
            <select
              id="newTodoPriority"
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority((e.target as HTMLSelectElement).value as 'low' | 'medium' | 'high')}
              className="input input-responsive"
              aria-label="Priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <button type="submit" id="add_task_button" className="btn btn-primary btn-responsive w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={20} /> Add Task
        </button>
      </form>

      <div id="generation_issue_fallback" className="card card-responsive theme-transition-all mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Filters & Sort</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="filter_controls">
          <div className="form-group">
            <label htmlFor="searchTerm" className="form-label">Search</label>
            <div className="relative">
              <input id="searchTerm" type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)} className="input input-responsive pr-10" />
              <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="filterStatus" className="form-label">Status</label>
            <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value as FilterStatus)} className="input input-responsive">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filterPriority" className="form-label">Priority</label>
            <select id="filterPriority" value={filterPriority} onChange={(e) => setFilterPriority((e.target as HTMLSelectElement).value as 'all' | 'low' | 'medium' | 'high')} className="input input-responsive">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sortOption" className="form-label">Sort By</label>
            <select id="sortOption" value={sortOption} onChange={(e) => setSortOption((e.target as HTMLSelectElement).value as SortOption)} className="input input-responsive">
              <option value="createdAt_desc">Created: Newest</option>
              <option value="createdAt_asc">Created: Oldest</option>
              <option value="dueDate_asc">Due Date: Soonest</option>
              <option value="dueDate_desc">Due Date: Latest</option>
              <option value="priority_desc">Priority: High to Low</option>
              <option value="priority_asc">Priority: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8"><div className="skeleton-text w-1/2 mx-auto mb-4"></div><div className="skeleton-text w-full mx-auto"></div></div> : renderTodoList()}
    </div>
  );
  
  const renderSettingsPage = () => {
    const handleClearAllData = () => {
      if (currentUser) {
        localStorage.removeItem(`todos-${currentUser.id}`);
        setTodos([]);
        // Optionally, reset settings too or provide separate option
        // localStorage.removeItem(`userSettings-${currentUser.id}`);
        // setUserSettings({ showCompletedLast: true });
        setSettingsMessage({ type: 'success', text: 'All your task data has been cleared.' });
        setShowClearAllDataConfirmModal(false);
      }
    };

    const handleDownloadData = () => {
      setSettingsMessage(null);
      if (!currentUser || todos.length === 0) {
        setSettingsMessage({ type: 'error', text: 'No data to download.' });
        return;
      }
      const headers = "ID,Text,Completed,CreatedAt,DueDate,Priority\n";
      const csvContent = todos.map(todo => 
        `${todo.id},"${todo.text.replace(/"/g, '""')}",${todo.completed},${todo.createdAt},${todo.dueDate || ''},${todo.priority}`
      ).join('\n');
      const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `todos_data_${currentUser.username}_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSettingsMessage({type: 'success', text: 'Data download started.'});
      }
    };

    return (
      <div className="container-narrow py-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Settings</h1>
        
        {settingsMessage && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${ 
            settingsMessage.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
            }`} role="alert"
          >
            <span className="font-medium">{settingsMessage.type === 'success' ? <CheckSquare className="inline mr-2" size={20}/> : <AlertTriangle className="inline mr-2" size={20}/>}{settingsMessage.type.charAt(0).toUpperCase() + settingsMessage.type.slice(1)}:</span> {settingsMessage.text}
          </div>
        )}

        <div className="card card-responsive theme-transition-all space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Task Display</h2>
            <div className="form-group flex items-center">
              <input 
                type="checkbox" 
                id="showCompletedLast" 
                className='h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600'
                checked={userSettings.showCompletedLast}
                onChange={(e) => setUserSettings({...userSettings, showCompletedLast: (e.target as HTMLInputElement).checked})}
              />
              <label htmlFor="showCompletedLast" className="form-label ml-2 mb-0">Show completed tasks at the bottom</label>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-2">Data Management</h2>
            <div className="space-y-3">
              <button onClick={handleDownloadData} className="btn bg-green-500 hover:bg-green-600 text-white w-full flex items-center justify-center gap-2">
                <Download size={18} /> Download My Data (CSV)
              </button>
              <button 
                onClick={() => {
                    setSettingsMessage(null); // Clear previous messages before opening modal
                    setShowClearAllDataConfirmModal(true);
                }} 
                className="btn bg-red-500 hover:bg-red-600 text-white w-full flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> Clear All My Data
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-2">App Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Version: {APP_VERSION}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Data stored locally in your browser.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAITaskSuggesterPage = () => (
    <div className="container-narrow py-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">AI Task Suggester</h1>
      <div className="card card-responsive theme-transition-all">
        <div className="form-group">
          <label htmlFor="aiGoal" className="form-label">What's your main goal or project?</label>
          <textarea
            id="aiGoal"
            value={aiGoal}
            onChange={(e) => setAiGoal((e.target as HTMLTextAreaElement).value)}
            className="input input-responsive h-24"
            placeholder="e.g., Plan a surprise birthday party, Learn React, Organize my home office"
          />
        </div>
        <button onClick={handleSendToAI} disabled={aiIsLoading} className="btn btn-primary btn-responsive w-full flex items-center justify-center gap-2 mb-4">
          {aiIsLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Brain size={20} />} Get AI Suggestions
        </button>

        {aiError && <div className="alert alert-error"><AlertTriangle size={20}/> <p>{aiError}</p></div>}
        
        {aiSuggestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3">Suggested Tasks:</h2>
            <ul className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <span className="text-gray-700 dark:text-gray-200">{suggestion}</span>
                  <button onClick={() => addSuggestedTask(suggestion)} className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                    <Plus size={16} /> Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  if (!currentUser) {
    // This should ideally be handled by the AuthProvider redirecting to login
    // For this structure, returning null or a loading indicator for auth
    return <div className="flex items-center justify-center h-screen"><p>Loading authentication...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-slate-900 theme-transition-all" id="welcome_fallback">
      <header className="bg-primary-600 dark:bg-slate-800 text-white shadow-md sticky top-0 z-[var(--z-sticky)]">
        <div className="container-fluid mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold">ProductiPal To-Do</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block">Welcome, {currentUser.first_name}!</span>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              id="theme_toggle_button"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />} 
            </button>
            <button onClick={logout} className="btn bg-red-500 hover:bg-red-600 text-white btn-sm flex items-center gap-1">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        <nav className="bg-primary-700 dark:bg-slate-700">
          <div className="container-fluid mx-auto px-4 flex items-center justify-center sm:justify-start gap-2 sm:gap-4">
            {[ 
              { page: 'todos' as Page, label: 'My Tasks', icon: Home },
              { page: 'ai_suggester' as Page, label: 'AI Suggester', icon: Brain },
              { page: 'settings' as Page, label: 'Settings', icon: SettingsIcon, id: 'settings_link' },
            ].map(item => (
              <button
                key={item.page}
                id={item.id}
                onClick={() => setCurrentPage(item.page)}
                className={`py-3 px-2 sm:px-4 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${currentPage === item.page ? 'border-b-2 border-white text-white' : 'text-primary-100 hover:text-white hover:bg-primary-600 dark:hover:bg-slate-600'}`}
              >
                <item.icon size={18} /> <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {currentPage === 'todos' && renderTodoPage()}
        {currentPage === 'settings' && renderSettingsPage()}
        {currentPage === 'ai_suggester' && renderAITaskSuggesterPage()}
      </main>

      {showEditModal && editingTodo && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
            <div className="modal-header">
              <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close edit modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditTodo({ ...editingTodo, text: (e.target as any).editText.value, dueDate: (e.target as any).editDueDate.value ? new Date((e.target as any).editDueDate.value).toISOString() : undefined, priority: (e.target as any).editPriority.value }); }}>
              <div className="form-group">
                <label htmlFor="editText" className="form-label">Task Description</label>
                <input id="editText" type="text" defaultValue={editingTodo.text} className="input input-responsive" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label htmlFor="editDueDate" className="form-label">Due Date</label>
                  <input id="editDueDate" type="date" defaultValue={editingTodo.dueDate ? format(parseISO(editingTodo.dueDate), 'yyyy-MM-dd') : ''} className="input input-responsive" min={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <div className="form-group">
                  <label htmlFor="editPriority" className="form-label">Priority</label>
                  <select id="editPriority" defaultValue={editingTodo.priority} className="input input-responsive">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && todoToDelete && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirmModal(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 id="delete-confirm-title" className="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete the task "{todoToDelete.text}"? This action cannot be undone.</p>
            <div className="modal-footer justify-center">
              <button type="button" onClick={() => setShowDeleteConfirmModal(false)} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
              <button type="button" onClick={() => { if(todoToDelete) handleDeleteTodo(todoToDelete.id); }} className="btn bg-red-600 text-white hover:bg-red-700">Delete Task</button>
            </div>
          </div>
        </div>
      )}

      {showClearAllDataConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowClearAllDataConfirmModal(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="clear-all-data-confirm-title">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 id="clear-all-data-confirm-title" className="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Clear All Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete all your task data? This action cannot be undone.</p>
            <div className="modal-footer justify-center">
              <button type="button" onClick={() => setShowClearAllDataConfirmModal(false)} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
              <button type="button" onClick={() => renderSettingsPage().handleClearAllData()} className="btn bg-red-600 text-white hover:bg-red-700">Clear All Data</button>
            </div>
          </div>
        </div>
      )}

      <AILayer
        ref={aiLayerRef}
        prompt={aiGoal} // This will be overridden by sendToAI if a prompt is passed there
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError ? (typeof apiError === 'string' ? apiError : JSON.stringify(apiError)) : 'Unknown AI error')}
        onLoading={(loadingStatus) => setAiIsLoading(loadingStatus)}
      />

      <footer className="bg-gray-200 dark:bg-slate-800 text-center py-4 theme-transition-all text-sm text-gray-600 dark:text-gray-400">
        Copyright © 2025 Datavtar Private Limited. All rights reserved. (To-Do App v{APP_VERSION})
      </footer>
    </div>
  );
};

export default App;
