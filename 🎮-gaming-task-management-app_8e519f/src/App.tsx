import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Sun, Moon, Filter, ArrowUp, ArrowDown, ChevronDown, ArrowDownUp, Gamepad } from 'lucide-react'; // Added ArrowDownUp and Gamepad
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
        setTasks(JSON.parse(storedTasks));
      } else {
        // Add initial sample data if no tasks are stored
        setTasks([
          { id: crypto.randomUUID(), text: 'Fix player collision bug in Level 3', completed: false, createdAt: Date.now() - 100000, priority: 'High' },
          { id: crypto.randomUUID(), text: 'Design main menu UI mockups', completed: false, createdAt: Date.now() - 50000, priority: 'Medium' },
          { id: crypto.randomUUID(), text: 'Create concept art for new enemy type', completed: true, createdAt: Date.now() - 200000, priority: 'Medium' },
          { id: crypto.randomUUID(), text: 'Schedule level design review meeting', completed: false, createdAt: Date.now(), priority: 'Low' },
        ]);
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
      // Initialize with empty or default tasks if loading fails
      setTasks([]);
    }
  }, []);

  // Save tasks to local storage when tasks change
  useEffect(() => {
    try {
      localStorage.setItem('gameDevTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to local storage:", error);
    }
  }, [tasks]);

  // Apply dark mode class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle Escape key for modals
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
  }, [isDeleteDialogOpen, editingTaskId]);

  // --- Event Handlers & Logic --- 

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNewTaskPriority(e.target.value as Priority);
  };

  const addTask = useCallback(() => {
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
      priority: newTaskPriority,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskText('');
    setNewTaskPriority('Medium'); // Reset priority after adding
  }, [newTaskText, newTaskPriority]);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
    document.body.classList.add('modal-open');
  };

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

  const cancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingTaskText('');
    setEditingTaskPriority('Medium');
  }, []);

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingTaskText(e.target.value);
  };
  
  const handleEditPriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEditingTaskPriority(e.target.value as Priority);
  };

  const saveEdit = useCallback(() => {
    if (!editingTaskId || editingTaskText.trim() === '') return;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingTaskId ? { ...task, text: editingTaskText.trim(), priority: editingTaskPriority } : task
      )
    );
    cancelEdit();
  }, [editingTaskId, editingTaskText, editingTaskPriority, cancelEdit]);

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
  };

  const handleSortChange = () => {
    setSortOrder(prev => {
      if (prev === 'default') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'default';
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Filtering and Sorting --- 

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && !task.completed) || 
        (filterStatus === 'completed' && task.completed);
      return matchesSearch && matchesFilter;
    });

    if (sortOrder !== 'default') {
      filtered.sort((a, b) => {
        return sortOrder === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
      });
    }
    // Keep original order if sortOrder is 'default'

    return filtered;
  }, [tasks, searchTerm, filterStatus, sortOrder]);

  const getPriorityClass = (priority: Priority): string => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp size={16} />;
    if (sortOrder === 'desc') return <ArrowDown size={16} />;
    return <ArrowDownUp size={16} />; // Default icon or indication
  };

  // --- Render --- 
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 theme-transition-all flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-[var(--z-sticky)] theme-transition-all">
        <div className="container-wide mx-auto py-3 px-4 sm:px-6 lg:px-8 flex-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Gamepad size={28} />
            <span>GameDev Task Tracker</span>
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch" aria-checked={isDarkMode}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        {/* Add Task Form */}
        <div className="card mb-6 card-responsive theme-transition-all">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTaskText}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Enter new task (e.g., Implement enemy AI)"
              className="input input-responsive flex-grow"
              aria-label="New task description"
            />
            <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
              <select
                value={newTaskPriority}
                onChange={handlePriorityChange}
                className="input input-responsive w-full sm:w-auto"
                aria-label="New task priority"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <button
                onClick={addTask}
                className="btn btn-primary btn-responsive flex-center gap-1 w-full sm:w-auto"
                aria-label="Add new task"
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls: Search, Filter, Sort */}
        <div className="card mb-6 card-responsive theme-transition-all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search tasks..."
                        className="input input-responsive pl-10"
                        aria-label="Search tasks"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Clear search"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap" role="group" aria-label="Filter tasks">
                    {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`btn btn-sm capitalize ${filterStatus === status ? 'btn-primary' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                            aria-pressed={filterStatus === status}
                        >
                           {status}
                        </button>
                    ))}
                </div>

                {/* Sort Button */}
                <div className="flex justify-center md:justify-end">
                    <button
                        onClick={handleSortChange}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 btn-sm flex-center gap-1"
                        aria-label={`Sort by creation date ${sortOrder === 'asc' ? 'ascending' : sortOrder === 'desc' ? 'descending' : 'default order'}`}
                    >
                        {getSortIcon()}
                        Sort
                    </button>
                </div>
            </div>
        </div>


        {/* Task List */}
        <div className="space-y-3">
          {filteredAndSortedTasks.length > 0 ? (
            filteredAndSortedTasks.map(task => (
              <div
                key={task.id}
                className={`card card-sm theme-transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 ${task.completed ? 'opacity-60' : ''}`}
                role="listitem"
              >
                {editingTaskId === task.id ? (
                  // --- Edit View ---
                  <div className="flex-grow w-full flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="text"
                      value={editingTaskText}
                      onChange={handleEditInputChange}
                      onKeyDown={handleEditKeyDown}
                      className="input input-responsive flex-grow"
                      aria-label="Edit task description"
                      autoFocus
                    />
                    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                      <select
                        value={editingTaskPriority}
                        onChange={handleEditPriorityChange}
                        className="input input-sm w-full sm:w-auto"
                        aria-label="Edit task priority"
                       >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                       </select>
                      <button onClick={saveEdit} className="btn btn-sm btn-primary flex-center gap-1" aria-label="Save changes">
                        <Check size={16} /> Save
                      </button>
                      <button onClick={cancelEdit} className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 flex-center gap-1" aria-label="Cancel editing">
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- Read View ---
                  <>
                    <button 
                        onClick={() => toggleComplete(task.id)} 
                        className={`flex-shrink-0 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${task.completed ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 focus:ring-green-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-slate-700 focus:ring-primary-500'}`}
                        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                        role="checkbox" aria-checked={task.completed}
                    >
                      <Check size={18} />
                    </button>
                    <div className="flex-grow min-w-0 mr-auto">
                      <span className={`block text-sm sm:text-base ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-slate-100'}`}>
                        {task.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                      <span className={`badge text-xs ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                      <button
                        onClick={() => startEditing(task)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        aria-label="Edit task"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(task.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8">
              No tasks found. {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Add a new task to get started!'}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && taskToDeleteId && (
        <div
          className="modal-backdrop theme-transition-all"
          onClick={closeDeleteDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="modal-content theme-transition-all"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="modal-header">
              <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button onClick={closeDeleteDialog} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              {/* Optional: Display task text being deleted */}
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-300 break-words">
                {tasks.find(t => t.id === taskToDeleteId)?.text}
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={closeDeleteDialog}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                aria-label="Confirm deletion"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 mt-8 theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
