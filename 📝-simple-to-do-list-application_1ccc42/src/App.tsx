import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Trash2, X, Sun, Moon, Filter, Bell, Clock, BellOff, AlarmClock } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define Task interface with reminder capabilities
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  reminder?: {
    date: string;
    time: string;
    triggered: boolean;
    snoozed: boolean;
  };
}

// Define notification interface
interface Notification {
  id: string;
  taskId: string;
  taskTitle: string;
  createdAt: string;
  dismissed: boolean;
}

// Define filter type
type FilterType = 'all' | 'active' | 'completed';

const App: React.FC = () => {
  // State for tasks and new task input
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [activeReminders, setActiveReminders] = useState<number>(0);
  
  // Refs for the notification interval
  const checkInterval = useRef<number | null>(null);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    // Count active reminders
    const activeCount = tasks.filter(task => 
      task.reminder && 
      !task.reminder.triggered && 
      !task.completed && 
      new Date(`${task.reminder.date}T${task.reminder.time}`).getTime() > Date.now()
    ).length;
    setActiveReminders(activeCount);
  }, [tasks]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Set up notification checker
  useEffect(() => {
    // Check for due reminders every minute
    const checkReminders = () => {
      const now = new Date();
      const tasksWithDueReminders = tasks.filter(task => 
        task.reminder && 
        !task.reminder.triggered && 
        !task.completed && 
        new Date(`${task.reminder.date}T${task.reminder.time}`).getTime() <= now.getTime()
      );

      // Create notifications for tasks with due reminders
      if (tasksWithDueReminders.length > 0) {
        const newNotifications = tasksWithDueReminders.map(task => ({
          id: `notif-${Date.now()}-${task.id}`,
          taskId: task.id,
          taskTitle: task.title,
          createdAt: new Date().toISOString(),
          dismissed: false
        }));

        // Mark reminders as triggered
        const updatedTasks = tasks.map(task => {
          if (tasksWithDueReminders.some(dueTask => dueTask.id === task.id)) {
            return {
              ...task,
              reminder: {
                ...task.reminder!,
                triggered: true
              }
            };
          }
          return task;
        });

        setTasks(updatedTasks);
        setNotifications(prev => [...prev, ...newNotifications]);
        
        // Show the first new notification
        if (newNotifications.length > 0 && !showNotification) {
          setCurrentNotification(newNotifications[0]);
          setShowNotification(true);
        }
      }
    };

    // Initial check
    checkReminders();

    // Set up interval for checking reminders
    const intervalId = window.setInterval(checkReminders, 60000); // Check every minute
    checkInterval.current = intervalId as unknown as number;

    // Clean up interval on unmount
    return () => {
      if (checkInterval.current !== null) {
        window.clearInterval(checkInterval.current);
      }
    };
  }, [tasks, showNotification]);

  // Add a new task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    // Also remove any notifications for this task
    setNotifications(notifications.filter(notif => notif.taskId !== id));
  };

  // Clear all completed tasks
  const clearCompletedTasks = () => {
    const completedTaskIds = tasks.filter(task => task.completed).map(task => task.id);
    setTasks(tasks.filter(task => !task.completed));
    // Also remove notifications for completed tasks
    setNotifications(notifications.filter(notif => !completedTaskIds.includes(notif.taskId)));
  };

  // Set reminder for a task
  const setReminder = (id: string, date: string, time: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        reminder: {
          date,
          time,
          triggered: false,
          snoozed: false
        } 
      } : task
    ));
  };

  // Remove reminder from a task
  const removeReminder = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        reminder: undefined 
      } : task
    ));
  };

  // Dismiss current notification
  const dismissNotification = () => {
    if (currentNotification) {
      setNotifications(notifications.map(notif => 
        notif.id === currentNotification.id ? { ...notif, dismissed: true } : notif
      ));
      setShowNotification(false);
      setCurrentNotification(null);
      
      // Check if there are more unread notifications
      const nextNotification = notifications.find(notif => !notif.dismissed && notif.id !== currentNotification.id);
      if (nextNotification) {
        setTimeout(() => {
          setCurrentNotification(nextNotification);
          setShowNotification(true);
        }, 300); // Small delay for better UX
      }
    }
  };

  // Snooze current notification
  const snoozeNotification = () => {
    if (currentNotification) {
      // Find the task and update its reminder to 5 minutes from now
      const taskToUpdate = tasks.find(task => task.id === currentNotification.taskId);
      
      if (taskToUpdate) {
        const snoozeTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        const hours = snoozeTime.getHours().toString().padStart(2, '0');
        const minutes = snoozeTime.getMinutes().toString().padStart(2, '0');
        
        setTasks(tasks.map(task => 
          task.id === taskToUpdate.id ? {
            ...task,
            reminder: {
              date: snoozeTime.toISOString().split('T')[0],
              time: `${hours}:${minutes}`,
              triggered: false,
              snoozed: true
            }
          } : task
        ));
        
        // Mark current notification as dismissed
        setNotifications(notifications.map(notif => 
          notif.id === currentNotification.id ? { ...notif, dismissed: true } : notif
        ));
        setShowNotification(false);
        setCurrentNotification(null);
        
        // Check if there are more unread notifications
        const nextNotification = notifications.find(notif => !notif.dismissed && notif.id !== currentNotification.id);
        if (nextNotification) {
          setTimeout(() => {
            setCurrentNotification(nextNotification);
            setShowNotification(true);
          }, 300); // Small delay for better UX
        }
      }
    }
  };

  // Handle keydown for notification modal (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNotification) {
        dismissNotification();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotification, currentNotification, notifications]);

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all' filter
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get task counts
  const activeTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Get minimum date for reminder (today)
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 theme-transition">
      <div className="container-narrow py-8">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex-between mb-4">
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              My Tasks
            </h1>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 theme-transition"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Task stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-title">Active Tasks</div>
              <div className="stat-value">{activeTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Completed</div>
              <div className="stat-value">{completedTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Reminders</div>
              <div className="stat-value flex items-center gap-1">
                {activeReminders}
                <Bell size={16} className="text-primary-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              aria-label="New task title"
            />
            <button
              type="submit"
              className="btn btn-primary flex-center gap-1"
              disabled={newTaskTitle.trim() === ''}
              aria-label="Add task"
            >
              <Plus size={18} />
              <span className="responsive-hide">Add</span>
            </button>
          </div>
        </form>

        {/* Filter Controls */}
        <div className="flex-between mb-4">
          <div className="flex items-center gap-1">
            <Filter size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
          </div>
          <div className="flex rounded-md shadow-sm bg-white dark:bg-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-l-md ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-sm ${filter === 'active' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-sm rounded-r-md ${filter === 'completed' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="card mb-4">
          {filteredTasks.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredTasks.map((task) => (
                <li key={task.id} className={`py-3 px-2 ${styles.taskItem}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex-center border ${task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed && <Check size={14} />}
                    </button>
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'}`}>
                      {task.title}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* Reminder section */}
                  <div className="ml-9 text-sm">
                    {task.reminder ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-1 text-primary-500 dark:text-primary-400">
                          <AlarmClock size={14} />
                          <span>
                            {formatDate(task.reminder.date)} at {formatTime(task.reminder.time)}
                            {task.reminder.snoozed && 
                              <span className="ml-1 text-xs text-yellow-500 dark:text-yellow-400">(Snoozed)</span>
                            }
                          </span>
                        </div>
                        <button 
                          onClick={() => removeReminder(task.id)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full"
                          aria-label="Remove reminder"
                        >
                          <span className="flex items-center gap-1">
                            <BellOff size={12} />
                            Remove
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex gap-2">
                          <input 
                            type="date" 
                            className="input-sm px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                            min={getTodayString()}
                            aria-label="Set reminder date"
                          />
                          <input 
                            type="time" 
                            className="input-sm px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                            aria-label="Set reminder time"
                          />
                        </div>
                        <button 
                          onClick={(e) => {
                            const dateInput = e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
                            const timeInput = e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement;
                            
                            if (dateInput?.value && timeInput?.value) {
                              setReminder(task.id, dateInput.value, timeInput.value);
                            }
                          }}
                          className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-primary-200 dark:hover:bg-primary-800"
                          aria-label="Set reminder"
                        >
                          <Bell size={12} />
                          Set Reminder
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-slate-400">
              <div className="flex-center mb-3">
                {filter === 'all' && <X size={32} />}
                {filter === 'active' && <Check size={32} />}
                {filter === 'completed' && <Check size={32} />}
              </div>
              {filter === 'all' && <p>No tasks yet. Add a task to get started!</p>}
              {filter === 'active' && <p>No active tasks.</p>}
              {filter === 'completed' && <p>No completed tasks.</p>}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {tasks.length > 0 && (
          <div className="flex-between">
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {activeTasks} {activeTasks === 1 ? 'task' : 'tasks'} left
            </span>
            <button
              onClick={clearCompletedTasks}
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400"
              disabled={completedTasks === 0}
            >
              Clear completed
            </button>
          </div>
        )}

        {/* Notification Modal */}
        {showNotification && currentNotification && (
          <div 
            className={`${styles.notificationBackdrop} ${showNotification ? styles.visible : ''}`}
            onClick={dismissNotification}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-title"
          >
            <div 
              className={`${styles.notification} ${showNotification ? styles.show : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
                <AlarmClock size={18} />
                <h3 id="notification-title" className="font-medium">Task Reminder</h3>
              </div>
              <p className="mb-4 text-gray-800 dark:text-slate-200">{currentNotification.taskTitle}</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={snoozeNotification}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-1"
                  aria-label="Snooze reminder for 5 minutes"
                >
                  <Clock size={14} />
                  Snooze 5m
                </button>
                <button 
                  onClick={dismissNotification}
                  className="btn btn-primary flex items-center gap-1"
                  aria-label="Dismiss reminder"
                >
                  <Check size={14} />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-slate-500">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;
