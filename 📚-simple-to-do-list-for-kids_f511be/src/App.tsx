import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Sun, Moon, Plus, Circle, CheckCircle2, Trash2, PartyPopper } from 'lucide-react';
import styles from './styles/styles.module.css'; // Will be empty, but required by structure

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const APP_PREFIX = 'kiddoToDoApp_';
const TASKS_STORAGE_KEY = `${APP_PREFIX}tasks`;
const DARK_MODE_STORAGE_KEY = `${APP_PREFIX}darkMode`;

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        return JSON.parse(storedTasks) as Task[];
      }
    } catch (error) {
      console.error('Error loading tasks from local storage:', error);
    }
    return [
      { id: crypto.randomUUID(), text: '🎨 Draw a colorful rainbow', completed: false, createdAt: Date.now() - 20000 },
      { id: crypto.randomUUID(), text: '🧸 Tidy up toys', completed: true, createdAt: Date.now() - 10000 },
      { id: crypto.randomUUID(), text: '📚 Read a fun story book', completed: false, createdAt: Date.now() },
    ];
  });

  const [newTaskText, setNewTaskText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      if (storedDarkMode !== null) {
        return JSON.parse(storedDarkMode) as boolean;
      }
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch (error) {
      console.error('Error loading dark mode preference from local storage:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to local storage:', error);
    }
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference to local storage:', error);
    }
  }, [isDarkMode]);

  const handleNewTaskChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(event.target.value);
  };

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]); // Add new tasks to the beginning
    setNewTaskText('');
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return b.createdAt - a.createdAt; // Newest first within the same completion status
    }
    return a.completed ? 1 : -1; // Active tasks first
  });

  return (
    <div className="flex flex-col min-h-screen bg-rose-50 dark:bg-slate-900 theme-transition-all font-sans">
      <header className="py-4 px-4 sm:px-6 shadow-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-md sticky top-0 z-[var(--z-sticky)]">
        <div className="container-narrow mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500 dark:text-pink-400 tracking-tight">
            ✨ My Fun To-Do! ✨
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-yellow-500 dark:text-yellow-400"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            name="theme-toggle"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main className="flex-grow container-narrow mx-auto py-6 sm:py-8 px-4">
        <form onSubmit={handleAddTask} className="mb-6 sm:mb-8 p-4 card-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              value={newTaskText}
              onChange={handleNewTaskChange}
              placeholder="What fun thing to do next?"
              className="input input-responsive flex-grow !rounded-lg text-base focus:ring-pink-400 dark:focus:ring-pink-500 dark:border-slate-600"
              aria-label="New task description"
              name="newTaskInput"
            />
            <button
              type="submit"
              className="btn btn-primary btn-responsive !rounded-lg w-full sm:w-auto bg-pink-500 hover:bg-pink-600 focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-500 flex items-center justify-center gap-2"
              name="addTaskButton"
            >
              <Plus size={20} /> Add Task
            </button>
          </div>
        </form>

        {sortedTasks.length === 0 ? (
          <div className="text-center py-10 px-4 card bg-white/50 dark:bg-slate-800/50 rounded-xl shadow-md">
            <PartyPopper size={48} className="mx-auto mb-4 text-pink-500 dark:text-pink-400" />
            <p className="text-lg text-gray-600 dark:text-slate-300">No tasks yet! Hooray!</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Add something fun using the box above.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedTasks.map(task => (
              <div
                key={task.id}
                className={`card-sm p-3 sm:p-4 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.02] 
                  ${task.completed 
                    ? 'bg-green-50/70 dark:bg-green-900/30 opacity-70' 
                    : 'bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm'}`}
                role="listitem"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    name={`toggleComplete-${task.id}`}
                    className={`p-1.5 rounded-full transition-colors 
                      ${task.completed 
                        ? 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300' 
                        : 'text-gray-400 hover:text-pink-500 dark:text-slate-500 dark:hover:text-pink-400'}`}
                  >
                    {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                  </button>
                  <span 
                    className={`text-sm sm:text-base break-words ${task.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-200'}`}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 rounded-full text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors ml-2 flex-shrink-0"
                  aria-label={`Delete task: ${task.text}`}
                  name={`deleteTask-${task.id}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 mt-auto">
        Copyright © ${new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
