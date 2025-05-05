import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { Sun, Moon, Plus, Edit, Trash2, Check, X, Search, Filter as FilterIcon, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types --- //

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

type SortKey = 'text' | 'createdAt' | 'completed';

type SortDirection = 'asc' | 'desc';

// --- Constants --- //

const LOCAL_STORAGE_KEY_TASKS = 'todoAppTasks';
const LOCAL_STORAGE_KEY_THEME = 'todoAppTheme';

// --- Helper Functions --- //

const generateId = (): string => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  // --- State --- //

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return []; // Start with empty if loading fails
    }
  });

  const [newTaskText, setNewTaskText] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- Effects --- //

  // Persist tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
      // Optionally notify user about storage issue
    }
  }, [tasks]);

  // Apply dark mode class and persist theme preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // --- Event Handlers --- //

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };

  const handleAddTask = useCallback(() => {
    const trimmedText = newTaskText.trim();
    if (trimmedText) {
      const newTask: Task = {
        id: generateId(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskText('');
    }
  }, [newTaskText]);

  const handleInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    if (editingTaskId === id) {
      setEditingTaskId(null); // Cancel edit if deleting the task being edited
      setEditText('');
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  const handleSaveEdit = () => {
    const trimmedText = editText.trim();
    if (editingTaskId && trimmedText) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTaskId ? { ...task, text: trimmedText } : task
        )
      );
      setEditingTaskId(null);
      setEditText('');
    }
     else if (editingTaskId && !trimmedText) {
        // If user clears the text while editing, delete the task
        handleDeleteTask(editingTaskId);
    }
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

    const handleEditKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };


  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Derived State / Memoization --- //

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filter
    if (filter === 'active') {
      filtered = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filtered = tasks.filter(task => task.completed);
    }

    // Apply search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.text.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        comparison = (valA === valB) ? 0 : (valA ? 1 : -1);
      }

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return filtered;
  }, [tasks, filter, searchTerm, sortKey, sortDirection]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUp size={14} className="opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // --- Render --- //

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm p-4 theme-transition-all">
        <div className="container-narrow flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">Simple To-Do List</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={isDarkMode}
            name="theme-toggle"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow py-6 sm:py-8 px-4">
        {/* Add Task Form */}
        <div className="mb-6 sm:mb-8">
          <label htmlFor="newTaskInput" className="sr-only">Add a new task</label>
          <div className="flex gap-2">
            <input
              id="newTaskInput"
              type="text"
              value={newTaskText}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              placeholder="What needs to be done?"
              className="input flex-grow input-responsive"
              aria-label="New task input"
              name="new-task-input"
            />
            <button
              onClick={handleAddTask}
              className="btn btn-primary btn-responsive flex items-center justify-center gap-1 shrink-0"
              disabled={!newTaskText.trim()}
              aria-label="Add new task"
              name="add-task-button"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Filters, Search, and Sort Controls */}
        <div className="card card-responsive mb-6 sm:mb-8 bg-gray-100 dark:bg-slate-800 theme-transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search */}
            <div className="flex-grow">
              <label htmlFor="searchInput" className="sr-only">Search tasks</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  id="searchInput"
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="input input-responsive pl-10 w-full"
                  aria-label="Search tasks input"
                  name="search-input"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <span className="text-sm font-medium mr-1 hidden sm:inline">Filter:</span>
               <FilterIcon size={16} className="text-gray-500 dark:text-slate-400 sm:hidden" aria-hidden="true" />
              {(['all', 'active', 'completed'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`btn btn-sm capitalize ${filter === f ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                  aria-pressed={filter === f}
                  name={`filter-${f}-button`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="card card-responsive bg-white dark:bg-slate-800 theme-transition-all">
          {filteredAndSortedTasks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-slate-400 py-4">
              {tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks match your current filter/search.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-slate-700 theme-transition">
              {/* Header Row for Sorting - hidden on small screens */}
               <li className="hidden md:flex items-center justify-between py-2 px-1 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                   <div className="flex-grow pr-2">
                        <button onClick={() => handleSort('text')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200" name="sort-text-button">
                            Task <SortIcon columnKey='text' />
                        </button>
                    </div>
                    <div className="w-24 flex-shrink-0 text-center">
                         <button onClick={() => handleSort('completed')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200 mx-auto" name="sort-status-button">
                            Status <SortIcon columnKey='completed' />
                         </button>
                    </div>
                     <div className="w-32 flex-shrink-0 text-right">
                         <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200 ml-auto" name="sort-date-button">
                            Added <SortIcon columnKey='createdAt' />
                         </button>
                    </div>
                    <div className="w-24 flex-shrink-0 text-right">Actions</div>
                </li>
              {filteredAndSortedTasks.map(task => (
                <li
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 py-3 sm:py-4 px-1 ${styles.taskItem} theme-transition-all`}
                  role="listitem"
                >
                  {editingTaskId === task.id ? (
                    // --- Edit Mode ---
                    <div className="flex-grow flex gap-2 items-center">
                      <input
                        type="text"
                        value={editText}
                        onChange={handleEditInputChange}
                        onKeyDown={handleEditKeyPress} // Changed from onKeyPress for better compatibility
                        className="input input-responsive flex-grow"
                        aria-label={`Edit task: ${task.text}`}
                        name={`edit-input-${task.id}`}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex items-center justify-center p-1.5"
                        aria-label="Save changes"
                         name={`save-edit-${task.id}-button`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center p-1.5"
                        aria-label="Cancel edit"
                        name={`cancel-edit-${task.id}-button`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    // --- Display Mode ---
                    <>
                      <div className="flex-grow flex items-center gap-3 cursor-pointer group" onClick={() => handleToggleComplete(task.id)}>
                         <button
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400' : 'border-gray-300 dark:border-slate-600 group-hover:border-primary-400'}`}
                            aria-pressed={task.completed}
                            aria-label={task.completed ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`}
                            name={`toggle-${task.id}-button`}
                        >
                           {task.completed && <Check size={12} className="text-white" />}
                         </button>
                        <span
                          className={`flex-grow break-words ${task.completed ? 'line-through text-gray-500 dark:text-slate-500' : ''}`}
                        >
                          {task.text}
                        </span>
                      </div>
                      <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-2 mt-2 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="btn btn-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 p-1.5 flex items-center justify-center"
                          aria-label={`Edit task: ${task.text}`}
                          name={`edit-${task.id}-button`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 p-1.5 flex items-center justify-center"
                          aria-label={`Delete task: ${task.text}`}
                          name={`delete-${task.id}-button`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 dark:text-slate-400 py-4 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
