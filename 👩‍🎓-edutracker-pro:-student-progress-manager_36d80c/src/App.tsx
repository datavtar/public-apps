import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Camera, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  GraduationCap,
  Medal,
  Target,
  Clock,
  Eye,
  Moon,
  Sun,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Camera as ReactCameraProCamera } from 'react-camera-pro';

// Types and Interfaces
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  photo?: string;
  averageGrade: number;
  attendanceRate: number;
  notes: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  totalPoints: number;
  dueDate: string;
  createdDate: string;
  type: 'homework' | 'quiz' | 'test' | 'project';
  status: 'active' | 'completed' | 'draft';
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  submittedDate: string;
  feedback: string;
  status: 'graded' | 'pending' | 'late';
}

interface ProgressData {
  studentId: string;
  studentName: string;
  assignments: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
}

// Dark mode hook
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

function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Camera state
  const cameraRef = useRef<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    grade: '',
    notes: ''
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject: '',
    totalPoints: '',
    dueDate: '',
    type: 'homework' as const
  });
  
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    assignmentId: '',
    score: '',
    feedback: '',
    status: 'graded' as const
  });

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('edutracker_students');
    const savedAssignments = localStorage.getItem('edutracker_assignments');
    const savedGrades = localStorage.getItem('edutracker_grades');
    
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Initialize with sample data
      const sampleStudents: Student[] = [
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@school.edu',
          grade: '10',
          enrollmentDate: '2024-09-01',
          averageGrade: 88.5,
          attendanceRate: 95,
          notes: 'Excellent student, participates actively in class discussions.'
        },
        {
          id: '2',
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@school.edu',
          grade: '10',
          enrollmentDate: '2024-09-01',
          averageGrade: 76.2,
          attendanceRate: 88,
          notes: 'Good potential, needs more practice with homework assignments.'
        },
        {
          id: '3',
          firstName: 'Carol',
          lastName: 'Davis',
          email: 'carol.davis@school.edu',
          grade: '11',
          enrollmentDate: '2024-09-01',
          averageGrade: 92.8,
          attendanceRate: 98,
          notes: 'Outstanding performance across all subjects.'
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('edutracker_students', JSON.stringify(sampleStudents));
    }
    
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    } else {
      // Initialize with sample data
      const sampleAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Mathematics Quiz 1',
          description: 'Algebra and geometry fundamentals',
          subject: 'Mathematics',
          totalPoints: 100,
          dueDate: '2025-06-15',
          createdDate: '2025-06-05',
          type: 'quiz',
          status: 'active'
        },
        {
          id: '2',
          title: 'Science Project',
          description: 'Physics experiment on motion',
          subject: 'Physics',
          totalPoints: 150,
          dueDate: '2025-06-20',
          createdDate: '2025-06-01',
          type: 'project',
          status: 'active'
        },
        {
          id: '3',
          title: 'English Essay',
          description: 'Literary analysis of Romeo and Juliet',
          subject: 'English',
          totalPoints: 75,
          dueDate: '2025-06-18',
          createdDate: '2025-06-03',
          type: 'homework',
          status: 'active'
        }
      ];
      setAssignments(sampleAssignments);
      localStorage.setItem('edutracker_assignments', JSON.stringify(sampleAssignments));
    }
    
    if (savedGrades) {
      setGrades(JSON.parse(savedGrades));
    } else {
      // Initialize with sample data
      const sampleGrades: Grade[] = [
        {
          id: '1',
          studentId: '1',
          assignmentId: '1',
          score: 92,
          submittedDate: '2025-06-14',
          feedback: 'Excellent work on problem solving',
          status: 'graded'
        },
        {
          id: '2',
          studentId: '2',
          assignmentId: '1',
          score: 78,
          submittedDate: '2025-06-15',
          feedback: 'Good effort, review geometric formulas',
          status: 'graded'
        },
        {
          id: '3',
          studentId: '3',
          assignmentId: '1',
          score: 96,
          submittedDate: '2025-06-13',
          feedback: 'Outstanding performance',
          status: 'graded'
        }
      ];
      setGrades(sampleGrades);
      localStorage.setItem('edutracker_grades', JSON.stringify(sampleGrades));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('edutracker_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edutracker_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('edutracker_grades', JSON.stringify(grades));
  }, [grades]);

  // Utility functions
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    return assignment ? assignment.title : 'Unknown Assignment';
  };

  const calculateStudentAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.status === 'graded');
    if (studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, grade) => {
      const assignment = assignments.find(a => a.id === grade.assignmentId);
      return sum + (grade.score / (assignment?.totalPoints || 100)) * 100;
    }, 0);
    return Math.round(total / studentGrades.length * 10) / 10;
  };

  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach(student => {
      const avg = calculateStudentAverage(student.id);
      if (avg >= 90) distribution.A++;
      else if (avg >= 80) distribution.B++;
      else if (avg >= 70) distribution.C++;
      else if (avg >= 60) distribution.D++;
      else distribution.F++;
    });
    return Object.entries(distribution).map(([grade, count]) => ({ grade, count }));
  };

  const getProgressData = (): ProgressData[] => {
    return students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id && g.status === 'graded');
      const averageScore = calculateStudentAverage(student.id);
      
      // Calculate trend (simplified)
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (studentGrades.length >= 2) {
        const recent = studentGrades.slice(-2);
        const recentAvg = recent.reduce((sum, g) => sum + g.score, 0) / recent.length;
        const older = studentGrades.slice(-4, -2);
        if (older.length > 0) {
          const olderAvg = older.reduce((sum, g) => sum + g.score, 0) / older.length;
          trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';
        }
      }
      
      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        assignments: studentGrades.length,
        averageScore,
        trend
      };
    });
  };

  // Confirmation dialog
  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Student management
  const handleAddStudent = () => {
    if (!studentForm.firstName.trim() || !studentForm.lastName.trim()) {
      alert('Please fill in required fields');
      return;
    }
    
    const newStudent: Student = {
      id: Date.now().toString(),
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      email: studentForm.email.trim(),
      grade: studentForm.grade,
      enrollmentDate: new Date().toISOString().split('T')[0],
      averageGrade: 0,
      attendanceRate: 100,
      notes: studentForm.notes.trim(),
      photo: capturedPhoto || undefined
    };
    
    setStudents([...students, newStudent]);
    setStudentForm({ firstName: '', lastName: '', email: '', grade: '', notes: '' });
    setCapturedPhoto(null);
    setShowStudentModal(false);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      grade: student.grade,
      notes: student.notes
    });
    setCapturedPhoto(student.photo || null);
    setShowStudentModal(true);
  };

  const handleUpdateStudent = () => {
    if (!selectedStudent || !studentForm.firstName.trim() || !studentForm.lastName.trim()) {
      alert('Please fill in required fields');
      return;
    }
    
    const updatedStudent: Student = {
      ...selectedStudent,
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      email: studentForm.email.trim(),
      grade: studentForm.grade,
      notes: studentForm.notes.trim(),
      photo: capturedPhoto || selectedStudent.photo
    };
    
    setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
    setSelectedStudent(null);
    setStudentForm({ firstName: '', lastName: '', email: '', grade: '', notes: '' });
    setCapturedPhoto(null);
    setShowStudentModal(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    showConfirmation('Are you sure you want to delete this student? This will also remove all associated grades.', () => {
      setStudents(students.filter(s => s.id !== studentId));
      setGrades(grades.filter(g => g.studentId !== studentId));
    });
  };

  // Assignment management
  const handleAddAssignment = () => {
    if (!assignmentForm.title.trim() || !assignmentForm.totalPoints || !assignmentForm.dueDate) {
      alert('Please fill in required fields');
      return;
    }
    
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: assignmentForm.title.trim(),
      description: assignmentForm.description.trim(),
      subject: assignmentForm.subject.trim(),
      totalPoints: parseInt(assignmentForm.totalPoints),
      dueDate: assignmentForm.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      type: assignmentForm.type,
      status: 'active'
    };
    
    setAssignments([...assignments, newAssignment]);
    setAssignmentForm({ title: '', description: '', subject: '', totalPoints: '', dueDate: '', type: 'homework' });
    setShowAssignmentModal(false);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      totalPoints: assignment.totalPoints.toString(),
      dueDate: assignment.dueDate,
      type: assignment.type
    });
    setShowAssignmentModal(true);
  };

  const handleUpdateAssignment = () => {
    if (!selectedAssignment || !assignmentForm.title.trim() || !assignmentForm.totalPoints || !assignmentForm.dueDate) {
      alert('Please fill in required fields');
      return;
    }
    
    const updatedAssignment: Assignment = {
      ...selectedAssignment,
      title: assignmentForm.title.trim(),
      description: assignmentForm.description.trim(),
      subject: assignmentForm.subject.trim(),
      totalPoints: parseInt(assignmentForm.totalPoints),
      dueDate: assignmentForm.dueDate,
      type: assignmentForm.type
    };
    
    setAssignments(assignments.map(a => a.id === selectedAssignment.id ? updatedAssignment : a));
    setSelectedAssignment(null);
    setAssignmentForm({ title: '', description: '', subject: '', totalPoints: '', dueDate: '', type: 'homework' });
    setShowAssignmentModal(false);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    showConfirmation('Are you sure you want to delete this assignment? This will also remove all associated grades.', () => {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
      setGrades(grades.filter(g => g.assignmentId !== assignmentId));
    });
  };

  // Grade management
  const handleAddGrade = () => {
    if (!gradeForm.studentId || !gradeForm.assignmentId || !gradeForm.score) {
      alert('Please fill in required fields');
      return;
    }
    
    const assignment = assignments.find(a => a.id === gradeForm.assignmentId);
    const score = parseFloat(gradeForm.score);
    
    if (!assignment || score > assignment.totalPoints || score < 0) {
      alert('Invalid score. Score must be between 0 and total points.');
      return;
    }
    
    // Check if grade already exists
    const existingGrade = grades.find(g => g.studentId === gradeForm.studentId && g.assignmentId === gradeForm.assignmentId);
    
    if (existingGrade) {
      // Update existing grade
      const updatedGrade: Grade = {
        ...existingGrade,
        score,
        feedback: gradeForm.feedback.trim(),
        status: gradeForm.status,
        submittedDate: new Date().toISOString().split('T')[0]
      };
      setGrades(grades.map(g => g.id === existingGrade.id ? updatedGrade : g));
    } else {
      // Add new grade
      const newGrade: Grade = {
        id: Date.now().toString(),
        studentId: gradeForm.studentId,
        assignmentId: gradeForm.assignmentId,
        score,
        submittedDate: new Date().toISOString().split('T')[0],
        feedback: gradeForm.feedback.trim(),
        status: gradeForm.status
      };
      setGrades([...grades, newGrade]);
    }
    
    setGradeForm({ studentId: '', assignmentId: '', score: '', feedback: '', status: 'graded' });
    setShowGradeModal(false);
  };

  const handleDeleteGrade = (gradeId: string) => {
    showConfirmation('Are you sure you want to delete this grade?', () => {
      setGrades(grades.filter(g => g.id !== gradeId));
    });
  };

  // Camera functions
  const handleTakePhoto = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto();
      setCapturedPhoto(photo);
      setShowCameraModal(false);
    }
  };

  // AI Functions
  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      alert('Please provide a prompt or select a file for analysis.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    const additionalContext = `
    You are analyzing student performance data or educational documents. 
    If extracting data from documents, return JSON with fields: 
    {"studentName": "", "subject": "", "score": "", "totalPoints": "", "feedback": "", "notes": ""}
    If analyzing performance patterns, provide insights in markdown format.
    `;

    const fullPrompt = aiPrompt.trim() + ' ' + additionalContext;
    
    try {
      aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const handleAIResult = (result: string) => {
    setAiResult(result);
    
    // Try to parse as JSON for data extraction
    try {
      const parsedData = JSON.parse(result);
      if (parsedData.studentName && parsedData.score) {
        // Auto-fill grade form if it's grade data
        const student = students.find(s => 
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(parsedData.studentName.toLowerCase())
        );
        if (student) {
          setGradeForm(prev => ({
            ...prev,
            studentId: student.id,
            score: parsedData.score,
            feedback: parsedData.feedback || parsedData.notes || ''
          }));
          setShowGradeModal(true);
        }
      }
    } catch (e) {
      // Result is not JSON, display as markdown
    }
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Data import/export
  const handleExportData = (type: 'students' | 'assignments' | 'grades') => {
    let data;
    let filename;
    
    switch (type) {
      case 'students':
        data = students.map(s => ({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          grade: s.grade,
          averageGrade: calculateStudentAverage(s.id),
          notes: s.notes
        }));
        filename = 'students.csv';
        break;
      case 'assignments':
        data = assignments.map(a => ({
          title: a.title,
          description: a.description,
          subject: a.subject,
          totalPoints: a.totalPoints,
          dueDate: a.dueDate,
          type: a.type,
          status: a.status
        }));
        filename = 'assignments.csv';
        break;
      case 'grades':
        data = grades.map(g => ({
          studentName: getStudentName(g.studentId),
          assignmentTitle: getAssignmentTitle(g.assignmentId),
          score: g.score,
          submittedDate: g.submittedDate,
          feedback: g.feedback,
          status: g.status
        }));
        filename = 'grades.csv';
        break;
    }
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const newStudents: Student[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length >= 3 && values[0] && values[1]) {
            const student: Student = {
              id: Date.now().toString() + i,
              firstName: values[0],
              lastName: values[1],
              email: values[2] || '',
              grade: values[3] || '',
              enrollmentDate: new Date().toISOString().split('T')[0],
              averageGrade: 0,
              attendanceRate: 100,
              notes: values[5] || ''
            };
            newStudents.push(student);
          }
        }
        
        if (newStudents.length > 0) {
          setStudents([...students, ...newStudents]);
          alert(`Successfully imported ${newStudents.length} students`);
        } else {
          alert('No valid student data found in the file');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it\'s a valid CSV format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadTemplate = (type: 'students' | 'assignments') => {
    let headers: string[];
    let sampleData: string[];
    let filename: string;
    
    if (type === 'students') {
      headers = ['firstName', 'lastName', 'email', 'grade', 'notes'];
      sampleData = ['John', 'Doe', 'john.doe@school.edu', '10', 'Sample student'];
      filename = 'students_template.csv';
    } else {
      headers = ['title', 'description', 'subject', 'totalPoints', 'dueDate', 'type'];
      sampleData = ['Sample Assignment', 'Description here', 'Math', '100', '2025-06-30', 'homework'];
      filename = 'assignments_template.csv';
    }
    
    const csvContent = [
      headers.join(','),
      sampleData.map(item => `"${item}"`).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    showConfirmation('Are you sure you want to clear all data? This action cannot be undone.', () => {
      setStudents([]);
      setAssignments([]);
      setGrades([]);
      localStorage.removeItem('edutracker_students');
      localStorage.removeItem('edutracker_assignments');
      localStorage.removeItem('edutracker_grades');
    });
  };

  // Filtered data
  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const gradeDistributionData = getGradeDistribution();
  const progressData = getProgressData();

  // Chart data
  const assignmentTypesData = assignments.reduce((acc, assignment) => {
    acc[assignment.type] = (acc[assignment.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(assignmentTypesData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={handleAIResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduTracker Pro</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student Progress Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {currentUser.first_name}
                </span>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-lg mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'gradebook', label: 'Gradebook', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'reports', label: 'Reports', icon: Download },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="generation_issue_fallback" className="container-lg mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="heading-2">Dashboard Overview</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Students</div>
                <div className="stat-value">{students.length}</div>
                <div className="stat-change stat-increase">
                  <TrendingUp className="w-4 h-4" />
                  Active enrollments
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Active Assignments</div>
                <div className="stat-value">{assignments.filter(a => a.status === 'active').length}</div>
                <div className="stat-change stat-increase">
                  <Target className="w-4 h-4" />
                  In progress
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Class Average</div>
                <div className="stat-value">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + calculateStudentAverage(s.id), 0) / students.length)
                    : 0}%
                </div>
                <div className="stat-change stat-increase">
                  <Medal className="w-4 h-4" />
                  Overall performance
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Graded Assignments</div>
                <div className="stat-value">{grades.filter(g => g.status === 'graded').length}</div>
                <div className="stat-change stat-increase">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Assignment Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {grades.slice(-5).reverse().map(grade => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getStudentName(grade.studentId)} submitted {getAssignmentTitle(grade.assignmentId)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score: {grade.score} • {grade.submittedDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${grade.score >= 90 ? 'badge-success' : grade.score >= 70 ? 'badge-warning' : 'badge-error'}`}>
                        {Math.round((grade.score / (assignments.find(a => a.id === grade.assignmentId)?.totalPoints || 100)) * 100)}%
                      </span>
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
            <div className="flex items-center justify-between">
              <h2 className="heading-2">Student Management</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadTemplate('students')}
                  className="btn btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
                <label className="btn btn-secondary btn-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportStudents}
                    className="hidden"
                  />
                </label>
                <button
                  id="add-student-btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentForm({ firstName: '', lastName: '', email: '', grade: '', notes: '' });
                    setCapturedPhoto(null);
                    setShowStudentModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="select"
                >
                  <option value="all">All Grades</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <div key={student.id} className="card card-padding card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {student.photo ? (
                          <img src={student.photo} alt={`${student.firstName} ${student.lastName}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <Users className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Grade {student.grade}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Grade</span>
                      <span className={`badge ${calculateStudentAverage(student.id) >= 90 ? 'badge-success' : calculateStudentAverage(student.id) >= 70 ? 'badge-warning' : 'badge-error'}`}>
                        {calculateStudentAverage(student.id)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Assignments</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {grades.filter(g => g.studentId === student.id).length}
                      </span>
                    </div>
                    
                    {student.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {student.email}
                      </div>
                    )}
                    
                    {student.notes && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {student.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || filterGrade !== 'all' ? 'Try adjusting your search criteria' : 'Get started by adding your first student'}
                </p>
                {!searchTerm && filterGrade === 'all' && (
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentForm({ firstName: '', lastName: '', email: '', grade: '', notes: '' });
                      setCapturedPhoto(null);
                      setShowStudentModal(true);
                    }}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4" />
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
            <div className="flex items-center justify-between">
              <h2 className="heading-2">Assignment Management</h2>
              <button
                id="add-assignment-btn"
                onClick={() => {
                  setSelectedAssignment(null);
                  setAssignmentForm({ title: '', description: '', subject: '', totalPoints: '', dueDate: '', type: 'homework' });
                  setShowAssignmentModal(true);
                }}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Assignment
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Title</th>
                    <th className="table-header-cell">Subject</th>
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell">Points</th>
                    <th className="table-header-cell">Due Date</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          {assignment.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">{assignment.subject}</td>
                      <td className="table-cell">
                        <span className="badge badge-primary capitalize">{assignment.type}</span>
                      </td>
                      <td className="table-cell">{assignment.totalPoints}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {assignment.dueDate}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${assignment.status === 'active' ? 'badge-success' : assignment.status === 'completed' ? 'badge-gray' : 'badge-warning'}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {assignments.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first assignment to get started</p>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setAssignmentForm({ title: '', description: '', subject: '', totalPoints: '', dueDate: '', type: 'homework' });
                    setShowAssignmentModal(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Gradebook Tab */}
        {activeTab === 'gradebook' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-2">Gradebook</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="ai-file-input"
                  />
                  <label htmlFor="ai-file-input" className="btn btn-secondary btn-sm cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload for AI Analysis
                  </label>
                </div>
                <button
                  id="add-grade-btn"
                  onClick={() => {
                    setGradeForm({ studentId: '', assignmentId: '', score: '', feedback: '', status: 'graded' });
                    setShowGradeModal(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Grade
                </button>
              </div>
            </div>

            {/* AI Analysis Section */}
            {(selectedFile || aiResult) && (
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">AI Grade Analysis</h3>
                {selectedFile && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Selected file: {selectedFile.name}
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Additional instructions for AI analysis..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="input flex-1"
                      />
                      <button
                        onClick={handleAIAnalysis}
                        disabled={aiLoading}
                        className="btn btn-primary"
                      >
                        {aiLoading ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                  </div>
                )}
                
                {aiLoading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Analyzing document with AI...
                  </div>
                )}
                
                {aiError && (
                  <div className="alert alert-error">
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Analysis Error</p>
                      <p className="text-sm">{aiError.toString()}</p>
                    </div>
                  </div>
                )}
                
                {aiResult && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">AI Analysis Result:</h4>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Student</th>
                    <th className="table-header-cell">Assignment</th>
                    <th className="table-header-cell">Score</th>
                    <th className="table-header-cell">Percentage</th>
                    <th className="table-header-cell">Submitted</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {grades.map(grade => {
                    const assignment = assignments.find(a => a.id === grade.assignmentId);
                    const percentage = assignment ? Math.round((grade.score / assignment.totalPoints) * 100) : 0;
                    
                    return (
                      <tr key={grade.id} className="table-row">
                        <td className="table-cell">{getStudentName(grade.studentId)}</td>
                        <td className="table-cell">{getAssignmentTitle(grade.assignmentId)}</td>
                        <td className="table-cell">
                          {grade.score} / {assignment?.totalPoints || 0}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${percentage >= 90 ? 'badge-success' : percentage >= 70 ? 'badge-warning' : 'badge-error'}`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="table-cell">{grade.submittedDate}</td>
                        <td className="table-cell">
                          <span className={`badge ${grade.status === 'graded' ? 'badge-success' : grade.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                            {grade.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setGradeForm({
                                  studentId: grade.studentId,
                                  assignmentId: grade.assignmentId,
                                  score: grade.score.toString(),
                                  feedback: grade.feedback,
                                  status: grade.status
                                });
                                setShowGradeModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

            {grades.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No grades recorded</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start grading assignments to build your gradebook</p>
                <button
                  onClick={() => {
                    setGradeForm({ studentId: '', assignmentId: '', score: '', feedback: '', status: 'graded' });
                    setShowGradeModal(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add First Grade
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="heading-2">Student Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Student Progress Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="studentName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="averageScore" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Student Progress Table */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Individual Student Progress</h3>
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Student</th>
                      <th className="table-header-cell">Assignments Completed</th>
                      <th className="table-header-cell">Average Score</th>
                      <th className="table-header-cell">Trend</th>
                      <th className="table-header-cell">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {progressData.map(data => (
                      <tr key={data.studentId} className="table-row">
                        <td className="table-cell font-medium">{data.studentName}</td>
                        <td className="table-cell">{data.assignments}</td>
                        <td className="table-cell">
                          <span className={`badge ${data.averageScore >= 90 ? 'badge-success' : data.averageScore >= 70 ? 'badge-warning' : 'badge-error'}`}>
                            {data.averageScore}%
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            {data.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {data.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {data.trend === 'stable' && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                            <span className="capitalize text-sm">{data.trend}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${data.averageScore >= 90 ? 'bg-green-500' : data.averageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(data.averageScore, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-12">{data.averageScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="heading-2">Reports & Export</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Student Reports</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Export student information and performance data</p>
                <button
                  onClick={() => handleExportData('students')}
                  className="btn btn-primary w-full"
                >
                  <Download className="w-4 h-4" />
                  Export Students CSV
                </button>
              </div>
              
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Assignment Reports</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Export assignment details and statistics</p>
                <button
                  onClick={() => handleExportData('assignments')}
                  className="btn btn-primary w-full"
                >
                  <Download className="w-4 h-4" />
                  Export Assignments CSV
                </button>
              </div>
              
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Grade Reports</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Export complete gradebook data</p>
                <button
                  onClick={() => handleExportData('grades')}
                  className="btn btn-primary w-full"
                >
                  <Download className="w-4 h-4" />
                  Export Grades CSV
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Quick Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{students.length}</div>
                  <div className="text-sm text-gray-500">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{assignments.length}</div>
                  <div className="text-sm text-gray-500">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{grades.length}</div>
                  <div className="text-sm text-gray-500">Total Grades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {students.length > 0 
                      ? Math.round(students.reduce((sum, s) => sum + calculateStudentAverage(s.id), 0) / students.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Class Average</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="heading-2">Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Import Templates</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadTemplate('students')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download className="w-4 h-4" />
                          Student Template
                        </button>
                        <button
                          onClick={() => downloadTemplate('assignments')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download className="w-4 h-4" />
                          Assignment Template
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Data Export</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExportData('students')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download className="w-4 h-4" />
                          Export Students
                        </button>
                        <button
                          onClick={() => handleExportData('grades')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download className="w-4 h-4" />
                          Export Grades
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                      <button
                        onClick={clearAllData}
                        className="btn btn-error btn-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </button>
                      <p className="text-xs text-gray-500 mt-1">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Grade Scales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>A: 90-100%</span>
                      <span className="badge badge-success">Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B: 80-89%</span>
                      <span className="badge badge-primary">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C: 70-79%</span>
                      <span className="badge badge-warning">Average</span>
                    </div>
                    <div className="flex justify-between">
                      <span>D: 60-69%</span>
                      <span className="badge badge-error">Below Average</span>
                    </div>
                    <div className="flex justify-between">
                      <span>F: 0-59%</span>
                      <span className="badge badge-error">Failing</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">AI Features</h3>
                  <div className="space-y-4">
                    <div className="alert alert-info">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-medium">AI-Powered Analysis</p>
                          <p className="text-sm mt-1">
                            Upload documents or test papers for automatic grade extraction and analysis. 
                            The AI can help identify student performance patterns and extract data from various document formats.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="alert alert-warning">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">AI Disclaimer</p>
                          <p className="text-sm mt-1">
                            AI analysis results should be reviewed and verified. 
                            Always double-check extracted grades and recommendations before finalizing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">System Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Storage</span>
                      <span>Local Browser</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Backup</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      
      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-backdrop" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                {capturedPhoto && (
                  <div className="flex justify-center">
                    <img src={capturedPhoto} alt="Student photo" className="w-24 h-24 rounded-full object-cover" />
                  </div>
                )}
                
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowCameraModal(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Camera className="w-4 h-4" />
                    {capturedPhoto ? 'Retake Photo' : 'Take Photo'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">First Name</label>
                    <input
                      type="text"
                      value={studentForm.firstName}
                      onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                      className="input"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label form-label-required">Last Name</label>
                    <input
                      type="text"
                      value={studentForm.lastName}
                      onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                      className="input"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    className="input"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select
                    value={studentForm.grade}
                    onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                    className="select"
                  >
                    <option value="">Select grade</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={studentForm.notes}
                    onChange={(e) => setStudentForm({...studentForm, notes: e.target.value})}
                    className="textarea"
                    rows={3}
                    placeholder="Additional notes about the student"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowStudentModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={selectedStudent ? handleUpdateStudent : handleAddStudent}
                className="btn btn-primary"
              >
                {selectedStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignmentModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">{selectedAssignment ? 'Edit Assignment' : 'Add New Assignment'}</h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Title</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                    className="input"
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    className="textarea"
                    rows={3}
                    placeholder="Enter assignment description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      value={assignmentForm.subject}
                      onChange={(e) => setAssignmentForm({...assignmentForm, subject: e.target.value})}
                      className="input"
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label form-label-required">Total Points</label>
                    <input
                      type="number"
                      value={assignmentForm.totalPoints}
                      onChange={(e) => setAssignmentForm({...assignmentForm, totalPoints: e.target.value})}
                      className="input"
                      placeholder="100"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Due Date</label>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      value={assignmentForm.type}
                      onChange={(e) => setAssignmentForm({...assignmentForm, type: e.target.value as any})}
                      className="select"
                    >
                      <option value="homework">Homework</option>
                      <option value="quiz">Quiz</option>
                      <option value="test">Test</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={selectedAssignment ? handleUpdateAssignment : handleAddAssignment}
                className="btn btn-primary"
              >
                {selectedAssignment ? 'Update Assignment' : 'Add Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="modal-backdrop" onClick={() => setShowGradeModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Add/Edit Grade</h3>
              <button
                onClick={() => setShowGradeModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Student</label>
                  <select
                    value={gradeForm.studentId}
                    onChange={(e) => setGradeForm({...gradeForm, studentId: e.target.value})}
                    className="select"
                  >
                    <option value="">Select student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label form-label-required">Assignment</label>
                  <select
                    value={gradeForm.assignmentId}
                    onChange={(e) => setGradeForm({...gradeForm, assignmentId: e.target.value})}
                    className="select"
                  >
                    <option value="">Select assignment</option>
                    {assignments.map(assignment => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.title} ({assignment.totalPoints} pts)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Score</label>
                    <input
                      type="number"
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                      className="input"
                      placeholder="85"
                      min="0"
                      max={gradeForm.assignmentId ? assignments.find(a => a.id === gradeForm.assignmentId)?.totalPoints : undefined}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={gradeForm.status}
                      onChange={(e) => setGradeForm({...gradeForm, status: e.target.value as any})}
                      className="select"
                    >
                      <option value="graded">Graded</option>
                      <option value="pending">Pending</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Feedback</label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                    className="textarea"
                    rows={3}
                    placeholder="Optional feedback for the student"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowGradeModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGrade}
                className="btn btn-primary"
              >
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="modal-backdrop" onClick={() => setShowCameraModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Take Student Photo</h3>
              <button
                onClick={() => setShowCameraModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <ReactCameraProCamera
                    ref={cameraRef}
                    aspectRatio="cover"
                    facingMode="user"
                  />
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={handleTakePhoto}
                    className="btn btn-primary"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Confirm Action</h3>
            </div>
            
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-400">{confirmMessage}</p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-error"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container-lg mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;