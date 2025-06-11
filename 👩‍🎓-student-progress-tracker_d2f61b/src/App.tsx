import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, LineChart, Line, PieChart, Pie, Cell as RechartsCell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { User, LogOut, Sun, Moon, Search, Plus, Edit, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, FileUp, FileDown, Settings, X, BarChart3, Users, Bot, Sparkles, AlertCircle, Download, BookOpen, UserCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

// TYPESCRIPT INTERFACES
interface Grade {
  id: string;
  subjectId: string;
  assignment: string;
  score: number;
  date: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

interface BehavioralNote {
  id: string;
  date: string;
  note: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  gradeLevel: number;
  avatarUrl: string;
  grades: Grade[];
  attendance: AttendanceRecord[];
  behavioralNotes: BehavioralNote[];
}

interface Subject {
  id: string;
  name: string;
}

interface GradingScale {
  grade: string;
  min: number;
  max: number;
}

interface AppSettings {
  subjects: Subject[];
  gradingScale: GradingScale[];
}

type SortConfig = {
  key: keyof Student | 'overallScore';
  direction: 'ascending' | 'descending';
} | null;

type ModalType = 'addStudent' | 'editStudent' | 'deleteStudent' | 'viewStudent' | 'confirmClearData' | null;

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // DARK MODE HOOK
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

  const { isDark, toggleDarkMode } = useDarkMode();

  // MOCK DATA
  const initialSubjects: Subject[] = [
    { id: 'subj-1', name: 'Mathematics' },
    { id: 'subj-2', name: 'Science' },
    { id: 'subj-3', name: 'History' },
    { id: 'subj-4', name: 'English' },
    { id: 'subj-5', name: 'Art' },
  ];

  const initialGradingScale: GradingScale[] = [
      { grade: 'A', min: 90, max: 100 },
      { grade: 'B', min: 80, max: 89 },
      { grade: 'C', min: 70, max: 79 },
      { grade: 'D', min: 60, max: 69 },
      { grade: 'F', min: 0, max: 59 },
  ];

  const createInitialStudents = (): Student[] => [
    {
      id: 'stu-1', firstName: 'Alice', lastName: 'Johnson', studentId: 'S001', gradeLevel: 5, avatarUrl: `https://i.pravatar.cc/150?u=stu-1`,
      grades: [
        { id: 'g1', subjectId: 'subj-1', assignment: 'Algebra Test', score: 92, date: '2025-05-15' },
        { id: 'g2', subjectId: 'subj-2', assignment: 'Biology Lab', score: 88, date: '2025-05-20' },
        { id: 'g3', subjectId: 'subj-4', assignment: 'Essay', score: 95, date: '2025-06-01' },
      ],
      attendance: [
        { id: 'a1', date: '2025-06-10', status: 'Present' }, { id: 'a2', date: '2025-06-09', status: 'Present' },
      ],
      behavioralNotes: [
        { id: 'n1', date: '2025-05-10', note: 'Excellent participation in class discussions.' }
      ]
    },
    {
      id: 'stu-2', firstName: 'Bob', lastName: 'Smith', studentId: 'S002', gradeLevel: 5, avatarUrl: `https://i.pravatar.cc/150?u=stu-2`,
      grades: [
        { id: 'g4', subjectId: 'subj-1', assignment: 'Algebra Test', score: 78, date: '2025-05-15' },
        { id: 'g5', subjectId: 'subj-3', assignment: 'WWII Project', score: 85, date: '2025-05-28' },
      ],
      attendance: [
        { id: 'a3', date: '2025-06-10', status: 'Present' }, { id: 'a4', date: '2025-06-05', status: 'Absent' },
      ],
      behavioralNotes: []
    },
    {
      id: 'stu-3', firstName: 'Charlie', lastName: 'Brown', studentId: 'S003', gradeLevel: 6, avatarUrl: `https://i.pravatar.cc/150?u=stu-3`,
      grades: [
        { id: 'g6', subjectId: 'subj-2', assignment: 'Chemistry Quiz', score: 65, date: '2025-06-02' },
        { id: 'g7', subjectId: 'subj-5', assignment: 'Painting', score: 98, date: '2025-06-05' },
      ],
      attendance: [
        { id: 'a5', date: '2025-06-10', status: 'Late' }, { id: 'a6', date: '2025-06-09', status: 'Present' },
      ],
      behavioralNotes: [
        { id: 'n2', date: '2025-06-02', note: 'Struggling with focus during science lessons. Needs encouragement.' }
      ]
    },
  ];

  // STATE MANAGEMENT
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ subjects: [], gradingScale: [] });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modal, setModal] = useState<{type: ModalType, data: any}>({ type: null, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // UTILITY FUNCTIONS
  const getOverallScore = useCallback((student: Student) => {
    if (student.grades.length === 0) return 0;
    const total = student.grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round(total / student.grades.length);
  }, []);

  const getGradeFromScore = useCallback((score: number) => {
    const scale = settings.gradingScale.find(s => score >= s.min && score <= s.max);
    return scale ? scale.grade : 'N/A';
  }, [settings.gradingScale]);
  
  // LOCALSTORAGE PERSISTENCE
  useEffect(() => {
    setLoading(true);
    try {
      const savedStudents = localStorage.getItem('students');
      const savedSettings = localStorage.getItem('settings');
      
      setStudents(savedStudents ? JSON.parse(savedStudents) : createInitialStudents());
      setSettings(savedSettings ? JSON.parse(savedSettings) : { subjects: initialSubjects, gradingScale: initialGradingScale });

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setStudents(createInitialStudents());
      setSettings({ subjects: initialSubjects, gradingScale: initialGradingScale });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }, [settings, loading]);

  // DERIVED STATE & MEMOIZED VALUES
  const filteredStudents = useMemo(() => {
    let searchableStudents = [...students];

    if (searchTerm) {
      searchableStudents = searchableStudents.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortConfig !== null) {
      searchableStudents.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'overallScore') {
          aValue = getOverallScore(a);
          bValue = getOverallScore(b);
        } else {
          aValue = a[sortConfig.key as keyof Student];
          bValue = b[sortConfig.key as keyof Student];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return searchableStudents;
  }, [students, searchTerm, sortConfig, getOverallScore]);

  // EVENT HANDLERS
  const handleSort = (key: keyof Student | 'overallScore') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const openModal = (type: ModalType, data: any = null) => {
    setModal({ type, data });
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    document.body.classList.remove('modal-open');
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
         closeModal();
         setDropdownOpen(false);
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSaveStudent = (studentData: Student) => {
    if (students.find(s => s.id === studentData.id)) {
      setStudents(students.map(s => s.id === studentData.id ? studentData : s));
    } else {
      setStudents([...students, studentData]);
    }
    closeModal();
  };
  
  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
    closeModal();
  };
  
  const handleClearData = () => {
    setStudents([]);
    setSettings({ subjects: initialSubjects, gradingScale: initialGradingScale });
    localStorage.removeItem('students');
    localStorage.removeItem('settings');
    closeModal();
  };

  const handleGenerateAISummary = (student: Student) => {
    setAiResult(null);
    setAiError(null);
    
    const studentDataSummary = {
      name: `${student.firstName} ${student.lastName}`,
      gradeLevel: student.gradeLevel,
      overallScore: getOverallScore(student),
      grades: student.grades.map(g => ({
        subject: settings.subjects.find(s => s.id === g.subjectId)?.name || 'Unknown',
        assignment: g.assignment,
        score: g.score
      })),
      attendance: student.attendance.slice(0, 5).map(a => ({ date: a.date, status: a.status })),
      notes: student.behavioralNotes.map(n => n.note),
    };

    const internalPrompt = `Analyze the following student data and generate a concise, professional performance summary suitable for a parent-teacher meeting. The summary should be well-structured in markdown format, highlighting strengths, areas for improvement, and suggesting actionable steps. The tone should be constructive and encouraging. Student data: ${JSON.stringify(studentDataSummary)}`;

    aiLayerRef.current?.sendToAI(internalPrompt);
  };
  
  // CSV Import/Export
  const handleExportCSV = () => {
    const headers = ['StudentID', 'FirstName', 'LastName', 'GradeLevel', 'OverallScore', 'Subjects', 'Grades', 'Attendance', 'Notes'];
    const rows = students.map(s => [
      s.studentId,
      s.firstName,
      s.lastName,
      s.gradeLevel,
      getOverallScore(s),
      s.grades.map(g => settings.subjects.find(sub => sub.id === g.subjectId)?.name).join('; '),
      s.grades.map(g => g.score).join('; '),
      s.attendance.map(a => `${a.date}:${a.status}`).join('; '),
      s.behavioralNotes.map(n => n.note.replace(/"/g, '""')).join('; ')
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(1);
      const newStudents: Student[] = [];
      rows.forEach((rowStr, index) => {
        const row = rowStr.split(',');
        if (row.length >= 4) {
          const newStudent: Student = {
            id: `imported-${Date.now()}-${index}`,
            studentId: row[0],
            firstName: row[1],
            lastName: row[2],
            gradeLevel: parseInt(row[3], 10),
            avatarUrl: `https://i.pravatar.cc/150?u=imported-${Date.now()}-${index}`,
            grades: [],
            attendance: [],
            behavioralNotes: [],
          };
          newStudents.push(newStudent);
        }
      });
      setStudents(prev => [...prev, ...newStudents]);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
      const headers = ['StudentID', 'FirstName', 'LastName', 'GradeLevel'];
      const exampleRow = ['S004', 'Jane', 'Doe', '5'];
      let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), exampleRow.join(',')].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "student_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };


  // RENDER COMPONENTS
  const Header = () => (
    <header id="welcome_fallback" className="navbar sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm theme-transition">
      <div className="flex items-center gap-3">
        <BookOpen className="text-primary-600" size={28} />
        <h1 className="heading-5 hidden sm:block">Student Progress Tracker</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {activeTab === 'students' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              className="input pl-10 w-32 sm:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <button
          onClick={toggleDarkMode}
          className="btn btn-ghost btn-sm p-2"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn btn-ghost flex items-center gap-2"
          >
            <div className="avatar avatar-sm">
                {currentUser?.first_name?.charAt(0)}{currentUser?.last_name?.charAt(0)}
            </div>
            <span className="hidden md:inline">{currentUser?.first_name}</span>
            <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="dropdown-content animate-scale-in" onMouseLeave={() => setDropdownOpen(false)}>
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.first_name} {currentUser?.last_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
              </div>
              <a onClick={logout} className="dropdown-item flex items-center gap-2 cursor-pointer">
                <LogOut size={16} /> Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const Tabs = () => {
    const TABS = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'reports', label: 'Reports', icon: FileDown },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
      <nav className="tabs" id="main-navigation">
        <div className="tab-list container container-lg">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`${tab.id}-tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`tab flex items-center gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  };

  const Dashboard = () => {
    const totalStudents = students.length;
    const avgPerformance = totalStudents > 0 ? Math.round(students.reduce((acc, s) => acc + getOverallScore(s), 0) / totalStudents) : 0;
    const attendanceRate = totalStudents > 0 ? Math.round(
      (students.reduce((acc, s) => acc + s.attendance.filter(a => a.status === 'Present').length, 0) /
      students.reduce((acc, s) => acc + s.attendance.length, 0)) * 100
    ) || 100 : 0;

    const performanceData = settings.gradingScale.map(scale => ({
        name: scale.grade,
        count: students.filter(s => {
            const score = getOverallScore(s);
            return score >= scale.min && score <= scale.max;
        }).length
    })).reverse();
    
    const subjectPerformance = settings.subjects.map(subject => {
        const subjectGrades = students.flatMap(s => s.grades.filter(g => g.subjectId === subject.id));
        const avgScore = subjectGrades.length > 0 ? Math.round(subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length) : 0;
        return { subject: subject.name, 'Average Score': avgScore };
    });

    const performanceOverTime = useMemo(() => {
        const months: { [key: string]: { totalScore: number, count: number } } = {};
        students.flatMap(s => s.grades).forEach(grade => {
            const month = new Date(grade.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!months[month]) {
                months[month] = { totalScore: 0, count: 0 };
            }
            months[month].totalScore += grade.score;
            months[month].count += 1;
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            'Average Score': Math.round(data.totalScore / data.count),
        })).sort((a,b) => new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime());
    }, [students]);

    return (
      <div id="dashboard-content" className="space-y-6 animate-fade-in">
        <h2 className="heading-3">Welcome back, {currentUser?.first_name}!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} title="Total Students" value={totalStudents.toString()} />
            <StatCard icon={UserCheck} title="Attendance Rate" value={`${attendanceRate}%`} change={{value: attendanceRate - 95, type: attendanceRate > 95 ? "increase" : "decrease"}}/>
            <StatCard icon={BarChart3} title="Avg. Performance" value={`${avgPerformance}%`} change={{value: avgPerformance - 80, type: avgPerformance > 80 ? "increase" : "decrease"}}/>
            <StatCard icon={AlertCircle} title="Behavioral Alerts" value={students.reduce((acc,s) => acc + s.behavioralNotes.length, 0).toString()} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card card-padding">
                <h3 className="heading-5 mb-4">Class Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                        <XAxis dataKey="name" stroke={isDark ? "var(--color-gray-400)" : "var(--color-gray-600)"}/>
                        <YAxis stroke={isDark ? "var(--color-gray-400)" : "var(--color-gray-600)"}/>
                        <RechartsTooltip contentStyle={{backgroundColor: isDark ? 'var(--color-gray-800)' : 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)'}}/>
                        <Bar dataKey="count" name="Number of Students" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="card card-padding">
                <h3 className="heading-5 mb-4">Performance Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceOverTime}>
                        <XAxis dataKey="month" stroke={isDark ? "var(--color-gray-400)" : "var(--color-gray-600)"} />
                        <YAxis stroke={isDark ? "var(--color-gray-400)" : "var(--color-gray-600)"} />
                        <RechartsTooltip contentStyle={{backgroundColor: isDark ? 'var(--color-gray-800)' : 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)'}}/>
                        <Line type="monotone" dataKey="Average Score" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="card card-padding">
            <h3 className="heading-5 mb-4">Subject Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformance}>
                    <PolarGrid stroke={isDark ? "var(--color-gray-700)" : "var(--color-gray-200)"}/>
                    <PolarAngleAxis dataKey="subject" stroke={isDark ? "var(--color-gray-400)" : "var(--color-gray-600)"}/>
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? "var(--color-gray-700)" : "var(--color-gray-200)"}/>
                    <Radar name="Average Score" dataKey="Average Score" stroke="var(--color-primary-600)" fill="var(--color-primary-500)" fillOpacity={0.6} />
                    <RechartsTooltip contentStyle={{backgroundColor: isDark ? 'var(--color-gray-800)' : 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)'}}/>
                </RadarChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const StatCard = ({ icon: Icon, title, value, change }: { icon: React.ElementType, title: string, value: string, change?: { value: number, type: 'increase' | 'decrease' } }) => (
    <div className="stat-card">
        <div className="flex-between">
            <p className="stat-title">{title}</p>
            <Icon className="text-gray-400" size={20}/>
        </div>
        <p className="stat-value">{value}</p>
        {change && (
            <div className={`stat-change ${change.type === 'increase' ? 'stat-increase' : 'stat-decrease'} flex items-center gap-1`}>
                {change.type === 'increase' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                <span>{Math.abs(change.value).toFixed(1)}% vs target</span>
            </div>
        )}
    </div>
  );

  const StudentsList = () => (
    <div id="student-list-section" className="space-y-4 animate-fade-in">
      <div className="flex-between">
        <h2 className="heading-3">Student Roster</h2>
        <button id="add-student-button" className="btn btn-primary" onClick={() => openModal('addStudent')}>
          <Plus size={18} /> Add Student
        </button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Student</th>
              <th className="table-header-cell hidden md:table-cell" onClick={() => handleSort('gradeLevel')}>
                <div className="flex items-center gap-1 cursor-pointer">Grade {sortConfig?.key === 'gradeLevel' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
              </th>
              <th className="table-header-cell" onClick={() => handleSort('overallScore')}>
                <div className="flex items-center gap-1 cursor-pointer">Overall Score {sortConfig?.key === 'overallScore' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
              </th>
              <th className="table-header-cell hidden sm:table-cell">Attendance</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const overallScore = getOverallScore(student);
                const recentAttendance = student.attendance[0]?.status || 'N/A';
                return (
                  <tr key={student.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <img src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} className="avatar avatar-md" />
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-caption">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">{student.gradeLevel}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold w-8">{overallScore}%</span>
                           <div className="progress progress-sm w-full"><div className="progress-bar" style={{width: `${overallScore}%`}}></div></div>
                        </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                        <span className={`badge ${recentAttendance === 'Present' ? 'badge-success' : recentAttendance === 'Absent' ? 'badge-error' : 'badge-warning'}`}>{recentAttendance}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                          <button className="btn btn-ghost btn-sm p-2" onClick={() => openModal('viewStudent', student)}><User size={16}/></button>
                          <button className="btn btn-ghost btn-sm p-2" onClick={() => openModal('editStudent', student)}><Edit size={16}/></button>
                          <button className="btn btn-ghost btn-sm p-2 text-error-600 hover:bg-error-50" onClick={() => openModal('deleteStudent', student)}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <p>No students found.</p>
                  {searchTerm && <p className='text-sm'>Try adjusting your search.</p>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const StudentForm = ({ student, onSave, onCancel }: { student?: Student, onSave: (student: Student) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Omit<Student, 'grades' | 'attendance' | 'behavioralNotes'>>(
      student || {
        id: `stu-${Date.now()}`,
        firstName: '',
        lastName: '',
        studentId: '',
        gradeLevel: 5,
        avatarUrl: '',
      }
    );
    
    useEffect(() => {
        if (!formData.avatarUrl) {
            setFormData(fd => ({...fd, avatarUrl: `https://i.pravatar.cc/150?u=${fd.id}`}));
        }
    }, [formData.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'gradeLevel' ? parseInt(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const studentToSave: Student = {
          ...formData,
          grades: student?.grades || [],
          attendance: student?.attendance || [],
          behavioralNotes: student?.behavioralNotes || [],
        };
        onSave(studentToSave);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="input" required/>
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="input" required/>
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="studentId">Student ID</label>
            <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} className="input" required/>
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="gradeLevel">Grade Level</label>
            <input type="number" id="gradeLevel" name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className="input" required min="1" max="12"/>
        </div>
        <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Student</button>
        </div>
      </form>
    );
  };
  
  const StudentProfileModal = ({ student, onClose }: { student: Student, onClose: () => void }) => {
    const overallScore = getOverallScore(student);
    const letterGrade = getGradeFromScore(overallScore);
    const [activeProfileTab, setActiveProfileTab] = useState('grades');
    
    return (
        <div className="p-0 md:p-6 md:pb-0">
          <div className="flex flex-col md:flex-row items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
              <img src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} className="avatar avatar-xl"/>
              <div className="text-center md:text-left">
                  <h3 className="heading-4">{student.firstName} {student.lastName}</h3>
                  <p className="text-caption">ID: {student.studentId} | Grade: {student.gradeLevel}</p>
                  <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                    <span className="badge badge-primary">Score: {overallScore}%</span>
                    <span className="badge badge-gray">Grade: {letterGrade}</span>
                  </div>
              </div>
          </div>
          
          <div className="tabs">
              <div className="tab-list px-6">
                <button className={`tab ${activeProfileTab === 'grades' ? 'tab-active' : ''}`} onClick={() => setActiveProfileTab('grades')}>Grades</button>
                <button className={`tab ${activeProfileTab === 'attendance' ? 'tab-active' : ''}`} onClick={() => setActiveProfileTab('attendance')}>Attendance</button>
                <button className={`tab ${activeProfileTab === 'notes' ? 'tab-active' : ''}`} onClick={() => setActiveProfileTab('notes')}>Notes</button>
                <button id="ai-summary-tab" className={`tab ${activeProfileTab === 'ai_summary' ? 'tab-active' : ''}`} onClick={() => setActiveProfileTab('ai_summary')}>AI Summary</button>
              </div>
          </div>

          <div className="p-6 max-h-[40vh] overflow-y-auto">
              {activeProfileTab === 'grades' && (
                <div className="space-y-3">
                  {student.grades.length > 0 ? student.grades.map(g => (
                    <div key={g.id} className="flex-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium">{g.assignment} ({settings.subjects.find(s=>s.id === g.subjectId)?.name})</p>
                        <p className="text-caption">{new Date(g.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-semibold text-lg">{g.score}%</p>
                    </div>
                  )) : <p className="text-center text-gray-500 py-4">No grades recorded.</p>}
                </div>
              )}
              {activeProfileTab === 'attendance' && (
                <div className="space-y-3">
                  {student.attendance.length > 0 ? student.attendance.map(a => (
                      <div key={a.id} className="flex-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                          <p className="font-medium">{new Date(a.date).toLocaleDateString()}</p>
                          <span className={`badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Absent' ? 'badge-error' : 'badge-warning'}`}>{a.status}</span>
                      </div>
                  )) : <p className="text-center text-gray-500 py-4">No attendance records.</p>}
                </div>
              )}
              {activeProfileTab === 'notes' && (
                <div className="space-y-3">
                  {student.behavioralNotes.length > 0 ? student.behavioralNotes.map(n => (
                    <div key={n.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                      <p className="text-caption">{new Date(n.date).toLocaleDateString()}</p>
                      <p>{n.note}</p>
                    </div>
                  )) : <p className="text-center text-gray-500 py-4">No behavioral notes.</p>}
                </div>
              )}
              {activeProfileTab === 'ai_summary' && (
                 <div id="ai-summary-button" className="space-y-4">
                    <button className="btn btn-secondary w-full" onClick={() => handleGenerateAISummary(student)} disabled={isAiLoading}>
                        {isAiLoading ? <span className="btn-loading">Generating...</span> : <><Sparkles size={16}/> Generate AI Performance Summary</>}
                    </button>
                    {aiError && <div className="alert alert-error">{aiError}</div>}
                    {aiResult && (
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult}</ReactMarkdown>
                        </div>
                    )}
                    <p className="text-caption text-center">AI-generated summaries may contain inaccuracies. Please review carefully.</p>
                 </div>
              )}
          </div>
        </div>
    );
  };
  
  const SettingsPage = () => {
    const [subjects, setSubjects] = useState(settings.subjects);
    const [newSubject, setNewSubject] = useState('');
    const [gradingScale, setGradingScale] = useState(settings.gradingScale);
    
    const handleSaveSettings = () => {
        setSettings({ subjects, gradingScale });
        alert('Settings saved!'); // Placeholder for a better notification
    };
    
    const addSubject = () => {
        if(newSubject.trim()){
            setSubjects([...subjects, { id: `subj-${Date.now()}`, name: newSubject.trim() }]);
            setNewSubject('');
        }
    };

    const removeSubject = (id: string) => {
        setSubjects(subjects.filter(s => s.id !== id));
    };

    return (
        <div id="settings-content" className="space-y-8 animate-fade-in">
            <h2 className="heading-3">Settings</h2>
            
            <div className="card">
                <div className="card-header"><h3 className="heading-5">Manage Subjects</h3></div>
                <div className="card-body space-y-4">
                    <div className="space-y-2">
                        {subjects.map(s => (
                            <div key={s.id} className="flex-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                                <span>{s.name}</span>
                                <button className="btn btn-ghost btn-xs text-error-600" onClick={() => removeSubject(s.id)}><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="New subject name" className="input"/>
                        <button className="btn btn-secondary" onClick={addSubject}>Add</button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="heading-5">Data Management</h3></div>
                <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <h4 className="font-medium">Import Students</h4>
                       <p className="text-caption">Upload a CSV file with student data. <button onClick={downloadTemplate} className="text-primary-600 hover:underline">Download Template</button></p>
                       <input id="csv-import" type="file" accept=".csv" onChange={handleImportCSV} className="input"/>
                    </div>
                     <div className="space-y-2">
                       <h4 className="font-medium">Export Data</h4>
                       <p className="text-caption">Download all student data as a single CSV file.</p>
                       <button className="btn btn-secondary w-full" onClick={handleExportCSV}><Download size={16}/> Export All Data</button>
                    </div>
                </div>
                <div className="card-footer bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800">
                   <div className="flex-between">
                       <div>
                         <h4 className="font-medium text-error-700 dark:text-error-200">Danger Zone</h4>
                         <p className="text-caption text-error-600 dark:text-error-300">This action cannot be undone.</p>
                       </div>
                       <button className="btn btn-error" onClick={() => openModal('confirmClearData')}>Clear All Data</button>
                   </div>
                </div>
            </div>
             <div className="flex justify-end">
                <button className="btn btn-primary btn-lg" onClick={handleSaveSettings}>Save All Settings</button>
            </div>
        </div>
    );
  };
  
   const ReportsPage = () => {
    return (
        <div id="reports-content" className="space-y-6 animate-fade-in">
             <h2 className="heading-3">Reports</h2>
             <div className="card card-padding text-center">
                 <FileDown size={48} className="mx-auto text-gray-400 mb-4"/>
                 <h3 className="heading-5">Report Generation</h3>
                 <p className="text-body text-gray-600 dark:text-gray-400 mt-2">More advanced reporting features are coming soon!</p>
                 <p className="text-caption mt-1">For now, you can export all student data from the Settings page.</p>
                 <button className="btn btn-primary mt-6" onClick={() => setActiveTab('settings')}>Go to Settings</button>
             </div>
        </div>
    );
  };


  if (loading) {
    return (
      <div className="flex-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-lg text-gray-600 dark:text-gray-300">
          <BookOpen className="animate-pulse" size={32}/>
          <span>Loading Progress Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="generation_issue_fallback" className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 theme-transition ${isDark ? 'dark' : ''}`}>
      <AILayer
          ref={aiLayerRef}
          prompt=""
          onResult={setAiResult}
          onError={(err) => setAiError(err.message || "An AI error occurred.")}
          onLoading={setIsAiLoading}
      />
      <Header />
      <Tabs />
      <main className="container container-lg py-6 md:py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'students' && <StudentsList />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
      
      {modal.type && (
          <div className="modal-backdrop animate-fade-in">
              <div className="modal-content animate-scale-in w-full max-w-lg">
                  {modal.type === 'addStudent' && (
                    <>
                      <div className="modal-header"><h3 className="heading-5">Add New Student</h3><button onClick={closeModal} className="btn btn-ghost p-1"><X/></button></div>
                      <div className="modal-body"><StudentForm onSave={handleSaveStudent} onCancel={closeModal}/></div>
                    </>
                  )}
                  {modal.type === 'editStudent' && (
                    <>
                      <div className="modal-header"><h3 className="heading-5">Edit Student</h3><button onClick={closeModal} className="btn btn-ghost p-1"><X/></button></div>
                      <div className="modal-body"><StudentForm student={modal.data} onSave={handleSaveStudent} onCancel={closeModal}/></div>
                    </>
                  )}
                   {modal.type === 'viewStudent' && (
                    <>
                      <div className="modal-header"><h3 className="heading-5">Student Profile</h3><button onClick={closeModal} className="btn btn-ghost p-1"><X/></button></div>
                      <div className="modal-body p-0"><StudentProfileModal student={modal.data} onClose={closeModal}/></div>
                    </>
                  )}
                  {modal.type === 'deleteStudent' && (
                    <>
                      <div className="modal-header"><h3 className="heading-5">Confirm Deletion</h3></div>
                      <div className="modal-body">
                          <p>Are you sure you want to delete student <strong>{modal.data.firstName} {modal.data.lastName}</strong>? This action cannot be undone.</p>
                      </div>
                      <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                          <button className="btn btn-error" onClick={() => handleDeleteStudent(modal.data.id)}>Delete Student</button>
                      </div>
                    </>
                  )}
                  {modal.type === 'confirmClearData' && (
                     <>
                      <div className="modal-header"><h3 className="heading-5 text-error-700 dark:text-error-300">Clear All Data</h3></div>
                      <div className="modal-body">
                          <p>Are you absolutely sure you want to delete <strong>ALL</strong> student and settings data? This is irreversible.</p>
                      </div>
                      <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                          <button className="btn btn-error" onClick={handleClearData}>Yes, Delete Everything</button>
                      </div>
                    </>
                  )}
              </div>
          </div>
      )}

      <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 mt-8">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;