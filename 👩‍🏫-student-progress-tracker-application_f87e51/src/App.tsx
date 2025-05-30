import React, { useState, useEffect, useRef } from 'react';
import { User, UserPlus, Edit, Trash2, Calendar, BookOpen, TrendingUp, Award, Search, Filter, Download, Menu, X, Sun, Moon, Plus, Check, Clock, AlertCircle, BarChart3, PieChart as LucidePieChart, FileText, Users, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  dateAdded: string;
  avatar?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  subject: string;
  createdDate: string;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  feedback?: string;
  submittedDate: string;
}

interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

type TabType = 'dashboard' | 'students' | 'assignments' | 'grades' | 'attendance' | 'reports';

interface StudentProgress {
  studentId: string;
  studentName: string;
  averageGrade: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  totalAssignments: number;
}

const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Main state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // Modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState<boolean>(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  
  // Form states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize data from localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedStudents = localStorage.getItem('teacherApp_students');
      const savedAssignments = localStorage.getItem('teacherApp_assignments');
      const savedGrades = localStorage.getItem('teacherApp_grades');
      const savedAttendance = localStorage.getItem('teacherApp_attendance');
      
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        // Initialize with sample data
        const sampleStudents: Student[] = [
          { id: '1', name: 'Alice Johnson', email: 'alice.j@email.com', grade: '10th', dateAdded: '2024-01-15' },
          { id: '2', name: 'Bob Smith', email: 'bob.s@email.com', grade: '10th', dateAdded: '2024-01-16' },
          { id: '3', name: 'Carol Davis', email: 'carol.d@email.com', grade: '10th', dateAdded: '2024-01-17' },
          { id: '4', name: 'David Wilson', email: 'david.w@email.com', grade: '10th', dateAdded: '2024-01-18' }
        ];
        setStudents(sampleStudents);
        localStorage.setItem('teacherApp_students', JSON.stringify(sampleStudents));
      }
      
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      } else {
        // Initialize with sample data
        const sampleAssignments: Assignment[] = [
          { id: '1', title: 'Math Quiz 1', description: 'Basic algebra problems', dueDate: '2024-12-30', maxPoints: 100, subject: 'Mathematics', createdDate: '2024-12-20' },
          { id: '2', title: 'Science Project', description: 'Research on renewable energy', dueDate: '2025-01-15', maxPoints: 150, subject: 'Science', createdDate: '2024-12-21' },
          { id: '3', title: 'English Essay', description: 'Write about your favorite book', dueDate: '2025-01-10', maxPoints: 100, subject: 'English', createdDate: '2024-12-22' }
        ];
        setAssignments(sampleAssignments);
        localStorage.setItem('teacherApp_assignments', JSON.stringify(sampleAssignments));
      }
      
      if (savedGrades) {
        setGrades(JSON.parse(savedGrades));
      } else {
        // Initialize with sample data
        const sampleGrades: Grade[] = [
          { id: '1', studentId: '1', assignmentId: '1', score: 85, feedback: 'Good work!', submittedDate: '2024-12-25' },
          { id: '2', studentId: '2', assignmentId: '1', score: 92, feedback: 'Excellent!', submittedDate: '2024-12-25' },
          { id: '3', studentId: '3', assignmentId: '1', score: 78, feedback: 'Needs improvement', submittedDate: '2024-12-26' },
          { id: '4', studentId: '1', assignmentId: '3', score: 88, feedback: 'Well written', submittedDate: '2024-12-28' }
        ];
        setGrades(sampleGrades);
        localStorage.setItem('teacherApp_grades', JSON.stringify(sampleGrades));
      }
      
      if (savedAttendance) {
        setAttendance(JSON.parse(savedAttendance));
      } else {
        // Initialize with sample data
        const sampleAttendance: Attendance[] = [
          { id: '1', studentId: '1', date: '2024-12-23', status: 'present' },
          { id: '2', studentId: '2', date: '2024-12-23', status: 'present' },
          { id: '3', studentId: '3', date: '2024-12-23', status: 'late' },
          { id: '4', studentId: '4', date: '2024-12-23', status: 'absent' },
          { id: '5', studentId: '1', date: '2024-12-24', status: 'present' },
          { id: '6', studentId: '2', date: '2024-12-24', status: 'present' },
          { id: '7', studentId: '3', date: '2024-12-24', status: 'present' },
          { id: '8', studentId: '4', date: '2024-12-24', status: 'excused' }
        ];
        setAttendance(sampleAttendance);
        localStorage.setItem('teacherApp_attendance', JSON.stringify(sampleAttendance));
      }
    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Theme management
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
    localStorage.setItem('teacherApp_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('teacherApp_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('teacherApp_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('teacherApp_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Modal management with Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Utility functions
  const closeAllModals = () => {
    setIsStudentModalOpen(false);
    setIsAssignmentModalOpen(false);
    setIsGradeModalOpen(false);
    setIsAttendanceModalOpen(false);
    setEditingStudent(null);
    setEditingAssignment(null);
    setEditingGrade(null);
    document.body.classList.remove('modal-open');
  };

  const openModal = (modalType: 'student' | 'assignment' | 'grade' | 'attendance') => {
    document.body.classList.add('modal-open');
    switch (modalType) {
      case 'student':
        setIsStudentModalOpen(true);
        break;
      case 'assignment':
        setIsAssignmentModalOpen(true);
        break;
      case 'grade':
        setIsGradeModalOpen(true);
        break;
      case 'attendance':
        setIsAttendanceModalOpen(true);
        break;
    }
  };

  // Student CRUD operations
  const handleAddStudent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        grade: formData.get('grade') as string,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setStudents(prev => [...prev, newStudent]);
      closeAllModals();
    } catch (err) {
      setError('Failed to add student');
    }
  };

  const handleEditStudent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingStudent) return;
    
    try {
      const formData = new FormData(event.currentTarget);
      const updatedStudent: Student = {
        ...editingStudent,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        grade: formData.get('grade') as string
      };
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? updatedStudent : s));
      closeAllModals();
    } catch (err) {
      setError('Failed to update student');
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    try {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      // Also remove related data
      setGrades(prev => prev.filter(g => g.studentId !== studentId));
      setAttendance(prev => prev.filter(a => a.studentId !== studentId));
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  // Assignment CRUD operations
  const handleAddAssignment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        dueDate: formData.get('dueDate') as string,
        maxPoints: Number(formData.get('maxPoints')),
        subject: formData.get('subject') as string,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setAssignments(prev => [...prev, newAssignment]);
      closeAllModals();
    } catch (err) {
      setError('Failed to add assignment');
    }
  };

  const handleEditAssignment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAssignment) return;
    
    try {
      const formData = new FormData(event.currentTarget);
      const updatedAssignment: Assignment = {
        ...editingAssignment,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        dueDate: formData.get('dueDate') as string,
        maxPoints: Number(formData.get('maxPoints')),
        subject: formData.get('subject') as string
      };
      setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? updatedAssignment : a));
      closeAllModals();
    } catch (err) {
      setError('Failed to update assignment');
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    try {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      // Also remove related grades
      setGrades(prev => prev.filter(g => g.assignmentId !== assignmentId));
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  // Grade CRUD operations
  const handleAddGrade = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const newGrade: Grade = {
        id: Date.now().toString(),
        studentId: formData.get('studentId') as string,
        assignmentId: formData.get('assignmentId') as string,
        score: Number(formData.get('score')),
        feedback: formData.get('feedback') as string,
        submittedDate: new Date().toISOString().split('T')[0]
      };
      setGrades(prev => [...prev, newGrade]);
      closeAllModals();
    } catch (err) {
      setError('Failed to add grade');
    }
  };

  const handleEditGrade = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingGrade) return;
    
    try {
      const formData = new FormData(event.currentTarget);
      const updatedGrade: Grade = {
        ...editingGrade,
        studentId: formData.get('studentId') as string,
        assignmentId: formData.get('assignmentId') as string,
        score: Number(formData.get('score')),
        feedback: formData.get('feedback') as string
      };
      setGrades(prev => prev.map(g => g.id === editingGrade.id ? updatedGrade : g));
      closeAllModals();
    } catch (err) {
      setError('Failed to update grade');
    }
  };

  const handleDeleteGrade = (gradeId: string) => {
    try {
      setGrades(prev => prev.filter(g => g.id !== gradeId));
    } catch (err) {
      setError('Failed to delete grade');
    }
  };

  // Attendance operations
  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      const existingRecord = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
      
      if (existingRecord) {
        setAttendance(prev => prev.map(a => 
          a.id === existingRecord.id ? { ...a, status } : a
        ));
      } else {
        const newAttendance: Attendance = {
          id: Date.now().toString(),
          studentId,
          date: selectedDate,
          status
        };
        setAttendance(prev => [...prev, newAttendance]);
      }
    } catch (err) {
      setError('Failed to mark attendance');
    }
  };

  // Data calculations
  const getStudentProgress = (): StudentProgress[] => {
    return students?.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      const averageGrade = studentGrades.length > 0 
        ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length 
        : 0;
      
      const studentAttendance = attendance.filter(a => a.studentId === student.id);
      const presentCount = studentAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = studentAttendance.length > 0 
        ? (presentCount / studentAttendance.length) * 100 
        : 0;
      
      return {
        studentId: student.id,
        studentName: student.name,
        averageGrade: Math.round(averageGrade),
        attendanceRate: Math.round(attendanceRate),
        assignmentsCompleted: studentGrades.length,
        totalAssignments: assignments.length
      };
    }) ?? [];
  };

  const getGradeDistribution = () => {
    const ranges = [
      { name: 'A (90-100)', min: 90, max: 100 },
      { name: 'B (80-89)', min: 80, max: 89 },
      { name: 'C (70-79)', min: 70, max: 79 },
      { name: 'D (60-69)', min: 60, max: 69 },
      { name: 'F (0-59)', min: 0, max: 59 }
    ];
    
    return ranges.map(range => ({
      name: range.name,
      count: grades.filter(g => g.score >= range.min && g.score <= range.max).length,
      fill: range.name.includes('A') ? '#10b981' : 
            range.name.includes('B') ? '#3b82f6' :
            range.name.includes('C') ? '#f59e0b' :
            range.name.includes('D') ? '#ef4444' : '#7c2d12'
    }));
  };

  const getAttendanceData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(date => {
      const dayAttendance = attendance.filter(a => a.date === date);
      const present = dayAttendance.filter(a => a.status === 'present').length;
      const absent = dayAttendance.filter(a => a.status === 'absent').length;
      const late = dayAttendance.filter(a => a.status === 'late').length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        present,
        absent,
        late
      };
    });
  };

  // Filter functions
  const getFilteredStudents = () => {
    return (students || []).filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = !filterGrade || student.grade === filterGrade;
      return matchesSearch && matchesGrade;
    });
  };

  const getFilteredAssignments = () => {
    return (assignments || []).filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !filterSubject || assignment.subject === filterSubject;
      return matchesSearch && matchesSubject;
    });
  };

  // Export functions
  const exportData = (type: 'students' | 'grades' | 'attendance') => {
    try {
      let csvContent = '';
      let filename = '';
      
      switch (type) {
        case 'students':
          csvContent = 'Name,Email,Grade,Date Added\n' +
            (students?.map(s => `${s.name},${s.email},${s.grade},${s.dateAdded}`) ?? []).join('\n');
          filename = 'students.csv';
          break;
        case 'grades':
          csvContent = 'Student,Assignment,Score,Feedback,Date\n' +
            (grades?.map(g => {
              const student = students.find(s => s.id === g.studentId);
              const assignment = assignments.find(a => a.id === g.assignmentId);
              return `${student?.name || 'Unknown'},${assignment?.title || 'Unknown'},${g.score},${g.feedback || ''},${g.submittedDate}`;
            }) ?? []).join('\n');
          filename = 'grades.csv';
          break;
        case 'attendance':
          csvContent = 'Student,Date,Status,Notes\n' +
            (attendance?.map(a => {
              const student = students.find(s => s.id === a.studentId);
              return `${student?.name || 'Unknown'},${a.date},${a.status},${a.notes || ''}`;
            }) ?? []).join('\n');
          filename = 'attendance.csv';
          break;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError('Failed to export data');
    }
  };

  // Render functions
  const renderDashboard = () => {
    const progressData = getStudentProgress();
    const gradeDistribution = getGradeDistribution();
    const attendanceData = getAttendanceData();
    const averageGrade = progressData.length > 0 
      ? Math.round(progressData.reduce((sum, p) => sum + p.averageGrade, 0) / progressData.length)
      : 0;
    const averageAttendance = progressData.length > 0
      ? Math.round(progressData.reduce((sum, p) => sum + p.attendanceRate, 0) / progressData.length)
      : 0;
    
    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Total Students</div>
                <div className="stat-value">{students.length}</div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Active Assignments</div>
                <div className="stat-value">{assignments.length}</div>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Average Grade</div>
                <div className="stat-value">{averageGrade}%</div>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Attendance Rate</div>
                <div className="stat-value">{averageAttendance}%</div>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Student Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="studentName" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageGrade" fill="#3b82f6" name="Average Grade" />
                <Bar dataKey="attendanceRate" fill="#10b981" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LucidePieChart className="w-5 h-5" />
              Grade Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => count > 0 ? `${name}: ${count}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Attendance (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
              <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    const filteredStudents = getFilteredStudents();
    
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Students ({filteredStudents.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => openModal('student')}
              className="btn btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
            <button
              onClick={() => exportData('students')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input w-full sm:w-auto"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="">All Grades</option>
            <option value="9th">9th Grade</option>
            <option value="10th">10th Grade</option>
            <option value="11th">11th Grade</option>
            <option value="12th">12th Grade</option>
          </select>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const studentGrades = grades.filter(g => g.studentId === student.id);
            const averageGrade = studentGrades.length > 0 
              ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
              : 0;
            
            return (
              <div key={student.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{student.grade}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        openModal('student');
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      aria-label="Edit student"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      aria-label="Delete student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-slate-300">{student.email}</p>
                  <div className="flex justify-between">
                    <span>Average Grade:</span>
                    <span className={`font-semibold ${averageGrade >= 90 ? 'text-green-600' : averageGrade >= 80 ? 'text-blue-600' : averageGrade >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {studentGrades.length > 0 ? `${averageGrade}%` : 'No grades'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignments:</span>
                    <span>{studentGrades.length}/{assignments.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            No students found matching your criteria.
          </div>
        )}
      </div>
    );
  };

  const renderAssignments = () => {
    const filteredAssignments = getFilteredAssignments();
    
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Assignments ({filteredAssignments.length})
          </h2>
          <button
            onClick={() => openModal('assignment')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Assignment
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assignments..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input w-full sm:w-auto"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="Art">Art</option>
          </select>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map(assignment => {
            const assignmentGrades = grades.filter(g => g.assignmentId === assignment.id);
            const averageScore = assignmentGrades.length > 0
              ? Math.round(assignmentGrades.reduce((sum, g) => sum + g.score, 0) / assignmentGrades.length)
              : 0;
            const isOverdue = new Date(assignment.dueDate) < new Date();
            
            return (
              <div key={assignment.id} className={`card ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      <div className="flex gap-2">
                        <span className="badge badge-info">{assignment.subject}</span>
                        {isOverdue && <span className="badge badge-error">Overdue</span>}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300 mb-2">{assignment.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      <span>Max Points: {assignment.maxPoints}</span>
                      <span>Submissions: {assignmentGrades.length}/{students.length}</span>
                      {assignmentGrades.length > 0 && (
                        <span>Average: {averageScore}%</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAssignment(assignment);
                        openModal('assignment');
                      }}
                      className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            No assignments found matching your criteria.
          </div>
        )}
      </div>
    );
  };

  const renderGrades = () => {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6" />
            Grades ({(grades || []).length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => openModal('grade')}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Grade
            </button>
            <button
              onClick={() => exportData('grades')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Grades Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header px-4 py-3">Student</th>
                <th className="table-header px-4 py-3">Assignment</th>
                <th className="table-header px-4 py-3">Score</th>
                <th className="table-header px-4 py-3">Percentage</th>
                <th className="table-header px-4 py-3">Grade</th>
                <th className="table-header px-4 py-3">Feedback</th>
                <th className="table-header px-4 py-3">Date</th>
                <th className="table-header px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {grades?.map(grade => {
                const student = students.find(s => s.id === grade.studentId);
                const assignment = assignments.find(a => a.id === grade.assignmentId);
                const percentage = assignment ? Math.round((grade.score / assignment.maxPoints) * 100) : 0;
                const letterGrade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
                
                return (
                  <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="table-cell px-4 py-3">{student?.name || 'Unknown'}</td>
                    <td className="table-cell px-4 py-3">{assignment?.title || 'Unknown'}</td>
                    <td className="table-cell px-4 py-3">{grade.score}/{assignment?.maxPoints || 'N/A'}</td>
                    <td className="table-cell px-4 py-3">{percentage}%</td>
                    <td className="table-cell px-4 py-3">
                      <span className={`badge ${
                        letterGrade === 'A' ? 'badge-success' :
                        letterGrade === 'B' ? 'badge-info' :
                        letterGrade === 'C' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {letterGrade}
                      </span>
                    </td>
                    <td className="table-cell px-4 py-3 max-w-xs truncate" title={grade.feedback}>
                      {grade.feedback || 'No feedback'}
                    </td>
                    <td className="table-cell px-4 py-3">
                      {new Date(grade.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="table-cell px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingGrade(grade);
                            openModal('grade');
                          }}
                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                          aria-label="Edit grade"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                          aria-label="Delete grade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(grades || []).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            No grades recorded yet. Start by adding some grades!
          </div>
        )}
      </div>
    );
  };

  const renderAttendance = () => {
    const attendanceForDate = attendance.filter(a => a.date === selectedDate);
    
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Attendance
          </h2>
          <div className="flex gap-2">
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={() => exportData('attendance')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Present</div>
            <div className="stat-value text-green-600">
              {attendanceForDate.filter(a => a.status === 'present').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Absent</div>
            <div className="stat-value text-red-600">
              {attendanceForDate.filter(a => a.status === 'absent').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Late</div>
            <div className="stat-value text-yellow-600">
              {attendanceForDate.filter(a => a.status === 'late').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Excused</div>
            <div className="stat-value text-blue-600">
              {attendanceForDate.filter(a => a.status === 'excused').length}
            </div>
          </div>
        </div>

        {/* Student Attendance List */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-3">
            {students?.map(student => {
              const attendanceRecord = attendanceForDate.find(a => a.studentId === student.id);
              const currentStatus = attendanceRecord?.status || null;
              
              return (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg dark:border-slate-600">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">{student.grade}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                      className={`btn btn-sm ${currentStatus === 'present' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                    >
                      <Check className="w-3 h-3" />
                      Present
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                      className={`btn btn-sm ${currentStatus === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                    >
                      <X className="w-3 h-3" />
                      Absent
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'late')}
                      className={`btn btn-sm ${currentStatus === 'late' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'}`}
                    >
                      <Clock className="w-3 h-3" />
                      Late
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'excused')}
                      className={`btn btn-sm ${currentStatus === 'excused' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      Excused
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const progressData = getStudentProgress();
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Student Progress Reports
        </h2>

        {/* Overall Class Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Class Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progressData.length > 0 
                  ? Math.round(progressData.reduce((sum, p) => sum + p.averageGrade, 0) / progressData.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Class Average Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progressData.length > 0
                  ? Math.round(progressData.reduce((sum, p) => sum + p.attendanceRate, 0) / progressData.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Class Attendance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progressData.length > 0
                  ? Math.round(progressData.reduce((sum, p) => sum + (p.assignmentsCompleted / p.totalAssignments * 100), 0) / progressData.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Assignment Completion</div>
            </div>
          </div>
        </div>

        {/* Individual Student Reports */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Individual Student Reports</h3>
          {progressData.map(progress => {
            const student = students.find(s => s.id === progress.studentId);
            if (!student) return null;
            
            return (
              <div key={progress.studentId} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{student.name}</h4>
                      <p className="text-gray-500 dark:text-slate-400">{student.grade} • {student.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0">
                    <span className={`badge text-lg px-3 py-1 ${progress.averageGrade >= 90 ? 'badge-success' : progress.averageGrade >= 80 ? 'badge-info' : progress.averageGrade >= 70 ? 'badge-warning' : 'badge-error'}`}>
                      {progress.averageGrade > 0 ? `${progress.averageGrade}%` : 'No grades'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{progress.averageGrade}%</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">Average Grade</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{progress.attendanceRate}%</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">Attendance Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {progress.assignmentsCompleted}/{progress.totalAssignments}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">Assignments Completed</div>
                  </div>
                </div>
                
                {/* Recent Grades */}
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Recent Grades</h5>
                  <div className="space-y-1">
                    {(grades?.filter(g => g.studentId === progress.studentId) ?? [])
                      .slice(-3)
                      .map(grade => {
                        const assignment = assignments.find(a => a.id === grade.assignmentId);
                        const percentage = assignment ? Math.round((grade.score / assignment.maxPoints) * 100) : 0;
                        
                        return (
                          <div key={grade.id} className="flex justify-between items-center text-sm">
                            <span>{assignment?.title || 'Unknown Assignment'}</span>
                            <span className={`font-medium ${percentage >= 90 ? 'text-green-600' : percentage >= 80 ? 'text-blue-600' : percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {grade.score}/{assignment?.maxPoints} ({percentage}%)
                            </span>
                          </div>
                        );
                      })
                    }
                    {(grades?.filter(g => g.studentId === progress.studentId) ?? []).length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-slate-400">No grades recorded</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'students' as TabType, label: 'Students', icon: Users },
    { id: 'assignments' as TabType, label: 'Assignments', icon: BookOpen },
    { id: 'grades' as TabType, label: 'Grades', icon: Award },
    { id: 'attendance' as TabType, label: 'Attendance', icon: Calendar },
    { id: 'reports' as TabType, label: 'Reports', icon: FileText }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading your classroom data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-transform duration-300 ease-in-out theme-transition`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pt-5 pb-4">
              <nav className="px-3 space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                        setSearchTerm('');
                        setFilterGrade('');
                        setFilterSubject('');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === item.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="container-fluid py-6">
            {error && (
              <div className="alert alert-error mb-6">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'assignments' && renderAssignments()}
            {activeTab === 'grades' && renderGrades()}
            {activeTab === 'attendance' && renderAttendance()}
            {activeTab === 'reports' && renderReports()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {(isStudentModalOpen || isAssignmentModalOpen || isGradeModalOpen || isAttendanceModalOpen) && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Student Modal */}
            {isStudentModalOpen && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </h3>
                  <button
                    onClick={closeAllModals}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={editingStudent ? handleEditStudent : handleAddStudent} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="student-name">Full Name</label>
                    <input
                      id="student-name"
                      name="name"
                      type="text"
                      required
                      className="input"
                      defaultValue={editingStudent?.name || ''}
                      placeholder="Enter student's full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="student-email">Email Address</label>
                    <input
                      id="student-email"
                      name="email"
                      type="email"
                      required
                      className="input"
                      defaultValue={editingStudent?.email || ''}
                      placeholder="Enter student's email"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="student-grade">Grade Level</label>
                    <select
                      id="student-grade"
                      name="grade"
                      required
                      className="input"
                      defaultValue={editingStudent?.grade || ''}
                    >
                      <option value="">Select Grade</option>
                      <option value="9th">9th Grade</option>
                      <option value="10th">10th Grade</option>
                      <option value="11th">11th Grade</option>
                      <option value="12th">12th Grade</option>
                    </select>
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingStudent ? 'Update Student' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Assignment Modal */}
            {isAssignmentModalOpen && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
                  </h3>
                  <button
                    onClick={closeAllModals}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={editingAssignment ? handleEditAssignment : handleAddAssignment} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignment-title">Assignment Title</label>
                    <input
                      id="assignment-title"
                      name="title"
                      type="text"
                      required
                      className="input"
                      defaultValue={editingAssignment?.title || ''}
                      placeholder="Enter assignment title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignment-description">Description</label>
                    <textarea
                      id="assignment-description"
                      name="description"
                      rows={3}
                      className="input"
                      defaultValue={editingAssignment?.description || ''}
                      placeholder="Describe the assignment"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignment-subject">Subject</label>
                      <select
                        id="assignment-subject"
                        name="subject"
                        required
                        className="input"
                        defaultValue={editingAssignment?.subject || ''}
                      >
                        <option value="">Select Subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Art">Art</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignment-points">Max Points</label>
                      <input
                        id="assignment-points"
                        name="maxPoints"
                        type="number"
                        required
                        min="1"
                        className="input"
                        defaultValue={editingAssignment?.maxPoints || ''}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignment-due">Due Date</label>
                    <input
                      id="assignment-due"
                      name="dueDate"
                      type="date"
                      required
                      className="input"
                      defaultValue={editingAssignment?.dueDate || ''}
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Grade Modal */}
            {isGradeModalOpen && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingGrade ? 'Edit Grade' : 'Add New Grade'}
                  </h3>
                  <button
                    onClick={closeAllModals}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={editingGrade ? handleEditGrade : handleAddGrade} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="grade-student">Student</label>
                      <select
                        id="grade-student"
                        name="studentId"
                        required
                        className="input"
                        defaultValue={editingGrade?.studentId || ''}
                      >
                        <option value="">Select Student</option>
                        {students?.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="grade-assignment">Assignment</label>
                      <select
                        id="grade-assignment"
                        name="assignmentId"
                        required
                        className="input"
                        defaultValue={editingGrade?.assignmentId || ''}
                      >
                        <option value="">Select Assignment</option>
                        {assignments?.map(assignment => (
                          <option key={assignment.id} value={assignment.id}>
                            {assignment.title} ({assignment.maxPoints} pts)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="grade-score">Score</label>
                    <input
                      id="grade-score"
                      name="score"
                      type="number"
                      required
                      min="0"
                      className="input"
                      defaultValue={editingGrade?.score || ''}
                      placeholder="Enter score"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="grade-feedback">Feedback (Optional)</label>
                    <textarea
                      id="grade-feedback"
                      name="feedback"
                      rows={3}
                      className="input"
                      defaultValue={editingGrade?.feedback || ''}
                      placeholder="Provide feedback to the student"
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingGrade ? 'Update Grade' : 'Add Grade'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
