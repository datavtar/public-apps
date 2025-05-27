import React, { useState, useEffect } from 'react';
import { User, UserPlus, GraduationCap, Calendar, FileText, MessageCircle, BarChart, Edit, Trash2, Plus, Check, X, Search, Filter, Download, Moon, Sun, Eye, Mail, Phone } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// Types and Interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  enrollmentDate: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}

interface Grade {
  id: string;
  studentId: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
  feedback: string;
}

interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  status: 'active' | 'completed' | 'overdue';
}

interface Communication {
  id: string;
  studentId: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string;
  message: string;
  date: string;
  recipient: 'student' | 'parent' | 'both';
}

type TabType = 'students' | 'grades' | 'attendance' | 'assignments' | 'communication' | 'reports';

const App: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);

  // Modal States
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);

  // Edit States
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form States
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [gradeForm, setGradeForm] = useState<Partial<Grade>>({});
  const [attendanceForm, setAttendanceForm] = useState<Partial<Attendance>>({});
  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({});
  const [communicationForm, setCommunicationForm] = useState<Partial<Communication>>({});

  // Initialize with sample data
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedGrades = localStorage.getItem('grades');
    const savedAttendance = localStorage.getItem('attendance');
    const savedAssignments = localStorage.getItem('assignments');
    const savedCommunications = localStorage.getItem('communications');

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      const sampleStudents: Student[] = [
        {
          id: '1',
          name: 'Emma Johnson',
          email: 'emma.johnson@email.com',
          phone: '555-0101',
          grade: '10th',
          enrollmentDate: '2024-09-01',
          parentName: 'Michael Johnson',
          parentEmail: 'michael.johnson@email.com',
          parentPhone: '555-0102'
        },
        {
          id: '2',
          name: 'Liam Smith',
          email: 'liam.smith@email.com',
          phone: '555-0201',
          grade: '10th',
          enrollmentDate: '2024-09-01',
          parentName: 'Sarah Smith',
          parentEmail: 'sarah.smith@email.com',
          parentPhone: '555-0202'
        },
        {
          id: '3',
          name: 'Sophia Davis',
          email: 'sophia.davis@email.com',
          phone: '555-0301',
          grade: '11th',
          enrollmentDate: '2024-09-01',
          parentName: 'David Davis',
          parentEmail: 'david.davis@email.com',
          parentPhone: '555-0302'
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('students', JSON.stringify(sampleStudents));
    }

    if (savedGrades) {
      setGrades(JSON.parse(savedGrades));
    } else {
      const sampleGrades: Grade[] = [
        {
          id: '1',
          studentId: '1',
          subject: 'Mathematics',
          assignment: 'Algebra Quiz 1',
          score: 85,
          maxScore: 100,
          date: '2024-11-15',
          feedback: 'Good work on problem solving!'
        },
        {
          id: '2',
          studentId: '1',
          subject: 'English',
          assignment: 'Essay on Literature',
          score: 92,
          maxScore: 100,
          date: '2024-11-20',
          feedback: 'Excellent analysis and writing style.'
        },
        {
          id: '3',
          studentId: '2',
          subject: 'Mathematics',
          assignment: 'Algebra Quiz 1',
          score: 78,
          maxScore: 100,
          date: '2024-11-15',
          feedback: 'Need to review basic concepts.'
        }
      ];
      setGrades(sampleGrades);
      localStorage.setItem('grades', JSON.stringify(sampleGrades));
    }

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    } else {
      const sampleAttendance: Attendance[] = [
        {
          id: '1',
          studentId: '1',
          date: '2024-12-01',
          status: 'present',
          notes: ''
        },
        {
          id: '2',
          studentId: '2',
          date: '2024-12-01',
          status: 'late',
          notes: 'Arrived 10 minutes late'
        },
        {
          id: '3',
          studentId: '3',
          date: '2024-12-01',
          status: 'absent',
          notes: 'Sick day'
        }
      ];
      setAttendance(sampleAttendance);
      localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
    }

    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    } else {
      const sampleAssignments: Assignment[] = [
        {
          id: '1',
          title: 'History Research Project',
          subject: 'History',
          description: 'Research and write a 5-page paper on World War II',
          dueDate: '2024-12-20',
          totalPoints: 100,
          status: 'active'
        },
        {
          id: '2',
          title: 'Science Lab Report',
          subject: 'Science',
          description: 'Complete lab report on chemical reactions',
          dueDate: '2024-12-15',
          totalPoints: 50,
          status: 'active'
        }
      ];
      setAssignments(sampleAssignments);
      localStorage.setItem('assignments', JSON.stringify(sampleAssignments));
    }

    if (savedCommunications) {
      setCommunications(JSON.parse(savedCommunications));
    } else {
      const sampleCommunications: Communication[] = [
        {
          id: '1',
          studentId: '1',
          type: 'email',
          subject: 'Progress Update',
          message: 'Emma is doing well in all subjects. Keep up the good work!',
          date: '2024-11-25',
          recipient: 'parent'
        },
        {
          id: '2',
          studentId: '2',
          type: 'phone',
          subject: 'Attendance Concern',
          message: 'Called to discuss recent absences and make up work.',
          date: '2024-11-28',
          recipient: 'parent'
        }
      ];
      setCommunications(sampleCommunications);
      localStorage.setItem('communications', JSON.stringify(sampleCommunications));
    }
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('communications', JSON.stringify(communications));
  }, [communications]);

  // Helper Functions
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAttendanceRate = (studentId: string): number => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    if (studentAttendance.length === 0) return 0;
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  };

  const getAverageGrade = (studentId: string): number => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    const average = studentGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / studentGrades.length;
    return Math.round(average);
  };

  // Modal Management
  const openModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    document.body.classList.add('modal-open');
    modalSetter(true);
  };

  const closeModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    document.body.classList.remove('modal-open');
    modalSetter(false);
  };

  const closeAllModals = () => {
    document.body.classList.remove('modal-open');
    setShowStudentModal(false);
    setShowGradeModal(false);
    setShowAttendanceModal(false);
    setShowAssignmentModal(false);
    setShowCommunicationModal(false);
    setEditingStudent(null);
    setEditingGrade(null);
    setEditingAttendance(null);
    setEditingAssignment(null);
    setEditingCommunication(null);
    setStudentForm({});
    setGradeForm({});
    setAttendanceForm({});
    setAssignmentForm({});
    setCommunicationForm({});
  };

  // Keyboard event handler for ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // CRUD Operations
  const handleAddStudent = () => {
    if (!studentForm.name || !studentForm.email || !studentForm.grade) return;
    
    const newStudent: Student = {
      id: generateId(),
      name: studentForm.name,
      email: studentForm.email,
      phone: studentForm.phone || '',
      grade: studentForm.grade,
      enrollmentDate: studentForm.enrollmentDate || new Date().toISOString().split('T')[0],
      parentName: studentForm.parentName || '',
      parentEmail: studentForm.parentEmail || '',
      parentPhone: studentForm.parentPhone || ''
    };
    
    setStudents([...students, newStudent]);
    closeAllModals();
  };

  const handleEditStudent = () => {
    if (!editingStudent || !studentForm.name || !studentForm.email || !studentForm.grade) return;
    
    const updatedStudent: Student = {
      ...editingStudent,
      name: studentForm.name,
      email: studentForm.email,
      phone: studentForm.phone || '',
      grade: studentForm.grade,
      enrollmentDate: studentForm.enrollmentDate || editingStudent.enrollmentDate,
      parentName: studentForm.parentName || '',
      parentEmail: studentForm.parentEmail || '',
      parentPhone: studentForm.parentPhone || ''
    };
    
    setStudents(students.map(s => s.id === editingStudent.id ? updatedStudent : s));
    closeAllModals();
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all related grades, attendance, and communications.')) {
      setStudents(students.filter(s => s.id !== id));
      setGrades(grades.filter(g => g.studentId !== id));
      setAttendance(attendance.filter(a => a.studentId !== id));
      setCommunications(communications.filter(c => c.studentId !== id));
    }
  };

  const handleAddGrade = () => {
    if (!gradeForm.studentId || !gradeForm.subject || !gradeForm.assignment || gradeForm.score === undefined || gradeForm.maxScore === undefined) return;
    
    const newGrade: Grade = {
      id: generateId(),
      studentId: gradeForm.studentId,
      subject: gradeForm.subject,
      assignment: gradeForm.assignment,
      score: gradeForm.score,
      maxScore: gradeForm.maxScore,
      date: gradeForm.date || new Date().toISOString().split('T')[0],
      feedback: gradeForm.feedback || ''
    };
    
    setGrades([...grades, newGrade]);
    closeAllModals();
  };

  const handleEditGrade = () => {
    if (!editingGrade || !gradeForm.studentId || !gradeForm.subject || !gradeForm.assignment || gradeForm.score === undefined || gradeForm.maxScore === undefined) return;
    
    const updatedGrade: Grade = {
      ...editingGrade,
      studentId: gradeForm.studentId,
      subject: gradeForm.subject,
      assignment: gradeForm.assignment,
      score: gradeForm.score,
      maxScore: gradeForm.maxScore,
      date: gradeForm.date || editingGrade.date,
      feedback: gradeForm.feedback || ''
    };
    
    setGrades(grades.map(g => g.id === editingGrade.id ? updatedGrade : g));
    closeAllModals();
  };

  const handleDeleteGrade = (id: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(g => g.id !== id));
    }
  };

  const handleAddAttendance = () => {
    if (!attendanceForm.studentId || !attendanceForm.date || !attendanceForm.status) return;
    
    const newAttendance: Attendance = {
      id: generateId(),
      studentId: attendanceForm.studentId,
      date: attendanceForm.date,
      status: attendanceForm.status,
      notes: attendanceForm.notes || ''
    };
    
    setAttendance([...attendance, newAttendance]);
    closeAllModals();
  };

  const handleEditAttendance = () => {
    if (!editingAttendance || !attendanceForm.studentId || !attendanceForm.date || !attendanceForm.status) return;
    
    const updatedAttendance: Attendance = {
      ...editingAttendance,
      studentId: attendanceForm.studentId,
      date: attendanceForm.date,
      status: attendanceForm.status,
      notes: attendanceForm.notes || ''
    };
    
    setAttendance(attendance.map(a => a.id === editingAttendance.id ? updatedAttendance : a));
    closeAllModals();
  };

  const handleDeleteAttendance = (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      setAttendance(attendance.filter(a => a.id !== id));
    }
  };

  const handleAddAssignment = () => {
    if (!assignmentForm.title || !assignmentForm.subject || !assignmentForm.dueDate || assignmentForm.totalPoints === undefined) return;
    
    const newAssignment: Assignment = {
      id: generateId(),
      title: assignmentForm.title,
      subject: assignmentForm.subject,
      description: assignmentForm.description || '',
      dueDate: assignmentForm.dueDate,
      totalPoints: assignmentForm.totalPoints,
      status: 'active'
    };
    
    setAssignments([...assignments, newAssignment]);
    closeAllModals();
  };

  const handleEditAssignment = () => {
    if (!editingAssignment || !assignmentForm.title || !assignmentForm.subject || !assignmentForm.dueDate || assignmentForm.totalPoints === undefined) return;
    
    const updatedAssignment: Assignment = {
      ...editingAssignment,
      title: assignmentForm.title,
      subject: assignmentForm.subject,
      description: assignmentForm.description || '',
      dueDate: assignmentForm.dueDate,
      totalPoints: assignmentForm.totalPoints,
      status: assignmentForm.status || editingAssignment.status
    };
    
    setAssignments(assignments.map(a => a.id === editingAssignment.id ? updatedAssignment : a));
    closeAllModals();
  };

  const handleDeleteAssignment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  const handleAddCommunication = () => {
    if (!communicationForm.studentId || !communicationForm.type || !communicationForm.subject || !communicationForm.message || !communicationForm.recipient) return;
    
    const newCommunication: Communication = {
      id: generateId(),
      studentId: communicationForm.studentId,
      type: communicationForm.type,
      subject: communicationForm.subject,
      message: communicationForm.message,
      date: communicationForm.date || new Date().toISOString().split('T')[0],
      recipient: communicationForm.recipient
    };
    
    setCommunications([...communications, newCommunication]);
    closeAllModals();
  };

  const handleEditCommunication = () => {
    if (!editingCommunication || !communicationForm.studentId || !communicationForm.type || !communicationForm.subject || !communicationForm.message || !communicationForm.recipient) return;
    
    const updatedCommunication: Communication = {
      ...editingCommunication,
      studentId: communicationForm.studentId,
      type: communicationForm.type,
      subject: communicationForm.subject,
      message: communicationForm.message,
      date: communicationForm.date || editingCommunication.date,
      recipient: communicationForm.recipient
    };
    
    setCommunications(communications.map(c => c.id === editingCommunication.id ? updatedCommunication : c));
    closeAllModals();
  };

  const handleDeleteCommunication = (id: string) => {
    if (window.confirm('Are you sure you want to delete this communication record?')) {
      setCommunications(communications.filter(c => c.id !== id));
    }
  };

  // Filtering and Search
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !filterGrade || student.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const filteredGrades = grades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.assignment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || grade.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const filteredAttendance = attendance.filter(record => {
    const student = students.find(s => s.id === record.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || assignment.subject === filterSubject;
    const matchesStatus = !filterStatus || assignment.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const filteredCommunications = communications.filter(comm => {
    const student = students.find(s => s.id === comm.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Export Functions
  const exportData = () => {
    const data = {
      students,
      grades,
      attendance,
      assignments,
      communications,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-progress-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Report Data
  const getGradeDistributionData = () => {
    const gradeCounts = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (0-59)': 0 };
    
    grades.forEach(grade => {
      const percentage = (grade.score / grade.maxScore) * 100;
      if (percentage >= 90) gradeCounts['A (90-100)']++;
      else if (percentage >= 80) gradeCounts['B (80-89)']++;
      else if (percentage >= 70) gradeCounts['C (70-79)']++;
      else if (percentage >= 60) gradeCounts['D (60-69)']++;
      else gradeCounts['F (0-59)']++;
    });
    
    return Object.entries(gradeCounts).map(([grade, count]) => ({ grade, count }));
  };

  const getAttendanceData = () => {
    const attendanceCounts = { present: 0, absent: 0, late: 0 };
    
    attendance.forEach(record => {
      attendanceCounts[record.status]++;
    });
    
    return Object.entries(attendanceCounts).map(([status, count]) => ({ status, count }));
  };

  const getSubjectPerformanceData = () => {
    const subjectGrades: { [key: string]: number[] } = {};
    
    grades.forEach(grade => {
      if (!subjectGrades[grade.subject]) {
        subjectGrades[grade.subject] = [];
      }
      subjectGrades[grade.subject].push((grade.score / grade.maxScore) * 100);
    });
    
    return Object.entries(subjectGrades).map(([subject, scores]) => ({
      subject,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }));
  };

  // Edit Modal Helpers
  const openEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setStudentForm(student);
    openModal(setShowStudentModal);
  };

  const openEditGradeModal = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeForm(grade);
    openModal(setShowGradeModal);
  };

  const openEditAttendanceModal = (record: Attendance) => {
    setEditingAttendance(record);
    setAttendanceForm(record);
    openModal(setShowAttendanceModal);
  };

  const openEditAssignmentModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm(assignment);
    openModal(setShowAssignmentModal);
  };

  const openEditCommunicationModal = (communication: Communication) => {
    setEditingCommunication(communication);
    setCommunicationForm(communication);
    openModal(setShowCommunicationModal);
  };

  // Color constants for charts
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Student Progress Tracker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportData}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                title="Export all data"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="container-wide">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'students', label: 'Students', icon: User },
              { id: 'grades', label: 'Grades', icon: GraduationCap },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'communication', label: 'Communication', icon: MessageCircle },
              { id: 'reports', label: 'Reports', icon: BarChart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          {/* Dynamic Filters */}
          {activeTab === 'students' && (
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="">All Grades</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          )}
          
          {(activeTab === 'grades' || activeTab === 'assignments') && (
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="Physical Education">Physical Education</option>
            </select>
          )}
          
          {(activeTab === 'attendance' || activeTab === 'assignments') && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="">All Status</option>
              {activeTab === 'attendance' && (
                <>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </>
              )}
              {activeTab === 'assignments' && (
                <>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </>
              )}
            </select>
          )}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="flex-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Students ({filteredStudents.length})</h2>
              <button
                onClick={() => {
                  setStudentForm({});
                  setEditingStudent(null);
                  openModal(setShowStudentModal);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Student
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <div key={student.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{student.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.grade}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditStudentModal(student)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit student"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{student.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">Enrolled: {formatDate(student.enrollmentDate)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Avg Grade:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{getAverageGrade(student.id)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Attendance:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{getAttendanceRate(student.id)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStudents.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No students found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div>
            <div className="flex-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grades ({filteredGrades.length})</h2>
              <button
                onClick={() => {
                  setGradeForm({});
                  setEditingGrade(null);
                  openModal(setShowGradeModal);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Grade
              </button>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Subject</th>
                    <th className="table-header">Assignment</th>
                    <th className="table-header">Score</th>
                    <th className="table-header">Percentage</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredGrades.map(grade => {
                    const percentage = Math.round((grade.score / grade.maxScore) * 100);
                    return (
                      <tr key={grade.id}>
                        <td className="table-cell font-medium">{getStudentName(grade.studentId)}</td>
                        <td className="table-cell">{grade.subject}</td>
                        <td className="table-cell">{grade.assignment}</td>
                        <td className="table-cell">{grade.score}/{grade.maxScore}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            percentage >= 90 ? 'badge-success' :
                            percentage >= 80 ? 'badge-info' :
                            percentage >= 70 ? 'badge-warning' : 'badge-error'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="table-cell">{formatDate(grade.date)}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditGradeModal(grade)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit grade"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete grade"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredGrades.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No grades found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div>
            <div className="flex-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance ({filteredAttendance.length})</h2>
              <button
                onClick={() => {
                  setAttendanceForm({});
                  setEditingAttendance(null);
                  openModal(setShowAttendanceModal);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Attendance
              </button>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Notes</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredAttendance.map(record => (
                    <tr key={record.id}>
                      <td className="table-cell font-medium">{getStudentName(record.studentId)}</td>
                      <td className="table-cell">{formatDate(record.date)}</td>
                      <td className="table-cell">
                        <span className={`badge ${
                          record.status === 'present' ? 'badge-success' :
                          record.status === 'late' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">{record.notes || '-'}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditAttendanceModal(record)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit attendance"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttendance(record.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete attendance"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAttendance.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No attendance records found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assignments ({filteredAssignments.length})</h2>
              <button
                onClick={() => {
                  setAssignmentForm({});
                  setEditingAssignment(null);
                  openModal(setShowAssignmentModal);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map(assignment => (
                <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.subject}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditAssignmentModal(assignment)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit assignment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{assignment.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-gray-400">Points:</span>
                      <span className="text-gray-900 dark:text-white">{assignment.totalPoints}</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`badge ${
                        assignment.status === 'active' ? 'badge-info' :
                        assignment.status === 'completed' ? 'badge-success' : 'badge-error'
                      }`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredAssignments.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No assignments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <div>
            <div className="flex-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Communication ({filteredCommunications.length})</h2>
              <button
                onClick={() => {
                  setCommunicationForm({});
                  setEditingCommunication(null);
                  openModal(setShowCommunicationModal);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Communication
              </button>
            </div>
            
            <div className="space-y-4">
              {filteredCommunications.map(comm => (
                <div key={comm.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        {comm.type === 'email' && <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        {comm.type === 'phone' && <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        {comm.type === 'meeting' && <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        {comm.type === 'note' && <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{comm.subject}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getStudentName(comm.studentId)} • {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} • {comm.recipient}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comm.date)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditCommunicationModal(comm)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit communication"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCommunication(comm.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete communication"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300">{comm.message}</p>
                </div>
              ))}
              
              {filteredCommunications.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No communications found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="stat-card">
                <div className="stat-title">Total Students</div>
                <div className="stat-value">{students.length}</div>
                <div className="stat-desc">Enrolled in system</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Average Grade</div>
                <div className="stat-value">
                  {grades.length > 0 ? Math.round(grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / grades.length) : 0}%
                </div>
                <div className="stat-desc">Across all subjects</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Attendance Rate</div>
                <div className="stat-value">
                  {attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%
                </div>
                <div className="stat-desc">Overall attendance</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Active Assignments</div>
                <div className="stat-value">{assignments.filter(a => a.status === 'active').length}</div>
                <div className="stat-desc">Currently active</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Grade Distribution Chart */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={getGradeDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="grade" 
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text-base)'
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Attendance Overview */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attendance Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getAttendanceData()}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {getAttendanceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text-base)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Subject Performance */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subject Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={getSubjectPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="subject" 
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text-base)'
                        }}
                      />
                      <Bar dataKey="average" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {[...grades, ...communications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {'score' in item ? <GraduationCap className="h-4 w-4 text-blue-600" /> : <MessageCircle className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {'score' in item ? `Grade: ${item.assignment}` : `Communication: ${item.subject}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getStudentName(item.studentId)} • {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-backdrop" onClick={() => closeAllModals()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => closeAllModals()} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    value={studentForm.name || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade *</label>
                  <select
                    value={studentForm.grade || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="9th">9th Grade</option>
                    <option value="10th">10th Grade</option>
                    <option value="11th">11th Grade</option>
                    <option value="12th">12th Grade</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={studentForm.email || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={studentForm.phone || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Enrollment Date</label>
                <input
                  type="date"
                  value={studentForm.enrollmentDate || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollmentDate: e.target.value })}
                  className="input"
                />
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Parent Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Parent Name</label>
                    <input
                      type="text"
                      value={studentForm.parentName || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Phone</label>
                    <input
                      type="tel"
                      value={studentForm.parentPhone || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Email</label>
                  <input
                    type="email"
                    value={studentForm.parentEmail || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => closeAllModals()} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={editingStudent ? handleEditStudent : handleAddStudent}
                className="btn btn-primary"
              >
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="modal-backdrop" onClick={() => closeAllModals()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingGrade ? 'Edit Grade' : 'Add New Grade'}
              </h3>
              <button onClick={() => closeAllModals()} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  value={gradeForm.studentId || ''}
                  onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    value={gradeForm.subject || ''}
                    onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Art">Art</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={gradeForm.date || ''}
                    onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Assignment Name *</label>
                <input
                  type="text"
                  value={gradeForm.assignment || ''}
                  onChange={(e) => setGradeForm({ ...gradeForm, assignment: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Score *</label>
                  <input
                    type="number"
                    min="0"
                    value={gradeForm.score || ''}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Score *</label>
                  <input
                    type="number"
                    min="1"
                    value={gradeForm.maxScore || ''}
                    onChange={(e) => setGradeForm({ ...gradeForm, maxScore: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Feedback</label>
                <textarea
                  value={gradeForm.feedback || ''}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Optional feedback for the student..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => closeAllModals()} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={editingGrade ? handleEditGrade : handleAddGrade}
                className="btn btn-primary"
              >
                {editingGrade ? 'Update Grade' : 'Add Grade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="modal-backdrop" onClick={() => closeAllModals()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingAttendance ? 'Edit Attendance' : 'Add Attendance Record'}
              </h3>
              <button onClick={() => closeAllModals()} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  value={attendanceForm.studentId || ''}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={attendanceForm.date || ''}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    value={attendanceForm.status || ''}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value as 'present' | 'absent' | 'late' })}
                    className="input"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={attendanceForm.notes || ''}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Optional notes about attendance..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => closeAllModals()} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={editingAttendance ? handleEditAttendance : handleAddAttendance}
                className="btn btn-primary"
              >
                {editingAttendance ? 'Update Attendance' : 'Add Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-backdrop" onClick={() => closeAllModals()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <button onClick={() => closeAllModals()} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={assignmentForm.title || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    value={assignmentForm.subject || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Art">Art</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Points *</label>
                  <input
                    type="number"
                    min="1"
                    value={assignmentForm.totalPoints || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, totalPoints: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                {editingAssignment && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={assignmentForm.status || 'active'}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value as 'active' | 'completed' | 'overdue' })}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={assignmentForm.description || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Assignment description and instructions..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => closeAllModals()} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={editingAssignment ? handleEditAssignment : handleAddAssignment}
                className="btn btn-primary"
              >
                {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommunicationModal && (
        <div className="modal-backdrop" onClick={() => closeAllModals()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingCommunication ? 'Edit Communication' : 'Add New Communication'}
              </h3>
              <button onClick={() => closeAllModals()} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  value={communicationForm.studentId || ''}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, studentId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    value={communicationForm.type || ''}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, type: e.target.value as 'email' | 'phone' | 'meeting' | 'note' })}
                    className="input"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recipient *</label>
                  <select
                    value={communicationForm.recipient || ''}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, recipient: e.target.value as 'student' | 'parent' | 'both' })}
                    className="input"
                    required
                  >
                    <option value="">Select Recipient</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={communicationForm.date || ''}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  value={communicationForm.subject || ''}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  value={communicationForm.message || ''}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, message: e.target.value })}
                  className="input"
                  rows={5}
                  placeholder="Communication message or notes..."
                  required
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => closeAllModals()} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={editingCommunication ? handleEditCommunication : handleAddCommunication}
                className="btn btn-primary"
              >
                {editingCommunication ? 'Update Communication' : 'Add Communication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12">
        <div className="container-wide">
          <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;