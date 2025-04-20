import React, { useState, useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { 
  Plus, Trash2, Pencil, Check, Search, Sun, Moon, X, 
  ArrowUp, ArrowDown, Minus, CalendarDays, FileText, AlertTriangle, 
  ArrowDownUp, ArrowUpDown
} from 'lucide-react';
import { format, parseISO, isPast, compareAsc, compareDesc } from 'date-fns';
import styles from './styles/styles.module.css';

// Define Priority levels
enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// Define the structure for a To-Do item
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  dueDate?: string; // Store as YYYY-MM-DD string
  notes?: string;
}

// Define filter types
type FilterType = 'all' | 'active' | 'completed';

// Define sort criteria
type SortByType = 'createdAt' | 'dueDate' | 'priority' | 'text';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // --- State Variables --- 
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos_homemaker_v2');
      if (savedTodos) {
        // Add default values for potentially missing fields from older versions
        return JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          priority: todo.priority ?? Priority.Medium,
          dueDate: todo.dueDate ?? undefined,
          notes: todo.notes ?? undefined,
          createdAt: todo.createdAt ?? Date.now(), // Ensure createdAt exists
        })) as TodoItem[];
      } else {
        // Default initial tasks
        return [
          { id: crypto.randomUUID(), text: 'Buy groceries (milk, eggs, bread)', completed: false, createdAt: Date.now(), priority: Priority.High, dueDate: format(new Date(), 'yyyy-MM-dd'), notes: 'Organic milk preferred' },
          { id: crypto.randomUUID(), text: 'Plan weekly meals', completed: false, createdAt: Date.now() - 100000, priority: Priority.Medium },
          { id: crypto.randomUUID(), text: 'Clean the kitchen', completed: true, createdAt: Date.now() - 200000, priority: Priority.Low, notes: 'Focus on stovetop' },
          { id: crypto.randomUUID(), text: 'Pay utility bills', completed: false, createdAt: Date.now() - 300000, priority: Priority.High, dueDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') }, // Due in 5 days
        ];
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      return [];
    }
  });

  const [newTodoText, setNewTodoText] = useState<string>('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>(Priority.Medium);
  const [newTodoDueDate, setNewTodoDueDate] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editPriority, setEditPriority] = useState<Priority>(Priority.Medium);
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null); // For delete confirmation

  const [sortBy, setSortBy] = useState<SortByType>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedMode = localStorage.getItem('darkMode_homemaker');
      if (savedMode !== null) {
        return JSON.parse(savedMode);
      }
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch (error) {
      console.error('Failed to load dark mode setting:', error);
      return false;
    }
  });

  // --- Refs --- 
  const editInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmDeleteModalRef = useRef<HTMLDivElement>(null);

  // --- Effects --- 

  // Dark mode handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('darkMode_homemaker', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  }, [isDarkMode]);

  // Save todos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('todos_homemaker_v2', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  }, [todos]);

  // Focus edit input when modal opens
  useEffect(() => {
    if (editingTodo && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTodo]);

  // Handle Escape key for modals
  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (editingTodo) {
        closeEditModal();
      } else if (deletingTodoId) {
        closeDeleteModal();
      }
    }
  }, [editingTodo, deletingTodoId]); // Dependencies updated

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // --- Event Handlers --- 

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(event.target.value);
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewTodoPriority(event.target.value as Priority);
  };

  const handleDueDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewTodoDueDate(event.target.value);
  };

  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTodoText.trim() === '') return;
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now(),
      priority: newTodoPriority,
      dueDate: newTodoDueDate || undefined,
      notes: '', // Initialize notes as empty
    };
    setTodos([newTodo, ...todos]); // Add new todo to the beginning
    setNewTodoText('');
    setNewTodoPriority(Priority.Medium);
    setNewTodoDueDate('');
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteClick = (id: string) => {
    setDeletingTodoId(id);
    document.body.classList.add('modal-open');
  };

  const confirmDelete = () => {
    if (!deletingTodoId) return;
    setTodos(todos.filter(todo => todo.id !== deletingTodoId));
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeletingTodoId(null);
    document.body.classList.remove('modal-open');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleEditClick = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate ?? '');
    setEditNotes(todo.notes ?? '');
    document.body.classList.add('modal-open');
  };

  const closeEditModal = () => {
    setEditingTodo(null);
    setEditText('');
    setEditPriority(Priority.Medium);
    setEditDueDate('');
    setEditNotes('');
    document.body.classList.remove('modal-open');
  };

  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditText(event.target.value);
  };

  const handleEditPriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEditPriority(event.target.value as Priority);
  };

  const handleEditDueDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditDueDate(event.target.value);
  };

  const handleEditNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setEditNotes(event.target.value);
  };

  const handleSaveEdit = () => {
    if (!editingTodo || editText.trim() === '') return;
    setTodos(
      todos.map(todo =>
        todo.id === editingTodo.id ? {
          ...todo,
          text: editText.trim(),
          priority: editPriority,
          dueDate: editDueDate || undefined,
          notes: editNotes || undefined,
        } : todo
      )
    );
    closeEditModal();
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Allow Enter in textarea, but save on Ctrl+Enter or Cmd+Enter
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && event.target instanceof HTMLTextAreaElement) {
      handleSaveEdit();
    } else if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement)) {
        // Save on Enter for regular input
        handleSaveEdit();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSortChange = (newSortBy: SortByType) => {
    if (newSortBy === sortBy) {
      // Toggle direction if same column is clicked again
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default direction (desc for dates/priority, asc for text)
      setSortBy(newSortBy);
      setSortDirection(['createdAt', 'dueDate', 'priority'].includes(newSortBy) ? 'desc' : 'asc');
    }
  };

  // --- Helper Functions --- 

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.High: return <ArrowUp size={16} className="text-red-500" title="High Priority" />;
      case Priority.Medium: return <Minus size={16} className="text-yellow-500" title="Medium Priority" />;
      case Priority.Low: return <ArrowDown size={16} className="text-green-500" title="Low Priority" />;
      default: return null;
    }
  };

  const getPriorityValue = (priority: Priority): number => {
      switch (priority) {
          case Priority.High: return 3;
          case Priority.Medium: return 2;
          case Priority.Low: return 1;
          default: return 0;
      }
  };

  // --- Filtering and Sorting Logic --- 

  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase()) || (todo.notes && todo.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !todo.completed) ||
        (filter === 'completed' && todo.completed);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dueDate':
          // Sort by due date, handling undefined dates (push them to the end)
          const dateA = a.dueDate ? parseISO(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? parseISO(b.dueDate).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case 'priority':
          comparison = getPriorityValue(b.priority) - getPriorityValue(a.priority); // Higher priority first
          break;
        case 'text':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'createdAt':
        default:
          comparison = b.createdAt - a.createdAt; // Default: Newest first
          break;
      }

      // Apply direction (reverse if descending, except for createdAt and priority which default desc)
      const descByDefault = ['createdAt', 'priority'];
      const shouldReverse = sortDirection === 'asc' ? !descByDefault.includes(sortBy) : descByDefault.includes(sortBy);
      
      // If primary sort is equal, use creation date descending as secondary sort
      if (comparison === 0) {
          return b.createdAt - a.createdAt;
      } 

      return shouldReverse ? comparison * -1 : comparison;
    });

    // Calculate stats
    const totalTasks = todos.length;
    const activeTasks = todos.filter(todo => !todo.completed).length;
    const completedTasks = totalTasks - activeTasks;

  // --- Render --- 

  return (
    <div className={`min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''} ${styles.appContainer}`}>
      <div className="container-narrow mx-auto px-4 py-8 theme-transition-bg">
        {/* Header */}
        <header className="flex-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 theme-transition-text flex items-center gap-2">
            <span role="img" aria-label="basket">🧺</span> Homemaker's Helper
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            name="theme-toggle"
            role="switch"
            aria-checked={isDarkMode}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </header>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6 card card-sm p-4 theme-transition-all">
          <div className="mb-3">
             <label htmlFor="new-task-input" className="form-label">New Task:</label>
            <input
              id="new-task-input"
              type="text"
              value={newTodoText}
              onChange={handleInputChange}
              placeholder="What needs doing? (e.g., Fold laundry)"
              className="input input-responsive w-full"
              aria-label="New task input"
              name="new-task-input"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
                <label htmlFor="new-task-priority" className="form-label">Priority:</label>
                <select
                    id="new-task-priority"
                    value={newTodoPriority}
                    onChange={handlePriorityChange}
                    className="input input-responsive w-full"
                    name="new-task-priority"
                    aria-label="New task priority"
                >
                    <option value={Priority.Low}>Low</option>
                    <option value={Priority.Medium}>Medium</option>
                    <option value={Priority.High}>High</option>
                </select>
            </div>
            <div>
                <label htmlFor="new-task-due-date" className="form-label">Due Date (Optional):</label>
                <input
                    id="new-task-due-date"
                    type="date"
                    value={newTodoDueDate}
                    onChange={handleDueDateChange}
                    className="input input-responsive w-full"
                    min={format(new Date(), 'yyyy-MM-dd')} // Prevent past dates
                    name="new-task-due-date"
                    aria-label="New task due date"
                />
            </div>
            <div className="sm:self-end">
                <button
                    type="submit"
                    className="btn btn-primary btn-responsive flex-center gap-1 w-full h-[42px] sm:h-auto mt-4 sm:mt-0"
                    name="add-task-button"
                    role="button"
                    aria-label="Add new task"
                >
                    <Plus size={18} />
                    <span>Add Task</span>
                </button>
            </div>
          </div>
        </form>

        {/* Stats and Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-slate-400 theme-transition-text order-2 md:order-1">
                <span>Total: {totalTasks}</span>
                <span>Active: {activeTasks}</span>
                <span>Completed: {completedTasks}</span>
            </div>

            {/* Search */}
            <div className="relative flex-grow w-full md:w-auto order-1 md:order-2">
                <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search tasks & notes..."
                className="input input-responsive pl-10 w-full"
                aria-label="Search tasks input"
                name="search-input"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filters */}
            <div className="flex gap-2 items-center flex-wrap">
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Filter:</span>
                {(['all', 'active', 'completed'] as FilterType[]).map(filterType => (
                <button
                    key={filterType}
                    onClick={() => handleFilterChange(filterType)}
                    className={`btn btn-sm capitalize ${filter === filterType
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    } theme-transition-all`}
                    aria-pressed={filter === filterType}
                    name={`filter-${filterType}-button`}
                    role="button"
                >
                    {filterType}
                </button>
                ))}
            </div>

            {/* Sorting */}
            <div className="flex gap-2 items-center flex-wrap">
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Sort by:</span>
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortByType)}
                    className="input input-sm py-1 rounded-md dark:bg-slate-700 dark:text-slate-300 text-sm"
                    aria-label="Sort by criterion"
                    name="sort-by-select"
                 >
                    <option value="createdAt">Date Added</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="text">Text</option>
                </select>
                <button
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="btn btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition-all flex-center"
                    aria-label={`Change sort direction to ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                    name="sort-direction-button"
                >
                    {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </button>
            </div>
        </div>


        {/* Todo List */}
        <div className="space-y-3">
          {filteredAndSortedTodos.length > 0 ? (
            filteredAndSortedTodos.map(todo => {
              const isOverdue = todo.dueDate ? !todo.completed && isPast(parseISO(todo.dueDate)) : false;
              return (
              <div
                key={todo.id}
                className={`card card-sm flex items-start sm:items-center justify-between gap-3 theme-transition-all fade-in ${todo.completed ? 'opacity-60' : ''} ${isOverdue ? styles.overdueTask : ''}`}
                role="listitem"
              >
                {/* Left side: Checkbox, Priority, Text, Meta */}
                <div className="flex items-start sm:items-center gap-3 flex-grow min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(todo.id)}
                    className={`mt-1 sm:mt-0 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${todo.completed
                      ? 'border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400'
                      : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
                    }`}
                    aria-label={todo.completed ? 'Mark task as active' : 'Mark task as complete'}
                    name={`toggle-${todo.id}`}
                  >
                    {todo.completed && <Check size={16} className="text-white" />}
                  </button>

                  {/* Priority & Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        {getPriorityIcon(todo.priority)}
                        <span
                            className={`flex-grow truncate ${todo.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'} theme-transition-text`}
                            title={todo.text}
                        >
                            {todo.text}
                        </span>
                    </div>
                    {/* Meta Info: Due Date & Notes indicator */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                      {todo.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                          <CalendarDays size={12} />
                          {isOverdue && <AlertTriangle size={12} title="Overdue"/>}
                          {format(parseISO(todo.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      {todo.notes && (
                          <span className="flex items-center gap-1" title="Has notes">
                              <FileText size={12} /> Notes
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex gap-1 flex-shrink-0 mt-1 sm:mt-0 flex-col sm:flex-row">
                  <button
                    onClick={() => handleEditClick(todo)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded transition-colors"
                    aria-label={`Edit task: ${todo.text}`}
                    name={`edit-${todo.id}`}
                    title="Edit Task"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(todo.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-slate-700 rounded transition-colors"
                    aria-label={`Delete task: ${todo.text}`}
                    name={`delete-${todo.id}`}
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8 theme-transition-text card card-sm">
              {todos.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your current filter/search/sort criteria."}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingTodo && (
          <div
            className="modal-backdrop fade-in"
            onClick={closeEditModal}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div
              className="modal-content card-responsive theme-transition-all slide-in w-full max-w-lg" // Wider modal
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="modal-header">
                <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
                <button
                  onClick={closeEditModal}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close edit modal"
                  name="close-edit-modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                    <label htmlFor="edit-task-input" className="form-label">Task description:</label>
                    <input
                        id="edit-task-input"
                        type="text"
                        ref={editInputRef}
                        value={editText}
                        onChange={handleEditInputChange}
                        onKeyDown={handleEditKeyDown}
                        className="input input-responsive w-full"
                        name="edit-task-input"
                        aria-label="Edit task description"
                        required
                    />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit-task-priority" className="form-label">Priority:</label>
                        <select
                            id="edit-task-priority"
                            value={editPriority}
                            onChange={handleEditPriorityChange}
                            className="input input-responsive w-full"
                            name="edit-task-priority"
                            aria-label="Edit task priority"
                        >
                            <option value={Priority.Low}>Low</option>
                            <option value={Priority.Medium}>Medium</option>
                            <option value={Priority.High}>High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="edit-task-due-date" className="form-label">Due Date (Optional):</label>
                        <input
                            id="edit-task-due-date"
                            type="date"
                            value={editDueDate}
                            onChange={handleEditDueDateChange}
                            className="input input-responsive w-full"
                            min={format(new Date(), 'yyyy-MM-dd')}
                            name="edit-task-due-date"
                            aria-label="Edit task due date"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="edit-task-notes" className="form-label">Notes (Optional):</label>
                    <textarea
                        id="edit-task-notes"
                        value={editNotes}
                        onChange={handleEditNotesChange}
                        onKeyDown={handleEditKeyDown}
                        className="input input-responsive w-full min-h-[80px]"
                        placeholder="Add extra details..."
                        name="edit-task-notes"
                        aria-label="Edit task notes"
                    ></textarea>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Press Ctrl+Enter or Cmd+Enter to save from notes.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={closeEditModal}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition-all"
                  name="cancel-edit-button"
                  role="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary"
                  name="save-edit-button"
                  role="button"
                  disabled={!editText.trim()} // Disable save if text is empty
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingTodoId && (
          <div
            className="modal-backdrop fade-in"
            onClick={closeDeleteModal}
            ref={confirmDeleteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div
              className="modal-content card-responsive theme-transition-all slide-in w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 id="delete-modal-title" className="text-lg font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                    <AlertTriangle size={20} /> Confirm Deletion
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close delete confirmation modal"
                  name="close-delete-modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4 text-gray-600 dark:text-slate-300">
                Are you sure you want to delete this task? This action cannot be undone.
              </div>
              <div className="modal-footer">
                <button
                  onClick={closeDeleteModal}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition-all"
                  name="cancel-delete-button"
                  role="button"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                  name="confirm-delete-button"
                  role="button"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* Footer */}
      <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
