import React, { useState, useEffect, useRef } from 'react';
import { 
  User, UserPlus, Edit, Trash2, Search, Filter, Plus, Download, 
  TrendingUp, TrendingDown, BarChart3, PieChart as LucidePieChart, 
  Calendar, Medal, Target, Eye, X, Check, ChevronDown, Sun, Moon,
  BookOpen, GraduationCap, FileText, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

// Types and Interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  avatar?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  totalMarks: number;
  dueDate: string;
  description: string;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  submissionDate: string;
  feedback?: string;
}

type TabType = 'dashboard' | 'students' | 'assignments' | 'analytics';
type FilterType = 'all' | 'excellent' | 'good' | 'average' | 'needsImprovement';

function App() {
  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modal States
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<string>('');
  const [selectedAssignmentForGrade, setSelectedAssignmentForGrade] = useState<string>('');
  
  // Form States
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    grade: '',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: '',
    totalMarks: '',
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  const [gradeForm, setGradeForm] = useState({
    score: '',
    submissionDate: new Date().toISOString().split('T')[0],
    feedback: ''
  });

  // Refs for form focus
  const studentNameRef = useRef<HTMLInputElement>(null);
  const assignmentTitleRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('teacherApp_students');
    const savedAssignments = localStorage.getItem('teacherApp_assignments');
    const savedGrades = localStorage.getItem('teacherApp_grades');
    const savedDarkMode = localStorage.getItem('teacherApp_darkMode');
    
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (error) {
        console.error('Error loading students:', error);
        setStudents([]);
      }
    } else {
      // Initialize with sample data
      const sampleStudents: Student[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice.johnson@email.com',
          grade: '10th',
          enrollmentDate: '2024-01-15'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob.smith@email.com',
          grade: '10th',
          enrollmentDate: '2024-01-16'
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol.davis@email.com',
          grade: '9th',
          enrollmentDate: '2024-01-17'
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('teacherApp_students', JSON.stringify(sampleStudents));
    }
    
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error('Error loading assignments:', error);
        setAssignments([]);
      }
    } else {
      // Initialize with sample data
      const sampleAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Math Quiz 1',
          subject: 'Mathematics',
          totalMarks: 100,
          dueDate: '2024-02-01',
          description: 'Basic algebra and geometry concepts'
        },
        {
          id: '2',
          title: 'English Essay',
          subject: 'English',
          totalMarks: 50,
          dueDate: '2024-02-05',
          description: 'Write a 500-word essay on your favorite book'
        },
        {
          id: '3',
          title: 'Science Project',
          subject: 'Science',
          totalMarks: 75,
          dueDate: '2024-02-10',
          description: 'Create a model of the solar system'
        }
      ];
      setAssignments(sampleAssignments);
      localStorage.setItem('teacherApp_assignments', JSON.stringify(sampleAssignments));
    }
    
    if (savedGrades) {
      try {
        setGrades(JSON.parse(savedGrades));
      } catch (error) {
        console.error('Error loading grades:', error);
        setGrades([]);
      }
    } else {
      // Initialize with sample data
      const sampleGrades: Grade[] = [
        {
          id: '1',
          studentId: '1',
          assignmentId: '1',
          score: 85,
          submissionDate: '2024-01-30',
          feedback: 'Good work on algebra problems'
        },
        {
          id: '2',
          studentId: '2',
          assignmentId: '1',
          score: 92,
          submissionDate: '2024-01-29',
          feedback: 'Excellent understanding of concepts'
        },
        {
          id: '3',
          studentId: '1',
          assignmentId: '2',
          score: 78,
          submissionDate: '2024-02-04',
          feedback: 'Good essay structure, work on grammar'
        }
      ];
      setGrades(sampleGrades);
      localStorage.setItem('teacherApp_grades', JSON.stringify(sampleGrades));
    }
    
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('teacherApp_students', JSON.stringify(students));
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('teacherApp_assignments', JSON.stringify(assignments));
  }, [assignments]);
  
  useEffect(() => {
    localStorage.setItem('teacherApp_grades', JSON.stringify(grades));
  }, [grades]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('teacherApp_darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Utility Functions
  const generateId = () => Date.now().toString();
  
  const getStudentById = (id: string): Student | undefined => {
    return (students || []).find(student => student.id === id);
  };
  
  const getAssignmentById = (id: string): Assignment | undefined => {
    return (assignments || []).find(assignment => assignment.id === id);
  };
  
  const getGradesByStudent = (studentId: string): Grade[] => {
    return (grades || []).filter(grade => grade.studentId === studentId);
  };
  
  const getStudentAverage = (studentId: string): number => {
    const studentGrades = getGradesByStudent(studentId);
    if ((studentGrades || []).length === 0) return 0;
    
    const total = (studentGrades || []).reduce((sum, grade) => {
      const assignment = getAssignmentById(grade.assignmentId);
      const percentage = assignment ? (grade.score / assignment.totalMarks) * 100 : 0;
      return sum + percentage;
    }, 0);
    
    return Math.round(total / (studentGrades || []).length);
  };
  
  const getPerformanceCategory = (average: number): string => {
    if (average >= 90) return 'excellent';
    if (average >= 80) return 'good';
    if (average >= 70) return 'average';
    return 'needsImprovement';
  };
  
  const getPerformanceColor = (category: string): string => {
    switch (category) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'average': return 'text-yellow-600 dark:text-yellow-400';
      case 'needsImprovement': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Modal Functions
  const openStudentModal = (student?: Student) => {
    setEditingStudent(student || null);
    if (student) {
      setStudentForm({
        name: student.name,
        email: student.email,
        grade: student.grade,
        enrollmentDate: student.enrollmentDate
      });
    } else {
      setStudentForm({
        name: '',
        email: '',
        grade: '',
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowStudentModal(true);
    document.body.classList.add('modal-open');
    setTimeout(() => studentNameRef.current?.focus(), 100);
  };
  
  const closeStudentModal = () => {
    setShowStudentModal(false);
    setEditingStudent(null);
    document.body.classList.remove('modal-open');
  };
  
  const openAssignmentModal = (assignment?: Assignment) => {
    setEditingAssignment(assignment || null);
    if (assignment) {
      setAssignmentForm({
        title: assignment.title,
        subject: assignment.subject,
        totalMarks: assignment.totalMarks.toString(),
        dueDate: assignment.dueDate,
        description: assignment.description
      });
    } else {
      setAssignmentForm({
        title: '',
        subject: '',
        totalMarks: '',
        dueDate: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
    setShowAssignmentModal(true);
    document.body.classList.add('modal-open');
    setTimeout(() => assignmentTitleRef.current?.focus(), 100);
  };
  
  const closeAssignmentModal = () => {
    setShowAssignmentModal(false);
    setEditingAssignment(null);
    document.body.classList.remove('modal-open');
  };
  
  const openGradeModal = (studentId?: string, assignmentId?: string) => {
    setSelectedStudentForGrade(studentId || '');
    setSelectedAssignmentForGrade(assignmentId || '');
    setGradeForm({
      score: '',
      submissionDate: new Date().toISOString().split('T')[0],
      feedback: ''
    });
    setShowGradeModal(true);
    document.body.classList.add('modal-open');
  };
  
  const closeGradeModal = () => {
    setShowGradeModal(false);
    setSelectedStudentForGrade('');
    setSelectedAssignmentForGrade('');
    document.body.classList.remove('modal-open');
  };

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showStudentModal) closeStudentModal();
        if (showAssignmentModal) closeAssignmentModal();
        if (showGradeModal) closeGradeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showStudentModal, showAssignmentModal, showGradeModal]);

  // CRUD Functions
  const handleSaveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.grade.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (editingStudent) {
      setStudents(prev => (prev || []).map(student => 
        student.id === editingStudent.id 
          ? { ...student, ...studentForm }
          : student
      ));
    } else {
      const newStudent: Student = {
        id: generateId(),
        ...studentForm
      };
      setStudents(prev => [...(prev || []), newStudent]);
    }
    
    closeStudentModal();
  };
  
  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove all their grades.')) {
      setStudents(prev => (prev || []).filter(student => student.id !== studentId));
      setGrades(prev => (prev || []).filter(grade => grade.studentId !== studentId));
    }
  };
  
  const handleSaveAssignment = () => {
    if (!assignmentForm.title.trim() || !assignmentForm.subject.trim() || !assignmentForm.totalMarks) {
      alert('Please fill in all required fields');
      return;
    }
    
    const totalMarks = parseInt(assignmentForm.totalMarks);
    if (isNaN(totalMarks) || totalMarks <= 0) {
      alert('Total marks must be a positive number');
      return;
    }
    
    if (editingAssignment) {
      setAssignments(prev => (prev || []).map(assignment => 
        assignment.id === editingAssignment.id 
          ? { ...assignment, ...assignmentForm, totalMarks }
          : assignment
      ));
    } else {
      const newAssignment: Assignment = {
        id: generateId(),
        ...assignmentForm,
        totalMarks
      };
      setAssignments(prev => [...(prev || []), newAssignment]);
    }
    
    closeAssignmentModal();
  };
  
  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment? This will also remove all related grades.')) {
      setAssignments(prev => (prev || []).filter(assignment => assignment.id !== assignmentId));
      setGrades(prev => (prev || []).filter(grade => grade.assignmentId !== assignmentId));
    }
  };
  
  const handleSaveGrade = () => {
    if (!selectedStudentForGrade || !selectedAssignmentForGrade || !gradeForm.score) {
      alert('Please fill in all required fields');
      return;
    }
    
    const score = parseFloat(gradeForm.score);
    const assignment = getAssignmentById(selectedAssignmentForGrade);
    
    if (isNaN(score) || score < 0 || (assignment && score > assignment.totalMarks)) {
      alert(`Score must be between 0 and ${assignment?.totalMarks || 100}`);
      return;
    }
    
    // Check if grade already exists
    const existingGrade = (grades || []).find(grade => 
      grade.studentId === selectedStudentForGrade && 
      grade.assignmentId === selectedAssignmentForGrade
    );
    
    if (existingGrade) {
      setGrades(prev => (prev || []).map(grade => 
        grade.id === existingGrade.id 
          ? { ...grade, score, submissionDate: gradeForm.submissionDate, feedback: gradeForm.feedback }
          : grade
      ));
    } else {
      const newGrade: Grade = {
        id: generateId(),
        studentId: selectedStudentForGrade,
        assignmentId: selectedAssignmentForGrade,
        score,
        submissionDate: gradeForm.submissionDate,
        feedback: gradeForm.feedback
      };
      setGrades(prev => [...(prev || []), newGrade]);
    }
    
    closeGradeModal();
  };

  // Filter and Search Functions
  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.grade.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const average = getStudentAverage(student.id);
    const category = getPerformanceCategory(average);
    
    return matchesSearch && category === filterType;
  });

  // Analytics Data
  const getAnalyticsData = () => {
    const gradeDistribution = (students || []).map(student => {
      const average = getStudentAverage(student.id);
      return {
        name: student.name.split(' ')[0],
        average: average
      };
    });
    
    const performanceBreakdown = {
      excellent: (students || []).filter(s => getPerformanceCategory(getStudentAverage(s.id)) === 'excellent').length,
      good: (students || []).filter(s => getPerformanceCategory(getStudentAverage(s.id)) === 'good').length,
      average: (students || []).filter(s => getPerformanceCategory(getStudentAverage(s.id)) === 'average').length,
      needsImprovement: (students || []).filter(s => getPerformanceCategory(getStudentAverage(s.id)) === 'needsImprovement').length
    };
    
    const pieData = [
      { name: 'Excellent (90-100%)', value: performanceBreakdown.excellent, color: '#10B981' },
      { name: 'Good (80-89%)', value: performanceBreakdown.good, color: '#3B82F6' },
      { name: 'Average (70-79%)', value: performanceBreakdown.average, color: '#F59E0B' },
      { name: 'Needs Improvement (<70%)', value: performanceBreakdown.needsImprovement, color: '#EF4444' }
    ];
    
    return { gradeDistribution, pieData, performanceBreakdown };
  };

  // Export Functions
  const exportStudentData = () => {
    const csvData = (students || []).map(student => {
      const average = getStudentAverage(student.id);
      const category = getPerformanceCategory(average);
      const gradeCount = getGradesByStudent(student.id).length;
      
      return {
        Name: student.name,
        Email: student.email,
        Grade: student.grade,
        'Enrollment Date': student.enrollmentDate,
        'Average Score': `${average}%`,
        'Performance Category': category,
        'Assignments Completed': gradeCount
      };
    });
    
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      (headers || []).join(','),
      ...((csvData || []).map(row => (headers || []).map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_progress_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { gradeDistribution, pieData, performanceBreakdown } = getAnalyticsData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">Manage and monitor your students' academic journey</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                <button
                  onClick={toggleDarkMode}
                  className="theme-toggle"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
                <Moon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <User className="h-4 w-4" />
                <span>{(students || []).length} Students</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: User },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: LucidePieChart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Students</div>
                <div className="stat-value flex items-center gap-2">
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  {(students || []).length}
                </div>
                <div className="stat-desc">Enrolled in your classes</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Active Assignments</div>
                <div className="stat-value flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {(assignments || []).length}
                </div>
                <div className="stat-desc">Currently active</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Grades</div>
                <div className="stat-value flex items-center gap-2">
                  <Medal className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  {(grades || []).length}
                </div>
                <div className="stat-desc">Recorded this semester</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Class Average</div>
                <div className="stat-value flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  {(students || []).length > 0 ? Math.round((students || []).reduce((sum, student) => sum + getStudentAverage(student.id), 0) / (students || []).length) : 0}%
                </div>
                <div className="stat-desc">Overall performance</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Students</h3>
                <div className="space-y-3">
                  {(students || []).slice(0, 5).map(student => {
                    const average = getStudentAverage(student.id);
                    const category = getPerformanceCategory(average);
                    return (
                      <div key={student.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{student.grade}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getPerformanceColor(category)}`}>{average}%</div>
                          <div className="text-xs text-gray-500 dark:text-slate-500 capitalize">{category.replace('needsImprovement', 'Needs Improvement')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Assignments</h3>
                <div className="space-y-3">
                  {(assignments || [])
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 5)
                    .map(assignment => (
                      <div key={assignment.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{assignment.title}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{assignment.subject}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.totalMarks} pts</div>
                          <div className="text-xs text-gray-500 dark:text-slate-500">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Header with Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="input pr-10 appearance-none"
                  >
                    <option value="all">All Students</option>
                    <option value="excellent">Excellent (90-100%)</option>
                    <option value="good">Good (80-89%)</option>
                    <option value="average">Average (70-79%)</option>
                    <option value="needsImprovement">Needs Improvement (&lt;70%)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={exportStudentData}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => openStudentModal()}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Grade Level</th>
                    <th className="table-header">Enrollment Date</th>
                    <th className="table-header">Average Score</th>
                    <th className="table-header">Performance</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {(filteredStudents || []).map(student => {
                    const average = getStudentAverage(student.id);
                    const category = getPerformanceCategory(average);
                    const gradeCount = getGradesByStudent(student.id).length;
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="table-cell">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{student.email}</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {student.grade}
                          </span>
                        </td>
                        <td className="table-cell">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getPerformanceColor(category)}`}>
                              {average}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-500">
                              ({gradeCount} {gradeCount === 1 ? 'grade' : 'grades'})
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${
                            category === 'excellent' ? 'badge-success' :
                            category === 'good' ? 'badge-info' :
                            category === 'average' ? 'badge-warning' : 'badge-error'
                          }`}>
                            {category === 'needsImprovement' ? 'Needs Improvement' : category.charAt(0).toUpperCase() + category.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openGradeModal(student.id)}
                              className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                              title="Add Grade"
                            >
                              <Plus className="h-3 w-3" />
                              Grade
                            </button>
                            <button
                              onClick={() => openStudentModal(student)}
                              className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                              title="Edit Student"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                              title="Delete Student"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(filteredStudents || []).length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first student.'}
                </p>
                {!searchTerm && filterType === 'all' && (
                  <button
                    onClick={() => openStudentModal()}
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Your First Student
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
                <p className="text-gray-600 dark:text-slate-400">Manage your class assignments and track submissions</p>
              </div>
              <button
                onClick={() => openAssignmentModal()}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </button>
            </div>

            {/* Assignments Grid */}
            <div className="grid gap-6">
              {(assignments || []).map(assignment => {
                const assignmentGrades = (grades || []).filter(grade => grade.assignmentId === assignment.id);
                const submissionCount = (assignmentGrades || []).length;
                const averageScore = submissionCount > 0 
                  ? Math.round((assignmentGrades || []).reduce((sum, grade) => sum + (grade.score / assignment.totalMarks) * 100, 0) / submissionCount)
                  : 0;
                
                return (
                  <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{assignment.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openGradeModal('', assignment.id)}
                          className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Grade
                        </button>
                        <button
                          onClick={() => openAssignmentModal(assignment)}
                          className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-slate-300 mb-4">{assignment.description}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">Total Marks</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{assignment.totalMarks}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">Due Date</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">Submissions</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{submissionCount}/{(students || []).length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">Class Average</div>
                        <div className={`font-semibold ${
                          averageScore >= 90 ? 'text-green-600 dark:text-green-400' :
                          averageScore >= 80 ? 'text-blue-600 dark:text-blue-400' :
                          averageScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {averageScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(assignments || []).length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">Create your first assignment to start tracking student progress.</p>
                <button
                  onClick={() => openAssignmentModal()}
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Assignment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
              <p className="text-gray-600 dark:text-slate-400">Comprehensive view of class performance and trends</p>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Excellent', count: performanceBreakdown.excellent, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
                { label: 'Good', count: performanceBreakdown.good, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
                { label: 'Average', count: performanceBreakdown.average, color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
                { label: 'Needs Improvement', count: performanceBreakdown.needsImprovement, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' }
              ].map(item => (
                <div key={item.label} className="stat-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <div className="stat-title">{item.label}</div>
                  </div>
                  <div className={`stat-value ${item.textColor}`}>{item.count}</div>
                  <div className="stat-desc">students</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Student Performance Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Student Performance Overview</h3>
                {(gradeDistribution || []).length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis 
                          dataKey="name" 
                          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                          fontSize={12}
                        />
                        <YAxis 
                          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            color: isDarkMode ? '#f1f5f9' : '#1f2937'
                          }}
                          formatter={(value: any) => [`${value}%`, 'Average Score']}
                        />
                        <Bar 
                          dataKey="average" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500 dark:text-slate-400">
                    No data available
                  </div>
                )}
              </div>

              {/* Performance Distribution Pie Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Distribution</h3>
                {(pieData || []).some(item => item.value > 0) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            color: isDarkMode ? '#f1f5f9' : '#1f2937'
                          }}
                          formatter={(value: any) => [`${value}`, 'Students']}
                        />
                        <Pie
                          data={(pieData || []).filter(item => item.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={2}
                        >
                          {(pieData || []).filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500 dark:text-slate-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detailed Student Analytics</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Student</th>
                      <th className="table-header">Assignments Completed</th>
                      <th className="table-header">Average Score</th>
                      <th className="table-header">Highest Score</th>
                      <th className="table-header">Lowest Score</th>
                      <th className="table-header">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {(students || []).map(student => {
                      const studentGrades = getGradesByStudent(student.id);
                      const scores = (studentGrades || []).map(grade => {
                        const assignment = getAssignmentById(grade.assignmentId);
                        return assignment ? (grade.score / assignment.totalMarks) * 100 : 0;
                      });
                      
                      const average = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                      const highest = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;
                      const lowest = scores.length > 0 ? Math.round(Math.min(...scores)) : 0;
                      
                      // Simple trend calculation (last score vs first score)
                      const trend = scores.length >= 2 
                        ? scores[scores.length - 1] > scores[0] ? 'up' : scores[scores.length - 1] < scores[0] ? 'down' : 'stable'
                        : 'stable';
                      
                      return (
                        <tr key={student.id}>
                          <td className="table-cell">
                            <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                          </td>
                          <td className="table-cell">{(studentGrades || []).length}</td>
                          <td className="table-cell">
                            <span className={`font-semibold ${getPerformanceColor(getPerformanceCategory(average))}`}>
                              {average}%
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="text-green-600 dark:text-green-400 font-medium">{highest}%</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-red-600 dark:text-red-400 font-medium">{lowest}%</span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
                              {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                              {trend === 'stable' && <span className="text-gray-500 dark:text-slate-400">—</span>}
                              <span className={`text-sm ${
                                trend === 'up' ? 'text-green-600 dark:text-green-400' :
                                trend === 'down' ? 'text-red-600 dark:text-red-400' :
                                'text-gray-500 dark:text-slate-400'
                              }`}>
                                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-backdrop" onClick={closeStudentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={closeStudentModal}
                className="text-gray-400 hover:text-gray-500 dark:text-slate-500 dark:hover:text-slate-400"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="studentName">Full Name *</label>
                <input
                  ref={studentNameRef}
                  id="studentName"
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="studentEmail">Email Address *</label>
                <input
                  id="studentEmail"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="studentGrade">Grade Level *</label>
                <input
                  id="studentGrade"
                  type="text"
                  value={studentForm.grade}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="input"
                  placeholder="e.g., 9th, 10th, 11th, 12th"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="enrollmentDate">Enrollment Date</label>
                <input
                  id="enrollmentDate"
                  type="date"
                  value={studentForm.enrollmentDate}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={closeStudentModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStudent}
                className="btn btn-primary"
              >
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-backdrop" onClick={closeAssignmentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button
                onClick={closeAssignmentModal}
                className="text-gray-400 hover:text-gray-500 dark:text-slate-500 dark:hover:text-slate-400"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="assignmentTitle">Assignment Title *</label>
                <input
                  ref={assignmentTitleRef}
                  id="assignmentTitle"
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="assignmentSubject">Subject *</label>
                <input
                  id="assignmentSubject"
                  type="text"
                  value={assignmentForm.subject}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="input"
                  placeholder="e.g., Mathematics, English, Science"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="totalMarks">Total Marks *</label>
                  <input
                    id="totalMarks"
                    type="number"
                    min="1"
                    value={assignmentForm.totalMarks}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, totalMarks: e.target.value }))}
                    className="input"
                    placeholder="100"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="dueDate">Due Date</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Brief description of the assignment"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={closeAssignmentModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="btn btn-primary"
              >
                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="modal-backdrop" onClick={closeGradeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Grade</h3>
              <button
                onClick={closeGradeModal}
                className="text-gray-400 hover:text-gray-500 dark:text-slate-500 dark:hover:text-slate-400"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="gradeStudent">Student *</label>
                <select
                  id="gradeStudent"
                  value={selectedStudentForGrade}
                  onChange={(e) => setSelectedStudentForGrade(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a student</option>
                  {(students || []).map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="gradeAssignment">Assignment *</label>
                <select
                  id="gradeAssignment"
                  value={selectedAssignmentForGrade}
                  onChange={(e) => setSelectedAssignmentForGrade(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select an assignment</option>
                  {(assignments || []).map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title} ({assignment.totalMarks} pts)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="score">Score *</label>
                <input
                  id="score"
                  type="number"
                  min="0"
                  max={selectedAssignmentForGrade ? getAssignmentById(selectedAssignmentForGrade)?.totalMarks || 100 : 100}
                  step="0.1"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
                  className="input"
                  placeholder="Enter score"
                  required
                />
                {selectedAssignmentForGrade && (
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                    Maximum: {getAssignmentById(selectedAssignmentForGrade)?.totalMarks} points
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="submissionDate">Submission Date</label>
                <input
                  id="submissionDate"
                  type="date"
                  value={gradeForm.submissionDate}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, submissionDate: e.target.value }))}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="feedback">Feedback</label>
                <textarea
                  id="feedback"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Optional feedback for the student"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={closeGradeModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGrade}
                className="btn btn-primary"
              >
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-16 theme-transition">
        <div className="container-wide py-6">
          <div className="text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
