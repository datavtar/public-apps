import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Trash2, Edit, Check, X, Sun, Moon, Filter, Search } from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types --- Interfaces ---
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Timestamp for potential sorting
}

type FilterType = 'all' | 'active' | 'completed';

// --- Constants ---
const LOCAL_STORAGE_KEY_TASKS = 'todoAppTasks';
const LOCAL_STORAGE_KEY_THEME = 'todoAppTheme';

// --- Initial Data ---
const getInitialTasks = (): Task[] => {
  try {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: crypto.randomUUID(), text: 'Learn React', completed: true, createdAt: Date.now() - 200000 },
      { id: crypto.randomUUID(), text: 'Build a To-Do App', completed: false, createdAt: Date.now() - 100000 },
      { id: crypto.randomUUID(), text: 'Add Dark Mode', completed: false, createdAt: Date.now() },
    ];
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Fallback to system preference if no saved theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    console.error('Error loading theme from localStorage:', error);
    return 'light'; // Default to light theme on error
  }
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  // Update document class and save theme preference
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  // Focus edit input when modal opens
  useEffect(() => {
    if (editingTask && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select(); // Select text for easier editing
    }
  }, [editingTask]);

  // Handle Escape key to close edit modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingTask) {
        closeEditModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingTask]); // Rerun when editingTask changes

  // --- Event Handlers ---
  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = newTaskText.trim();
    if (trimmedText) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks(prevTasks => [newTask, ...prevTasks]); // Add to the beginning
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
    // Close modal if the deleted task was being edited
    if (editingTask?.id === id) {
        closeEditModal();
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditedText(task.text);
    document.body.classList.add('modal-open');
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEditedText = editedText.trim();
    if (editingTask && trimmedEditedText) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTask.id ? { ...task, text: trimmedEditedText } : task
        )
      );
      closeEditModal();
    }
  };

  const closeEditModal = useCallback(() => {
    setEditingTask(null);
    setEditedText('');
    document.body.classList.remove('modal-open');
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // --- Computed Values ---
  const filteredTasks = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tasks
      .filter(task => {
        // Search filter
        if (searchTerm && !task.text.toLowerCase().includes(lowerCaseSearchTerm)) {
          return false;
        }
        // Status filter
        switch (filter) {
          case 'active':
            return !task.completed;
          case 'completed':
            return task.completed;
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => a.createdAt - b.createdAt); // Sort by creation time, oldest first
  }, [tasks, filter, searchTerm]);

  const activeTaskCount = useMemo(() => tasks.filter(task => !task.completed).length, [tasks]);

  // --- Render ---
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-primary-600 dark:bg-slate-900 text-white p-4 shadow-md theme-transition-bg">
        <div className="container-narrow flex-between">
          <h1 className="text-2xl font-bold">Minimal To-Do</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 dark:focus:ring-offset-slate-900 focus:ring-white theme-transition"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            role="switch"
            aria-checked={theme === 'dark'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow py-6 md:py-8">
        <div className="card card-responsive theme-transition-all">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              ref={inputRef}
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText((e.target as HTMLInputElement).value)}
              placeholder="What needs to be done?"
              className="input input-responsive flex-grow"
              aria-label="New task description"
              name="newTask"
            />
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex-center gap-2 flex-shrink-0"
              aria-label="Add new task"
              name="addTask"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </form>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-4 border-t border-gray-200 dark:border-slate-700 pt-4 theme-transition-all">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400 mr-2">Show:</span>
                {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`btn btn-sm ${filter === f ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'} theme-transition`}
                    aria-pressed={filter === f}
                    name={`filter-${f}`}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
                ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                placeholder="Search tasks..."
                className="input input-sm pl-8 w-full sm:w-48 md:w-56"
                aria-label="Search tasks"
                name="searchTask"
              />
              <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500 dark:text-slate-400 py-4 theme-transition-text">
                {tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks match your current filter/search.'}
              </p>
            )}
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-md theme-transition-all ${task.completed ? 'bg-gray-50 dark:bg-slate-700 opacity-70' : 'bg-white dark:bg-slate-800 shadow-sm'}`}
                role="listitem"
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${task.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-slate-500'} flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 theme-transition-all`}
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                    aria-pressed={task.completed}
                    name={`toggle-${task.id}`}
                  >
                    {task.completed && <Check size={14} className="text-white" />}
                  </button>
                  <span
                    className={`truncate ${task.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-800 dark:text-slate-100'} theme-transition-text`}
                    title={task.text}
                  >
                    {task.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={`Edit task: ${task.text}`}
                    name={`edit-${task.id}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 theme-transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Delete task: ${task.text}`}
                    name={`delete-${task.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Task Summary */}
          {tasks.length > 0 && (
             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400 flex justify-between items-center theme-transition-all">
              <span>{activeTaskCount} {activeTaskCount === 1 ? 'item' : 'items'} left</span>
              {tasks.length > activeTaskCount && (
                <button 
                  onClick={() => setTasks(prev => prev.filter(task => !task.completed))}
                  className="text-sm text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 theme-transition"
                >
                   Clear completed ({tasks.length - activeTaskCount})
                 </button>
              )}
            </div>
           )}

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900 theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="modal-backdrop fade-in"
          onClick={closeEditModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="modal-content slide-in theme-transition-all" // Apply theme transition to modal content
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="modal-header">
              <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white theme-transition-text">Edit Task</h3>
              <button
                 onClick={closeEditModal}
                 className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                 aria-label="Close edit modal"
                 name="closeEditModal"
               >
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="mt-4">
                <label htmlFor="editTaskInput" className="form-label theme-transition-text">Task Description:</label>
                <input
                  ref={editInputRef}
                  id="editTaskInput"
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText((e.target as HTMLInputElement).value)}
                  className="input theme-transition-all" // Apply theme transition to input
                  required
                  name="editedTaskText"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 theme-transition-all"
                  name="cancelEdit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary theme-transition-all"
                  name="saveEdit"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
