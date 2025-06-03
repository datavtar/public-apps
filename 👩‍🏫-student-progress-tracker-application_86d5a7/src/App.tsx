import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Camera as ReactCameraPro, CameraType } from 'react-camera-pro';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell as RechartsCell } from 'recharts';
import { format } from 'date-fns';
import { UserRound, Plus, Pencil, Trash2, Eye, Search, ArrowUp, ArrowDown, ArrowDownUp, Upload, Download, Sun, Moon, X, Check, BookOpen, Target, Calendar, NotebookPen, Camera as LucideCamera, Users, BarChart2, AlertCircle, Info, CheckCircle, Filter, ChevronDown, ChevronUp, ArrowLeftRight } from 'lucide-react';

// Styles import
import styles from './styles/styles.module.css';

// Type Definitions
interface ProgressRecord {
  id: string;
  assignmentName: string;
  score: number;
  totalPossibleScore: number;
  date: string; // ISO string
  notes?: string;
}

interface Student {
  id: string;
  studentIdentifier: string;
  name: string;
  photo?: string; // base64 image data
  progressRecords: ProgressRecord[];
}

type View = 'dashboard' | 'students';

type ModalType = 
  | 'addStudent' 
  | 'editStudent' 
  | 'viewStudentDetails' 
  | 'addProgress' 
  | 'editProgress' 
  | 'confirmDeleteStudent' 
  | 'confirmDeleteProgress' 
  | 'takePhoto' 
  | 'importStudents';

interface ModalState {
  type: ModalType;
  studentId?: string; // For student-specific modals
  progressId?: string; // For progress-specific modals
  itemToDeleteName?: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  icon: React.ElementType;
}

interface SortConfig {
  key: keyof Student | 'averageScore' | 'progressCount';
  direction: 'ascending' | 'descending';
}

const APP_NAME = 'Student Progress Tracker';
const LOCAL_STORAGE_KEYS = {
  students: 'studentProgressTracker_students',
  darkMode: 'studentProgressTracker_darkMode',
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: crypto.randomUUID(),
    studentIdentifier: 'S001',
    name: 'Alice Johnson',
    photo: undefined,
    progressRecords: [
      { id: crypto.randomUUID(), assignmentName: 'Math Quiz 1', score: 85, totalPossibleScore: 100, date: new Date(2024, 0, 15).toISOString(), notes: 'Good understanding of fractions.' },
      { id: crypto.randomUUID(), assignmentName: 'History Presentation', score: 92, totalPossibleScore: 100, date: new Date(2024, 0, 22).toISOString() },
    ],
  },
  {
    id: crypto.randomUUID(),
    studentIdentifier: 'S002',
    name: 'Bob Smith',
    photo: undefined,
    progressRecords: [
      { id: crypto.randomUUID(), assignmentName: 'Math Quiz 1', score: 70, totalPossibleScore: 100, date: new Date(2024, 0, 15).toISOString() },
      { id: crypto.randomUUID(), assignmentName: 'Science Experiment', score: 78, totalPossibleScore: 100, date: new Date(2024, 0, 29).toISOString(), notes: 'Needs to elaborate more on conclusions.' },
    ],
  },
  {
    id: crypto.randomUUID(),
    studentIdentifier: 'S003',
    name: 'Carol White',
    photo: undefined,
    progressRecords: [
      { id: crypto.randomUUID(), assignmentName: 'English Essay', score: 95, totalPossibleScore: 100, date: new Date(2024, 1, 5).toISOString(), notes: 'Excellent vocabulary and structure.' },
    ],
  },
];

// Helper function to calculate average score
const calculateAverageScore = (records: ProgressRecord[]): number => {
  if (!records || records.length === 0) return 0;
  const totalScore = records.reduce((sum, record) => sum + (record.score / record.totalPossibleScore) * 100, 0);
  return Math.round(totalScore / records.length);
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => {
    const savedStudents = localStorage.getItem(LOCAL_STORAGE_KEYS.students);
    return savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.darkMode);
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const cameraRef = useRef<CameraType>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [activeStudentPhoto, setActiveStudentPhoto] = useState<string | undefined>(undefined);
  
  // Effects for localStorage and dark mode
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.students, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.darkMode, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalState(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Toast management
  const addToast = (message: string, type: ToastMessage['type']) => {
    const icons = { success: CheckCircle, error: AlertCircle, info: Info };
    const newToast: ToastMessage = { id: crypto.randomUUID(), message, type, icon: icons[type] };
    setToasts(prev => [...(prev || []), newToast]);
    setTimeout(() => {
      setToasts(prev => (prev || []).filter(t => t.id !== newToast.id));
    }, 3000);
  };

  // Student CRUD operations
  const handleAddStudent = (student: Omit<Student, 'id' | 'progressRecords'>) => {
    const newStudent: Student = { ...student, id: crypto.randomUUID(), progressRecords: [], photo: activeStudentPhoto };
    setStudents(prev => [...(prev || []), newStudent]);
    addToast('Student added successfully!', 'success');
    setModalState(null);
    setActiveStudentPhoto(undefined);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev?.map(s => s.id === updatedStudent.id ? {...updatedStudent, photo: activeStudentPhoto ?? updatedStudent.photo } : s));
    addToast('Student updated successfully!', 'success');
    setModalState(null);
    setActiveStudentPhoto(undefined);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => (prev || []).filter(s => s.id !== studentId));
    addToast('Student deleted successfully!', 'success');
    setModalState(null);
  };

  // Progress Record CRUD operations
  const handleAddProgressRecord = (studentId: string, record: Omit<ProgressRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setStudents(prev => prev?.map(s => 
      s.id === studentId ? { ...s, progressRecords: [...(s.progressRecords || []), newRecord] } : s
    ));
    addToast('Progress record added!', 'success');
    setModalState(prev => prev && prev.type === 'viewStudentDetails' ? prev : null); // Keep student detail modal open
  };

  const handleUpdateProgressRecord = (studentId: string, updatedRecord: ProgressRecord) => {
    setStudents(prev => prev?.map(s => 
      s.id === studentId ? { ...s, progressRecords: s.progressRecords?.map(r => r.id === updatedRecord.id ? updatedRecord : r) } : s
    ));
    addToast('Progress record updated!', 'success');
    setModalState(prev => prev && prev.type === 'viewStudentDetails' ? prev : null);
  };

  const handleDeleteProgressRecord = (studentId: string, progressId: string) => {
    setStudents(prev => prev?.map(s => 
      s.id === studentId ? { ...s, progressRecords: (s.progressRecords || []).filter(r => r.id !== progressId) } : s
    ));
    addToast('Progress record deleted!', 'success');
    setModalState(prev => prev && prev.type === 'viewStudentDetails' ? prev : null);
  };

  // Filtering and Sorting Students
  const filteredAndSortedStudents = useMemo(() => {
    let result = (students || []).filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.studentIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'averageScore') {
          valA = calculateAverageScore(a.progressRecords);
          valB = calculateAverageScore(b.progressRecords);
        } else if (sortConfig.key === 'progressCount') {
          valA = a.progressRecords?.length ?? 0;
          valB = b.progressRecords?.length ?? 0;
        } else {
          valA = a[sortConfig.key as keyof Student];
          valB = b[sortConfig.key as keyof Student];
        }
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return result;
  }, [students, searchTerm, sortConfig]);

  const requestSort = (key: SortConfig['key']) => {
    let direction: SortConfig['direction'] = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // CSV Import/Export
  const handleImportStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          addToast('File is empty or unreadable.', 'error');
          return;
        }
        try {
          // Basic CSV parsing (assuming "Student ID","Name" format)
          const rows = text.split('\n').slice(1); // Skip header
          const importedStudents: Student[] = rows.filter(row => row.trim() !== '').map(row => {
            const [studentIdentifier, name] = row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            if (!studentIdentifier || !name) throw new Error('Invalid CSV row format.');
            return {
              id: crypto.randomUUID(),
              studentIdentifier,
              name,
              progressRecords: [],
            };
          });
          setStudents(prev => [...(prev || []), ...importedStudents]);
          addToast(`${importedStudents.length} students imported successfully!`, 'success');
        } catch (error) {
          addToast(`Error importing CSV: ${(error as Error).message}`, 'error');
          console.error("CSV Import Error: ", error);
        }
      };
      reader.readAsText(file);
      setModalState(null);
    }
    event.target.value = ''; // Reset file input
  };

  const downloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "\"Student ID\",\"Full Name\"\n"
        + "\"S004\",\"Example User\"";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Template downloaded!', 'info');
  };

  const exportAllData = () => {
    const jsonContent = JSON.stringify(students, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'student_progress_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    addToast('All data exported!', 'info');
  };

  // Camera handlers
  const handleTakePhoto = () => {
    if (cameraRef.current) {
      const photoBase64 = cameraRef.current.takePhoto();
      setActiveStudentPhoto(photoBase64);
      addToast('Photo captured!', 'success');
      setModalState(prev => prev && (prev.type === 'addStudent' || prev.type === 'editStudent' || prev.type === 'viewStudentDetails') ? prev : null );
    }
  };

  const handleSwitchCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.switchCamera();
    }
  };

  // Render Components
  const ThemeToggle: React.FC = () => (
    <button 
      onClick={() => setDarkMode(!darkMode)}
      className="theme-toggle focus:ring-offset-bg-primary ml-auto"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-thumb"></span>
      {darkMode ? <Moon size={16} className="absolute right-1 top-1/2 -translate-y-1/2 text-yellow-400"/> : <Sun size={16} className="absolute left-1 top-1/2 -translate-y-1/2 text-orange-500"/>}
    </button>
  );

  const Header: React.FC = () => (
    <header className="bg-slate-100 dark:bg-slate-800 p-4 shadow-md flex items-center sticky top-0 z-[var(--z-sticky)] theme-transition">
      <BarChart2 size={28} className="text-primary-600 dark:text-primary-400" />
      <h1 className="text-xl md:text-2xl font-bold ml-2 text-slate-800 dark:text-slate-100">{APP_NAME}</h1>
      <nav className="ml-auto flex items-center space-x-2 sm:space-x-4">
        <button 
          className={`btn-responsive ${currentView === 'dashboard' ? 'btn-primary' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'} flex items-center gap-1`}
          onClick={() => setCurrentView('dashboard')}
          aria-current={currentView === 'dashboard'}
        >
          <BarChart2 size={18}/> <span className="hidden sm:inline">Dashboard</span>
        </button>
        <button 
          className={`btn-responsive ${currentView === 'students' ? 'btn-primary' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'} flex items-center gap-1`}
          onClick={() => setCurrentView('students')}
          aria-current={currentView === 'students'}
        >
          <Users size={18}/> <span className="hidden sm:inline">Students</span>
        </button>
        <ThemeToggle />
      </nav>
    </header>
  );

  const Footer: React.FC = () => (
    <footer className="bg-slate-100 dark:bg-slate-800 p-4 text-center text-sm text-slate-600 dark:text-slate-400 mt-auto theme-transition">
      Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
    </footer>
  );

  const ToastContainer: React.FC = () => (
    <div className="fixed top-5 right-5 z-[var(--z-tooltip)] w-full max-w-xs sm:max-w-sm space-y-3">
      {toasts?.map(toast => (
        <div 
          key={toast.id} 
          className={`alert ${toast.type === 'success' ? 'alert-success' : toast.type === 'error' ? 'alert-error' : 'alert-info'} shadow-lg animate-slide-in`}
          role="alert"
        >
          <toast.icon size={20} />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );

  const DashboardView: React.FC = () => {
    const totalStudents = students?.length ?? 0;
    const classAverage = totalStudents > 0 ? Math.round((students || []).reduce((acc, s) => acc + calculateAverageScore(s.progressRecords), 0) / totalStudents) : 0;
    
    const scoreDistribution = useMemo(() => {
      const distribution = Array(5).fill(0).map((_, i) => ({ name: `${i*20+1}-${(i+1)*20}`, count: 0 })); // 1-20, 21-40, ..., 81-100
      (students || []).forEach(student => {
        (student.progressRecords || []).forEach(record => {
          const scorePercent = (record.score / record.totalPossibleScore) * 100;
          if (scorePercent >= 1 && scorePercent <= 20) distribution[0].count++;
          else if (scorePercent <= 40) distribution[1].count++;
          else if (scorePercent <= 60) distribution[2].count++;
          else if (scorePercent <= 80) distribution[3].count++;
          else if (scorePercent <= 100) distribution[4].count++;
        });
      });
      return distribution;
    }, [students]);

    const performanceCategories = useMemo(() => {
      const categories = [
        { name: 'Excellent (90+)', value: 0, color: '#4CAF50' },
        { name: 'Good (75-89)', value: 0, color: '#8BC34A' },
        { name: 'Average (60-74)', value: 0, color: '#FFEB3B' },
        { name: 'Needs Improvement (<60)', value: 0, color: '#F44336' },
      ];
      (students || []).forEach(student => {
        const avg = calculateAverageScore(student.progressRecords);
        if (avg >= 90) categories[0].value++;
        else if (avg >= 75) categories[1].value++;
        else if (avg >= 60) categories[2].value++;
        else if (avg > 0) categories[3].value++; 
      });
      return categories.filter(cat => cat.value > 0);
    }, [students]);

    return (
      <div className="container-wide p-4 md:p-6 space-y-6 fade-in">
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="stat-card card-responsive">
            <div className="stat-title">Total Students</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
          <div className="stat-card card-responsive">
            <div className="stat-title">Class Average Score</div>
            <div className="stat-value">{classAverage}%</div>
          </div>
          <div className="stat-card card-responsive">
            <div className="stat-title">Total Progress Records</div>
            <div className="stat-value">{(students || []).reduce((sum, s) => sum + (s.progressRecords?.length ?? 0), 0)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="card card-responsive">
            <h3 className="text-lg font-medium mb-4">Overall Score Distribution</h3>
            {scoreDistribution.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#475569' }} />
                  <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#475569' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }} 
                    labelStyle={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}
                  />
                  <Bar dataKey="count" name="Number of Scores" fill="var(--color-primary, #4f46e5)" className="fill-primary-500 dark:fill-primary-400" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 dark:text-slate-400">No score data available to display distribution.</p>}
          </div>

          <div className="card card-responsive">
            <h3 className="text-lg font-medium mb-4">Student Performance Categories</h3>
            {(performanceCategories?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={performanceCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {performanceCategories?.map((entry, index) => (
                      <RechartsCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }} 
                     labelStyle={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 dark:text-slate-400">No student performance data to categorize.</p>}
          </div>
        </div>
      </div>
    );
  };

  const SortIcon: React.FC<{ columnKey: SortConfig['key'] }> = ({ columnKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowDownUp size={14} className="ml-1 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const StudentsListView: React.FC = () => {
    const [showFilters, setShowFilters] = useState(false);

    return (
      <div className="container-wide p-4 md:p-6 space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Students</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn btn-primary btn-responsive flex items-center gap-1" onClick={() => { setActiveStudentPhoto(undefined); setModalState({ type: 'addStudent' }); }}>
              <Plus size={18}/> Add Student
            </button>
            <button className="btn btn-secondary btn-responsive flex items-center gap-1" onClick={() => setModalState({ type: 'importStudents' })}> 
              <Upload size={18}/> Import
            </button>
            <button className="btn bg-green-600 hover:bg-green-700 text-white btn-responsive flex items-center gap-1" onClick={exportAllData}>
              <Download size={18}/> Export All
            </button>
          </div>
        </div>

        <div className="card card-responsive p-0 sm:p-0 md:p-0 lg:p-0 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2 border-b dark:border-slate-700">
                <div className="relative w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="input input-responsive pl-10 w-full sm:w-64 md:w-72" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                </div>
                {/* Basic filter placeholder - can be expanded with dropdowns for specific criteria */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 btn-responsive flex items-center gap-1 w-full sm:w-auto"
                >
                  <Filter size={16} /> Filters {showFilters ? <ChevronUp size={16}/> : <ChevronDown size={16} />}
                </button>
            </div>
            {showFilters && (
              <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">Advanced filter options can be added here (e.g., by average score range, number of progress records).</p>
              </div>
            )}
          
            <div className="table-container rounded-none shadow-none">
              <table className="table">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="table-header px-3 py-3 sm:px-6 sm:py-4 w-16">Photo</th>
                    <th className="table-header px-3 py-3 sm:px-6 sm:py-4 group cursor-pointer" onClick={() => requestSort('name')}>Name <SortIcon columnKey='name' /></th>
                    <th className="table-header px-3 py-3 sm:px-6 sm:py-4 group cursor-pointer hidden md:table-cell" onClick={() => requestSort('studentIdentifier')}>ID <SortIcon columnKey='studentIdentifier' /></th>
                    <th className="table-header px-3 py-3 sm:px-6 sm:py-4 group cursor-pointer hidden lg:table-cell text-center" onClick={() => requestSort('averageScore')}>Avg. Score <SortIcon columnKey='averageScore' /></th>
                    <th className="table-header px-3 py-3 sm:px-6 sm:py-4 group cursor-pointer hidden lg:table-cell text-center" onClick={() => requestSort('progressCount')}>Records <SortIcon columnKey='progressCount' /></th>
                    <th className="table-header px-3 py-3 sm:px-6 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {(filteredAndSortedStudents?.length ?? 0) > 0 ? filteredAndSortedStudents?.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 theme-transition">
                      <td className="table-cell px-3 py-2 sm:px-6 sm:py-3">
                        {student.photo ? 
                          <img src={student.photo} alt={student.name} className="h-10 w-10 rounded-full object-cover"/> :
                          <UserRound size={32} className="h-10 w-10 p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400" />
                        }
                      </td>
                      <td className="table-cell px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-800 dark:text-slate-100">{student.name}</td>
                      <td className="table-cell px-3 py-2 sm:px-6 sm:py-3 hidden md:table-cell">{student.studentIdentifier}</td>
                      <td className="table-cell px-3 py-2 sm:px-6 sm:py-3 hidden lg:table-cell text-center">{calculateAverageScore(student.progressRecords)}%</td>
                      <td className="table-cell px-3 py-2 sm:px-6 sm:py-3 hidden lg:table-cell text-center">{student.progressRecords?.length ?? 0}</td>
                      <td className="table-cell px-3 py-2 sm:px-6 sm:py-3 text-right">
                        <div className="flex justify-end items-center gap-1 sm:gap-2">
                          <button 
                            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-2" 
                            onClick={() => { setActiveStudentPhoto(student.photo); setModalState({ type: 'viewStudentDetails', studentId: student.id }); }}
                            aria-label={`View details for ${student.name}`}
                           >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2" 
                            onClick={() => setModalState({ type: 'confirmDeleteStudent', studentId: student.id, itemToDeleteName: student.name })}
                            aria-label={`Delete ${student.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No students found. {searchTerm && "Try adjusting your search terms."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    );
  };
  
  // Modal Component
  const Modal: React.FC<{ children: React.ReactNode; title: string; onClose: () => void; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; }> = 
    ({ children, title, onClose, size = 'md' }) => {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-3xl md:max-w-5xl h-[90vh]',
    };
    return (
      <div 
        className="modal-backdrop fade-in" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
      >
        <div 
          className={`modal-content ${sizeClasses[size]} ${styles.modalScrollableContent}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 id="modal-title" className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Close modal">
              <X size={24} />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  };

  // Student Form (used in Add/Edit Student Modal)
  const StudentForm: React.FC<{ student?: Student; onSubmit: (data: any) => void; onCancel: () => void; formType: 'add' | 'edit' }> = 
    ({ student, onSubmit, onCancel, formType }) => {
    const [name, setName] = useState(student?.name || '');
    const [studentIdentifier, setStudentIdentifier] = useState(student?.studentIdentifier || '');
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !studentIdentifier.trim()) {
        addToast('Name and Student ID are required.', 'error');
        return;
      }
      onSubmit({ name, studentIdentifier });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="studentName" className="form-label">Full Name</label>
          <input id="studentName" type="text" value={name} onChange={e => setName(e.target.value)} className="input" required />
        </div>
        <div className="form-group">
          <label htmlFor="studentId" className="form-label">Student ID</label>
          <input id="studentId" type="text" value={studentIdentifier} onChange={e => setStudentIdentifier(e.target.value)} className="input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Student Photo</label>
          <div className="flex items-center gap-4">
            {activeStudentPhoto ? 
              <img src={activeStudentPhoto} alt="Student" className="h-24 w-24 rounded-lg object-cover"/> :
              <UserRound size={80} className="h-24 w-24 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400" />
            }
            <button type="button" className="btn btn-secondary flex items-center gap-2" onClick={() => setModalState({type: 'takePhoto', studentId: student?.id})}> 
              <LucideCamera size={18}/> {activeStudentPhoto ? 'Retake' : 'Take'} Photo
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Check size={18}/> {formType === 'add' ? 'Add Student' : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  };

  // Progress Record Form
  const ProgressForm: React.FC<{ record?: ProgressRecord; onSubmit: (data: any) => void; onCancel: () => void; formType: 'add' | 'edit' }> = 
    ({ record, onSubmit, onCancel, formType }) => {
    const [assignmentName, setAssignmentName] = useState(record?.assignmentName || '');
    const [score, setScore] = useState<string>(record?.score?.toString() || '');
    const [totalPossibleScore, setTotalPossibleScore] = useState<string>(record?.totalPossibleScore?.toString() || '100');
    const [date, setDate] = useState(record?.date ? format(new Date(record.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    const [notes, setNotes] = useState(record?.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const numScore = parseFloat(score);
      const numTotalScore = parseFloat(totalPossibleScore);
      if (!assignmentName.trim() || isNaN(numScore) || isNaN(numTotalScore) || numTotalScore <= 0) {
        addToast('Valid assignment name, score, and total score (>0) are required.', 'error');
        return;
      }
      if (numScore < 0 || numScore > numTotalScore) {
        addToast(`Score must be between 0 and ${numTotalScore}.`, 'error');
        return;
      }
      onSubmit({ assignmentName, score: numScore, totalPossibleScore: numTotalScore, date: new Date(date).toISOString(), notes });
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="assignmentName" className="form-label flex items-center gap-1"><BookOpen size={16}/> Assignment Name</label>
            <input id="assignmentName" type="text" value={assignmentName} onChange={e => setAssignmentName(e.target.value)} className="input" required />
          </div>
          <div className="form-group">
            <label htmlFor="date" className="form-label flex items-center gap-1"><Calendar size={16}/> Date</label>
            <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="input" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="score" className="form-label flex items-center gap-1"><Target size={16}/> Score</label>
            <input id="score" type="number" value={score} onChange={e => setScore(e.target.value)} className="input" required />
          </div>
          <div className="form-group">
            <label htmlFor="totalPossibleScore" className="form-label">Total Possible Score</label>
            <input id="totalPossibleScore" type="number" value={totalPossibleScore} onChange={e => setTotalPossibleScore(e.target.value)} className="input" required min="1"/>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="notes" className="form-label flex items-center gap-1"><NotebookPen size={16}/> Notes (Optional)</label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="input h-24 resize-y" />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Check size={18}/> {formType === 'add' ? 'Add Record' : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  };
  
  const renderModalContent = () => {
    if (!modalState) return null;

    const studentForModal = modalState.studentId ? (students || []).find(s => s.id === modalState.studentId) : undefined;
    const progressForModal = studentForModal && modalState.progressId ? (studentForModal.progressRecords || []).find(r => r.id === modalState.progressId) : undefined;

    switch (modalState.type) {
      case 'addStudent':
        return (
          <Modal title="Add New Student" onClose={() => { setModalState(null); setActiveStudentPhoto(undefined); }} size="lg">
            <StudentForm onSubmit={handleAddStudent} onCancel={() => { setModalState(null); setActiveStudentPhoto(undefined); }} formType="add"/>
          </Modal>
        );
      case 'editStudent':
        if (!studentForModal) return null;
        return (
          <Modal title={`Edit ${studentForModal.name}`} onClose={() => { setModalState(null); setActiveStudentPhoto(undefined); }} size="lg">
            <StudentForm student={studentForModal} onSubmit={(data) => handleUpdateStudent({ ...studentForModal, ...data })} onCancel={() => { setModalState(null); setActiveStudentPhoto(undefined); }} formType="edit"/>
          </Modal>
        );
      case 'viewStudentDetails':
        if (!studentForModal) return null;
        const studentProgressData = studentForModal.progressRecords?.map(r => ({ 
          name: r.assignmentName, 
          score: (r.score/r.totalPossibleScore)*100, 
          date: format(new Date(r.date), 'MMM d, yyyy') 
        })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return (
          <Modal title={`${studentForModal.name}'s Details`} onClose={() => { setModalState(null); setActiveStudentPhoto(undefined); }} size="full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                {activeStudentPhoto ? 
                    <img src={activeStudentPhoto} alt={studentForModal.name} className="w-full aspect-square rounded-lg object-cover shadow-md"/> :
                    <UserRound size={150} className="w-full aspect-square p-10 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400 shadow-md" />
                }
                <button type="button" className="btn btn-secondary w-full flex items-center justify-center gap-2" onClick={() => setModalState({type: 'takePhoto', studentId: studentForModal.id})}> 
                  <LucideCamera size={18}/> {activeStudentPhoto ? 'Update' : 'Set'} Photo
                </button>
                <h4 className="text-lg font-medium text-slate-700 dark:text-slate-200">{studentForModal.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">ID: {studentForModal.studentIdentifier}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Average Score: {calculateAverageScore(studentForModal.progressRecords)}%</p>
                <button className="btn btn-primary w-full flex items-center justify-center gap-2" onClick={() => { setActiveStudentPhoto(studentForModal.photo); setModalState({ type: 'editStudent', studentId: studentForModal.id })}}>
                    <Pencil size={18}/> Edit Student Info
                </button>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-200">Progress Records ({(studentForModal.progressRecords?.length ?? 0)})</h4>
                  <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => setModalState({ type: 'addProgress', studentId: studentForModal.id })}> 
                    <Plus size={16}/> Add Record
                  </button>
                </div>
                {(studentForModal.progressRecords?.length ?? 0) > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 table-container shadow-none border dark:border-slate-700 rounded-md">
                    {studentForModal.progressRecords?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())?.map(record => (
                      <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-slate-700 dark:text-slate-200">{record.assignmentName}</h5>
                            <p className="text-sm text-primary-600 dark:text-primary-400">Score: {record.score}/{record.totalPossibleScore} ({Math.round((record.score/record.totalPossibleScore)*100)}%)</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(record.date), 'PP')}</p>
                          </div>
                          <div className="flex gap-1">
                            <button className="btn btn-sm p-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-300" onClick={() => setModalState({ type: 'editProgress', studentId: studentForModal.id, progressId: record.id })} aria-label="Edit progress">
                              <Pencil size={14}/>
                            </button>
                            <button className="btn btn-sm p-1 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-600 dark:text-red-300" onClick={() => setModalState({ type: 'confirmDeleteProgress', studentId: studentForModal.id, progressId: record.id, itemToDeleteName: record.assignmentName })} aria-label="Delete progress">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                        {record.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">{record.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No progress records yet.</p>}
                
                {(studentProgressData?.length ?? 0) > 1 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Progress Over Time</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={studentProgressData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                        <XAxis dataKey="date" tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: '0.75rem' }} />
                        <YAxis domain={[0, 100]} tick={{ fill: darkMode ? '#94a3b8' : '#475569' }} label={{ value: '%', angle: -90, position: 'insideLeft', fill: darkMode ? '#94a3b8' : '#475569' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }} 
                          labelStyle={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}
                        />
                        <Line type="monotone" dataKey="score" name="Score (%) " strokeWidth={2} className="stroke-primary-500 dark:stroke-primary-400" dot={{className: "fill-primary-500 dark:fill-primary-400"}} activeDot={{ r: 6, className: "stroke-primary-600 fill-white dark:stroke-primary-300 dark:fill-slate-700" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        );
      case 'addProgress':
        if (!modalState.studentId) return null;
        return (
          <Modal title="Add Progress Record" onClose={() => setModalState({ type: 'viewStudentDetails', studentId: modalState.studentId })} size="lg">
            <ProgressForm onSubmit={(data) => handleAddProgressRecord(modalState.studentId!, data)} onCancel={() => setModalState({ type: 'viewStudentDetails', studentId: modalState.studentId! })} formType="add"/>
          </Modal>
        );
      case 'editProgress':
        if (!modalState.studentId || !progressForModal) return null;
        return (
          <Modal title={`Edit ${progressForModal.assignmentName}`} onClose={() => setModalState({ type: 'viewStudentDetails', studentId: modalState.studentId })} size="lg">
            <ProgressForm record={progressForModal} onSubmit={(data) => handleUpdateProgressRecord(modalState.studentId!, { ...progressForModal, ...data })} onCancel={() => setModalState({ type: 'viewStudentDetails', studentId: modalState.studentId! })} formType="edit"/>
          </Modal>
        );
      case 'confirmDeleteStudent':
      case 'confirmDeleteProgress':
        if ((modalState.type === 'confirmDeleteStudent' && !modalState.studentId) || (modalState.type === 'confirmDeleteProgress' && (!modalState.studentId || !modalState.progressId))) return null;
        const isStudentDelete = modalState.type === 'confirmDeleteStudent';
        const title = isStudentDelete ? `Delete Student ${modalState.itemToDeleteName}?` : `Delete Record ${modalState.itemToDeleteName}?`;
        const message = isStudentDelete 
          ? `Are you sure you want to delete ${modalState.itemToDeleteName}? This action cannot be undone.`
          : `Are you sure you want to delete the progress record for ${modalState.itemToDeleteName}? This action cannot be undone.`;
        const onConfirm = () => {
          if (isStudentDelete && modalState.studentId) handleDeleteStudent(modalState.studentId);
          else if (!isStudentDelete && modalState.studentId && modalState.progressId) handleDeleteProgressRecord(modalState.studentId, modalState.progressId);
        };
        return (
          <Modal title={title} onClose={() => setModalState(isStudentDelete ? null : { type: 'viewStudentDetails', studentId: modalState.studentId })} size="sm">
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
            <div className="modal-footer">
              <button className="btn bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200" onClick={() => setModalState(isStudentDelete ? null : { type: 'viewStudentDetails', studentId: modalState.studentId })}>Cancel</button>
              <button className="btn btn-danger bg-red-600 hover:bg-red-700 text-white flex items-center gap-2" onClick={onConfirm}>
                <Trash2 size={18}/> Delete
              </button>
            </div>
          </Modal>
        );
      case 'takePhoto':
        return (
          <Modal title="Take Student Photo" onClose={() => setModalState(modalState.studentId ? { type: 'viewStudentDetails', studentId: modalState.studentId } : { type: 'addStudent' })} size="md">
            <div className="space-y-4">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-inner bg-slate-200 dark:bg-slate-700">
                <ReactCameraPro 
                  ref={cameraRef} 
                  aspectRatio={'cover'} 
                  numberOfCamerasCallback={setNumberOfCameras}
                  errorMessages={{
                    noCameraAccessible: 'No camera found or permission denied. Please check your device settings.',
                    permissionDenied: 'Camera permission denied. Please allow camera access in your browser settings.',
                    switchCameraError: 'Failed to switch camera.'
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button className="btn btn-primary w-full flex items-center justify-center gap-2" onClick={handleTakePhoto}><LucideCamera size={18}/> Capture Photo</button>
                {numberOfCameras > 1 && (
                  <button className="btn btn-secondary w-full flex items-center justify-center gap-2" onClick={handleSwitchCamera}><ArrowLeftRight size={18}/> Switch Camera</button>
                )}
              </div>
            </div>
          </Modal>
        );
        case 'importStudents':
          return (
            <Modal title="Import Students from CSV" onClose={() => setModalState(null)} size="md">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">Upload a CSV file with student data. The CSV should have two columns: "Student ID" and "Full Name".</p>
                <button className="btn btn-sm btn-secondary flex items-center gap-1" onClick={downloadCSVTemplate}>
                  <Download size={16}/> Download Template
                </button>
                <input type="file" accept=".csv" onChange={handleImportStudents} className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-800 dark:file:text-primary-200 dark:hover:file:bg-primary-700" />
                <div className="modal-footer">
                  <button className="btn bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200" onClick={() => setModalState(null)}>Cancel</button>
                </div>
              </div>
            </Modal>
          );
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${darkMode ? 'dark' : ''}`}>
      <Header />
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 theme-transition">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'students' && <StudentsListView />}
      </main>
      <Footer />
      {renderModalContent()}
      <ToastContainer />
    </div>
  );
};

export default App;
