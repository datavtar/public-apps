import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Sun, Moon, Filter, ArrowUp, ArrowDown, ArrowDownUp, Gamepad } from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types --- interfaces, logic, functions, variables, and enums within App.tsx

type Priority = 'Low' | 'Medium' | 'High';
type FilterStatus = 'all' | 'active' | 'completed';
type SortOrder = 'default' | 'asc' | 'desc'; // asc/desc by creation date

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
}

const App: React.FC = () => {
  // --- State --- 
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState<string>('');
  const [editingTaskPriority, setEditingTaskPriority] = useState<Priority>('Medium');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      // Ensure localStorage value is strictly checked
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // --- Effects --- 

  // Load tasks from local storage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('gameDevTasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Basic validation to ensure it's an array
        if (Array.isArray(parsedTasks)) {
            // Further validation could be added here (e.g., check task structure)
            setTasks(parsedTasks);
        } else {
            console.error("Stored tasks data is not an array. Resetting.");
            setTasks(getDefaultTasks());
            localStorage.removeItem('gameDevTasks'); // Clear invalid data
        }
      } else {
        // Add initial sample data if no tasks are stored
        setTasks(getDefaultTasks());
      }
    } catch (error) {
      console.error("Failed to load or parse tasks from local storage:", error);
      // Initialize with default tasks if loading/parsing fails
      setTasks(getDefaultTasks());
      // Optionally clear potentially corrupted storage
      try {
          localStorage.removeItem('gameDevTasks');
      } catch (removeError) {
          console.error("Failed to remove corrupted tasks from storage:", removeError);
      }
    }
  }, []);

  // Save tasks to local storage when tasks change
  useEffect(() => {
    // Avoid saving the initial default state immediately if it wasn't loaded
    if (tasks.length > 0 || localStorage.getItem('gameDevTasks') !== null) {
        try {
          localStorage.setItem('gameDevTasks', JSON.stringify(tasks));
        } catch (error) {
          console.error("Failed to save tasks to local storage:", error);
          // Handle potential storage errors (e.g., quota exceeded)
        }
    }
  }, [tasks]);

  // Apply dark mode class and save preference
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle Escape key for modals and editing
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDeleteDialogOpen) {
          closeDeleteDialog();
        }
        if (editingTaskId) {
          cancelEdit();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
    // Add dependencies for functions called inside
  }, [isDeleteDialogOpen, editingTaskId, closeDeleteDialog, cancelEdit]);

  // --- Helper Functions --- 

  const getDefaultTasks = (): Task[] => [
    { id: crypto.randomUUID(), text: 'Fix player collision bug in Level 3', completed: false, createdAt: Date.now() - 100000, priority: 'High' },
    { id: crypto.randomUUID(), text: 'Design main menu UI mockups', completed: false, createdAt: Date.now() - 50000, priority: 'Medium' },
    { id: crypto.randomUUID(), text: 'Create concept art for new enemy type', completed: true, createdAt: Date.now() - 200000, priority: 'Medium' },
    { id: crypto.randomUUID(), text: 'Schedule level design review meeting', completed: false, createdAt: Date.now(), priority: 'Low' },
  ];

  // --- Event Handlers & Logic --- 

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // Ensure the value is one of the allowed Priority types
    const value = e.target.value;
    if (value === 'Low' || value === 'Medium' || value === 'High') {
        setNewTaskPriority(value);
    } else {
        console.warn('Invalid priority value selected:', value);
        setNewTaskPriority('Medium'); // Default fallback
    }
  };

  // Using useCallback ensures the function identity is stable unless dependencies change
  const addTask = useCallback(() => {
    const trimmedText = newTaskText.trim();
    if (trimmedText === '') {
        // Optionally provide user feedback about empty input
        console.warn("Attempted to add an empty task.");
        return;
    }
    
    const newTask: Task = {
      id: crypto.randomUUID(), // Ensure crypto.randomUUID is available
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
      priority: newTaskPriority,
    };

    // Update state using the functional form for reliability
    setTasks(prevTasks => { 
        // Ensure prevTasks is always an array before spreading
        const currentTasks = Array.isArray(prevTasks) ? prevTasks : [];
        return [...currentTasks, newTask];
    });
    
    // Reset input fields after adding
    setNewTaskText('');
    setNewTaskPriority('Medium'); 
  }, [newTaskText, newTaskPriority]); // Dependencies are correct

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent default form submission if inside a form
      e.preventDefault(); 
      addTask();
    }
  };

  const toggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const openDeleteDialog = (id: string) => {
    setTaskToDeleteId(id);
    setIsDeleteDialogOpen(true);
    // Add class to body to prevent background scroll
    document.body.classList.add('modal-open');
  };

  // Use useCallback for functions passed as props or used in effects
  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setTaskToDeleteId(null);
    document.body.classList.remove('modal-open');
  }, []);

  const confirmDeleteTask = useCallback(() => {
    if (taskToDeleteId) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDeleteId));
      closeDeleteDialog();
    }
  }, [taskToDeleteId, closeDeleteDialog]);

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
    setEditingTaskPriority(task.priority);
  };

  // Use useCallback for functions passed as props or used in effects
  const cancelEdit = useCallback(() => {
    setEditingTaskId(null);
    // Reset potentially edited values if needed, though not strictly necessary if saving clears them
    // setEditingTaskText('');
    // setEditingTaskPriority('Medium');
  }, []);

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingTaskText(e.target.value);
  };
  
  const handleEditPriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
     const value = e.target.value;
    if (value === 'Low' || value === 'Medium' || value === 'High') {
        setEditingTaskPriority(value);
    } else {
        console.warn('Invalid priority value selected during edit:', value);
        // Keep the existing priority or default
    }
  };

  // Use useCallback for functions passed as props or used in effects
  const saveEdit = useCallback(() => {
    const trimmedText = editingTaskText.trim();
    if (!editingTaskId || trimmedText === '') {
        // Provide feedback if trying to save an empty task
        console.warn("Cannot save empty task text.");
        return;
    }
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingTaskId ? { ...task, text: trimmedText, priority: editingTaskPriority } : task
      )
    );
    // Exit editing mode after saving
    cancelEdit(); 
  }, [editingTaskId, editingTaskText, editingTaskPriority, cancelEdit]);

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status: FilterStatus) => {
    // Ensure status is a valid FilterStatus
    if (['all', 'active', 'completed'].includes(status)) {
        setFilterStatus(status);
    } else {
        console.warn("Invalid filter status:", status);
    }
  };

  const handleSortChange = () => {
    setSortOrder(prev => {
      if (prev === 'default') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'default'; // Cycle back to default
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Filtering and Sorting --- 

  const filteredAndSortedTasks = useMemo(() => {
    // Ensure tasks is an array before filtering
    const currentTasks = Array.isArray(tasks) ? tasks : [];
    
    let filtered = currentTasks.filter(task => {
        // Defensive check for task structure
        const taskText = typeof task?.text === 'string' ? task.text : '';
        const taskCompleted = typeof task?.completed === 'boolean' ? task.completed : false;

        const matchesSearch = taskText.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
            filterStatus === 'all' || 
            (filterStatus === 'active' && !taskCompleted) || 
            (filterStatus === 'completed' && taskCompleted);
        return matchesSearch && matchesFilter;
    });

    if (sortOrder !== 'default') {
      // Use slice() to avoid mutating the filtered array directly if needed elsewhere,
      // although sort() modifies in place which is fine here as it's the final step.
      filtered.sort((a, b) => {
        // Defensive checks for createdAt
        const timeA = typeof a?.createdAt === 'number' ? a.createdAt : 0;
        const timeB = typeof b?.createdAt === 'number' ? b.createdAt : 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
    } 
    // Default order is the order after filtering (usually insertion order if not sorted)

    return filtered;
  }, [tasks, searchTerm, filterStatus, sortOrder]);

  // --- Style Helpers --- 

  const getPriorityClass = (priority: Priority): string => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      // Provide a default fallback style
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSortIcon = () => {
    // Consistent icon size
    const iconSize = 16;
    if (sortOrder === 'asc') return <ArrowUp size={iconSize} aria-hidden="true" />; // Indicate ascending sort
    if (sortOrder === 'desc') return <ArrowDown size={iconSize} aria-hidden="true" />; // Indicate descending sort
    return <ArrowDownUp size={iconSize} aria-hidden="true" />; // Indicate default/unsorted state
  };

  // --- Render --- 
  return (
    <div className={`min-h-screen flex flex-col theme-transition-bg ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-[var(--z-sticky)] theme-transition-all">
        <div className="container-wide mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Gamepad size={28} aria-hidden="true" />
            <span>GameDev Task Tracker</span>
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch" 
            aria-checked={isDarkMode}
            name="theme-toggle"
          >
            {isDarkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        {/* Add Task Form - Using form element for better semantics */}
        <form 
            onSubmit={(e) => { 
                e.preventDefault(); // Prevent default form submission
                addTask(); 
            }}
            className="card mb-6 card-responsive theme-transition-all"
            aria-labelledby="add-task-heading"
         >
          <h2 id="add-task-heading" className="sr-only">Add New Task</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTaskText}
              onChange={handleInputChange}
              // Removed onKeyDown here, using form onSubmit instead
              placeholder="Enter new task (e.g., Implement enemy AI)"
              className="input input-responsive flex-grow"
              aria-label="New task description"
              name="new-task-text"
              required // Basic HTML5 validation
            />
            <div className="flex gap-3 flex-col sm:flex-row sm:items-center flex-shrink-0">
              <select
                value={newTaskPriority}
                onChange={handlePriorityChange}
                className="input input-responsive w-full sm:w-auto"
                aria-label="New task priority"
                name="new-task-priority"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <button
                type="submit" // Changed to type submit
                className="btn btn-primary btn-responsive flex-center gap-1 w-full sm:w-auto"
                aria-label="Add new task"
                name="add-task-button"
              >
                <Plus size={18} aria-hidden="true" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </form>

        {/* Controls: Search, Filter, Sort */}
        <div className="card mb-6 card-responsive theme-transition-all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Search */}
                <div className="relative md:col-span-1">
                    <label htmlFor="search-tasks" className="sr-only">Search Tasks</label>
                    <input
                        id="search-tasks"
                        type="search" // Use type search for semantics
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search tasks..."
                        className="input input-responsive pl-10 w-full"
                        aria-label="Search tasks by description"
                        name="search-term"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} aria-hidden="true" />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-full"
                            aria-label="Clear search"
                            name="clear-search"
                            type="button"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap md:col-span-1" role="group" aria-label="Filter tasks by status">
                    {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`btn btn-sm capitalize ${filterStatus === status ? 'btn-primary' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                            aria-pressed={filterStatus === status}
                            name={`filter-${status}`}
                            type="button"
                        >
                           {status}
                        </button>
                    ))}
                </div>

                {/* Sort Button */}
                <div className="flex justify-center md:justify-end md:col-span-1">
                    <button
                        onClick={handleSortChange}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 btn-sm flex-center gap-1"
                        aria-label={`Sort by creation date: ${sortOrder === 'asc' ? 'ascending' : sortOrder === 'desc' ? 'descending' : 'default order'}`}
                        name="sort-toggle"
                        type="button"
                    >
                        {getSortIcon()}
                        Sort
                    </button>
                </div>
            </div>
        </div>


        {/* Task List */}
        <div className="space-y-3" role="list" aria-label="Task list">
          {filteredAndSortedTasks.length > 0 ? (
            filteredAndSortedTasks.map((task, index) => (
              <div
                key={task?.id ?? index} // Fallback key if id is missing
                className={`card card-sm theme-transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 ${task?.completed ? 'opacity-60' : ''}`}
                role="listitem"
                aria-labelledby={`task-text-${task?.id}`}
              >
                {editingTaskId === task?.id ? (
                  // --- Edit View --- Use form for better structure
                  <form 
                    className="flex-grow w-full flex flex-col sm:flex-row gap-2 items-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveEdit();
                    }}
                  >
                    <label htmlFor={`edit-task-${task.id}`} className="sr-only">Edit task description</label>
                    <input
                      id={`edit-task-${task.id}`}
                      type="text"
                      value={editingTaskText}
                      onChange={handleEditInputChange}
                      // Removed onKeyDown, using form submit
                      className="input input-responsive flex-grow"
                      aria-label="Edit task description"
                      name="edit-task-text"
                      autoFocus
                      required
                    />
                    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                      <label htmlFor={`edit-priority-${task.id}`} className="sr-only">Edit task priority</label>
                      <select
                        id={`edit-priority-${task.id}`}
                        value={editingTaskPriority}
                        onChange={handleEditPriorityChange}
                        className="input input-sm w-full sm:w-auto"
                        aria-label="Edit task priority"
                        name="edit-task-priority"
                       >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                       </select>
                      <button type="submit" className="btn btn-sm btn-primary flex-center gap-1" aria-label="Save changes" name="save-edit">
                        <Check size={16} aria-hidden="true" /> Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 flex-center gap-1" aria-label="Cancel editing" name="cancel-edit">
                        <X size={16} aria-hidden="true" /> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // --- Read View --- Ensure task exists before accessing properties
                  task && (
                      <>
                        <button 
                            onClick={() => toggleComplete(task.id)} 
                            className={`flex-shrink-0 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${task.completed ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 focus:ring-green-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-slate-700 focus:ring-primary-500'}`}
                            aria-label={task.completed ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`}
                            role="checkbox" 
                            aria-checked={task.completed}
                            name={`toggle-complete-${task.id}`}
                            type="button"
                        >
                          <Check size={18} aria-hidden="true" />
                        </button>
                        <div className="flex-grow min-w-0 mr-auto">
                          <span id={`task-text-${task.id}`} className={`block text-sm sm:text-base break-words ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-slate-100'}`}>
                            {task.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                          <span className={`badge text-xs ${getPriorityClass(task.priority)}`} aria-label={`Priority: ${task.priority}`}>{task.priority}</span>
                          <button
                            onClick={() => startEditing(task)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            aria-label={`Edit task '${task.text}'`}
                            name={`edit-button-${task.id}`}
                            type="button"
                          >
                            <Edit size={16} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(task.id)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                            aria-label={`Delete task '${task.text}'`}
                            name={`delete-button-${task.id}`}
                            type="button"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </>
                  )
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8">
              {searchTerm || filterStatus !== 'all' 
                ? 'No tasks match your current filters or search.' 
                : 'No tasks yet. Add a new task to get started!'}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && taskToDeleteId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[var(--z-modal-backdrop)] theme-transition-all"
          onClick={closeDeleteDialog} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <div
            className="modal-content theme-transition-all w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            role="document" // Added role document for better structure
          >
            <div className="modal-header">
              <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button 
                  onClick={closeDeleteDialog} 
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-sm"
                  aria-label="Close modal"
                  name="close-delete-modal"
                  type="button"
               >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div id="delete-modal-description" className="mt-2">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              {/* Display task text being deleted, ensure task exists */}
              {tasks.find(t => t?.id === taskToDeleteId) && (
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-300 break-words">
                  Task: "{tasks.find(t => t.id === taskToDeleteId)?.text}"
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={closeDeleteDialog}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                aria-label="Cancel deletion"
                name="cancel-delete"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                aria-label="Confirm deletion"
                name="confirm-delete"
                type="button"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 mt-auto theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
