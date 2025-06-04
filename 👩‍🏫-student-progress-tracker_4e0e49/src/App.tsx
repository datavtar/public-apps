import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  FileText, 
  Download, 
  Upload, 
  Settings, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Star, 
  Target, 
  Award, 
  ChartBar, 
  ChartLine,
  Eye,
  Save,
  Menu,
  LogOut,
  ArrowUp,
  ArrowDown,
  Brain,
  MessageCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  enrollmentDate: string;
  avatar?: string;
  overallGrade: number;
  attendance: number;
  assignments: Assignment[];
  notes: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  maxScore: number;
  score: number | null;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  feedback: string;
  submissionDate?: string;
}

interface Class {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  averageGrade: number;
}

interface PerformanceData {
  month: string;
  average: number;
  students: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // AI States
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState<boolean>(false);

  // App States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [showAddAssignment, setShowAddAssignment] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({});
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({});
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Initialize sample data
  useEffect(() => {
    const savedStudents = localStorage.getItem('teacherApp_students');
    const savedClasses = localStorage.getItem('teacherApp_classes');
    const savedDarkMode = localStorage.getItem('teacherApp_darkMode');

    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      const sampleStudents: Student[] = [
        {
          id: '1',
          name: 'Emma Johnson',
          email: 'emma.johnson@school.edu',
          class: 'Math 101',
          enrollmentDate: '2025-01-15',
          overallGrade: 92,
          attendance: 95,
          assignments: [
            { id: 'a1', title: 'Algebra Basics', subject: 'Math', dueDate: '2025-06-10', maxScore: 100, score: 95, status: 'graded', feedback: 'Excellent work!', submissionDate: '2025-06-09' },
            { id: 'a2', title: 'Geometry Quiz', subject: 'Math', dueDate: '2025-06-15', maxScore: 50, score: 48, status: 'graded', feedback: 'Good understanding', submissionDate: '2025-06-14' }
          ],
          notes: 'Strong analytical skills, participates actively in class.'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@school.edu',
          class: 'Math 101',
          enrollmentDate: '2025-01-15',
          overallGrade: 87,
          attendance: 92,
          assignments: [
            { id: 'a3', title: 'Algebra Basics', subject: 'Math', dueDate: '2025-06-10', maxScore: 100, score: 89, status: 'graded', feedback: 'Good work, review fractions', submissionDate: '2025-06-10' },
            { id: 'a4', title: 'Geometry Quiz', subject: 'Math', dueDate: '2025-06-15', maxScore: 50, score: null, status: 'pending', feedback: '' }
          ],
          notes: 'Needs encouragement with complex problems.'
        },
        {
          id: '3',
          name: 'Sarah Williams',
          email: 'sarah.williams@school.edu',
          class: 'Science 201',
          enrollmentDate: '2025-02-01',
          overallGrade: 94,
          attendance: 98,
          assignments: [
            { id: 'a5', title: 'Lab Report 1', subject: 'Science', dueDate: '2025-06-08', maxScore: 100, score: 96, status: 'graded', feedback: 'Outstanding analysis!', submissionDate: '2025-06-07' },
            { id: 'a6', title: 'Chemistry Quiz', subject: 'Science', dueDate: '2025-06-12', maxScore: 75, score: 71, status: 'graded', feedback: 'Great improvement', submissionDate: '2025-06-11' }
          ],
          notes: 'Exceptional student with natural curiosity.'
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('teacherApp_students', JSON.stringify(sampleStudents));
    }

    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    } else {
      const sampleClasses: Class[] = [
        { id: '1', name: 'Math 101', subject: 'Mathematics', studentCount: 25, averageGrade: 89 },
        { id: '2', name: 'Science 201', subject: 'Science', studentCount: 22, averageGrade: 91 },
        { id: '3', name: 'English 301', subject: 'English', studentCount: 28, averageGrade: 86 }
      ];
      setClasses(sampleClasses);
      localStorage.setItem('teacherApp_classes', JSON.stringify(sampleClasses));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('teacherApp_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('teacherApp_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('teacherApp_darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || student.class === selectedClass;
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      let valueA, valueB;
      switch (sortBy) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'grade':
          valueA = a.overallGrade;
          valueB = b.overallGrade;
          break;
        case 'attendance':
          valueA = a.attendance;
          valueB = b.attendance;
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }
      
      if (typeof valueA === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB as string) : (valueB as string).localeCompare(valueA);
      } else {
        return sortOrder === 'asc' ? (valueA as number) - (valueB as number) : (valueB as number) - (valueA as number);
      }
    });

  // Calculate dashboard statistics
  const totalStudents = students.length;
  const averageGrade = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.overallGrade, 0) / students.length) : 0;
  const averageAttendance = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length) : 0;
  const pendingAssignments = students.reduce((total, student) => 
    total + student.assignments.filter(a => a.status === 'pending' || a.status === 'submitted').length, 0
  );

  // Performance data for charts
  const performanceData: PerformanceData[] = [
    { month: 'Jan', average: 85, students: 20 },
    { month: 'Feb', average: 87, students: 22 },
    { month: 'Mar', average: 89, students: 25 },
    { month: 'Apr', average: 88, students: 26 },
    { month: 'May', average: 90, students: 28 },
    { month: 'Jun', average: averageGrade, students: totalStudents }
  ];

  const gradeDistribution = [
    { name: 'A (90-100)', value: students.filter(s => s.overallGrade >= 90).length },
    { name: 'B (80-89)', value: students.filter(s => s.overallGrade >= 80 && s.overallGrade < 90).length },
    { name: 'C (70-79)', value: students.filter(s => s.overallGrade >= 70 && s.overallGrade < 80).length },
    { name: 'D (60-69)', value: students.filter(s => s.overallGrade >= 60 && s.overallGrade < 70).length },
    { name: 'F (0-59)', value: students.filter(s => s.overallGrade < 60).length }
  ].filter(item => item.value > 0);

  // AI Analysis Functions
  const handleAnalyzeStudent = (student: Student) => {
    const studentData = JSON.stringify({
      name: student.name,
      overallGrade: student.overallGrade,
      attendance: student.attendance,
      assignments: student.assignments,
      notes: student.notes
    });
    
    const prompt = `Analyze this student's performance data and provide insights in JSON format with keys: "strengths", "areas_for_improvement", "recommendations", "predicted_performance", "intervention_needed". Student data: ${studentData}`;
    
    setPromptText(prompt);
    setShowAiAnalysis(true);
    
    setAiResult(null);
    setAiError(null);
    
    aiLayerRef.current?.sendToAI(prompt);
  };

  const handleAnalyzeClass = () => {
    const classData = JSON.stringify({
      totalStudents,
      averageGrade,
      averageAttendance,
      gradeDistribution,
      performanceData
    });
    
    const prompt = `Analyze this class performance data and provide insights in JSON format with keys: "overall_performance", "trends", "concerns", "recommendations", "top_performers", "students_needing_help". Class data: ${classData}`;
    
    setPromptText(prompt);
    setShowAiAnalysis(true);
    
    setAiResult(null);
    setAiError(null);
    
    aiLayerRef.current?.sendToAI(prompt);
  };

  // CRUD Functions
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.class) return;
    
    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      email: newStudent.email,
      class: newStudent.class,
      enrollmentDate: new Date().toISOString().split('T')[0],
      overallGrade: 0,
      attendance: 100,
      assignments: [],
      notes: newStudent.notes || ''
    };
    
    setStudents(prev => [...prev, student]);
    setNewStudent({});
    setShowAddStudent(false);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setSelectedStudent(updatedStudent);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setShowDeleteConfirm(null);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  const handleAddAssignment = () => {
    if (!newAssignment.title || !selectedStudent) return;
    
    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title || '',
      subject: newAssignment.subject || selectedStudent.class,
      dueDate: newAssignment.dueDate || '',
      maxScore: newAssignment.maxScore || 100,
      score: null,
      status: 'pending',
      feedback: ''
    };
    
    const updatedStudent = {
      ...selectedStudent,
      assignments: [...selectedStudent.assignments, assignment]
    };
    
    handleUpdateStudent(updatedStudent);
    setNewAssignment({});
    setShowAddAssignment(false);
  };

  const handleGradeAssignment = (assignmentId: string, score: number, feedback: string) => {
    if (!selectedStudent) return;
    
    const updatedAssignments = selectedStudent.assignments.map(a => 
      a.id === assignmentId 
        ? { ...a, score, feedback, status: 'graded' as const, submissionDate: new Date().toISOString().split('T')[0] }
        : a
    );
    
    const gradedAssignments = updatedAssignments.filter(a => a.score !== null);
    const overallGrade = gradedAssignments.length > 0 
      ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / gradedAssignments.length)
      : 0;
    
    const updatedStudent = {
      ...selectedStudent,
      assignments: updatedAssignments,
      overallGrade
    };
    
    handleUpdateStudent(updatedStudent);
  };

  // Export/Import Functions
  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Class', 'Overall Grade', 'Attendance', 'Enrollment Date', 'Notes'],
      ...students.map(s => [
        s.name,
        s.email,
        s.class,
        s.overallGrade.toString(),
        s.attendance.toString(),
        s.enrollmentDate,
        s.notes
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Class', 'Notes'],
      ['John Doe', 'john.doe@school.edu', 'Math 101', 'Sample student note']
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedStudents: Student[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3 && values[0] && values[1] && values[2]) {
          const student: Student = {
            id: Date.now().toString() + i,
            name: values[0],
            email: values[1],
            class: values[2],
            enrollmentDate: new Date().toISOString().split('T')[0],
            overallGrade: 0,
            attendance: 100,
            assignments: [],
            notes: values[3] || ''
          };
          importedStudents.push(student);
        }
      }
      
      setStudents(prev => [...prev, ...importedStudents]);
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    setStudents([]);
    setClasses([]);
    localStorage.removeItem('teacherApp_students');
    localStorage.removeItem('teacherApp_classes');
    setShowDeleteConfirm(null);
  };

  if (!currentUser) {
    return (
      <div className="flex-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto text-primary-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Progress Tracker</h1>
          <p className="text-gray-600 dark:text-slate-300">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex-start gap-3">
              <GraduationCap className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Welcome back, {currentUser.first_name}</p>
              </div>
            </div>
            
            <div className="flex-start gap-4">
              <button
                id="generation_issue_fallback"
                className="btn btn-primary flex items-center gap-2"
                onClick={handleAnalyzeClass}
                disabled={isAiLoading}
              >
                <Brain className="w-4 h-4" />
                {isAiLoading ? 'Analyzing...' : 'AI Analysis'}
              </button>
              
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-2"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex gap-8 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`nav-${id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div id="total-students-card" className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Total Students</div>
                    <div className="stat-value">{totalStudents}</div>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Average Grade</div>
                    <div className="stat-value">{averageGrade}%</div>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Average Attendance</div>
                    <div className="stat-value">{averageAttendance}%</div>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Pending Assignments</div>
                    <div className="stat-value">{pendingAssignments}</div>
                  </div>
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="performance-chart" className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-slate-600" />
                    <XAxis dataKey="month" className="text-gray-600 dark:text-slate-400" />
                    <YAxis className="text-gray-600 dark:text-slate-400" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line type="monotone" dataKey="average" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h3>
              <div className="space-y-3">
                {students.slice(0, 5).map(student => (
                  <div key={student.id} className="flex-between py-2 border-b border-gray-200 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex-center">
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{student.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{student.overallGrade}%</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Grade</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="student-search"
                    type="text"
                    placeholder="Search students..."
                    className="input pl-10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="input w-full sm:w-auto"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
                
                <select
                  className="input w-full sm:w-auto"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="grade-desc">Grade (High-Low)</option>
                  <option value="grade-asc">Grade (Low-High)</option>
                  <option value="attendance-desc">Attendance (High-Low)</option>
                  <option value="attendance-asc">Attendance (Low-High)</option>
                </select>
              </div>
              
              <button
                id="add-student-btn"
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowAddStudent(true)}
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex-center">
                        <span className="font-medium text-primary-700 dark:text-primary-300">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{student.class}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyzeStudent(student);
                        }}
                        aria-label="AI Analysis"
                      >
                        <Brain className="w-4 h-4 text-purple-600" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStudent(student);
                        }}
                        aria-label="Edit student"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(student.id);
                        }}
                        aria-label="Delete student"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Grade:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{student.overallGrade}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Attendance:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{student.attendance}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <span className={`badge ${
                      student.overallGrade >= 90 ? 'badge-success' :
                      student.overallGrade >= 80 ? 'badge-info' :
                      student.overallGrade >= 70 ? 'badge-warning' : 'badge-error'
                    }`}>
                      {student.overallGrade >= 90 ? 'Excellent' :
                       student.overallGrade >= 80 ? 'Good' :
                       student.overallGrade >= 70 ? 'Average' : 'Needs Help'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
                <p className="text-gray-500 dark:text-slate-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignment Management</h2>
              {selectedStudent && (
                <button
                  id="add-assignment-btn"
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => setShowAddAssignment(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              )}
            </div>
            
            {!selectedStudent ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Student</h3>
                <p className="text-gray-500 dark:text-slate-400">Choose a student from the Students tab to manage their assignments</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="card">
                  <div className="flex-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex-center">
                        <span className="text-lg font-medium text-primary-700 dark:text-primary-300">
                          {selectedStudent.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                        <p className="text-gray-500 dark:text-slate-400">{selectedStudent.class} • Overall Grade: {selectedStudent.overallGrade}%</p>
                      </div>
                    </div>
                    <button
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Back to Students
                    </button>
                  </div>
                </div>
                
                {/* Assignments List */}
                <div className="card">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Assignments</h4>
                  
                  {selectedStudent.assignments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
                      <p className="text-gray-500 dark:text-slate-400">No assignments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedStudent.assignments.map(assignment => (
                        <div key={assignment.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h5>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {assignment.subject} • Due: {assignment.dueDate} • Max: {assignment.maxScore} points
                              </p>
                            </div>
                            <span className={`badge ${
                              assignment.status === 'graded' ? 'badge-success' :
                              assignment.status === 'submitted' ? 'badge-info' :
                              assignment.status === 'late' ? 'badge-error' : 'badge-warning'
                            }`}>
                              {assignment.status}
                            </span>
                          </div>
                          
                          {assignment.status === 'graded' ? (
                            <div className="bg-gray-50 dark:bg-slate-800 rounded p-3">
                              <div className="flex-between mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  Score: {assignment.score}/{assignment.maxScore} ({Math.round((assignment.score! / assignment.maxScore) * 100)}%)
                                </span>
                                <span className="text-sm text-gray-500 dark:text-slate-400">
                                  Submitted: {assignment.submissionDate}
                                </span>
                              </div>
                              {assignment.feedback && (
                                <p className="text-sm text-gray-600 dark:text-slate-300">Feedback: {assignment.feedback}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <input
                                type="number"
                                placeholder="Score"
                                min="0"
                                max={assignment.maxScore}
                                className="input w-24"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const scoreInput = e.target as HTMLInputElement;
                                    const feedbackInput = scoreInput.nextElementSibling as HTMLInputElement;
                                    const score = parseInt(scoreInput.value);
                                    const feedback = feedbackInput.value;
                                    
                                    if (score >= 0 && score <= assignment.maxScore) {
                                      handleGradeAssignment(assignment.id, score, feedback);
                                      scoreInput.value = '';
                                      feedbackInput.value = '';
                                    }
                                  }
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Feedback (optional)"
                                className="input flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const feedbackInput = e.target as HTMLInputElement;
                                    const scoreInput = feedbackInput.previousElementSibling as HTMLInputElement;
                                    const score = parseInt(scoreInput.value);
                                    const feedback = feedbackInput.value;
                                    
                                    if (score >= 0 && score <= assignment.maxScore) {
                                      handleGradeAssignment(assignment.id, score, feedback);
                                      scoreInput.value = '';
                                      feedbackInput.value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  const container = e.currentTarget.parentElement;
                                  const scoreInput = container?.querySelector('input[type="number"]') as HTMLInputElement;
                                  const feedbackInput = container?.querySelector('input[type="text"]') as HTMLInputElement;
                                  const score = parseInt(scoreInput.value);
                                  const feedback = feedbackInput.value;
                                  
                                  if (score >= 0 && score <= assignment.maxScore) {
                                    handleGradeAssignment(assignment.id, score, feedback);
                                    scoreInput.value = '';
                                    feedbackInput.value = '';
                                  }
                                }}
                              >
                                Grade
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
              <button
                id="export-data-btn"
                className="btn btn-primary flex items-center gap-2"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
            
            {/* Class Performance Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Class Performance Overview</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-slate-600" />
                  <XAxis dataKey="month" className="text-gray-600 dark:text-slate-400" />
                  <YAxis className="text-gray-600 dark:text-slate-400" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="average" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Student Performance Table */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Student Performance Summary</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Student</th>
                      <th className="table-header px-6 py-3">Class</th>
                      <th className="table-header px-6 py-3">Overall Grade</th>
                      <th className="table-header px-6 py-3">Attendance</th>
                      <th className="table-header px-6 py-3">Assignments</th>
                      <th className="table-header px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {students.map(student => {
                      const completedAssignments = student.assignments.filter(a => a.status === 'graded').length;
                      const totalAssignments = student.assignments.length;
                      
                      return (
                        <tr key={student.id}>
                          <td className="table-cell">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex-center">
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </td>
                          <td className="table-cell">{student.class}</td>
                          <td className="table-cell">
                            <span className={`font-medium ${
                              student.overallGrade >= 90 ? 'text-green-600 dark:text-green-400' :
                              student.overallGrade >= 80 ? 'text-blue-600 dark:text-blue-400' :
                              student.overallGrade >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {student.overallGrade}%
                            </span>
                          </td>
                          <td className="table-cell">{student.attendance}%</td>
                          <td className="table-cell">{completedAssignments}/{totalAssignments}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              student.overallGrade >= 90 ? 'badge-success' :
                              student.overallGrade >= 80 ? 'badge-info' :
                              student.overallGrade >= 70 ? 'badge-warning' : 'badge-error'
                            }`}>
                              {student.overallGrade >= 90 ? 'Excellent' :
                               student.overallGrade >= 80 ? 'Good' :
                               student.overallGrade >= 70 ? 'Average' : 'Needs Help'}
                            </span>
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            
            {/* Data Management */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Import Students</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Upload a CSV file to import multiple students</p>
                  <div className="flex gap-2">
                    <button
                      className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                      onClick={handleDownloadTemplate}
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                    <label className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImportData}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Download your data for backup or analysis</p>
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={handleExportData}
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </button>
                </div>
              </div>
            </div>
            
            {/* Appearance */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Toggle between light and dark themes</p>
                </div>
                <button
                  id="theme-toggle"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    darkMode ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Danger Zone */}
            <div className="card border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-400">Danger Zone</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Clear All Data</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">This will permanently delete all students, assignments, and settings</p>
                  <button
                    className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
                    onClick={() => setShowDeleteConfirm('all-data')}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      
      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="modal-backdrop" onClick={() => setShowAddStudent(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Student</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddStudent(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newStudent.name || ''}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter student name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={newStudent.email || ''}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter student email"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select
                  className="input"
                  value={newStudent.class || ''}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, class: e.target.value }))}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={newStudent.notes || ''}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the student"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={() => setShowAddStudent(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddStudent}
                disabled={!newStudent.name || !newStudent.email || !newStudent.class}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="modal-backdrop" onClick={() => setEditingStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Student</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setEditingStudent(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  className="input"
                  value={editingStudent.class}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, class: e.target.value } : null)}
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Attendance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={editingStudent.attendance}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, attendance: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={editingStudent.notes}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={() => setEditingStudent(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => editingStudent && handleUpdateStudent(editingStudent)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignment && selectedStudent && (
        <div className="modal-backdrop" onClick={() => setShowAddAssignment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Assignment for {selectedStudent.name}</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddAssignment(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="input"
                  value={newAssignment.title || ''}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Assignment title"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="input"
                  value={newAssignment.subject || selectedStudent.class}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={newAssignment.dueDate || ''}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Maximum Score</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={newAssignment.maxScore || 100}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={() => setShowAddAssignment(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddAssignment}
                disabled={!newAssignment.title}
              >
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAiAnalysis && (
        <div className="modal-backdrop" onClick={() => setShowAiAnalysis(false)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Analysis Results
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAiAnalysis(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4">
              {isAiLoading && (
                <div className="flex-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-slate-400">Analyzing data...</span>
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <p>Failed to analyze data. Please try again.</p>
                </div>
              )}
              
              {aiResult && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">
                      {aiResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setShowAiAnalysis(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowDeleteConfirm(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600 dark:text-slate-400">
                {showDeleteConfirm === 'all-data' 
                  ? 'Are you sure you want to delete ALL data? This action cannot be undone.'
                  : 'Are you sure you want to delete this student? This action cannot be undone.'}
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  if (showDeleteConfirm === 'all-data') {
                    handleClearAllData();
                  } else {
                    handleDeleteStudent(showDeleteConfirm);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;