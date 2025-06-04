import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownUp, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Calendar, 
  Star, 
  Clock, 
  BarChart3, 
  Settings, 
  Download, 
  Upload, 
  Target, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  LogOut,
  Brain,
  Zap,
  Tags,
  FileText,
  Home,
  ChevronDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  defaultPriority: 'low' | 'medium' | 'high';
  autoArchive: boolean;
  categories: Category[];
}

type FilterType = 'all' | 'active' | 'completed' | 'overdue';
type SortType = 'created' | 'due' | 'priority' | 'alphabetical';
type ViewMode = 'todos' | 'dashboard' | 'settings';

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // AI-related state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiHelper, setShowAiHelper] = useState(false);
  
  // Core state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('created');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    dueDate: ''
  });
  
  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'auto',
    language: 'en',
    defaultPriority: 'medium',
    autoArchive: false,
    categories: [
      { id: '1', name: 'Personal', color: '#3B82F6' },
      { id: '2', name: 'Work', color: '#EF4444' },
      { id: '3', name: 'Shopping', color: '#10B981' },
      { id: '4', name: 'Health', color: '#F59E0B' }
    ]
  });
  
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [showImportModal, setShowImportModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedSettings = localStorage.getItem('todo-settings');
    
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    // Add sample data if no todos exist
    if (!savedTodos) {
      const sampleTodos: Todo[] = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Finish the Q2 project proposal for client review',
          completed: false,
          priority: 'high',
          category: 'Work',
          dueDate: '2025-06-10',
          createdAt: '2025-06-01T10:00:00Z'
        },
        {
          id: '2',
          title: 'Buy groceries',
          description: 'Get ingredients for dinner tonight',
          completed: true,
          priority: 'medium',
          category: 'Shopping',
          dueDate: '2025-06-04',
          createdAt: '2025-06-03T09:00:00Z',
          completedAt: '2025-06-04T12:00:00Z'
        }
      ];
      setTodos(sampleTodos);
    }
  }, []);

  // Save data when state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('todo-settings', JSON.stringify(settings));
  }, [settings]);

  // AI Helper Functions
  const handleAiSuggestion = () => {
    if (!aiPrompt?.trim()) {
      setAiError('Please describe what you want to do');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    const enhancedPrompt = `Based on this task description: "${aiPrompt}", create a structured todo item. Return JSON with keys: "title" (concise task name), "description" (detailed explanation), "priority" (low/medium/high), "category" (Personal/Work/Shopping/Health), "suggestedDueDate" (YYYY-MM-DD format, within next 30 days). Be practical and specific.`;
    
    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    try {
      const parsedResult = JSON.parse(result);
      if (parsedResult.title) {
        setFormData({
          title: parsedResult.title || '',
          description: parsedResult.description || '',
          priority: parsedResult.priority || 'medium',
          category: parsedResult.category || '',
          dueDate: parsedResult.suggestedDueDate || ''
        });
        setShowAddForm(true);
        setShowAiHelper(false);
        setAiPrompt('');
      }
    } catch (error) {
      console.error('Error parsing AI result:', error);
    }
  };

  // Todo operations
  const addTodo = () => {
    if (!formData.title.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      completed: false,
      priority: formData.priority,
      category: formData.category,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString()
    };
    
    setTodos(prev => [newTodo, ...prev]);
    setFormData({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });
    setShowAddForm(false);
  };

  const updateTodo = () => {
    if (!editingTodo || !formData.title.trim()) return;
    
    setTodos(prev => prev.map(todo => 
      todo.id === editingTodo.id 
        ? { ...todo, ...formData }
        : todo
    ));
    
    setEditingTodo(null);
    setFormData({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : undefined
          }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setShowDeleteConfirm(null);
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate
    });
    setShowAddForm(true);
  };

  // Bulk operations
  const toggleBulkSelection = (id: string) => {
    setBulkSelection(prev => 
      prev.includes(id) 
        ? prev.filter(todoId => todoId !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleTodos = getFilteredAndSortedTodos();
    setBulkSelection(visibleTodos.map(todo => todo.id));
  };

  const clearBulkSelection = () => {
    setBulkSelection([]);
  };

  const bulkComplete = () => {
    setTodos(prev => prev.map(todo => 
      bulkSelection.includes(todo.id)
        ? { ...todo, completed: true, completedAt: new Date().toISOString() }
        : todo
    ));
    clearBulkSelection();
  };

  const bulkDelete = () => {
    setTodos(prev => prev.filter(todo => !bulkSelection.includes(todo.id)));
    clearBulkSelection();
    setShowBulkDeleteConfirm(false);
  };

  // Filtering and sorting
  const getFilteredAndSortedTodos = () => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' ||
                           (filterType === 'active' && !todo.completed) ||
                           (filterType === 'completed' && todo.completed) ||
                           (filterType === 'overdue' && !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date());
      const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
      
      return matchesSearch && matchesFilter && matchesCategory;
    });
    
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'due':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  };

  // Statistics
  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const overdue = todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const highPriority = todos.filter(t => !t.completed && t.priority === 'high').length;
    
    return { total, completed, overdue, highPriority, active: total - completed };
  };

  // Settings operations
  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      color: newCategory.color
    };
    
    setSettings(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
    
    setNewCategory({ name: '', color: '#3B82F6' });
  };

  const deleteCategory = (id: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id)
    }));
  };

  // Data import/export
  const exportData = () => {
    const data = {
      todos,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: 'Sample Task',
        description: 'This is a sample task description',
        priority: 'medium',
        category: 'Personal',
        dueDate: '2025-12-31'
      }
    ];
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-import-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(data)) {
          const importedTodos: Todo[] = data.map((item, index) => ({
            id: `imported-${Date.now()}-${index}`,
            title: item.title || 'Untitled',
            description: item.description || '',
            completed: false,
            priority: item.priority || 'medium',
            category: item.category || '',
            dueDate: item.dueDate || '',
            createdAt: new Date().toISOString()
          }));
          
          setTodos(prev => [...importedTodos, ...prev]);
          setShowImportModal(false);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all todos? This cannot be undone.')) {
      setTodos([]);
      setBulkSelection([]);
    }
  };

  const stats = getStats();
  const filteredTodos = getFilteredAndSortedTodos();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TodoMaster</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Stay organized, stay productive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span>Welcome, {currentUser?.first_name}</span>
                {isAdmin && <span className="badge badge-info">Admin</span>}
              </div>
              
              <nav className="flex items-center gap-2">
                <button
                  id="nav-todos"
                  onClick={() => setViewMode('todos')}
                  className={`btn btn-sm ${viewMode === 'todos' ? 'btn-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Todos</span>
                </button>
                
                {isAdmin && (
                  <button
                    id="nav-dashboard"
                    onClick={() => setViewMode('dashboard')}
                    className={`btn btn-sm ${viewMode === 'dashboard' ? 'btn-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                )}
                
                <button
                  id="nav-settings"
                  onClick={() => setViewMode('settings')}
                  className={`btn btn-sm ${viewMode === 'settings' ? 'btn-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </nav>
              
              <button
                onClick={logout}
                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        {viewMode === 'todos' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="stat-title text-blue-100">Total Tasks</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="stat-title text-green-100">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
              <div className="stat-card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <div className="stat-title text-yellow-100">Active</div>
                <div className="stat-value">{stats.active}</div>
              </div>
              <div className="stat-card bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="stat-title text-red-100">Overdue</div>
                <div className="stat-value">{stats.overdue}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="card">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left side - Add buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    id="add-todo-btn"
                    onClick={() => {
                      setShowAddForm(true);
                      setEditingTodo(null);
                      setFormData({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });
                    }}
                    className="btn btn-primary flex-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Todo
                  </button>
                  
                  <button
                    id="ai-helper-btn"
                    onClick={() => setShowAiHelper(true)}
                    className="btn bg-purple-600 text-white hover:bg-purple-700 flex-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    AI Helper
                  </button>
                </div>

                {/* Right side - Search and filters */}
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search todos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      className="input min-w-0 sm:min-w-[120px]"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input min-w-0 sm:min-w-[120px]"
                    >
                      <option value="all">All Categories</option>
                      {settings.categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={sortType}
                      onChange={(e) => setSortType(e.target.value as SortType)}
                      className="input min-w-0 sm:min-w-[120px]"
                    >
                      <option value="created">Created Date</option>
                      <option value="due">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Bulk actions */}
              {bulkSelection.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {bulkSelection.length} item(s) selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={bulkComplete}
                        className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Complete
                      </button>
                      <button
                        onClick={() => setShowBulkDeleteConfirm(true)}
                        className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        onClick={clearBulkSelection}
                        className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Todo List */}
            <div className="space-y-4">
              {filteredTodos.length === 0 ? (
                <div id="generation_issue_fallback" className="card text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No todos found</h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-4">
                    {searchTerm || filterType !== 'all' || selectedCategory !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'Get started by adding your first todo'
                    }
                  </p>
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setEditingTodo(null);
                      setFormData({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });
                    }}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Todo
                  </button>
                </div>
              ) : (
                <>
                  {/* Bulk select all */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllVisible}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All Visible ({filteredTodos.length})
                      </button>
                      {bulkSelection.length > 0 && (
                        <button
                          onClick={clearBulkSelection}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    <span>{filteredTodos.length} of {todos.length} todos</span>
                  </div>
                  
                  {filteredTodos.map(todo => {
                    const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
                    const category = settings.categories.find(cat => cat.name === todo.category);
                    
                    return (
                      <div
                        key={todo.id}
                        className={`card hover:shadow-lg transition-all duration-200 ${todo.completed ? 'opacity-75' : ''} ${
                          bulkSelection.includes(todo.id) ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Bulk selection checkbox */}
                          <input
                            type="checkbox"
                            checked={bulkSelection.includes(todo.id)}
                            onChange={() => toggleBulkSelection(todo.id)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          
                          {/* Completion toggle */}
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex-center transition-colors ${
                              todo.completed 
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {todo.completed ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3 opacity-0" />}
                          </button>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                  {todo.title}
                                </h3>
                                {todo.description && (
                                  <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600 dark:text-slate-400'}`}>
                                    {todo.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {/* Priority badge */}
                                  <span className={`badge ${
                                    todo.priority === 'high' ? 'badge-error' :
                                    todo.priority === 'medium' ? 'badge-warning' : 'badge-info'
                                  }`}>
                                    {todo.priority}
                                  </span>
                                  
                                  {/* Category badge */}
                                  {category && (
                                    <span 
                                      className="badge text-white text-xs"
                                      style={{ backgroundColor: category.color }}
                                    >
                                      {category.name}
                                    </span>
                                  )}
                                  
                                  {/* Due date */}
                                  {todo.dueDate && (
                                    <span className={`text-xs flex items-center gap-1 ${
                                      isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                                    }`}>
                                      <Calendar className="w-3 h-3" />
                                      {new Date(todo.dueDate).toLocaleDateString()}
                                      {isOverdue && ' (Overdue)'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEdit(todo)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(todo.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <div className="text-sm text-gray-500">Admin View</div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-blue-100">Total Tasks</div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-desc text-blue-200">All time</div>
                  </div>
                  <Target className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-green-100">Completed</div>
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-desc text-green-200">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
                    </div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-yellow-100">High Priority</div>
                    <div className="stat-value">{stats.highPriority}</div>
                    <div className="stat-desc text-yellow-200">Needs attention</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-red-100">Overdue</div>
                    <div className="stat-value">{stats.overdue}</div>
                    <div className="stat-desc text-red-200">Immediate action needed</div>
                  </div>
                  <Clock className="w-8 h-8 text-red-200" />
                </div>
              </div>
            </div>
            
            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
                <div className="space-y-3">
                  {settings.categories.map(category => {
                    const categoryTodos = todos.filter(t => t.category === category.name);
                    const percentage = stats.total > 0 ? (categoryTodos.length / stats.total) * 100 : 0;
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{categoryTodos.length}</div>
                          <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {todos
                    .filter(t => t.completedAt)
                    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                    .slice(0, 5)
                    .map(todo => (
                      <div key={todo.id} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{todo.title}</p>
                          <p className="text-xs text-gray-500">
                            Completed {new Date(todo.completedAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                  {todos.filter(t => t.completedAt).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No completed tasks yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            
            {/* Categories Management */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              
              <div className="space-y-4">
                {/* Add new category */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="input flex-1"
                  />
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <button onClick={addCategory} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Category list */}
                <div className="space-y-2">
                  {settings.categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500">
                          ({todos.filter(t => t.category === category.name).length} todos)
                        </span>
                      </div>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Data Management */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Import Todos</h4>
                  <div className="space-y-2">
                    <button
                      onClick={downloadTemplate}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="btn btn-primary w-full justify-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Todos
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Export & Cleanup</h4>
                  <div className="space-y-2">
                    <button
                      onClick={exportData}
                      className="btn bg-green-100 text-green-700 hover:bg-green-200 w-full justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </button>
                    <button
                      onClick={clearAllData}
                      className="btn bg-red-100 text-red-700 hover:bg-red-200 w-full justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* App Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">App Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Default Priority</label>
                  <select
                    value={settings.defaultPriority}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultPriority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label mb-0">Auto-archive completed todos</label>
                    <p className="text-sm text-gray-500">Automatically hide completed todos after 30 days</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoArchive}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoArchive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Todo Modal */}
      {showAddForm && (
        <div className="modal-backdrop" onClick={() => {
          setShowAddForm(false);
          setEditingTodo(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                {editingTodo ? 'Edit Todo' : 'Add New Todo'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTodo(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input min-h-[80px] resize-none"
                  placeholder="Add more details..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {settings.categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTodo(null);
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={editingTodo ? updateTodo : addTodo}
                disabled={!formData.title.trim()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTodo ? 'Update' : 'Add'} Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Helper Modal */}
      {showAiHelper && (
        <div className="modal-backdrop" onClick={() => setShowAiHelper(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Todo Helper
              </h3>
              <button
                onClick={() => setShowAiHelper(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Describe what you want to accomplish, and I'll help create a structured todo with priority, category, and due date suggestions.
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Describe your task</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="e.g., 'I need to prepare a presentation for the quarterly review meeting next week'"
                  autoFocus
                />
              </div>
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-4 h-4" />
                  <p>{aiError.message || 'An error occurred while processing your request'}</p>
                </div>
              )}
              
              {aiResult && (
                <div className="alert alert-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <p>Todo created successfully! Check the add form to review and submit.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAiHelper(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAiSuggestion}
                disabled={!aiPrompt.trim() || aiLoading}
                className="btn bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Todo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Import Todos</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="alert alert-info">
                <FileText className="w-4 h-4" />
                <p>Upload a JSON file with your todos. Download the template first to see the required format.</p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Select JSON file</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={downloadTemplate}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Delete Todo</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-4">
              <p className="text-gray-700 dark:text-slate-300">
                Are you sure you want to delete this todo? This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTodo(showDeleteConfirm)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Delete Selected Todos</h3>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-4">
              <p className="text-gray-700 dark:text-slate-300">
                Are you sure you want to delete {bulkSelection.length} selected todo(s)? This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={bulkDelete}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 mt-16">
        <div className="container-wide py-6">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Keyboard shortcuts handler */}
      <div className="hidden">
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowAddForm(false);
              setShowAiHelper(false);
              setShowImportModal(false);
              setShowDeleteConfirm(null);
              setShowBulkDeleteConfirm(false);
              setEditingTodo(null);
            }
          }}
          tabIndex={-1}
          style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }}
        />
      </div>
    </div>
  );
}

export default App;