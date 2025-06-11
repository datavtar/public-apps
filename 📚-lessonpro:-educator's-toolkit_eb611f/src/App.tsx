import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import { AILayerHandle } from './components/AILayer.types';
import AILayer from './components/AILayer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell as RechartsCell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import {
    LayoutDashboard, BookOpen, Library, Bot, Settings, Plus, Search, ChevronDown, ChevronUp, Trash2, Edit, X,
    Upload, Download, Sun, Moon, AlertCircle, CheckCircle, FileText, Link as LinkIcon, BrainCircuit, BookCopy
} from 'lucide-react';

// TYPE DEFINITIONS
interface Material {
    id: string;
    type: 'file' | 'link';
    title: string;
    content: string; // file name or URL
    tags: string[];
    createdAt: string;
}

interface Lesson {
    id: string;
    title:string;
    subject: string;
    grade: string;
    date: string; // ISO string format
    objectives: string;
    activities: string;
    assessment: string;
    linkedMaterialIds: string[];
}

interface AppData {
    lessons: Lesson[];
    materials: Material[];
    subjects: string[];
    grades: string[];
}

type Tab = 'dashboard' | 'lessons' | 'materials' | 'ai-assistant' | 'settings';
type SortKey = keyof Lesson;
type SortOrder = 'asc' | 'dsc';

// CONSTANTS
const initialSubjects = ['Mathematics', 'Science', 'English', 'History', 'Art'];
const initialGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
const TODAY = new Date('2025-06-11T10:00:00.000Z');

// DUMMY DATA
const generateInitialData = (): AppData => ({
    lessons: [
        { id: 'l1', title: 'Introduction to Algebra', subject: 'Mathematics', grade: 'Grade 8', date: '2025-06-12T09:00:00.000Z', objectives: 'Understand variables and basic equations.', activities: '1. Lecture (15 min)\n2. Group worksheet (20 min)\n3. Kahoot quiz (10 min)', assessment: 'Worksheet completion and quiz score.', linkedMaterialIds: ['m1'] },
        { id: 'l2', title: 'The Solar System', subject: 'Science', grade: 'Grade 5', date: '2025-06-13T11:00:00.000Z', objectives: 'Identify the planets in our solar system.', activities: '1. Watch video (10 min)\n2. Build a model solar system (30 min)', assessment: 'Model accuracy and labeling.', linkedMaterialIds: ['m2'] },
        { id: 'l3', title: 'Shakespeare\'s Sonnets', subject: 'English', grade: 'Grade 8', date: '2025-06-16T14:00:00.000Z', objectives: 'Analyze the structure of a sonnet.', activities: '1. Read Sonnet 18 (15 min)\n2. Group analysis (25 min)', assessment: 'Group presentation.', linkedMaterialIds: ['m3'] },
        { id: 'l4', title: 'World War II Causes', subject: 'History', grade: 'Grade 7', date: '2025-06-11T10:00:00.000Z', objectives: 'List three major causes of WWII.', activities: '1. Jigsaw reading (30 min)\n2. Class discussion (15 min)', assessment: 'Exit ticket with a short summary.', linkedMaterialIds: [] },
    ],
    materials: [
        { id: 'm1', type: 'file', title: 'Algebra Worksheet.pdf', content: 'Algebra_Worksheet.pdf', tags: ['math', 'worksheet'], createdAt: '2025-06-10T10:00:00.000Z' },
        { id: 'm2', type: 'link', title: 'NatGeo Solar System Video', content: 'https://www.youtube.com/watch?v=libKVRa01L8', tags: ['science', 'video'], createdAt: '2025-06-10T11:00:00.000Z' },
        { id: 'm3', type: 'file', title: 'Complete Works of Shakespeare.pdf', content: 'Shakespeare_Sonnets.pdf', tags: ['english', 'reading'], createdAt: '2025-06-11T12:00:00.000Z' },
    ],
    subjects: initialSubjects,
    grades: initialGrades,
});


// CUSTOM HOOK for Dark Mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

// Main App Component
export default function App() {
    const { currentUser, logout } = useAuth();
    const { isDark, toggleDarkMode } = useDarkMode();
    
    // APP STATE
    const [data, setData] = useState<AppData>(() => {
        const savedData = localStorage.getItem('lessonPlannerData');
        return savedData ? JSON.parse(savedData) : generateInitialData();
    });
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean, onConfirm: (() => void) | null, title: string, message: string }>({ show: false, onConfirm: null, title: '', message: '' });
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    
    // PERSISTENCE EFFECT
    useEffect(() => {
        localStorage.setItem('lessonPlannerData', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        // Simulate initial data load
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // TOAST HANDLER
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // UTILITY FUNCTIONS
    const handleAddOrUpdateLesson = (lesson: Lesson) => {
        if (editingLesson) {
            setData(prev => ({ ...prev, lessons: prev.lessons.map(l => l.id === lesson.id ? lesson : l) }));
            showToast('Lesson updated successfully!');
        } else {
            setData(prev => ({ ...prev, lessons: [...prev.lessons, { ...lesson, id: `l${Date.now()}` }] }));
            showToast('Lesson created successfully!');
        }
        closeLessonModal();
    };

    const handleDeleteLesson = (id: string) => {
        setShowConfirmModal({
            show: true,
            onConfirm: () => {
                setData(prev => ({ ...prev, lessons: prev.lessons.filter(l => l.id !== id) }));
                setShowConfirmModal({ show: false, onConfirm: null, title: '', message: '' });
                showToast('Lesson deleted.', 'error');
            },
            title: "Delete Lesson?",
            message: "Are you sure you want to delete this lesson? This action cannot be undone."
        });
    };
    
    const openLessonModal = (lesson: Lesson | null = null) => {
        setEditingLesson(lesson);
        setShowLessonModal(true);
    };

    const closeLessonModal = () => {
        setEditingLesson(null);
        setShowLessonModal(false);
    };
    
    const handleAddOrUpdateMaterial = (material: Omit<Material, 'id' | 'createdAt'>) => {
        if(editingMaterial) {
             setData(prev => ({...prev, materials: prev.materials.map(m => m.id === editingMaterial.id ? {...editingMaterial, ...material} : m)}));
             showToast('Material updated successfully!');
        } else {
            const newMaterial: Material = {...material, id: `m${Date.now()}`, createdAt: new Date().toISOString() };
            setData(prev => ({...prev, materials: [...prev.materials, newMaterial]}));
            showToast('Material added successfully!');
        }
        closeMaterialModal();
    }

    const handleDeleteMaterial = (id: string) => {
        setShowConfirmModal({
            show: true,
            onConfirm: () => {
                setData(prev => {
                    // Also unlink from lessons
                    const updatedLessons = prev.lessons.map(l => ({
                        ...l,
                        linkedMaterialIds: l.linkedMaterialIds.filter(mid => mid !== id)
                    }));
                    return { ...prev, lessons: updatedLessons, materials: prev.materials.filter(m => m.id !== id) };
                });
                setShowConfirmModal({ show: false, onConfirm: null, title: '', message: '' });
                showToast('Material deleted.', 'error');
            },
            title: "Delete Material?",
            message: "Are you sure you want to delete this material? It will also be unlinked from any lessons."
        });
    };
    
    const openMaterialModal = (material: Material | null = null) => {
        setEditingMaterial(material);
        setShowMaterialModal(true);
    }
    
    const closeMaterialModal = () => {
        setEditingMaterial(null);
        setShowMaterialModal(false);
    }

    // Settings Functions
    const handleMasterDataUpdate = (type: 'subjects' | 'grades', value: string[]) => {
        setData(prev => ({...prev, [type]: value }));
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} list updated!`);
    };

    const handleExportData = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "lesson_planner_pro_data.json";
        link.click();
        showToast("Data exported successfully!");
    };

    const handleDeleteAllData = () => {
         setShowConfirmModal({
            show: true,
            onConfirm: () => {
                setData(generateInitialData());
                setShowConfirmModal({ show: false, onConfirm: null, title: '', message: '' });
                showToast('All data has been reset.', 'error');
            },
            title: "Delete All Data?",
            message: "Are you sure you want to delete all your lessons and materials? This is irreversible."
        });
    }

    const MainContent = () => {
        if (isLoading) {
            return <div className="p-8"><SkeletonLoader /></div>;
        }
        switch(activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'lessons': return <LessonList />;
            case 'materials': return <MaterialsLibrary />;
            case 'ai-assistant': return <AIAssistant />;
            case 'settings': return <SettingsPage onUpdateMasterData={handleMasterDataUpdate} onExport={handleExportData} onDeleteAll={handleDeleteAllData} masterData={{subjects: data.subjects, grades: data.grades}} />;
            default: return <Dashboard />;
        }
    };

    return (
        <div id="welcome_fallback" className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition`}>
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300">
                <div className="flex items-center justify-center lg:justify-start gap-3 h-16 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6">
                    <BookCopy className="h-8 w-8 text-primary-600" />
                    <span className="hidden lg:block text-xl font-bold">LessonPro</span>
                </div>
                <nav className="flex-1 px-2 lg:px-4 py-4 space-y-2">
                    <NavItem icon={LayoutDashboard} label="Dashboard" tabName="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem icon={BookOpen} label="My Lessons" tabName="lessons" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem icon={Library} label="Materials" tabName="materials" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem icon={Bot} label="AI Assistant" tabName="ai-assistant" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
                 <div className="px-2 lg:px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                    <NavItem icon={Settings} label="Settings" tabName="settings" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-8 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <h1 id="generation_issue_fallback" className="heading-5 hidden md:block">{ {dashboard: "Dashboard", lessons: "My Lessons", materials: "Materials Library", "ai-assistant": "AI Assistant", settings: "Settings"}[activeTab] }</h1>
                    <div className="flex items-center gap-4">
                        <button id="create-lesson-btn" onClick={() => openLessonModal()} className="btn btn-primary btn-sm hidden sm:inline-flex">
                            <Plus size={16} />
                            New Lesson
                        </button>
                        <button onClick={toggleDarkMode} className="btn btn-ghost btn-sm p-2" aria-label="Toggle dark mode">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="relative group">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex-center font-bold text-primary-600 dark:text-primary-200 cursor-pointer">
                                {currentUser?.first_name.charAt(0)}{currentUser?.last_name.charAt(0)}
                            </div>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                <div className="px-2 py-1.5 text-sm">
                                    <p className="font-semibold">{currentUser?.first_name} {currentUser?.last_name}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">{currentUser?.email}</p>
                                </div>
                                <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                                <button onClick={logout} className="w-full text-left px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md">Logout</button>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <MainContent />
                </main>
            </div>
            
            {/* Modals & Toasts */}
            {showLessonModal && <LessonFormModal lesson={editingLesson} materials={data.materials} subjects={data.subjects} grades={data.grades} onClose={closeLessonModal} onSave={handleAddOrUpdateLesson} />}
            {showMaterialModal && <MaterialFormModal material={editingMaterial} onClose={closeMaterialModal} onSave={handleAddOrUpdateMaterial} />}
            {showConfirmModal.show && <ConfirmationModal title={showConfirmModal.title} message={showConfirmModal.message} onConfirm={showConfirmModal.onConfirm!} onCancel={() => setShowConfirmModal({ show: false, onConfirm: null, title: '', message: '' })} />}
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(prev => ({...prev, show: false}))} />}
        </div>
    );

    // SUB-COMPONENTS
    function NavItem({ icon: Icon, label, tabName, activeTab, setActiveTab }: { icon: React.ElementType, label: string, tabName: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void }) {
        const isActive = activeTab === tabName;
        return (
            <button
                id={`${tabName}-tab`}
                onClick={() => setActiveTab(tabName)}
                className={`w-full flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
            >
                <Icon size={20} />
                <span className="hidden lg:block">{label}</span>
            </button>
        );
    }
    
    function Dashboard() {
        const week = eachDayOfInterval({ start: startOfWeek(TODAY, { weekStartsOn: 1 }), end: endOfWeek(TODAY, { weekStartsOn: 1 }) });
        
        const lessonsBySubject = useMemo(() => {
            return data.lessons.reduce((acc, lesson) => {
                acc[lesson.subject] = (acc[lesson.subject] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        }, [data.lessons]);

        const chartData = Object.entries(lessonsBySubject).map(([name, value]) => ({ name, value }));
        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h2 className="heading-3">Welcome back, {currentUser?.first_name}!</h2>
                    <p className="text-body text-gray-500">Here's what's happening this week.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={BookOpen} title="Total Lessons" value={data.lessons.length} />
                    <StatCard icon={Library} title="Total Materials" value={data.materials.length} />
                    <StatCard icon={BrainCircuit} title="Subjects Taught" value={Object.keys(lessonsBySubject).length} />
                    <StatCard icon={CheckCircle} title="Lessons This Week" value={data.lessons.filter(l => isSameDay(parseISO(l.date), TODAY) || (parseISO(l.date) > startOfWeek(TODAY) && parseISO(l.date) < endOfWeek(TODAY))).length} />
                </div>
                
                {/* Weekly Schedule */}
                <div className="card">
                     <div className="card-header">
                        <h3 className="heading-5">This Week's Schedule</h3>
                    </div>
                    <div className="card-body grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
                    {week.map(day => {
                        const lessonsOnDay = data.lessons.filter(l => isSameDay(parseISO(l.date), day)).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        return (
                            <div key={day.toString()} className={`p-3 bg-white dark:bg-gray-800 ${isSameDay(day, TODAY) ? 'bg-primary-50 dark:bg-primary-900/50' : ''}`}>
                                <p className={`text-center font-semibold text-sm ${isSameDay(day, TODAY) ? 'text-primary-600' : ''}`}>{format(day, 'EEE')}</p>
                                <p className="text-center text-xs text-gray-500 mb-2">{format(day, 'd')}</p>
                                <div className="space-y-2">
                                    {lessonsOnDay.map(lesson => (
                                        <div key={lesson.id} className="p-2 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800" onClick={() => { setActiveTab('lessons'); openLessonModal(lesson);}}>
                                            <p className="font-bold truncate">{lesson.title}</p>
                                            <p className="truncate">{format(parseISO(lesson.date), 'p')}, {lesson.grade}</p>
                                        </div>
                                    ))}
                                    {lessonsOnDay.length === 0 && <div className="h-10"></div>}
                                </div>
                            </div>
                        )
                    })}
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="card-header"><h3 className="heading-5">Lessons by Subject</h3></div>
                        <div className="card-body h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted)" />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)' }} />
                                    <Bar dataKey="value" name="Lessons" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div className="card">
                        <div className="card-header"><h3 className="heading-5">Materials Breakdown</h3></div>
                        <div className="card-body h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Files', value: data.materials.filter(m => m.type === 'file').length },
                                            { name: 'Links', value: data.materials.filter(m => m.type === 'link').length }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        <RechartsCell key={`cell-0`} fill={COLORS[0]} />
                                        <RechartsCell key={`cell-1`} fill={COLORS[1]} />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    function LessonList() {
        const [searchTerm, setSearchTerm] = useState('');
        const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'date', order: 'dsc' });
        const [filterSubject, setFilterSubject] = useState('');
        const [filterGrade, setFilterGrade] = useState('');

        const filteredAndSortedLessons = useMemo(() => {
            let lessons = [...data.lessons];
            
            if (searchTerm) {
                lessons = lessons.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));
            }
            if(filterSubject) {
                lessons = lessons.filter(l => l.subject === filterSubject);
            }
             if(filterGrade) {
                lessons = lessons.filter(l => l.grade === filterGrade);
            }
            
            lessons.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                let comparison = 0;
                if (aVal > bVal) comparison = 1;
                else if (aVal < bVal) comparison = -1;
                
                return sortConfig.order === 'dsc' ? comparison * -1 : comparison;
            });
            
            return lessons;
        }, [data.lessons, searchTerm, sortConfig, filterSubject, filterGrade]);
        
        const requestSort = (key: SortKey) => {
            let order: SortOrder = 'asc';
            if (sortConfig.key === key && sortConfig.order === 'asc') {
                order = 'dsc';
            }
            setSortConfig({ key, order });
        };
        
        const SortableHeader = ({ label, sortKey }: { label: string, sortKey: SortKey }) => (
            <th className="table-header-cell cursor-pointer" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center gap-1">
                    {label}
                    {sortConfig.key === sortKey && (sortConfig.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
            </th>
        );

        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-1/3">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            className="input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select className="select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                            <option value="">All Subjects</option>
                            {data.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                         <select className="select" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                            <option value="">All Grades</option>
                            {data.grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <button onClick={() => openLessonModal()} className="btn btn-primary">
                            <Plus size={16} /> New
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                <SortableHeader label="Title" sortKey="title" />
                                <SortableHeader label="Subject" sortKey="subject" />
                                <SortableHeader label="Grade" sortKey="grade" />
                                <SortableHeader label="Date" sortKey="date" />
                                <th className="table-header-cell text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredAndSortedLessons.length > 0 ? filteredAndSortedLessons.map(lesson => (
                                <tr key={lesson.id} className="table-row hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="table-cell font-medium">{lesson.title}</td>
                                    <td className="table-cell"><span className="badge badge-gray">{lesson.subject}</span></td>
                                    <td className="table-cell">{lesson.grade}</td>
                                    <td className="table-cell">{format(parseISO(lesson.date), 'PP p')}</td>
                                    <td className="table-cell">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openLessonModal(lesson)} className="btn btn-ghost btn-xs p-1" aria-label="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="btn btn-ghost btn-xs p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50" aria-label="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">No lessons found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    function MaterialsLibrary() {
        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="heading-4">Your Resources</h2>
                    <button onClick={() => openMaterialModal()} className="btn btn-primary">
                        <Plus size={16} /> Add Material
                    </button>
                </div>
                {data.materials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.materials.map(material => (
                            <div key={material.id} className="card card-hover relative group">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            {material.type === 'file' ? <FileText className="text-primary-500" /> : <LinkIcon className="text-green-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-base truncate">{material.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{material.content}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {material.tags.map(tag => <span key={tag} className="badge badge-primary">{tag}</span>)}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openMaterialModal(material)} className="btn btn-ghost btn-xs p-1 bg-white dark:bg-gray-800 shadow-sm"><Edit size={14} /></button>
                                    <button onClick={() => handleDeleteMaterial(material.id)} className="btn btn-ghost btn-xs p-1 text-red-500 bg-white dark:bg-gray-800 shadow-sm"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Library size={48} className="mx-auto text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium">Your library is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Add your first teaching material to get started.</p>
                        <div className="mt-6">
                            <button onClick={() => openMaterialModal()} className="btn btn-primary">
                                <Plus size={16} /> Add Material
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    function AIAssistant() {
        const aiLayerRef = useRef<AILayerHandle>(null);
        const [prompt, setPrompt] = useState('');
        const [result, setResult] = useState<string | null>(null);
        const [error, setError] = useState<string | null>(null);
        const [isAiLoading, setIsAiLoading] = useState(false);

        const handleSendToAI = () => {
            if (!prompt.trim()) {
                setError("Please enter a prompt.");
                return;
            }
            setResult(null);
            setError(null);
            
            const internalPrompt = `You are an expert curriculum developer. Based on the user's request, generate a comprehensive lesson plan. The response must be in Markdown format and include the following sections: **Learning Objectives**, **Materials Needed**, **Step-by-Step Activities** (with estimated timings), and **Assessment Ideas**. User's request: "${prompt}"`;
            
            aiLayerRef.current?.sendToAI(internalPrompt);
        };

        const suggestionPrompts = [
            "A 45-minute lesson for 5th grade on the water cycle.",
            "An engaging starter activity for a 10th grade English class studying Macbeth.",
            "Three assessment ideas for a middle school history unit on Ancient Rome.",
            "A hands-on science experiment for 3rd graders about plant growth."
        ];

        return (
            <div className="h-full flex flex-col gap-6 p-2 md:p-0">
                <AILayer
                    ref={aiLayerRef}
                    prompt={prompt}
                    onResult={setResult}
                    onError={(err) => setError(err instanceof Error ? err.message : String(err))}
                    onLoading={setIsAiLoading}
                />
                 <div className="text-center">
                    <h2 className="heading-3 flex-center gap-2"><Bot size={32} className="text-primary-500" /> AI Lesson Assistant</h2>
                    <p className="text-body text-gray-500 mt-2 max-w-2xl mx-auto">Spark your creativity! Describe what you need, and I'll help you draft a lesson plan, activity, or assessment.</p>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/3 flex flex-col gap-4">
                        <div className="form-group flex-1 flex flex-col">
                            <label htmlFor="ai-prompt" className="form-label">Your Request</label>
                            <textarea
                                id="ai-prompt"
                                className="textarea flex-1"
                                placeholder="e.g., An engaging starter activity for a 10th grade English class studying Macbeth."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Or try a suggestion:</p>
                             <div className="flex flex-wrap gap-2">
                                {suggestionPrompts.map((p, i) => (
                                    <button key={i} onClick={() => setPrompt(p)} className="btn btn-secondary btn-xs">{p.substring(0,25)}...</button>
                                ))}
                            </div>
                        </div>
                        <button id="ai-assistant-btn" onClick={handleSendToAI} className={`btn btn-primary btn-lg ${isAiLoading ? 'btn-loading' : ''}`} disabled={isAiLoading}>
                           {isAiLoading ? 'Generating...' : 'Generate Ideas'}
                        </button>
                    </div>

                    <div className="lg:w-2/3 card">
                        <div className="card-body h-full overflow-y-auto">
                           {isAiLoading && (
                                <div className="space-y-4">
                                    <div className="skeleton h-8 w-1/3"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <div className="skeleton h-4 w-5/6"></div>
                                    <div className="skeleton h-4 w-3/4"></div>
                                </div>
                            )}
                            {error && <div className="alert alert-error">{error}</div>}
                            {result && (
                                <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                                </div>
                            )}
                            {!isAiLoading && !result && !error && (
                                <div className="flex-center h-full text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Bot size={48} className="text-gray-400 mb-4" />
                                        <p className="font-medium">Your generated content will appear here.</p>
                                        <p className="text-sm">Please be aware that AI can make mistakes. Consider checking important information.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    function SettingsPage({ onUpdateMasterData, onExport, onDeleteAll, masterData }: { onUpdateMasterData: (type: 'subjects' | 'grades', value: string[]) => void; onExport: () => void; onDeleteAll: () => void; masterData: { subjects: string[], grades: string[] } }) {
        const [subjects, setSubjects] = useState(masterData.subjects.join(', '));
        const [grades, setGrades] = useState(masterData.grades.join(', '));
        
        const handleSaveSubjects = () => {
            onUpdateMasterData('subjects', subjects.split(',').map(s => s.trim()).filter(Boolean));
        };

        const handleSaveGrades = () => {
            onUpdateMasterData('grades', grades.split(',').map(g => g.trim()).filter(Boolean));
        };
        
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div>
                    <h2 className="heading-3">Settings</h2>
                    <p className="text-body text-gray-500">Manage your application data and preferences.</p>
                </div>
                
                <div className="card">
                    <div className="card-header"><h3 className="heading-5">Master Data Management</h3></div>
                    <div className="card-body space-y-6">
                        <div className="form-group">
                            <label className="form-label">Subjects</label>
                            <p className="form-help">Enter subjects separated by commas.</p>
                            <div className="flex gap-2">
                                <input type="text" className="input" value={subjects} onChange={e => setSubjects(e.target.value)} />
                                <button onClick={handleSaveSubjects} className="btn btn-secondary">Save</button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grades</label>
                            <p className="form-help">Enter grades separated by commas.</p>
                            <div className="flex gap-2">
                                <input type="text" className="input" value={grades} onChange={e => setGrades(e.target.value)} />
                                <button onClick={handleSaveGrades} className="btn btn-secondary">Save</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="heading-5">Data Management</h3></div>
                    <div className="card-body flex flex-col sm:flex-row gap-4">
                        <button onClick={onExport} className="btn btn-secondary w-full sm:w-auto">
                            <Download size={16} /> Export All Data
                        </button>
                        <p className="form-help text-center sm:text-left flex-1">Download all your lessons and materials as a JSON file.</p>
                    </div>
                </div>

                <div className="card border-red-500/50 dark:border-red-500/30">
                     <div className="card-header border-red-500/20"><h3 className="heading-5 text-red-600 dark:text-red-400">Danger Zone</h3></div>
                     <div className="card-body flex flex-col sm:flex-row gap-4 items-center">
                         <button onClick={onDeleteAll} className="btn btn-error w-full sm:w-auto">
                            <Trash2 size={16} /> Delete All Data
                        </button>
                         <p className="form-help text-red-600 dark:text-red-400 text-center sm:text-left">This will permanently delete all your data. This action cannot be undone.</p>
                     </div>
                </div>
            </div>
        );
    }
}


// MODALS AND UI COMPONENTS
function LessonFormModal({ lesson, materials, subjects, grades, onClose, onSave }: { lesson: Lesson | null; materials: Material[]; subjects: string[]; grades: string[]; onClose: () => void; onSave: (lesson: Lesson) => void; }) {
    const [formData, setFormData] = useState<Omit<Lesson, 'id'>>({
        title: lesson?.title || '',
        subject: lesson?.subject || subjects[0] || '',
        grade: lesson?.grade || grades[0] || '',
        date: lesson ? format(parseISO(lesson.date), "yyyy-MM-dd'T'HH:mm") : format(TODAY, "yyyy-MM-dd'T'HH:mm"),
        objectives: lesson?.objectives || '',
        activities: lesson?.activities || '',
        assessment: lesson?.assessment || '',
        linkedMaterialIds: lesson?.linkedMaterialIds || []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaterialToggle = (materialId: string) => {
        setFormData(prev => {
            const linkedMaterialIds = prev.linkedMaterialIds.includes(materialId)
                ? prev.linkedMaterialIds.filter(id => id !== materialId)
                : [...prev.linkedMaterialIds, materialId];
            return { ...prev, linkedMaterialIds };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalLesson: Lesson = {
            ...formData,
            id: lesson?.id || '',
            date: new Date(formData.date).toISOString()
        };
        onSave(finalLesson);
    };
    
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop animate-fade-in">
            <div className="modal-content animate-scale-in w-full max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h3 className="heading-5">{lesson ? 'Edit Lesson' : 'Create New Lesson'}</h3>
                        <button type="button" onClick={onClose} className="btn btn-ghost p-1"><X size={20}/></button>
                    </div>
                    <div className="modal-body space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label" htmlFor="title">Title</label>
                                <input type="text" id="title" name="title" className="input" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="date">Date & Time</label>
                                <input type="datetime-local" id="date" name="date" className="input" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="form-group">
                                <label className="form-label" htmlFor="subject">Subject</label>
                                <select id="subject" name="subject" className="select" value={formData.subject} onChange={handleChange}>
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div className="form-group">
                                <label className="form-label" htmlFor="grade">Grade</label>
                                <select id="grade" name="grade" className="select" value={formData.grade} onChange={handleChange}>
                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="objectives">Learning Objectives</label>
                            <textarea id="objectives" name="objectives" className="textarea" rows={3} value={formData.objectives} onChange={handleChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="activities">Activities / Procedure</label>
                            <textarea id="activities" name="activities" className="textarea" rows={4} value={formData.activities} onChange={handleChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="assessment">Assessment</label>
                            <textarea id="assessment" name="assessment" className="textarea" rows={2} value={formData.assessment} onChange={handleChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Link Materials</label>
                            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2 space-y-2">
                                {materials.length > 0 ? materials.map(m => (
                                    <div key={m.id} className="flex items-center gap-2">
                                        <input type="checkbox" id={`mat-${m.id}`} checked={formData.linkedMaterialIds.includes(m.id)} onChange={() => handleMaterialToggle(m.id)} className="checkbox" />
                                        <label htmlFor={`mat-${m.id}`} className="text-sm">{m.title}</label>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No materials available.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Lesson</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MaterialFormModal({ material, onClose, onSave }: { material: Material | null; onClose: () => void; onSave: (material: Omit<Material, 'id' | 'createdAt'>) => void; }) {
    const [type, setType] = useState<'file' | 'link'>(material?.type || 'file');
    const [title, setTitle] = useState(material?.title || '');
    const [content, setContent] = useState(material?.content || '');
    const [tags, setTags] = useState(material?.tags.join(', ') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setContent(e.target.files[0].name);
            if(!title) setTitle(e.target.files[0].name);
        }
    }
    
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content animate-scale-in w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h3 className="heading-5">{material ? 'Edit Material' : 'Add New Material'}</h3>
                         <button type="button" onClick={onClose} className="btn btn-ghost p-1"><X size={20}/></button>
                    </div>
                    <div className="modal-body space-y-4">
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <div className="flex gap-4">
                               <label className="flex items-center gap-2"><input type="radio" name="type" value="file" checked={type === 'file'} onChange={() => setType('file')} className="radio" /> File/Document</label>
                               <label className="flex items-center gap-2"><input type="radio" name="type" value="link" checked={type === 'link'} onChange={() => setType('link')} className="radio" /> Web Link</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="mat-title">Title</label>
                            <input type="text" id="mat-title" className="input" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        {type === 'file' ? (
                            <div className="form-group">
                                <label className="form-label" htmlFor="mat-file">File</label>
                                <div className="flex items-center gap-2">
                                     <label htmlFor="mat-file" className="btn btn-secondary cursor-pointer"><Upload size={16}/> Upload</label>
                                     <input type="file" id="mat-file" onChange={handleFileChange} className="hidden" />
                                     <span className="text-sm text-gray-500">{content || "No file chosen"}</span>
                                </div>
                            </div>
                        ) : (
                             <div className="form-group">
                                <label className="form-label" htmlFor="mat-link">URL</label>
                                <input type="url" id="mat-link" className="input" placeholder="https://example.com" value={content} onChange={e => setContent(e.target.value)} required/>
                            </div>
                        )}
                         <div className="form-group">
                            <label className="form-label" htmlFor="mat-tags">Tags</label>
                            <input type="text" id="mat-tags" className="input" placeholder="e.g. math, worksheet, chapter-5" value={tags} onChange={e => setTags(e.target.value)} />
                             <p className="form-help">Separate tags with commas.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Material</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ConfirmationModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void; }) {
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onCancel]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content animate-scale-in max-w-sm">
                <div className="modal-body text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500" />
                    <h3 className="heading-5 mt-4">{title}</h3>
                    <p className="text-body text-gray-500 mt-2">{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-error">Confirm</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string; value: string | number; }) {
    return (
        <div className="card card-padding flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300">
                <Icon size={24} />
            </div>
            <div>
                <p className="stat-title">{title}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="skeleton h-8 w-1/4"></div>
                <div className="skeleton h-10 w-24"></div>
            </div>
            <div className="skeleton h-48 w-full"></div>
            <div className="grid grid-cols-2 gap-6">
                 <div className="skeleton h-64 w-full"></div>
                 <div className="skeleton h-64 w-full"></div>
            </div>
        </div>
    );
}

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    const isSuccess = type === 'success';
    return (
        <div className={`toast fixed bottom-5 right-5 animate-slide-in-up ${isSuccess ? 'toast-success' : 'toast-error'}`}>
            {isSuccess ? <CheckCircle className="text-success-500" /> : <AlertCircle className="text-error-500" />}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="absolute top-1 right-1 btn-ghost p-1 rounded-full"><X size={14} /></button>
        </div>
    );
}