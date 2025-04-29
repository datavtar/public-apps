import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit, Check, X } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define Task interface
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// Define the main App component
const App: React.FC = () => {
  // State for tasks, new task input, and editing
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  
  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
        setTasks([]);
      }
    }
  }, []);
  
  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Add a new task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };
  
  // Toggle task completion status
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Start editing a task
  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };
  
  // Save edited task
  const saveEdit = () => {
    if (editingTaskId && editText.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId ? { ...task, text: editText.trim() } : task
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
  
  // Handle escape key to cancel editing
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingTaskId) {
        cancelEdit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [editingTaskId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <div className="container-narrow py-10">
        <div className="card theme-transition">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Simple To-Do App
          </h1>
          
          {/* Add new task form */}
          <form onSubmit={addTask} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new task..."
                className="input flex-grow"
                aria-label="New task text"
              />
              <button 
                type="submit" 
                className="btn btn-primary flex-center gap-1"
                aria-label="Add task"
                disabled={!newTaskText.trim()}
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
          </form>
          
          {/* Task list */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No tasks yet. Add a task to get started!
              </p>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`${styles.taskItem} p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm theme-transition ${task.completed ? 'border-l-4 border-green-500' : ''}`}
                >
                  {editingTaskId === task.id ? (
                    // Edit mode
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="input flex-grow"
                        autoFocus
                        aria-label="Edit task text"
                      />
                      <button 
                        onClick={saveEdit}
                        className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex-center gap-1"
                        aria-label="Save edits"
                        disabled={!editText.trim()}
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-700 flex-center gap-1"
                        aria-label="Cancel editing"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task.id)}
                          className="h-5 w-5 text-primary-600 rounded"
                          aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
                        />
                        <span 
                          className={`flex-grow ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}
                        >
                          {task.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => startEdit(task)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Edit task"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;