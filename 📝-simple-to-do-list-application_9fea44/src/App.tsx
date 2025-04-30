import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, X, Sun, Moon, Filter } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define Task interface
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
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

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

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
  };

  // Clear all completed tasks
  const clearCompletedTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

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
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-title">Active Tasks</div>
              <div className="stat-value">{activeTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Completed</div>
              <div className="stat-value">{completedTasks}</div>
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
                <li key={task.id} className={`py-3 px-2 flex items-center gap-3 ${styles.taskItem}`}>
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

        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-slate-500">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;
