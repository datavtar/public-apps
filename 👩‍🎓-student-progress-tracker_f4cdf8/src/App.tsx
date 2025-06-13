import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import { AILayerHandle } from './components/AILayer.types';
import AILayer from './components/AILayer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronsUpDown, Search, UserPlus, Trash2, Edit, X, Download, Settings, BarChart2, Users, LayoutDashboard, Sparkles, Sun, Moon, AlertTriangle, FileText, Plus, Save, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// START: Type Definitions
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

type Grade = {
  id:string;
  studentId: string;
  subjectId: string;
  score: number;
  date: string; // YYYY-MM-DD
};

type Subject = {
  id: string;
  name: string;
};

type Tab = 'dashboard' | 'students' | 'reports' | 'settings';

type SortConfig = {
  key: keyof EnrichedStudent;
  direction: 'ascending' | 'descending';
};

type EnrichedStudent = Student & {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  grades: Grade[];
};

// END: Type Definitions

// START: Custom Hooks
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const useDarkMode = (): { isDark: boolean; toggleDarkMode: () => void } => {
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

// END: Custom Hooks

// DUMMY DATA for initial state
const initialStudents: Student[] = [
    { id: '1', firstName: 'Alice', lastName: 'Johnson' },
    { id: '2', firstName: 'Bob', lastName: 'Williams' },
    { id: '3', firstName: 'Charlie', lastName: 'Brown' },
    { id: '4', firstName: 'Diana', lastName: 'Miller' },
];

const initialSubjects: Subject[] = [
    { id: 's1', name: 'Mathematics' },
    { id: 's2', name: 'Science' },
    { id: 's3', name: 'History' },
    { id: 's4', name: 'English' },
];

const initialGrades: Grade[] = [
    { id: 'g1', studentId: '1', subjectId: 's1', score: 85, date: '2025-05-10' },
    { id: 'g2', studentId: '1', subjectId: 's2', score: 92, date: '2025-05-12' },
    { id: 'g3', studentId: '1', subjectId: 's1', score: 88, date: '2025-06-01' },
    { id: 'g4', studentId: '2', subjectId: 's1', score: 72, date: '2025-05-10' },
    { id: 'g5', studentId: '2', subjectId: 's3', score: 65, date: '2025-05-15' },
    { id: 'g6', studentId: '2', subjectId: 's1', score: 68, date: '2025-06-01' },
    { id: 'g7', studentId: '3', subjectId: 's4', score: 95, date: '2025-05-20' },
    { id: 'g8', studentId: '3', subjectId: 's4', score: 91, date: '2025-06-05' },
    { id: 'g9', studentId: '4', subjectId: 's2', score: 78, date: '2025-05-18' },
    { id: 'g10', studentId: '4', subjectId: 's2', score: 75, date: '2025-06-03' },
];


export default function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [students, setStudents] = useLocalStorage<Student[]>('students', initialStudents);
  const [grades, setGrades] = useLocalStorage<Grade[]>('grades', initialGrades);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', initialSubjects);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'student' | 'subject' | 'all'; id: string | null} | null>(null);
  
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");

  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const enrichedStudents = useMemo((): EnrichedStudent[] => {
    return students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const averageScore = studentGrades.length > 0 ? studentGrades.reduce((acc, g) => acc + g.score, 0) / studentGrades.length : 0;
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (studentGrades.length >= 2) {
        const lastGrade = studentGrades[studentGrades.length - 1].score;
        const secondLastGrade = studentGrades[studentGrades.length - 2].score;
        if (lastGrade > secondLastGrade) trend = 'improving';
        else if (lastGrade < secondLastGrade) trend = 'declining';
      }
      return { ...student, averageScore, trend, grades: studentGrades };
    });
  }, [students, grades]);

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = enrichedStudents.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const { key, direction } = sortConfig;
        const sign = direction === 'ascending' ? 1 : -1;

        switch (key) {
            case 'firstName':
            case 'lastName':
                const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                if (nameA < nameB) return -1 * sign;
                if (nameA > nameB) return 1 * sign;
                return 0;
            case 'averageScore':
                return (a.averageScore - b.averageScore) * sign;
            case 'trend':
                const trendOrder = { improving: 0, stable: 1, declining: 2 };
                return (trendOrder[a.trend] - trendOrder[b.trend]) * sign;
            default:
                const valA = a[key as keyof EnrichedStudent];
                const valB = b[key as keyof EnrichedStudent];
                if(typeof valA === 'string' && typeof valB === 'string') {
                    return valA.localeCompare(valB) * sign;
                }
                if(typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * sign;
                }
                return 0;
        }
      });
    }
    return filtered;
  }, [enrichedStudents, searchTerm, sortConfig]);

  const requestSort = (key: keyof EnrichedStudent) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleOpenStudentModal = (student: EnrichedStudent | null) => {
    setSelectedStudent(student);
  };
  
  const handleCloseStudentModal = () => {
    setSelectedStudent(null);
    setAiResult(null);
    setAiError(null);
  }

  const handleOpenEditStudentForm = (student: Student | null) => {
    setIsNewStudent(student === null);
    setStudentToEdit(student ? {...student} : {id: '', firstName: '', lastName: '', email: ''});
    setIsStudentModalOpen(true);
  }

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (studentToEdit) {
      if (isNewStudent) {
        setStudents([...students, { ...studentToEdit, id: Date.now().toString() }]);
      } else {
        setStudents(students.map(s => s.id === studentToEdit.id ? studentToEdit : s));
      }
      setIsStudentModalOpen(false);
      setStudentToEdit(null);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
      setStudents(students.filter(s => s.id !== studentId));
      setGrades(grades.filter(g => g.studentId !== studentId));
      setShowDeleteConfirm(null);
  };
  
  const addOrUpdateGrade = (grade: Omit<Grade, 'id'> & {id?: string}) => {
    let nextGrades: Grade[];
    if (grade.id) {
        nextGrades = grades.map(g => g.id === grade.id ? { ...g, ...grade } as Grade : g);
    } else {
        nextGrades = [...grades, { ...grade, id: Date.now().toString() } as Grade];
    }
    setGrades(nextGrades);

    if (selectedStudent && selectedStudent.id === grade.studentId) {
        const studentGrades = nextGrades.filter(g => g.studentId === selectedStudent.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const averageScore = studentGrades.length > 0 ? studentGrades.reduce((acc, g) => acc + g.score, 0) / studentGrades.length : 0;
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (studentGrades.length >= 2) {
            const lastGrade = studentGrades[studentGrades.length - 1].score;
            const secondLastGrade = studentGrades[studentGrades.length - 2].score;
            if (lastGrade > secondLastGrade) trend = 'improving';
            else if (lastGrade < secondLastGrade) trend = 'declining';
        }
        setSelectedStudent({
            ...selectedStudent,
            grades: studentGrades,
            averageScore,
            trend
        });
    }
  };

  const deleteGrade = (gradeId: string) => {
    const gradeToDelete = grades.find(g => g.id === gradeId);
    if (!gradeToDelete) return;
    
    const nextGrades = grades.filter(g => g.id !== gradeId);
    setGrades(nextGrades);
    
    if (selectedStudent && selectedStudent.id === gradeToDelete.studentId) {
        const studentGrades = nextGrades.filter(g => g.studentId === selectedStudent.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const averageScore = studentGrades.length > 0 ? studentGrades.reduce((acc, g) => acc + g.score, 0) / studentGrades.length : 0;
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (studentGrades.length >= 2) {
            const lastGrade = studentGrades[studentGrades.length - 1].score;
            const secondLastGrade = studentGrades[studentGrades.length - 2].score;
            if (lastGrade > secondLastGrade) trend = 'improving';
            else if (lastGrade < secondLastGrade) trend = 'declining';
        }
        setSelectedStudent({
            ...selectedStudent,
            grades: studentGrades,
            averageScore,
            trend
        });
    }
  };
  
  const handleGenerateAiSummary = () => {
    if (!selectedStudent) return;
    setAiResult(null);
    setAiError(null);
    
    const studentData = {
      name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      averageScore: selectedStudent.averageScore.toFixed(1),
      grades: selectedStudent.grades.map(g => ({
        subject: subjects.find(s => s.id === g.subjectId)?.name || 'Unknown',
        score: g.score,
        date: g.date
      }))
    };
    
    const prompt = `Analyze the following student grade data for ${studentData.name}. The student's overall average is ${studentData.averageScore}. Provide a concise progress report in markdown format. Highlight strengths, areas for improvement, and suggest one or two practical focus areas for the teacher to consider. Student's recent grades are: ${JSON.stringify(studentData.grades)}.`;
    
    aiLayerRef.current?.sendToAI(prompt);
  };
  
  const handleSaveSubject = () => {
    if (!newSubjectName.trim()) return;
    if (subjectToEdit) {
      setSubjects(subjects.map(s => s.id === subjectToEdit.id ? { ...s, name: newSubjectName } : s));
    } else {
      setSubjects([...subjects, { id: Date.now().toString(), name: newSubjectName }]);
    }
    setSubjectToEdit(null);
    setNewSubjectName("");
  };
  
  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    // Also remove grades associated with this subject
    setGrades(grades.filter(g => g.subjectId !== subjectId));
    setShowDeleteConfirm(null);
  };
  
  const handleEditSubject = (subject: Subject) => {
      setSubjectToEdit(subject);
      setNewSubjectName(subject.name);
  }
  
  const handleCancelEditSubject = () => {
      setSubjectToEdit(null);
      setNewSubjectName("");
  }
  
  const exportToCsv = (data: 'all' | 'report') => {
      let csvContent = "data:text/csv;charset=utf-8,";
      let rows: string[][] = [];
      let filename = "report.csv";
      
      if(data === 'all') {
        filename = "student_progress_data.csv";
        rows.push(["Student Name", "Subject", "Score", "Date"]);
        grades.forEach(grade => {
            const student = students.find(s => s.id === grade.studentId);
            const subject = subjects.find(s => s.id === grade.subjectId);
            if(student && subject) {
                rows.push([`${student.firstName} ${student.lastName}`, subject.name, grade.score.toString(), grade.date]);
            }
        });
      } else {
        // For report tab, we can use the filtered students list
        rows.push(["Student Name", "Average Score", "Trend"]);
        filteredAndSortedStudents.forEach(student => {
            rows.push([`${student.firstName} ${student.lastName}`, student.averageScore.toFixed(2), student.trend]);
        });
      }
      
      csvContent += rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const handleDeleteAllData = () => {
    setStudents([]);
    setGrades([]);
    setSubjects([]);
    setShowDeleteConfirm(null);
  }
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardContent students={enrichedStudents} grades={grades} />;
      case 'students': return <StudentsContent />;
      case 'reports': return <ReportsContent />;
      case 'settings': return <SettingsContent />;
      default: return null;
    }
  };
  
  // Grade form component
  const GradeForm = ({ studentId, onSave, existingGrade }: { studentId: string, onSave: (grade: Omit<Grade, 'id'> & {id?:string}) => void, existingGrade?: Grade | null}) => {
    const [score, setScore] = useState(existingGrade?.score || '');
    const [subjectId, setSubjectId] = useState(existingGrade?.subjectId || subjects[0]?.id || '');
    const [date, setDate] = useState(existingGrade?.date || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (score && subjectId && date) {
        onSave({ 
            id: existingGrade?.id,
            studentId, 
            subjectId, 
            score: Number(score), 
            date 
        });
        setScore('');
        setSubjectId(subjects[0]?.id || '');
        setDate(new Date().toISOString().split('T')[0]);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="form-group w-full sm:w-auto flex-grow">
          <label htmlFor="subject" className="form-label text-xs">Subject</label>
          <select id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="select select-sm">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group w-full sm:w-24">
          <label htmlFor="score" className="form-label text-xs">Score (0-100)</label>
          <input type="number" id="score" value={score} onChange={(e) => setScore(e.target.value)} min="0" max="100" className="input input-sm" required />
        </div>
        <div className="form-group w-full sm:w-auto">
          <label htmlFor="date" className="form-label text-xs">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="input input-sm" required />
        </div>
        <button type="submit" className="btn btn-primary btn-sm w-full sm:w-auto">
            <Save className="w-4 h-4"/> {existingGrade ? 'Update' : 'Add Grade'}
        </button>
      </form>
    );
  };
  
  const DashboardContent = ({ students, grades }: { students: EnrichedStudent[], grades: Grade[]}) => {
    const classAverage = useMemo(() => students.length > 0 ? students.reduce((acc, s) => acc + s.averageScore, 0) / students.length : 0, [students]);
    const studentsToWatch = useMemo(() => students.filter(s => s.averageScore < 70 || s.trend === 'declining').slice(0, 3), [students]);
    
    const performanceDistribution = useMemo(() => {
        const distribution = [
            { name: 'A (90+)', count: 0 },
            { name: 'B (80-89)', count: 0 },
            { name: 'C (70-79)', count: 0 },
            { name: 'D (60-69)', count: 0 },
            { name: 'F (<60)', count: 0 },
        ];
        students.forEach(s => {
            if (s.averageScore >= 90) distribution[0].count++;
            else if (s.averageScore >= 80) distribution[1].count++;
            else if (s.averageScore >= 70) distribution[2].count++;
            else if (s.averageScore >= 60) distribution[3].count++;
            else distribution[4].count++;
        });
        return distribution;
    }, [students]);

    return (
        <div className="space-y-6 animate-fade-in" id="dashboard-content">
            <h2 className="heading-3">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex-between">
                        <p className="stat-title">Total Students</p>
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="stat-value">{students.length}</p>
                </div>
                <div className="stat-card">
                    <div className="flex-between">
                        <p className="stat-title">Class Average</p>
                        <BarChart2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="stat-value">{classAverage.toFixed(1)}%</p>
                </div>
                 <div className="stat-card">
                    <div className="flex-between">
                        <p className="stat-title">Students to Watch</p>
                        <AlertTriangle className="w-5 h-5 text-warning-500" />
                    </div>
                    <p className="stat-value">{studentsToWatch.length}</p>
                </div>
                <div className="stat-card">
                    <div className="flex-between">
                        <p className="stat-title">Recent Grades</p>
                        <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="stat-value">{grades.filter(g => new Date(g.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card lg:col-span-2">
                    <div className="card-header">
                        <h3 className="heading-5">Class Performance Distribution</h3>
                    </div>
                    <div className="card-body h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-muted)"/>
                                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'var(--color-bg-secondary)', 
                                        borderColor: 'var(--color-border-primary)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}
                                    cursor={{fill: 'var(--color-bg-tertiary)'}}
                                />
                                <Bar dataKey="count" name="Students" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                     <div className="card-header">
                        <h3 className="heading-5">Students to Watch</h3>
                    </div>
                    <div className="card-body">
                        {studentsToWatch.length > 0 ? (
                            <ul className="space-y-4">
                                {studentsToWatch.map(s => (
                                    <li key={s.id} className="flex-between">
                                        <span>{s.firstName} {s.lastName}</span>
                                        <span className={`badge ${s.averageScore < 70 ? 'badge-error' : 'badge-warning'}`}>{s.averageScore.toFixed(1)}%</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-caption">No students currently need special attention. Great job!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };
  
  const StudentsContent = () => (
     <div className="space-y-4 animate-fade-in" id="students-content">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="heading-3">Students</h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        id="student-search-bar"
                        type="text"
                        placeholder="Search students..."
                        className="input pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button id="add-student-button" className="btn btn-primary" onClick={() => handleOpenEditStudentForm(null)}>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Student</span>
                </button>
            </div>
        </div>
        <div className="table-container">
            <table className="table">
                <thead className="table-header">
                    <tr>
                        <th className="table-header-cell cursor-pointer" onClick={() => requestSort('firstName')}>
                            <div className="flex items-center gap-2">Name <ChevronsUpDown className="w-4 h-4" /></div>
                        </th>
                        <th className="table-header-cell cursor-pointer" onClick={() => requestSort('averageScore')}>
                             <div className="flex items-center gap-2">Avg. Score <ChevronsUpDown className="w-4 h-4" /></div>
                        </th>
                        <th className="table-header-cell">Trend</th>
                        <th className="table-header-cell text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="table-body">
                    {filteredAndSortedStudents.map(student => (
                        <tr key={student.id} className="table-row hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="table-cell font-medium">{student.firstName} {student.lastName}</td>
                            <td className="table-cell">{student.averageScore.toFixed(1)}%</td>
                            <td className="table-cell">
                                <span className={`badge ${
                                    student.trend === 'improving' ? 'badge-success' : 
                                    student.trend === 'declining' ? 'badge-error' : 'badge-gray'
                                }`}>
                                    {student.trend}
                                </span>
                            </td>
                            <td className="table-cell text-right">
                                <div className="flex justify-end gap-2">
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenStudentModal(student)}>View</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditStudentForm(student)}><Edit className="w-4 h-4" /></button>
                                    <button className="btn btn-ghost btn-sm text-error-500" onClick={() => setShowDeleteConfirm({type: 'student', id: student.id})}><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                     {filteredAndSortedStudents.length === 0 && (
                        <tr className="table-row">
                            <td colSpan={4} className="table-cell text-center text-caption py-8">
                                No students found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
  
  const ReportsContent = () => (
      <div className="space-y-6 animate-fade-in" id="reports-content">
        <div className="flex-between">
            <h2 className="heading-3">Class Report</h2>
            <button id="export-data-button" className="btn btn-secondary" onClick={() => exportToCsv('report')}>
                <Download className="w-4 h-4"/> Export Report
            </button>
        </div>
        <div className="card">
            <div className="card-body">
                <p className="text-body">This report provides an overview of the current class performance based on your active filters and sorting on the Students page.</p>
                <div className="table-container mt-4">
                     <table className="table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-header-cell">Student Name</th>
                                <th className="table-header-cell">Average Score</th>
                                <th className="table-header-cell">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredAndSortedStudents.map(student => (
                                <tr key={student.id} className="table-row">
                                    <td className="table-cell font-medium">{student.firstName} {student.lastName}</td>
                                    <td className="table-cell">{student.averageScore.toFixed(1)}%</td>
                                    <td className="table-cell">
                                        <span className={`badge ${
                                            student.trend === 'improving' ? 'badge-success' : 
                                            student.trend === 'declining' ? 'badge-error' : 'badge-gray'
                                        }`}>{student.trend}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
  );
  
  const SettingsContent = () => (
      <div className="space-y-8 animate-fade-in" id="app-settings">
          <h2 className="heading-3">Settings</h2>
          
          <div className="card">
              <div className="card-header"><h3 className="heading-5">Manage Subjects</h3></div>
              <div className="card-body space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder={subjectToEdit ? "Edit subject name" : "New subject name"} value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} className="input flex-grow"/>
                        <button className="btn btn-primary" onClick={handleSaveSubject}>{subjectToEdit ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}</button>
                        {subjectToEdit && <button className="btn btn-secondary" onClick={handleCancelEditSubject}><X className="w-4 h-4"/></button>}
                    </div>
                    <ul className="space-y-2">
                        {subjects.map(s => (
                            <li key={s.id} className="flex-between p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                                <span>{s.name}</span>
                                <div className="flex gap-2">
                                    <button className="btn btn-ghost btn-xs" onClick={() => handleEditSubject(s)}><Edit className="w-4 h-4"/></button>
                                    <button className="btn btn-ghost btn-xs text-error-500" onClick={() => setShowDeleteConfirm({type: 'subject', id: s.id})}><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
              </div>
          </div>
          
          <div className="card">
              <div className="card-header"><h3 className="heading-5">Data Management</h3></div>
              <div className="card-body flex flex-col sm:flex-row gap-4">
                  <button className="btn btn-secondary" onClick={() => exportToCsv('all')}>
                      <Download className="w-4 h-4"/> Export All Data
                  </button>
                  <button className="btn btn-error" onClick={() => setShowDeleteConfirm({type: 'all', id: null})}>
                      <Trash2 className="w-4 h-4"/> Delete All Data
                  </button>
              </div>
          </div>
      </div>
  );
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        setSelectedStudent(null);
        setIsStudentModalOpen(false);
        setShowDeleteConfirm(null);
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 ${styles.appLayout}`} id="welcome_fallback">
        <AILayer ref={aiLayerRef} prompt="" onResult={setAiResult} onError={(e) => setAiError(e.message)} onLoading={setIsAiLoading} />
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col p-4 hidden lg:flex">
            <div className="flex items-center gap-2 mb-8">
                <GraduationCap className="w-8 h-8 text-primary-500"/>
                <h1 className="heading-5 font-bold">Progress Tracker</h1>
            </div>
            <nav className="flex flex-col gap-2">
                {(['dashboard', 'students', 'reports', 'settings'] as Tab[]).map(tab => (
                    <button key={tab} id={`${tab}-tab`} onClick={() => setActiveTab(tab)}
                        className={`nav-link text-left ${activeTab === tab ? 'nav-link-active' : ''}`}>
                         {tab === 'dashboard' && <LayoutDashboard className="w-4 h-4"/>}
                         {tab === 'students' && <Users className="w-4 h-4"/>}
                         {tab === 'reports' && <BarChart2 className="w-4 h-4"/>}
                         {tab === 'settings' && <Settings className="w-4 h-4"/>}
                        <span className="capitalize">{tab}</span>
                    </button>
                ))}
            </nav>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
            <header id="generation_issue_fallback" className="navbar bg-white dark:bg-gray-900">
                <h2 className="heading-4 capitalize">{activeTab}</h2>
                <div className="flex items-center gap-4">
                    <button onClick={toggleDarkMode} className="btn btn-ghost btn-sm">
                        {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    </button>
                    {currentUser && (
                        <div className="text-right">
                            <p className="font-semibold text-sm">{currentUser.first_name} {currentUser.last_name}</p>
                            <button onClick={logout} className="text-xs text-primary-500 hover:underline">Logout</button>
                        </div>
                    )}
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {renderTabContent()}
            </main>
             <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </footer>
        </div>

        {/* Modals */}
        {selectedStudent && (
          <div className="modal-backdrop" onClick={handleCloseStudentModal}>
            <div className="modal-content max-w-4xl w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="heading-5">{selectedStudent.firstName} {selectedStudent.lastName}'s Progress</h3>
                    <button onClick={handleCloseStudentModal} className="btn btn-ghost btn-sm"><X className="w-5 h-5"/></button>
                </div>
                <div className="modal-body space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <h4 className="heading-6">Grade Trend</h4>
                            <div className="h-64 card card-padding">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={selectedStudent.grades} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-muted)"/>
                                        <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} stroke="var(--color-text-secondary)" fontSize={12} />
                                        <YAxis domain={[0, 100]} stroke="var(--color-text-secondary)" fontSize={12}/>
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-primary)'}} />
                                        <Legend />
                                        <Line type="monotone" dataKey="score" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <GradeForm studentId={selectedStudent.id} onSave={addOrUpdateGrade} />
                        </div>
                        <div className="space-y-4">
                            <h4 className="heading-6">AI-Powered Summary</h4>
                            <button id="ai-summary-button" onClick={handleGenerateAiSummary} className="btn btn-secondary w-full" disabled={isAiLoading}>
                                {isAiLoading ? <span className="btn-loading">Generating...</span> : <><Sparkles className="w-4 h-4 text-yellow-400" /> Generate Summary</>}
                            </button>
                             <div className="prose prose-sm dark:prose-invert max-w-none p-4 h-64 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                {isAiLoading && <p className="text-caption">Analyzing data...</p>}
                                {aiError && <p className="text-error-500">{aiError}</p>}
                                {aiResult ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult}</ReactMarkdown> : !isAiLoading && <p className="text-caption">Click "Generate Summary" for an AI-powered analysis of this student's progress.</p>}
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="heading-6 mb-2">All Grades</h4>
                        <div className="table-container max-h-64 overflow-y-auto">
                            <table className="table">
                                <thead className="table-header sticky top-0"><tr><th className="table-header-cell">Subject</th><th className="table-header-cell">Score</th><th className="table-header-cell">Date</th><th className="table-header-cell"></th></tr></thead>
                                <tbody className="table-body">
                                    {selectedStudent.grades.map(g => (
                                        <tr key={g.id} className="table-row">
                                            <td className="table-cell">{subjects.find(s=>s.id === g.subjectId)?.name || 'N/A'}</td>
                                            <td className="table-cell">{g.score}</td>
                                            <td className="table-cell">{g.date}</td>
                                            <td className="table-cell text-right"><button onClick={() => deleteGrade(g.id)} className="btn btn-ghost btn-xs text-error-500"><Trash2 className="w-4 h-4"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {isStudentModalOpen && studentToEdit && (
            <div className="modal-backdrop">
                <div className="modal-content max-w-md w-full animate-scale-in">
                    <form onSubmit={handleSaveStudent}>
                        <div className="modal-header">
                            <h3 className="heading-5">{isNewStudent ? 'Add New Student' : 'Edit Student'}</h3>
                             <button type="button" onClick={() => setIsStudentModalOpen(false)} className="btn btn-ghost btn-sm"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="form-group">
                                <label className="form-label form-label-required" htmlFor="firstName">First Name</label>
                                <input id="firstName" type="text" className="input" required value={studentToEdit.firstName} onChange={e => setStudentToEdit({...studentToEdit, firstName: e.target.value})} />
                            </div>
                             <div className="form-group">
                                <label className="form-label form-label-required" htmlFor="lastName">Last Name</label>
                                <input id="lastName" type="text" className="input" required value={studentToEdit.lastName} onChange={e => setStudentToEdit({...studentToEdit, lastName: e.target.value})} />
                            </div>
                             <div className="form-group">
                                <label className="form-label" htmlFor="email">Email (Optional)</label>
                                <input id="email" type="email" className="input" value={studentToEdit.email || ''} onChange={e => setStudentToEdit({...studentToEdit, email: e.target.value})} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsStudentModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Student</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showDeleteConfirm && (
            <div className="modal-backdrop">
                <div className="modal-content max-w-sm w-full animate-scale-in">
                    <div className="modal-header">
                        <h3 className="heading-5">Are you sure?</h3>
                    </div>
                    <div className="modal-body">
                        <p className="text-body">
                            {showDeleteConfirm.type === 'student' && "This will permanently delete the student and all their associated grades. This action cannot be undone."}
                            {showDeleteConfirm.type === 'subject' && "This will permanently delete the subject and all associated grades for all students. This action cannot be undone."}
                            {showDeleteConfirm.type === 'all' && "This will permanently delete ALL students, grades, and subjects. This is irreversible."}
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                        <button className="btn btn-error" onClick={() => {
                            if (showDeleteConfirm.type === 'student' && showDeleteConfirm.id) handleDeleteStudent(showDeleteConfirm.id);
                            if (showDeleteConfirm.type === 'subject' && showDeleteConfirm.id) handleDeleteSubject(showDeleteConfirm.id);
                            if (showDeleteConfirm.type === 'all') handleDeleteAllData();
                        }}>
                           Yes, delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}