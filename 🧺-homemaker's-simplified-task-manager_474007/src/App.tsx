import React, { useState, useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent, FormEvent, useMemo } from 'react';
import {
  Plus, Trash2, Pencil, Check, Search, Sun, Moon, X, ArrowUp, ArrowDown, Minus,
  CalendarDays, FileText, AlertTriangle, Tags, PieChart as PieChartIcon,
  CheckSquare, Square, Info, SortAsc, SortDesc
} from 'lucide-react';
import { format, parseISO, isPast, compareAsc, compareDesc, isValid } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
  tags?: string[]; // Added tags
}

// Define filter types
type FilterType = 'all' | 'active' | 'completed';

// Define sort criteria
type SortByType = 'createdAt' | 'dueDate' | 'priority' | 'text';
type SortDirection = 'asc' | 'desc';

// Data structure for charts
interface ChartData {
  name: string;
  value: number;
}

// Helper component for highlighting search matches
const HighlightMatches: React.FC<{ text: string; query: string }> = React.memo(({ text, query }) => {
  if (!query) {
    return <>{text}</>;
  }
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
});

const App: React.FC = () => {
  // --- State Variables --- 
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos_homemaker_v3'); // Updated storage key
      if (savedTodos) {
        // Add default values for potentially missing fields from older versions
        return JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          priority: todo.priority ?? Priority.Medium,
          dueDate: todo.dueDate ?? undefined,
          notes: todo.notes ?? undefined,
          createdAt: todo.createdAt ?? Date.now(), // Ensure createdAt exists
          tags: todo.tags ?? [], // Add default empty tags array
        })) as TodoItem[];
      } else {
        // Default initial tasks
        return [
          { id: crypto.randomUUID(), text: 'Buy groceries (milk, eggs, bread)', completed: false, createdAt: Date.now(), priority: Priority.High, dueDate: format(new Date(), 'yyyy-MM-dd'), notes: 'Organic milk preferred', tags: ['shopping', 'urgent'] },
          { id: crypto.randomUUID(), text: 'Plan weekly meals', completed: false, createdAt: Date.now() - 100000, priority: Priority.Medium, tags: ['planning', 'home'] },
          { id: crypto.randomUUID(), text: 'Clean the kitchen', completed: true, createdAt: Date.now() - 200000, priority: Priority.Low, notes: 'Focus on stovetop', tags: ['cleaning'] },
          { id: crypto.randomUUID(), text: 'Pay utility bills', completed: false, createdAt: Date.now() - 300000, priority: Priority.High, dueDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), tags: ['bills', 'finance', 'urgent'] }, // Due in 5 days
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
  const [newTodoTags, setNewTodoTags] = useState<string>(''); // State for tags input

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editPriority, setEditPriority] = useState<Priority>(Priority.Medium);
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editTags, setEditTags] = useState<string>(''); // State for edit tags input

  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null); // For delete confirmation
  const [deletingMultiple, setDeletingMultiple] = useState<boolean>(false); // For bulk delete confirmation

  const [sortBy, setSortBy] = useState<SortByType>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [showStatsChart, setShowStatsChart] = useState<boolean>(false);

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
      localStorage.setItem('todos_homemaker_v3', JSON.stringify(todos)); // Updated storage key
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
      } else if (deletingTodoId || deletingMultiple) {
        closeDeleteModal();
      }
    }
  }, [editingTodo, deletingTodoId, deletingMultiple]); // Added deletingMultiple

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

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewTodoTags(event.target.value);
  };

  // Helper to parse tags
  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
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
      tags: parseTags(newTodoTags), // Parse tags
    };
    setTodos([newTodo, ...todos]); // Add new todo to the beginning
    setNewTodoText('');
    setNewTodoPriority(Priority.Medium);
    setNewTodoDueDate('');
    setNewTodoTags(''); // Clear tags input
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
    setDeletingMultiple(false);
    document.body.classList.add('modal-open');
  };

  const handleBulkDeleteClick = () => {
    if (selectedTodos.size === 0) return;
    setDeletingTodoId(null);
    setDeletingMultiple(true);
    document.body.classList.add('modal-open');
  }

  const confirmDelete = () => {
    if (deletingMultiple) {
       setTodos(todos.filter(todo => !selectedTodos.has(todo.id)));
       setSelectedTodos(new Set()); // Clear selection after bulk delete
    } else if (deletingTodoId) {
       setTodos(todos.filter(todo => todo.id !== deletingTodoId));
    }
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeletingTodoId(null);
    setDeletingMultiple(false);
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
    setEditTags(todo.tags?.join(', ') ?? ''); // Populate tags input
    document.body.classList.add('modal-open');
  };

  const closeEditModal = () => {
    setEditingTodo(null);
    setEditText('');
    setEditPriority(Priority.Medium);
    setEditDueDate('');
    setEditNotes('');
    setEditTags('');
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

  const handleEditTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditTags(event.target.value);
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
          tags: parseTags(editTags), // Parse edited tags
        } : todo
      )
    );
    closeEditModal();
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Allow Enter in textarea, but save on Ctrl+Enter or Cmd+Enter
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && event.target instanceof HTMLTextAreaElement) {
        event.preventDefault(); // Prevent newline in textarea
        handleSaveEdit();
    } else if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement)) {
        // Save on Enter for regular input/select
        // Check if the target is a select element, if so don't save on enter
        if (!(event.target instanceof HTMLSelectElement)) {
            event.preventDefault(); // Prevent form submission if applicable
            handleSaveEdit();
        }
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

  // Bulk Selection Handlers
  const handleSelectTodo = (id: string) => {
    const newSelection = new Set(selectedTodos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTodos(newSelection);
  };

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allVisibleIds = filteredAndSortedTodos.map(todo => todo.id);
      setSelectedTodos(new Set(allVisibleIds));
    } else {
      setSelectedTodos(new Set());
    }
  };

  const handleBulkComplete = () => {
      if (selectedTodos.size === 0) return;
      setTodos(todos.map(todo => selectedTodos.has(todo.id) ? { ...todo, completed: true } : todo));
      setSelectedTodos(new Set()); // Clear selection
  };

  const isAllSelected = useMemo(() => {
      const visibleIds = new Set(filteredAndSortedTodos.map(t => t.id));
      return filteredAndSortedTodos.length > 0 && [...selectedTodos].every(id => visibleIds.has(id)) && selectedTodos.size === visibleIds.size;
  }, [selectedTodos, filteredAndSortedTodos]);

  // --- Helper Functions --- 

  const getPriorityIcon = (priority: Priority, size: number = 16) => {
    switch (priority) {
      case Priority.High: return <ArrowUp size={size} className="text-red-500" title="High Priority" aria-label="High Priority"/>;
      case Priority.Medium: return <Minus size={size} className="text-yellow-500" title="Medium Priority" aria-label="Medium Priority"/>;
      case Priority.Low: return <ArrowDown size={size} className="text-green-500" title="Low Priority" aria-label="Low Priority"/>;
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

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.High: return isDarkMode ? '#f87171' : '#ef4444'; // red-400 / red-500
      case Priority.Medium: return isDarkMode ? '#facc15' : '#eab308'; // yellow-400 / yellow-500
      case Priority.Low: return isDarkMode ? '#4ade80' : '#22c55e'; // green-400 / green-500
      default: return isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
    }
  };

  // --- Filtering and Sorting Logic --- 

  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter(todo => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch =
          todo.text.toLowerCase().includes(lowerSearchTerm) ||
          (todo.notes && todo.notes.toLowerCase().includes(lowerSearchTerm)) ||
          (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))); // Search tags

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
            const dateA = a.dueDate && isValid(parseISO(a.dueDate)) ? parseISO(a.dueDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
            const dateB = b.dueDate && isValid(parseISO(b.dueDate)) ? parseISO(b.dueDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
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

        // Apply direction
        if (sortDirection === 'asc') {
          comparison *= -1; // Reverse comparison for ascending, except for text
        }
        // Special handling for text sort direction
        if (sortBy === 'text' && sortDirection === 'desc') {
          comparison *= -1;
        }

        // If primary sort is equal, use creation date descending as secondary sort
        if (comparison === 0) {
            return b.createdAt - a.createdAt;
        }

        return comparison;
      });
  }, [todos, searchTerm, filter, sortBy, sortDirection]); // Added sortDirection

    // Calculate stats
    const totalTasks = todos.length;
    const activeTasks = todos.filter(todo => !todo.completed).length;
    const completedTasks = totalTasks - activeTasks;

    // Prepare data for charts
    const priorityChartData: ChartData[] = useMemo(() => {
        const counts = todos.reduce((acc, todo) => {
            acc[todo.priority] = (acc[todo.priority] || 0) + 1;
            return acc;
        }, {} as Record<Priority, number>);
        return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }, [todos]);

    const statusChartData: ChartData[] = useMemo(() => [
        { name: 'Active', value: activeTasks },
        { name: 'Completed', value: completedTasks },
    ], [activeTasks, completedTasks]);

    const COLORS_PRIORITY = useMemo(() => [getPriorityColor(Priority.High), getPriorityColor(Priority.Medium), getPriorityColor(Priority.Low)], [isDarkMode]);
    const COLORS_STATUS = useMemo(() => [isDarkMode ? '#60a5fa' : '#3b82f6', isDarkMode ? '#94a3b8' : '#64748b'], [isDarkMode]); // blue, slate

  // --- Render --- 

  return (
    <div className={`min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''} ${styles.appContainer}`}>
      <div className="container-wide mx-auto px-4 py-8 theme-transition-bg">
        {/* Header */}
        <header className="flex-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 theme-transition-text flex items-center gap-2">
            <span role="img" aria-label="basket">🧺</span> Homemaker's Helper Pro
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

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Add Task & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Todo Form */}
            <form onSubmit={handleAddTodo} className="card card-responsive p-4 sm:p-5 theme-transition-all shadow-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-200">Add New Task</h2>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="new-task-input" className="form-label">Task:</label>
                        <input
                        id="new-task-input"
                        type="text"
                        value={newTodoText}
                        onChange={handleInputChange}
                        placeholder="What needs doing?"
                        className="input input-responsive w-full"
                        aria-label="New task input"
                        name="new-task-input"
                        required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                            <label htmlFor="new-task-due-date" className="form-label">Due Date:</label>
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
                    </div>
                    <div>
                        <label htmlFor="new-task-tags" className="form-label flex items-center gap-1">
                           <Tags size={14}/> Tags <span className="text-xs text-gray-400">(comma-separated)</span>
                        </label>
                        <input
                            id="new-task-tags"
                            type="text"
                            value={newTodoTags}
                            onChange={handleTagsChange}
                            placeholder="e.g., home, urgent, shopping"
                            className="input input-responsive w-full"
                            aria-label="New task tags"
                            name="new-task-tags"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-responsive flex-center gap-1 w-full mt-2"
                            name="add-task-button"
                            role="button"
                            aria-label="Add new task"
                            disabled={!newTodoText.trim()} // Disable if text is empty
                        >
                            <Plus size={18} />
                            <span>Add Task</span>
                        </button>
                    </div>
                </div>
            </form>

            {/* Stats Section */}
            <div className="card card-responsive p-4 sm:p-5 theme-transition-all shadow-md">
                <div className="flex-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Statistics</h2>
                    <button
                        onClick={() => setShowStatsChart(!showStatsChart)}
                        className="btn btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition-all flex-center gap-1"
                        aria-expanded={showStatsChart}
                        aria-label={showStatsChart ? 'Hide charts' : 'Show charts'}
                        name="toggle-stats-chart"
                        title={showStatsChart ? 'Hide Charts' : 'Show Charts'}
                     >
                        <PieChartIcon size={16}/>
                        <span>{showStatsChart ? 'Hide' : 'Show'} Charts</span>
                    </button>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-slate-400 theme-transition-text mb-4 flex-wrap">
                    <span className='stat-item'>Total: <span className='font-medium text-gray-800 dark:text-slate-200'>{totalTasks}</span></span>
                    <span className='stat-item'>Active: <span className='font-medium text-green-600 dark:text-green-400'>{activeTasks}</span></span>
                    <span className='stat-item'>Completed: <span className='font-medium text-gray-500 dark:text-slate-500'>{completedTasks}</span></span>
                </div>

                {/* Charts (Conditional) */}
                {showStatsChart && totalTasks > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in">
                        {/* Priority Chart */}
                        <div className="text-center">
                            <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-slate-400">By Priority</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={priorityChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                            return percent > 0.05 ? (
                                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                                                {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null;
                                        }}
                                    >
                                        {priorityChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PRIORITY[index % COLORS_PRIORITY.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontSize: '12px' }}
                                        itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                                    />
                                    <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Status Chart */}
                        <div className="text-center">
                             <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-slate-400">By Status</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                            return percent > 0.05 ? (
                                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                                                {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null;
                                        }}
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontSize: '12px' }}
                                        itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                                    />
                                    <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                 {showStatsChart && totalTasks === 0 && (
                     <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">No tasks available to generate charts.</p>
                 )}
            </div>

          </div>

          {/* Right Column: Task List */}
          <div className="lg:col-span-2">

            {/* Search, Filter, Sort Controls */}
            <div className="mb-4 card card-sm p-3 theme-transition-all shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    {/* Search */}
                    <div className="relative md:col-span-1">
                        <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search tasks, notes, tags..."
                        className="input input-responsive pl-10 w-full"
                        aria-label="Search tasks input"
                        name="search-input"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 items-center flex-wrap justify-center md:col-span-1">
                        {(['all', 'active', 'completed'] as FilterType[]).map(filterType => (
                        <button
                            key={filterType}
                            onClick={() => handleFilterChange(filterType)}
                            className={`btn btn-sm capitalize ${filter === filterType
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
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
                    <div className="flex gap-2 items-center flex-wrap justify-end md:col-span-1">
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
                            <option value="text">Text (A-Z)</option>
                        </select>
                        <button
                            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                            className="btn btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition-all flex-center"
                            aria-label={`Change sort direction to ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                            name="sort-direction-button"
                            title={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                        >
                            {sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                        </button>
                    </div>
                </div>
            </div>

             {/* Bulk Actions Bar */}
             {selectedTodos.size > 0 && (
                <div className="mb-4 card card-sm p-3 bg-primary-50 dark:bg-slate-800 theme-transition-all shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 fade-in">
                   <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                       {selectedTodos.size} task{selectedTodos.size > 1 ? 's' : ''} selected
                   </span>
                   <div className="flex gap-2">
                       <button
                           onClick={handleBulkComplete}
                           className="btn btn-sm bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-700 dark:text-green-200 flex-center gap-1"
                           name="bulk-complete-button"
                           title="Mark selected as complete"
                       >
                           <CheckSquare size={16} /> Mark Complete
                       </button>
                       <button
                           onClick={handleBulkDeleteClick}
                           className="btn btn-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 flex-center gap-1"
                           name="bulk-delete-button"
                           title="Delete selected tasks"
                       >
                          <Trash2 size={16} /> Delete
                       </button>
                   </div>
                </div>
            )}

            {/* Todo List Header */}
            {filteredAndSortedTodos.length > 0 && (
                <div className="flex items-center px-4 py-2 mb-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-800 rounded-t-md theme-transition-all">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 dark:bg-slate-700 dark:checked:bg-primary-500 dark:checked:border-primary-500"
                        aria-label="Select all visible tasks"
                        name="select-all-checkbox"
                        title="Select/Deselect All Visible"
                    />
                    <span className="flex-grow">Task Details</span>
                    <span className="w-20 text-right">Actions</span>
                </div>
            )}

            {/* Todo List */}
            <div className="space-y-2">
            {filteredAndSortedTodos.length > 0 ? (
                filteredAndSortedTodos.map(todo => {
                const isOverdue = todo.dueDate && isValid(parseISO(todo.dueDate)) ? !todo.completed && isPast(parseISO(todo.dueDate)) : false;
                return (
                <div
                    key={todo.id}
                    className={`card card-sm flex items-start gap-3 theme-transition-all hover:bg-gray-50 dark:hover:bg-slate-800 ${todo.completed ? 'opacity-60' : ''} ${isOverdue ? styles.overdueTask : ''} ${selectedTodos.has(todo.id) ? 'ring-2 ring-primary-300 dark:ring-primary-600 bg-primary-50 dark:bg-slate-800' : ''} rounded-md`}
                    role="listitem"
                >
                    {/* Checkbox for selection */}
                    <input
                        type="checkbox"
                        checked={selectedTodos.has(todo.id)}
                        onChange={() => handleSelectTodo(todo.id)}
                        className="mt-1 flex-shrink-0 h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 dark:bg-slate-700 dark:checked:bg-primary-500 dark:checked:border-primary-500"
                        aria-label={`Select task: ${todo.text}`}
                        name={`select-${todo.id}`}
                    />

                    {/* Left side: Priority, Text, Meta */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex-shrink-0">
                                {getPriorityIcon(todo.priority, 14)}
                            </span>
                            <span
                                className={`flex-grow truncate font-medium ${todo.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'} theme-transition-text`}
                                title={todo.text}
                            >
                                <HighlightMatches text={todo.text} query={searchTerm} />
                            </span>
                        </div>
                        {/* Notes */}
                         {todo.notes && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 truncate" title={todo.notes}>
                                <span className="italic mr-1">Notes:</span>
                                <HighlightMatches text={todo.notes} query={searchTerm} />
                            </p>
                         )}
                         {/* Meta Info: Due Date & Tags */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                        {todo.dueDate && isValid(parseISO(todo.dueDate)) && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>
                            <CalendarDays size={12} />
                            {isOverdue && <AlertTriangle size={12} title="Overdue" aria-label="Overdue"/>}
                            {format(parseISO(todo.dueDate), 'MMM d, yyyy')}
                            </span>
                        )}
                        {todo.tags && todo.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                                <Tags size={12} />
                                {todo.tags.map(tag => (
                                    <span key={tag} className="bg-gray-200 dark:bg-slate-700 rounded px-1.5 py-0.5 text-xs">
                                        <HighlightMatches text={tag} query={searchTerm} />
                                    </span>
                                ))}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Right side: Actions & Toggle */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 flex-shrink-0">
                        {/* Toggle Complete Button */}
                        <button
                            onClick={() => handleToggleComplete(todo.id)}
                            className={`p-1.5 rounded transition-colors ${todo.completed
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-slate-700'
                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                            aria-label={todo.completed ? 'Mark task as active' : 'Mark task as complete'}
                            name={`toggle-${todo.id}`}
                            title={todo.completed ? 'Mark Active' : 'Mark Complete'}
                        >
                            {todo.completed ? <CheckSquare size={18}/> : <Square size={18} />}
                        </button>
                        {/* Edit Button */}
                        <button
                            onClick={() => handleEditClick(todo)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded transition-colors"
                            aria-label={`Edit task: ${todo.text}`}
                            name={`edit-${todo.id}`}
                            title="Edit Task"
                        >
                            <Pencil size={16} />
                        </button>
                        {/* Delete Button */}
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
                <div className="text-center text-gray-500 dark:text-slate-400 py-12 card card-sm theme-transition-all">
                    <Info size={32} className="mx-auto mb-2 text-gray-400 dark:text-slate-500" />
                    {todos.length === 0 ? "No tasks yet. Add one using the form!" : "No tasks match your current filter/search criteria."}
                </div>
            )}
            </div>
          </div>
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
              className="modal-content card-responsive theme-transition-all slide-in w-full max-w-lg"
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
                            onKeyDown={handleEditKeyDown}
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
                        <label htmlFor="edit-task-due-date" className="form-label">Due Date:</label>
                        <input
                            id="edit-task-due-date"
                            type="date"
                            value={editDueDate}
                            onChange={handleEditDueDateChange}
                            onKeyDown={handleEditKeyDown}
                            className="input input-responsive w-full"
                            min={format(new Date(), 'yyyy-MM-dd')}
                            name="edit-task-due-date"
                            aria-label="Edit task due date"
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="edit-task-tags" className="form-label flex items-center gap-1">
                       <Tags size={14}/> Tags <span className="text-xs text-gray-400">(comma-separated)</span>
                    </label>
                    <input
                        id="edit-task-tags"
                        type="text"
                        value={editTags}
                        onChange={handleEditTagsChange}
                        onKeyDown={handleEditKeyDown}
                        placeholder="e.g., home, urgent, shopping"
                        className="input input-responsive w-full"
                        aria-label="Edit task tags"
                        name="edit-task-tags"
                    />
                </div>
                <div>
                    <label htmlFor="edit-task-notes" className="form-label">Notes:</label>
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
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Use Enter to save (except for notes: use Ctrl+Enter).</p>
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
        {(deletingTodoId || deletingMultiple) && (
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
                Are you sure you want to delete {deletingMultiple ? `${selectedTodos.size} task(s)` : 'this task'}? This action cannot be undone.
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
                  Delete {deletingMultiple ? `${selectedTodos.size} Task(s)` : 'Task'}
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
