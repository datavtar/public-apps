import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { Plus, Edit3, Trash2, Search, Filter, X, ChevronUp, ChevronDown, Calendar, Tag, ListChecks, Brain, Settings, Sun, Moon, LogOut, CheckCircle, Circle, GripVertical, AlertTriangle, Info, Check, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import styles from './styles/styles.module.css';

// Type Definitions
interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  tags: string[];
  subtasks: Subtask[];
}

type FilterStatus = 'all' | 'active' | 'completed';
type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'text';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskTags, setNewTaskTags] = useState<string>('');

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]); 
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // AI Layer State and Ref
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiUserInput, setAiUserInput] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Load tasks and theme from local storage
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) {
      showToast('Task description cannot be empty.', 'error');
      return;
    }
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substring(2,9),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      subtasks: [],
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setNewTaskTags('');
    showToast('Task added successfully!', 'success');
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed, updatedAt: Date.now() } : task
      )
    );
    showToast('Task status updated.', 'info');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setShowConfirmDeleteModal(null);
    showToast('Task deleted.', 'success');
  };

  const handleEditTask = (updatedTask: Task) => {
    if (!updatedTask.text.trim()) {
      showToast('Task description cannot be empty.', 'error');
      return;
    }
    setTasks(
      tasks.map(task =>
        task.id === updatedTask.id ? { ...updatedTask, updatedAt: Date.now() } : task
      )
    );
    setEditingTask(null);
    showToast('Task updated successfully!', 'success');
  };

  const handleAddSubtask = (taskId: string, subtaskText: string) => {
    if (!subtaskText.trim()) return;
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtask: Subtask = { id: Date.now().toString(), text: subtaskText.trim(), completed: false };
        return { ...task, subtasks: [...task.subtasks, newSubtask], updatedAt: Date.now() };
      }
      return task;
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st),
          updatedAt: Date.now(),
        };
      }
      return task;
    }));
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId), updatedAt: Date.now() };
      }
      return task;
    }));
  };

  // AI Smart Task Creation
  const handleSmartTaskInput = (e: ChangeEvent<HTMLInputElement>) => {
    setAiUserInput(e.target.value);
  };

  const handleSendToAI = () => {
    if (!aiUserInput.trim()) {
      setAiError("Please enter a task description for AI processing.");
      showToast('AI Input is empty.', 'error');
      return;
    }
    const prompt = `Parse the following user input into a structured task. Extract the task description (text), due date (in YYYY-MM-DD format, if mentioned, otherwise null), priority ('low', 'medium', or 'high', default to 'medium' if not clear or if words like 'urgent' or 'important' imply high, or 'later' implies low), and any tags (prefixed with #, return as an array of strings). Respond ONLY with a JSON object with keys: 'text', 'dueDate', 'priority', 'tags'. User input: "${aiUserInput}"`;
    setAiPromptText(prompt);
    setAiResult(null);
    setAiError(null);
    // setIsLoading(true); // AILayer's onLoading will handle this
    aiLayerRef.current?.sendToAI();
  };

  useEffect(() => {
    if (aiResult) {
      try {
        const parsedResult = JSON.parse(aiResult);
        const { text, dueDate, priority, tags } = parsedResult;
        if (text) {
          const newTask: Task = {
            id: Date.now().toString() + Math.random().toString(36).substring(2,9),
            text: text,
            completed: false,
            priority: priority || 'medium',
            dueDate: dueDate || undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: tags || [],
            subtasks: [],
          };
          setTasks(prevTasks => [newTask, ...prevTasks]);
          setAiUserInput(''); 
          showToast('Smart task added successfully!', 'success');
        } else {
          setAiError("AI couldn't extract task details. Try rephrasing.");
          showToast("AI couldn't extract task details. Try rephrasing.", 'error');
        }
      } catch (error) {
        console.error("Error parsing AI result:", error);
        setAiError("Error processing AI response. Please try again.");
        showToast('Error processing AI response.', 'error');
      }
    }
  }, [aiResult]);

  const filteredTasks = tasks
    .filter(task => {
      if (filterStatus === 'active') return !task.completed;
      if (filterStatus === 'completed') return task.completed;
      return true;
    })
    .filter(task => {
      if (filterPriority === 'all') return true;
      return task.priority === filterPriority;
    })
    .filter(task => {
        if (filterTags.length === 0) return true;
        return filterTags.every(ft => task.tags.includes(ft));
    })
    .filter(task =>
      task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortOption === 'dueDate') {
      comparison = (a.dueDate || 'zzzz') > (b.dueDate || 'zzzz') ? 1 : -1;
    } else if (sortOption === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortOption === 'createdAt') {
      comparison = a.createdAt > b.createdAt ? 1 : -1;
    } else if (sortOption === 'text') {
      comparison = a.text.localeCompare(b.text);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const availableTags = Array.from(new Set(tasks.flatMap(task => task.tags)));

  const handleTagFilterChange = (tag: string) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Modal escape key handler
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingTask) setEditingTask(null);
        if (showConfirmDeleteModal) setShowConfirmDeleteModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [editingTask, showConfirmDeleteModal]);

  const renderTaskItem = (task: Task) => (
    <div id={`task-item-${task.id}`} key={task.id} className={`card-responsive theme-transition-all p-4 mb-4 rounded-lg shadow-md ${task.completed ? 'bg-green-50 dark:bg-green-900 opacity-70' : 'bg-white dark:bg-slate-800'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            <button 
              onClick={() => handleToggleComplete(task.id)} 
              className={`mr-3 p-1 rounded-full focus:outline-none focus:ring-2 ${task.completed ? 'focus:ring-green-500' : 'focus:ring-primary-500'}`}
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              id={`task-checkbox-${task.id}`}
            >
              {task.completed ? <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" /> : <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />}
            </button>
            <span className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {task.text}
            </span>
          </div>
          <div className="ml-9 text-xs text-gray-500 dark:text-slate-400 space-y-1">
            {task.dueDate && <p className="flex items-center"><Calendar size={14} className="mr-1" /> Due: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</p>}
            <p className="flex items-center">
              <ListChecks size={14} className="mr-1" /> Priority: 
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold 
                ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
                  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                {task.priority}
              </span>
            </p>
            {task.tags.length > 0 && (
              <p className="flex items-center flex-wrap">
                <Tag size={14} className="mr-1" /> Tags: 
                {task.tags.map(tag => (
                  <span key={tag} className="ml-1 mt-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">{tag}</span>
                ))}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500">Created: {new Date(task.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
          <button onClick={() => setEditingTask(task)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md" aria-label="Edit Task" id={`edit-task-btn-${task.id}`}><Edit3 size={16} /></button>
          <button onClick={() => setShowConfirmDeleteModal(task)} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white p-2 rounded-md" aria-label="Delete Task" id={`delete-task-btn-${task.id}`}><Trash2 size={16} /></button>
        </div>
      </div>
      {/* Subtasks */} 
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="ml-9 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subtasks:</h4>
          {task.subtasks.map(st => (
            <div key={st.id} className="flex items-center justify-between py-1">
              <div className="flex items-center">
                <button onClick={() => handleToggleSubtask(task.id, st.id)} className={`mr-2 p-0.5 rounded-full focus:outline-none ${st.completed ? 'focus:ring-green-500' : 'focus:ring-primary-500'}`} aria-label={st.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}>
                    {st.completed ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-400" />}
                </button>
                <span className={`${st.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-slate-300'} text-sm`}>{st.text}</span>
              </div>
              <button onClick={() => handleDeleteSubtask(task.id, st.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full" aria-label="Delete subtask"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
       <form onSubmit={(e) => { 
          e.preventDefault(); 
          const subtaskInput = (e.target as HTMLFormElement).elements.namedItem('subtaskText-' + task.id) as HTMLInputElement;
          if (subtaskInput) { handleAddSubtask(task.id, subtaskInput.value); subtaskInput.value = ''; }
        }} className="ml-9 mt-2 flex gap-2">
          <input type="text" name={`subtaskText-${task.id}`} placeholder="Add subtask..." className="input input-sm flex-grow dark:bg-slate-700" />
          <button type="submit" className="btn btn-sm btn-primary">Add</button>
        </form>
    </div>
  );

  return (
    <div id="welcome_fallback" className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => { setAiError(apiError); showToast(apiError?.message || 'AI processing error.', 'error');}}
        onLoading={(loadingStatus) => setAiIsLoading(loadingStatus)}
      />

      {toast && (
        <div 
            className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-[var(--z-tooltip)] flex items-center gap-2 
            ${toast.type === 'success' ? 'bg-green-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
            role="alert"
        >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertTriangle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-lg font-bold">&times;</button>
        </div>
      )}

      <header id="app-header" className="bg-gray-100 dark:bg-slate-900 shadow-md p-4 sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-wide mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My To-Do App</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">Welcome, {currentUser.first_name}</span>
              </div>
            )}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 theme-transition"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              id="theme-toggle-button"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>
            {currentUser && (
              <button
                id="logout-button"
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 theme-transition"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container-wide mx-auto p-4 md:p-6 lg:p-8">
        <div id="generation_issue_fallback" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Regular Task Input */}
            <form onSubmit={handleAddTask} className="card card-responsive theme-transition-all p-6 space-y-4" id="add-task-form">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Add New Task</h2>
              <div>
                <label htmlFor="newTaskText" className="form-label">Task Description</label>
                <input
                  id="newTaskText"
                  type="text"
                  value={newTaskText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
                  placeholder="What needs to be done?"
                  className="input input-responsive"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newTaskPriority" className="form-label">Priority</label>
                  <select 
                    id="newTaskPriority"
                    value={newTaskPriority} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="input input-responsive"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="newTaskDueDate" className="form-label">Due Date</label>
                  <input 
                    id="newTaskDueDate"
                    type="date" 
                    value={newTaskDueDate} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskDueDate(e.target.value)} 
                    className="input input-responsive"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newTaskTags" className="form-label">Tags (comma-separated)</label>
                <input
                  id="newTaskTags"
                  type="text"
                  value={newTaskTags}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskTags(e.target.value)}
                  placeholder="e.g., work, personal, urgent"
                  className="input input-responsive"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-responsive w-full flex items-center justify-center gap-2">
                <Plus size={18} /> Add Task
              </button>
            </form>

            {/* AI Smart Task Input */}
            <div className="card card-responsive theme-transition-all p-6 space-y-4" id="ai-task-form">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <Brain size={24} className="text-primary-500"/> AI Smart Task Entry
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">Type your task naturally, e.g., "Call John tomorrow at 2pm about project report #work #urgent"</p>
              <div>
                <label htmlFor="aiUserInput" className="form-label">Smart Task Description</label>
                <input
                  id="aiUserInput"
                  type="text"
                  value={aiUserInput}
                  onChange={handleSmartTaskInput}
                  placeholder="Let AI parse your task..."
                  className="input input-responsive"
                  disabled={aiIsLoading}
                />
              </div>
              <button 
                onClick={handleSendToAI} 
                className="btn btn-secondary btn-responsive w-full flex items-center justify-center gap-2" 
                disabled={aiIsLoading || !aiUserInput.trim()}
              >
                {aiIsLoading ? (
                  <>
                    <div className={`${styles.spinner} h-5 w-5 border-t-2 border-r-2 border-white rounded-full`}></div>
                    Processing...
                  </>
                ) : (
                  <><Settings size={18} /> Create Smart Task</>
                )}
              </button>
              {aiError && <p className="form-error">Error: {typeof aiError === 'string' ? aiError : aiError?.message || 'Unknown AI error'}</p>}
            </div>
          </div>
        </div>

        {/* Filters and Sort */} 
        <div className="card card-responsive theme-transition-all p-4 mb-6" id="filters-and-sort-section">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="searchTerm" className="form-label">Search Tasks</label>
                    <div className="relative">
                        <input 
                            id="searchTerm" type="text" placeholder="Search..." value={searchTerm} 
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
                            className="input input-responsive pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="filterStatus" className="form-label">Filter by Status</label>
                    <select id="filterStatus" value={filterStatus} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as FilterStatus)} className="input input-responsive">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filterPriority" className="form-label">Filter by Priority</label>
                    <select id="filterPriority" value={filterPriority} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')} className="input input-responsive">
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <label htmlFor="sortOption" className="form-label">Sort by</label>
                    <select id="sortOption" value={sortOption} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortOption(e.target.value as SortOption)} className="input input-responsive">
                        <option value="createdAt">Date Created</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="text">Text</option>
                    </select>
                  </div>
                  <button onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} className="btn p-2.5 mt-6 dark:bg-slate-700 dark:hover:bg-slate-600 bg-gray-200 hover:bg-gray-300" aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}"`} id="sort-direction-toggle">
                      {sortDirection === 'asc' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                </div>
            </div>
            {availableTags.length > 0 && (
                <div className="mt-4">
                    <label className="form-label">Filter by Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => handleTagFilterChange(tag)}
                                className={`btn btn-sm ${filterTags.includes(tag) ? 'btn-primary' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200'}`}
                                id={`filter-tag-${tag}`}
                            >
                                {tag} {filterTags.includes(tag) && <X size={12} className="ml-1"/>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Task List */} 
        <div id="task-list-section">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => renderTaskItem(task))
          ) : (
            <div className="text-center py-10">
              <GripVertical size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
              <p className="text-gray-500 dark:text-slate-400 text-lg">No tasks found.</p>
              <p className="text-sm text-gray-400 dark:text-slate-500">Try adding a new task or adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Edit Task Modal */} 
        {editingTask && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-task-modal-title" onClick={() => setEditingTask(null)}>
            <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()} id="edit-task-modal">
              <div className="modal-header">
                <h3 id="edit-task-modal-title" className="text-xl font-semibold text-gray-800 dark:text-white">Edit Task</h3>
                <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" aria-label="Close modal"><X size={24}/></button>
              </div>
              <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleEditTask(editingTask); }} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="editText" className="form-label">Task Description</label>
                  <input 
                    id="editText" type="text" value={editingTask.text} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTask({ ...editingTask, text: e.target.value })} 
                    className="input input-responsive" required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="editPriority" className="form-label">Priority</label>
                        <select 
                            id="editPriority" value={editingTask.priority} 
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })} 
                            className="input input-responsive"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="editDueDate" className="form-label">Due Date</label>
                        <input 
                            id="editDueDate" type="date" value={editingTask.dueDate || ''} 
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTask({ ...editingTask, dueDate: e.target.value })} 
                            className="input input-responsive"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="editTags" className="form-label">Tags (comma-separated)</label>
                    <input 
                        id="editTags" type="text" value={editingTask.tags.join(', ')} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTask({ ...editingTask, tags: e.target.value.split(',').map(t=>t.trim()).filter(t => t) })} 
                        className="input input-responsive"
                    />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setEditingTask(null)} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */} 
        {showConfirmDeleteModal && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-modal-title" onClick={() => setShowConfirmDeleteModal(null)}>
            <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()} id="confirm-delete-modal">
              <div className="modal-header">
                <h3 id="confirm-delete-modal-title" className="text-xl font-semibold text-gray-800 dark:text-white">Confirm Delete</h3>
                <button onClick={() => setShowConfirmDeleteModal(null)} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" aria-label="Close modal"><X size={24}/></button>
              </div>
              <p className="mt-2 text-gray-600 dark:text-slate-300">Are you sure you want to delete the task: "{showConfirmDeleteModal.text}"? This action cannot be undone.</p>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowConfirmDeleteModal(null)} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                <button type="button" onClick={() => handleDeleteTask(showConfirmDeleteModal.id)} className="btn bg-red-600 text-white hover:bg-red-700">Delete Task</button>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer id="app-footer" className="bg-gray-100 dark:bg-slate-900 p-4 text-center text-sm text-gray-600 dark:text-slate-400 theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
