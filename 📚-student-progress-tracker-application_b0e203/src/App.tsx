import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { format, parseISO, isValid, parse, subDays, isAfter, isBefore, getMonth, getYear } from 'date-fns';
import { 
    User, UserPlus, Edit, Trash2, Search, Filter, ArrowUp, ArrowDown, Check, X, 
    Calendar, BookOpen, Target, Upload, Download, Sun, Moon, Save, AlertCircle, GraduationCap, FileText, History, 
    ArrowDownUp, // Added import
    Plus, // Added import
    Mail, // Added for email communication
    MessageCircle, // Added for messaging
    BarChart2, // Added for reports
    PieChart as PieChartIcon, // Added for charts
    LineChart as LineChartIcon, // Added for charts
    ChevronDown, // Added for dropdowns
    Printer, // Added for printing reports
    FileText as ReportIcon, // Added for reports
    TrendingUp, // Added for progress
    Users, // Added for class overview
    Star // Added for goals
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Type Definitions
type Grade = {
  id: string;
  assignmentName: string;
  score: number;
  total: number;
  date: string; // ISO string format
};

type AttendanceStatus = 'present' | 'absent' | 'late';

type AttendanceRecord = {
  id: string;
  date: string; // ISO string format
  status: AttendanceStatus;
};

type HomeworkRecord = {
  id: string;
  assignmentName: string;
  date: string; // ISO string format
  completed: boolean;
};

type Student = {
  id: string;
  name: string;
  grades: Grade[];
  attendance: AttendanceRecord[];
  homework: HomeworkRecord[];
  goals: string;
  email?: string; // Optional email for communication
  parentEmail?: string; // Optional parent email
};

type Message = {
  id: string;
  studentId: string;
  subject: string;
  content: string;
  date: string; // ISO string format
  isParent: boolean; // Whether message is for parent or student
  status: 'draft' | 'sent'; // Draft messages can be edited before sending
};

type ReportType = 
  | 'classAverage' 
  | 'attendanceOverview' 
  | 'homeworkCompletion' 
  | 'studentProgress'
  | 'gradeDistribution'
  | 'timeComparison';

type SortConfig = {
  key: keyof Student | 'averageGrade' | 'attendanceRate' | 'homeworkRate';
  direction: 'ascending' | 'descending';
} | null;

type Tab = 'students' | 'reports' | 'communications';

type ModalType = 
  | 'addStudent' 
  | 'editStudent' 
  | 'viewStudent' 
  | 'addGrade' 
  | 'editGrade' 
  | 'addAttendance' 
  | 'editAttendance' 
  | 'addHomework' 
  | 'editHomework' 
  | 'uploadFile'
  | 'composeMessage'
  | 'viewReports'
  | null;

type ModalState = {
  type: ModalType;
  studentId?: string; // For actions related to a specific student
  recordId?: string; // For editing/deleting specific records (grade, attendance, homework)
  reportType?: ReportType; // For viewing specific reports
};

type DateRange = {
  start: Date;
  end: Date;
};

type TimeframePeriod = 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

// Helper Functions
const generateId = (): string => `_${Math.random().toString(36).substring(2, 9)}`;

const calculateAverageGrade = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const totalScore = grades.reduce((sum, grade) => sum + (grade.score / grade.total) * 100, 0);
  return parseFloat((totalScore / grades.length).toFixed(1));
};

const calculateAttendanceRate = (attendance: AttendanceRecord[]): number => {
  if (attendance.length === 0) return 100; // Assume 100% if no records yet
  const presentCount = attendance.filter(record => record.status === 'present' || record.status === 'late').length;
  return parseFloat(((presentCount / attendance.length) * 100).toFixed(1));
};

const calculateHomeworkCompletionRate = (homework: HomeworkRecord[]): number => {
  if (homework.length === 0) return 100; // Assume 100% if no records yet
  const completedCount = homework.filter(record => record.completed).length;
  return parseFloat(((completedCount / homework.length) * 100).toFixed(1));
};

const getGradeColor = (grade: number): string => {
  if (grade >= 90) return '#10b981'; // green-500
  if (grade >= 80) return '#22c55e'; // green-600
  if (grade >= 70) return '#eab308'; // yellow-500
  if (grade >= 60) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

const getTimeRange = (period: TimeframePeriod): DateRange => {
  const today = new Date();
  const end = new Date(today);
  let start: Date;
  
  switch (period) {
    case 'last7Days':
      start = subDays(today, 7);
      break;
    case 'last30Days':
      start = subDays(today, 30);
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'lastMonth':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end.setDate(0); // Last day of previous month
      break;
    case 'thisYear':
      start = new Date(today.getFullYear(), 0, 1);
      break;
    case 'custom':
      // Default to last 30 days for custom until user selects dates
      start = subDays(today, 30);
      break;
    default:
      start = subDays(today, 30);
  }
  
  return { start, end };
};

const isInDateRange = (date: string, range: DateRange): boolean => {
  const dateObj = parseISO(date);
  return (isAfter(dateObj, range.start) || dateObj.getTime() === range.start.getTime()) && 
         (isBefore(dateObj, range.end) || dateObj.getTime() === range.end.getTime());
};

// Sample Data (used if local storage is empty)
const initialStudentsData: Student[] = [
  {
    id: generateId(),
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    parentEmail: 'aliceparent@example.com',
    grades: [
      { id: generateId(), assignmentName: 'Math Quiz 1', score: 8, total: 10, date: new Date(2024, 8, 15).toISOString() },
      { id: generateId(), assignmentName: 'History Essay', score: 88, total: 100, date: new Date(2024, 8, 20).toISOString() },
      { id: generateId(), assignmentName: 'Science Project', score: 95, total: 100, date: new Date(2024, 7, 10).toISOString() },
      { id: generateId(), assignmentName: 'English Paper', score: 85, total: 100, date: new Date(2024, 6, 5).toISOString() },
    ],
    attendance: [
      { id: generateId(), date: new Date(2024, 8, 1).toISOString(), status: 'present' },
      { id: generateId(), date: new Date(2024, 8, 2).toISOString(), status: 'present' },
      { id: generateId(), date: new Date(2024, 8, 3).toISOString(), status: 'absent' },
      { id: generateId(), date: new Date(2024, 7, 30).toISOString(), status: 'present' },
      { id: generateId(), date: new Date(2024, 7, 29).toISOString(), status: 'present' },
    ],
    homework: [
      { id: generateId(), assignmentName: 'Math Problems Ch1', date: new Date(2024, 8, 10).toISOString(), completed: true },
      { id: generateId(), assignmentName: 'Reading Ch2', date: new Date(2024, 8, 17).toISOString(), completed: false },
      { id: generateId(), assignmentName: 'Science Lab Report', date: new Date(2024, 7, 25).toISOString(), completed: true },
      { id: generateId(), assignmentName: 'History Research', date: new Date(2024, 7, 20).toISOString(), completed: true },
    ],
    goals: 'Improve essay writing skills and math quiz scores.',
  },
  {
    id: generateId(),
    name: 'Bob The Builder',
    email: 'bob@example.com',
    parentEmail: 'bobparent@example.com',
    grades: [
        { id: generateId(), assignmentName: 'Science Project', score: 9, total: 10, date: new Date(2024, 8, 18).toISOString() },
        { id: generateId(), assignmentName: 'Math Test', score: 85, total: 100, date: new Date(2024, 8, 5).toISOString() },
        { id: generateId(), assignmentName: 'History Quiz', score: 75, total: 100, date: new Date(2024, 7, 15).toISOString() },
        { id: generateId(), assignmentName: 'English Exam', score: 82, total: 100, date: new Date(2024, 6, 20).toISOString() },
    ],
    attendance: [
        { id: generateId(), date: new Date(2024, 8, 1).toISOString(), status: 'present' },
        { id: generateId(), date: new Date(2024, 8, 2).toISOString(), status: 'late' },
        { id: generateId(), date: new Date(2024, 8, 3).toISOString(), status: 'present' },
        { id: generateId(), date: new Date(2024, 7, 30).toISOString(), status: 'absent' },
        { id: generateId(), date: new Date(2024, 7, 29).toISOString(), status: 'present' },
    ],
    homework: [
        { id: generateId(), assignmentName: 'Build a Model', date: new Date(2024, 8, 12).toISOString(), completed: true },
        { id: generateId(), assignmentName: 'Math Homework', date: new Date(2024, 8, 5).toISOString(), completed: true },
        { id: generateId(), assignmentName: 'Reading', date: new Date(2024, 7, 25).toISOString(), completed: false },
        { id: generateId(), assignmentName: 'Essay Draft', date: new Date(2024, 7, 20).toISOString(), completed: true },
    ],
    goals: 'Complete all homework on time.',
  },
  {
    id: generateId(),
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    parentEmail: 'charlieparent@example.com',
    grades: [
        { id: generateId(), assignmentName: 'Art Project', score: 95, total: 100, date: new Date(2024, 8, 10).toISOString() },
        { id: generateId(), assignmentName: 'Math Quiz', score: 65, total: 100, date: new Date(2024, 8, 3).toISOString() },
        { id: generateId(), assignmentName: 'Science Test', score: 78, total: 100, date: new Date(2024, 7, 20).toISOString() },
        { id: generateId(), assignmentName: 'History Presentation', score: 88, total: 100, date: new Date(2024, 6, 15).toISOString() },
    ],
    attendance: [
        { id: generateId(), date: new Date(2024, 8, 1).toISOString(), status: 'present' },
        { id: generateId(), date: new Date(2024, 8, 2).toISOString(), status: 'absent' },
        { id: generateId(), date: new Date(2024, 8, 3).toISOString(), status: 'present' },
        { id: generateId(), date: new Date(2024, 7, 30).toISOString(), status: 'present' },
        { id: generateId(), date: new Date(2024, 7, 29).toISOString(), status: 'late' },
    ],
    homework: [
        { id: generateId(), assignmentName: 'Art Sketch', date: new Date(2024, 8, 15).toISOString(), completed: true },
        { id: generateId(), assignmentName: 'Math Practice', date: new Date(2024, 8, 8).toISOString(), completed: false },
        { id: generateId(), assignmentName: 'Science Lab Report', date: new Date(2024, 7, 28).toISOString(), completed: true },
        { id: generateId(), assignmentName: 'Reading Chapter 5', date: new Date(2024, 7, 22).toISOString(), completed: false },
    ],
    goals: 'Improve math skills and complete all reading assignments.',
  },
];

const initialMessagesData: Message[] = [
  {
    id: generateId(),
    studentId: initialStudentsData[0].id,
    subject: 'Progress Update',
    content: 'Alice has been making great progress in History class. Keep up the good work!',
    date: new Date(2024, 8, 18).toISOString(),
    isParent: true,
    status: 'sent'
  },
  {
    id: generateId(),
    studentId: initialStudentsData[1].id,
    subject: 'Homework Reminder',
    content: 'Please remember to complete the science project by Friday.',
    date: new Date(2024, 8, 15).toISOString(),
    isParent: false,
    status: 'sent'
  },
];

// Theme Toggle Component
const ThemeToggle: React.FC<{ isDarkMode: boolean; toggleDarkMode: () => void }> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="theme-toggle focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
      name="theme-toggle"
    >
      <span className="sr-only">Toggle dark mode</span>
      <span className={`${styles.themeToggleIcon} ${isDarkMode ? styles.moonIcon : styles.sunIcon}`}>
        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
      </span>
      <span className={`theme-toggle-thumb ${isDarkMode ? styles.thumbDark : styles.thumbLight}`}></span>
    </button>
  );
};

// Main App Component
function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframePeriod>('last30Days');
  const [dateRange, setDateRange] = useState<DateRange>(getTimeRange('last30Days'));
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string}>({ 
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Local Storage Effects ---
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('studentData');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        setStudents(initialStudentsData); // Initialize with sample data if none exists
      }
      
      const savedMessages = localStorage.getItem('messageData');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages(initialMessagesData); // Initialize with sample messages if none exists
      }
    } catch (err) {
      console.error("Error loading data from localStorage:", err);
      setError("Failed to load data. Please clear local storage or contact support.");
      setStudents(initialStudentsData); // Fallback to initial data on error
      setMessages(initialMessagesData);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { // Avoid saving initial empty/loading state
      try {
        localStorage.setItem('studentData', JSON.stringify(students));
        localStorage.setItem('messageData', JSON.stringify(messages));
      } catch (err) {
        console.error("Error saving data to localStorage:", err);
        setError("Failed to save data. Changes might not persist.");
      }
    }
  }, [students, messages, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Update date range when timeframe changes
  useEffect(() => {
    if (timeframe !== 'custom') {
      const newRange = getTimeRange(timeframe);
      setDateRange(newRange);
    } else {
      // For custom range, use the values from customDateRange
      try {
        const start = parse(customDateRange.start, 'yyyy-MM-dd', new Date());
        const end = parse(customDateRange.end, 'yyyy-MM-dd', new Date());
        if (isValid(start) && isValid(end)) {
          setDateRange({ start, end });
        }
      } catch (err) {
        console.error("Error parsing custom date range:", err);
      }
    }
  }, [timeframe, customDateRange]);

  // --- Modal Management ---
  const openModal = useCallback((type: ModalType, studentId?: string, recordId?: string, reportType?: ReportType) => {
    setModalState({ type, studentId, recordId, reportType });
    document.body.classList.add('modal-open');
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null });
    document.body.classList.remove('modal-open');
    setError(null); // Clear any errors when closing the modal
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
          closeModal();
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
        window.removeEventListener('keydown', handleEsc);
    };
  }, [closeModal]);

  // --- CRUD Operations ---
  const addStudent = (name: string, goals: string, email?: string, parentEmail?: string) => {
    const newStudent: Student = { 
      id: generateId(), 
      name, 
      goals, 
      grades: [], 
      attendance: [], 
      homework: [],
      email,
      parentEmail 
    };
    setStudents(prev => [...prev, newStudent]);
    closeModal();
  };

  const updateStudent = (id: string, name: string, goals: string, email?: string, parentEmail?: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, name, goals, email, parentEmail } : s
    ));
    closeModal();
  };

  const deleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student and all their records?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      // Also delete any messages for this student
      setMessages(prev => prev.filter(m => m.studentId !== id));
      closeModal(); // Close the view modal if the student was deleted from there
    }
  };

  const addGrade = (studentId: string, grade: Omit<Grade, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grades: [...s.grades, { ...grade, id: generateId() }] } : s));
    closeModal();
  };

  const updateGrade = (studentId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grades: s.grades.map(g => g.id === gradeId ? { ...updatedGrade, id: gradeId } : g) } : s));
    closeModal();
  };

  const deleteGrade = (studentId: string, gradeId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grades: s.grades.filter(g => g.id !== gradeId) } : s));
  };

  const addAttendance = (studentId: string, record: Omit<AttendanceRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: [...s.attendance, { ...record, id: generateId() }] } : s));
    closeModal();
  };

  const updateAttendance = (studentId: string, recordId: string, updatedRecord: Omit<AttendanceRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: s.attendance.map(a => a.id === recordId ? { ...updatedRecord, id: recordId } : a) } : s));
    closeModal();
  };

  const deleteAttendance = (studentId: string, recordId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: s.attendance.filter(a => a.id !== recordId) } : s));
  };

  const addHomework = (studentId: string, record: Omit<HomeworkRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, homework: [...s.homework, { ...record, id: generateId() }] } : s));
    closeModal();
  };

  const updateHomework = (studentId: string, recordId: string, updatedRecord: Omit<HomeworkRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, homework: s.homework.map(h => h.id === recordId ? { ...updatedRecord, id: recordId } : h) } : s));
    closeModal();
  };

  const deleteHomework = (studentId: string, recordId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, homework: s.homework.filter(h => h.id !== recordId) } : s));
  };

  const addMessage = (message: Omit<Message, 'id' | 'date' | 'status'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      date: new Date().toISOString(),
      status: 'sent' // Mark as sent immediately for simplicity
    };
    setMessages(prev => [...prev, newMessage]);
    closeModal();
    return newMessage;
  };

  // --- File Handling ---
  const generateCsvTemplate = (): string => {
    const header = 'studentName,email,parentEmail,assignmentName,score,total,attendanceDate(YYYY-MM-DD),attendanceStatus(present/absent/late),homeworkName,homeworkDate(YYYY-MM-DD),homeworkCompleted(true/false),studentGoal';
    // Add a sample row structure
    const sampleRow = 'Student Example Name,student@example.com,parent@example.com,Sample Assignment,85,100,2024-09-01,present,Sample Homework,2024-09-02,true,Sample Goal'; 
    return `${header}\n${sampleRow}`;
  };

  const downloadTemplate = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_data_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsv = (csvText: string): { studentsToAdd: Student[], errors: string[] } => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data: Record<string, any>[] = [];
    const errors: string[] = [];
    const expectedHeaders = ['studentName', 'email', 'parentEmail', 'assignmentName', 'score', 'total', 'attendanceDate(YYYY-MM-DD)', 'attendanceStatus(present/absent/late)', 'homeworkName', 'homeworkDate(YYYY-MM-DD)', 'homeworkCompleted(true/false)', 'studentGoal'];
    
    // Basic header validation
    if (headers.length !== expectedHeaders.length || !headers.every((h, i) => h === expectedHeaders[i])) {
        errors.push(`Invalid CSV header. Expected: ${expectedHeaders.join(',')}`);
        return { studentsToAdd: [], errors };
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Incorrect number of columns. Expected ${headers.length}, got ${values.length}.`);
            continue;
        }
        const rowData: Record<string, any> = {};
        headers.forEach((header, index) => {
            rowData[header] = values[index]?.trim() ?? '';
        });
        data.push(rowData);
    }

    const studentsMap: Record<string, Student> = {};

    data.forEach((row, index) => {
        const rowIndex = index + 2; // CSV row number (1-based, accounting for header)
        const studentName = row['studentName'];
        if (!studentName) {
            errors.push(`Row ${rowIndex}: Missing student name.`);
            return; // Skip this row
        }

        if (!studentsMap[studentName]) {
             // Try to find existing student first before creating new one
            const existingStudent = students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
            if (existingStudent) {
                studentsMap[studentName] = { ...existingStudent }; // Copy existing student to update
                 // Update goal if provided in this row and different from existing goal
                if (row['studentGoal'] && existingStudent.goals !== row['studentGoal']) {
                    studentsMap[studentName].goals = row['studentGoal'];
                }
                // Update email and parentEmail if provided
                if (row['email'] && existingStudent.email !== row['email']) {
                    studentsMap[studentName].email = row['email'];
                }
                if (row['parentEmail'] && existingStudent.parentEmail !== row['parentEmail']) {
                    studentsMap[studentName].parentEmail = row['parentEmail'];
                }
            } else {
                studentsMap[studentName] = {
                    id: generateId(),
                    name: studentName,
                    email: row['email'] || undefined,
                    parentEmail: row['parentEmail'] || undefined,
                    grades: [],
                    attendance: [],
                    homework: [],
                    goals: row['studentGoal'] || '',
                };
            }
        }
         // Update goal if provided in this row for subsequent rows of the same student
        else if (row['studentGoal'] && studentsMap[studentName].goals !== row['studentGoal']) {
            studentsMap[studentName].goals = row['studentGoal'];
        }
        // Update email and parentEmail if provided in subsequent rows
        if (row['email'] && (!studentsMap[studentName].email || studentsMap[studentName].email !== row['email'])) {
            studentsMap[studentName].email = row['email'];
        }
        if (row['parentEmail'] && (!studentsMap[studentName].parentEmail || studentsMap[studentName].parentEmail !== row['parentEmail'])) {
            studentsMap[studentName].parentEmail = row['parentEmail'];
        }

        // Add Grade
        const assignmentName = row['assignmentName'];
        const scoreStr = row['score'];
        const totalStr = row['total'];
        if (assignmentName && scoreStr && totalStr) {
            const score = parseFloat(scoreStr);
            const total = parseFloat(totalStr);
            if (!isNaN(score) && !isNaN(total) && total > 0) {
                // Avoid adding duplicate grades based on name and score/total (simple check)
                if (!studentsMap[studentName].grades.some(g => g.assignmentName === assignmentName && g.score === score && g.total === total)) {
                    studentsMap[studentName].grades.push({
                        id: generateId(),
                        assignmentName,
                        score,
                        total,
                        date: new Date().toISOString(), // Use current date as placeholder
                    });
                }
            } else {
                errors.push(`Row ${rowIndex}: Invalid grade score/total ('${scoreStr}', '${totalStr}') for assignment '${assignmentName}'.`);
            }
        }

        // Add Attendance
        const attendanceDateStr = row['attendanceDate(YYYY-MM-DD)'];
        const attendanceStatus = row['attendanceStatus(present/absent/late)']?.toLowerCase() as AttendanceStatus;
        if (attendanceDateStr && ['present', 'absent', 'late'].includes(attendanceStatus)) {
            const attendanceDate = parse(attendanceDateStr, 'yyyy-MM-dd', new Date());
            if (isValid(attendanceDate)) {
                // Avoid adding duplicate attendance for the same date
                if (!studentsMap[studentName].attendance.some(a => format(parseISO(a.date), 'yyyy-MM-dd') === attendanceDateStr)) {
                     studentsMap[studentName].attendance.push({
                        id: generateId(),
                        date: attendanceDate.toISOString(),
                        status: attendanceStatus,
                    });
                }
            } else {
                errors.push(`Row ${rowIndex}: Invalid attendance date format ('${attendanceDateStr}'). Use YYYY-MM-DD.`);
            }
        } else if (attendanceDateStr && !attendanceStatus) {
            errors.push(`Row ${rowIndex}: Missing attendance status for date '${attendanceDateStr}'.`);
        } else if (attendanceDateStr && !['present', 'absent', 'late'].includes(attendanceStatus)) {
             errors.push(`Row ${rowIndex}: Invalid attendance status '${attendanceStatus}' for date '${attendanceDateStr}'. Must be 'present', 'absent', or 'late'.`);
        }

        // Add Homework
        const homeworkName = row['homeworkName'];
        const homeworkDateStr = row['homeworkDate(YYYY-MM-DD)'];
        const homeworkCompletedStr = row['homeworkCompleted(true/false)']?.toLowerCase();
        if (homeworkName && homeworkDateStr && (homeworkCompletedStr === 'true' || homeworkCompletedStr === 'false')) {
            const homeworkDate = parse(homeworkDateStr, 'yyyy-MM-dd', new Date());
            const completed = homeworkCompletedStr === 'true';
            if (isValid(homeworkDate)) {
                 // Avoid adding duplicate homework based on name and date
                 if (!studentsMap[studentName].homework.some(h => h.assignmentName === homeworkName && format(parseISO(h.date), 'yyyy-MM-dd') === homeworkDateStr)) {
                     studentsMap[studentName].homework.push({
                        id: generateId(),
                        assignmentName: homeworkName,
                        date: homeworkDate.toISOString(),
                        completed,
                    });
                 }
            } else {
                errors.push(`Row ${rowIndex}: Invalid homework date format ('${homeworkDateStr}'). Use YYYY-MM-DD.`);
            }
        } else if (homeworkName && homeworkDateStr && homeworkCompletedStr === undefined) {
             errors.push(`Row ${rowIndex}: Missing homework completion status for '${homeworkName}' on date '${homeworkDateStr}'.`);
        } else if (homeworkName && homeworkDateStr && homeworkCompletedStr !== 'true' && homeworkCompletedStr !== 'false') {
             errors.push(`Row ${rowIndex}: Invalid homework completion status '${homeworkCompletedStr}'. Must be 'true' or 'false'.`);
        }
    });

    const studentsToAdd = Object.values(studentsMap);
    return { studentsToAdd, errors };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError('Failed to read the file.');
        return;
      }
      try {
        const { studentsToAdd, errors } = parseCsv(text);
        
        if (errors.length > 0) {
             // Show only first few errors for brevity
            setError(`CSV Parsing Errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...and more.' : ''}`);
             // Still add the students that could be parsed, merge with existing
             if (studentsToAdd.length > 0) {
                 setStudents(prevStudents => {
                    const updatedStudents = [...prevStudents];
                    studentsToAdd.forEach(newStudentData => {
                        const existingIndex = updatedStudents.findIndex(s => s.id === newStudentData.id || s.name.toLowerCase() === newStudentData.name.toLowerCase());
                        if (existingIndex !== -1) {
                            // Merge data intelligently: Keep existing ID, update name/goal, append new records only if not already present
                            const existing = updatedStudents[existingIndex];
                            const mergedStudent = { ...existing }; // Start with existing data
                            
                            // Update name/goal if provided in CSV
                            mergedStudent.name = newStudentData.name;
                            mergedStudent.goals = newStudentData.goals;
                            
                            // Update email/parentEmail if provided
                            if (newStudentData.email) mergedStudent.email = newStudentData.email;
                            if (newStudentData.parentEmail) mergedStudent.parentEmail = newStudentData.parentEmail;

                            // Append new grades if not duplicate
                            newStudentData.grades.forEach(newGrade => {
                                if (!existing.grades.some(g => g.assignmentName === newGrade.assignmentName && g.score === newGrade.score && g.total === newGrade.total)) {
                                    mergedStudent.grades.push(newGrade);
                                }
                            });
                             // Append new attendance if not duplicate
                            newStudentData.attendance.forEach(newAtt => {
                                const newAttDateStr = format(parseISO(newAtt.date), 'yyyy-MM-dd');
                                if (!existing.attendance.some(a => format(parseISO(a.date), 'yyyy-MM-dd') === newAttDateStr)) {
                                    mergedStudent.attendance.push(newAtt);
                                }
                            });
                             // Append new homework if not duplicate
                            newStudentData.homework.forEach(newHw => {
                                const newHwDateStr = format(parseISO(newHw.date), 'yyyy-MM-dd');
                                if (!existing.homework.some(h => h.assignmentName === newHw.assignmentName && format(parseISO(h.date), 'yyyy-MM-dd') === newHwDateStr)) {
                                    mergedStudent.homework.push(newHw);
                                }
                            });

                            updatedStudents[existingIndex] = mergedStudent;
                        } else {
                            // Add as a completely new student
                            updatedStudents.push(newStudentData);
                        }
                    });
                    return updatedStudents;
                 });
                 alert("Data uploaded with some errors. Please review the error messages and the imported data.");
             } else {
                 alert("CSV parsing failed. Please check the errors and the file format.");
             }
        } else if (studentsToAdd.length > 0) {
             // Merge parsed students with existing ones
             setStudents(prevStudents => {
                const updatedStudents = [...prevStudents];
                studentsToAdd.forEach(newStudentData => {
                     const existingIndex = updatedStudents.findIndex(s => s.id === newStudentData.id || s.name.toLowerCase() === newStudentData.name.toLowerCase());
                     if (existingIndex !== -1) {
                          // Merge logic (same as above)
                          const existing = updatedStudents[existingIndex];
                          const mergedStudent = { ...existing };
                          mergedStudent.name = newStudentData.name;
                          mergedStudent.goals = newStudentData.goals;
                          
                          // Update email/parentEmail if provided
                          if (newStudentData.email) mergedStudent.email = newStudentData.email;
                          if (newStudentData.parentEmail) mergedStudent.parentEmail = newStudentData.parentEmail;
                          
                           newStudentData.grades.forEach(newGrade => {
                                if (!existing.grades.some(g => g.assignmentName === newGrade.assignmentName && g.score === newGrade.score && g.total === newGrade.total)) {
                                    mergedStudent.grades.push(newGrade);
                                }
                            });
                            newStudentData.attendance.forEach(newAtt => {
                                const newAttDateStr = format(parseISO(newAtt.date), 'yyyy-MM-dd');
                                if (!existing.attendance.some(a => format(parseISO(a.date), 'yyyy-MM-dd') === newAttDateStr)) {
                                    mergedStudent.attendance.push(newAtt);
                                }
                            });
                            newStudentData.homework.forEach(newHw => {
                                const newHwDateStr = format(parseISO(newHw.date), 'yyyy-MM-dd');
                                if (!existing.homework.some(h => h.assignmentName === newHw.assignmentName && format(parseISO(h.date), 'yyyy-MM-dd') === newHwDateStr)) {
                                    mergedStudent.homework.push(newHw);
                                }
                            });
                          updatedStudents[existingIndex] = mergedStudent;
                     } else {
                        updatedStudents.push(newStudentData);
                     }
                });
                return updatedStudents;
             });
            setError(null); // Clear previous errors
            alert('Student data uploaded successfully!');
            closeModal();
        } else {
             setError('No valid student data found in the file.');
        }
      } catch (err: any) {
        console.error("Error processing CSV:", err);
        setError(`An unexpected error occurred during file processing: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setError('Error reading the file.');
    };
    reader.readAsText(file);

    // Reset file input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // --- Filtering & Sorting Logic ---
  const sortedStudents = useMemo(() => {
    let sortableStudents = [...students];
    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case 'averageGrade':
            aValue = calculateAverageGrade(a.grades);
            bValue = calculateAverageGrade(b.grades);
            break;
          case 'attendanceRate':
            aValue = calculateAttendanceRate(a.attendance);
            bValue = calculateAttendanceRate(b.attendance);
            break;
          case 'homeworkRate':
            aValue = calculateHomeworkCompletionRate(a.homework);
            bValue = calculateHomeworkCompletionRate(b.homework);
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          default: // Should not happen with defined keys, but as fallback:
             aValue = a[sortConfig.key as keyof Student] as string | number;
             bValue = b[sortConfig.key as keyof Student] as string | number;
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
    return sortableStudents;
  }, [students, sortConfig]);

  const filteredAndSortedStudents = useMemo(() => {
    return sortedStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedStudents, searchTerm]);

  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortConfig['key']) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowDownUp size={14} className="ml-1 text-gray-400 dark:text-slate-500" />;
    }
    return sortConfig.direction === 'ascending' ? 
           <ArrowUp size={14} className="ml-1 text-primary-600 dark:text-primary-400" /> : 
           <ArrowDown size={14} className="ml-1 text-primary-600 dark:text-primary-400" />;
  };
  
  // --- Report Data Generation ---
  const getFilteredDataByTimeRange = (data: (Grade | AttendanceRecord | HomeworkRecord)[]): (Grade | AttendanceRecord | HomeworkRecord)[] => {
    return data.filter(item => isInDateRange(item.date, dateRange));
  };
  
  const getGradeDistributionData = () => {
    // Get all grades in the selected time range
    const allGrades = students.flatMap(student => 
      student.grades.filter(grade => isInDateRange(grade.date, dateRange))
    );
    
    // Create grade distribution data
    const gradeRanges = [
      { name: '90-100%', range: [90, 100], count: 0, color: '#10b981' }, // Green
      { name: '80-89%', range: [80, 89.99], count: 0, color: '#22c55e' }, // Light green
      { name: '70-79%', range: [70, 79.99], count: 0, color: '#eab308' }, // Yellow
      { name: '60-69%', range: [60, 69.99], count: 0, color: '#f59e0b' }, // Amber
      { name: 'Below 60%', range: [0, 59.99], count: 0, color: '#ef4444' } // Red
    ];
    
    // Count grades within each range
    allGrades.forEach(grade => {
      const percentage = (grade.score / grade.total) * 100;
      const matchingRange = gradeRanges.find(range => 
        percentage >= range.range[0] && percentage <= range.range[1]
      );
      if (matchingRange) matchingRange.count++;
    });
    
    return gradeRanges;
  };
  
  const getClassAverageData = () => {
    // Get average grades for each student in the time range
    const studentAverages = students.map(student => {
      const filteredGrades = student.grades.filter(grade => isInDateRange(grade.date, dateRange));
      const avgGrade = calculateAverageGrade(filteredGrades);
      return {
        name: student.name,
        grade: avgGrade,
        color: getGradeColor(avgGrade)
      };
    }).filter(data => data.grade > 0); // Remove students with no grades
    
    // Sort by grade descending for better visualization
    return studentAverages.sort((a, b) => b.grade - a.grade);
  };
  
  const getAttendanceOverviewData = () => {
    // Combine all attendance records in time range
    const allAttendance = students.flatMap(student => 
      student.attendance.filter(record => isInDateRange(record.date, dateRange))
    );
    
    // Count each status
    const presentCount = allAttendance.filter(record => record.status === 'present').length;
    const lateCount = allAttendance.filter(record => record.status === 'late').length;
    const absentCount = allAttendance.filter(record => record.status === 'absent').length;
    
    return [
      { name: 'Present', value: presentCount, color: '#10b981' }, // Green 
      { name: 'Late', value: lateCount, color: '#f59e0b' }, // Amber
      { name: 'Absent', value: absentCount, color: '#ef4444' } // Red
    ];
  };
  
  const getHomeworkCompletionData = () => {
    // Combine all homework records in time range
    const allHomework = students.flatMap(student => 
      student.homework.filter(record => isInDateRange(record.date, dateRange))
    );
    
    // Count completed vs not completed
    const completedCount = allHomework.filter(record => record.completed).length;
    const notCompletedCount = allHomework.filter(record => !record.completed).length;
    
    return [
      { name: 'Completed', value: completedCount, color: '#10b981' }, // Green
      { name: 'Not Completed', value: notCompletedCount, color: '#ef4444' } // Red
    ];
  };
  
  const getStudentProgressData = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    
    // Get grades in time range and sort by date
    const filteredGrades = student.grades
      .filter(grade => isInDateRange(grade.date, dateRange))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
    return filteredGrades.map(grade => ({
      name: grade.assignmentName.length > 12 ? grade.assignmentName.substring(0, 10) + '...' : grade.assignmentName,
      date: format(parseISO(grade.date), 'MMM d'),
      percentage: parseFloat(((grade.score / grade.total) * 100).toFixed(1))
    }));
  };
  
  const getTimeComparisonData = () => {
    // Get current month and previous month
    const today = new Date();
    const currentMonth = getMonth(today);
    const currentYear = getYear(today);
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Create date ranges for current and previous month
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const previousMonthStart = new Date(previousMonthYear, previousMonth, 1);
    const previousMonthEnd = new Date(previousMonthYear, previousMonth + 1, 0);
    
    // Calculate student performance for both time periods
    const studentData = students.map(student => {
      // Current month data
      const currentMonthGrades = student.grades.filter(grade => {
        const date = parseISO(grade.date);
        return getMonth(date) === currentMonth && getYear(date) === currentYear;
      });
      const currentMonthAvg = calculateAverageGrade(currentMonthGrades);
      
      // Previous month data
      const previousMonthGrades = student.grades.filter(grade => {
        const date = parseISO(grade.date);
        return getMonth(date) === previousMonth && getYear(date) === previousMonthYear;
      });
      const previousMonthAvg = calculateAverageGrade(previousMonthGrades);
      
      // Only include students with grades in at least one month
      if (currentMonthAvg > 0 || previousMonthAvg > 0) {
        return {
          name: student.name,
          current: currentMonthAvg,
          previous: previousMonthAvg,
          change: currentMonthAvg - previousMonthAvg
        };
      }
      return null;
    }).filter(data => data !== null) as { name: string; current: number; previous: number; change: number }[];
    
    // Sort by change (improvement) for better visualization
    return studentData.sort((a, b) => b.change - a.change);
  };

  // --- UI Rendering Logic ---
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const selectedStudentData = useMemo(() => {
    return students.find(s => s.id === modalState.studentId);
  }, [students, modalState.studentId]);
  
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value as TimeframePeriod);
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomDateRange(prev => ({ ...prev, [name]: value }));
  };

  const renderStudentForm = (student?: Student) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const goals = formData.get('goals') as string;
      const email = formData.get('email') as string || undefined;
      const parentEmail = formData.get('parentEmail') as string || undefined;
      
      if (student?.id) {
        updateStudent(student.id, name, goals, email, parentEmail);
      } else {
        addStudent(name, goals, email, parentEmail);
      }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
                <label htmlFor="studentName" className="form-label">Student Name</label>
                <input 
                    id="studentName"
                    name="name"
                    type="text" 
                    className="input input-responsive" 
                    defaultValue={student?.name ?? ''} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="studentEmail" className="form-label">Student Email (optional)</label>
                <input 
                    id="studentEmail"
                    name="email"
                    type="email" 
                    className="input input-responsive" 
                    defaultValue={student?.email ?? ''} 
                />
            </div>
            <div className="form-group">
                <label htmlFor="parentEmail" className="form-label">Parent Email (optional)</label>
                <input 
                    id="parentEmail"
                    name="parentEmail"
                    type="email" 
                    className="input input-responsive" 
                    defaultValue={student?.parentEmail ?? ''} 
                />
            </div>
            <div className="form-group">
                <label htmlFor="studentGoals" className="form-label">Goals/Targets</label>
                <textarea 
                    id="studentGoals"
                    name="goals"
                    className="input input-responsive" 
                    rows={3}
                    defaultValue={student?.goals ?? ''}
                />
            </div>
            <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Cancel</button>
                <button type="submit" className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                   <Save size={16} /> {student ? 'Save Changes' : 'Add Student'}
                </button>
            </div>
        </form>
    );
  };

  const renderRecordForm = (
    type: 'Grade' | 'Attendance' | 'Homework',
    studentId: string,
    record?: Grade | AttendanceRecord | HomeworkRecord
  ) => {
    const isEdit = !!record;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            if (type === 'Grade') {
                const assignmentName = formData.get('assignmentName') as string;
                const score = parseFloat(formData.get('score') as string);
                const total = parseFloat(formData.get('total') as string);
                const dateStr = formData.get('date') as string;
                const date = dateStr ? parseISO(dateStr).toISOString() : new Date().toISOString(); // Default to now if empty

                if (!assignmentName || isNaN(score) || isNaN(total) || total <= 0) {
                     setError("Please provide a valid assignment name, score, and positive total marks.");
                     return;
                }
                const gradeData = { assignmentName, score, total, date };
                if (isEdit && record?.id) updateGrade(studentId, record.id, gradeData);
                else addGrade(studentId, gradeData);

            } else if (type === 'Attendance') {
                const dateStr = formData.get('date') as string;
                const status = formData.get('status') as AttendanceStatus;
                const date = dateStr ? parseISO(dateStr).toISOString() : new Date().toISOString();
                if (!dateStr || !status || !['present', 'absent', 'late'].includes(status)) {
                     setError("Please provide a valid date and status (present, absent, late).");
                     return;
                }
                const attendanceData = { date, status };
                if (isEdit && record?.id) updateAttendance(studentId, record.id, attendanceData);
                else addAttendance(studentId, attendanceData);

            } else if (type === 'Homework') {
                 const assignmentName = formData.get('assignmentName') as string;
                 const dateStr = formData.get('date') as string;
                 const completed = formData.get('completed') === 'on'; // Checkbox value
                 const date = dateStr ? parseISO(dateStr).toISOString() : new Date().toISOString();
                 if (!assignmentName || !dateStr) {
                     setError("Please provide a valid assignment name and date.");
                     return;
                 }
                 const homeworkData = { assignmentName, date, completed };
                 if (isEdit && record?.id) updateHomework(studentId, record.id, homeworkData);
                 else addHomework(studentId, homeworkData);
            }
            setError(null); // Clear error on successful submission
        } catch (error) {
            console.error("Form submission error:", error);
            setError("An error occurred. Please check your input and try again.");
        }
    };

    const defaultDate = (record?.date ? format(parseISO(record.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'Grade' && (
                <>
                    <div className="form-group">
                        <label htmlFor="assignmentName" className="form-label">Assignment Name</label>
                        <input id="assignmentName" name="assignmentName" type="text" className="input input-responsive" defaultValue={(record as Grade)?.assignmentName ?? ''} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="score" className="form-label">Score</label>
                            <input id="score" name="score" type="number" step="0.1" className="input input-responsive" defaultValue={(record as Grade)?.score ?? ''} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="total" className="form-label">Total Points</label>
                            <input id="total" name="total" type="number" step="0.1" min="0.1" className="input input-responsive" defaultValue={(record as Grade)?.total ?? ''} required />
                        </div>
                    </div>
                     <div className="form-group">
                        <label htmlFor="gradeDate" className="form-label">Date</label>
                        <input id="gradeDate" name="date" type="date" className="input input-responsive" defaultValue={defaultDate} required />
                    </div>
                </>
            )}
            {type === 'Attendance' && (
                <>
                    <div className="form-group">
                        <label htmlFor="attendanceDate" className="form-label">Date</label>
                        <input id="attendanceDate" name="date" type="date" className="input input-responsive" defaultValue={defaultDate} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status" className="form-label">Status</label>
                        <select id="status" name="status" className="input input-responsive" defaultValue={(record as AttendanceRecord)?.status ?? 'present'} required>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                </>
            )}
            {type === 'Homework' && (
                <>
                    <div className="form-group">
                        <label htmlFor="hwAssignmentName" className="form-label">Homework Assignment</label>
                        <input id="hwAssignmentName" name="assignmentName" type="text" className="input input-responsive" defaultValue={(record as HomeworkRecord)?.assignmentName ?? ''} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="homeworkDate" className="form-label">Due Date</label>
                        <input id="homeworkDate" name="date" type="date" className="input input-responsive" defaultValue={defaultDate} required />
                    </div>
                    <div className="form-group flex items-center gap-2">
                        <input id="completed" name="completed" type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" defaultChecked={(record as HomeworkRecord)?.completed ?? false} />
                        <label htmlFor="completed" className="form-label mb-0">Completed</label>
                    </div>
                </>
            )}
             {error && <p className="form-error flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
            <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Cancel</button>
                <button type="submit" className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                    <Save size={16} /> {isEdit ? 'Save Changes' : `Add ${type}`}
                </button>
            </div>
        </form>
    );
  };
  
  const renderMessageForm = (studentId?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        return <p className="text-center text-gray-500 dark:text-slate-400">Student not found.</p>;
    }
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const subject = formData.get('subject') as string;
        const content = formData.get('content') as string;
        const isParent = formData.get('recipient') === 'parent';
        
        // Basic validation
        if (!subject || !content) {
            setError("Please provide both subject and message content.");
            return;
        }
        
        // Check if recipient email exists
        if (isParent && !student.parentEmail) {
            setError("Parent email is not available for this student.");
            return;
        } else if (!isParent && !student.email) {
            setError("Student email is not available.");
            return;
        }
        
        // Add message (in real app, this would trigger an actual email send)
        const message = addMessage({
            studentId,
            subject,
            content,
            isParent
        });
        
        alert(`Message "${message.subject}" has been sent to ${isParent ? 'parent' : 'student'}.`);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
                <label htmlFor="recipient" className="form-label">Recipient</label>
                <select 
                    id="recipient" 
                    name="recipient" 
                    className="input input-responsive" 
                    defaultValue={student.parentEmail ? 'parent' : 'student'}
                    required
                >
                    {student.email && <option value="student">Student ({student.name})</option>}
                    {student.parentEmail && <option value="parent">Parent of {student.name}</option>}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input 
                    id="subject" 
                    name="subject" 
                    type="text" 
                    className="input input-responsive" 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="content" className="form-label">Message</label>
                <textarea 
                    id="content" 
                    name="content" 
                    className="input input-responsive" 
                    rows={6}
                    required 
                ></textarea>
            </div>
            {error && <p className="form-error flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
            <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Cancel</button>
                <button type="submit" className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                    <Mail size={16} /> Send Message
                </button>
            </div>
        </form>
    );
  };

  const renderStudentDetailView = (student: Student) => {
    if (!student) return <p className="text-center text-gray-500 dark:text-slate-400">Student not found.</p>;

    const avgGrade = calculateAverageGrade(student.grades);
    const attRate = calculateAttendanceRate(student.attendance);
    const hwRate = calculateHomeworkCompletionRate(student.homework);

    const gradeDataForChart = student.grades
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .map(g => ({ 
            name: g.assignmentName.length > 15 ? g.assignmentName.substring(0, 12) + '...' : g.assignmentName,
            date: format(parseISO(g.date), 'MMM d'),
            percentage: parseFloat(((g.score / g.total) * 100).toFixed(1)),
        }));
        
    // Prepare additional chart data for radar chart
    const radarData = [
      {
        subject: 'Grades',
        score: avgGrade,
        fullMark: 100,
      },
      {
        subject: 'Attendance',
        score: attRate,
        fullMark: 100,
      },
      {
        subject: 'Homework',
        score: hwRate,
        fullMark: 100,
      },
    ];

    return (
        <div className="space-y-6 p-1">
            {/* Student Header & Quick Actions */} 
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap size={24} /> {student.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Target size={14} /> Goals: {student.goals || 'Not set'}
                    </p>
                    {(student.email || student.parentEmail) && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {student.email && (
                          <span className="flex items-center gap-1 mb-1">
                            <Mail size={14} /> Email: {student.email}
                          </span>
                        )}
                        {student.parentEmail && (
                          <span className="flex items-center gap-1">
                            <User size={14} /> Parent: {student.parentEmail}
                          </span>
                        )}
                      </p>
                    )}
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2 flex-wrap">
                    {(student.email || student.parentEmail) && (
                      <button 
                        onClick={() => openModal('composeMessage', student.id)} 
                        className="btn bg-blue-600 hover:bg-blue-700 text-white btn-sm btn-responsive flex items-center justify-center gap-1"
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                    )}
                    <button onClick={() => openModal('editStudent', student.id)} className="btn btn-secondary btn-sm btn-responsive flex items-center justify-center gap-1">
                        <Edit size={14} /> Edit Info
                    </button>
                    <button onClick={() => deleteStudent(student.id)} className="btn bg-red-600 hover:bg-red-700 text-white btn-sm btn-responsive flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Delete Student
                    </button>
                </div>
            </div>

             {/* Summary Stats */} 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                    <div className="stat-title">Average Grade</div>
                    <div className={`stat-value ${avgGrade < 70 ? 'text-red-600 dark:text-red-400' : avgGrade < 85 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{avgGrade}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Attendance Rate</div>
                    <div className={`stat-value ${attRate < 80 ? 'text-red-600 dark:text-red-400' : attRate < 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{attRate}%</div>
                </div>
                 <div className="stat-card">
                    <div className="stat-title">Homework Completion</div>
                    <div className={`stat-value ${hwRate < 70 ? 'text-red-600 dark:text-red-400' : hwRate < 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{hwRate}%</div>
                </div>
            </div>
            
            {/* Performance Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card-responsive theme-transition-all">
                <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-slate-200">Performance Overview</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={radarData}>
                    <PolarGrid stroke="var(--color-text-base)" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" stroke="var(--color-text-base)" />
                    <PolarRadiusAxis domain={[0, 100]} stroke="var(--color-text-base)" />
                    <Radar name="Performance" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                      itemStyle={{ color: 'var(--color-text-base)'}} 
                      formatter={(value: number) => [`${value}%`, 'Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Grade Chart */} 
              {student.grades.length > 1 && (
                <div className="card-responsive theme-transition-all">
                    <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-slate-200">Grade Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={gradeDataForChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-base)" strokeOpacity={0.2} />
                            <XAxis dataKey="date" stroke="var(--color-text-base)" fontSize={12} />
                            <YAxis stroke="var(--color-text-base)" fontSize={12} domain={[0, 100]} unit="%" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                                itemStyle={{ color: 'var(--color-text-base)'}} 
                                labelStyle={{ color: 'var(--color-text-base)', fontWeight: 'bold' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="percentage" name="Grade (%) " stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Data Sections (Grades, Attendance, Homework) */} 
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                 {/* Grades Section */}           
                <div className="card-responsive theme-transition-all">
                   <div className="flex-between mb-3">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-slate-200">Grades</h4>
                        <button onClick={() => openModal('addGrade', student.id)} className="btn btn-primary btn-sm btn-responsive flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Grade
                         </button>
                    </div>
                    {student.grades.length > 0 ? (
                        <div className="table-container theme-transition-all">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-cell px-3 py-2">Assignment</th>
                                        <th className="table-cell px-3 py-2 text-center">Score</th>
                                        <th className="table-cell px-3 py-2 text-center">Date</th>
                                        <th className="table-cell px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {student.grades.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(grade => (
                                        <tr key={grade.id}>
                                            <td className="table-cell px-3 py-2 font-medium text-gray-900 dark:text-white">{grade.assignmentName}</td>
                                            <td className="table-cell px-3 py-2 text-center">{grade.score}/{grade.total} <span className="text-xs text-gray-500 dark:text-slate-400">({((grade.score / grade.total) * 100).toFixed(0)}%)</span></td>
                                            <td className="table-cell px-3 py-2 text-center">{format(parseISO(grade.date), 'MMM d, yyyy')}</td>
                                            <td className="table-cell px-3 py-2 text-right space-x-1">
                                                <button onClick={() => openModal('editGrade', student.id, grade.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit grade for ${grade.assignmentName}`}><Edit size={16} /></button>
                                                <button onClick={() => deleteGrade(student.id, grade.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete grade for ${grade.assignmentName}`}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-gray-500 dark:text-slate-400 py-4">No grades recorded yet.</p>}
                </div>

                {/* Attendance Section */} 
                 <div className="card-responsive theme-transition-all">
                     <div className="flex-between mb-3">
                         <h4 className="text-lg font-medium text-gray-800 dark:text-slate-200">Attendance</h4>
                         <button onClick={() => openModal('addAttendance', student.id)} className="btn btn-primary btn-sm btn-responsive flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Record
                         </button>
                     </div>
                    {student.attendance.length > 0 ? (
                         <div className="table-container theme-transition-all">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-cell px-3 py-2">Date</th>
                                        <th className="table-cell px-3 py-2 text-center">Status</th>
                                        <th className="table-cell px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {student.attendance.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(att => (
                                        <tr key={att.id}>
                                            <td className="table-cell px-3 py-2 font-medium text-gray-900 dark:text-white">{format(parseISO(att.date), 'MMM d, yyyy')}</td>
                                            <td className="table-cell px-3 py-2 text-center">
                                                <span className={`badge ${att.status === 'present' ? 'badge-success' : att.status === 'absent' ? 'badge-error' : 'badge-warning'}`}>
                                                    {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="table-cell px-3 py-2 text-right space-x-1">
                                                <button onClick={() => openModal('editAttendance', student.id, att.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit attendance for ${format(parseISO(att.date), 'MMM d, yyyy')}`}><Edit size={16} /></button>
                                                <button onClick={() => deleteAttendance(student.id, att.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete attendance for ${format(parseISO(att.date), 'MMM d, yyyy')}`}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : <p className="text-center text-gray-500 dark:text-slate-400 py-4">No attendance records yet.</p>}
                 </div>

                {/* Homework Section */} 
                <div className="card-responsive theme-transition-all">
                     <div className="flex-between mb-3">
                         <h4 className="text-lg font-medium text-gray-800 dark:text-slate-200">Homework</h4>
                         <button onClick={() => openModal('addHomework', student.id)} className="btn btn-primary btn-sm btn-responsive flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Record
                         </button>
                     </div>
                    {student.homework.length > 0 ? (
                         <div className="table-container theme-transition-all">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-cell px-3 py-2">Assignment</th>
                                        <th className="table-cell px-3 py-2 text-center">Due Date</th>
                                        <th className="table-cell px-3 py-2 text-center">Status</th>
                                        <th className="table-cell px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {student.homework.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(hw => (
                                        <tr key={hw.id}>
                                            <td className="table-cell px-3 py-2 font-medium text-gray-900 dark:text-white">{hw.assignmentName}</td>
                                            <td className="table-cell px-3 py-2 text-center">{format(parseISO(hw.date), 'MMM d, yyyy')}</td>
                                            <td className="table-cell px-3 py-2 text-center">
                                                {hw.completed ? 
                                                    <span className="badge badge-success"><Check size={14} className="inline mr-1"/> Completed</span> : 
                                                    <span className="badge badge-error"><X size={14} className="inline mr-1"/> Incomplete</span>}
                                            </td>
                                            <td className="table-cell px-3 py-2 text-right space-x-1">
                                                <button onClick={() => openModal('editHomework', student.id, hw.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit homework status for ${hw.assignmentName}`}><Edit size={16} /></button>
                                                <button onClick={() => deleteHomework(student.id, hw.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete homework record for ${hw.assignmentName}`}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : <p className="text-center text-gray-500 dark:text-slate-400 py-4">No homework records yet.</p>}
                 </div>
            </div>

        </div>
    );
  };
  
  const renderReportContent = (reportType?: ReportType) => {
    // Default to class average if no report type specified
    const type = reportType || 'classAverage';
    
    // Timeframe selector UI
    const timeframeSelector = (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="form-group mb-0 w-full sm:w-auto">
            <label htmlFor="timeframe" className="form-label">Time Period:</label>
            <select 
              id="timeframe" 
              value={timeframe} 
              onChange={handleTimeframeChange}
              className="input input-responsive w-full sm:w-auto"
            >
              <option value="last7Days">Last 7 Days</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary btn-responsive flex items-center justify-center gap-1 w-full sm:w-auto"
            onClick={() => {
              try {
                // Create a div to contain the chart for printing
                const printContent = document.getElementById('report-content');
                if (!printContent) return;
                
                const originalContents = document.body.innerHTML;
                document.body.innerHTML = `
                  <div class="p-8">
                    <h1 class="text-2xl font-bold mb-4">Student Progress Report</h1>
                    <p class="mb-6">Time Period: ${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}</p>
                    ${printContent.innerHTML}
                  </div>
                `;
                
                window.print();
                document.body.innerHTML = originalContents;
                window.location.reload(); // Reload the page to restore all functionality
              } catch (error) {
                console.error('Print error:', error);
                alert('There was an error while trying to print the report.');
              }
            }}
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
        
        {/* Custom date range inputs */}
        {timeframe === 'custom' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label htmlFor="startDate" className="form-label">Start Date:</label>
              <input 
                type="date" 
                id="startDate"
                name="start"
                value={customDateRange.start}
                onChange={handleCustomDateChange}
                className="input input-responsive"
                max={customDateRange.end}
              />
            </div>
            <div className="form-group mb-0">
              <label htmlFor="endDate" className="form-label">End Date:</label>
              <input 
                type="date" 
                id="endDate"
                name="end"
                value={customDateRange.end}
                onChange={handleCustomDateChange}
                className="input input-responsive"
                min={customDateRange.start}
              />
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-500 dark:text-slate-400 mt-2">
          Showing data from {format(dateRange.start, 'MMM d, yyyy')} to {format(dateRange.end, 'MMM d, yyyy')}
        </div>
      </div>
    );
    
    // Report tabs
    const reportTabs = (
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-slate-700 pb-2">
        <button 
          className={`btn btn-sm ${type === 'classAverage' ? 'btn-primary' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}
          onClick={() => openModal('viewReports', undefined, undefined, 'classAverage')}
        >
          <BarChart2 size={14} className="mr-1" /> Class Averages
        </button>
        <button 
          className={`btn btn-sm ${type === 'attendanceOverview' ? 'btn-primary' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}
          onClick={() => openModal('viewReports', undefined, undefined, 'attendanceOverview')}
        >
          <Calendar size={14} className="mr-1" /> Attendance
        </button>
        <button 
          className={`btn btn-sm ${type === 'homeworkCompletion' ? 'btn-primary' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}
          onClick={() => openModal('viewReports', undefined, undefined, 'homeworkCompletion')}
        >
          <BookOpen size={14} className="mr-1" /> Homework
        </button>
        <button 
          className={`btn btn-sm ${type === 'gradeDistribution' ? 'btn-primary' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}
          onClick={() => openModal('viewReports', undefined, undefined, 'gradeDistribution')}
        >
          <PieChartIcon size={14} className="mr-1" /> Grade Distribution
        </button>
        <button 
          className={`btn btn-sm ${type === 'timeComparison' ? 'btn-primary' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}
          onClick={() => openModal('viewReports', undefined, undefined, 'timeComparison')}
        >
          <LineChartIcon size={14} className="mr-1" /> Progress Over Time
        </button>
      </div>
    );
    
    // Report content based on type
    let reportContent;
    let reportDescription;
    
    switch (type) {
      case 'classAverage': {
        const data = getClassAverageData();
        reportDescription = "This report shows the average grade for each student in the selected time period.";
        reportContent = (
          <div className="card-responsive theme-transition-all">
            <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Class Average Grades</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{reportDescription}</p>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-base)" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-text-base)" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={80} 
                  />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-base)" label={{ value: 'Grade (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Grade']}
                  />
                  <Bar dataKey="grade" name="Average Grade (%)">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-slate-400 py-4">No grade data available for the selected time period.</p>
            )}
          </div>
        );
        break;
      }
      
      case 'attendanceOverview': {
        const data = getAttendanceOverviewData();
        reportDescription = "This report shows the overall attendance statistics for the class in the selected time period.";
        reportContent = (
          <div className="card-responsive theme-transition-all">
            <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Class Attendance Overview</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{reportDescription}</p>
            {data.reduce((sum, item) => sum + item.value, 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                        itemStyle={{ color: 'var(--color-text-base)'}} 
                        formatter={(value: number) => [value, 'Records']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Count</th>
                        <th className="text-left py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        const total = data.reduce((sum, i) => sum + i.value, 0);
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        return (
                          <tr key={index}>
                            <td className="py-2 flex items-center">
                              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                              {item.name}
                            </td>
                            <td className="py-2">{item.value}</td>
                            <td className="py-2">{percentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-slate-400 py-4">No attendance data available for the selected time period.</p>
            )}
          </div>
        );
        break;
      }
      
      case 'homeworkCompletion': {
        const data = getHomeworkCompletionData();
        reportDescription = "This report shows the homework completion statistics for the class in the selected time period.";
        reportContent = (
          <div className="card-responsive theme-transition-all">
            <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Homework Completion Overview</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{reportDescription}</p>
            {data.reduce((sum, item) => sum + item.value, 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                        itemStyle={{ color: 'var(--color-text-base)'}} 
                        formatter={(value: number) => [value, 'Assignments']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Count</th>
                        <th className="text-left py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        const total = data.reduce((sum, i) => sum + i.value, 0);
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        return (
                          <tr key={index}>
                            <td className="py-2 flex items-center">
                              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                              {item.name}
                            </td>
                            <td className="py-2">{item.value}</td>
                            <td className="py-2">{percentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-slate-400 py-4">No homework data available for the selected time period.</p>
            )}
          </div>
        );
        break;
      }
      
      case 'gradeDistribution': {
        const data = getGradeDistributionData();
        reportDescription = "This report shows the distribution of grades across different ranges in the selected time period.";
        reportContent = (
          <div className="card-responsive theme-transition-all">
            <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Grade Distribution</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{reportDescription}</p>
            {data.some(item => item.count > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-base)" strokeOpacity={0.2} />
                      <XAxis type="number" domain={[0, 'auto']} stroke="var(--color-text-base)" />
                      <YAxis dataKey="name" type="category" stroke="var(--color-text-base)" width={90} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                        itemStyle={{ color: 'var(--color-text-base)'}} 
                        formatter={(value: number) => [value, 'Assignments']}
                      />
                      <Bar dataKey="count" name="Assignments">
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Grade Range</th>
                        <th className="text-left py-2">Count</th>
                        <th className="text-left py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => {
                        const total = data.reduce((sum, i) => sum + i.count, 0);
                        const percentage = total > 0 ? (item.count / total) * 100 : 0;
                        return (
                          <tr key={index}>
                            <td className="py-2 flex items-center">
                              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                              {item.name}
                            </td>
                            <td className="py-2">{item.count}</td>
                            <td className="py-2">{percentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-slate-400 py-4">No grade data available for the selected time period.</p>
            )}
          </div>
        );
        break;
      }
      
      case 'timeComparison': {
        const data = getTimeComparisonData();
        reportDescription = "This report compares student performance between the current month and previous month.";
        reportContent = (
          <div className="card-responsive theme-transition-all">
            <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-slate-200">Monthly Performance Comparison</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{reportDescription}</p>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-base)" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-text-base)" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={80} 
                  />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-base)" label={{ value: 'Grade (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Grade']}
                  />
                  <Legend />
                  <Bar dataKey="current" name="Current Month" fill="#22c55e" />
                  <Bar dataKey="previous" name="Previous Month" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-slate-400 py-4">No comparison data available for the selected time period.</p>
            )}
            
            {/* Data table showing the comparison */}
            {data.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell">Student</th>
                      <th className="table-cell text-center">Current Month Avg.</th>
                      <th className="table-cell text-center">Previous Month Avg.</th>
                      <th className="table-cell text-center">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td className="table-cell font-medium">{item.name}</td>
                        <td className="table-cell text-center">{item.current.toFixed(1)}%</td>
                        <td className="table-cell text-center">{item.previous.toFixed(1)}%</td>
                        <td className={`table-cell text-center font-medium ${item.change > 0 ? 'text-green-600 dark:text-green-400' : item.change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}>
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
        break;
      }
      
      default:
        reportContent = <p>Select a report type to view.</p>;
    }
    
    return (
      <div>
        {timeframeSelector}
        {reportTabs}
        <div id="report-content">
          {reportContent}
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    const { type, studentId, recordId, reportType } = modalState;
    const student = studentId ? students.find(s => s.id === studentId) : undefined;
    let record: Grade | AttendanceRecord | HomeworkRecord | undefined;

    if (student && recordId) {
        if (type === 'editGrade') record = student.grades.find(g => g.id === recordId);
        else if (type === 'editAttendance') record = student.attendance.find(a => a.id === recordId);
        else if (type === 'editHomework') record = student.homework.find(h => h.id === recordId);
    }

    switch (type) {
      case 'addStudent':
        return renderStudentForm();
      case 'editStudent':
        return student ? renderStudentForm(student) : <p>Student not found.</p>;
      case 'viewStudent':
        return student ? renderStudentDetailView(student) : <p>Student not found.</p>;
      case 'addGrade':
        return studentId ? renderRecordForm('Grade', studentId) : <p>Student ID missing.</p>;
      case 'editGrade':
        return studentId && record ? renderRecordForm('Grade', studentId, record as Grade) : <p>Grade record not found.</p>;
       case 'addAttendance':
        return studentId ? renderRecordForm('Attendance', studentId) : <p>Student ID missing.</p>;
      case 'editAttendance':
        return studentId && record ? renderRecordForm('Attendance', studentId, record as AttendanceRecord) : <p>Attendance record not found.</p>;
      case 'addHomework':
        return studentId ? renderRecordForm('Homework', studentId) : <p>Student ID missing.</p>;
      case 'editHomework':
        return studentId && record ? renderRecordForm('Homework', studentId, record as HomeworkRecord) : <p>Homework record not found.</p>;
      case 'composeMessage':
        return renderMessageForm(studentId);
      case 'viewReports':
        return renderReportContent(reportType);
      case 'uploadFile':
           return (
             <div className="space-y-4">
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Student Data (CSV)</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400">Upload a CSV file with student data. Existing students with the same name will be updated, new students will be added.</p>
                 {error && <p className="alert alert-error"><AlertCircle size={16}/> {error}</p>}
                 <div className="form-group">
                     <label htmlFor="csvFile" className="form-label">Select CSV File</label>
                     <input 
                        id="csvFile" 
                        name="csvFile"
                        type="file" 
                        accept=".csv"
                        className="input input-responsive file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300 dark:hover:file:bg-primary-800 cursor-pointer" 
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                    />
                 </div>
                 <button 
                    type="button" 
                    onClick={downloadTemplate} 
                    className="btn btn-secondary btn-responsive w-full flex items-center justify-center gap-1">
                    <Download size={16} /> Download CSV Template
                 </button>
                  <div className="modal-footer">
                     <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Close</button>
                 </div>
             </div>
         );
      default:
        return null;
    }
  };

  const getModalTitle = (): string => {
    const { type, studentId, reportType } = modalState;
    const studentName = studentId ? students.find(s => s.id === studentId)?.name : '';
    switch (type) {
      case 'addStudent': return 'Add New Student';
      case 'editStudent': return `Edit Student: ${studentName}`;
      case 'viewStudent': return `Student Details: ${studentName}`;
      case 'addGrade': return `Add Grade for ${studentName}`;
      case 'editGrade': return `Edit Grade for ${studentName}`;
      case 'addAttendance': return `Add Attendance for ${studentName}`;
      case 'editAttendance': return `Edit Attendance for ${studentName}`;
      case 'addHomework': return `Add Homework for ${studentName}`;
      case 'editHomework': return `Edit Homework for ${studentName}`;
      case 'composeMessage': return `Send Message - ${studentName}`;
      case 'viewReports': {
        switch (reportType) {
          case 'classAverage': return 'Class Average Grades Report';
          case 'attendanceOverview': return 'Attendance Overview Report';
          case 'homeworkCompletion': return 'Homework Completion Report';
          case 'gradeDistribution': return 'Grade Distribution Report';
          case 'timeComparison': return 'Performance Comparison Report';
          default: return 'Class Reports';
        }
      }
      case 'uploadFile': return 'Upload Data';
      default: return '';
    }
  };
  
  const renderCommunicationsTab = () => {
    // Group messages by student for better organization
    const messagesByStudent: Record<string, Message[]> = {};
    messages.forEach(message => {
      if (!messagesByStudent[message.studentId]) {
        messagesByStudent[message.studentId] = [];
      }
      messagesByStudent[message.studentId].push(message);
    });
    
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <MessageCircle size={20} /> Communications
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Send messages to students and parents, and keep track of your communications.
          </p>
        </div>
        
        {/* Student selector for sending new messages */}
        <div className="card-responsive theme-transition-all">
          <h3 className="text-lg font-medium mb-3">Send New Message</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            Select a student to compose a new message to them or their parent.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {students.map(student => {
              // Only show students with email or parent email
              if (!student.email && !student.parentEmail) return null;
              
              return (
                <button 
                  key={student.id} 
                  onClick={() => openModal('composeMessage', student.id)}
                  className="card-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors p-3 text-left flex items-center gap-2"
                >
                  <User size={16} className="text-gray-500 dark:text-slate-400" />
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {student.email && student.parentEmail ? 'Student & Parent' : 
                       student.email ? 'Student Only' : 'Parent Only'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Message history */}
        <div className="card-responsive theme-transition-all">
          <h3 className="text-lg font-medium mb-3">Message History</h3>
          {Object.keys(messagesByStudent).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(messagesByStudent).map(([studentId, studentMessages]) => {
                const student = students.find(s => s.id === studentId);
                if (!student) return null; // Skip if student not found
                
                return (
                  <div key={studentId} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 font-medium flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{student.name}</span>
                      </div>
                      <button 
                        onClick={() => openModal('composeMessage', student.id)}
                        className="btn btn-sm btn-primary"
                      >
                        <MessageCircle size={14} className="mr-1" /> New Message
                      </button>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                      {studentMessages.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(message => (
                        <div key={message.id} className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium">{message.subject}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {format(parseISO(message.date), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                          <div className="text-sm mb-2">{message.content}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            Sent to: {message.isParent ? 'Parent' : 'Student'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400 py-4">
              No messages sent yet. Select a student above to send your first message.
            </p>
          )}
        </div>
      </div>
    );
  };
  
  const renderReportsTab = () => {
    // Calculate class-wide statistics
    const avgClassGrade = parseFloat(
      (students.reduce((sum, student) => sum + calculateAverageGrade(student.grades), 0) / students.length).toFixed(1)
    ) || 0;
    
    const avgAttendanceRate = parseFloat(
      (students.reduce((sum, student) => sum + calculateAttendanceRate(student.attendance), 0) / students.length).toFixed(1)
    ) || 0;
    
    const avgHomeworkRate = parseFloat(
      (students.reduce((sum, student) => sum + calculateHomeworkCompletionRate(student.homework), 0) / students.length).toFixed(1)
    ) || 0;
    
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <BarChart2 size={20} /> Class Performance Reports
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            View overall class performance metrics and generate detailed reports.
          </p>
        </div>
        
        {/* Class Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-title">Class Average Grade</div>
            <div className={`stat-value ${avgClassGrade < 70 ? 'text-red-600 dark:text-red-400' : avgClassGrade < 85 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{avgClassGrade}%</div>
            <div className="stat-desc">{students.length} Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Attendance Rate</div>
            <div className={`stat-value ${avgAttendanceRate < 80 ? 'text-red-600 dark:text-red-400' : avgAttendanceRate < 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{avgAttendanceRate}%</div>
            <div className="stat-desc">Class Average</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Homework Completion</div>
            <div className={`stat-value ${avgHomeworkRate < 70 ? 'text-red-600 dark:text-red-400' : avgHomeworkRate < 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{avgHomeworkRate}%</div>
            <div className="stat-desc">Class Average</div>
          </div>
        </div>
        
        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Class Average Report */}
          <div className="card-responsive theme-transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-1">
                  <BarChart2 size={18} /> Class Averages
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  View average grades for all students
                </p>
              </div>
              <button 
                onClick={() => openModal('viewReports', undefined, undefined, 'classAverage')}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <ReportIcon size={14} /> View Report
              </button>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getClassAverageData().slice(0, 5)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <XAxis dataKey="name" tick={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Grade']}
                  />
                  <Bar dataKey="grade" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Attendance Report */}
          <div className="card-responsive theme-transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-1">
                  <Calendar size={18} /> Attendance Overview
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Track attendance patterns
                </p>
              </div>
              <button 
                onClick={() => openModal('viewReports', undefined, undefined, 'attendanceOverview')}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <ReportIcon size={14} /> View Report
              </button>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={getAttendanceOverviewData()} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={60} 
                    fill="#8884d8" 
                    dataKey="value" 
                    label={false}
                  >
                    {getAttendanceOverviewData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Homework Report */}
          <div className="card-responsive theme-transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-1">
                  <BookOpen size={18} /> Homework Completion
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Monitor homework completion rates
                </p>
              </div>
              <button 
                onClick={() => openModal('viewReports', undefined, undefined, 'homeworkCompletion')}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <ReportIcon size={14} /> View Report
              </button>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={getHomeworkCompletionData()} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={60} 
                    fill="#8884d8" 
                    dataKey="value" 
                    label={false}
                  >
                    {getHomeworkCompletionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Grade Distribution Report */}
          <div className="card-responsive theme-transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-1">
                  <PieChartIcon size={18} /> Grade Distribution
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Analyze the distribution of grades
                </p>
              </div>
              <button 
                onClick={() => openModal('viewReports', undefined, undefined, 'gradeDistribution')}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <ReportIcon size={14} /> View Report
              </button>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getGradeDistributionData()} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={50} fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number) => [value, 'Assignments']}
                  />
                  <Bar dataKey="count">
                    {getGradeDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Time Comparison Report */}
          <div className="card-responsive theme-transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-1">
                  <LineChartIcon size={18} /> Progress Over Time
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Compare current with previous periods
                </p>
              </div>
              <button 
                onClick={() => openModal('viewReports', undefined, undefined, 'timeComparison')}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <ReportIcon size={14} /> View Report
              </button>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTimeComparisonData().slice(0, 5)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <XAxis dataKey="name" tick={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                    itemStyle={{ color: 'var(--color-text-base)'}} 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Grade']}
                  />
                  <Line type="monotone" dataKey="current" stroke="#22c55e" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="previous" stroke="#8884d8" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* View All Reports Button */}
          <div className="card-responsive theme-transition-all flex flex-col items-center justify-center text-center p-6">
            <BarChart2 size={48} className="text-gray-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Custom Reports</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              View and generate detailed reports with custom filters and date ranges.
            </p>
            <button 
              onClick={() => openModal('viewReports')}
              className="btn btn-primary btn-responsive flex items-center gap-1"
            >
              <ReportIcon size={16} /> View All Reports
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
        <div className="flex-center h-screen">
            <div className="skeleton w-16 h-16 rounded-full"></div>
             <p className="ml-4 text-lg font-medium">Loading Student Data...</p>
        </div>
    );
  }

  // Main App Layout
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */} 
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-all">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-16">
            <div className="flex items-center gap-2">
               <GraduationCap className="text-primary-600 dark:text-primary-400" size={28} />
               <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Student Progress Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition-all">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-2 inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'students' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('students')}
              role="tab"
            >
              <Users size={18} className="mr-2" />
              Students
            </button>
            <button
              className={`mr-2 inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'reports' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('reports')}
              role="tab"
            >
              <BarChart2 size={18} className="mr-2" />
              Reports
            </button>
            <button
              className={`mr-2 inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'communications' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('communications')}
              role="tab"
            >
              <MessageCircle size={18} className="mr-2" />
              Communications
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */} 
      <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Global Error Display */} 
         {error && modalState.type !== 'uploadFile' && (
             <div className="alert alert-error mb-4">
                <AlertCircle size={20} />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto p-1"><X size={18} /></button>
             </div>
         )}
         
         {/* Tab Content */}
         {activeTab === 'students' && (
           <>
             {/* Controls: Search, Add, Upload */} 
             <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64 md:w-80">
                     <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="input input-responsive pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search students"
                        name="search-students"
                     />
                     <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap justify-end w-full sm:w-auto">
                     <button 
                        onClick={() => openModal('uploadFile')}
                        className="btn btn-secondary btn-responsive flex items-center justify-center gap-1">
                         <Upload size={16} /> Upload Data
                     </button>
                     <button 
                        onClick={() => openModal('addStudent')} 
                        className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                         <UserPlus size={16} /> Add Student
                     </button>
                </div>
             </div>

             {/* Student List Table */} 
             <div className="table-container theme-transition-all">
                <table className="table">
                    <thead className="table-header">
                        <tr>
                            <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('name')}>
                                 <div className="flex items-center">Name {getSortIcon('name')}</div>
                            </th>
                            <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-center hidden md:table-cell" onClick={() => requestSort('averageGrade')}>
                                 <div className="flex items-center justify-center">Avg. Grade {getSortIcon('averageGrade')}</div>
                             </th>
                             <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-center hidden md:table-cell" onClick={() => requestSort('attendanceRate')}>
                                 <div className="flex items-center justify-center">Attendance {getSortIcon('attendanceRate')}</div>
                             </th>
                             <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-center hidden md:table-cell" onClick={() => requestSort('homeworkRate')}>
                                 <div className="flex items-center justify-center">Homework {getSortIcon('homeworkRate')}</div>
                             </th>
                            <th className="table-cell px-3 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-all">
                        {filteredAndSortedStudents.length > 0 ? (
                            filteredAndSortedStudents.map(student => {
                                const avgGrade = calculateAverageGrade(student.grades);
                                const attRate = calculateAttendanceRate(student.attendance);
                                const hwRate = calculateHomeworkCompletionRate(student.homework);
                                return (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition-bg">
                                        <td className="table-cell px-3 py-3 font-medium text-gray-900 dark:text-white">
                                            <button onClick={() => openModal('viewStudent', student.id)} className="hover:underline text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                                 <User size={16} /> {student.name}
                                            </button>
                                        </td>
                                         <td className="table-cell px-3 py-3 text-center hidden md:table-cell">
                                             <span className={`font-medium ${avgGrade < 70 ? 'text-red-600 dark:text-red-400' : avgGrade < 85 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                                 {avgGrade}%
                                             </span>
                                         </td>
                                         <td className="table-cell px-3 py-3 text-center hidden md:table-cell">
                                             <span className={`font-medium ${attRate < 80 ? 'text-red-600 dark:text-red-400' : attRate < 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                                 {attRate}%
                                             </span>
                                         </td>
                                         <td className="table-cell px-3 py-3 text-center hidden md:table-cell">
                                             <span className={`font-medium ${hwRate < 70 ? 'text-red-600 dark:text-red-400' : hwRate < 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                                 {hwRate}%
                                             </span>
                                         </td>
                                        <td className="table-cell px-3 py-3 text-right space-x-1">
                                            <button onClick={() => openModal('viewStudent', student.id)} className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label={`View details for ${student.name}`} title="View Details">
                                                <History size={16} />
                                            </button>
                                            <button onClick={() => openModal('editStudent', student.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit student ${student.name}`} title="Edit Student">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => deleteStudent(student.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete student ${student.name}`} title="Delete Student">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">
                                    {students.length === 0 ? 'No students added yet.' : 'No students match your search.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
           </>
         )}
         
         {activeTab === 'reports' && renderReportsTab()}
         
         {activeTab === 'communications' && renderCommunicationsTab()}
      </main>

      {/* Footer */} 
      <footer className="bg-gray-100 dark:bg-slate-900 py-4 mt-auto theme-transition-all">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

       {/* Modal */} 
       {modalState.type && (
        <div 
            className="modal-backdrop fade-in flex items-center justify-center" 
            onClick={closeModal} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
        >
          <div 
            className={`modal-content theme-transition-all ${modalState.type === 'viewStudent' || modalState.type === 'viewReports' ? 'max-w-4xl' : 'max-w-lg'} w-full`} 
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{getModalTitle()}</h3>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" 
                aria-label="Close modal"
                name="close-modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
