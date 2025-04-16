import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sun, Moon, Plus, Trash2, Pencil, Check, X, Search, Filter as FilterIcon, ArrowDownUp, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// --------- Interfaces and Types ---------

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

type SortType = 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc';

interface EditingTask {
  id: string;
  text: string;
}

// --------- Constants ---------

const LOCAL_STORAGE_KEY_TASKS = 'react-todo-app-tasks';
const LOCAL_STORAGE_KEY_THEME = 'react-todo-app-theme';

const initialTasks: Task[] = [
  { id: '1', text: 'Learn React', completed: true, createdAt: Date.now() - 200000 },
  { id: '2', text: 'Learn TypeScript', completed: false, createdAt: Date.now() - 100000 },
  { id: '3', text: 'Build a To-Do App', completed: false, createdAt: Date.now() },
];

// --------- App Component ---------

function App() {
  // --- State --- 
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      return initialTasks;
    }
  });

  const [newTaskText, setNewTaskText] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // --- Effects --- 

  // Persist tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  // Handle dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // Focus edit input when modal opens
  useEffect(() => {
    if (isEditModalOpen && editInputRef.current) {
      editInputRef.current.focus();
      // Select text for easier editing
      editInputRef.current.select(); 
    }
  }, [isEditModalOpen]);

  // Handle Escape key for closing modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEditModal();
      }
    };

    if (isEditModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditModalOpen]); // Dependencies added to satisfy React Hook lint rules

  // --- Memoized Filtered and Sorted Tasks --- 

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Filtering
    if (filter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed);
    }

    // Searching
    if (searchTerm) {
      result = result.filter(task =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'date-desc':
          return b.createdAt - a.createdAt;
        case 'alpha-asc':
          return a.text.localeCompare(b.text);
        case 'alpha-desc':
          return b.text.localeCompare(a.text);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, filter, sort, searchTerm]);

  // --- Event Handlers --- 

  const handleAddTask = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const trimmedText = newTaskText.trim();
    if (trimmedText) {
      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Simple unique ID
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks(prevTasks => [newTask, ...prevTasks]); // Add to the beginning
      setNewTaskText('');
      addInputRef.current?.focus(); // Keep focus on add input
    }
  }, [newTaskText]);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setEditingTask({ id: task.id, text: task.text });
    setIsEditModalOpen(true);
    document.body.classList.add('modal-open');
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingTask(null);
    document.body.classList.remove('modal-open');
  }, []);

  const handleEditTaskTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, text: event.target.value });
    }
  };

  const saveEditedTask = useCallback(() => {
    if (editingTask && editingTask.text.trim()) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTask.id ? { ...task, text: editingTask.text.trim() } : task
        )
      );
      closeEditModal();
    } else if (editInputRef.current) {
        // Maybe add a visual cue that the input is empty/invalid
        editInputRef.current.focus();
    }
  }, [editingTask, closeEditModal]);

  const handleEditFormSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      saveEditedTask();
  };

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  // --- Render --- 

  return (
    <div className={`min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      <div className="container-narrow py-8 px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex-between mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">My To-Do List</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            name="theme-toggle"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </header>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6 sm:mb-8 flex gap-2 sm:gap-3">
          <input
            ref={addInputRef}
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            className="input-responsive flex-grow" // Use responsive input
            aria-label="New task description"
            name="new-task-input"
          />
          <button
            type="submit"
            className="btn btn-primary btn-responsive flex items-center justify-center gap-1 sm:gap-2" // Responsive button
            aria-label="Add new task"
            name="add-task-button"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>

        {/* Filter, Sort, Search Controls */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-1">
              <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-responsive pl-8 w-full" // Padding left for icon
                  aria-label="Search tasks"
                  name="search-input"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          </div>

          {/* Filter */}
          <div className="relative col-span-1 sm:col-span-1">
             <FilterIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
             <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="input-responsive appearance-none pl-8 w-full bg-white dark:bg-slate-800 cursor-pointer"
                aria-label="Filter tasks"
                name="filter-select"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
          </div>

          {/* Sort */}
           <div className="relative col-span-1 sm:col-span-1">
             <ArrowDownUp className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
             <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="input-responsive appearance-none pl-8 w-full bg-white dark:bg-slate-800 cursor-pointer"
                aria-label="Sort tasks"
                name="sort-select"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="alpha-asc">Alphabetical (A-Z)</option>
                <option value="alpha-desc">Alphabetical (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Task List */}
        <main className="flex-grow">
          {filteredAndSortedTasks.length > 0 ? (
            <ul className="space-y-3">
              {filteredAndSortedTasks.map((task) => (
                <li
                  key={task.id}
                  className={`card card-sm card-responsive flex items-center gap-3 theme-transition hover:shadow-md dark:hover:bg-slate-700 ${task.completed ? styles.completedTask : ''}`}
                  role="listitem"
                >
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${task.completed ? 'text-green-600 dark:text-green-400 focus:ring-green-500' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:ring-primary-500'}`}
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                    name={`toggle-complete-${task.id}`}
                  >
                    {task.completed ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-gray-400 dark:border-slate-500 rounded-sm"></div>}
                  </button>
                  <span className={`flex-grow text-sm sm:text-base break-words ${task.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-800 dark:text-slate-100'}`}>
                    {task.text}
                  </span>
                  <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 theme-transition"
                      aria-label={`Edit task: ${task.text}`}
                      name={`edit-task-${task.id}`}
                    >
                      <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 theme-transition"
                      aria-label={`Delete task: ${task.text}`}
                      name={`delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-500 dark:text-slate-400">
                {tasks.length === 0 ? "No tasks yet! Add one above." : "No tasks match your current filter or search."} 
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center text-xs text-gray-500 dark:text-slate-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </footer>

        {/* Edit Modal */}
        {isEditModalOpen && editingTask && (
          <div
            className="modal-backdrop fade-in theme-transition-bg"
            onClick={closeEditModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div
              className="modal-content slide-in theme-transition-all w-full max-w-md"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside content
            >
              <form onSubmit={handleEditFormSubmit}>
                <div className="modal-header">
                  <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
                  <button
                    type="button" // Prevent form submission
                    onClick={closeEditModal}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    aria-label="Close edit modal"
                    name="close-edit-modal-button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4">
                  <label htmlFor="edit-task-input" className="form-label">Task description:</label>
                  <input
                    ref={editInputRef}
                    id="edit-task-input"
                    type="text"
                    value={editingTask.text}
                    onChange={handleEditTaskTextChange}
                    className="input w-full"
                    aria-label="Edit task description"
                    name="edit-task-input"
                  />
                  {/* Basic validation feedback */}
                  {editingTask.text.trim() === '' && (
                      <p className="form-error">Task description cannot be empty.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button" // Prevent form submission
                    onClick={closeEditModal}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    name="cancel-edit-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!editingTask.text.trim()} // Disable if input is empty
                    name="save-edit-button"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for ChevronDown icon in selects (avoids direct lucide import within JSX conditionally)
const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default App;
