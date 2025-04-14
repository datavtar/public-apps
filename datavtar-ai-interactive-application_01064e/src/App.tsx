import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Camera, CameraRef } from 'react-camera-pro';
import {
  Plus, Edit, Trash2, Search, Filter, ArrowUp, ArrowDown, Sun, Moon, X, Check, Camera as CameraIcon, Image as ImageIcon, AlertCircle, Download, Upload, ArrowLeftRight, ArrowDownUp, XCircle
} from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Enums & Types --- //

enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  imageUrl?: string; // Optional base64 image data URL
}

type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'imageUrl'>;

enum SortField {
  CreatedAt = 'createdAt',
  Priority = 'priority',
  Title = 'title',
}

enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// --- Priority Mapping for Sorting --- //
const priorityOrder: { [key in TaskPriority]: number } = {
  [TaskPriority.Low]: 1,
  [TaskPriority.Medium]: 2,
  [TaskPriority.High]: 3,
};

// --- Initial Sample Data --- //
const getInitialTasks = (): Task[] => {
  try {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Basic validation: check if it's an array
      if (Array.isArray(parsedTasks)) {
        // Further validation could be added here to check task structure
        return parsedTasks;
      }
    }
  } catch (error) {
    console.error("Failed to load tasks from localStorage:", error);
    // Fallback to default if localStorage is corrupted or invalid
  }
  // Default tasks if localStorage is empty or invalid
  return [
    {
      id: '1',
      title: 'Setup Project Structure',
      description: 'Initialize React app with TypeScript and Tailwind.',
      status: TaskStatus.Done,
      priority: TaskPriority.High,
      createdAt: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
      id: '2',
      title: 'Implement Task CRUD',
      description: 'Add functionality to create, read, update, delete tasks.',
      status: TaskStatus.InProgress,
      priority: TaskPriority.High,
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      id: '3',
      title: 'Add Filtering & Sorting',
      description: 'Allow users to filter and sort the task list.',
      status: TaskStatus.ToDo,
      priority: TaskPriority.Medium,
      createdAt: Date.now(),
    },
    {
      id: '4',
      title: 'Implement Dark Mode',
      description: 'Add theme toggle for light/dark mode.',
      status: TaskStatus.ToDo,
      priority: TaskPriority.Low,
      createdAt: Date.now() + 3600000, // 1 hour from now (future sort testing)
    },
  ];
};

// --- Main App Component --- //

const App: React.FC = () => {
  // --- State Variables --- //
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [sortOption, setSortOption] = useState<SortOption>({ field: SortField.CreatedAt, direction: SortDirection.Desc });
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [taskForCamera, setTaskForCamera] = useState<Task | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // --- LocalStorage Persistence --- //
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
    }
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // --- Modal Handling --- //
  const openModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
  }, []);

  const openCameraModal = (task: Task) => {
    setTaskForCamera(task);
    setCapturedImage(task.imageUrl || null); // Show existing image if available
    setIsCameraModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeCameraModal = useCallback(() => {
    setTaskForCamera(null);
    setIsCameraModalOpen(false);
    setCapturedImage(null);
    document.body.classList.remove('modal-open');
  }, []);

  // --- Keyboard Listener for Modal --- //
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isCameraModalOpen) closeCameraModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, isCameraModalOpen, closeModal, closeCameraModal]);

  // --- Task Operations --- //
  const addTask = (data: TaskFormData) => {
    const newTask: Task = {
      ...data,
      id: Date.now().toString(),
      createdAt: Date.now(),
      status: data.status || TaskStatus.ToDo, // Default status
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (id: string, data: TaskFormData) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === id ? { ...task, ...data } : task))
    );
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === id ? { ...task, status } : task))
    );
  };

  const addImageToTask = (taskId: string, imageUrl: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === taskId ? { ...task, imageUrl } : task))
    );
  };

  // --- Filtering & Sorting Logic --- //
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const searchMatch = searchTerm
        ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const statusMatch = filterStatus ? task.status === filterStatus : true;
      const priorityMatch = filterPriority ? task.priority === filterPriority : true;
      return searchMatch && statusMatch && priorityMatch;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      const field = sortOption.field;
      const direction = sortOption.direction === SortDirection.Asc ? 1 : -1;

      if (field === SortField.Priority) {
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      } else if (field === SortField.Title) {
        comparison = a.title.localeCompare(b.title);
      } else { // Default to CreatedAt
        comparison = a.createdAt - b.createdAt;
      }

      return comparison * direction;
    });

    return filtered;
  }, [tasks, searchTerm, filterStatus, filterPriority, sortOption]);

  const handleSort = (field: SortField) => {
    setSortOption(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc
    }));
  };

  // --- Chart Data --- //
  const statusChartData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as { [key in TaskStatus]?: number });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const priorityChartData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as { [key in TaskPriority]?: number });

    // Ensure consistent order Low, Medium, High
    const orderedData = [
      { name: TaskPriority.Low, value: counts[TaskPriority.Low] || 0 },
      { name: TaskPriority.Medium, value: counts[TaskPriority.Medium] || 0 },
      { name: TaskPriority.High, value: counts[TaskPriority.High] || 0 },
    ];
    return orderedData;
  }, [tasks]);

  const chartColors = isDarkMode
    ? ['#38bdf8', '#fbbf24', '#34d399', '#f87171', '#a78bfa'] // Lighter/brighter for dark mode
    : ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']; // Standard colors for light mode

  // --- Camera Operations --- //
  const takePicture = () => {
    if (cameraRef.current) {
      const photoDataUrl = cameraRef.current.takePhoto();
      setCapturedImage(photoDataUrl);
    }
  };

  const saveCapturedImage = () => {
    if (taskForCamera && capturedImage) {
      addImageToTask(taskForCamera.id, capturedImage);
      closeCameraModal();
    }
  };

  // --- File Operations (Template Download) --- //
  const downloadTemplate = () => {
    const templateData = [
      {
        title: "Sample Task Title",
        description: "Detailed description of the task",
        status: "To Do", // Must match TaskStatus enum values
        priority: "Medium" // Must match TaskPriority enum values
      }
    ];
    const jsonString = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasks_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const uploadedTasksData = JSON.parse(text);

        if (!Array.isArray(uploadedTasksData)) {
          throw new Error('Invalid file format: Must be a JSON array.');
        }

        const newTasks: Task[] = uploadedTasksData.map((item: any, index: number) => {
          // Basic validation for required fields and enum values
          if (!item.title || typeof item.title !== 'string') throw new Error(`Task ${index + 1}: Missing or invalid title.`);
          if (!item.description || typeof item.description !== 'string') throw new Error(`Task ${index + 1}: Missing or invalid description.`);
          if (!item.status || !Object.values(TaskStatus).includes(item.status as TaskStatus)) throw new Error(`Task ${index + 1}: Invalid status. Use: ${Object.values(TaskStatus).join(', ')}`);
          if (!item.priority || !Object.values(TaskPriority).includes(item.priority as TaskPriority)) throw new Error(`Task ${index + 1}: Invalid priority. Use: ${Object.values(TaskPriority).join(', ')}`);

          return {
            id: `${Date.now()}-${index}`,
            title: item.title,
            description: item.description,
            status: item.status as TaskStatus,
            priority: item.priority as TaskPriority,
            createdAt: Date.now() + index, // Stagger creation time slightly
          };
        });

        // Option 1: Replace existing tasks
        // setTasks(newTasks);
        // Option 2: Add to existing tasks (more user-friendly usually)
        setTasks(prevTasks => [...prevTasks, ...newTasks]);

        alert(`${newTasks.length} tasks imported successfully!`);
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }

      } catch (error) {
        console.error('Error processing uploaded file:', error);
        alert(`Error importing tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Reset file input in case of error too
         if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
      alert('Error reading file.');
       if (event.target) {
          event.target.value = '';
        }
    }
    reader.readAsText(file);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Render --- //
  return (
    <div className={`min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-slate-900 theme-transition-bg min-h-screen flex flex-col">
        {/* --- Header --- */}
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
          <div className="container-wide mx-auto py-4 px-4 sm:px-6 lg:px-8 flex-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 theme-transition-text">Task Manager</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:inline">Light</span>
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:inline">Dark</span>
              <Moon size={16} className={`inline sm:hidden ${isDarkMode ? 'text-yellow-300' : 'text-gray-400'}`} />
               <Sun size={16} className={`inline sm:hidden ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-grow container-wide mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- Left Column (Controls & Charts) --- */}
            <div className="lg:col-span-1 space-y-6">
              {/* Add Task Button */}
              <button
                onClick={() => openModal()}
                className="btn btn-primary w-full flex-center gap-2 btn-responsive"
                aria-label="Add New Task"
                role="button"
                name="addTaskBtn"
              >
                <Plus size={20} /> Add New Task
              </button>

               {/* Import/Export */}
              <div className="card card-responsive">
                <h3 className="text-lg font-medium mb-3">Import / Export</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                   <button
                     onClick={downloadTemplate}
                     className="btn bg-blue-500 hover:bg-blue-600 text-white w-full flex-center gap-2 btn-sm"
                     aria-label="Download Task Template"
                     role="button"
                     name="downloadTemplateBtn"
                   >
                     <Download size={16} /> Template
                   </button>
                   <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                      id="task-file-upload"
                    />
                   <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn bg-green-500 hover:bg-green-600 text-white w-full flex-center gap-2 btn-sm"
                      aria-label="Upload Tasks File"
                      role="button"
                      name="uploadTasksBtn"
                   >
                    <Upload size={16} /> Import
                   </button>
                 </div>
              </div>

              {/* Filters Card */}
              <div className="card card-responsive">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><Filter size={18} /> Filters</h3>
                <div className="space-y-4">
                  <div className='form-group'>
                    <label htmlFor="search" className="form-label">Search</label>
                    <div className="relative">
                      <input
                        id="search"
                        type="text"
                        placeholder="Search tasks..."
                        className="input input-responsive pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search tasks"
                        name="searchTasksInput"
                      />
                      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className='form-group'>
                    <label htmlFor="filterStatus" className="form-label">Status</label>
                    <select
                      id="filterStatus"
                      className="input input-responsive"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
                      aria-label="Filter by status"
                      name="filterStatusSelect"
                    >
                      <option value="">All Statuses</option>
                      {Object.values(TaskStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className='form-group'>
                    <label htmlFor="filterPriority" className="form-label">Priority</label>
                    <select
                      id="filterPriority"
                      className="input input-responsive"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}
                      aria-label="Filter by priority"
                      name="filterPrioritySelect"
                    >
                      <option value="">All Priorities</option>
                      {Object.values(TaskPriority).map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Charts Card */}
              <div className="card card-responsive">
                <h3 className="text-lg font-medium mb-4">Task Overview</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Tasks by Status</h4>
                    {statusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            className={`text-xs ${styles.pieLabel}`}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                       <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">No data to display.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Tasks by Priority</h4>
                     {priorityChartData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={priorityChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                          <XAxis type="number" allowDecimals={false} stroke={isDarkMode ? "#94a3b8" : "#6b7280"} />
                          <YAxis dataKey="name" type="category" width={60} stroke={isDarkMode ? "#94a3b8" : "#6b7280"} />
                          <Tooltip cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}/>
                          <Bar dataKey="value" barSize={20}>
                             {priorityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                     ) : (
                        <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">No data to display.</p>
                     )}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Column (Task List) --- */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 shadow rounded-lg theme-transition-bg">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Tasks ({filteredAndSortedTasks.length})</h2>
                  {/* Sorting Controls could go here if not using table headers */}
                </div>

                {filteredAndSortedTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table min-w-full" role="table">
                      <thead role="rowgroup">
                        <tr role="row">
                          <th className="table-header px-4 py-3" role="columnheader">
                            <button onClick={() => handleSort(SortField.Title)} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 w-full" aria-label={`Sort by Title ${sortOption.field === SortField.Title ? (sortOption.direction === SortDirection.Asc ? '(Ascending)' : '(Descending)') : ''}`}>
                              Title
                              {sortOption.field === SortField.Title && (sortOption.direction === SortDirection.Asc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                              {sortOption.field !== SortField.Title && <ArrowDownUp size={14} className="text-gray-400 dark:text-slate-500"/>}
                            </button>
                          </th>
                          <th className="table-header px-4 py-3" role="columnheader">Status</th>
                          <th className="table-header px-4 py-3 hidden md:table-cell" role="columnheader">
                             <button onClick={() => handleSort(SortField.Priority)} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 w-full" aria-label={`Sort by Priority ${sortOption.field === SortField.Priority ? (sortOption.direction === SortDirection.Asc ? '(Ascending)' : '(Descending)') : ''}`}>
                              Priority
                              {sortOption.field === SortField.Priority && (sortOption.direction === SortDirection.Asc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                              {sortOption.field !== SortField.Priority && <ArrowDownUp size={14} className="text-gray-400 dark:text-slate-500"/>}
                            </button>
                          </th>
                          <th className="table-header px-4 py-3 hidden lg:table-cell" role="columnheader">
                            <button onClick={() => handleSort(SortField.CreatedAt)} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 w-full" aria-label={`Sort by Date Created ${sortOption.field === SortField.CreatedAt ? (sortOption.direction === SortDirection.Asc ? '(Ascending)' : '(Descending)') : ''}`}>
                              Created
                              {sortOption.field === SortField.CreatedAt && (sortOption.direction === SortDirection.Asc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                              {sortOption.field !== SortField.CreatedAt && <ArrowDownUp size={14} className="text-gray-400 dark:text-slate-500"/>}
                            </button>
                          </th>
                          <th className="table-header px-4 py-3" role="columnheader">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700" role="rowgroup">
                        {filteredAndSortedTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition-bg" role="row">
                            <td className="table-cell px-4 py-3 max-w-xs" role="cell">
                              <div className="font-medium text-gray-900 dark:text-white truncate" title={task.title}>{task.title}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate" title={task.description}>{task.description}</div>
                            </td>
                            <td className="table-cell px-4 py-3" role="cell">
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                className={`input input-sm text-xs p-1 appearance-none border-none focus:ring-0 rounded ${task.status === TaskStatus.ToDo ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : task.status === TaskStatus.InProgress ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}
                                aria-label={`Status for task ${task.title}`}
                                name={`status-${task.id}`}
                              >
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                             <td className="table-cell px-4 py-3 hidden md:table-cell" role="cell">
                                <span className={`badge text-xs ${task.priority === TaskPriority.High ? 'badge-error' : task.priority === TaskPriority.Medium ? 'badge-warning' : 'badge-info'}`}>
                                  {task.priority}
                                </span>
                             </td>
                            <td className="table-cell px-4 py-3 text-xs text-gray-500 dark:text-slate-400 hidden lg:table-cell" role="cell">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </td>
                            <td className="table-cell px-4 py-3" role="cell">
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <button
                                  onClick={() => openCameraModal(task)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  aria-label={`Add or View Image for ${task.title}`}
                                  title={task.imageUrl ? "View Image" : "Add Image"}
                                  name={`cameraBtn-${task.id}`}
                                >
                                  {task.imageUrl ? <ImageIcon size={16} /> : <CameraIcon size={16} />}
                                </button>
                                <button
                                  onClick={() => openModal(task)}
                                  className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                                  aria-label={`Edit task ${task.title}`}
                                  title="Edit Task"
                                  name={`editBtn-${task.id}`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  aria-label={`Delete task ${task.title}`}
                                  title="Delete Task"
                                  name={`deleteBtn-${task.id}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 px-4">
                    <AlertCircle size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
                    <p className="text-gray-500 dark:text-slate-400">
                      {tasks.length === 0 ? 'No tasks yet. Add one to get started!' : 'No tasks match your current filters.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* --- Footer --- */}
        <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </footer>

        {/* --- Task Modal --- */}
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={editingTask ? (data) => updateTask(editingTask.id, data) : addTask}
            task={editingTask}
          />
        )}

        {/* --- Camera Modal --- */}
        {isCameraModalOpen && taskForCamera && (
          <CameraModal
            isOpen={isCameraModalOpen}
            onClose={closeCameraModal}
            cameraRef={cameraRef}
            takePicture={takePicture}
            savePicture={saveCapturedImage}
            capturedImage={capturedImage}
            clearCapturedImage={() => setCapturedImage(null)}
            taskTitle={taskForCamera.title}
          />
        )}
      </div>
    </div>
  );
};

// --- Task Form/Modal Component (kept within App.tsx) --- //
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  task: Task | null; // Task being edited, null for new task
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: task ? { title: task.title, description: task.description, status: task.status, priority: task.priority } : { status: TaskStatus.ToDo, priority: TaskPriority.Medium },
  });

  useEffect(() => {
    // Reset form when task changes (e.g., opening modal for different task or new task)
    reset(task ? { title: task.title, description: task.description, status: task.status, priority: task.priority } : { title: '', description: '', status: TaskStatus.ToDo, priority: TaskPriority.Medium });
  }, [task, reset]);

  const handleFormSubmit: SubmitHandler<TaskFormData> = (data) => {
    onSubmit(data);
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fade-in theme-transition-all"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content theme-transition-all w-full max-w-lg"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="modal-header">
          <h3 id="modal-title" className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
            name="closeModalBtn"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              {...register('title', { required: 'Title is required' })}
              className={`input ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
              name="title"
            />
            {errors.title && <p id="title-error" className="form-error" role="alert">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              className={`input h-24 resize-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={errors.description ? "description-error" : undefined}
              name="description"
            />
            {errors.description && <p id="description-error" className="form-error" role="alert">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                {...register('status')}
                className={`input ${errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={errors.status ? "true" : "false"}
                name="status"
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">Priority</label>
              <select
                id="priority"
                {...register('priority')}
                className={`input ${errors.priority ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={errors.priority ? "true" : "false"}
                name="priority"
              >
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
              aria-label="Cancel"
              name="cancelModalBtn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-center gap-1"
              aria-label={task ? "Save Changes" : "Add Task"}
              name={task ? "saveChangesBtn" : "addTaskSubmitBtn"}
            >
              <Check size={18} /> {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Camera Modal Component --- //
interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    cameraRef: React.RefObject<CameraRef>;
    takePicture: () => void;
    savePicture: () => void;
    capturedImage: string | null;
    clearCapturedImage: () => void;
    taskTitle: string;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, cameraRef, takePicture, savePicture, capturedImage, clearCapturedImage, taskTitle }) => {
    if (!isOpen) return null;

    return (
        <div
            className="modal-backdrop fade-in theme-transition-all"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="camera-modal-title"
        >
            <div
                className="modal-content theme-transition-all w-full max-w-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 id="camera-modal-title" className="text-xl font-semibold">Add Image for "{taskTitle}"</h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label="Close camera modal"
                      name="closeCameraModalBtn"
                     >
                      <X size={24} />
                    </button>
                </div>

                <div className="mt-4">
                    {capturedImage ? (
                        <div className="text-center space-y-4">
                          <img src={capturedImage} alt="Captured task visual" className="max-w-full h-auto max-h-96 mx-auto rounded shadow"/>
                          <div className="flex justify-center gap-4">
                            <button onClick={clearCapturedImage} className="btn bg-yellow-500 hover:bg-yellow-600 text-white flex-center gap-1 btn-responsive">
                              <ArrowLeftRight size={16}/> Retake
                            </button>
                            <button onClick={savePicture} className="btn btn-primary flex-center gap-1 btn-responsive">
                              <Check size={16}/> Use Image
                            </button>
                          </div>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                          <div className={`${styles.cameraContainer} bg-gray-200 dark:bg-slate-700 rounded overflow-hidden shadow`}>
                              <Camera ref={cameraRef} aspectRatio={16 / 9} errorMessages={{ noCameraDeviceSelected: 'No camera device detected or selected.'}} />
                          </div>
                          <button
                            onClick={takePicture}
                            className="btn btn-secondary w-full flex-center gap-2 btn-responsive"
                            aria-label="Take Picture"
                            name="takePictureBtn"
                          >
                             <CameraIcon size={20} /> Take Picture
                          </button>
                        </div>
                    )}
                </div>

                 <div className="modal-footer">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                      aria-label="Cancel Image Capture"
                      name="cancelCameraModalBtn"
                    >
                      Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
