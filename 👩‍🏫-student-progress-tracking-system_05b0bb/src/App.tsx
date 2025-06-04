import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  UserPlus,
  GraduationCap,
  BarChart as LucideBarChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageCircle,
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Eye,
  Settings,
  Moon,
  Sun,
  Brain,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Star,
  Gauge
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  parentContact: string;
  profileImage?: string;
  totalAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  attendanceRate: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  maxPoints: number;
  type: 'homework' | 'quiz' | 'exam' | 'project';
  description: string;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  points: number;
  submittedDate: string;
  feedback: string;
  status: 'submitted' | 'late' | 'missing';
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'tardy' | 'excused';
  notes: string;
}

interface BehaviorNote {
  id: string;
  studentId: string;
  date: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  actionTaken: string;
}

interface CommunicationLog {
  id: string;
  studentId: string;
  date: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string;
  content: string;
  followUpRequired: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const SAMPLE_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    email: 'emma.johnson@school.edu',
    grade: '10A',
    enrollmentDate: '2024-09-01',
    parentContact: 'parent1@email.com',
    totalAssignments: 12,
    completedAssignments: 11,
    averageGrade: 92,
    attendanceRate: 96
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@school.edu',
    grade: '10A',
    enrollmentDate: '2024-09-01',
    parentContact: 'parent2@email.com',
    totalAssignments: 12,
    completedAssignments: 10,
    averageGrade: 87,
    attendanceRate: 92
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'sarah.williams@school.edu',
    grade: '10A',
    enrollmentDate: '2024-09-01',
    parentContact: 'parent3@email.com',
    totalAssignments: 12,
    completedAssignments: 12,
    averageGrade: 95,
    attendanceRate: 98
  },
  {
    id: '4',
    name: 'David Rodriguez',
    email: 'david.rodriguez@school.edu',
    grade: '10A',
    enrollmentDate: '2024-09-01',
    parentContact: 'parent4@email.com',
    totalAssignments: 12,
    completedAssignments: 8,
    averageGrade: 78,
    attendanceRate: 88
  }
];

const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Algebra Quiz 1',
    subject: 'Mathematics',
    dueDate: '2025-06-10',
    maxPoints: 100,
    type: 'quiz',
    description: 'Basic algebra concepts'
  },
  {
    id: '2',
    title: 'Science Project',
    subject: 'Science',
    dueDate: '2025-06-15',
    maxPoints: 150,
    type: 'project',
    description: 'Research on renewable energy'
  },
  {
    id: '3',
    title: 'History Essay',
    subject: 'History',
    dueDate: '2025-06-08',
    maxPoints: 100,
    type: 'homework',
    description: 'World War II analysis'
  }
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [behaviorNotes, setBehaviorNotes] = useState<BehaviorNote[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // AI Integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    grade: '',
    parentContact: ''
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: '',
    dueDate: '',
    maxPoints: 100,
    type: 'homework' as Assignment['type'],
    description: ''
  });
  
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    assignmentId: '',
    points: 0,
    feedback: '',
    status: 'submitted' as Grade['status']
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [students, assignments, grades, attendanceRecords, behaviorNotes, communicationLogs]);

  const loadData = () => {
    try {
      const savedStudents = localStorage.getItem('students');
      const savedAssignments = localStorage.getItem('assignments');
      const savedGrades = localStorage.getItem('grades');
      const savedAttendance = localStorage.getItem('attendanceRecords');
      const savedBehavior = localStorage.getItem('behaviorNotes');
      const savedCommunication = localStorage.getItem('communicationLogs');
      
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        setStudents(SAMPLE_STUDENTS);
      }
      
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      } else {
        setAssignments(SAMPLE_ASSIGNMENTS);
      }
      
      setGrades(savedGrades ? JSON.parse(savedGrades) : []);
      setAttendanceRecords(savedAttendance ? JSON.parse(savedAttendance) : []);
      setBehaviorNotes(savedBehavior ? JSON.parse(savedBehavior) : []);
      setCommunicationLogs(savedCommunication ? JSON.parse(savedCommunication) : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('students', JSON.stringify(students));
      localStorage.setItem('assignments', JSON.stringify(assignments));
      localStorage.setItem('grades', JSON.stringify(grades));
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
      localStorage.setItem('behaviorNotes', JSON.stringify(behaviorNotes));
      localStorage.setItem('communicationLogs', JSON.stringify(communicationLogs));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleAddStudent = () => {
    if (!studentForm.name.trim() || !studentForm.email.trim()) return;
    
    const newStudent: Student = {
      id: Date.now().toString(),
      name: studentForm.name,
      email: studentForm.email,
      grade: studentForm.grade,
      enrollmentDate: new Date().toISOString().split('T')[0],
      parentContact: studentForm.parentContact,
      totalAssignments: 0,
      completedAssignments: 0,
      averageGrade: 0,
      attendanceRate: 0
    };
    
    setStudents(prev => [...prev, newStudent]);
    setStudentForm({ name: '', email: '', grade: '', parentContact: '' });
    setShowStudentModal(false);
  };

  const handleEditStudent = () => {
    if (!editingStudent || !studentForm.name.trim()) return;
    
    setStudents(prev => prev.map(student => 
      student.id === editingStudent.id 
        ? { ...student, ...studentForm }
        : student
    ));
    
    setStudentForm({ name: '', email: '', grade: '', parentContact: '' });
    setEditingStudent(null);
    setShowStudentModal(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setGrades(prev => prev.filter(g => g.studentId !== studentId));
    setAttendanceRecords(prev => prev.filter(a => a.studentId !== studentId));
    setBehaviorNotes(prev => prev.filter(b => b.studentId !== studentId));
    setCommunicationLogs(prev => prev.filter(c => c.studentId !== studentId));
  };

  const handleAddAssignment = () => {
    if (!assignmentForm.title.trim()) return;
    
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: assignmentForm.title,
      subject: assignmentForm.subject,
      dueDate: assignmentForm.dueDate,
      maxPoints: assignmentForm.maxPoints,
      type: assignmentForm.type,
      description: assignmentForm.description
    };
    
    setAssignments(prev => [...prev, newAssignment]);
    setAssignmentForm({ title: '', subject: '', dueDate: '', maxPoints: 100, type: 'homework', description: '' });
    setShowAssignmentModal(false);
  };

  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    let finalPrompt = aiPrompt;
    if (!finalPrompt.trim() && selectedFile) {
      finalPrompt = `Analyze this educational document and extract relevant student data. Return JSON with keys "students", "assignments", "grades", "insights".`;
    }
    
    try {
      aiLayerRef.current?.sendToAI(finalPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const handleProcessAIResult = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      
      if (parsed.students && Array.isArray(parsed.students)) {
        const newStudents = parsed.students.map((s: any) => ({
          id: Date.now().toString() + Math.random(),
          name: s.name || '',
          email: s.email || '',
          grade: s.grade || '',
          enrollmentDate: new Date().toISOString().split('T')[0],
          parentContact: s.parentContact || '',
          totalAssignments: 0,
          completedAssignments: 0,
          averageGrade: s.averageGrade || 0,
          attendanceRate: s.attendanceRate || 0
        }));
        
        setStudents(prev => [...prev, ...newStudents]);
      }
      
      if (parsed.assignments && Array.isArray(parsed.assignments)) {
        const newAssignments = parsed.assignments.map((a: any) => ({
          id: Date.now().toString() + Math.random(),
          title: a.title || '',
          subject: a.subject || '',
          dueDate: a.dueDate || '',
          maxPoints: a.maxPoints || 100,
          type: a.type || 'homework',
          description: a.description || ''
        }));
        
        setAssignments(prev => [...prev, ...newAssignments]);
      }
    } catch (error) {
      console.error('Error processing AI result:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !filterGrade || student.grade === filterGrade;
    return matchesSearch && matchesGrade;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'grade':
        return a.averageGrade - b.averageGrade;
      case 'attendance':
        return a.attendanceRate - b.attendanceRate;
      default:
        return 0;
    }
  });

  const getGradeDistributionData = () => {
    const distribution = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (0-59)': 0 };
    
    students.forEach(student => {
      const grade = student.averageGrade;
      if (grade >= 90) distribution['A (90-100)']++;
      else if (grade >= 80) distribution['B (80-89)']++;
      else if (grade >= 70) distribution['C (70-79)']++;
      else if (grade >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getPerformanceTrendData = () => {
    return [
      { week: 'Week 1', average: 85 },
      { week: 'Week 2', average: 87 },
      { week: 'Week 3', average: 84 },
      { week: 'Week 4', average: 89 },
      { week: 'Week 5', average: 91 },
      { week: 'Week 6', average: 88 }
    ];
  };

  const downloadDataAsCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Grade', 'Average Grade', 'Attendance Rate', 'Completed Assignments'],
      ...students.map(student => [
        student.name,
        student.email,
        student.grade,
        student.averageGrade.toString(),
        student.attendanceRate.toString(),
        `${student.completedAssignments}/${student.totalAssignments}`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_progress_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setStudents([]);
      setAssignments([]);
      setGrades([]);
      setAttendanceRecords([]);
      setBehaviorNotes([]);
      setCommunicationLogs([]);
      localStorage.clear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowStudentModal(false);
      setShowAssignmentModal(false);
      setShowGradeModal(false);
      setShowSettingsModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" id="total-students-stat">
          <div className="stat-title">Total Students</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-desc flex items-center gap-1">
            <User className="w-4 h-4" />
            Active learners
          </div>
        </div>
        
        <div className="stat-card" id="avg-grade-stat">
          <div className="stat-title">Class Average</div>
          <div className="stat-value">
            {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length) : 0}%
          </div>
          <div className="stat-desc flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            +2% from last week
          </div>
        </div>
        
        <div className="stat-card" id="attendance-stat">
          <div className="stat-title">Avg Attendance</div>
          <div className="stat-value">
            {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length) : 0}%
          </div>
          <div className="stat-desc flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Excellent rate
          </div>
        </div>
        
        <div className="stat-card" id="assignments-stat">
          <div className="stat-title">Total Assignments</div>
          <div className="stat-value">{assignments.length}</div>
          <div className="stat-desc flex items-center gap-1">
            <FileText className="w-4 h-4" />
            This semester
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card" id="grade-distribution-chart">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LucideBarChart className="w-5 h-5" />
            Grade Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getGradeDistributionData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card" id="performance-trend-chart">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getPerformanceTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="average" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card" id="recent-students">
        <h3 className="text-lg font-semibold mb-4">Recent Student Activity</h3>
        <div className="space-y-3">
          {students.slice(0, 5).map(student => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{student.grade}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{student.averageGrade}%</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{student.attendanceRate}% attendance</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold" id="students-header">Students</h2>
        <button 
          onClick={() => {
            setEditingStudent(null);
            setStudentForm({ name: '', email: '', grade: '', parentContact: '' });
            setShowStudentModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
          id="add-student-btn"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
            id="search-students"
          />
        </div>
        
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="input"
          id="filter-grade"
        >
          <option value="">All Grades</option>
          <option value="10A">10A</option>
          <option value="10B">10B</option>
          <option value="11A">11A</option>
          <option value="11B">11B</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input"
          id="sort-students"
        >
          <option value="name">Sort by Name</option>
          <option value="grade">Sort by Grade</option>
          <option value="attendance">Sort by Attendance</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="card hover:shadow-lg transition-shadow" id={`student-card-${student.id}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{student.grade}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingStudent(student);
                    setStudentForm({
                      name: student.name,
                      email: student.email,
                      grade: student.grade,
                      parentContact: student.parentContact
                    });
                    setShowStudentModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStudent(student.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Grade</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.averageGrade >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  student.averageGrade >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  student.averageGrade >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {student.averageGrade}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Attendance</span>
                <span className="text-sm font-medium">{student.attendanceRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm">{student.completedAssignments}/{student.totalAssignments}</span>
              </div>
              
              <button
                onClick={() => setSelectedStudent(student)}
                className="w-full btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold" id="assignments-header">Assignments</h2>
        <button 
          onClick={() => setShowAssignmentModal(true)}
          className="btn btn-primary flex items-center gap-2"
          id="add-assignment-btn"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(assignment => (
          <div key={assignment.id} className="card hover:shadow-lg transition-shadow" id={`assignment-card-${assignment.id}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">{assignment.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{assignment.subject}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                assignment.type === 'exam' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                assignment.type === 'project' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                assignment.type === 'quiz' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {assignment.type}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Due Date</span>
                <span className="text-sm">{assignment.dueDate}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Points</span>
                <span className="text-sm">{assignment.maxPoints}</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-slate-400">{assignment.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="analytics-header">Analytics & Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card" id="class-performance-chart">
          <h3 className="text-lg font-semibold mb-4">Class Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getPerformanceTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card" id="grade-pie-chart">
          <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <RechartsPieChart data={getGradeDistributionData()}>
                {getGradeDistributionData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPieChart>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card" id="ai-insights">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Insights
        </h3>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask for student insights (e.g., 'Analyze class performance and suggest improvements')..."
                className="input min-h-[100px] resize-none"
                id="ai-prompt-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="input"
                accept=".pdf,.doc,.docx,.csv,.jpg,.png"
                id="ai-file-input"
              />
              <button
                onClick={handleAIAnalysis}
                disabled={aiLoading}
                className="btn btn-primary flex items-center gap-2"
                id="ai-analyze-btn"
              >
                {aiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {aiLoading ? 'Analyzing...' : 'Get AI Insights'}
              </button>
            </div>
          </div>
          
          {aiError && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              <p>{aiError.message || aiError}</p>
            </div>
          )}
          
          {aiResult && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg" id="ai-result">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                AI Analysis Results
              </h4>
              <p className="text-sm whitespace-pre-wrap">{aiResult}</p>
              <button
                onClick={() => handleProcessAIResult(aiResult)}
                className="mt-3 btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Apply Suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="settings-header">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card" id="theme-settings">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Dark Mode</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                id="dark-mode-toggle"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        <div className="card" id="data-management">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={downloadDataAsCSV}
              className="w-full btn bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              id="download-data-btn"
            >
              <Download className="w-4 h-4" />
              Download Progress Report
            </button>
            
            <button
              onClick={clearAllData}
              className="w-full btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
              id="clear-data-btn"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
        
        <div className="card" id="import-export">
          <h3 className="text-lg font-semibold mb-4">Import/Export</h3>
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv"
              className="input"
              id="import-file"
            />
            <button className="w-full btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import Student Data
            </button>
          </div>
        </div>
        
        <div className="card" id="class-settings">
          <h3 className="text-lg font-semibold mb-4">Class Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="form-label">Default Grade Level</label>
              <select className="input">
                <option value="10A">10A</option>
                <option value="10B">10B</option>
                <option value="11A">11A</option>
                <option value="11B">11B</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Grading Scale</label>
              <select className="input">
                <option value="percentage">Percentage (0-100)</option>
                <option value="letter">Letter Grades (A-F)</option>
                <option value="points">Points Based</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 ${styles.app}`} id="welcome_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          setAiLoading(false);
        }}
        onError={(error) => {
          setAiError(error);
          setAiLoading(false);
        }}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700" id="generation_issue_fallback">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                id="settings-btn"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Gauge },
              { id: 'students', label: 'Students', icon: User },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: LucideBarChart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                id={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      <main className="container-fluid py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'analytics' && renderAnalytics()}
      </main>
      
      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-backdrop" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} id="student-modal">
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-500">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Student's full name"
                  id="student-name-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="student@school.edu"
                  id="student-email-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Grade</label>
                <select
                  value={studentForm.grade}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="input"
                  id="student-grade-input"
                >
                  <option value="">Select Grade</option>
                  <option value="10A">10A</option>
                  <option value="10B">10B</option>
                  <option value="11A">11A</option>
                  <option value="11B">11B</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Parent Contact</label>
                <input
                  type="email"
                  value={studentForm.parentContact}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentContact: e.target.value }))}
                  className="input"
                  placeholder="parent@email.com"
                  id="parent-contact-input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowStudentModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={editingStudent ? handleEditStudent : handleAddStudent}
                className="btn btn-primary"
                disabled={!studentForm.name.trim() || !studentForm.email.trim()}
                id="save-student-btn"
              >
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} id="assignment-modal">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Add New Assignment</h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-gray-400 hover:text-gray-500">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="Assignment title"
                  id="assignment-title-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  value={assignmentForm.subject}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="input"
                  placeholder="Subject name"
                  id="assignment-subject-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                    id="assignment-due-date-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Max Points</label>
                  <input
                    type="number"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }))}
                    className="input"
                    min="1"
                    id="assignment-points-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={assignmentForm.type}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value as Assignment['type'] }))}
                  className="input"
                  id="assignment-type-input"
                >
                  <option value="homework">Homework</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input min-h-[80px] resize-none"
                  placeholder="Assignment description"
                  id="assignment-description-input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAssignment}
                className="btn btn-primary"
                disabled={!assignmentForm.title.trim()}
                id="save-assignment-btn"
              >
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()} id="settings-modal">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-500">
                ×
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {renderSettings()}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()} id="student-detail-modal">
            <div className="modal-header">
              <h3 className="text-lg font-medium flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedStudent.name.charAt(0)}
                </div>
                {selectedStudent.name}
              </h3>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-500">
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Average Grade</div>
                  <div className="stat-value">{selectedStudent.averageGrade}%</div>
                  <div className="stat-desc">Current semester</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Attendance Rate</div>
                  <div className="stat-value">{selectedStudent.attendanceRate}%</div>
                  <div className="stat-desc">This year</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                  <p><span className="font-medium">Grade:</span> {selectedStudent.grade}</p>
                  <p><span className="font-medium">Parent Contact:</span> {selectedStudent.parentContact}</p>
                  <p><span className="font-medium">Enrollment Date:</span> {selectedStudent.enrollmentDate}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Performance Summary</h4>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm">
                    {selectedStudent.name} has completed {selectedStudent.completedAssignments} out of {selectedStudent.totalAssignments} assignments 
                    with an average grade of {selectedStudent.averageGrade}%. Their attendance rate is {selectedStudent.attendanceRate}%, 
                    which is {selectedStudent.attendanceRate >= 95 ? 'excellent' : selectedStudent.attendanceRate >= 90 ? 'good' : 'needs improvement'}.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12">
        <div className="container-fluid py-6 text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;