import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Edit, Moon, Sun, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  dueTime?: string;
}

const App: React.FC = () => {
  // State for tasks and dark mode
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskDueTime, setNewTaskDueTime] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDueTime, setEditDueTime] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check browser storage for user preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
        // Reset to empty array if parsing fails
        setTasks([]);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Add a new task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTaskText.trim() === '') return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: newTaskDueDate || undefined,
      dueTime: newTaskDueTime || undefined
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskDueDate('');
    setNewTaskDueTime('');
  };

  // Toggle task completion status
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Remove a task
  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Start editing a task
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setEditDueDate(task.dueDate || '');
    setEditDueTime(task.dueTime || '');
  };

  // Save edited task
  const saveEdit = () => {
    if (editingTaskId && editText.trim() !== '') {
      setTasks(tasks.map(task =>
        task.id === editingTaskId ? { 
          ...task, 
          text: editText,
          dueDate: editDueDate || undefined,
          dueTime: editDueTime || undefined
        } : task
      ));
      setEditingTaskId(null);
      setEditText('');
      setEditDueDate('');
      setEditDueTime('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
    setEditDueDate('');
    setEditDueTime('');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Format the date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Check if task is past due
  const isPastDue = (task: Task): boolean => {
    if (!task.dueDate) return false;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // If time is specified, include it in the comparison
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      dueDate.setHours(hours, minutes);
    } else {
      // If no time specified, set to end of day
      dueDate.setHours(23, 59, 59);
    }
    
    return now > dueDate && !task.completed;
  };

  // Close edit mode when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingTaskId) {
        cancelEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingTaskId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <div className="container-narrow py-8 px-4">
        <header className="flex-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Simple Todo App
          </h1>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 theme-transition"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? 
              <Sun className="h-5 w-5 text-yellow-500" /> : 
              <Moon className="h-5 w-5 text-gray-700" />
            }
          </button>
        </header>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-6">
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="input"
              aria-label="Task description"
            />
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <div className="flex items-center relative flex-grow">
                <Calendar className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="input pl-10"
                  aria-label="Due date"
                />
              </div>
              <div className="flex items-center relative flex-grow">
                <Clock className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={newTaskDueTime}
                  onChange={(e) => setNewTaskDueTime(e.target.value)}
                  className="input pl-10"
                  aria-label="Due time"
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary flex items-center justify-center"
                disabled={newTaskText.trim() === ''}
                aria-label="Add task"
              >
                <Plus className="h-5 w-5 mr-1" /> Add
              </button>
            </div>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No tasks yet. Add one above!
            </p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`card-sm ${task.completed ? 'bg-gray-50 dark:bg-slate-800/50' : isPastDue(task) ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'}`}
              >
                {editingTaskId === task.id ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input"
                      autoFocus
                      aria-label="Edit task"
                    />
                    <div className="flex space-x-2">
                      <div className="flex items-center relative flex-grow">
                        <Calendar className="absolute left-3 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="input pl-10"
                          aria-label="Due date"
                        />
                      </div>
                      <div className="flex items-center relative flex-grow">
                        <Clock className="absolute left-3 h-5 w-5 text-gray-400" />
                        <input
                          type="time"
                          value={editDueTime}
                          onChange={(e) => setEditDueTime(e.target.value)}
                          className="input pl-10"
                          aria-label="Due time"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <button 
                        onClick={saveEdit} 
                        className="btn bg-green-600 text-white hover:bg-green-700"
                        aria-label="Save changes"
                      >
                        <Check className="h-5 w-5 mr-1" /> Save
                      </button>
                      <button 
                        onClick={cancelEdit} 
                        className="btn bg-gray-500 text-white hover:bg-gray-600"
                        aria-label="Cancel editing"
                      >
                        <X className="h-5 w-5 mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex items-start sm:items-center">
                      <button 
                        onClick={() => toggleComplete(task.id)}
                        className={`p-2 flex-shrink-0 rounded-full ${task.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-400'}`}
                        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <div className="ml-3">
                        <p 
                          className={`${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : isPastDue(task) ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}
                        >
                          {task.text}
                        </p>
                        {(task.dueDate || task.dueTime) && (
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {task.dueDate && (
                              <div className="flex items-center mr-3">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(task.dueDate)}</span>
                              </div>
                            )}
                            {task.dueTime && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{task.dueTime}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0 sm:ml-auto">
                      <button 
                        onClick={() => startEditing(task)} 
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        aria-label="Edit task"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => removeTask(task.id)} 
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Task count */}
        {tasks.length > 0 && (
          <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
            <p>
              {tasks.filter(task => task.completed).length} completed / {tasks.length} total tasks
            </p>
            {tasks.filter(task => isPastDue(task)).length > 0 && (
              <p className="text-red-600 dark:text-red-400 mt-1">
                {tasks.filter(task => isPastDue(task)).length} overdue task(s)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-4 mt-8 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;