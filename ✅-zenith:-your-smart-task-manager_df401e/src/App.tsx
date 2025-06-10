import React, { useState, useEffect, useMemo, useRef, useCallback, FC } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format, parseISO, isPast, isToday } from 'date-fns';
import {
    LayoutDashboard, LogOut, Sun, Moon, Menu, Plus, Settings, Trash2, Edit, GripVertical,
    List, LayoutGrid, BrainCircuit, ChevronDown, Calendar, Tag, Filter, X, Search, CheckCircle2, Circle, AlertTriangle, ArrowUp, ArrowDown, Download, Upload, Eye, EyeOff
} from 'lucide-react';
import AILayer from './components/AILayer';


// TYPES AND INTERFACES
interface AILayerHandle {
    sendToAI: (prompt: string) => void;
}
type Priority = 'Low' | 'Medium' | 'High' | 'None';
type Status = 'Todo' | 'In Progress' | 'Done';
type ViewMode = 'list' | 'kanban';
type Theme = 'light' | 'dark';
type ActiveTab = 'tasks' | 'ai_assistant' | 'settings';

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    status: Status;
    projectId: string;
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
    color: string;
}

interface SortConfig {
    key: keyof Task | 'none';
    direction: 'ascending' | 'descending';
}

interface FilterConfig {
    status: Status | 'all';
    priority: Priority | 'all';
    projectId: string | 'all';
    searchTerm: string;
}

// CONSTANTS
const PRIORITY_STYLES: Record<Priority, { iconColor: string, badge: string }> = {
    'High': { iconColor: 'text-red-500', badge: 'badge-error' },
    'Medium': { iconColor: 'text-yellow-500', badge: 'badge-warning' },
    'Low': { iconColor: 'text-blue-500', badge: 'badge-primary' },
    'None': { iconColor: 'text-gray-400', badge: 'badge-gray' },
};

const STATUS_OPTIONS: Status[] = ['Todo', 'In Progress', 'Done'];

const KANBAN_COLUMNS: Record<Status, string> = {
    'Todo': 'To Do',
    'In Progress': 'In Progress',
    'Done': 'Done'
};

const App: FC = () => {
    const { currentUser, logout } = useAuth();

    // STATE MANAGEMENT
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [theme, setTheme] = useState<Theme>('light');
    const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [modal, setModal] = useState<{ type: 'task' | 'project' | 'confirm' | 'ai-results' | null, data?: any }>({ type: null });
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
    const [filters, setFilters] = useState<FilterConfig>({ status: 'all', priority: 'all', projectId: 'all', searchTerm: '' });

    // AI RELATED STATE
    const aiLayerRef = useRef<AILayerHandle>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<any | null>(null);
    const [generatedTasks, setGeneratedTasks] = useState<Partial<Task>[]>([]);

    // HOOKS
    useEffect(() => {
        const storedTasks = localStorage.getItem('zenith_tasks');
        const storedProjects = localStorage.getItem('zenith_projects');
        const storedTheme = localStorage.getItem('zenith_theme') as Theme;

        if (storedTasks) setTasks(JSON.parse(storedTasks));
        if (storedProjects) setProjects(JSON.parse(storedProjects));
        else {
            // Add default project if none exist
            const defaultProject: Project = { id: 'proj-1', name: 'General', color: '#3b82f6' };
            setProjects([defaultProject]);
        }
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        }

        // Add a fallback ID if the tour system needs it
        document.body.id = "welcome_fallback";
    }, []);

    useEffect(() => {
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('zenith_projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('zenith_theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              setModal({ type: null });
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);


    // DATA COMPUTATION
    const filteredAndSortedTasks = useMemo(() => {
        let sortedTasks = [...tasks];

        // Filtering
        sortedTasks = sortedTasks.filter(task => {
            const statusMatch = filters.status === 'all' || task.status === filters.status;
            const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
            const projectMatch = filters.projectId === 'all' || task.projectId === filters.projectId;
            const searchMatch = filters.searchTerm === '' || task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || (task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
            return statusMatch && priorityMatch && projectMatch && searchMatch;
        });

        // Sorting
        if (sortConfig.key !== 'none') {
            sortedTasks.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === undefined || bValue === undefined) return 0;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortedTasks;
    }, [tasks, filters, sortConfig]);

    const kanbanTasks = useMemo(() => {
        return filteredAndSortedTasks.reduce((acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        }, {} as Record<Status, Task[]>);
    }, [filteredAndSortedTasks]);

    // HANDLERS
    const handleSort = (key: keyof Task | 'none') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const handleTaskSave = (taskData: Task) => {
        if (taskData.id) {
            setTasks(tasks.map(t => t.id === taskData.id ? taskData : t));
        } else {
            setTasks([...tasks, { ...taskData, id: `task-${Date.now()}`, createdAt: new Date().toISOString() }]);
        }
        setModal({ type: null });
    };
    
    const handleProjectSave = (projectData: Project) => {
        if (projectData.id) {
            setProjects(projects.map(p => p.id === projectData.id ? projectData : p));
        } else {
            setProjects([...projects, { ...projectData, id: `proj-${Date.now()}` }]);
        }
        setModal({ type: null });
    };

    const handleDelete = (id: string, type: 'task' | 'project') => {
        setModal({ type: 'confirm', data: { id, type, onConfirm: () => {
            if (type === 'task') {
                setTasks(tasks.filter(t => t.id !== id));
            } else {
                setProjects(projects.filter(p => p.id !== id));
                // Optional: Re-assign tasks from deleted project to 'General'
                const generalProject = projects.find(p => p.name === 'General');
                if (generalProject) {
                    setTasks(tasks.map(t => t.projectId === id ? { ...t, projectId: generalProject.id } : t));
                }
            }
            setModal({ type: null });
        }}});
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (viewMode === 'list') {
            if (source.droppableId === destination.droppableId && source.index !== destination.index) {
                const items = Array.from(filteredAndSortedTasks);
                const [reorderedItem] = items.splice(source.index, 1);
                items.splice(destination.index, 0, reorderedItem);
                
                // This reordering is visual only. For persistence, you'd need an 'order' property on tasks.
                // For simplicity, we'll just update the main tasks array to reflect this reorder, though it might get overridden by sorting.
                const newTasksOrder = items.map(item => tasks.find(t => t.id === item.id)).filter(Boolean) as Task[];
                const otherTasks = tasks.filter(t => !newTasksOrder.some(nt => nt.id === t.id));
                setTasks([...newTasksOrder, ...otherTasks]);
            }
        } else { // Kanban view
            const sourceColumn = source.droppableId as Status;
            const destColumn = destination.droppableId as Status;
            const taskToMove = tasks.find(t => t.id === draggableId);
            
            if (!taskToMove) return;

            if (sourceColumn === destColumn) {
                // Reordering within the same column
                const columnTasks = Array.from(kanbanTasks[sourceColumn]);
                const [reorderedItem] = columnTasks.splice(source.index, 1);
                columnTasks.splice(destination.index, 0, reorderedItem);
                
                // As with list view, this is tricky without an order property.
            } else {
                // Moving to a different column
                setTasks(tasks.map(t => t.id === draggableId ? { ...t, status: destColumn } : t));
            }
        }
    };
    
    const handleAiSubmit = () => {
        if (!aiPrompt.trim()) {
            setAiError("Please enter a goal or project description.");
            return;
        }

        setAiResult(null);
        setAiError(null);
        setGeneratedTasks([]);

        const internalPrompt = `You are a world-class project planning assistant. Your goal is to break down a user's request into actionable tasks.
        User's Goal: "${aiPrompt}"
        Please analyze this goal and generate a list of specific, actionable sub-tasks.
        For each task, provide a concise 'title', and a suggested 'priority' ('High', 'Medium', or 'Low').
        Return your response as a valid JSON array of objects. Each object must have 'title' (string) and 'priority' (string) keys.
        Example response format: [{"title": "Define project scope", "priority": "High"}, {"title": "Create a budget", "priority": "High"}]`;

        aiLayerRef.current?.sendToAI(internalPrompt);
    };

    useEffect(() => {
        if (aiResult) {
            try {
                const parsedResult = JSON.parse(aiResult);
                if (Array.isArray(parsedResult)) {
                    const validTasks: Partial<Task>[] = parsedResult
                        .filter(item => typeof item.title === 'string' && typeof item.priority === 'string')
                        .map(item => ({
                            title: item.title,
                            priority: ['High', 'Medium', 'Low'].includes(item.priority) ? item.priority : 'Medium'
                        }));
                    setGeneratedTasks(validTasks);
                    setModal({ type: 'ai-results' });
                } else {
                    throw new Error("AI response is not a JSON array.");
                }
            } catch (error) {
                console.error("Failed to parse AI response:", error);
                setAiError("The AI returned an unexpected response. Please try a different prompt.");
            }
        }
    }, [aiResult]);

    const addGeneratedTasks = (tasksToAdd: Partial<Task>[], targetProjectId: string) => {
        const newTasks: Task[] = tasksToAdd.map((task, index) => ({
            id: `task-${Date.now()}-${index}`,
            title: task.title || "Untitled Task",
            priority: task.priority || 'Medium',
            status: 'Todo',
            projectId: targetProjectId,
            createdAt: new Date().toISOString(),
        }));
        setTasks(prevTasks => [...prevTasks, ...newTasks]);
        setModal({ type: null });
        setGeneratedTasks([]);
        setAiPrompt('');
    };

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // RENDER FUNCTIONS
    const renderSidebar = () => (
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 px-4">
                    <BrainCircuit className="text-primary-600 h-8 w-8" />
                    <span className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Zenith</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a id="tasks-tab" href="#" onClick={(e) => {e.preventDefault(); setActiveTab('tasks')}} className={`nav-link ${activeTab === 'tasks' ? 'nav-link-active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </a>
                    <a id="ai-assistant-tab" href="#" onClick={(e) => {e.preventDefault(); setActiveTab('ai_assistant')}} className={`nav-link ${activeTab === 'ai_assistant' ? 'nav-link-active' : ''}`}>
                        <BrainCircuit size={20} />
                        <span>AI Assistant</span>
                    </a>
                    <a id="settings-tab" href="#" onClick={(e) => {e.preventDefault(); setActiveTab('settings')}} className={`nav-link ${activeTab === 'settings' ? 'nav-link-active' : ''}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </a>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="avatar avatar-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-semibold">
                            {currentUser?.first_name?.charAt(0)}{currentUser?.last_name?.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{currentUser?.first_name} {currentUser?.last_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-secondary w-full mt-4">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );

    const renderHeader = () => (
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="btn btn-ghost lg:hidden">
                <Menu />
            </button>
            <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {activeTab === 'tasks' ? 'Task Dashboard' : activeTab === 'ai_assistant' ? 'AI Assistant' : 'Settings'}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <button id="add-task-button" onClick={() => setModal({ type: 'task', data: { status: 'Todo', priority: 'Medium', projectId: projects[0]?.id || '' } })} className="btn btn-primary hidden sm:flex">
                    <Plus size={16} />
                    <span>Add Task</span>
                </button>
                <button onClick={toggleTheme} className="btn btn-ghost">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
        </header>
    );

    const TaskCard: FC<{ task: Task; index: number }> = ({ task, index }) => {
        const project = projects.find(p => p.id === task.projectId);
        const isTaskPastDue = task.dueDate ? isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) : false;

        return (
            <Draggable draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`card mb-3 ${styles.taskCard} ${snapshot.isDragging ? styles.taskCardDragging : ''} ${task.status === 'Done' ? 'opacity-60' : ''}`}
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <p className={`font-semibold text-gray-800 dark:text-gray-100 ${task.status === 'Done' ? 'line-through' : ''}`}>{task.title}</p>
                                <div className="flex-shrink-0" {...provided.dragHandleProps}>
                                    <GripVertical className="text-gray-400 cursor-grab" size={20}/>
                                </div>
                            </div>
                            {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-4">
                                    <span className={`badge ${PRIORITY_STYLES[task.priority]?.badge}`}>{task.priority}</span>
                                    {project && <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Tag style={{ color: project.color }} className="mr-1" size={16}/> {project.name}
                                    </span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setModal({type: 'task', data: task})} className="btn btn-ghost btn-xs"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(task.id, 'task')} className="btn btn-ghost btn-xs text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            {task.dueDate &&
                                <div className={`flex items-center text-xs mt-2 ${isTaskPastDue ? 'text-red-500' : 'text-gray-500'}`}>
                                    <Calendar size={14} className="mr-1.5"/>
                                    {isTaskPastDue && <AlertTriangle size={14} className="mr-1.5"/>}
                                    <span>{format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
                                </div>
                            }
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };
    
    const TaskRow: FC<{ task: Task; index: number }> = ({ task, index }) => {
        const project = projects.find(p => p.id === task.projectId);
        const isTaskPastDue = task.dueDate ? isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) : false;

        return (
            <Draggable draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                    <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white dark:bg-gray-800 ${snapshot.isDragging ? 'shadow-lg' : ''} ${task.status === 'Done' ? 'opacity-60' : ''}`}
                    >
                         <td className="table-cell w-12 text-center">
                            <div {...provided.dragHandleProps} className="inline-flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600">
                                <GripVertical size={20} />
                            </div>
                        </td>
                        <td className="table-cell">
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleTaskSave({ ...task, status: task.status === 'Done' ? 'Todo' : 'Done' })}>
                                    {task.status === 'Done' ? <CheckCircle2 className="text-green-500"/> : <Circle className="text-gray-400"/>}
                                </button>
                                <span className={`${task.status === 'Done' ? 'line-through' : ''}`}>{task.title}</span>
                            </div>
                        </td>
                        <td className="table-cell">
                             <select 
                                value={task.status} 
                                onChange={(e) => handleTaskSave({ ...task, status: e.target.value as Status })}
                                className="input input-sm bg-transparent border-none focus:ring-0"
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </td>
                        <td className="table-cell">
                            <span className={`badge ${PRIORITY_STYLES[task.priority]?.badge}`}>{task.priority}</span>
                        </td>
                        <td className="table-cell">
                            {task.dueDate ? 
                                <span className={`flex items-center ${isTaskPastDue ? 'text-red-500 font-medium' : ''}`}>
                                    {isTaskPastDue && <AlertTriangle size={14} className="mr-1.5"/>}
                                    {format(parseISO(task.dueDate), 'MMM dd, yyyy')}
                                </span> : 'N/A'
                            }
                        </td>
                        <td className="table-cell">
                            {project ? 
                                <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: project.color }}></div>{project.name}</span>
                                : 'N/A'
                            }
                        </td>
                        <td className="table-cell">
                            <div className="flex items-center gap-1">
                                <button onClick={() => setModal({ type: 'task', data: task })} className="btn btn-ghost btn-xs"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(task.id, 'task')} className="btn btn-ghost btn-xs text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                )}
            </Draggable>
        );
    }
    
    const renderTasksView = () => (
      <div id="tasks-dashboard" className="p-4 md:p-6 space-y-6">
        <div className="card">
            <div className="card-body flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input id="search-tasks" type="text" placeholder="Search tasks..." className="input pl-10" value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select id="filter-by-project" className="select" value={filters.projectId} onChange={e => setFilters({...filters, projectId: e.target.value})}>
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                     <select id="filter-by-priority" className="select" value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value as Priority | 'all'})}>
                        <option value="all">All Priorities</option>
                        {['High', 'Medium', 'Low', 'None'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button className="btn btn-secondary" onClick={() => setFilters({status: 'all', priority: 'all', projectId: 'all', searchTerm: ''})}>
                        <X size={16} /> Clear
                    </button>
                </div>
                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button id="list-view-button" onClick={() => setViewMode('list')} className={`btn btn-sm ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'btn-ghost'}`}><List size={16}/></button>
                    <button id="kanban-view-button" onClick={() => setViewMode('kanban')} className={`btn btn-sm ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'btn-ghost'}`}><LayoutGrid size={16}/></button>
                </div>
            </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
            {viewMode === 'list' ? (
                <div className="table-container">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-header-cell w-12"></th>
                                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('title')}>Title <SortIcon sortKey="title"/></th>
                                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('status')}>Status <SortIcon sortKey="status"/></th>
                                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('priority')}>Priority <SortIcon sortKey="priority"/></th>
                                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('dueDate')}>Due Date <SortIcon sortKey="dueDate"/></th>
                                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('projectId')}>Project <SortIcon sortKey="projectId"/></th>
                                <th className="table-header-cell">Actions</th>
                            </tr>
                        </thead>
                         <Droppable droppableId="taskList">
                            {(provided) => (
                                <tbody ref={provided.innerRef} {...provided.droppableProps} className="table-body">
                                    {filteredAndSortedTasks.length > 0 ? (
                                        filteredAndSortedTasks.map((task, index) => <TaskRow key={task.id} task={task} index={index}/>)
                                    ) : (
                                        <tr><td colSpan={7} className="text-center p-8 text-gray-500">No tasks found. Time to add one!</td></tr>
                                    )}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATUS_OPTIONS.map(status => (
                        <Droppable key={status} droppableId={status}>
                            {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className={`card p-0 ${snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                    <div className="card-header">
                                        <h3 className="font-semibold">{KANBAN_COLUMNS[status]} <span className="text-sm font-normal text-gray-400">{kanbanTasks[status]?.length || 0}</span></h3>
                                    </div>
                                    <div className="card-body min-h-[200px]">
                                        {kanbanTasks[status]?.length > 0 ? kanbanTasks[status]?.map((task, index) => (
                                            <TaskCard key={task.id} task={task} index={index}/>
                                        )) : <p className="text-center text-gray-500 pt-8">No tasks here.</p>}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            )}
        </DragDropContext>
      </div>
    );
    
    const SortIcon: FC<{sortKey: keyof Task}> = ({ sortKey }) => {
        if (sortConfig.key !== sortKey) return <GripVertical size={12} className="inline ml-1 text-gray-400" />;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={12} className="inline ml-1" /> : <ArrowDown size={12} className="inline ml-1" />;
    };

    const renderAiAssistant = () => (
        <div id="ai-assistant-page" className="p-4 md:p-6 flex justify-center">
            <div className="card max-w-2xl w-full">
                <div className="card-header">
                    <h2 className="heading-5">AI Task Decomposer</h2>
                </div>
                <div className="card-body space-y-4">
                    <p className="text-caption">Describe a complex goal or project, and our AI will break it down into manageable tasks for you.</p>
                    <div className="form-group">
                        <label htmlFor="ai-prompt" className="form-label">Your Goal</label>
                        <textarea
                            id="ai-prompt"
                            className="textarea"
                            rows={4}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., 'Plan a surprise birthday party for Sarah' or 'Launch a new marketing campaign for Q4'"
                        />
                    </div>
                     <div className="text-xs text-gray-500">
                        <AlertTriangle className="inline w-4 h-4 mr-1" />
                        AI can make mistakes. Please review generated tasks before adding them.
                    </div>
                    {aiError && <div className="alert alert-error">{aiError}</div>}
                </div>
                <div className="card-footer">
                    <button id="ai-generate-tasks-button" onClick={handleAiSubmit} className={`btn btn-primary ${isAiLoading ? 'btn-loading' : ''}`} disabled={isAiLoading}>
                        {isAiLoading ? 'Generating...' : 'Generate Tasks'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div id="settings-page" className="p-4 md:p-6 space-y-6">
            <div className="card">
                <div className="card-header"><h3 className="heading-5">Manage Projects</h3></div>
                <div className="card-body">
                    <div className="space-y-3">
                    {projects.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }}></div>
                                <span className="font-medium">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setModal({ type: 'project', data: p })} className="btn btn-ghost btn-xs"><Edit size={16} /></button>
                                {p.name !== 'General' && <button onClick={() => handleDelete(p.id, 'project')} className="btn btn-ghost btn-xs text-red-500"><Trash2 size={16} /></button>}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="card-footer">
                    <button onClick={() => setModal({ type: 'project' })} className="btn btn-secondary"><Plus size={16} /> Add Project</button>
                </div>
            </div>
             <div className="card">
                <div className="card-header"><h3 className="heading-5">Data Management</h3></div>
                 <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button id="export-data-button" onClick={exportDataToCsv} className="btn btn-secondary w-full"><Download size={16}/> Export All Tasks to CSV</button>
                    <button id="delete-data-button" onClick={deleteAllData} className="btn btn-error w-full"><Trash2 size={16}/> Delete All Data</button>
                </div>
            </div>
        </div>
    );
    
    const exportDataToCsv = () => {
        const headers = ["ID", "Title", "Description", "Status", "Priority", "Due Date", "Project", "Created At"];
        const rows = tasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            return [
                task.id,
                `"${task.title.replace(/"/g, '""')}"`,
                `"${task.description?.replace(/"/g, '""') || ''}"`,
                task.status,
                task.priority,
                task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : '',
                project ? `"${project.name.replace(/"/g, '""')}"` : 'N/A',
                format(parseISO(task.createdAt), 'yyyy-MM-dd HH:mm:ss')
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `zenith_tasks_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteAllData = () => {
         setModal({ type: 'confirm', data: {
            title: "Delete All Data?",
            message: "This will permanently delete all your tasks and projects. This action cannot be undone.",
            onConfirm: () => {
                setTasks([]);
                setProjects([{ id: 'proj-1', name: 'General', color: '#3b82f6' }]);
                setModal({type: null});
            }
        }});
    };
    
    // MODAL COMPONENTS
    const TaskModal: FC<{ taskData: Partial<Task>, onSave: (task: Task) => void, onClose: () => void }> = ({ taskData, onSave, onClose }) => {
        const [task, setTask] = useState<Partial<Task>>(taskData);
        
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!task.title?.trim()) return;
            onSave(task as Task);
        };

        return (
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h3 className="heading-5">{task.id ? 'Edit Task' : 'Add Task'}</h3>
                            <button type="button" onClick={onClose} className="btn btn-ghost btn-xs"><X size={20} /></button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="form-group">
                                <label className="form-label form-label-required" htmlFor="task-title">Title</label>
                                <input id="task-title" type="text" className="input" value={task.title || ''} onChange={e => setTask({...task, title: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="task-desc">Description</label>
                                <textarea id="task-desc" className="textarea" value={task.description || ''} onChange={e => setTask({...task, description: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="task-priority">Priority</label>
                                    <select id="task-priority" className="select" value={task.priority} onChange={e => setTask({...task, priority: e.target.value as Priority})}>
                                        {['None', 'Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="task-status">Status</label>
                                    <select id="task-status" className="select" value={task.status} onChange={e => setTask({...task, status: e.target.value as Status})}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="task-project">Project</label>
                                    <select id="task-project" className="select" value={task.projectId} onChange={e => setTask({...task, projectId: e.target.value})} required>
                                         {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="task-due-date">Due Date</label>
                                    <input id="task-due-date" type="date" className="input" value={task.dueDate || ''} onChange={e => setTask({...task, dueDate: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Task</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const ProjectModal: FC<{ projectData?: Project, onSave: (project: Project) => void, onClose: () => void }> = ({ projectData, onSave, onClose }) => {
        const [project, setProject] = useState<Partial<Project>>(projectData || { color: '#60a5fa' });
        
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!project.name?.trim()) return;
            onSave(project as Project);
        };
        
        return (
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h3 className="heading-5">{project.id ? 'Edit Project' : 'Add Project'}</h3>
                            <button type="button" onClick={onClose} className="btn btn-ghost btn-xs"><X size={20} /></button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="form-group">
                                <label className="form-label form-label-required" htmlFor="project-name">Name</label>
                                <input id="project-name" type="text" className="input" value={project.name || ''} onChange={e => setProject({...project, name: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="project-color">Color</label>
                                <input id="project-color" type="color" className="input h-10" value={project.color} onChange={e => setProject({...project, color: e.target.value})} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Project</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const ConfirmModal: FC<{ title?: string, message?: string, onConfirm: () => void, onClose: () => void }> = ({ title, message, onConfirm, onClose }) => (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="heading-5">{title || "Are you sure?"}</h3>
                    <button type="button" onClick={onClose} className="btn btn-ghost btn-xs"><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <p>{message || 'This action cannot be undone.'}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-error">Confirm</button>
                </div>
            </div>
        </div>
    );
    
    const AiResultsModal: FC<{ onClose: () => void }> = ({ onClose }) => {
        const [selectedTasks, setSelectedTasks] = useState<Partial<Task>[]>(generatedTasks);
        const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || '');
        
        const handleToggleTask = (task: Partial<Task>) => {
            setSelectedTasks(prev => 
                prev.some(t => t.title === task.title) ? prev.filter(t => t.title !== task.title) : [...prev, task]
            );
        };

        const handleAddTasks = () => {
            addGeneratedTasks(selectedTasks, targetProjectId);
        }

        return (
             <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content max-w-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3 className="heading-5">AI Generated Tasks</h3>
                        <button type="button" onClick={onClose} className="btn btn-ghost btn-xs"><X size={20} /></button>
                    </div>
                    <div className="modal-body max-h-[60vh] overflow-y-auto">
                        <p className="text-caption mb-4">Review the tasks below. Uncheck any you don't want to add.</p>
                        <div className="space-y-2">
                            {generatedTasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox"
                                        checked={selectedTasks.some(t => t.title === task.title)} 
                                        onChange={() => handleToggleTask(task)} 
                                    />
                                    <span className="flex-1">{task.title}</span>
                                    <span className={`badge ${PRIORITY_STYLES[task.priority || 'Medium']?.badge}`}>{task.priority}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer justify-between">
                         <div className="form-group">
                            <label htmlFor="ai-target-project" className="sr-only">Add to Project</label>
                             <select id="ai-target-project" className="select" value={targetProjectId} onChange={e => setTargetProjectId(e.target.value)}>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-x-2">
                           <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                           <button id="add-generated-tasks-button" onClick={handleAddTasks} className="btn btn-primary" disabled={selectedTasks.length === 0}>
                                Add {selectedTasks.length} Task(s)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
    
    // MAIN RENDER
    return (
        <div id="generation_issue_fallback" className={`flex h-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 ${theme}`}>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-20 lg:hidden"></div>}
            {renderSidebar()}
            <AILayer ref={aiLayerRef} prompt={aiPrompt} onResult={setAiResult} onError={setAiError} onLoading={setIsAiLoading} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {renderHeader()}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {activeTab === 'tasks' && renderTasksView()}
                    {activeTab === 'ai_assistant' && renderAiAssistant()}
                    {activeTab === 'settings' && renderSettings()}
                </main>
                 <footer className="text-center py-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
                    Copyright © 2025 Datavtar Private Limited. All rights reserved.
                </footer>
            </div>
            {modal.type === 'task' && <TaskModal taskData={modal.data || {}} onSave={handleTaskSave} onClose={() => setModal({ type: null })} />}
            {modal.type === 'project' && <ProjectModal projectData={modal.data} onSave={handleProjectSave} onClose={() => setModal({ type: null })} />}
            {modal.type === 'confirm' && <ConfirmModal title={modal.data.title} message={modal.data.message} onConfirm={modal.data.onConfirm} onClose={() => setModal({ type: null })} />}
            {modal.type === 'ai-results' && <AiResultsModal onClose={() => setModal({ type: null })} />}

            <button
                onClick={() => setModal({ type: 'task', data: { status: 'Todo', priority: 'Medium', projectId: projects[0]?.id || '' } })}
                className="btn btn-primary btn-lg rounded-full fixed bottom-6 right-6 sm:hidden z-10 shadow-lg flex items-center justify-center w-14 h-14"
                aria-label="Add Task"
            >
                <Plus size={24} />
            </button>
        </div>
    );
};

export default App;