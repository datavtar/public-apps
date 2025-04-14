import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Plus, Trash2, Edit, Check, Search, ArrowUp, ArrowDown, Sun, Moon, Filter, X } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Store timestamp for sorting
}

type FilterType = 'all' | 'active' | 'completed';
type SortOrder = 'asc' | 'desc';

// Initial data function
const getInitialTasks = (): Task[] => {
  try {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks) as Task[];
      // Basic validation
      if (Array.isArray(parsedTasks) && parsedTasks.every(task => typeof task.id === 'string' && typeof task.text === 'string' && typeof task.completed === 'boolean' && typeof task.createdAt === 'number')) {
        return parsedTasks;
      }
    }
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
  }
  // Default initial tasks if localStorage is empty or invalid
  return [
    { id: crypto.randomUUID(), text: 'Learn React', completed: true, createdAt: Date.now() - 200000 },
    { id: crypto.randomUUID(), text: 'Build To-Do App', completed: false, createdAt: Date.now() - 100000 },
    { id: crypto.randomUUID(), text: 'Deploy App', completed: false, createdAt: Date.now() },
  ];
};

const getInitialTheme = (): boolean => {
  try {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    // Fallback to system preference if no saved theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.error('Error loading theme from localStorage:', error);
    return false; // Default to light mode on error
  }
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Default: newest first
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState<string>('');

  // --- Effects --- //

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  // Save theme preference to localStorage and update DOM
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [isDarkMode]);

  // Handle Escape key for closing modal
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (editingTask) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingTask]); // Rerun when editingTask changes

  // --- Task Management Functions --- //

  const handleAddTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = newTaskText.trim();
    if (trimmedText) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks(prevTasks => [newTask, ...prevTasks]); // Add new task to the beginning
      setNewTaskText('');
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
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditText(task.text);
    document.body.classList.add('modal-open');
  };

  const handleUpdateTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingTask && editText.trim()) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTask.id ? { ...task, text: editText.trim() } : task
        )
      );
      handleCloseModal();
    }
  };

  const handleCloseModal = useCallback(() => {
    setEditingTask(null);
    setEditText('');
    document.body.classList.remove('modal-open');
  }, []);

  // --- Input Handlers --- //

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as FilterType);
  };

  const handleSortChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Filtering and Sorting Logic --- //

  const filteredTasks = tasks
    .filter(task => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && !task.completed) || 
        (filter === 'completed' && task.completed);
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.createdAt - b.createdAt; // Oldest first
      }
      return b.createdAt - a.createdAt; // Newest first
    });

  // --- Render --- //

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appBackground}`}>
      {/* Header */}
      <header className="bg-primary-600 dark:bg-slate-900 text-white p-4 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-narrow mx-auto flex-between">
          <h1 className="text-xl sm:text-2xl font-bold">Simple To-Do List</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 dark:focus:ring-offset-slate-900"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={isDarkMode}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow mx-auto px-4 py-6 sm:py-8">
        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6 sm:mb-8 card card-responsive theme-transition-all">
          <label htmlFor="newTask" className="form-label text-lg font-semibold mb-2">Add New Task</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="newTask"
              type="text"
              value={newTaskText}
              onChange={handleInputChange}
              placeholder="What needs to be done?"
              className="input input-responsive flex-grow"
              aria-label="New task input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex-center w-full sm:w-auto"
              aria-label="Add new task"
              disabled={!newTaskText.trim()}
            >
              <Plus size={18} className="mr-1" /> Add Task
            </button>
          </div>
        </form>

        {/* Filters and Sorting */}
        <div className="mb-6 sm:mb-8 card card-responsive theme-transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div className="form-group reset-spacing">
              <label htmlFor="searchTask" className="form-label flex-start gap-1"> <Search size={16}/> Search</label>
              <input
                id="searchTask"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="input input-responsive"
                aria-label="Search tasks"
              />
            </div>
            {/* Filter */}
            <div className="form-group reset-spacing">
              <label htmlFor="filterTasks" className="form-label flex-start gap-1"> <Filter size={16}/> Filter</label>
              <select
                id="filterTasks"
                value={filter}
                onChange={handleFilterChange}
                className="input input-responsive appearance-none bg-no-repeat bg-right pr-8"
                aria-label="Filter tasks"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em', backgroundPosition: 'right 0.5rem center'}}
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {/* Sort */}
            <div className="form-group reset-spacing">
              <button
                onClick={handleSortChange}
                className="btn btn-responsive bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 w-full flex-center"
                aria-label={`Sort by creation date ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                Sort by Date
                {sortOrder === 'asc' ? <ArrowUp size={18} className="ml-2" /> : <ArrowDown size={18} className="ml-2" />}
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`card card-responsive theme-transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${task.completed ? styles.completedTask : ''}`}
                role="listitem"
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    id={`task-${task.id}`}
                    className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 dark:border-slate-600 focus:ring-primary-500 dark:bg-slate-700 dark:checked:bg-primary-500 transition duration-150 ease-in-out cursor-pointer"
                    aria-labelledby={`task-label-${task.id}`}
                  />
                  <label 
                    htmlFor={`task-${task.id}`} 
                    id={`task-label-${task.id}`} 
                    className={`flex-grow truncate cursor-pointer ${task.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}
                  >
                    {task.text}
                  </label>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-slate-700 sm:border-none -mx-4 sm:mx-0 px-4 sm:px-0">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 flex-center"
                    aria-label={`Edit task: ${task.text}`}
                    title="Edit Task"
                  >
                    <Edit size={16} /> <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex-center"
                    aria-label={`Delete task: ${task.text}`}
                    title="Delete Task"
                  >
                    <Trash2 size={16} /> <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-10 card card-responsive theme-transition-all">
              <p className="text-lg">No tasks found.</p>
              <p className="text-sm mt-2">Try adjusting your filters or add a new task!</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingTask && (
        <div
          className="modal-backdrop fade-in theme-transition-all"
          onClick={handleCloseModal} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="modal-content slide-in theme-transition-all w-full max-w-lg" // Increased max-width
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <form onSubmit={handleUpdateTask}>
              <div className="modal-header">
                <h3 id="edit-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Task
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mt-4 mb-6">
                <label htmlFor="editTaskInput" className="form-label">Task Text</label>
                <input
                  id="editTaskInput"
                  type="text"
                  value={editText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                  className="input input-lg w-full" // Larger input for editing
                  required
                  aria-label="Edit task input"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-center"
                  disabled={!editText.trim() || editText.trim() === editingTask.text}
                >
                  <Check size={18} className="mr-1" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 dark:text-slate-400 py-4 mt-8 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
