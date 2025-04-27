import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, Trash2, Edit, Moon, Sun, ArrowUp, ArrowDown, Calendar, Activity, Target, Medal, Dumbbell, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript types
type Exercise = {
  id: string;
  name: string;
  category: string;
  targetReps?: number;
  targetDuration?: number;
  icon: string;
  unit: 'reps' | 'seconds' | 'minutes';
};

type ExerciseLog = {
  id: string;
  exerciseId: string;
  date: string;
  reps?: number;
  duration?: number;
  notes?: string;
};

type GoalType = {
  id: string;
  exerciseId: string;
  target: number;
  deadline: string;
  achieved: boolean;
};

type FormattedLogForChart = {
  date: string;
  [key: string]: string | number;
};

const App: React.FC = () => {
  // State hooks
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exercises' | 'logs' | 'goals'>('dashboard');
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingLog, setEditingLog] = useState<ExerciseLog | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalType | null>(null);
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [expandedExerciseStats, setExpandedExerciseStats] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [selectedExerciseUnit, setSelectedExerciseUnit] = useState<'reps' | 'seconds' | 'minutes'>('reps');

  // Exercise categories
  const exerciseCategories = [
    { id: 'strength', name: 'Strength' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'flexibility', name: 'Flexibility' },
    { id: 'endurance', name: 'Endurance' }
  ];

  // Exercise icons mapping to Lucide icons
  const exerciseIcons: {[key: string]: JSX.Element} = {
    'situp': <Dumbbell size={18} />,
    'plank': <Activity size={18} />,
    'pushup': <Dumbbell size={18} />,
    'squat': <Dumbbell size={18} />,
    'run': <Activity size={18} />,
    'stretch': <Activity size={18} />,
    'lunges': <Dumbbell size={18} />,
    'burpees': <Dumbbell size={18} />,
    'jumpingjacks': <Activity size={18} />,
    'crunches': <Dumbbell size={18} />,
  };

  // Initial sample data
  const initialExercises: Exercise[] = [
    { id: '1', name: 'Sit-ups', category: 'strength', targetReps: 50, icon: 'situp', unit: 'reps' },
    { id: '2', name: 'Plank', category: 'endurance', targetDuration: 120, icon: 'plank', unit: 'seconds' },
    { id: '3', name: 'Push-ups', category: 'strength', targetReps: 30, icon: 'pushup', unit: 'reps' },
    { id: '4', name: 'Squats', category: 'strength', targetReps: 40, icon: 'squat', unit: 'reps' },
    { id: '5', name: 'Running', category: 'cardio', targetDuration: 30, icon: 'run', unit: 'minutes' },
  ];

  const initialLogs: ExerciseLog[] = [
    { id: '1', exerciseId: '1', date: '2023-12-01', reps: 30, notes: 'Good form' },
    { id: '2', exerciseId: '1', date: '2023-12-05', reps: 35, notes: 'Improved' },
    { id: '3', exerciseId: '1', date: '2023-12-10', reps: 40, notes: 'Getting better' },
    { id: '4', exerciseId: '1', date: '2023-12-15', reps: 45, notes: 'Almost there' },
    { id: '5', exerciseId: '1', date: '2023-12-20', reps: 50, notes: 'Reached target!' },
    { id: '6', exerciseId: '2', date: '2023-12-02', duration: 60, notes: 'Starting point' },
    { id: '7', exerciseId: '2', date: '2023-12-06', duration: 75, notes: 'Getting stronger' },
    { id: '8', exerciseId: '2', date: '2023-12-11', duration: 90, notes: 'Improving' },
    { id: '9', exerciseId: '2', date: '2023-12-16', duration: 105, notes: 'Progress' },
    { id: '10', exerciseId: '2', date: '2023-12-21', duration: 120, notes: 'Hit target!' },
    { id: '11', exerciseId: '3', date: '2023-12-03', reps: 15, notes: 'Need to improve' },
    { id: '12', exerciseId: '3', date: '2023-12-07', reps: 18, notes: 'Better' },
    { id: '13', exerciseId: '4', date: '2023-12-04', reps: 20, notes: 'Good start' },
    { id: '14', exerciseId: '4', date: '2023-12-08', reps: 25, notes: 'Improving' },
    { id: '15', exerciseId: '5', date: '2023-12-05', duration: 15, notes: 'Short run' },
    { id: '16', exerciseId: '5', date: '2023-12-09', duration: 20, notes: 'Longer run' },
  ];

  const initialGoals: GoalType[] = [
    { id: '1', exerciseId: '1', target: 50, deadline: '2023-12-31', achieved: false },
    { id: '2', exerciseId: '2', target: 120, deadline: '2023-12-31', achieved: false },
    { id: '3', exerciseId: '3', target: 30, deadline: '2023-12-31', achieved: false },
  ];

  // Load data from localStorage or use initial data
  useEffect(() => {
    const savedExercises = localStorage.getItem('fitness-exercises');
    const savedLogs = localStorage.getItem('fitness-logs');
    const savedGoals = localStorage.getItem('fitness-goals');
    const savedDarkMode = localStorage.getItem('fitness-dark-mode');

    if (savedExercises) {
      setExercises(JSON.parse(savedExercises));
    } else {
      setExercises(initialExercises);
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(initialLogs);
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals(initialGoals);
    }

    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fitness-exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('fitness-logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('fitness-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fitness-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle escape key for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExerciseModalOpen(false);
        setIsLogModalOpen(false);
        setIsGoalModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Update slider value when editing log or changing exercise
  useEffect(() => {
    if (editingLog) {
      const exercise = exercises.find(ex => ex.id === editingLog.exerciseId);
      if (exercise) {
        setSelectedExerciseUnit(exercise.unit);
        const value = exercise.unit === 'reps' ? editingLog.reps || 0 : editingLog.duration || 0;
        setSliderValue(value);
      }
    } else {
      setSliderValue(0);
    }
  }, [editingLog, exercises]);

  // Update selected exercise unit and reset slider when exercise changes in log modal
  const handleExerciseChange = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      setSelectedExerciseUnit(exercise.unit);
      // Reset slider value or set to a meaningful default
      setSliderValue(0);
    }
  };

  // Function to toggle stats view for an exercise
  const toggleExerciseStats = (exerciseId: string) => {
    setExpandedExerciseStats(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId) 
        : [...prev, exerciseId]
    );
  };

  // Function to prepare chart data
  const prepareChartData = (): FormattedLogForChart[] => {
    // Filter logs based on selected exercise and date range
    const filteredLogs = logs.filter(log => {
      const isInDateRange = log.date >= dateRange.start && log.date <= dateRange.end;
      return isInDateRange && (selectedExerciseFilter === 'all' || log.exerciseId === selectedExerciseFilter);
    });

    // Group logs by date
    const groupedByDate: {[date: string]: {[exerciseId: string]: number}} = {};
    
    filteredLogs.forEach(log => {
      if (!groupedByDate[log.date]) {
        groupedByDate[log.date] = {};
      }
      const value = log.reps !== undefined ? log.reps : log.duration !== undefined ? log.duration : 0;
      groupedByDate[log.date][log.exerciseId] = value;
    });

    // Convert to array format for recharts
    return Object.keys(groupedByDate).sort().map(date => {
      const dataPoint: FormattedLogForChart = { date };
      exercises.forEach(exercise => {
        if (groupedByDate[date][exercise.id] !== undefined) {
          dataPoint[exercise.name] = groupedByDate[date][exercise.id];
        }
      });
      return dataPoint;
    });
  };

  // Get stats for a specific exercise
  const getExerciseStats = (exerciseId: string) => {
    const exerciseLogs = logs.filter(log => log.exerciseId === exerciseId);
    
    if (exerciseLogs.length === 0) return { latest: 0, best: 0, average: 0 };
    
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const isReps = exercise?.unit === 'reps';
    
    const values = exerciseLogs.map(log => isReps ? log.reps || 0 : log.duration || 0);
    const latest = values[values.length - 1];
    const best = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return { latest, best, average: Math.round(average) };
  };

  // Calculate goal progress
  const calculateGoalProgress = (goal: GoalType): number => {
    const exercise = exercises.find(ex => ex.id === goal.exerciseId);
    if (!exercise) return 0;
    
    const exerciseLogs = logs.filter(log => log.exerciseId === goal.exerciseId);
    if (exerciseLogs.length === 0) return 0;
    
    // Sort logs by date and get the latest
    const sortedLogs = [...exerciseLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestLog = sortedLogs[0];
    
    // Determine the value based on exercise type
    const latestValue = exercise.unit === 'reps' ? latestLog.reps || 0 : latestLog.duration || 0;
    
    // Calculate percentage
    return Math.min(100, Math.round((latestValue / goal.target) * 100));
  };

  // Mark goal as achieved
  const markGoalAchieved = (goalId: string, achieved: boolean) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, achieved } : goal
    ));
  };

  // CRUD functions for exercises
  const addOrUpdateExercise = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as 'reps' | 'seconds' | 'minutes';
    const icon = formData.get('icon') as string;
    
    let targetReps: number | undefined;
    let targetDuration: number | undefined;
    
    if (unit === 'reps') {
      targetReps = parseInt(formData.get('target') as string) || undefined;
    } else {
      targetDuration = parseInt(formData.get('target') as string) || undefined;
    }
    
    const newExercise: Exercise = {
      id: editingExercise?.id || Date.now().toString(),
      name,
      category,
      targetReps,
      targetDuration,
      icon,
      unit
    };
    
    if (editingExercise) {
      setExercises(prev => prev.map(ex => ex.id === editingExercise.id ? newExercise : ex));
    } else {
      setExercises(prev => [...prev, newExercise]);
    }
    
    setIsExerciseModalOpen(false);
    setEditingExercise(null);
    form.reset();
  };

  const deleteExercise = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exercise? All logs and goals associated with it will also be deleted.')) {
      setExercises(prev => prev.filter(ex => ex.id !== id));
      setLogs(prev => prev.filter(log => log.exerciseId !== id));
      setGoals(prev => prev.filter(goal => goal.exerciseId !== id));
    }
  };

  // CRUD functions for logs
  const addOrUpdateLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const exerciseId = formData.get('exerciseId') as string;
    const date = formData.get('date') as string;
    const notes = formData.get('notes') as string;
    
    const exercise = exercises.find(ex => ex.id === exerciseId);
    
    let reps: number | undefined;
    let duration: number | undefined;
    
    if (exercise?.unit === 'reps') {
      reps = sliderValue;
    } else {
      duration = sliderValue;
    }
    
    const newLog: ExerciseLog = {
      id: editingLog?.id || Date.now().toString(),
      exerciseId,
      date,
      reps,
      duration,
      notes
    };
    
    if (editingLog) {
      setLogs(prev => prev.map(log => log.id === editingLog.id ? newLog : log));
    } else {
      setLogs(prev => [...prev, newLog]);
    }
    
    // Check if this log satisfies any goals
    const relatedGoals = goals.filter(goal => goal.exerciseId === exerciseId && !goal.achieved);
    relatedGoals.forEach(goal => {
      const value = exercise?.unit === 'reps' ? reps : duration;
      if (value !== undefined && value >= goal.target) {
        markGoalAchieved(goal.id, true);
      }
    });
    
    setIsLogModalOpen(false);
    setEditingLog(null);
    form.reset();
  };

  const deleteLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  // CRUD functions for goals
  const addOrUpdateGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const exerciseId = formData.get('exerciseId') as string;
    const target = parseInt(formData.get('target') as string) || 0;
    const deadline = formData.get('deadline') as string;
    
    const newGoal: GoalType = {
      id: editingGoal?.id || Date.now().toString(),
      exerciseId,
      target,
      deadline,
      achieved: editingGoal?.achieved || false
    };
    
    if (editingGoal) {
      setGoals(prev => prev.map(goal => goal.id === editingGoal.id ? newGoal : goal));
    } else {
      setGoals(prev => [...prev, newGoal]);
    }
    
    setIsGoalModalOpen(false);
    setEditingGoal(null);
    form.reset();
  };

  const deleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(prev => prev.filter(goal => goal.id !== id));
    }
  };

  // Generate chart colors
  const generateChartColors = () => {
    return [
      '#3498db', // blue
      '#e74c3c', // red
      '#2ecc71', // green
      '#f39c12', // yellow/orange
      '#9b59b6', // purple
      '#1abc9c', // teal
      '#34495e', // dark blue
      '#d35400', // orange
      '#c0392b', // dark red
      '#16a085', // dark green
    ];
  };

  // Get exercise icon
  const getExerciseIcon = (iconName: string) => {
    return exerciseIcons[iconName] || <Dumbbell size={18} />;
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const differenceInTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  return (
    <div className="min-h-screen theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm fixed top-0 w-full z-[var(--z-fixed)] theme-transition">
        <div className="container-fluid flex-between h-16">
          <h1 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
            FitTrack Pro
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              role="switch"
              aria-checked={darkMode}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm fixed top-16 w-full z-[var(--z-fixed)] theme-transition">
        <div className="container-fluid">
          <div className="flex overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'exercises' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
            >
              Exercises
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'logs' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
            >
              Workout Logs
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'goals' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
            >
              Goals
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid pt-32 pb-20">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold dark:text-white">Fitness Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">Track your fitness progress and goals</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="space-x-2 flex items-center">
                  <label htmlFor="exercise-filter" className="text-sm font-medium whitespace-nowrap dark:text-gray-300">
                    Exercise:
                  </label>
                  <select
                    id="exercise-filter"
                    className="input-sm" 
                    value={selectedExerciseFilter}
                    onChange={(e) => setSelectedExerciseFilter(e.target.value)}
                  >
                    <option value="all">All Exercises</option>
                    {exercises.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-x-2 flex items-center">
                  <label className="text-sm font-medium whitespace-nowrap dark:text-gray-300">Date Range:</label>
                  <input
                    type="date"
                    className="input-sm"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <span className="dark:text-gray-300">to</span>
                  <input
                    type="date"
                    className="input-sm"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Progress Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {exercises.map((exercise, index) => {
                      // Only show for selected exercise or all
                      if (selectedExerciseFilter !== 'all' && exercise.id !== selectedExerciseFilter) {
                        return null;
                      }
                      
                      const colors = generateChartColors();
                      return (
                        <Line 
                          key={exercise.id}
                          type="monotone" 
                          dataKey={exercise.name} 
                          stroke={colors[index % colors.length]} 
                          activeDot={{ r: 8 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {exercises.map(exercise => {
                const stats = getExerciseStats(exercise.id);
                const isExpanded = expandedExerciseStats.includes(exercise.id);
                return (
                  <div 
                    key={exercise.id} 
                    className={`card ${isExpanded ? 'bg-gray-50 dark:bg-slate-700' : ''} transition-all cursor-pointer hover:shadow-md`}
                    onClick={() => toggleExerciseStats(exercise.id)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        {getExerciseIcon(exercise.icon)}
                        <h3 className="font-semibold dark:text-white">{exercise.name}</h3>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Latest</p>
                        <p className="text-xl font-semibold dark:text-white">
                          {stats.latest} {exercise.unit}
                        </p>
                      </div>
                      {exercise.targetReps || exercise.targetDuration ? (
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
                          <p className="text-xl font-semibold dark:text-white">
                            {exercise.targetReps || exercise.targetDuration} {exercise.unit}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Best:</p>
                          <p className="font-medium dark:text-white">{stats.best} {exercise.unit}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Average:</p>
                          <p className="font-medium dark:text-white">{stats.average} {exercise.unit}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Category:</p>
                          <p className="font-medium dark:text-white capitalize">{exercise.category}</p>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button 
                            className="btn-sm bg-primary-500 text-white hover:bg-primary-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLog(null);
                              setActiveTab('logs');
                              setIsLogModalOpen(true);
                              setTimeout(() => {
                                const exerciseSelect = document.getElementById('log-exercise') as HTMLSelectElement;
                                if (exerciseSelect) {
                                  exerciseSelect.value = exercise.id;
                                  handleExerciseChange(exercise.id);
                                }
                              }, 100);
                            }}
                          >
                            Log Workout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Goal Progress */}
            {goals.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Goal Progress</h3>
                <div className="space-y-4">
                  {goals.map(goal => {
                    const exercise = exercises.find(ex => ex.id === goal.exerciseId);
                    if (!exercise) return null;
                    
                    const progress = calculateGoalProgress(goal);
                    const daysLeft = getDaysUntilDeadline(goal.deadline);
                    const isExpired = daysLeft < 0;
                    
                    return (
                      <div key={goal.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <div className="flex items-center gap-2 mb-2 sm:mb-0">
                            {getExerciseIcon(exercise.icon)}
                            <h4 className="font-medium dark:text-white">{exercise.name}</h4>
                            {goal.achieved && (
                              <span className="badge badge-success flex items-center gap-1">
                                <Check size={12} />
                                Achieved
                              </span>
                            )}
                            {isExpired && !goal.achieved && (
                              <span className="badge badge-error flex items-center gap-1">
                                <X size={12} />
                                Expired
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Target: {goal.target} {exercise.unit} by {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${goal.achieved ? 'bg-green-500' : isExpired ? 'bg-red-500' : 'bg-primary-500'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{progress}%</span>
                          {!goal.achieved && !isExpired && <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No workout logs recorded yet.</p>
                ) : (
                  [...logs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(log => {
                      const exercise = exercises.find(ex => ex.id === log.exerciseId);
                      if (!exercise) return null;
                      
                      const value = exercise.unit === 'reps' ? log.reps : log.duration;
                      
                      return (
                        <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-gray-500 dark:text-gray-400">
                              <Calendar size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium dark:text-white">{exercise.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                              </div>
                              {log.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{log.notes}</p>}
                            </div>
                          </div>
                          <div className="font-semibold text-right dark:text-white">
                            {value} {exercise.unit}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              <div className="mt-4 flex justify-center">
                <button 
                  className="btn-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500"
                  onClick={() => setActiveTab('logs')}
                >
                  View All Logs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold dark:text-white">My Exercises</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your exercises and targets</p>
              </div>
              <button 
                className="btn btn-primary flex items-center gap-2 self-end sm:self-auto"
                onClick={() => {
                  setEditingExercise(null);
                  setIsExerciseModalOpen(true);
                }}
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any exercises yet.</p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={() => {
                    setEditingExercise(null);
                    setIsExerciseModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Add Your First Exercise
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map(exercise => {
                  const stats = getExerciseStats(exercise.id);
                  return (
                    <div key={exercise.id} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full">
                            {getExerciseIcon(exercise.icon)}
                          </div>
                          <div>
                            <h3 className="font-semibold dark:text-white">{exercise.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{exercise.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => {
                              setEditingExercise(exercise);
                              setIsExerciseModalOpen(true);
                            }}
                            aria-label="Edit exercise"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            onClick={() => deleteExercise(exercise.id)}
                            aria-label="Delete exercise"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Current:</span>
                          <span className="font-medium dark:text-white">{stats.latest} {exercise.unit}</span>
                        </div>
                        
                        {(exercise.targetReps !== undefined || exercise.targetDuration !== undefined) && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Target:</span>
                            <span className="font-medium dark:text-white">
                              {exercise.targetReps !== undefined ? exercise.targetReps : exercise.targetDuration} {exercise.unit}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Best:</span>
                          <span className="font-medium dark:text-white">{stats.best} {exercise.unit}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                        <button 
                          className="btn-sm bg-primary-500 text-white hover:bg-primary-600 flex-1 flex items-center justify-center gap-1"
                          onClick={() => {
                            setEditingLog(null);
                            setIsLogModalOpen(true);
                            setTimeout(() => {
                              const exerciseSelect = document.getElementById('log-exercise') as HTMLSelectElement;
                              if (exerciseSelect) {
                                exerciseSelect.value = exercise.id;
                                handleExerciseChange(exercise.id);
                              }
                            }, 100);
                          }}
                        >
                          <Plus size={14} /> Log
                        </button>
                        <button 
                          className="btn-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 flex-1 flex items-center justify-center gap-1"
                          onClick={() => {
                            setEditingGoal(null);
                            setIsGoalModalOpen(true);
                            setTimeout(() => {
                              const exerciseSelect = document.getElementById('goal-exercise') as HTMLSelectElement;
                              if (exerciseSelect) {
                                exerciseSelect.value = exercise.id;
                              }
                            }, 100);
                          }}
                        >
                          <Target size={14} /> Goal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Workout Logs</h2>
                <p className="text-gray-600 dark:text-gray-400">Track your progress over time</p>
              </div>
              <button 
                className="btn btn-primary flex items-center gap-2 self-end sm:self-auto"
                onClick={() => {
                  setEditingLog(null);
                  setIsLogModalOpen(true);
                }}
                disabled={exercises.length === 0}
              >
                <Plus size={16} />
                Log Workout
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You need to add exercises before you can log workouts.</p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={() => {
                    setActiveTab('exercises');
                    setTimeout(() => {
                      setEditingExercise(null);
                      setIsExerciseModalOpen(true);
                    }, 100);
                  }}
                >
                  <Plus size={16} />
                  Add Your First Exercise
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't logged any workouts yet.</p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={() => {
                    setEditingLog(null);
                    setIsLogModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Log Your First Workout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="input-sm"
                      value={selectedExerciseFilter}
                      onChange={(e) => setSelectedExerciseFilter(e.target.value)}
                    >
                      <option value="all">All Exercises</option>
                      {exercises.map(exercise => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        className="input-sm"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                      <span className="text-gray-500 dark:text-gray-400">to</span>
                      <input
                        type="date"
                        className="input-sm"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-700">
                        <th className="table-header">Date</th>
                        <th className="table-header">Exercise</th>
                        <th className="table-header">Value</th>
                        <th className="table-header">Notes</th>
                        <th className="table-header w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {logs
                        .filter(log => {
                          const isInDateRange = log.date >= dateRange.start && log.date <= dateRange.end;
                          return isInDateRange && (selectedExerciseFilter === 'all' || log.exerciseId === selectedExerciseFilter);
                        })
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(log => {
                          const exercise = exercises.find(ex => ex.id === log.exerciseId);
                          if (!exercise) return null;
                          
                          return (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                              <td className="table-cell">{new Date(log.date).toLocaleDateString()}</td>
                              <td className="table-cell">
                                <div className="flex items-center gap-2">
                                  {getExerciseIcon(exercise.icon)}
                                  <span>{exercise.name}</span>
                                </div>
                              </td>
                              <td className="table-cell font-medium">
                                {exercise.unit === 'reps' ? log.reps : log.duration} {exercise.unit}
                              </td>
                              <td className="table-cell text-gray-500 dark:text-gray-400">
                                {log.notes || '-'}
                              </td>
                              <td className="table-cell">
                                <div className="flex gap-1">
                                  <button 
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => {
                                      setEditingLog(log);
                                      setIsLogModalOpen(true);
                                    }}
                                    aria-label="Edit log"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                    onClick={() => deleteLog(log.id)}
                                    aria-label="Delete log"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Progress Chart */}
                <div className="card mt-6">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Progress Chart</h3>
                  <div className="h-80">
                    {prepareChartData().length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">No data available for the selected filters.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {exercises.map((exercise, index) => {
                            // Only show for selected exercise or all
                            if (selectedExerciseFilter !== 'all' && exercise.id !== selectedExerciseFilter) {
                              return null;
                            }
                            
                            const colors = generateChartColors();
                            return (
                              <Bar 
                                key={exercise.id}
                                dataKey={exercise.name} 
                                fill={colors[index % colors.length]} 
                              />
                            );
                          })}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Fitness Goals</h2>
                <p className="text-gray-600 dark:text-gray-400">Set and track your fitness goals</p>
              </div>
              <button 
                className="btn btn-primary flex items-center gap-2 self-end sm:self-auto"
                onClick={() => {
                  setEditingGoal(null);
                  setIsGoalModalOpen(true);
                }}
                disabled={exercises.length === 0}
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You need to add exercises before you can set goals.</p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={() => {
                    setActiveTab('exercises');
                    setTimeout(() => {
                      setEditingExercise(null);
                      setIsExerciseModalOpen(true);
                    }, 100);
                  }}
                >
                  <Plus size={16} />
                  Add Your First Exercise
                </button>
              </div>
            ) : goals.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't set any fitness goals yet.</p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Set Your First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Goals */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Active Goals</h3>
                  <div className="space-y-4">
                    {goals.filter(goal => !goal.achieved).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">You don't have any active goals.</p>
                    ) : (
                      goals
                        .filter(goal => !goal.achieved)
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .map(goal => {
                          const exercise = exercises.find(ex => ex.id === goal.exerciseId);
                          if (!exercise) return null;
                          
                          const progress = calculateGoalProgress(goal);
                          const daysLeft = getDaysUntilDeadline(goal.deadline);
                          const isExpired = daysLeft < 0;
                          
                          return (
                            <div key={goal.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                  <div className="p-2 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full">
                                    {getExerciseIcon(exercise.icon)}
                                  </div>
                                  <div>
                                    <h4 className="font-medium dark:text-white">{exercise.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {isExpired ? 'Expired on' : 'Due by'} {new Date(goal.deadline).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-auto">
                                  <button 
                                    className="btn-sm bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 flex items-center gap-1"
                                    onClick={() => markGoalAchieved(goal.id, true)}
                                    disabled={isExpired}
                                  >
                                    <Check size={14} />
                                    Mark Complete
                                  </button>
                                  <div className="flex gap-1">
                                    <button 
                                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                      onClick={() => {
                                        setEditingGoal(goal);
                                        setIsGoalModalOpen(true);
                                      }}
                                      aria-label="Edit goal"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                      onClick={() => deleteGoal(goal.id)}
                                      aria-label="Delete goal"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium dark:text-white">Target: {goal.target} {exercise.unit}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {isExpired ? (
                                    <span className="text-red-500 dark:text-red-400">Goal expired</span>
                                  ) : (
                                    <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining</span>
                                  )}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isExpired ? 'bg-red-500' : 'bg-primary-500'}`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{progress}% complete</span>
                                <span>Current: {getExerciseStats(exercise.id).latest} {exercise.unit}</span>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Completed Goals */}
                {goals.filter(goal => goal.achieved).length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Completed Goals</h3>
                    <div className="space-y-4">
                      {goals
                        .filter(goal => goal.achieved)
                        .map(goal => {
                          const exercise = exercises.find(ex => ex.id === goal.exerciseId);
                          if (!exercise) return null;
                          
                          return (
                            <div key={goal.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                <div className="p-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                                  <Medal size={18} />
                                </div>
                                <div>
                                  <h4 className="font-medium dark:text-white flex items-center gap-1">
                                    {exercise.name} 
                                    <span className="badge badge-success text-xs flex items-center gap-1">
                                      <Check size={10} /> Achieved
                                    </span>
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Target: {goal.target} {exercise.unit} by {new Date(goal.deadline).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 self-end sm:self-auto">
                                <button 
                                  className="btn-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 flex items-center gap-1"
                                  onClick={() => markGoalAchieved(goal.id, false)}
                                >
                                  <ArrowUp size={14} />
                                  Reactivate
                                </button>
                                <button 
                                  className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                  onClick={() => deleteGoal(goal.id)}
                                  aria-label="Delete goal"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Exercise Modal */}
      {isExerciseModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsExerciseModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium dark:text-white">
                {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsExerciseModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={addOrUpdateExercise}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Exercise Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="input" 
                    defaultValue={editingExercise?.name || ''}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select 
                    id="category" 
                    name="category" 
                    className="input" 
                    defaultValue={editingExercise?.category || ''}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {exerciseCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="unit" className="form-label">Measurement Unit</label>
                  <select 
                    id="unit" 
                    name="unit" 
                    className="input" 
                    defaultValue={editingExercise?.unit || 'reps'}
                    required
                  >
                    <option value="reps">Repetitions (reps)</option>
                    <option value="seconds">Seconds (sec)</option>
                    <option value="minutes">Minutes (min)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="target" className="form-label">Target (optional)</label>
                  <input 
                    type="number" 
                    id="target" 
                    name="target" 
                    className="input" 
                    defaultValue={editingExercise?.targetReps || editingExercise?.targetDuration || ''}
                    min="1" 
                    placeholder="e.g., 50 for 50 reps"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="icon" className="form-label">Icon</label>
                  <select 
                    id="icon" 
                    name="icon" 
                    className="input" 
                    defaultValue={editingExercise?.icon || 'dumbbell'}
                    required
                  >
                    <option value="situp">Sit-ups</option>
                    <option value="plank">Plank</option>
                    <option value="pushup">Push-ups</option>
                    <option value="squat">Squats</option>
                    <option value="run">Running</option>
                    <option value="stretch">Stretching</option>
                    <option value="lunges">Lunges</option>
                    <option value="burpees">Burpees</option>
                    <option value="jumpingjacks">Jumping Jacks</option>
                    <option value="crunches">Crunches</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  onClick={() => setIsExerciseModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingExercise ? 'Update' : 'Add'} Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {isLogModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium dark:text-white">
                {editingLog ? 'Edit Workout Log' : 'Log Workout'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsLogModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={addOrUpdateLog}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="log-exercise" className="form-label">Exercise</label>
                  <select 
                    id="log-exercise" 
                    name="exerciseId" 
                    className="input" 
                    value={editingLog?.exerciseId || ''}
                    required
                    onChange={(e) => handleExerciseChange(e.target.value)}
                  >
                    <option value="" disabled>Select exercise</option>
                    {exercises.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date" 
                    className="input" 
                    defaultValue={editingLog?.date || new Date().toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="workout-slider" className="form-label">Value: {sliderValue} {selectedExerciseUnit}</label>
                  <div className={styles.sliderContainer}>
                    <input 
                      type="range" 
                      id="workout-slider" 
                      className={styles.slider}
                      min="0" 
                      max="100" 
                      step="1"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    />
                    <div className={styles.sliderLabels}>
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Notes (optional)</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="input" 
                    defaultValue={editingLog?.notes || ''}
                    rows={3}
                    placeholder="How was your workout? Any challenges or improvements?"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  onClick={() => setIsLogModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingLog ? 'Update' : 'Save'} Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGoalModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Add Goal'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsGoalModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={addOrUpdateGoal}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="goal-exercise" className="form-label">Exercise</label>
                  <select 
                    id="goal-exercise" 
                    name="exerciseId" 
                    className="input" 
                    defaultValue={editingGoal?.exerciseId || ''}
                    required
                  >
                    <option value="" disabled>Select exercise</option>
                    {exercises.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="target" className="form-label">Target Value</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      id="target" 
                      name="target" 
                      className="input" 
                      defaultValue={editingGoal?.target || ''}
                      min="1" 
                      required 
                    />
                    <span className="text-gray-500 dark:text-gray-400">
                      {editingGoal && exercises.find(ex => ex.id === editingGoal.exerciseId)?.unit}
                    </span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="deadline" className="form-label">Deadline</label>
                  <input 
                    type="date" 
                    id="deadline" 
                    name="deadline" 
                    className="input" 
                    defaultValue={editingGoal?.deadline || ''}
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  onClick={() => setIsGoalModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingGoal ? 'Update' : 'Add'} Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm fixed bottom-0 w-full z-[var(--z-fixed)] py-4 theme-transition">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;