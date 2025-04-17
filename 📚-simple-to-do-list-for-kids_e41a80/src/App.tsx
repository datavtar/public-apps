import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import {
  Star, // Using Star for 'done' feels more fun for a child
  Circle, // Using Circle for 'not done'
  Trash2,
  Plus,
  Sun,
  Moon,
  Sparkles // For fun visual feedback
} from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types --- //
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

// --- Constants --- //
const LOCAL_STORAGE_KEY_TASKS = 'kiddoAppTasks';
const LOCAL_STORAGE_KEY_THEME = 'kiddoAppTheme';

// --- Main App Component --- //
const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- Effects --- //

  // Load tasks and theme from localStorage on initial mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks from local storage:', error);
      // Handle error gracefully, maybe show a message to the user
    }
    setIsLoading(false);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) { // Avoid saving initial empty state before loading
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to local storage:', error);
        // Handle error gracefully
      }
    }
  }, [tasks, isLoading]);

  // Apply dark mode class and save preference
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'false');
    }
  }, [isDarkMode]);

  // --- Event Handlers --- //

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(event.target.value);
  };

  const handleAddTask = useCallback(() => {
    const trimmedText = newTaskText.trim();
    if (trimmedText) {
      const newTask: Task = {
        id: crypto.randomUUID(), // Modern way to generate unique IDs
        text: trimmedText,
        completed: false,
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskText(''); // Clear input after adding
    }
  }, [newTaskText]);

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleToggleComplete = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Render Logic --- //

  if (isLoading) {
    // Simple loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <p className="text-lg text-gray-600 dark:text-slate-300">Loading tasks...</p>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const allTasksDone = totalTasks > 0 && completedTasks === totalTasks;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-800 dark:via-slate-900 dark:to-black theme-transition-all">
      {/* Header */}
      <header className="p-4 flex justify-between items-center shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <Sparkles size={28} className="text-yellow-500" />
          My Fun To-Do List!
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200 theme-transition-bg"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          role="switch"
          aria-checked={isDarkMode}
        >
          {isDarkMode ? (
            <Sun size={24} className="text-yellow-400" />
          ) : (
            <Moon size={24} className="text-slate-600" />
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow mx-auto p-4 sm:p-6">
        {/* Input Form */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskText}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            placeholder="What do you need to do? ✨"
            className="input-responsive flex-grow !text-base sm:!text-lg dark:placeholder-slate-400"
            aria-label="New task input"
            name="newTaskInput"
          />
          <button
            onClick={handleAddTask}
            className="btn btn-primary btn-responsive flex-shrink-0 flex items-center justify-center gap-1"
            aria-label="Add new task"
            disabled={!newTaskText.trim()}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 && (
            <div className="text-center py-10 px-4 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-sm">
              <Sparkles size={48} className="mx-auto text-yellow-500 mb-4" />
              <p className="text-gray-600 dark:text-slate-300 text-lg">
                No tasks yet! Add something fun to do!
              </p>
            </div>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className={`${styles.taskItem} card card-sm flex items-center justify-between p-3 sm:p-4 theme-transition-all ${task.completed ? 'opacity-60 bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}
              role="listitem"
            >
              <div className="flex items-center gap-3 flex-grow min-w-0"> {/* Allow text to wrap */} 
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`p-1.5 rounded-full transition-colors duration-200 ${task.completed ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-800/50' : 'text-gray-400 hover:text-green-500 hover:bg-green-100 dark:hover:bg-green-800/50'}`}
                  aria-label={task.completed ? 'Mark task as not done' : 'Mark task as done'}
                  role="checkbox"
                  aria-checked={task.completed}
                >
                  {task.completed ? <Star size={24} fill="currentColor" /> : <Circle size={24} />}
                </button>
                <span
                  className={`flex-grow text-base sm:text-lg text-gray-800 dark:text-slate-100 break-words ${task.completed ? 'line-through' : ''}`}
                >
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="btn btn-sm bg-transparent hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 p-1.5 rounded-full ml-2 flex-shrink-0"
                aria-label={`Delete task: ${task.text}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {allTasksDone && (
          <div className="mt-8 text-center p-6 bg-gradient-to-r from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 rounded-lg shadow-md animate-pulse">
             <Sparkles size={40} className="mx-auto text-yellow-500 mb-3" />
            <p className="text-xl font-semibold text-green-800 dark:text-white">
              Wow! All tasks done! Great job! 🎉
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-slate-400 bg-white/30 dark:bg-black/30 theme-transition-bg">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
