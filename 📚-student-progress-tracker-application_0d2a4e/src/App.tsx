import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { parseISO, format, isValid, isAfter, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth, compareAsc, differenceInDays, subDays, addDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  User,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Book,
  Check,
  XCircle,
  Clock,
  Upload,
  Download,
  ArrowLeft,
  Menu,
  Eye,
  ChevronDown,
  Filter,
  FileDown,
  Mail,
  MessageCircle,
  UserRound,
  CalendarIcon,
  CheckCircle,
  XCircle as XCircleIcon,
  Smartphone,
  Send,
  Phone,
  FileImage,
  Paperclip,
  Settings,
  AlertCircle,
  CameraIcon,
  Info,
  TrendingUp,
  BarChart as BarChartIcon,
  Users,
  Timer
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript Types
type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  createdAt: string;
  parentEmail?: string;
  parentPhone?: string;
  parentName?: string;
};

type Grade = {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  date: string;
};

type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  recordMethod?: 'manual' | 'automated' | 'bulk';
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  studentCompletions: {
    studentId: string;
    status: 'completed' | 'in-progress' | 'not-started';
    submittedDate?: string;
  }[];
};

type TabType = 
  | 'students' 
  | 'grades' 
  | 'attendance' 
  | 'assignments' 
  | 'dashboard' 
  | 'student-details' 
  | 'communication' 
  | 'reporting';

type ModalType = 
  | 'addStudent' 
  | 'editStudent' 
  | 'addGrade' 
  | 'editGrade' 
  | 'addAttendance' 
  | 'editAttendance' 
  | 'addAssignment' 
  | 'editAssignment' 
  | 'importData' 
  | 'reportPreview' 
  | 'newMessage' 
  | 'bulkAttendance' 
  | 'customReport'
  | 'attendanceReports'
  | null;

type AnalyticsData = {
  gradeDistribution: { name: string; value: number }[];
  attendanceOverview: { name: string; value: number }[];
  assignmentCompletion: { name: string; value: number }[];
  attendanceTrends?: { date: string; present: number; absent: number; late: number; excused: number }[];
};

type Report = {
  id: string;
  studentId: string;
  studentName: string;
  gradeAverage: number;
  attendanceRate: number;
  overallProgress: number;
  grades: Grade[];
  attendance: AttendanceRecord[];
  assignments: {
    assignment: Assignment;
    completion: Assignment['studentCompletions'][0];
  }[];
  generatedDate: string;
  customFilters?: ReportFilter[];
  dateRange?: { start: string; end: string };
};

type Message = {
  id: string;
  from: 'teacher' | 'parent';
  sender: string;
  studentId: string;
  recipientEmail?: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
};

type ReportFilter = {
  type: 'grade' | 'attendance' | 'assignment';
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'between' | 'contains';
  value: any;
  secondValue?: any; // For 'between' operator
};

type Conference = {
  id: string;
  title: string;
  studentId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
};

type AttendanceReportType = 'daily' | 'weekly' | 'monthly';

type AttendanceReportData = {
  type: AttendanceReportType;
  dateRange: { start: string; end: string };
  data: {
    date: string;
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    presentRate: number;
  }[];
  summary: {
    totalDays: number;
    averagePresent: number;
    averageAbsent: number;
    averageLate: number;
    averageExcused: number;
    overallAttendanceRate: number;
  };
};

const App: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentModal, setCurrentModal] = useState<ModalType>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    gradeDistribution: [],
    attendanceOverview: [],
    assignmentCompletion: [],
    attendanceTrends: []
  });
  const [filterStatus, setFilterStatus] = useState<{ students: string; assignments: string; attendance: string }>({
    students: 'all',
    assignments: 'all',
    attendance: 'all'
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [currentReportFilters, setCurrentReportFilters] = useState<ReportFilter[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string } | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<'manual' | 'bulk'>('manual');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customReportName, setCustomReportName] = useState<string>('');
  const [attendanceReportData, setAttendanceReportData] = useState<AttendanceReportData | null>(null);
  const [attendanceReportType, setAttendanceReportType] = useState<AttendanceReportType>('daily');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const attendanceReportRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) setStudents(JSON.parse(loadedStudents));

    const loadedGrades = localStorage.getItem('grades');
    if (loadedGrades) setGrades(JSON.parse(loadedGrades));

    const loadedAttendance = localStorage.getItem('attendance');
    if (loadedAttendance) setAttendanceRecords(JSON.parse(loadedAttendance));

    const loadedAssignments = localStorage.getItem('assignments');
    if (loadedAssignments) setAssignments(JSON.parse(loadedAssignments));
    
    const loadedMessages = localStorage.getItem('messages');
    if (loadedMessages) setMessages(JSON.parse(loadedMessages));
    
    const loadedConferences = localStorage.getItem('conferences');
    if (loadedConferences) setConferences(JSON.parse(loadedConferences));
    
    const loadedReports = localStorage.getItem('savedReports');
    if (loadedReports) setSavedReports(JSON.parse(loadedReports));
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);
  
  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('conferences', JSON.stringify(conferences));
  }, [conferences]);
  
  useEffect(() => {
    localStorage.setItem('savedReports', JSON.stringify(savedReports));
  }, [savedReports]);

  // Generate analytics data
  useEffect(() => {
    // Grade distribution
    const gradeRanges = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    grades.forEach(grade => {
      if (grade.score >= 90) gradeRanges['A (90-100)']++;
      else if (grade.score >= 80) gradeRanges['B (80-89)']++;
      else if (grade.score >= 70) gradeRanges['C (70-79)']++;
      else if (grade.score >= 60) gradeRanges['D (60-69)']++;
      else gradeRanges['F (0-59)']++;
    });

    const gradeDistribution = Object.entries(gradeRanges).map(([name, value]) => ({ name, value }));

    // Attendance overview
    const attendanceCounts = {
      'Present': 0,
      'Absent': 0,
      'Late': 0,
      'Excused': 0
    };

    attendanceRecords.forEach(record => {
      if (record.status === 'present') attendanceCounts['Present']++;
      else if (record.status === 'absent') attendanceCounts['Absent']++;
      else if (record.status === 'late') attendanceCounts['Late']++;
      else if (record.status === 'excused') attendanceCounts['Excused']++;
    });

    const attendanceOverview = Object.entries(attendanceCounts).map(([name, value]) => ({ name, value }));

    // Assignment completion stats
    const assignmentCounts = {
      'Completed': 0,
      'In Progress': 0,
      'Not Started': 0
    };

    assignments.forEach(assignment => {
      assignment.studentCompletions.forEach(completion => {
        if (completion.status === 'completed') assignmentCounts['Completed']++;
        else if (completion.status === 'in-progress') assignmentCounts['In Progress']++;
        else if (completion.status === 'not-started') assignmentCounts['Not Started']++;
      });
    });

    const assignmentCompletion = Object.entries(assignmentCounts).map(([name, value]) => ({ name, value }));
    
    // Attendance trends over time
    const sortedAttendance = [...attendanceRecords].sort((a, b) => {
      return compareAsc(parseISO(a.date), parseISO(b.date));
    });
    
    if (sortedAttendance.length > 0) {
      const dateMap: Record<string, { present: number; absent: number; late: number; excused: number }> = {};
      
      // Get unique dates
      sortedAttendance.forEach(record => {
        const formattedDate = format(parseISO(record.date), 'MMM dd, yyyy');
        if (!dateMap[formattedDate]) {
          dateMap[formattedDate] = { present: 0, absent: 0, late: 0, excused: 0 };
        }
        
        dateMap[formattedDate][record.status]++;
      });
      
      // Convert to array for chart
      const attendanceTrends = Object.entries(dateMap).map(([date, counts]) => ({
        date,
        present: counts.present,
        absent: counts.absent,
        late: counts.late,
        excused: counts.excused
      }));
      
      // Only keep the most recent 10 days with data
      const recentTrends = attendanceTrends.slice(-10);
      
      setAnalyticsData({
        gradeDistribution,
        attendanceOverview,
        assignmentCompletion,
        attendanceTrends: recentTrends
      });
    } else {
      setAnalyticsData({
        gradeDistribution,
        attendanceOverview,
        assignmentCompletion,
        attendanceTrends: []
      });
    }
  }, [grades, attendanceRecords, assignments]);

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && currentModal) {
        setCurrentModal(null);
        setEditItem(null);
        setCurrentReport(null);
        setAttendanceReportData(null);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [currentModal]);

  // Helper functions
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy');
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Filter functions
  const getFilteredStudents = (): Student[] => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredAssignments = (): Assignment[] => {
    let filtered = assignments;

    if (filterStatus.assignments !== 'all') {
      filtered = filtered.filter(assignment => {
        const hasStatus = assignment.studentCompletions.some(
          completion => completion.status === filterStatus.assignments
        );
        return hasStatus;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredAttendance = (): AttendanceRecord[] => {
    let filtered = attendanceRecords;

    if (filterStatus.attendance !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus.attendance);
    }

    if (searchQuery && selectedStudent === null) {
      filtered = filtered.filter(record => {
        const student = students.find(s => s.id === record.studentId);
        return student && student.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedStudent) {
      filtered = filtered.filter(record => record.studentId === selectedStudent.id);
    }

    return filtered;
  };
  
  const getFilteredMessages = (): Message[] => {
    return messages.filter(message => {
      // If no search query, just return all
      if (!searchQuery) return true;
      
      // Otherwise filter by content, subject, sender
      return (
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };
  
  const getConferencesForStudent = (studentId: string): Conference[] => {
    return conferences.filter(conf => conf.studentId === studentId);
  };

  // Student operations
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setStudents([...students, newStudent]);
    setCurrentModal(null);
  };

  const updateStudent = (studentId: string, data: Partial<Student>) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, ...data } : student
    ));
    setCurrentModal(null);
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, ...data });
    }
  };

  const deleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all their grades, attendance records, and assignment completions.')) {
      setStudents(students.filter(student => student.id !== studentId));
      setGrades(grades.filter(grade => grade.studentId !== studentId));
      setAttendanceRecords(attendanceRecords.filter(record => record.studentId !== studentId));
      
      // Remove this student from assignment completions
      setAssignments(assignments.map(assignment => ({
        ...assignment,
        studentCompletions: assignment.studentCompletions.filter(
          completion => completion.studentId !== studentId
        )
      })));
      
      // Remove messages related to this student
      setMessages(messages.filter(message => message.studentId !== studentId));
      
      // Remove conferences for this student
      setConferences(conferences.filter(conf => conf.studentId !== studentId));

      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(null);
        setActiveTab('students');
      }
    }
  };

  // Grade operations
  const addGrade = (data: Omit<Grade, 'id'>) => {
    const newGrade: Grade = {
      ...data,
      id: generateId()
    };
    setGrades([...grades, newGrade]);
    setCurrentModal(null);
  };

  const updateGrade = (gradeId: string, data: Partial<Grade>) => {
    setGrades(grades.map(grade => 
      grade.id === gradeId ? { ...grade, ...data } : grade
    ));
    setCurrentModal(null);
  };

  const deleteGrade = (gradeId: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(grade => grade.id !== gradeId));
    }
  };

  // Attendance operations
  const addAttendance = (data: Omit<AttendanceRecord, 'id'>) => {
    // Check if record for this student and date already exists
    const existingRecord = attendanceRecords.find(
      record => record.studentId === data.studentId && record.date === data.date
    );

    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(attendanceRecords.map(record => 
        (record.studentId === data.studentId && record.date === data.date) 
          ? { ...record, status: data.status, notes: data.notes, recordMethod: data.recordMethod || 'manual' } 
          : record
      ));
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        ...data,
        id: generateId(),
        recordMethod: data.recordMethod || 'manual'
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
    
    setCurrentModal(null);
  };
  
  const addBulkAttendance = (date: string, status: 'present' | 'absent' | 'late' | 'excused', studentIds: string[], notes: string = '') => {
    const updatedRecords = [...attendanceRecords];
    
    studentIds.forEach(studentId => {
      const existingRecordIndex = updatedRecords.findIndex(
        record => record.studentId === studentId && record.date === date
      );
      
      if (existingRecordIndex >= 0) {
        // Update existing record
        updatedRecords[existingRecordIndex] = {
          ...updatedRecords[existingRecordIndex],
          status,
          notes,
          recordMethod: 'bulk'
        };
      } else {
        // Create new record
        updatedRecords.push({
          id: generateId(),
          studentId,
          date,
          status,
          notes,
          recordMethod: 'bulk'
        });
      }
    });
    
    setAttendanceRecords(updatedRecords);
    setCurrentModal(null);
  };

  const updateAttendance = (recordId: string, data: Partial<AttendanceRecord>) => {
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === recordId ? { ...record, ...data } : record
    ));
    setCurrentModal(null);
  };

  const deleteAttendance = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      setAttendanceRecords(attendanceRecords.filter(record => record.id !== recordId));
    }
  };

  // Assignment operations
  const addAssignment = (data: Omit<Assignment, 'id' | 'studentCompletions'>) => {
    const studentCompletions = students.map(student => ({
      studentId: student.id,
      status: 'not-started' as const
    }));

    const newAssignment: Assignment = {
      ...data,
      id: generateId(),
      studentCompletions
    };

    setAssignments([...assignments, newAssignment]);
    setCurrentModal(null);
  };

  const updateAssignment = (assignmentId: string, data: Partial<Omit<Assignment, 'studentCompletions'>>) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === assignmentId ? { ...assignment, ...data } : assignment
    ));
    setCurrentModal(null);
  };

  const updateAssignmentStatus = (assignmentId: string, studentId: string, status: 'completed' | 'in-progress' | 'not-started') => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          studentCompletions: assignment.studentCompletions.map(completion => 
            completion.studentId === studentId 
              ? { 
                  ...completion, 
                  status, 
                  submittedDate: status === 'completed' ? new Date().toISOString() : completion.submittedDate 
                } 
              : completion
          )
        };
      }
      return assignment;
    }));
  };

  const deleteAssignment = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
    }
  };
  
  // Message operations
  const addMessage = (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages([...messages, newMessage]);
    setCurrentModal(null);
  };
  
  const markMessageAsRead = (messageId: string) => {
    setMessages(messages.map(message => 
      message.id === messageId ? { ...message, read: true } : message
    ));
  };
  
  const deleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter(message => message.id !== messageId));
    }
  };
  
  // Conference operations
  const addConference = (conference: Omit<Conference, 'id'>) => {
    const newConference: Conference = {
      ...conference,
      id: generateId()
    };
    
    setConferences([...conferences, newConference]);
    return newConference;
  };
  
  const updateConferenceStatus = (conferenceId: string, status: Conference['status']) => {
    setConferences(conferences.map(conf => 
      conf.id === conferenceId ? { ...conf, status } : conf
    ));
  };
  
  const deleteConference = (conferenceId: string) => {
    if (window.confirm('Are you sure you want to delete this conference?')) {
      setConferences(conferences.filter(conf => conf.id !== conferenceId));
    }
  };

  // Attendance Report Generation
  const generateAttendanceReport = (type: AttendanceReportType, customStartDate?: string, customEndDate?: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    if (customStartDate && customEndDate) {
      startDate = parseISO(customStartDate);
      endDate = parseISO(customEndDate);
    } else {
      switch (type) {
        case 'daily':
          startDate = new Date(today);
          endDate = new Date(today);
          break;
        case 'weekly':
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case 'monthly':
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        default:
          startDate = new Date(today);
          endDate = new Date(today);
      }
    }

    // Generate date range
    const dateRange = {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    };

    // Filter attendance records within date range
    const filteredRecords = attendanceRecords.filter(record => {
      const recordDate = parseISO(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Group records by date
    const recordsByDate: Record<string, AttendanceRecord[]> = {};
    filteredRecords.forEach(record => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = [];
      }
      recordsByDate[record.date].push(record);
    });

    // Calculate daily statistics
    const data = Object.entries(recordsByDate).map(([date, records]) => {
      const totalStudents = students.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const excused = records.filter(r => r.status === 'excused').length;
      const presentRate = totalStudents > 0 ? (present / totalStudents) * 100 : 0;

      return {
        date,
        totalStudents,
        present,
        absent,
        late,
        excused,
        presentRate
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary statistics
    const totalDays = data.length;
    const averagePresent = totalDays > 0 ? data.reduce((sum, day) => sum + day.present, 0) / totalDays : 0;
    const averageAbsent = totalDays > 0 ? data.reduce((sum, day) => sum + day.absent, 0) / totalDays : 0;
    const averageLate = totalDays > 0 ? data.reduce((sum, day) => sum + day.late, 0) / totalDays : 0;
    const averageExcused = totalDays > 0 ? data.reduce((sum, day) => sum + day.excused, 0) / totalDays : 0;
    const overallAttendanceRate = totalDays > 0 ? data.reduce((sum, day) => sum + day.presentRate, 0) / totalDays : 0;

    const reportData: AttendanceReportData = {
      type,
      dateRange,
      data,
      summary: {
        totalDays,
        averagePresent,
        averageAbsent,
        averageLate,
        averageExcused,
        overallAttendanceRate
      }
    };

    setAttendanceReportData(reportData);
    setCurrentModal('attendanceReports');
  };

  const downloadAttendanceReportAsPDF = () => {
    if (!attendanceReportRef.current || !attendanceReportData) return;

    // Prepare the report for printing
    const content = attendanceReportRef.current;
    const originalContent = document.body.innerHTML;
    
    // Get only the report content for printing
    const printContent = content.innerHTML;
    document.body.innerHTML = `
      <div class="${styles.printReport}">
        ${printContent}
      </div>
    `;
    
    window.print();
    
    // Restore the original content
    document.body.innerHTML = originalContent;
    
    // Re-render the React app
    window.location.reload();
  };

  // Report Generation
  const generateStudentReport = (studentId: string, filters?: ReportFilter[], dateRange?: { start: string; end: string }) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    // Get student grades
    let studentGrades = grades.filter(g => g.studentId === studentId);
    
    // Apply date range filter if provided
    if (dateRange) {
      const startDate = parseISO(dateRange.start);
      const endDate = parseISO(dateRange.end);
      
      studentGrades = studentGrades.filter(g => {
        const gradeDate = parseISO(g.date);
        return isValid(gradeDate) && 
               (isAfter(gradeDate, startDate) || gradeDate.getTime() === startDate.getTime()) && 
               (isBefore(gradeDate, endDate) || gradeDate.getTime() === endDate.getTime());
      });
    }
    
    // Apply custom filters if provided
    if (filters && filters.length > 0) {
      studentGrades = studentGrades.filter(grade => {
        return filters.every(filter => {
          if (filter.type !== 'grade') return true;
          
          if (filter.field === 'subject') {
            if (filter.operator === 'equals') return grade.subject === filter.value;
            if (filter.operator === 'contains') return grade.subject.includes(filter.value);
          }
          
          if (filter.field === 'score') {
            if (filter.operator === 'equals') return grade.score === filter.value;
            if (filter.operator === 'greaterThan') return grade.score > filter.value;
            if (filter.operator === 'lessThan') return grade.score < filter.value;
            if (filter.operator === 'between') return grade.score >= filter.value && grade.score <= filter.secondValue;
          }
          
          return true;
        });
      });
    }
    
    // Calculate grade average
    const gradeAverage = studentGrades.length > 0
      ? studentGrades.reduce((sum, grade) => sum + grade.score, 0) / studentGrades.length
      : 0;
    
    // Get attendance records
    let studentAttendance = attendanceRecords.filter(a => a.studentId === studentId);
    
    // Apply date range filter if provided
    if (dateRange) {
      const startDate = parseISO(dateRange.start);
      const endDate = parseISO(dateRange.end);
      
      studentAttendance = studentAttendance.filter(record => {
        const recordDate = parseISO(record.date);
        return isValid(recordDate) && 
               (isAfter(recordDate, startDate) || recordDate.getTime() === startDate.getTime()) && 
               (isBefore(recordDate, endDate) || recordDate.getTime() === endDate.getTime());
      });
    }
    
    // Apply custom filters if provided
    if (filters && filters.length > 0) {
      studentAttendance = studentAttendance.filter(record => {
        return filters.every(filter => {
          if (filter.type !== 'attendance') return true;
          
          if (filter.field === 'status') {
            if (filter.operator === 'equals') return record.status === filter.value;
          }
          
          return true;
        });
      });
    }
    
    // Calculate attendance rate (percentage of present days)
    const attendanceRate = studentAttendance.length > 0
      ? (studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100
      : 0;
    
    // Collect assignment data
    let studentAssignments = assignments.map(assignment => ({
      assignment,
      completion: assignment.studentCompletions.find(c => c.studentId === studentId) || {
        studentId,
        status: 'not-started' as const
      }
    }));
    
    // Apply date range filter if provided
    if (dateRange) {
      const startDate = parseISO(dateRange.start);
      const endDate = parseISO(dateRange.end);
      
      studentAssignments = studentAssignments.filter(({ assignment }) => {
        const dueDate = parseISO(assignment.dueDate);
        return isValid(dueDate) && 
               (isAfter(dueDate, startDate) || dueDate.getTime() === startDate.getTime()) && 
               (isBefore(dueDate, endDate) || dueDate.getTime() === endDate.getTime());
      });
    }
    
    // Apply custom filters if provided
    if (filters && filters.length > 0) {
      studentAssignments = studentAssignments.filter(({ assignment, completion }) => {
        return filters.every(filter => {
          if (filter.type !== 'assignment') return true;
          
          if (filter.field === 'status') {
            if (filter.operator === 'equals') return completion.status === filter.value;
          }
          
          return true;
        });
      });
    }
    
    // Calculate overall progress (average of grade average and attendance rate)
    const overallProgress = (gradeAverage + attendanceRate) / 2;
    
    const report: Report = {
      id: generateId(),
      studentId,
      studentName: student.name,
      gradeAverage,
      attendanceRate,
      overallProgress,
      grades: studentGrades,
      attendance: studentAttendance,
      assignments: studentAssignments,
      generatedDate: new Date().toISOString(),
      customFilters: filters,
      dateRange
    };
    
    return report;
  };

  const handleGenerateReport = (studentId: string) => {
    const report = generateStudentReport(studentId);
    if (report) {
      setCurrentReport(report);
      setCurrentModal('reportPreview');
    }
  };
  
  const handleGenerateCustomReport = () => {
    if (!selectedStudent) return;
    
    const report = generateStudentReport(
      selectedStudent.id, 
      currentReportFilters.length > 0 ? currentReportFilters : undefined,
      dateRangeFilter
    );
    
    if (report) {
      // Add report name if provided
      const reportWithName = customReportName 
        ? { ...report, name: customReportName }
        : report;
        
      setCurrentReport(reportWithName);
      setSavedReports([...savedReports, reportWithName]);
      setCurrentModal('reportPreview');
      setCurrentReportFilters([]);
      setDateRangeFilter(null);
      setCustomReportName('');
    }
  };

  const downloadReportAsPDF = () => {
    if (!reportRef.current || !currentReport) return;

    // Prepare the report for printing
    const content = reportRef.current;
    const originalContent = document.body.innerHTML;
    
    // Get only the report content for printing
    const printContent = content.innerHTML;
    document.body.innerHTML = `
      <div class="${styles.printReport}">
        ${printContent}
      </div>
    `;
    
    window.print();
    
    // Restore the original content
    document.body.innerHTML = originalContent;
    
    // Re-render the React app
    window.location.reload();
  };
  
  const addReportFilter = (filter: ReportFilter) => {
    setCurrentReportFilters([...currentReportFilters, filter]);
  };
  
  const removeReportFilter = (index: number) => {
    const newFilters = [...currentReportFilters];
    newFilters.splice(index, 1);
    setCurrentReportFilters(newFilters);
  };
  
  const clearReportFilters = () => {
    setCurrentReportFilters([]);
    setDateRangeFilter(null);
  };

  // Data import/export functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContents = e.target?.result as string;
        let importedData: any;

        // Handle different file types
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(fileContents);
        } else if (file.name.endsWith('.csv')) {
          importedData = parseCSV(fileContents);
        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
          alert('Excel files need to be converted to CSV or JSON first.');
          return;
        } else {
          alert('Unsupported file format. Please use JSON or CSV.');
          return;
        }

        if (typeof importedData !== 'object') {
          throw new Error('Invalid data format');
        }

        // Process the imported data based on current tab
        if (importedData.students && activeTab === 'students') {
          processImportedStudents(importedData.students);
        } else if (importedData.grades && activeTab === 'grades') {
          processImportedGrades(importedData.grades);
        } else if (importedData.attendance && activeTab === 'attendance') {
          processImportedAttendance(importedData.attendance);
        } else if (importedData.assignments && activeTab === 'assignments') {
          processImportedAssignments(importedData.assignments);
        } else {
          alert('No valid data found for the current section.');
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

      } catch (error) {
        console.error('Error importing data:', error);
        alert(`Error importing data: ${(error as Error).message}`);
      }
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): any => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const obj: any = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      
      result.push(obj);
    }

    // Try to determine the type of data based on headers
    if (headers.includes('name') && headers.includes('email')) {
      return { students: result };
    } else if (headers.includes('studentId') && headers.includes('subject') && headers.includes('score')) {
      return { grades: result };
    } else if (headers.includes('studentId') && headers.includes('date') && headers.includes('status')) {
      return { attendance: result };
    } else if (headers.includes('title') && headers.includes('description') && headers.includes('dueDate')) {
      return { assignments: result };
    }

    return { data: result };
  };

  // Process imported data
  const processImportedStudents = (importedStudents: any[]) => {
    try {
      const newStudents = importedStudents.map(student => ({
        id: student.id || generateId(),
        name: student.name || 'Unknown',
        email: student.email || '',
        phone: student.phone || '',
        grade: student.grade || '',
        createdAt: student.createdAt || new Date().toISOString(),
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        parentName: student.parentName || ''
      }));

      // Merge with existing students - update if ID exists, add if new
      const mergedStudents = [...students];
      
      newStudents.forEach(newStudent => {
        const existingIndex = mergedStudents.findIndex(s => s.id === newStudent.id);
        if (existingIndex >= 0) {
          mergedStudents[existingIndex] = newStudent;
        } else {
          mergedStudents.push(newStudent);
        }
      });

      setStudents(mergedStudents);
      alert(`Successfully imported/updated ${newStudents.length} students.`);
    } catch (error) {
      console.error('Error processing student data:', error);
      alert(`Error processing student data: ${(error as Error).message}`);
    }
  };

  const processImportedGrades = (importedGrades: any[]) => {
    try {
      const newGrades = importedGrades.map(grade => ({
        id: grade.id || generateId(),
        studentId: grade.studentId,
        subject: grade.subject || 'Unknown',
        score: Number(grade.score) || 0,
        date: grade.date || new Date().toISOString()
      }));

      // Validate student IDs
      const invalidGrades = newGrades.filter(grade => 
        !students.some(student => student.id === grade.studentId)
      );

      if (invalidGrades.length > 0) {
        alert(`Warning: ${invalidGrades.length} grades reference unknown students and will be skipped.`);
      }

      const validGrades = newGrades.filter(grade => 
        students.some(student => student.id === grade.studentId)
      );

      // Merge with existing grades
      const mergedGrades = [...grades];
      
      validGrades.forEach(newGrade => {
        const existingIndex = mergedGrades.findIndex(g => g.id === newGrade.id);
        if (existingIndex >= 0) {
          mergedGrades[existingIndex] = newGrade;
        } else {
          mergedGrades.push(newGrade);
        }
      });

      setGrades(mergedGrades);
      alert(`Successfully imported/updated ${validGrades.length} grades.`);
    } catch (error) {
      console.error('Error processing grade data:', error);
      alert(`Error processing grade data: ${(error as Error).message}`);
    }
  };

  const processImportedAttendance = (importedAttendance: any[]) => {
    try {
      const newRecords = importedAttendance.map(record => ({
        id: record.id || generateId(),
        studentId: record.studentId,
        date: record.date || new Date().toISOString(),
        status: (record.status === 'present' || record.status === 'absent' || record.status === 'late' || record.status === 'excused') 
          ? record.status 
          : 'present',
        notes: record.notes || '',
        recordMethod: record.recordMethod || 'manual'
      }));

      // Validate student IDs
      const invalidRecords = newRecords.filter(record => 
        !students.some(student => student.id === record.studentId)
      );

      if (invalidRecords.length > 0) {
        alert(`Warning: ${invalidRecords.length} attendance records reference unknown students and will be skipped.`);
      }

      const validRecords = newRecords.filter(record => 
        students.some(student => student.id === record.studentId)
      );

      // Merge with existing records
      const mergedRecords = [...attendanceRecords];
      
      validRecords.forEach(newRecord => {
        const existingIndex = mergedRecords.findIndex(r => r.id === newRecord.id);
        if (existingIndex >= 0) {
          mergedRecords[existingIndex] = newRecord;
        } else {
          mergedRecords.push(newRecord);
        }
      });

      setAttendanceRecords(mergedRecords);
      alert(`Successfully imported/updated ${validRecords.length} attendance records.`);
    } catch (error) {
      console.error('Error processing attendance data:', error);
      alert(`Error processing attendance data: ${(error as Error).message}`);
    }
  };

  const processImportedAssignments = (importedAssignments: any[]) => {
    try {
      const newAssignments = importedAssignments.map(assignment => {
        // Parse studentCompletions or create default ones for all students
        let studentCompletions = assignment.studentCompletions || [];
        
        if (!Array.isArray(studentCompletions) || studentCompletions.length === 0) {
          studentCompletions = students.map(student => ({
            studentId: student.id,
            status: 'not-started' as const
          }));
        }

        return {
          id: assignment.id || generateId(),
          title: assignment.title || 'Unnamed Assignment',
          description: assignment.description || '',
          dueDate: assignment.dueDate || new Date().toISOString(),
          studentCompletions
        };
      });

      // Merge with existing assignments
      const mergedAssignments = [...assignments];
      
      newAssignments.forEach(newAssignment => {
        const existingIndex = mergedAssignments.findIndex(a => a.id === newAssignment.id);
        if (existingIndex >= 0) {
          mergedAssignments[existingIndex] = newAssignment;
        } else {
          mergedAssignments.push(newAssignment);
        }
      });

      setAssignments(mergedAssignments);
      alert(`Successfully imported/updated ${newAssignments.length} assignments.`);
    } catch (error) {
      console.error('Error processing assignment data:', error);
      alert(`Error processing assignment data: ${(error as Error).message}`);
    }
  };

  // Export current data as JSON
  const exportData = () => {
    let dataToExport: any = {};
    
    if (activeTab === 'students') {
      dataToExport = { students };
    } else if (activeTab === 'grades') {
      dataToExport = { grades };
    } else if (activeTab === 'attendance') {
      dataToExport = { attendance: attendanceRecords };
    } else if (activeTab === 'assignments') {
      dataToExport = { assignments };
    } else if (activeTab === 'dashboard') {
      dataToExport = { students, grades, attendance: attendanceRecords, assignments };
    } else if (activeTab === 'communication') {
      dataToExport = { messages, conferences };
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-tracker-${activeTab}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export template function
  const exportTemplate = () => {
    let template: any = {};
    
    if (activeTab === 'students') {
      template = {
        students: [
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
            grade: '10th',
            parentName: 'Jane Doe',
            parentEmail: 'jane.doe@example.com',
            parentPhone: '555-987-6543'
          }
        ]
      };
    } else if (activeTab === 'grades') {
      template = {
        grades: [
          {
            studentId: '[student_id_here]',
            subject: 'Math',
            score: 85,
            date: new Date().toISOString()
          }
        ]
      };
    } else if (activeTab === 'attendance') {
      template = {
        attendance: [
          {
            studentId: '[student_id_here]',
            date: new Date().toISOString(),
            status: 'present',
            notes: '',
            recordMethod: 'manual'
          }
        ]
      };
    } else if (activeTab === 'assignments') {
      template = {
        assignments: [
          {
            title: 'Sample Assignment',
            description: 'Description of the assignment',
            dueDate: new Date().toISOString()
          }
        ]
      };
    }
    
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-tracker-${activeTab}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Form components
  const StudentForm = ({ defaultValues }: { defaultValues?: Partial<Student> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Student>({
      defaultValues: defaultValues || {
        id: '',
        name: '',
        email: '',
        phone: '',
        grade: '',
        createdAt: '',
        parentName: '',
        parentEmail: '',
        parentPhone: ''
      }
    });

    const onSubmit = (data: any) => {
      if (defaultValues?.id) {
        updateStudent(defaultValues.id, data);
      } else {
        addStudent(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Student Information</h3>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              id="name"
              type="text"
              className="input"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              id="phone"
              type="tel"
              className="input"
              {...register('phone')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade" className="form-label">Grade/Class</label>
            <input
              id="grade"
              type="text"
              className="input"
              {...register('grade')}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Parent/Guardian Information</h3>
          <div className="form-group">
            <label htmlFor="parentName" className="form-label">Parent Name</label>
            <input
              id="parentName"
              type="text"
              className="input"
              {...register('parentName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="parentEmail" className="form-label">Parent Email</label>
            <input
              id="parentEmail"
              type="email"
              className="input"
              {...register('parentEmail', { 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.parentEmail && <p className="form-error">{errors.parentEmail.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="parentPhone" className="form-label">Parent Phone</label>
            <input
              id="parentPhone"
              type="tel"
              className="input"
              {...register('parentPhone')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Student
          </button>
        </div>
      </form>
    );
  };

  const GradeForm = ({ defaultValues }: { defaultValues?: Partial<Grade> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Grade>({
      defaultValues: defaultValues || {
        id: '',
        studentId: selectedStudent?.id || '',
        subject: '',
        score: 0,
        date: new Date().toISOString().split('T')[0]
      }
    });

    const onSubmit = (data: any) => {
      // Convert score to number
      data.score = Number(data.score);
      
      if (defaultValues?.id) {
        updateGrade(defaultValues.id, data);
      } else {
        addGrade(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!selectedStudent && (
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">Student</label>
            <select
              id="studentId"
              className="input"
              {...register('studentId', { required: 'Student is required' })}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {errors.studentId && <p className="form-error">{errors.studentId.message}</p>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input
            id="subject"
            type="text"
            className="input"
            {...register('subject', { required: 'Subject is required' })}
          />
          {errors.subject && <p className="form-error">{errors.subject.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="score" className="form-label">Score</label>
          <input
            id="score"
            type="number"
            min="0"
            max="100"
            className="input"
            {...register('score', { 
              required: 'Score is required',
              min: { value: 0, message: 'Score must be at least 0' },
              max: { value: 100, message: 'Score cannot exceed 100' }
            })}
          />
          {errors.score && <p className="form-error">{errors.score.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Grade
          </button>
        </div>
      </form>
    );
  };

  const AttendanceForm = ({ defaultValues }: { defaultValues?: Partial<AttendanceRecord> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<AttendanceRecord>({
      defaultValues: defaultValues || {
        id: '',
        studentId: selectedStudent?.id || '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        notes: '',
        recordMethod: 'manual'
      }
    });

    const onSubmit = (data: any) => {
      if (defaultValues?.id) {
        updateAttendance(defaultValues.id, data);
      } else {
        addAttendance(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!selectedStudent && (
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">Student</label>
            <select
              id="studentId"
              className="input"
              {...register('studentId', { required: 'Student is required' })}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {errors.studentId && <p className="form-error">{errors.studentId.message}</p>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            id="status"
            className="input"
            {...register('status', { required: 'Status is required' })}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
          {errors.status && <p className="form-error">{errors.status.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            id="notes"
            className="input"
            rows={3}
            {...register('notes')}
          ></textarea>
        </div>
        
        <input
          type="hidden"
          {...register('recordMethod')}
          value="manual"
        />

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Attendance
          </button>
        </div>
      </form>
    );
  };
  
  const BulkAttendanceForm = () => {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [status, setStatus] = useState<'present' | 'absent' | 'late' | 'excused'>('present');
    const [notes, setNotes] = useState<string>('');
    const [selectAll, setSelectAll] = useState<boolean>(false);
    
    useEffect(() => {
      if (selectAll) {
        setSelectedStudentIds(students.map(s => s.id));
      } else if (selectedStudentIds.length === students.length) {
        setSelectedStudentIds([]);
      }
    }, [selectAll, students]);
    
    const handleStudentToggle = (studentId: string) => {
      if (selectedStudentIds.includes(studentId)) {
        setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
      } else {
        setSelectedStudentIds([...selectedStudentIds, studentId]);
      }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedStudentIds.length === 0) {
        alert('Please select at least one student.');
        return;
      }
      
      addBulkAttendance(selectedDate, status, selectedStudentIds, notes);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="bulkDate" className="form-label">Date</label>
          <input
            id="bulkDate"
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bulkStatus" className="form-label">Status</label>
          <select
            id="bulkStatus"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'present' | 'absent' | 'late' | 'excused')}
            required
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="bulkNotes" className="form-label">Notes (applies to all selected students)</label>
          <textarea
            id="bulkNotes"
            className="input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">Select Students</label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2" 
                checked={selectAll}
                onChange={() => setSelectAll(!selectAll)}
              />
              Select All
            </label>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2 max-h-60 overflow-y-auto">
            {students.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 p-2">No students available</p>
            ) : (
              <div className="space-y-2">
                {students.map(student => (
                  <div key={student.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="mr-3"
                    />
                    <label htmlFor={`student-${student.id}`} className="flex-grow cursor-pointer">
                      {student.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => setCurrentModal(null)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={selectedStudentIds.length === 0}
          >
            Mark Attendance
          </button>
        </div>
      </form>
    );
  };

  const AssignmentForm = ({ defaultValues }: { defaultValues?: Partial<Assignment> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Omit<Assignment, 'id' | 'studentCompletions'>>(
      {
        defaultValues: defaultValues || {
          title: '',
          description: '',
          dueDate: new Date().toISOString().split('T')[0]
        }
      }
    );

    const onSubmit = (data: any) => {
      if (defaultValues?.id) {
        updateAssignment(defaultValues.id, data);
      } else {
        addAssignment(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            id="title"
            type="text"
            className="input"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="input"
            rows={3}
            {...register('description')}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">Due Date</label>
          <input
            id="dueDate"
            type="date"
            className="input"
            {...register('dueDate', { required: 'Due date is required' })}
          />
          {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Assignment
          </button>
        </div>
      </form>
    );
  };
  
  const MessageForm = ({ studentId }: { studentId?: string }) => {
    const [recipient, setRecipient] = useState<string>('');
    const [recipientEmail, setRecipientEmail] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    useEffect(() => {
      if (studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          setRecipient(student.id);
          if (student.parentEmail) {
            setRecipientEmail(student.parentEmail);
          } else if (student.parentName) {
            setRecipientEmail('Parent of ' + student.name);
          } else {
            setRecipientEmail('Parent/Guardian');
          }
        }
      }
    }, [studentId, students]);
    
    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...filesArray]);
        
        // Create preview URLs
        const newPreviewUrls = filesArray.map(file => {
          return URL.createObjectURL(file);
        });
        
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      }
    };
    
    const removeAttachment = (index: number) => {
      const newAttachments = [...attachments];
      const newPreviews = [...previewUrls];
      
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newPreviews[index]);
      
      newAttachments.splice(index, 1);
      newPreviews.splice(index, 1);
      
      setAttachments(newAttachments);
      setPreviewUrls(newPreviews);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic validation
      if (!recipient || !subject || !content) {
        alert('Please fill out all required fields.');
        return;
      }
      
      // Convert file attachments to data that can be stored
      const processedAttachments = attachments.map((file, index) => ({
        id: generateId(),
        name: file.name,
        type: file.type,
        url: previewUrls[index] // In a real app, you'd upload these files and store URLs
      }));
      
      // Create new message
      const newMessage: Omit<Message, 'id' | 'timestamp' | 'read'> = {
        from: 'teacher',
        sender: 'Teacher', // In a real app, this would be the current user's name
        studentId: recipient,
        recipientEmail: recipientEmail,
        subject,
        content,
        attachments: processedAttachments
      };
      
      addMessage(newMessage);
      
      // Clean up object URLs to prevent memory leaks
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {!studentId && (
          <div className="form-group">
            <label htmlFor="recipient" className="form-label">Student</label>
            <select
              id="recipient"
              className="input"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                const student = students.find(s => s.id === e.target.value);
                if (student && student.parentEmail) {
                  setRecipientEmail(student.parentEmail);
                } else if (student && student.parentName) {
                  setRecipientEmail('Parent of ' + student.name);
                } else if (student) {
                  setRecipientEmail('Parent/Guardian');
                } else {
                  setRecipientEmail('');
                }
              }}
              required
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="recipientEmail" className="form-label">To</label>
          <input
            id="recipientEmail"
            type="text"
            className="input bg-gray-50 dark:bg-gray-700"
            value={recipientEmail}
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input
            id="subject"
            type="text"
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content" className="form-label">Message</label>
          <textarea
            id="content"
            className="input"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label className="form-label">Attachments</label>
          
          {attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded dark:border-gray-700">
                  <div className="flex items-center">
                    <FileImage className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button 
                    type="button" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Paperclip className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Click to attach files</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, images, or documents</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleAttachmentChange} 
              />
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => setCurrentModal(null)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Send className="h-4 w-4" /> Send Message
          </button>
        </div>
      </form>
    );
  };
  
  const CustomReportForm = () => {
    const [filterType, setFilterType] = useState<ReportFilter['type']>('grade');
    const [filterField, setFilterField] = useState<string>('');
    const [filterOperator, setFilterOperator] = useState<ReportFilter['operator']>('equals');
    const [filterValue, setFilterValue] = useState<string>('');
    const [filterSecondValue, setFilterSecondValue] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    const resetFilterForm = () => {
      setFilterType('grade');
      setFilterField('');
      setFilterOperator('equals');
      setFilterValue('');
      setFilterSecondValue('');
    };
    
    const handleAddFilter = () => {
      if (!filterField || !filterValue) {
        alert('Please fill in all required filter fields.');
        return;
      }
      
      const filter: ReportFilter = {
        type: filterType,
        field: filterField,
        operator: filterOperator,
        value: filterValue
      };
      
      if (filterOperator === 'between' && filterSecondValue) {
        filter.secondValue = filterSecondValue;
      }
      
      addReportFilter(filter);
      resetFilterForm();
    };
    
    const handleApplyDateRange = () => {
      if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
      }
      
      setDateRangeFilter({ start: startDate, end: endDate });
    };
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Report Name</h3>
          <input
            type="text"
            className="input w-full"
            placeholder="Enter a name for this report"
            value={customReportName}
            onChange={(e) => setCustomReportName(e.target.value)}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div className="form-group mb-0">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                id="startDate"
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group mb-0">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                id="endDate"
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
            onClick={handleApplyDateRange}
          >
            Apply Date Range
          </button>
          {dateRangeFilter && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center">
              <Info className="h-4 w-4 mr-1" /> 
              Date range set: {formatDate(dateRangeFilter.start)} to {formatDate(dateRangeFilter.end)}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Add Filters</h3>
          <div className="space-y-3">
            <div className="form-group">
              <label htmlFor="filterType" className="form-label">Filter Type</label>
              <select
                id="filterType"
                className="input"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as ReportFilter['type']);
                  setFilterField('');
                }}
              >
                <option value="grade">Grade</option>
                <option value="attendance">Attendance</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="filterField" className="form-label">Field</label>
              <select
                id="filterField"
                className="input"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
              >
                <option value="">Select a field</option>
                {filterType === 'grade' && (
                  <>
                    <option value="subject">Subject</option>
                    <option value="score">Score</option>
                  </>
                )}
                {filterType === 'attendance' && (
                  <option value="status">Status</option>
                )}
                {filterType === 'assignment' && (
                  <option value="status">Status</option>
                )}
              </select>
            </div>
            
            {filterField && (
              <div className="form-group">
                <label htmlFor="filterOperator" className="form-label">Operator</label>
                <select
                  id="filterOperator"
                  className="input"
                  value={filterOperator}
                  onChange={(e) => setFilterOperator(e.target.value as ReportFilter['operator'])}
                >
                  {(filterField === 'subject') && (
                    <>
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                    </>
                  )}
                  {(filterField === 'score') && (
                    <>
                      <option value="equals">Equals</option>
                      <option value="greaterThan">Greater Than</option>
                      <option value="lessThan">Less Than</option>
                      <option value="between">Between</option>
                    </>
                  )}
                  {(filterField === 'status') && (
                    <option value="equals">Equals</option>
                  )}
                </select>
              </div>
            )}
            
            {filterField && (
              <div className="form-group">
                <label htmlFor="filterValue" className="form-label">Value</label>
                {filterField === 'status' && filterType === 'attendance' ? (
                  <select
                    id="filterValue"
                    className="input"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">Select a value</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                ) : filterField === 'status' && filterType === 'assignment' ? (
                  <select
                    id="filterValue"
                    className="input"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">Select a value</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="not-started">Not Started</option>
                  </select>
                ) : (
                  <input
                    id="filterValue"
                    type={filterField === 'score' ? 'number' : 'text'}
                    className="input"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Enter value"
                  />
                )}
              </div>
            )}
            
            {filterOperator === 'between' && (
              <div className="form-group">
                <label htmlFor="filterSecondValue" className="form-label">Second Value</label>
                <input
                  id="filterSecondValue"
                  type="number"
                  className="input"
                  value={filterSecondValue}
                  onChange={(e) => setFilterSecondValue(e.target.value)}
                  placeholder="Enter second value"
                />
              </div>
            )}
            
            <button 
              type="button" 
              className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 w-full"
              onClick={handleAddFilter}
              disabled={!filterField || !filterValue || (filterOperator === 'between' && !filterSecondValue)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Filter
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Applied Filters</h3>
          {currentReportFilters.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">No filters applied</p>
          ) : (
            <div className="space-y-2">
              {currentReportFilters.map((filter, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded dark:border-gray-700">
                  <div className="text-sm">
                    <span className="font-medium">{filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}</span>: {filter.field} 
                    {filter.operator === 'equals' && ' = '}
                    {filter.operator === 'greaterThan' && ' > '}
                    {filter.operator === 'lessThan' && ' < '}
                    {filter.operator === 'contains' && ' contains '}
                    {filter.operator === 'between' && ' between '}
                    {filter.value}
                    {filter.secondValue && ` and ${filter.secondValue}`}
                  </div>
                  <button 
                    type="button" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeReportFilter(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 w-full mt-2"
                onClick={clearReportFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => {
              setCurrentModal(null);
              clearReportFilters();
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleGenerateCustomReport}
          >
            <FileDown className="h-4 w-4" /> Generate Report
          </button>
        </div>
      </div>
    );
  };

  const AttendanceReportsModal = () => {
    const [reportType, setReportType] = useState<AttendanceReportType>('daily');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [useCustomRange, setUseCustomRange] = useState<boolean>(false);
    
    const handleGenerateReport = () => {
      if (useCustomRange) {
        if (!customStartDate || !customEndDate) {
          alert('Please select both start and end dates for custom range.');
          return;
        }
        generateAttendanceReport(reportType, customStartDate, customEndDate);
      } else {
        generateAttendanceReport(reportType);
      }
    };
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Generate Attendance Report</h3>
          
          <div className="form-group">
            <label htmlFor="reportType" className="form-label">Report Type</label>
            <select
              id="reportType"
              className="input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as AttendanceReportType)}
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useCustomRange}
                onChange={(e) => setUseCustomRange(e.target.checked)}
                className="mr-2"
              />
              Use custom date range
            </label>
          </div>
          
          {useCustomRange && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="customStartDate" className="form-label">Start Date</label>
                <input
                  id="customStartDate"
                  type="date"
                  className="input"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="customEndDate" className="form-label">End Date</label>
                <input
                  id="customEndDate"
                  type="date"
                  className="input"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => setCurrentModal(null)}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleGenerateReport}
          >
            <BarChartIcon className="h-4 w-4" /> Generate Report
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid mx-auto py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Book className="h-6 w-6" />
              Student Progress Tracker
            </h1>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search..."
                className="input input-sm hidden md:block"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hidden md:flex items-center justify-center gap-1"
                onClick={exportData}
              >
                <Download className="h-4 w-4" /> Export
              </button>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hidden md:flex items-center justify-center gap-1"
                onClick={exportTemplate}
              >
                <FileText className="h-4 w-4" /> Template
              </button>
              <label className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hidden md:flex items-center justify-center gap-1 cursor-pointer">
                <Upload className="h-4 w-4" /> Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {/* Mobile search bar */}
          {isMobileMenuOpen && (
            <div className="mt-3 md:hidden">
              <input
                type="text"
                placeholder="Search..."
                className="input w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex justify-between mt-2 gap-2">
                <button 
                  className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 flex items-center justify-center gap-1"
                  onClick={exportData}
                >
                  <Download className="h-4 w-4" /> Export
                </button>
                <button 
                  className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 flex items-center justify-center gap-1"
                  onClick={exportTemplate}
                >
                  <FileText className="h-4 w-4" /> Template
                </button>
                <label className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 flex items-center justify-center gap-1 cursor-pointer">
                  <Upload className="h-4 w-4" /> Import
                  <input
                    type="file"
                    accept=".json,.csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto space-x-4 mt-4 pb-1">
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('dashboard');
                setSelectedStudent(null);
              }}
            >
              Dashboard
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'students' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('students');
                setSelectedStudent(null);
              }}
            >
              Students
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'grades' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('grades');
                setSelectedStudent(null);
              }}
            >
              Grades
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('attendance');
                setSelectedStudent(null);
              }}
            >
              Attendance
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'assignments' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('assignments');
                setSelectedStudent(null);
              }}
            >
              Assignments
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'communication' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('communication');
                setSelectedStudent(null);
              }}
            >
              Communication
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'reporting' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('reporting');
                setSelectedStudent(null);
              }}
            >
              Reporting
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid mx-auto py-6">
        {/* Back to list button when viewing student details */}
        {selectedStudent && (
          <button
            className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 mb-4 flex items-center gap-1"
            onClick={() => {
              setSelectedStudent(null);
              setActiveTab('students');
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Students
          </button>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Dashboard</h2>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => {
                  setAttendanceReportType('daily');
                  setCurrentModal('attendanceReports');
                }}
              >
                <TrendingUp className="h-4 w-4" /> Attendance Reports
              </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Students</h3>
                  <User className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{students.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total enrolled students</p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Grades</h3>
                  <FileText className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{grades.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total grades recorded</p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Attendance</h3>
                  <Calendar className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{attendanceRecords.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total attendance records</p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Assignments</h3>
                  <Book className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{assignments.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total assignments</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Grade Distribution</h3>
                {analyticsData.gradeDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#4f46e5" name="Number of Grades" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No grade data available</p>
                  </div>
                )}
              </div>

              {/* Attendance Overview Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Attendance Overview</h3>
                {analyticsData.attendanceOverview.length > 0 && analyticsData.attendanceOverview.some(item => item.value > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.attendanceOverview}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="present" fill="#10b981" />
                          <Cell key="absent" fill="#ef4444" />
                          <Cell key="late" fill="#f59e0b" />
                          <Cell key="excused" fill="#6366f1" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No attendance data available</p>
                  </div>
                )}
              </div>

              {/* Assignment Status Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Assignment Completion</h3>
                {analyticsData.assignmentCompletion.length > 0 && analyticsData.assignmentCompletion.some(item => item.value > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.assignmentCompletion}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="completed" fill="#10b981" />
                          <Cell key="in-progress" fill="#f59e0b" />
                          <Cell key="not-started" fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No assignment data available</p>
                  </div>
                )}
              </div>
              
              {/* Attendance Trends Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Attendance Trends</h3>
                {analyticsData.attendanceTrends && analyticsData.attendanceTrends.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.attendanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                        <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                        <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
                        <Line type="monotone" dataKey="excused" stroke="#6366f1" name="Excused" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No attendance trend data available</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="card shadow-sm p-4 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Activity</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Recent Grades */}
                    <div>
                      <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">Recent Grades</h4>
                      {grades.slice(0, 3).map(grade => {
                        const student = students.find(s => s.id === grade.studentId);
                        return (
                          <div key={grade.id} className="flex items-start p-3 border rounded-md border-gray-200 dark:border-gray-700 mb-2">
                            <div className="flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {student?.name || 'Unknown Student'} - {grade.subject}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Score: {grade.score} - {formatDate(grade.date)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {grades.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-3 border rounded-md border-gray-200 dark:border-gray-700">
                          No grades recorded
                        </p>
                      )}
                    </div>

                    {/* Recent Attendance */}
                    <div>
                      <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">Recent Attendance</h4>
                      {attendanceRecords.slice(0, 3).map(record => {
                        const student = students.find(s => s.id === record.studentId);
                        return (
                          <div key={record.id} className="flex items-start p-3 border rounded-md border-gray-200 dark:border-gray-700 mb-2">
                            <div className="flex-shrink-0">
                              <Calendar className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {student?.name || 'Unknown Student'} - {record.status}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(record.date)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {attendanceRecords.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-3 border rounded-md border-gray-200 dark:border-gray-700">
                          No attendance records
                        </p>
                      )}
                    </div>
                    
                    {/* Recent Messages */}
                    <div>
                      <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">Recent Messages</h4>
                      {messages.slice(0, 3).map(message => {
                        const student = students.find(s => s.id === message.studentId);
                        return (
                          <div key={message.id} className="flex items-start p-3 border rounded-md border-gray-200 dark:border-gray-700 mb-2">
                            <div className="flex-shrink-0">
                              <MessageCircle className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {student?.name || 'Unknown Student'} - {message.subject}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {messages.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-3 border rounded-md border-gray-200 dark:border-gray-700">
                          No messages
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && !selectedStudent && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Students</h2>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setCurrentModal('addStudent')}
              >
                <Plus className="h-4 w-4" /> Add Student
              </button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No students found</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addStudent')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Student
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredStudents().map(student => (
                  <div key={student.id} className="card shadow-sm hover:shadow transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{student.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        {student.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{student.phone}</p>}
                        {student.grade && <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {student.grade}</p>}
                        {student.parentName && <p className="text-sm text-gray-500 dark:text-gray-400">Parent: {student.parentName}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedStudent(student);
                            setActiveTab('student-details');
                          }} 
                          className="text-gray-500 hover:text-primary-500 transition-colors"
                          aria-label="View student details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditItem(student);
                            setCurrentModal('editStudent');
                          }} 
                          className="text-gray-500 hover:text-primary-500 transition-colors"
                          aria-label="Edit student"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)} 
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          aria-label="Delete student"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Grades</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {grades.filter(g => g.studentId === student.id).length}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {attendanceRecords.filter(r => r.studentId === student.id).length}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assignments.reduce((total, assignment) => {
                              const completion = assignment.studentCompletions.find(c => c.studentId === student.id);
                              return total + (completion?.status === 'completed' ? 1 : 0);
                            }, 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex mt-4 gap-2">
                        <button 
                          className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 flex-1 flex items-center justify-center gap-1"
                          onClick={() => handleGenerateReport(student.id)}
                        >
                          <FileDown className="h-4 w-4" /> Report
                        </button>
                        <button 
                          className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 flex-1 flex items-center justify-center gap-1"
                          onClick={() => {
                            setSelectedStudent(student);
                            setCurrentModal('newMessage');
                          }}
                        >
                          <Mail className="h-4 w-4" /> Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Details */}
        {activeTab === 'student-details' && selectedStudent && (
          <div className="space-y-6">
            <div className="card shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
                  {selectedStudent.phone && <p className="text-gray-500 dark:text-gray-400">Phone: {selectedStudent.phone}</p>}
                  {selectedStudent.grade && <p className="text-gray-500 dark:text-gray-400">Grade: {selectedStudent.grade}</p>}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleGenerateReport(selectedStudent.id)}
                    className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                  >
                    <FileDown className="h-4 w-4" /> Generate Report
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentModal('newMessage');
                    }}
                    className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" /> Message Parent
                  </button>
                  <button 
                    onClick={() => {
                      setEditItem(selectedStudent);
                      setCurrentModal('editStudent');
                    }} 
                    className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button 
                    onClick={() => deleteStudent(selectedStudent.id)} 
                    className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
              
              {/* Parent information */}
              {(selectedStudent.parentName || selectedStudent.parentEmail || selectedStudent.parentPhone) && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Parent/Guardian Information</h3>
                  {selectedStudent.parentName && <p className="text-sm text-gray-600 dark:text-gray-400">Name: {selectedStudent.parentName}</p>}
                  {selectedStudent.parentEmail && <p className="text-sm text-gray-600 dark:text-gray-400">Email: {selectedStudent.parentEmail}</p>}
                  {selectedStudent.parentPhone && <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {selectedStudent.parentPhone}</p>}
                </div>
              )}
            </div>

            {/* Grades Section */}
            <div className="card shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Grades</h3>
                <button
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  onClick={() => setCurrentModal('addGrade')}
                >
                  <Plus className="h-4 w-4" /> Add Grade
                </button>
              </div>

              {grades.filter(grade => grade.studentId === selectedStudent.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No grades recorded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {grades
                        .filter(grade => grade.studentId === selectedStudent.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(grade => (
                          <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{grade.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getScoreClass(grade.score)}`}>
                                {grade.score}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(grade.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(grade);
                                  setCurrentModal('editGrade');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteGrade(grade.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Attendance Section */}
            <div className="card shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attendance</h3>
                <button
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  onClick={() => setCurrentModal('addAttendance')}
                >
                  <Plus className="h-4 w-4" /> Add Attendance
                </button>
              </div>

              {attendanceRecords.filter(record => record.studentId === selectedStudent.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No attendance records</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {attendanceRecords
                        .filter(record => record.studentId === selectedStudent.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(record => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(record.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(record.status)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.notes || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="inline-block text-xs font-medium">
                                {record.recordMethod === 'automated' && 'Automated'}
                                {record.recordMethod === 'bulk' && 'Bulk Entry'}
                                {(!record.recordMethod || record.recordMethod === 'manual') && 'Manual'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(record);
                                  setCurrentModal('editAttendance');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAttendance(record.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assignments Section */}
            <div className="card shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignments</h3>

              {assignments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No assignments available</p>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => {
                    const completion = assignment.studentCompletions.find(
                      completion => completion.studentId === selectedStudent.id
                    );
                    return (
                      <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{assignment.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {formatDate(assignment.dueDate)}</p>
                          </div>
                          <div>
                            <select
                              className="input input-sm"
                              value={completion?.status || 'not-started'}
                              onChange={(e) => updateAssignmentStatus(
                                assignment.id, 
                                selectedStudent.id, 
                                e.target.value as 'completed' | 'in-progress' | 'not-started'
                              )}
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        {completion?.status === 'completed' && completion.submittedDate && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Completed on {formatDate(completion.submittedDate)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Communication History Section */}
            <div className="card shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Communication History</h3>
                <button
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  onClick={() => setCurrentModal('newMessage')}
                >
                  <Plus className="h-4 w-4" /> New Message
                </button>
              </div>
              
              {messages.filter(message => message.studentId === selectedStudent.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {messages
                    .filter(message => message.studentId === selectedStudent.id)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(message => (
                      <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{message.subject}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {message.from === 'teacher' ? 'You' : message.sender} • {formatDate(message.timestamp)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p>{message.content}</p>
                        </div>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center text-xs p-1 border rounded dark:border-gray-700">
                                  <FileImage className="h-3 w-3 mr-1 text-gray-500" />
                                  <span>{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            
            {/* Conferences Section */}
            <div className="card shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Parent-Teacher Conferences</h3>
                <button
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  onClick={() => {
                    // Add a new conference
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    const newConference = addConference({
                      title: `Conference with ${selectedStudent.name}'s parent`,
                      studentId: selectedStudent.id,
                      date: tomorrow.toISOString().split('T')[0],
                      time: '15:00',
                      duration: 30,
                      status: 'scheduled'
                    });
                    
                    // Send a confirmation message
                    if (selectedStudent.parentEmail) {
                      addMessage({
                        from: 'teacher',
                        sender: 'Teacher',
                        studentId: selectedStudent.id,
                        recipientEmail: selectedStudent.parentEmail,
                        subject: 'Parent-Teacher Conference Scheduled',
                        content: `A conference has been scheduled for ${selectedStudent.name} on ${formatDate(newConference.date)} at ${newConference.time}. Please confirm your attendance.`
                      });
                    }
                  }}
                >
                  <Plus className="h-4 w-4" /> Schedule Conference
                </button>
              </div>
              
              {getConferencesForStudent(selectedStudent.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No conferences scheduled</p>
              ) : (
                <div className="space-y-4">
                  {getConferencesForStudent(selectedStudent.id)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(conference => (
                      <div key={conference.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{conference.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(conference.date)} at {conference.time} ({conference.duration} minutes)
                            </p>
                          </div>
                          <div>
                            <span 
                              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                conference.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                conference.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {conference.status.charAt(0).toUpperCase() + conference.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {conference.status === 'scheduled' && (
                            <>
                              <button 
                                onClick={() => updateConferenceStatus(conference.id, 'completed')}
                                className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 flex-1 flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" /> Mark Complete
                              </button>
                              <button 
                                onClick={() => updateConferenceStatus(conference.id, 'cancelled')}
                                className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 flex-1 flex items-center justify-center gap-1"
                              >
                                <XCircleIcon className="h-4 w-4" /> Cancel
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => deleteConference(conference.id)}
                            className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades */}
        {activeTab === 'grades' && !selectedStudent && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grades</h2>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setCurrentModal('addGrade')}
                disabled={students.length === 0}
              >
                <Plus className="h-4 w-4" /> Add Grade
              </button>
            </div>

            {students.length === 0 ? (
              <div className="alert alert-warning">
                <p>You need to add students before you can record grades.</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No grades recorded</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addGrade')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Grade
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {grades
                      .filter(grade => {
                        if (!searchQuery) return true;
                        const student = students.find(s => s.id === grade.studentId);
                        return student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               grade.subject.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(grade => {
                        const student = students.find(s => s.id === grade.studentId);
                        return (
                          <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <button
                                className="text-primary-600 hover:underline"
                                onClick={() => {
                                  const student = students.find(s => s.id === grade.studentId);
                                  if (student) {
                                    setSelectedStudent(student);
                                    setActiveTab('student-details');
                                  }
                                }}
                              >
                                {student?.name || 'Unknown Student'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{grade.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getScoreClass(grade.score)}`}>
                                {grade.score}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(grade.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(grade);
                                  setCurrentModal('editGrade');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteGrade(grade.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Attendance */}
        {activeTab === 'attendance' && !selectedStudent && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <select
                    className="input input-sm pl-8"
                    value={filterStatus.attendance}
                    onChange={(e) => setFilterStatus({ 
                      ...filterStatus, 
                      attendance: e.target.value 
                    })}
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                  <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="btn btn-secondary flex items-center gap-2"
                    onClick={() => {
                      setAttendanceReportType('daily');
                      setCurrentModal('attendanceReports');
                    }}
                  >
                    <TrendingUp className="h-4 w-4" /> Reports
                  </button>
                  
                  <div className="relative">
                    <select
                      className="input input-sm pl-8"
                      value={attendanceMode}
                      onChange={(e) => setAttendanceMode(e.target.value as 'manual' | 'bulk')}
                    >
                      <option value="manual">Single Student</option>
                      <option value="bulk">Bulk Entry</option>
                    </select>
                    <Settings className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => {
                      if (attendanceMode === 'bulk') {
                        setCurrentModal('bulkAttendance');
                      } else {
                        setCurrentModal('addAttendance');
                      }
                    }}
                    disabled={students.length === 0}
                  >
                    <Plus className="h-4 w-4" /> {attendanceMode === 'bulk' ? 'Bulk Attendance' : 'Add Attendance'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="form-group mb-0 flex-1">
                  <label htmlFor="attendanceDate" className="form-label">Current Date</label>
                  <input
                    id="attendanceDate"
                    type="date"
                    className="input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="sm:self-end mb-1">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Present
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-2"></span> Absent
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 ml-1 mr-1"></span> Late
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-1 mr-1"></span> Excused
                  </div>
                </div>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="alert alert-warning">
                <p>You need to add students before you can record attendance.</p>
              </div>
            ) : (
              <div className="card shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Quick Attendance for {formatDate(selectedDate)}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => {
                    const existingRecord = attendanceRecords.find(
                      record => record.studentId === student.id && record.date === selectedDate
                    );
                    
                    return (
                      <div key={student.id} className="border rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{student.grade || 'No grade'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${existingRecord?.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-600'}`}
                            onClick={() => addAttendance({
                              studentId: student.id,
                              date: selectedDate,
                              status: 'present',
                              notes: existingRecord?.notes || '',
                              recordMethod: 'automated'
                            })}
                            aria-label="Mark present"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${existingRecord?.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'}`}
                            onClick={() => addAttendance({
                              studentId: student.id,
                              date: selectedDate,
                              status: 'absent',
                              notes: existingRecord?.notes || '',
                              recordMethod: 'automated'
                            })}
                            aria-label="Mark absent"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                          <button 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${existingRecord?.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`}
                            onClick={() => addAttendance({
                              studentId: student.id,
                              date: selectedDate,
                              status: 'late',
                              notes: existingRecord?.notes || '',
                              recordMethod: 'automated'
                            })}
                            aria-label="Mark late"
                          >
                            <Clock className="h-5 w-5" />
                          </button>
                          <button 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${existingRecord?.status === 'excused' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}
                            onClick={() => addAttendance({
                              studentId: student.id,
                              date: selectedDate,
                              status: 'excused',
                              notes: existingRecord?.notes || '',
                              recordMethod: 'automated'
                            })}
                            aria-label="Mark excused"
                          >
                            <Timer className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attendance Records</h3>
              
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No attendance records</p>
                  <button 
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                    onClick={() => setCurrentModal('addAttendance')}
                  >
                    <Plus className="h-4 w-4" /> Add Your First Attendance Record
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {getFilteredAttendance()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(record => {
                          const student = students.find(s => s.id === record.studentId);
                          return (
                            <tr key={record.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                <button
                                  className="text-primary-600 hover:underline"
                                  onClick={() => {
                                    const student = students.find(s => s.id === record.studentId);
                                    if (student) {
                                      setSelectedStudent(student);
                                      setActiveTab('student-details');
                                    }
                                  }}
                                >
                                  {student?.name || 'Unknown Student'}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(record.status)}`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.notes || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="text-xs">
                                  {record.recordMethod === 'automated' && 'Automated'}
                                  {record.recordMethod === 'bulk' && 'Bulk Entry'}
                                  {(!record.recordMethod || record.recordMethod === 'manual') && 'Manual'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setEditItem(record);
                                    setCurrentModal('editAttendance');
                                  }}
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteAttendance(record.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assignments</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <select
                    className="input input-sm pl-8"
                    value={filterStatus.assignments}
                    onChange={(e) => setFilterStatus({ 
                      ...filterStatus, 
                      assignments: e.target.value 
                    })}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="not-started">Not Started</option>
                  </select>
                  <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => setCurrentModal('addAssignment')}
                >
                  <Plus className="h-4 w-4" /> Add Assignment
                </button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No assignments</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addAssignment')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredAssignments().map(assignment => (
                  <div key={assignment.id} className="card shadow-sm hover:shadow transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {formatDate(assignment.dueDate)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditItem(assignment);
                            setCurrentModal('editAssignment');
                          }} 
                          className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button 
                          onClick={() => deleteAssignment(assignment.id)} 
                          className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>

                    {assignment.description && (
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{assignment.description}</p>
                    )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Progress</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {assignment.studentCompletions
                              .filter(completion => {
                                if (!searchQuery) return true;
                                const student = students.find(s => s.id === completion.studentId);
                                return student?.name.toLowerCase().includes(searchQuery.toLowerCase());
                              })
                              .map(completion => {
                                const student = students.find(s => s.id === completion.studentId);
                                if (!student) return null;
                                return (
                                  <tr key={`${assignment.id}-${completion.studentId}`}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      <button
                                        className="text-primary-600 hover:underline"
                                        onClick={() => {
                                          setSelectedStudent(student);
                                          setActiveTab('student-details');
                                        }}
                                      >
                                        {student?.name}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCompletionClass(completion.status)}`}>
                                        {completion.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                                        {completion.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                                        {completion.status === 'not-started' && <XCircle className="h-3 w-3 mr-1" />}
                                        {formatStatus(completion.status)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {completion.submittedDate ? formatDate(completion.submittedDate) : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <select
                                        className="input input-sm"
                                        value={completion.status}
                                        onChange={(e) => updateAssignmentStatus(
                                          assignment.id, 
                                          completion.studentId, 
                                          e.target.value as 'completed' | 'in-progress' | 'not-started'
                                        )}
                                      >
                                        <option value="not-started">Not Started</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                      </select>
                                    </td>
                                  </tr>
                                );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Communication */}
        {activeTab === 'communication' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Parent-Teacher Communication</h2>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setCurrentModal('newMessage')}
                disabled={students.length === 0}
              >
                <Plus className="h-4 w-4" /> New Message
              </button>
            </div>
            
            {/* Messages section */}
            <div className="card shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Messages</h3>
              
              {students.length === 0 ? (
                <div className="alert alert-warning">
                  <p>You need to add students before you can send messages.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No messages yet</p>
                  <button 
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                    onClick={() => setCurrentModal('newMessage')}
                  >
                    <Plus className="h-4 w-4" /> Send Your First Message
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredMessages()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(message => {
                      const student = students.find(s => s.id === message.studentId);
                      return (
                        <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{message.subject}</p>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center">
                                  <UserRound className="h-3 w-3 mr-1" />{message.from === 'teacher' ? 'You' : message.sender}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />{student?.name || 'Unknown Student'}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                                  <CalendarIcon className="h-3 w-3 mr-1" />{formatDate(message.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => deleteMessage(message.id)}
                                className="text-red-600 hover:text-red-800"
                                aria-label="Delete message"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <p>{message.content}</p>
                          </div>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attachments:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.attachments.map(attachment => (
                                  <div key={attachment.id} className="flex items-center text-xs p-1 border rounded dark:border-gray-700">
                                    <FileImage className="h-3 w-3 mr-1 text-gray-500" />
                                    <span>{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
            
            {/* Parent Contact Information */}
            <div className="card shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Parent Contact Directory</h3>
              
              {students.length === 0 ? (
                <div className="alert alert-warning">
                  <p>You need to add students and their parent contact information first.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parent/Guardian</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {students
                        .filter(student => {
                          if (!searchQuery) return true;
                          return (
                            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (student.parentName && student.parentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (student.parentEmail && student.parentEmail.toLowerCase().includes(searchQuery.toLowerCase()))
                          );
                        })
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(student => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <button
                                className="text-primary-600 hover:underline"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setActiveTab('student-details');
                                }}
                              >
                                {student.name}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {student.parentName || <span className="text-gray-400 italic">Not provided</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.parentEmail ? (
                                <a href={`mailto:${student.parentEmail}`} className="text-primary-600 hover:underline">
                                  {student.parentEmail}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">Not provided</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.parentPhone ? (
                                <a href={`tel:${student.parentPhone}`} className="text-primary-600 hover:underline">
                                  {student.parentPhone}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">Not provided</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setCurrentModal('newMessage');
                                  }}
                                  className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1"
                                  disabled={!student.parentEmail && !student.parentName}
                                >
                                  <Mail className="h-3 w-3" /> Message
                                </button>
                                {student.parentPhone && (
                                  <a
                                    href={`tel:${student.parentPhone}`}
                                    className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                                  >
                                    <Phone className="h-3 w-3" /> Call
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Upcoming Conferences */}
            <div className="card shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Upcoming Conferences</h3>
              
              {conferences.filter(c => c.status === 'scheduled').length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No upcoming conferences scheduled</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conferences
                    .filter(c => c.status === 'scheduled')
                    .sort((a, b) => {
                      const dateA = new Date(`${a.date}T${a.time}`);
                      const dateB = new Date(`${b.date}T${b.time}`);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map(conference => {
                      const student = students.find(s => s.id === conference.studentId);
                      return (
                        <div key={conference.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white">Conference with {student?.name}</h4>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 rounded-full">Scheduled</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatDate(conference.date)} at {conference.time}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Duration: {conference.duration} minutes
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button 
                              onClick={() => updateConferenceStatus(conference.id, 'completed')}
                              className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 flex-1 flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" /> Complete
                            </button>
                            <button 
                              onClick={() => updateConferenceStatus(conference.id, 'cancelled')}
                              className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 flex-1 flex items-center justify-center gap-1"
                            >
                              <XCircleIcon className="h-4 w-4" /> Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Reporting */}
        {activeTab === 'reporting' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customizable Reports</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                {selectedStudent && (
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setCurrentModal('customReport')}
                  >
                    <Plus className="h-4 w-4" /> Create Custom Report
                  </button>
                )}
                {!selectedStudent && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <AlertCircle className="h-4 w-4 mr-1" /> 
                    Select a student to create custom reports
                  </div>
                )}
              </div>
            </div>
            
            {/* Student selection for reports */}
            <div className="card shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Select a Student</h3>
              
              {students.length === 0 ? (
                <div className="alert alert-warning">
                  <p>You need to add students before you can generate reports.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => (
                    <div 
                      key={student.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedStudent?.id === student.id ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                        {selectedStudent?.id === student.id && (
                          <Check className="h-5 w-5 text-primary-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.grade || 'No grade'}</p>
                      
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Grades</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {grades.filter(g => g.studentId === student.id).length}
                          </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Attendance</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {attendanceRecords.filter(r => r.studentId === student.id).length}
                          </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Assignments</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {assignments.reduce((total, assignment) => {
                              const completion = assignment.studentCompletions.find(c => c.studentId === student.id);
                              return total + (completion?.status === 'completed' ? 1 : 0);
                            }, 0)} / {assignments.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Saved reports section */}
            {selectedStudent && (
              <div className="card shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Saved Reports for {selectedStudent.name}</h3>
                  <button
                    className="btn btn-sm btn-primary flex items-center gap-1"
                    onClick={() => handleGenerateReport(selectedStudent.id)}
                  >
                    <FileDown className="h-4 w-4" /> Generate Standard Report
                  </button>
                </div>
                
                {savedReports.filter(report => report.studentId === selectedStudent.id).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No saved reports for this student</p>
                ) : (
                  <div className="space-y-4">
                    {savedReports
                      .filter(report => report.studentId === selectedStudent.id)
                      .sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime())
                      .map(report => (
                        <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {(report as any).name || 'Progress Report'}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Generated on {formatDate(report.generatedDate)}
                              </p>
                              
                              {report.dateRange && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Date range: {formatDate(report.dateRange.start)} to {formatDate(report.dateRange.end)}
                                </p>
                              )}
                              
                              {report.customFilters && report.customFilters.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Filters:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {report.customFilters.map((filter, index) => (
                                      <span 
                                        key={index}
                                        className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded"
                                      >
                                        {filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}: {filter.field} {filter.operator} {filter.value}
                                        {filter.secondValue && ` to ${filter.secondValue}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentReport(report);
                                  setCurrentModal('reportPreview');
                                }}
                                className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                              <button
                                onClick={() => {
                                  setSavedReports(savedReports.filter(r => r.id !== report.id));
                                }}
                                className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                            <div className="grid grid-cols-3 gap-4 text-center w-full">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Grade Average</p>
                                <p className={`text-sm font-semibold ${getScoreClass(report.gradeAverage)}`}>
                                  {report.gradeAverage.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                                <p className={`text-sm font-semibold ${getStatusColorClass(report.attendanceRate)}`}>
                                  {report.attendanceRate.toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Overall</p>
                                <p className={`text-sm font-semibold ${getStatusColorClass(report.overallProgress)}`}>
                                  {report.overallProgress.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
        <div className="container-fluid mx-auto py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {currentModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => {
            setCurrentModal(null);
            setEditItem(null);
            setCurrentReport(null);
            setAttendanceReportData(null);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentModal === 'addStudent' && 'Add Student'}
                  {currentModal === 'editStudent' && 'Edit Student'}
                  {currentModal === 'addGrade' && 'Add Grade'}
                  {currentModal === 'editGrade' && 'Edit Grade'}
                  {currentModal === 'addAttendance' && 'Add Attendance'}
                  {currentModal === 'editAttendance' && 'Edit Attendance'}
                  {currentModal === 'bulkAttendance' && 'Bulk Attendance Entry'}
                  {currentModal === 'addAssignment' && 'Add Assignment'}
                  {currentModal === 'editAssignment' && 'Edit Assignment'}
                  {currentModal === 'reportPreview' && 'Student Progress Report'}
                  {currentModal === 'newMessage' && 'New Message'}
                  {currentModal === 'customReport' && 'Create Custom Report'}
                  {currentModal === 'attendanceReports' && 'Attendance Reports'}
                </h2>
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => {
                    setCurrentModal(null);
                    setEditItem(null);
                    setCurrentReport(null);
                    setAttendanceReportData(null);
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {(currentModal === 'addStudent' || currentModal === 'editStudent') && (
                <StudentForm defaultValues={editItem} />
              )}

              {(currentModal === 'addGrade' || currentModal === 'editGrade') && (
                <GradeForm defaultValues={editItem} />
              )}

              {(currentModal === 'addAttendance' || currentModal === 'editAttendance') && (
                <AttendanceForm defaultValues={editItem} />
              )}
              
              {currentModal === 'bulkAttendance' && (
                <BulkAttendanceForm />
              )}

              {(currentModal === 'addAssignment' || currentModal === 'editAssignment') && (
                <AssignmentForm defaultValues={editItem} />
              )}
              
              {currentModal === 'newMessage' && (
                <MessageForm studentId={selectedStudent?.id} />
              )}
              
              {currentModal === 'customReport' && (
                <CustomReportForm />
              )}
              
              {currentModal === 'attendanceReports' && (
                attendanceReportData ? (
                  <div>
                    <div ref={attendanceReportRef} className={styles.attendanceReportContainer}>
                      <div className={styles.reportHeader}>
                        <h1>Attendance Report - {attendanceReportData.type.charAt(0).toUpperCase() + attendanceReportData.type.slice(1)}</h1>
                        <p className={styles.reportDate}>Generated on: {formatDate(new Date().toISOString())}</p>
                        <p className={styles.reportDateRange}>Period: {formatDate(attendanceReportData.dateRange.start)} to {formatDate(attendanceReportData.dateRange.end)}</p>
                      </div>
                      
                      <div className={styles.reportSection}>
                        <h2>Summary Statistics</h2>
                        <div className={styles.summaryGrid}>
                          <div className={styles.summaryCard}>
                            <h3>Total Days</h3>
                            <div className={styles.summaryValue}>{attendanceReportData.summary.totalDays}</div>
                          </div>
                          <div className={styles.summaryCard}>
                            <h3>Average Present</h3>
                            <div className={styles.summaryValue}>{attendanceReportData.summary.averagePresent.toFixed(1)}</div>
                          </div>
                          <div className={styles.summaryCard}>
                            <h3>Average Absent</h3>
                            <div className={styles.summaryValue}>{attendanceReportData.summary.averageAbsent.toFixed(1)}</div>
                          </div>
                          <div className={styles.summaryCard}>
                            <h3>Average Late</h3>
                            <div className={styles.summaryValue}>{attendanceReportData.summary.averageLate.toFixed(1)}</div>
                          </div>
                          <div className={styles.summaryCard}>
                            <h3>Average Excused</h3>
                            <div className={styles.summaryValue}>{attendanceReportData.summary.averageExcused.toFixed(1)}</div>
                          </div>
                          <div className={styles.summaryCard}>
                            <h3>Overall Attendance Rate</h3>
                            <div className={styles.summaryValue}>{attendanceReportData.summary.overallAttendanceRate.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      {attendanceReportData.data.length > 0 && (
                        <div className={styles.reportSection}>
                          <h2>Daily Breakdown</h2>
                          <table className={styles.reportTable}>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Total Students</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Late</th>
                                <th>Excused</th>
                                <th>Attendance Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceReportData.data.map(day => (
                                <tr key={day.date}>
                                  <td>{formatDate(day.date)}</td>
                                  <td>{day.totalStudents}</td>
                                  <td className={styles.statusPresent}>{day.present}</td>
                                  <td className={styles.statusAbsent}>{day.absent}</td>
                                  <td className={styles.statusLate}>{day.late}</td>
                                  <td className={styles.statusExcused}>{day.excused}</td>
                                  <td>{day.presentRate.toFixed(1)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {attendanceReportData.data.length > 1 && (
                        <div className={styles.reportSection}>
                          <h2>Attendance Trends</h2>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={attendanceReportData.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                                <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
                                <Line type="monotone" dataKey="excused" stroke="#6366f1" name="Excused" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-center gap-2">
                      <button 
                        className="btn btn-secondary flex items-center gap-2"
                        onClick={() => setAttendanceReportData(null)}
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to Report Options
                      </button>
                      <button 
                        className="btn btn-primary flex items-center gap-2"
                        onClick={downloadAttendanceReportAsPDF}
                      >
                        <Download className="h-4 w-4" /> Download Report as PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <AttendanceReportsModal />
                )
              )}

              {currentModal === 'reportPreview' && currentReport && (
                <div>
                  <div ref={reportRef} className={styles.reportContainer}>
                    <div className={styles.reportHeader}>
                      <h1>{currentReport.studentName} - Progress Report</h1>
                      <p className={styles.reportDate}>Generated on: {formatDate(currentReport.generatedDate)}</p>
                      {(currentReport as any)?.name && (
                        <p className={styles.reportName}>Report Name: {(currentReport as any).name}</p>
                      )}
                      {currentReport.dateRange && (
                        <p className={styles.reportDateRange}>Date Range: {formatDate(currentReport.dateRange.start)} to {formatDate(currentReport.dateRange.end)}</p>
                      )}
                    </div>
                    
                    <div className={styles.reportSection}>
                      <h2>Overall Progress Summary</h2>
                      <div className={styles.progressCard}>
                        <div className={styles.progressItem}>
                          <h3>Grade Average</h3>
                          <div className={styles.progressValue}>
                            <span className={getScoreClassName(currentReport.gradeAverage)}>
                              {currentReport.gradeAverage.toFixed(1)}
                            </span>
                            <span className={styles.progressLabel}>/ 100</span>
                          </div>
                        </div>
                        
                        <div className={styles.progressItem}>
                          <h3>Attendance Rate</h3>
                          <div className={styles.progressValue}>
                            <span className={getAttendanceClassName(currentReport.attendanceRate)}>
                              {currentReport.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.progressItem}>
                          <h3>Overall Progress</h3>
                          <div className={styles.progressValue}>
                            <span className={getProgressClassName(currentReport.overallProgress)}>
                              {currentReport.overallProgress.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.reportSection}>
                      <h2>Grade Details</h2>
                      {currentReport.grades.length > 0 ? (
                        <table className={styles.reportTable}>
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Score</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentReport.grades.map(grade => (
                              <tr key={grade.id}>
                                <td>{grade.subject}</td>
                                <td className={getScoreClassName(grade.score)}>{grade.score}</td>
                                <td>{formatDate(grade.date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className={styles.emptyMessage}>No grades recorded</p>
                      )}
                    </div>
                    
                    <div className={styles.reportSection}>
                      <h2>Attendance Summary</h2>
                      {currentReport.attendance.length > 0 ? (
                        <div>
                          <div className={styles.attendanceSummary}>
                            <div>
                              <span className={styles.attendanceLabel}>Present:</span> 
                              <span className={styles.attendanceCount}>
                                {currentReport.attendance.filter(a => a.status === 'present').length}
                              </span>
                            </div>
                            <div>
                              <span className={styles.attendanceLabel}>Absent:</span> 
                              <span className={styles.attendanceCount}>
                                {currentReport.attendance.filter(a => a.status === 'absent').length}
                              </span>
                            </div>
                            <div>
                              <span className={styles.attendanceLabel}>Late:</span> 
                              <span className={styles.attendanceCount}>
                                {currentReport.attendance.filter(a => a.status === 'late').length}
                              </span>
                            </div>
                            <div>
                              <span className={styles.attendanceLabel}>Excused:</span> 
                              <span className={styles.attendanceCount}>
                                {currentReport.attendance.filter(a => a.status === 'excused').length}
                              </span>
                            </div>
                          </div>
                          
                          <table className={styles.reportTable}>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentReport.attendance.map(record => (
                                <tr key={record.id}>
                                  <td>{formatDate(record.date)}</td>
                                  <td className={getAttendanceStatusClassName(record.status)}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </td>
                                  <td>{record.notes || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={styles.emptyMessage}>No attendance records</p>
                      )}
                    </div>
                    
                    <div className={styles.reportSection}>
                      <h2>Assignment Progress</h2>
                      {currentReport.assignments.length > 0 ? (
                        <table className={styles.reportTable}>
                          <thead>
                            <tr>
                              <th>Assignment</th>
                              <th>Due Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentReport.assignments.map(({ assignment, completion }) => (
                              <tr key={assignment.id}>
                                <td>{assignment.title}</td>
                                <td>{formatDate(assignment.dueDate)}</td>
                                <td className={getCompletionStatusClassName(completion.status)}>
                                  {formatStatus(completion.status)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className={styles.emptyMessage}>No assignments</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <button 
                      className="btn btn-primary flex items-center gap-2"
                      onClick={downloadReportAsPDF}
                    >
                      <Download className="h-4 w-4" /> Download Report as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for styling
const getScoreClass = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (score >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  if (score >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

const getStatusClass = (status: string): string => {
  if (status === 'present') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status === 'late') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  if (status === 'excused') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

const getStatusColorClass = (value: number): string => {
  if (value >= 90) return 'text-green-600 dark:text-green-400';
  if (value >= 80) return 'text-blue-600 dark:text-blue-400';
  if (value >= 70) return 'text-yellow-600 dark:text-yellow-400';
  if (value >= 60) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

const getCompletionClass = (status: string): string => {
  if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': return 'In Progress';
    case 'not-started': return 'Not Started';
    default: return status;
  }
};

// Helper functions for report styling
const getScoreClassName = (score: number): string => {
  if (score >= 90) return styles.scoreA;
  if (score >= 80) return styles.scoreB;
  if (score >= 70) return styles.scoreC;
  if (score >= 60) return styles.scoreD;
  return styles.scoreF;
};

const getAttendanceClassName = (rate: number): string => {
  if (rate >= 90) return styles.attendanceExcellent;
  if (rate >= 80) return styles.attendanceGood;
  if (rate >= 70) return styles.attendanceAverage;
  if (rate >= 60) return styles.attendancePoor;
  return styles.attendanceCritical;
};

const getProgressClassName = (progress: number): string => {
  if (progress >= 90) return styles.progressExcellent;
  if (progress >= 80) return styles.progressGood;
  if (progress >= 70) return styles.progressAverage;
  if (progress >= 60) return styles.progressPoor;
  return styles.progressCritical;
};

const getAttendanceStatusClassName = (status: string): string => {
  if (status === 'present') return styles.statusPresent;
  if (status === 'late') return styles.statusLate;
  if (status === 'excused') return styles.statusExcused;
  return styles.statusAbsent;
};

const getCompletionStatusClassName = (status: string): string => {
  if (status === 'completed') return styles.statusCompleted;
  if (status === 'in-progress') return styles.statusInProgress;
  return styles.statusNotStarted;
};

export default App;