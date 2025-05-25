import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AILayer from './components/AILayer'; // Assuming AILayer.tsx is in ./components/
import { AILayerHandle } from './components/AILayer.types'; // Assuming AILayer.types.ts is in ./components/
import { Plus, Edit2, Trash2, Search, Filter, X, Moon, Sun, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Zap, AlignLeft } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string
  dueDate?: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

type FilterType = 'all' | 'active' | 'completed';
type SortByType = 'createdAt_desc' | 'createdAt_asc' | 'dueDate_asc' | 'dueDate_desc' | 'priority_high_low' | 'priority_low_high';
type ModalMode = 'add' | 'edit';

const App: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('createdAt_desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [currentTodo, setCurrentTodo] = useState<Partial<TodoItem>>({}); // For add/edit form
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Load todos and theme from localStorage
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openModal = (mode: ModalMode, todo?: TodoItem) => {
    setModalMode(mode);
    if (mode === 'edit' && todo) {
      setCurrentTodo({ ...todo });
      setEditingTodoId(todo.id);
    } else {
      setCurrentTodo({ text: '', priority: 'medium', dueDate: '' });
      setEditingTodoId(null);
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentTodo({});
    setEditingTodoId(null);
    setAiResult(null);
    setAiError(null);
    document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTodo(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTodo.text?.trim()) {
      alert("Task text cannot be empty.");
      return;
    }

    const taskData: Omit<TodoItem, 'id' | 'completed' | 'createdAt'> = {
      text: currentTodo.text,
      priority: currentTodo.priority || 'medium',
      dueDate: currentTodo.dueDate || undefined,
      tags: currentTodo.tags || [],
    };

    if (modalMode === 'add') {
      setTodos(prev => [
        {
          ...taskData,
          id: Date.now().toString(),
          completed: false,
          createdAt: new Date().toISOString(),
        },
        ...prev
      ]);
    } else if (editingTodoId) {
      setTodos(prev => prev.map(t => t.id === editingTodoId ? { ...t, ...taskData } : t));
    }
    closeModal();
  };

  const toggleComplete = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAiAssist = () => {
    if (!currentTodo.text?.trim()) {
      setAiError("Please enter task text first.");
      return;
    }
    const prompt = `Based on the task description: '${currentTodo.text}', suggest a priority level. Respond ONLY in JSON format with a single key 'priority' and its value as 'low', 'medium', or 'high'. For example: {"priority": "medium"}.`;
    setAiPromptText(prompt);
    setAiResult(null);
    setAiError(null);
    // setIsLoading(true) will be handled by AILayer's onLoading callback
    aiLayerRef.current?.sendToAI();
  };

  useEffect(() => {
    if (aiResult && typeof aiResult === 'string') {
      try {
        const parsedResult = JSON.parse(aiResult);
        if (parsedResult.priority && ['low', 'medium', 'high'].includes(parsedResult.priority)) {
          setCurrentTodo(prev => ({ ...prev, priority: parsedResult.priority }));
          setAiError(null); // Clear previous errors if successful
        } else {
          setAiError("AI returned an invalid priority format.");
        }
      } catch (error) {
        setAiError("Failed to parse AI suggestion. AI Raw: " + aiResult);
      }
    }
  }, [aiResult]);

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;
    // Filter by search term
    if (searchTerm) {
      result = result.filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    // Filter by status
    if (filter === 'active') {
      result = result.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      result = result.filter(todo => todo.completed);
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdAt_desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dueDate_asc': 
          if (!a.dueDate) return 1; if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'dueDate_desc':
          if (!a.dueDate) return 1; if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'priority_high_low':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'priority_low_high':
          const revPriorityOrder = { low: 0, medium: 1, high: 2 };
          return revPriorityOrder[a.priority] - revPriorityOrder[b.priority];
        default: return 0;
      }
    });
  }, [todos, searchTerm, filter, sortBy]);

  const getPriorityBadgeColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div id="welcome_fallback" className={`min-h-screen flex flex-col theme-transition-bg bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 ${styles.appContainer}`}>
      <header id="app_header" className="bg-primary-600 dark:bg-slate-800 text-white p-4 shadow-md sticky top-0 z-10 theme-transition-bg">
        <div className="container-wide mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><AlignLeft size={28}/> My Smart To-Do</h1>
          <button 
            id="theme_toggle_button" 
            onClick={handleThemeToggle} 
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main className="flex-grow container-wide mx-auto p-4 sm:p-6">
        <div id="add_todo_section" className="mb-6 p-4 card card-responsive theme-transition">
          <h2 className="text-xl font-semibold mb-3">Add New Task</h2>
          <button 
            id="add_todo_button_main" 
            onClick={() => openModal('add')} 
            className="btn btn-primary btn-responsive w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Task
          </button>
        </div>
        
        <div id="generation_issue_fallback" className="mb-6 p-4 card card-responsive theme-transition">
          <h2 id="controls_section_title" className="text-xl font-semibold mb-4">Manage Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div className="form-group">
              <label htmlFor="search" className="form-label">Search Tasks</label>
              <div className="relative">
                <input 
                  id="search_todo_input" 
                  type="text" 
                  className="input input-responsive pr-10" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="filter" className="form-label">Filter By</label>
              <select 
                id="filter_todo_select" 
                className="input input-responsive" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as FilterType)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sort" className="form-label">Sort By</label>
              <select 
                id="sort_todo_select" 
                className="input input-responsive" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortByType)}
              >
                <option value="createdAt_desc">Date Added (Newest)</option>
                <option value="createdAt_asc">Date Added (Oldest)</option>
                <option value="dueDate_asc">Due Date (Soonest)</option>
                <option value="dueDate_desc">Due Date (Latest)</option>
                <option value="priority_high_low">Priority (High to Low)</option>
                <option value="priority_low_high">Priority (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedTodos.length === 0 && (
          <div id="no_todos_message" className="text-center py-10">
            <p className="text-gray-500 dark:text-slate-400 text-lg">No tasks found. Add one to get started!</p>
          </div>
        )}

        <div id="todo_list_container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTodos.map((todo, index) => (
            <div 
              key={todo.id} 
              id={index === 0 ? "todo_item_example" : `todo_item_${todo.id}`}
              className={`card card-responsive theme-transition flex flex-col justify-between ${todo.completed ? 'opacity-60' : ''} ${styles.todoItemCard}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through' : ''}`}>{todo.text}</h3>
                  <input 
                    id={`todo_item_checkbox_${todo.id}`}
                    type="checkbox" 
                    checked={todo.completed} 
                    onChange={() => toggleComplete(todo.id)} 
                    className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-offset-slate-800"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                  Added: {new Date(todo.createdAt).toLocaleDateString()} 
                  {todo.dueDate && ` | Due: ${new Date(todo.dueDate).toLocaleDateString()}`}
                </div>
                <div className="mb-3">
                  <span className={`badge ${getPriorityBadgeColor(todo.priority)}`}>{todo.priority.toUpperCase()}</span>
                </div>
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {todo.tags.map(tag => (
                      <span key={tag} className="badge badge-info text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-auto pt-3 border-t dark:border-slate-700 flex gap-2">
                <button 
                  id={`edit_todo_button_${todo.id}`}
                  onClick={() => openModal('edit', todo)} 
                  className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1 flex-grow justify-center"
                  aria-label={`Edit task ${todo.text}`}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  id={`delete_todo_button_${todo.id}`}
                  onClick={() => deleteTodo(todo.id)} 
                  className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1 flex-grow justify-center"
                  aria-label={`Delete task ${todo.text}`}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div 
          className="modal-backdrop theme-transition-all" 
          onClick={closeModal} 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
        >
          <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h3 id="modal-title" className="text-xl font-semibold">
                  {modalMode === 'add' ? 'Add New Task' : 'Edit Task'}
                </h3>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300" aria-label="Close modal">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="modal_todo_text_input" className="form-label">Task Description</label>
                  <textarea 
                    id="modal_todo_text_input" 
                    name="text" 
                    value={currentTodo.text || ''} 
                    onChange={handleFormInputChange} 
                    className="input input-responsive min-h-[80px]" 
                    rows={3}
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="modal_todo_priority_select" className="form-label">Priority</label>
                    <select 
                      id="modal_todo_priority_select" 
                      name="priority" 
                      value={currentTodo.priority || 'medium'} 
                      onChange={handleFormInputChange} 
                      className="input input-responsive"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal_todo_duedate_input" className="form-label">Due Date (Optional)</label>
                    <input 
                      id="modal_todo_duedate_input" 
                      type="date" 
                      name="dueDate" 
                      value={currentTodo.dueDate || ''} 
                      onChange={handleFormInputChange} 
                      className="input input-responsive" 
                    />
                  </div>
                </div>

                {/* AI Assist Feature */}
                <div className="form-group pt-2 border-t dark:border-slate-700">
                  <label className="form-label flex items-center gap-1">AI Assistant <Zap size={16} className="text-yellow-500"/></label>
                  <button 
                    id="ai_enhance_button" 
                    type="button" 
                    onClick={handleAiAssist} 
                    disabled={isAiLoading || !currentTodo.text?.trim()} 
                    className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <ChevronDown size={18} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} /> Suggest Priority
                      </>
                    )}
                  </button>
                  {aiError && (
                    <div className="alert alert-error mt-2 text-sm p-2">
                      <AlertCircle size={18}/> {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}
                    </div>
                  )}
                  {aiResult && !aiError && (
                     <div className="alert alert-success mt-2 text-sm p-2">
                      <CheckCircle size={18}/> AI suggestion applied! You can adjust if needed.
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Cancel</button>
                <button type="submit" className="btn btn-primary">{modalMode === 'add' ? 'Add Task' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError)}
        onLoading={(loadingStatus) => setIsAiLoading(loadingStatus)}
      />

      <footer className="text-center p-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 theme-transition-all">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
