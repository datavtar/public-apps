import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Calendar, Moon, Sun, ChevronLeft, ChevronRight, Trash2, Edit, Star } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isToday, isSameDay, addDays, subDays } from 'date-fns';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  completedTasks: Task[];
  totalTasks: number;
  completionRate: number;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [newTask, setNewTask] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<string>('General');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [showWeeklySummary, setShowWeeklySummary] = useState<boolean>(false);

  const categories = ['General', 'Household', 'Cooking', 'Shopping', 'Personal', 'Kids', 'Health'];

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('dailyTasks');
      const savedSummaries = localStorage.getItem('weeklySummaries');
      const savedDarkMode = localStorage.getItem('darkMode');
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      if (savedSummaries) {
        setWeeklySummaries(JSON.parse(savedSummaries));
      }
      if (savedDarkMode) {
        const isDark = JSON.parse(savedDarkMode);
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem('dailyTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  // Save weekly summaries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('weeklySummaries', JSON.stringify(weeklySummaries));
    } catch (error) {
      console.error('Error saving summaries to localStorage:', error);
    }
  }, [weeklySummaries]);

  // Handle dark mode toggle
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  }, [isDarkMode]);

  // Check if it's Sunday and generate weekly summary
  useEffect(() => {
    const today = new Date();
    if (today.getDay() === 0) { // Sunday
      generateWeeklySummary();
    }
  }, [currentDate]);

  const generateWeeklySummary = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
    
    // Check if summary for this week already exists
    const existingSummary = weeklySummaries.find(summary => 
      summary.weekStart === weekStartStr && summary.weekEnd === weekEndStr
    );
    
    if (!existingSummary) {
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      
      const completedTasks = weekTasks.filter(task => task.completed);
      const completionRate = weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0;
      
      const newSummary: WeeklySummary = {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        completedTasks,
        totalTasks: weekTasks.length,
        completionRate: Math.round(completionRate)
      };
      
      setWeeklySummaries(prev => [...prev, newSummary]);
    }
  };

  const addTask = () => {
    if (newTask.trim() === '') return;
    
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      date: format(activeTab === 'tomorrow' ? addDays(currentDate, 1) : currentDate, 'yyyy-MM-dd'),
      priority: newTaskPriority,
      category: newTaskCategory
    };
    
    setTasks(prev => [...prev, task]);
    setNewTask('');
    setNewTaskPriority('medium');
    setNewTaskCategory('General');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingTask ? { ...task, text: editText.trim() } : task
    ));
    setEditingTask(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const getTodayTasks = () => {
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    return tasks.filter(task => task.date === todayStr);
  };

  const getTomorrowTasks = () => {
    const tomorrowStr = format(addDays(currentDate, 1), 'yyyy-MM-dd');
    return tasks.filter(task => task.date === tomorrowStr);
  };

  const getWeekTasks = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
  };

  const getCurrentTasks = () => {
    switch (activeTab) {
      case 'today':
        return getTodayTasks();
      case 'tomorrow':
        return getTomorrowTasks();
      case 'week':
        return getWeekTasks();
      default:
        return [];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingTask) {
        saveEdit();
      } else {
        addTask();
      }
    }
    if (e.key === 'Escape') {
      if (editingTask) {
        cancelEdit();
      }
      if (showWeeklySummary) {
        setShowWeeklySummary(false);
      }
    }
  };

  const currentTasks = getCurrentTasks();
  const completedTasksCount = currentTasks.filter(task => task.completed).length;
  const totalTasksCount = currentTasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-red-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-red-200'
      }`}>
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-red-900' : 'bg-red-100'
              }`}>
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-red-600">My Daily Tasks</h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {format(currentDate, 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWeeklySummary(true)}
                className={`btn btn-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Weekly</span>
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className={`stat-card transition-colors ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'
          } border`}>
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value text-red-600">{totalTasksCount}</div>
          </div>
          
          <div className={`stat-card transition-colors ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'
          } border`}>
            <div className="stat-title">Completed</div>
            <div className="stat-value text-green-600">{completedTasksCount}</div>
          </div>
          
          <div className={`stat-card transition-colors ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'
          } border`}>
            <div className="stat-title">Progress</div>
            <div className="stat-value text-blue-600">{completionPercentage}%</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`card transition-colors ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'
        } border`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'today', label: 'Today', icon: Calendar },
              { key: 'tomorrow', label: 'Tomorrow', icon: ChevronRight },
              { key: 'week', label: 'This Week', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'today' | 'tomorrow' | 'week')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'text-red-600 border-b-2 border-red-600'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-red-400'
                      : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Add Task Form */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Add a task for ${activeTab === 'tomorrow' ? 'tomorrow' : activeTab === 'week' ? 'this week' : 'today'}...`}
                  className={`input flex-1 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-red-200 focus:border-red-500 focus:ring-red-500'
                  }`}
                />
                <button
                  onClick={addTask}
                  disabled={newTask.trim() === ''}
                  className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className={`input text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-red-200 focus:border-red-500 focus:ring-red-500'
                  }`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className={`input text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-red-200 focus:border-red-500 focus:ring-red-500'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="p-6">
            {currentTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className={`h-12 w-12 mx-auto mb-3 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-lg font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No tasks for {activeTab === 'tomorrow' ? 'tomorrow' : activeTab === 'week' ? 'this week' : 'today'}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Add a task above to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      task.completed
                        ? isDarkMode
                          ? 'bg-gray-700/50 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-white border-red-100 hover:border-red-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-red-600 border-red-600 text-white'
                          : isDarkMode
                            ? 'border-gray-500 hover:border-red-500'
                            : 'border-gray-300 hover:border-red-500'
                      }`}
                    >
                      {task.completed && <Check className="h-3 w-3" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      {editingTask === task.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onBlur={saveEdit}
                          className={`input w-full text-sm transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-red-200 focus:border-red-500 focus:ring-red-500'
                          }`}
                          autoFocus
                        />
                      ) : (
                        <div>
                          <p className={`text-sm font-medium truncate ${
                            task.completed 
                              ? isDarkMode ? 'text-gray-400 line-through' : 'text-gray-500 line-through'
                              : isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {task.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              getPriorityColor(task.priority)
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {task.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {editingTask === task.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={saveEdit}
                          className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={`btn btn-sm transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(task)}
                          className={`btn btn-sm transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Summary Modal */}
      {showWeeklySummary && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowWeeklySummary(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="weekly-summary-title"
        >
          <div 
            className={`modal-content max-w-2xl transition-colors ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'
            } border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="weekly-summary-title" className="text-lg font-semibold text-red-600">
                Weekly Summaries
              </h3>
              <button
                onClick={() => setShowWeeklySummary(false)}
                className={`text-gray-400 hover:text-gray-500 transition-colors`}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {weeklySummaries.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`h-12 w-12 mx-auto mb-3 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No weekly summaries yet
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Complete some tasks this week to see your first summary!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklySummaries.slice().reverse().map((summary, index) => (
                    <div
                      key={`${summary.weekStart}-${summary.weekEnd}`}
                      className={`p-4 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex-between mb-3">
                        <h4 className="font-medium text-red-600">
                          Week of {format(new Date(summary.weekStart), 'MMM d')} - {format(new Date(summary.weekEnd), 'MMM d, yyyy')}
                        </h4>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          summary.completionRate >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : summary.completionRate >= 60
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {summary.completionRate}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{summary.completedTasks.length}</div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{summary.totalTasks}</div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{summary.completionRate}%</div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Success Rate</div>
                        </div>
                      </div>
                      
                      {summary.completedTasks.length > 0 && (
                        <div>
                          <p className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Completed Tasks:
                          </p>
                          <div className="space-y-1">
                            {summary.completedTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className={`text-xs p-2 rounded border ${
                                isDarkMode 
                                  ? 'bg-gray-600 border-gray-500 text-gray-200' 
                                  : 'bg-white border-red-100 text-gray-700'
                              }`}>
                                <span className="font-medium">{task.text}</span>
                                <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                                  getPriorityColor(task.priority)
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            ))}
                            {summary.completedTasks.length > 3 && (
                              <div className={`text-xs text-center py-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                +{summary.completedTasks.length - 3} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowWeeklySummary(false)}
                className={`btn transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t mt-12 py-6 text-center text-sm transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-400' 
          : 'bg-white border-red-200 text-gray-600'
      }`}>
        <div className="container-fluid">
          <p>Copyright © 2025 Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;