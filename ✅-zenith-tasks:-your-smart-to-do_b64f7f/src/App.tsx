import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import { useForm, Controller } from 'react-hook-form';
import { format, parseISO, addDays, isValid } from 'date-fns';
import {
    LayoutDashboard, CheckCircle2, ListTodo, Plus, BrainCircuit, Sun, Moon, Settings, Trash2, Edit, X,
    ChevronDown, ArrowDownUp, Filter, BarChart2, Download, Upload, AlertCircle, FileText, Calendar as CalendarIcon, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell as RechartsCell } from 'recharts';

// Import AI Layer components
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

// Type Definitions
type Priority = 'low' | 'medium' | 'high';
type FilterStatus = 'all' | 'active' | 'completed';
type SortKey = 'createdAt' | 'dueDate' | 'priority';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    priority: Priority;
    dueDate: string | null;
    createdAt: string;
}

type TaskFormData = {
    title: string;
    priority: Priority;
    dueDate: string;
};

// Main App Component
const App = () => {
    const { currentUser, logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'tasks' | 'dashboard' | 'settings'>('tasks');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // holds task id
    const [showNukeConfirm, setShowNukeConfirm] = useState(false);

    // AI Layer State and Ref
    const aiLayerRef = useRef<AILayerHandle>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const storageKey = useMemo(() => currentUser ? `zenith_tasks_${currentUser.id}` : null, [currentUser]);
    
    // Load data from localStorage
    useEffect(() => {
        if (storageKey) {
            try {
                const savedTasks = localStorage.getItem(storageKey);
                if (savedTasks) {
                    setTasks(JSON.parse(savedTasks));
                }
                const savedTheme = localStorage.getItem('zenith_theme');
                if (savedTheme) {
                    const isDark = savedTheme === 'dark';
                    setIsDarkMode(isDark);
                    document.documentElement.classList.toggle('dark', isDark);
                } else {
                     const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                     setIsDarkMode(prefersDark);
                     document.documentElement.classList.toggle('dark', prefersDark);
                }
            } catch (error) {
                console.error("Failed to load data from localStorage", error);
            }
        }
    }, [storageKey]);

    // Save data to localStorage
    useEffect(() => {
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(tasks));
            } catch (error) {
                console.error("Failed to save tasks to localStorage", error);
            }
        }
    }, [tasks, storageKey]);

    // Theme toggle effect
    const toggleTheme = () => {
        const newIsDarkMode = !isDarkMode;
        setIsDarkMode(newIsDarkMode);
        document.documentElement.classList.toggle('dark', newIsDarkMode);
        localStorage.setItem('zenith_theme', newIsDarkMode ? 'dark' : 'light');
    };
    
    // React Hook Form for Edit Modal
    const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
        defaultValues: { title: '', priority: 'medium', dueDate: '' }
    });

    const openEditModal = (task: Task) => {
        setTaskToEdit(task);
        reset({
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : ''
        });
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setTaskToEdit(null);
        reset();
    };
    
    const handleAddTask = (title: string, priority: Priority = 'medium', dueDate: string | null = null) => {
        if (title.trim() === '') return;
        const newTask: Task = {
            id: new Date().toISOString(),
            title: title.trim(),
            completed: false,
            priority,
            createdAt: new Date().toISOString(),
            dueDate: dueDate,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    };
    
    const handleUpdateTask = (data: TaskFormData) => {
        if (!taskToEdit) return;
        setTasks(tasks.map(t => t.id === taskToEdit.id ? {
            ...t,
            title: data.title,
            priority: data.priority,
            dueDate: data.dueDate ? parseISO(data.dueDate).toISOString() : null
        } : t));
        closeEditModal();
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
        setShowDeleteConfirm(null);
    };

    const toggleTaskCompletion = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    // AI "Smart Add" Handler
    const handleSmartAdd = () => {
        if (!aiPrompt.trim()) {
            setAiError("Please enter a command for the AI to process.");
            return;
        }

        const internalPrompt = `
            Parse the following user request to create a task. Extract the title, dueDate, and priority.
            - The priority must be one of 'low', 'medium', 'high'. If not specified, default to 'medium'.
            - The dueDate should be in 'YYYY-MM-DD' format. Today is ${format(new Date('2025-06-08'), 'yyyy-MM-dd')}.
            - The title should be a concise action item.
            - Return the result as a JSON object with keys "title", "dueDate", and "priority".
            - Example: "buy milk tomorrow" -> {"title": "Buy milk", "dueDate": "2025-06-09", "priority": "medium"}
            - Example: "schedule dentist appointment for next wednesday high priority" -> {"title": "Schedule dentist appointment", "dueDate": "2025-06-18", "priority": "high"}
            
            User request: "${aiPrompt}"
        `;

        setAiResult(null);
        setAiError(null);
        aiLayerRef.current?.sendToAI(internalPrompt);
    };
    
    useEffect(() => {
        if (aiResult) {
            try {
                const parsedResult = JSON.parse(aiResult);
                const { title, dueDate, priority } = parsedResult;

                if (typeof title !== 'string' || !title.trim()) {
                    throw new Error("AI response missing a valid title.");
                }

                const validPriorities: Priority[] = ['low', 'medium', 'high'];
                const taskPriority: Priority = validPriorities.includes(priority) ? priority : 'medium';
                
                let taskDueDate: string | null = null;
                if (dueDate && typeof dueDate === 'string') {
                    const parsedDate = parseISO(dueDate);
                    if (isValid(parsedDate)) {
                        taskDueDate = parsedDate.toISOString();
                    }
                }
                
                handleAddTask(title, taskPriority, taskDueDate);
                setAiPrompt(''); // Clear input on success
            } catch (e) {
                console.error("Failed to parse AI response:", e);
                setAiError("The AI response was unclear. Please try rephrasing your request.");
            }
        }
    }, [aiResult]);

    // Filtering and Sorting Logic
    const filteredAndSortedTasks = useMemo(() => {
        const priorityOrder: Record<Priority, number> = { high: 1, medium: 2, low: 3 };

        return tasks
            .filter(task => {
                const matchesFilter = filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed);
                const matchesSearch = searchTerm === '' || task.title.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesFilter && matchesSearch;
            })
            .sort((a, b) => {
                switch (sortKey) {
                    case 'dueDate':
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    case 'priority':
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    case 'createdAt':
                    default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });
    }, [tasks, filter, searchTerm, sortKey]);

    // Dashboard Data
    const dashboardData = useMemo(() => {
        const completed = tasks.filter(t => t.completed).length;
        const active = tasks.length - completed;
        const overdue = tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < new Date('2025-06-08')).length;
        
        const priorityCounts = tasks.reduce((acc, task) => {
            if (!task.completed) {
               acc[task.priority] = (acc[task.priority] || 0) + 1;
            }
            return acc;
        }, {} as Record<Priority, number>);

        const barChartData = [
            { name: 'Low', count: priorityCounts.low || 0 },
            { name: 'Medium', count: priorityCounts.medium || 0 },
            { name: 'High', count: priorityCounts.high || 0 },
        ];

        const pieChartData = [
            { name: 'Completed', value: completed },
            { name: 'Active', value: active },
        ];
        
        return { completed, active, overdue, total: tasks.length, barChartData, pieChartData };
    }, [tasks]);

    // Data Export/Import
    const handleExport = () => {
        const headers = "id,title,completed,priority,dueDate,createdAt";
        const csvContent = "data:text/csv;charset=utf-t8,"
            + headers + "\n"
            + tasks.map(t => `${t.id},"${t.title.replace(/"/g, '""')}",${t.completed},${t.priority},${t.dueDate || ''},${t.createdAt}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `zenith_tasks_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const rows = text.split('\n').slice(1); // skip header
                const importedTasks: Task[] = rows.map(row => {
                    const [id, title, completed, priority, dueDate, createdAt] = row.split(',');
                    return {
                        id: id || new Date().toISOString() + Math.random(),
                        title: title?.replace(/"/g, '') || 'Untitled Task',
                        completed: completed === 'true',
                        priority: ['low', 'medium', 'high'].includes(priority) ? priority as Priority : 'medium',
                        dueDate: dueDate || null,
                        createdAt: createdAt || new Date().toISOString(),
                    };
                }).filter(t => t.title !== 'Untitled Task');
                setTasks(prev => [...prev, ...importedTasks]);
            } catch (error) {
                console.error("Error importing CSV", error);
                alert("Failed to import tasks. Please check the file format.");
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const headers = "id,title,completed,priority,dueDate,createdAt";
        const exampleRow = `task-1,"Example: Review project proposal",false,high,${addDays(new Date('2025-06-08'), 5).toISOString()},${new Date('2025-06-08').toISOString()}`;
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + exampleRow;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tasks_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const deleteAllData = () => {
        setTasks([]);
        setShowNukeConfirm(false);
    };

    const PIE_COLORS = ['#4ade80', '#facc15']; // green-400, yellow-400

    const renderHeader = () => (
        <header id="app-header" className="flex-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 theme-transition sticky top-0 z-20">
            <div className="flex-start gap-3">
                <ListTodo className="h-8 w-8 text-primary-600" />
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Zenith Tasks</h1>
            </div>
            <div className="flex-center gap-4">
                <span className="hidden md:inline text-sm text-slate-600 dark:text-slate-300">
                    Welcome, {currentUser?.first_name || 'User'}
                </span>
                <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 theme-transition">
                    {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
                </button>
                <button onClick={logout} className="btn btn-sm bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500">
                    Logout
                </button>
            </div>
        </header>
    );

    const renderTabs = () => (
        <nav className="flex-start border-b border-slate-200 dark:border-slate-700 px-4">
            <button id="tasks-tab" onClick={() => setActiveTab('tasks')} className={`${styles.tab} ${activeTab === 'tasks' ? styles.tabActive : ''}`}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Tasks
            </button>
            <button id="dashboard-tab" onClick={() => setActiveTab('dashboard')} className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}>
                <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
            </button>
            <button id="settings-tab" onClick={() => setActiveTab('settings')} className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}>
                <Settings className="h-4 w-4 mr-2" /> Settings
            </button>
        </nav>
    );

    const TaskInput = ({ onAddTask, onSmartAdd }: { onAddTask: (title: string) => void; onSmartAdd: () => void; }) => {
        const [title, setTitle] = useState('');
        
        const handleRegularAdd = (e: React.FormEvent) => {
            e.preventDefault();
            onAddTask(title);
            setTitle('');
        };
        
        return (
            <div className="space-y-4">
                <form onSubmit={handleRegularAdd} className="flex gap-2">
                    <input
                        id="add-task-input"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="input flex-grow"
                    />
                    <button type="submit" className="btn btn-primary flex-center gap-2">
                        <Plus className="h-4 w-4" /> Add
                    </button>
                </form>
                <div className="relative">
                    <input
                        id="smart-add-input"
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Or use AI: Review report by Friday at 5pm priority high"
                        className="input w-full pr-28"
                        onKeyDown={(e) => e.key === 'Enter' && onSmartAdd()}
                    />
                    <button
                        id="smart-add-button"
                        onClick={onSmartAdd}
                        className="btn btn-primary absolute right-1 top-1/2 -translate-y-1/2 flex-center gap-2"
                        disabled={isAiLoading}
                    >
                        {isAiLoading ? <div className={styles.loader}></div> : <BrainCircuit className="h-4 w-4" />}
                        Smart Add
                    </button>
                </div>
                 {aiError && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={16}/> {aiError}</p>}
                 {isAiLoading && <p className="text-sm text-blue-500">AI is thinking...</p>}
                 <p className="text-xs text-slate-500 dark:text-slate-400">AI can make mistakes. Check important info.</p>
            </div>
        );
    };

    const renderTaskItem = (task: Task) => {
        const priorityClasses: Record<Priority, string> = {
            low: 'border-l-blue-400',
            medium: 'border-l-yellow-400',
            high: 'border-l-red-500'
        };
        return (
            <div key={task.id} id={`task-${task.id}`} className={`card-sm flex-between gap-4 theme-transition-all border-l-4 ${priorityClasses[task.priority]} ${task.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-800' : ''}`}>
                <div className="flex-start gap-4 flex-grow">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                        id={`task-checkbox-${task.id}`}
                    />
                    <div className="flex-grow">
                        <p className={`text-slate-800 dark:text-slate-100 ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                        {task.dueDate && (
                            <div className="flex-start gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-center gap-2">
                    <button onClick={() => openEditModal(task)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Edit task">
                        <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(task.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" aria-label="Delete task">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                </div>
            </div>
        );
    };

    const renderTasksView = () => (
        <div className="space-y-6">
            <TaskInput onAddTask={handleAddTask} onSmartAdd={handleSmartAdd} />
            
            <div id="filter-controls" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input w-full md:w-auto"
                    />
                </div>
                <div className="flex-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <select value={filter} onChange={(e) => setFilter(e.target.value as FilterStatus)} className="input input-sm">
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                     <div className="flex items-center gap-2">
                        <ArrowDownUp className="h-4 w-4 text-slate-500" />
                        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="input input-sm">
                            <option value="createdAt">Date Added</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map(renderTaskItem)
                ) : (
                    <div id="generation_issue_fallback" className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Zap className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No tasks found</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {tasks.length === 0 ? "Get started by adding a new task above." : "Try adjusting your search or filters."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDashboardView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div id="stat-total" className="stat-card">
                    <div className="stat-title">Total Tasks</div>
                    <div className="stat-value">{dashboardData.total}</div>
                </div>
                <div id="stat-active" className="stat-card">
                    <div className="stat-title">Active</div>
                    <div className="stat-value">{dashboardData.active}</div>
                </div>
                <div id="stat-completed" className="stat-card">
                    <div className="stat-title">Completed</div>
                    <div className="stat-value">{dashboardData.completed}</div>
                </div>
                <div id="stat-overdue" className="stat-card">
                    <div className="stat-title">Overdue</div>
                    <div className="stat-value text-red-500">{dashboardData.overdue}</div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-semibold text-lg mb-4">Task Status</h3>
                    <div style={{width: '100%', height: 300}}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={dashboardData.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {dashboardData.pieChartData.map((entry, index) => (
                                        <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <h3 className="font-semibold text-lg mb-4">Active Tasks by Priority</h3>
                    <div style={{width: '100%', height: 300}}>
                        <ResponsiveContainer>
                            <BarChart data={dashboardData.barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-bg-secondary)" />
                                <XAxis dataKey="name" stroke="var(--color-text-base)" />
                                <YAxis allowDecimals={false} stroke="var(--color-text-base)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-bg-secondary)'}} />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderSettingsView = () => (
         <div className="space-y-8 max-w-2xl mx-auto">
            <div id="settings-import-export" className="card">
                <h3 className="text-lg font-medium">Data Management</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Export your tasks or import them from a CSV file.</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <button onClick={handleExport} className="btn btn-primary w-full sm:w-auto flex-center gap-2"><Download className="h-4 w-4"/> Export to CSV</button>
                    <label className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:border-slate-500 w-full sm:w-auto flex-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4"/> Import from CSV
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                </div>
                <div className="mt-4">
                    <button onClick={downloadTemplate} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                        <FileText size={14}/> Download CSV template
                    </button>
                </div>
            </div>

            <div id="settings-danger-zone" className="card border-red-500 border">
                 <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This action cannot be undone. This will permanently delete all your tasks.</p>
                 <div className="mt-4">
                    <button onClick={() => setShowNukeConfirm(true)} className="btn bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto flex-center gap-2">
                        <Trash2 className="h-4 w-4" /> Delete All Tasks
                    </button>
                 </div>
            </div>
        </div>
    );
    
    // Key press handler for closing modals with Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isModalOpen) closeEditModal();
                if (showDeleteConfirm) setShowDeleteConfirm(null);
                if (showNukeConfirm) setShowNukeConfirm(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, showDeleteConfirm, showNukeConfirm]);

    if (!currentUser) {
        return <div className="flex-center h-screen bg-slate-100">Loading...</div>;
    }

    return (
        <div id="welcome_fallback" className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50 theme-transition">
            {renderHeader()}
            <main className="flex-grow overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 theme-transition">
                   {renderTabs()}
                </div>
                <div className="p-4 md:p-6 lg:p-8">
                    {activeTab === 'tasks' && renderTasksView()}
                    {activeTab === 'dashboard' && renderDashboardView()}
                    {activeTab === 'settings' && renderSettingsView()}
                </div>
            </main>

            <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </footer>

            {/* AI Layer Component (Headless) */}
            <AILayer
                ref={aiLayerRef}
                prompt={aiPrompt}
                onResult={setAiResult}
                onError={(err) => setAiError(err.message || 'An unknown AI error occurred.')}
                onLoading={setIsAiLoading}
            />

            {/* Edit Task Modal */}
            {isModalOpen && taskToEdit && (
                 <div className="modal-backdrop" onClick={closeEditModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmit(handleUpdateTask)}>
                            <div className="modal-header">
                                <h3 id="modal-title" className="text-lg font-medium">Edit Task</h3>
                                <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-600"><X /></button>
                            </div>
                            <div className="mt-4 space-y-4">
                                <div className="form-group">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={{ required: 'Title is required' }}
                                        render={({ field }) => <input {...field} id="title" className="input" />}
                                    />
                                    {errors.title && <p className="form-error">{errors.title.message}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="priority" className="form-label">Priority</label>
                                    <Controller
                                        name="priority"
                                        control={control}
                                        render={({ field }) => (
                                            <select {...field} id="priority" className="input">
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        )}
                                    />
                                </div>
                                 <div className="form-group">
                                    <label htmlFor="dueDate" className="form-label">Due Date</label>
                                    <Controller
                                        name="dueDate"
                                        control={control}
                                        render={({ field }) => <input {...field} type="date" id="dueDate" className="input" />}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={closeEditModal} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
             {/* Delete Task Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3 className="text-lg font-medium">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="modal-footer">
                            <button onClick={() => setShowDeleteConfirm(null)} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                            <button onClick={() => handleDeleteTask(showDeleteConfirm)} className="btn bg-red-600 text-white hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete All Data Confirmation Modal */}
            {showNukeConfirm && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="flex-start gap-3">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-medium">Delete all tasks?</h3>
                                <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete all tasks? This will permanently remove all your data. This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowNukeConfirm(false)} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                            <button onClick={deleteAllData} className="btn bg-red-600 text-white hover:bg-red-700">Yes, delete all</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;