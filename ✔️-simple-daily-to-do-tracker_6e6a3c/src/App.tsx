import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Edit, Moon, Sun } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const App: React.FC = () => {
  // State for tasks and dark mode
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
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
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
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
  };

  // Save edited task
  const saveEdit = () => {
    if (editingTaskId && editText.trim() !== '') {
      setTasks(tasks.map(task =>
        task.id === editingTaskId ? { ...task, text: editText } : task
      ));
      setEditingTaskId(null);
      setEditText('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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
          <div className="flex">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="input flex-grow mr-2"
              aria-label="Task description"
            />
            <button 
              type="submit" 
              className="btn btn-primary flex items-center"
              disabled={newTaskText.trim() === ''}
              aria-label="Add task"
            >
              <Plus className="h-5 w-5 mr-1" /> Add
            </button>
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
                className={`card-sm flex items-center ${task.completed ? 'bg-gray-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}
              >
                {editingTaskId === task.id ? (
                  <div className="flex-grow flex items-center">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input flex-grow mr-2"
                      autoFocus
                      aria-label="Edit task"
                    />
                    <button 
                      onClick={saveEdit} 
                      className="p-2 text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400"
                      aria-label="Save changes"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                      aria-label="Cancel editing"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => toggleComplete(task.id)}
                      className={`p-2 flex-shrink-0 rounded-full ${task.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-400'}`}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <p 
                      className={`flex-grow px-3 py-2 ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}
                    >
                      {task.text}
                    </p>
                    <div className="flex items-center">
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
                  </>
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