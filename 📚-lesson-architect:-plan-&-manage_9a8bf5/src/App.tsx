import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    LayoutDashboard, PlusCircle, Settings, LogOut, Moon, Sun, Search, FileDown, FileUp, Trash2, Edit, X,
    ChevronDown, ChevronUp, BrainCircuit, BookOpen, GraduationCap, CheckCircle, Archive, Clock, FileText,
    Download, Upload, AlertCircle, Sparkles, Wand2
} from 'lucide-react';

// TYPE DEFINITIONS
interface Material {
    id: string;
    name: string;
    url: string;
}

interface LessonPlan {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    date: string; // YYYY-MM-DD
    objectives: string;
    activities: string;
    assessment: string;
    materials: Material[];
    status: 'Planned' | 'Completed' | 'Archived';
}

type View = 'dashboard' | 'plans' | 'settings';
type SortKey = keyof LessonPlan | '';

interface SortConfig {
    key: SortKey;
    direction: 'ascending' | 'descending';
}

// MOCK DATA for initial load
const getInitialData = (): { lessonPlans: LessonPlan[], subjects: string[], gradeLevels: string[] } => {
    const today = new Date('2025-06-11');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
        lessonPlans: [
            { id: '1', title: 'Introduction to Algebra', subject: 'Mathematics', gradeLevel: '8th Grade', date: formatDate(today), objectives: 'Understand variables and basic equations.', activities: 'Worksheet on solving for x.', assessment: 'Quiz on basic algebraic expressions.', materials: [], status: 'Planned' },
            { id: '2', title: 'The Water Cycle', subject: 'Science', gradeLevel: '5th Grade', date: formatDate(tomorrow), objectives: 'Describe the stages of the water cycle.', activities: 'Create a diagram of the water cycle.', assessment: 'Oral presentation.', materials: [], status: 'Planned' },
            { id: '3', title: 'World War II: An Overview', subject: 'History', gradeLevel: '10th Grade', date: '2025-06-05', objectives: 'Identify key events and figures of WWII.', activities: 'Group discussion and timeline creation.', assessment: 'Essay on the causes of the war.', materials: [], status: 'Completed' },
            { id: '4', title: 'Photosynthesis', subject: 'Science', gradeLevel: '7th Grade', date: formatDate(nextWeek), objectives: 'Explain the process of photosynthesis.', activities: 'Lab experiment observing plant cells.', assessment: 'Lab report.', materials: [], status: 'Planned' },
            { id: '5', title: 'Shakespeare\'s Sonnets', subject: 'Literature', gradeLevel: '11th Grade', date: '2025-05-20', objectives: 'Analyze the structure and themes of a sonnet.', activities: 'Write a modern sonnet.', assessment: 'Sonnet analysis paper.', materials: [], status: 'Archived' },
        ],
        subjects: ['Mathematics', 'Science', 'History', 'Literature', 'Art'],
        gradeLevels: ['5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    };
};

// DARK MODE HOOK (as per instructions)
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

const App: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { isDark, toggleDarkMode } = useDarkMode();
    
    // Core State
    const [view, setView] = useState<View>('dashboard');
    const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [gradeLevels, setGradeLevels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLessonPlan, setCurrentLessonPlan] = useState<LessonPlan | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'ascending' });
    
    // Confirmation Modal State
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ action: () => void, title: string, message: string } | null>(null);

    // AI State
    const aiLayerRef = useRef<AILayerHandle>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const savedPlans = localStorage.getItem('lessonPlans');
            const savedSubjects = localStorage.getItem('subjects');
            const savedGrades = localStorage.getItem('gradeLevels');

            if (savedPlans && savedSubjects && savedGrades) {
                setLessonPlans(JSON.parse(savedPlans));
                setSubjects(JSON.parse(savedSubjects));
                setGradeLevels(JSON.parse(savedGrades));
            } else {
                const initialData = getInitialData();
                setLessonPlans(initialData.lessonPlans);
                setSubjects(initialData.subjects);
                setGradeLevels(initialData.gradeLevels);
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
            const initialData = getInitialData();
            setLessonPlans(initialData.lessonPlans);
            setSubjects(initialData.subjects);
            setGradeLevels(initialData.gradeLevels);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
        }
    }, [lessonPlans, isLoading]);
    
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('subjects', JSON.stringify(subjects));
        }
    }, [subjects, isLoading]);
    
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('gradeLevels', JSON.stringify(gradeLevels));
        }
    }, [gradeLevels, isLoading]);
    
    const openConfirmation = (action: () => void, title: string, message: string) => {
        setConfirmAction({ action, title, message });
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction.action();
        }
        setShowConfirm(false);
        setConfirmAction(null);
    };

    // Derived State and Memos
    const filteredAndSortedPlans = useMemo(() => {
        let filtered = lessonPlans
            .filter(plan => plan.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(plan => filterSubject ? plan.subject === filterSubject : true)
            .filter(plan => filterGrade ? plan.gradeLevel === filterGrade : true);

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key as keyof LessonPlan];
                const bVal = b[sortConfig.key as keyof LessonPlan];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [lessonPlans, searchTerm, filterSubject, filterGrade, sortConfig]);

    const dashboardStats = useMemo(() => {
        const today = new Date('2025-06-11');
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const upcoming = lessonPlans.filter(p => {
            const planDate = new Date(p.date);
            return p.status === 'Planned' && planDate >= today && planDate <= nextWeek;
        });
        const completed = lessonPlans.filter(p => p.status === 'Completed');
        return {
            total: lessonPlans.length,
            upcoming: upcoming.length,
            completed: completed.length
        };
    }, [lessonPlans]);
    
    const chartData = useMemo(() => {
        const subjectCounts = lessonPlans.reduce((acc, plan) => {
            acc[plan.subject] = (acc[plan.subject] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(subjectCounts).map(([name, value]) => ({ name, value }));
    }, [lessonPlans]);

    // Handlers
    const handleAddLessonPlan = () => {
        setCurrentLessonPlan(null);
        setIsModalOpen(true);
    };
    
    const handleEditLessonPlan = (plan: LessonPlan) => {
        setCurrentLessonPlan(plan);
        setIsModalOpen(true);
    };

    const handleDeleteLessonPlan = (id: string) => {
        const action = () => setLessonPlans(plans => plans.filter(p => p.id !== id));
        openConfirmation(action, "Delete Lesson Plan", "Are you sure you want to delete this lesson plan? This action cannot be undone.");
    };

    const handleSaveLessonPlan = (planData: Omit<LessonPlan, 'id' | 'materials' | 'status'> & {status?: LessonPlan['status'], materials?: Material[]}) => {
        if (currentLessonPlan) {
            setLessonPlans(plans => plans.map(p => p.id === currentLessonPlan.id ? { ...currentLessonPlan, ...planData } : p));
        } else {
            const newPlan: LessonPlan = {
                id: new Date().toISOString(),
                ...planData,
                status: planData.status || 'Planned',
                materials: planData.materials || [],
            };
            setLessonPlans(plans => [newPlan, ...plans]);
        }
        setIsModalOpen(false);
        setCurrentLessonPlan(null);
    };

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    // AI Handlers
    const handleOpenAiModal = () => {
        setAiPrompt('');
        setAiResult(null);
        setAiError(null);
        setIsAiModalOpen(true);
    };

    const handleSendToAI = () => {
        if (!aiPrompt.trim()) {
            setAiError("Please enter a topic for the lesson plan.");
            return;
        }
        setAiResult(null);
        setAiError(null);
        const internalPrompt = `${aiPrompt}.
        Generate a comprehensive lesson plan based on this topic.
        Strictly return the output as a single, minified JSON object with NO markdown formatting.
        The JSON object must have these exact keys and value types: "title" (string), "objectives" (string), "activities" (string), "assessment" (string).`;
        
        aiLayerRef.current?.sendToAI(internalPrompt);
    };

    const applyAiResultToForm = () => {
        if (!aiResult) return;
        try {
            const parsedResult = JSON.parse(aiResult);
            const { title, objectives, activities, assessment } = parsedResult;

            if (title && objectives && activities && assessment) {
                 // Create a partial lesson plan object to pass to the modal form state update
                const aiGeneratedData = { title, objectives, activities, assessment };
                // This will be handled inside the LessonPlanForm component
                // by passing a function to update its local state.
                // For now, we'll just log it and update currentLessonPlan to reflect changes
                if(currentLessonPlan){
                    setCurrentLessonPlan(prev => ({...prev!, ...aiGeneratedData}));
                } else {
                    // For a new plan, we can't directly set the form state here
                    // so we pass this data back when closing the AI modal
                    // For now, let's just close the AI modal and open the lesson plan modal with this data
                    const newPlanData = {
                        id: '', // will be set on save
                        date: new Date('2025-06-11').toISOString().split('T')[0],
                        subject: '',
                        gradeLevel: '',
                        materials: [],
                        status: 'Planned' as 'Planned',
                        ...aiGeneratedData,
                    };
                    setCurrentLessonPlan(newPlanData as LessonPlan);
                }

                setIsAiModalOpen(false);
            } else {
                setAiError("AI response is missing required fields. Please try again.");
            }
        } catch (e) {
            setAiError("Failed to parse AI response. Please try regenerating.");
            console.error("AI JSON parse error:", e);
        }
    };

    // Component Renderers
    const renderView = () => {
        switch (view) {
            case 'dashboard': return <DashboardView />;
            case 'plans': return <LessonPlansView />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView />;
        }
    };
    
    // Sub-Components (as functions within App)
    const DashboardView = () => {
        const today = new Date('2025-06-11').toISOString().split('T')[0];
        const upcomingLessons = lessonPlans.filter(p => p.date >= today && p.status === 'Planned').sort((a,b) => a.date.localeCompare(b.date)).slice(0, 5);
        return (
            <div id="dashboard-tab" className="animate-fade-in space-y-6">
                <div id="hero-welcome" className="p-8 bg-primary-50 dark:bg-primary-900/50 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h2 className="heading-3 text-primary-800 dark:text-primary-200">Welcome back, {currentUser?.first_name}!</h2>
                    <p className="text-lg text-primary-600 dark:text-primary-300 mt-2 text-balance">Let's get your lessons organized and ready for success.</p>
                    <button id="dashboard-create-lesson-btn" onClick={handleAddLessonPlan} className="btn btn-primary btn-lg mt-6">
                        <PlusCircle size={20} /> Create New Lesson Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Lesson Plans" value={dashboardStats.total} icon={<BookOpen className="text-primary-500" />} />
                    <StatCard title="Upcoming This Week" value={dashboardStats.upcoming} icon={<Clock className="text-yellow-500" />} />
                    <StatCard title="Completed Lessons" value={dashboardStats.completed} icon={<CheckCircle className="text-green-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 card card-padding">
                        <h3 className="heading-5 mb-4">Lesson Plans by Subject</h3>
                        {chartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-muted)" />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            borderColor: 'var(--color-border-primary)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                        cursor={{ fill: 'var(--color-gray-100)', fillOpacity: 0.5, 'dark:fill': 'var(--color-gray-800)' }}
                                    />
                                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                                    <Bar dataKey="value" name="Plans" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-center h-[300px] text-gray-500">No data to display. Create a lesson plan!</div>
                        )}
                    </div>
                    <div className="lg:col-span-2 card card-padding">
                        <h3 className="heading-5 mb-4">Upcoming Lessons</h3>
                        <div className="space-y-4">
                            {upcomingLessons.length > 0 ? upcomingLessons.map(plan => (
                                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{plan.title}</p>
                                        <p className="text-sm text-gray-500">{plan.subject} - {new Date(plan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <button onClick={() => handleEditLessonPlan(plan)} className="btn btn-ghost btn-sm">View</button>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">No upcoming lessons this week.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    const StatCard = ({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) => (
        <div className="card card-padding flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">{icon}</div>
            <div>
                <p className="stat-title">{title}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );
    
    const LessonPlansView = () => {
        const getSortIcon = (key: SortKey) => {
            if (sortConfig.key !== key) return <ChevronDown size={14} className="opacity-30" />;
            return sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
        };

        return (
            <div id="plans-tab" className="animate-fade-in">
                <div className="flex-between flex-wrap gap-4 mb-6">
                    <h2 className="heading-4">My Lesson Plans</h2>
                    <button id="create-lesson-btn" onClick={handleAddLessonPlan} className="btn btn-primary">
                        <PlusCircle size={18} /> New Lesson Plan
                    </button>
                </div>
                
                <div className="card mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title..."
                                className="input pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="select" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                            <option value="">All Grades</option>
                            {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                
                <div id="plans-table" className="table-container">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                {['title', 'subject', 'gradeLevel', 'date', 'status'].map(key => (
                                     <th key={key} className="table-header-cell cursor-pointer" onClick={() => requestSort(key as SortKey)}>
                                         <div className="flex items-center gap-2">
                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                            {getSortIcon(key as SortKey)}
                                         </div>
                                     </th>
                                ))}
                                <th className="table-header-cell text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredAndSortedPlans.length > 0 ? (
                                filteredAndSortedPlans.map(plan => (
                                    <tr key={plan.id} className="table-row hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="table-cell font-medium">{plan.title}</td>
                                        <td className="table-cell">{plan.subject}</td>
                                        <td className="table-cell">{plan.gradeLevel}</td>
                                        <td className="table-cell">{new Date(plan.date).toLocaleDateString()}</td>
                                        <td className="table-cell"><StatusBadge status={plan.status} /></td>
                                        <td className="table-cell">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditLessonPlan(plan)} className="btn btn-ghost btn-sm"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteLessonPlan(plan.id)} className="btn btn-ghost btn-sm text-error-500"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        No lesson plans found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const StatusBadge = ({ status }: { status: LessonPlan['status'] }) => {
        const baseClass = "badge flex items-center gap-1.5";
        switch (status) {
            case 'Planned': return <span className={`${baseClass} badge-primary`}><Clock size={12} /> {status}</span>;
            case 'Completed': return <span className={`${baseClass} badge-success`}><CheckCircle size={12} /> {status}</span>;
            case 'Archived': return <span className={`${baseClass} badge-gray`}><Archive size={12} /> {status}</span>;
            default: return <span className={`${baseClass} badge-gray`}>{status}</span>;
        }
    };
    
    const SettingsView = () => {
        const [newSubject, setNewSubject] = useState('');
        const [newGrade, setNewGrade] = useState('');

        const handleAddSubject = () => {
            if (newSubject && !subjects.includes(newSubject)) {
                setSubjects(prev => [...prev, newSubject].sort());
                setNewSubject('');
            }
        };

        const handleDeleteSubject = (subjectToDelete: string) => {
            const action = () => setSubjects(prev => prev.filter(s => s !== subjectToDelete));
            openConfirmation(action, "Delete Subject", `Are you sure you want to delete the subject "${subjectToDelete}"? This may affect existing lesson plans.`);
        };
        
        const handleAddGrade = () => {
            if (newGrade && !gradeLevels.includes(newGrade)) {
                setGradeLevels(prev => [...prev, newGrade].sort());
                setNewGrade('');
            }
        };

        const handleDeleteGrade = (gradeToDelete: string) => {
             const action = () => setGradeLevels(prev => prev.filter(g => g !== gradeToDelete));
             openConfirmation(action, "Delete Grade Level", `Are you sure you want to delete "${gradeToDelete}"? This may affect existing lesson plans.`);
        };
        
        const handleExport = () => {
            const headers = Object.keys(lessonPlans[0] || {}).join(',');
            const rows = lessonPlans.map(plan => 
                Object.values(plan).map(value => 
                    `"${Array.isArray(value) ? JSON.stringify(value) : String(value).replace(/"/g, '""')}"`
                ).join(',')
            );
            const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "lesson_plans.csv");
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
                const rows = text.split('\n').slice(1);
                const newPlans: LessonPlan[] = rows.filter(row => row.trim()).map(row => {
                    const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)!.map(v => v.replace(/^"|"$/g, ''));
                    return {
                        id: values[0] || new Date().toISOString(),
                        title: values[1],
                        subject: values[2],
                        gradeLevel: values[3],
                        date: values[4],
                        objectives: values[5],
                        activities: values[6],
                        assessment: values[7],
                        materials: JSON.parse(values[8] || '[]'),
                        status: values[9] as LessonPlan['status'],
                    };
                });
                setLessonPlans(prev => [...prev, ...newPlans]);
            };
            reader.readAsText(file);
        };
        
        const handleDeleteAllData = () => {
            const action = () => {
                const initial = getInitialData();
                setLessonPlans(initial.lessonPlans);
                setSubjects(initial.subjects);
                setGradeLevels(initial.gradeLevels);
            };
            openConfirmation(action, "Delete All Data", "Are you sure you want to delete ALL data and reset the app to its initial state? This action is irreversible.");
        };

        const downloadTemplate = () => {
            const headers = "id,title,subject,gradeLevel,date,objectives,activities,assessment,materials,status";
            const exampleRow = `"example-1","My First Lesson","Science","6th Grade","2025-09-01","Objective 1","Activity 1","Assessment 1","[]","Planned"`;
            const csvContent = "data:text/csv;charset=utf-8," + [headers, exampleRow].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "lesson_plans_template.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        
        return (
            <div id="settings-tab" className="animate-fade-in space-y-8">
                <h2 className="heading-4">Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card">
                        <div className="card-header"><h3 className="heading-5">Manage Master Data</h3></div>
                        <div className="card-body space-y-6">
                            <div>
                                <label className="form-label">Subjects</label>
                                <div className="flex gap-2">
                                    <input type="text" className="input" placeholder="New subject..." value={newSubject} onChange={e => setNewSubject(e.target.value)} />
                                    <button onClick={handleAddSubject} className="btn btn-primary">Add</button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {subjects.map(s => <span key={s} className="badge badge-gray">{s} <X size={12} className="ml-1 cursor-pointer" onClick={() => handleDeleteSubject(s)} /></span>)}
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Grade Levels</label>
                                <div className="flex gap-2">
                                    <input type="text" className="input" placeholder="New grade level..." value={newGrade} onChange={e => setNewGrade(e.target.value)} />
                                    <button onClick={handleAddGrade} className="btn btn-primary">Add</button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {gradeLevels.map(g => <span key={g} className="badge badge-gray">{g} <X size={12} className="ml-1 cursor-pointer" onClick={() => handleDeleteGrade(g)} /></span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="data-management-section" className="card">
                         <div className="card-header"><h3 className="heading-5">Data Management</h3></div>
                         <div className="card-body space-y-4">
                             <button onClick={handleExport} className="btn btn-secondary w-full"><Download size={16} /> Export All Data (CSV)</button>
                             <div id="data-import-section" className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                 <label className="form-label">Import Data (CSV)</label>
                                 <input type="file" accept=".csv" onChange={handleImport} className="input text-sm" />
                                 <button onClick={downloadTemplate} className="text-sm text-primary-600 hover:underline mt-2">Download Template</button>
                             </div>
                             <button onClick={handleDeleteAllData} className="btn btn-error w-full"><Trash2 size={16} /> Delete All Data</button>
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    const LessonPlanForm = ({ plan, onSave }: { plan: LessonPlan | null, onSave: (data: any) => void }) => {
        const [formData, setFormData] = useState({
            title: '',
            subject: '',
            gradeLevel: '',
            date: new Date('2025-06-11').toISOString().split('T')[0],
            objectives: '',
            activities: '',
            assessment: '',
        });

        useEffect(() => {
            if (plan) {
                setFormData({
                    title: plan.title,
                    subject: plan.subject,
                    gradeLevel: plan.gradeLevel,
                    date: plan.date,
                    objectives: plan.objectives,
                    activities: plan.activities,
                    assessment: plan.assessment,
                });
            }
        }, [plan]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex-between">
                     <h3 className="heading-5">{currentLessonPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}</h3>
                     <button id="ai-generator-btn" type="button" onClick={handleOpenAiModal} className="btn btn-secondary btn-sm">
                         <Wand2 size={16} className="text-primary-500" /> Generate with AI
                     </button>
                 </div>
                 
                <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="title">Title</label>
                    <input id="title" name="title" type="text" className="input" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="form-group">
                        <label className="form-label form-label-required" htmlFor="subject">Subject</label>
                        <select id="subject" name="subject" className="select" value={formData.subject} onChange={handleChange} required>
                            <option value="">Select a subject</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label form-label-required" htmlFor="gradeLevel">Grade Level</label>
                        <select id="gradeLevel" name="gradeLevel" className="select" value={formData.gradeLevel} onChange={handleChange} required>
                            <option value="">Select a grade level</option>
                            {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="date">Date</label>
                    <input id="date" name="date" type="date" className="input" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="objectives">Learning Objectives</label>
                    <textarea id="objectives" name="objectives" className="textarea" value={formData.objectives} onChange={handleChange} rows={3}></textarea>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="activities">Activities & Procedures</label>
                    <textarea id="activities" name="activities" className="textarea" value={formData.activities} onChange={handleChange} rows={4}></textarea>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="assessment">Assessment Methods</label>
                    <textarea id="assessment" name="assessment" className="textarea" value={formData.assessment} onChange={handleChange} rows={3}></textarea>
                </div>
                <div className="modal-footer !p-0 !pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Lesson Plan</button>
                </div>
            </form>
        );
    };

    if (isLoading) {
        return (
            <div className="flex-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-4 text-lg text-gray-600 dark:text-gray-300">
                    <GraduationCap className="animate-bounce" size={40} />
                    <span>Loading Lesson Architect...</span>
                </div>
            </div>
        );
    }
    
    return (
        <div id="welcome_fallback" className={`flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 theme-transition ${styles.appContainer}`}>
            <aside className="w-64 bg-white dark:bg-gray-900 p-4 flex flex-col border-r border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 p-2 mb-6">
                    <GraduationCap size={32} className="text-primary-500" />
                    <h1 className="heading-5 font-bold">Lesson Architect</h1>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                    <NavItem icon={<BookOpen size={20} />} label="Lesson Plans" active={view === 'plans'} onClick={() => setView('plans')} />
                    <NavItem icon={<Settings size={20} />} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
                </nav>
                <div className="mt-auto">
                     <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <img src={`https://i.pravatar.cc/40?u=${currentUser?.id}`} alt="User Avatar" className="w-10 h-10 rounded-full"/>
                            <div>
                                <p className="font-semibold text-sm">{currentUser?.first_name} {currentUser?.last_name}</p>
                                <p className="text-xs text-gray-500">{currentUser?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                             <button onClick={toggleDarkMode} className="btn btn-ghost btn-sm">
                                {isDark ? <Sun size={18}/> : <Moon size={18}/>}
                             </button>
                             <button onClick={logout} className="btn btn-ghost btn-sm text-error-500 flex items-center gap-2">
                                <LogOut size={16}/> Logout
                            </button>
                        </div>
                     </div>
                </div>
            </aside>
            <main id="generation_issue_fallback" className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {renderView()}
                </div>
                <footer className="text-center py-4 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-800">
                    Copyright © 2025 Datavtar Private Limited. All rights reserved.
                </footer>
            </main>

             {/* Modals */}
             {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className={`modal-content animate-scale-in max-w-2xl ${styles.modalContent}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-body">
                             <LessonPlanForm plan={currentLessonPlan} onSave={handleSaveLessonPlan} />
                        </div>
                    </div>
                </div>
            )}
            
            {isAiModalOpen && (
                 <div className="modal-backdrop" onClick={() => setIsAiModalOpen(false)}>
                    <div className={`modal-content animate-scale-in max-w-lg ${styles.modalContent}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="heading-5 flex items-center gap-2"><Sparkles className="text-primary-500" /> AI Lesson Generator</h3>
                            <button onClick={() => setIsAiModalOpen(false)} className="btn btn-ghost btn-sm p-1"><X size={20}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="ai-prompt" className="form-label">Describe the lesson you want to create:</label>
                                <textarea id="ai-prompt" className="textarea" rows={3} placeholder="e.g., A 5th grade science lesson about the water cycle, focusing on evaporation and condensation." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}></textarea>
                            </div>
                             <div className="mt-2 text-xs text-gray-500">
                                 <p>The AI will generate a title, objectives, activities, and assessment methods.</p>
                                 <p className="font-semibold">Note: AI can make mistakes. Please review the generated content carefully.</p>
                             </div>
                             {aiError && <div className="alert alert-error mt-4">{aiError}</div>}
                             {isAiLoading ? (
                                <div className="flex-center mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div><span className="ml-3">Generating...</span></div>
                             ) : aiResult && (
                                <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 max-h-64 overflow-y-auto prose dark:prose-invert prose-sm">
                                    <h4 className="font-semibold">Generated Content:</h4>
                                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{`\`\`\`json\n${aiResult}\n\`\`\``}</ReactMarkdown>
                                </div>
                             )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setIsAiModalOpen(false)} className="btn btn-secondary">Cancel</button>
                            {aiResult && !isAiLoading && <button onClick={applyAiResultToForm} className="btn btn-success">Apply to Form</button>}
                            <button onClick={handleSendToAI} className="btn btn-primary" disabled={isAiLoading}>{isAiLoading ? 'Generating...' : 'Generate'}</button>
                        </div>
                    </div>
                 </div>
            )}

            {showConfirm && confirmAction && (
                <div className="modal-backdrop">
                    <div className={`modal-content animate-scale-in max-w-sm ${styles.modalContent}`}>
                        <div className="modal-body text-center">
                            <div className="mx-auto flex-center h-12 w-12 rounded-full bg-error-100 dark:bg-error-900/50">
                                <AlertCircle className="h-6 w-6 text-error-600 dark:text-error-400" />
                            </div>
                            <h3 className="heading-5 mt-4">{confirmAction.title}</h3>
                            <p className="text-body text-gray-500 mt-2">{confirmAction.message}</p>
                        </div>
                        <div className="modal-footer bg-gray-50 dark:bg-gray-800/50">
                            <button onClick={() => setShowConfirm(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleConfirm} className="btn btn-error">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AILayer
                ref={aiLayerRef}
                prompt={aiPrompt}
                onResult={setAiResult}
                onError={(err) => setAiError(err.message || 'An unknown AI error occurred.')}
                onLoading={setIsAiLoading}
            />
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`nav-link w-full text-left ${active ? 'nav-link-active' : ''} flex items-center gap-3`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default App;