import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Clock, Download, Edit, Plus, Search, Trash2, TrendingUp, User, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  attendance: number;
  notes: string;
}

interface Assessment {
  id: string;
  title: string;
  date: string;
  maxScore: number;
  type: 'quiz' | 'test' | 'assignment' | 'project' | 'exam';
  description: string;
}

interface StudentScore {
  studentId: string;
  assessmentId: string;
  score: number;
  feedback: string;
  submissionDate: string;
}

interface StudentAttendance {
  studentId: string;
  date: string;
  present: boolean;
  notes: string;
}

type SortField = 'name' | 'grade' | 'attendance';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State definitions
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studentScores, setStudentScores] = useState<StudentScore[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState<string>('all');

  // Initial sample data
  const sampleStudents: Student[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@school.edu',
      grade: '10',
      enrollmentDate: '2023-09-01',
      attendance: 92,
      notes: 'Excellent student. Participates well in class.'
    },
    {
      id: '2',
      name: 'Emma Johnson',
      email: 'emma.j@school.edu',
      grade: '9',
      enrollmentDate: '2023-09-01',
      attendance: 88,
      notes: 'Needs help with math concepts.'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.b@school.edu',
      grade: '11',
      enrollmentDate: '2023-09-01',
      attendance: 95,
      notes: 'Strong in science subjects.'
    },
    {
      id: '4',
      name: 'Sophia Garcia',
      email: 'sophia.g@school.edu',
      grade: '10',
      enrollmentDate: '2023-09-01',
      attendance: 90,
      notes: 'Creative writer with excellent analytical skills.'
    },
    {
      id: '5',
      name: 'William Chen',
      email: 'william.c@school.edu',
      grade: '9',
      enrollmentDate: '2023-09-01',
      attendance: 85,
      notes: 'Good at group work, needs to improve individual assignments.'
    }
  ];

  const sampleAssessments: Assessment[] = [
    {
      id: '1',
      title: 'Mid-term Math Exam',
      date: '2023-10-15',
      maxScore: 100,
      type: 'exam',
      description: 'Covers algebra, geometry, and trigonometry'
    },
    {
      id: '2',
      title: 'Science Project',
      date: '2023-11-05',
      maxScore: 50,
      type: 'project',
      description: 'Research project on renewable energy'
    },
    {
      id: '3',
      title: 'Weekly English Quiz',
      date: '2023-09-22',
      maxScore: 20,
      type: 'quiz',
      description: 'Vocabulary and grammar'
    }
  ];

  const sampleScores: StudentScore[] = [
    { studentId: '1', assessmentId: '1', score: 88, feedback: 'Good work', submissionDate: '2023-10-15' },
    { studentId: '1', assessmentId: '2', score: 45, feedback: 'Excellent project', submissionDate: '2023-11-05' },
    { studentId: '1', assessmentId: '3', score: 18, feedback: 'Perfect score', submissionDate: '2023-09-22' },
    { studentId: '2', assessmentId: '1', score: 72, feedback: 'Needs improvement in geometry', submissionDate: '2023-10-15' },
    { studentId: '2', assessmentId: '2', score: 40, feedback: 'Good research skills', submissionDate: '2023-11-05' },
    { studentId: '2', assessmentId: '3', score: 15, feedback: 'Good effort', submissionDate: '2023-09-22' },
    { studentId: '3', assessmentId: '1', score: 95, feedback: 'Exceptional work', submissionDate: '2023-10-15' },
    { studentId: '3', assessmentId: '2', score: 48, feedback: 'Creative approach', submissionDate: '2023-11-05' },
    { studentId: '3', assessmentId: '3', score: 19, feedback: 'Almost perfect', submissionDate: '2023-09-22' },
    { studentId: '4', assessmentId: '1', score: 82, feedback: 'Good understanding of concepts', submissionDate: '2023-10-15' },
    { studentId: '4', assessmentId: '2', score: 44, feedback: 'Well-researched project', submissionDate: '2023-11-05' },
    { studentId: '4', assessmentId: '3', score: 17, feedback: 'Strong vocabulary', submissionDate: '2023-09-22' },
    { studentId: '5', assessmentId: '1', score: 78, feedback: 'Good effort, needs more practice', submissionDate: '2023-10-15' },
    { studentId: '5', assessmentId: '2', score: 38, feedback: 'Good start, could be more detailed', submissionDate: '2023-11-05' },
    { studentId: '5', assessmentId: '3', score: 16, feedback: 'Good understanding of grammar', submissionDate: '2023-09-22' }
  ];

  const sampleAttendance: StudentAttendance[] = [
    { studentId: '1', date: '2023-09-05', present: true, notes: '' },
    { studentId: '1', date: '2023-09-06', present: true, notes: '' },
    { studentId: '1', date: '2023-09-07', present: false, notes: 'Sick leave' },
    { studentId: '2', date: '2023-09-05', present: true, notes: '' },
    { studentId: '2', date: '2023-09-06', present: true, notes: '' },
    { studentId: '2', date: '2023-09-07', present: true, notes: '' },
    { studentId: '3', date: '2023-09-05', present: true, notes: '' },
    { studentId: '3', date: '2023-09-06', present: true, notes: '' },
    { studentId: '3', date: '2023-09-07', present: true, notes: '' },
    { studentId: '4', date: '2023-09-05', present: false, notes: 'Family emergency' },
    { studentId: '4', date: '2023-09-06', present: true, notes: '' },
    { studentId: '4', date: '2023-09-07', present: true, notes: '' },
    { studentId: '5', date: '2023-09-05', present: true, notes: '' },
    { studentId: '5', date: '2023-09-06', present: false, notes: 'Doctor appointment' },
    { studentId: '5', date: '2023-09-07', present: true, notes: '' }
  ];

  // Load data from localStorage on mount
  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load students
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(sampleStudents);
      localStorage.setItem('students', JSON.stringify(sampleStudents));
    }

    // Load assessments
    const savedAssessments = localStorage.getItem('assessments');
    if (savedAssessments) {
      setAssessments(JSON.parse(savedAssessments));
    } else {
      setAssessments(sampleAssessments);
      localStorage.setItem('assessments', JSON.stringify(sampleAssessments));
    }

    // Load scores
    const savedScores = localStorage.getItem('studentScores');
    if (savedScores) {
      setStudentScores(JSON.parse(savedScores));
    } else {
      setStudentScores(sampleScores);
      localStorage.setItem('studentScores', JSON.stringify(sampleScores));
    }

    // Load attendance
    const savedAttendance = localStorage.getItem('studentAttendance');
    if (savedAttendance) {
      setStudentAttendance(JSON.parse(savedAttendance));
    } else {
      setStudentAttendance(sampleAttendance);
      localStorage.setItem('studentAttendance', JSON.stringify(sampleAttendance));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem('assessments', JSON.stringify(assessments));
    }
  }, [assessments]);

  useEffect(() => {
    if (studentScores.length > 0) {
      localStorage.setItem('studentScores', JSON.stringify(studentScores));
    }
  }, [studentScores]);

  useEffect(() => {
    if (studentAttendance.length > 0) {
      localStorage.setItem('studentAttendance', JSON.stringify(studentAttendance));
    }
  }, [studentAttendance]);

  // Toggle dark mode
  const toggleDarkMode = (): void => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Modal handlers
  const openStudentModal = (student?: Student): void => {
    if (student) {
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
    }
    setIsStudentModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeStudentModal = (): void => {
    setIsStudentModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const openAssessmentModal = (assessment?: Assessment): void => {
    if (assessment) {
      setSelectedAssessment(assessment);
    } else {
      setSelectedAssessment(null);
    }
    setIsAssessmentModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeAssessmentModal = (): void => {
    setIsAssessmentModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const openScoreModal = (): void => {
    setIsScoreModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeScoreModal = (): void => {
    setIsScoreModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const openAttendanceModal = (): void => {
    setIsAttendanceModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeAttendanceModal = (): void => {
    setIsAttendanceModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Handle modal closing with Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (isStudentModalOpen) closeStudentModal();
        if (isAssessmentModalOpen) closeAssessmentModal();
        if (isScoreModalOpen) closeScoreModal();
        if (isAttendanceModalOpen) closeAttendanceModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isStudentModalOpen, isAssessmentModalOpen, isScoreModalOpen, isAttendanceModalOpen]);

  // CRUD operations
  const addOrUpdateStudent = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newStudent: Student = {
      id: selectedStudent?.id || Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      grade: formData.get('grade') as string,
      enrollmentDate: formData.get('enrollmentDate') as string,
      attendance: parseInt(formData.get('attendance') as string) || 0,
      notes: formData.get('notes') as string
    };

    if (selectedStudent) {
      // Update
      setStudents(students.map(s => s.id === selectedStudent.id ? newStudent : s));
    } else {
      // Add
      setStudents([...students, newStudent]);
    }

    closeStudentModal();
  };

  const deleteStudent = (id: string): void => {
    // Delete student and related records
    setStudents(students.filter(s => s.id !== id));
    setStudentScores(studentScores.filter(s => s.studentId !== id));
    setStudentAttendance(studentAttendance.filter(a => a.studentId !== id));
  };

  const addOrUpdateAssessment = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newAssessment: Assessment = {
      id: selectedAssessment?.id || Date.now().toString(),
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      maxScore: parseInt(formData.get('maxScore') as string) || 0,
      type: formData.get('type') as 'quiz' | 'test' | 'assignment' | 'project' | 'exam',
      description: formData.get('description') as string
    };

    if (selectedAssessment) {
      // Update
      setAssessments(assessments.map(a => a.id === selectedAssessment.id ? newAssessment : a));
    } else {
      // Add
      setAssessments([...assessments, newAssessment]);
    }

    closeAssessmentModal();
  };

  const deleteAssessment = (id: string): void => {
    // Delete assessment and related scores
    setAssessments(assessments.filter(a => a.id !== id));
    setStudentScores(studentScores.filter(s => s.assessmentId !== id));
  };

  const addScore = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const studentId = formData.get('studentId') as string;
    const assessmentId = formData.get('assessmentId') as string;
    const score = parseInt(formData.get('score') as string) || 0;
    const feedback = formData.get('feedback') as string;
    const submissionDate = formData.get('submissionDate') as string;

    // Check if this score already exists
    const existingScoreIndex = studentScores.findIndex(
      s => s.studentId === studentId && s.assessmentId === assessmentId
    );

    if (existingScoreIndex !== -1) {
      // Update existing score
      const updatedScores = [...studentScores];
      updatedScores[existingScoreIndex] = {
        studentId,
        assessmentId,
        score,
        feedback,
        submissionDate
      };
      setStudentScores(updatedScores);
    } else {
      // Add new score
      setStudentScores([
        ...studentScores,
        {
          studentId,
          assessmentId,
          score,
          feedback,
          submissionDate
        }
      ]);
    }

    closeScoreModal();
  };

  const addAttendance = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const studentId = formData.get('studentId') as string;
    const date = formData.get('date') as string;
    const present = formData.get('present') === 'true';
    const notes = formData.get('notes') as string;

    // Check if this attendance record already exists
    const existingAttendanceIndex = studentAttendance.findIndex(
      a => a.studentId === studentId && a.date === date
    );

    if (existingAttendanceIndex !== -1) {
      // Update existing attendance
      const updatedAttendance = [...studentAttendance];
      updatedAttendance[existingAttendanceIndex] = {
        studentId,
        date,
        present,
        notes
      };
      setStudentAttendance(updatedAttendance);
    } else {
      // Add new attendance
      setStudentAttendance([
        ...studentAttendance,
        {
          studentId,
          date,
          present,
          notes
        }
      ]);
    }

    closeAttendanceModal();
  };

  // Utility functions
  const calculateStudentAverage = (studentId: string): number => {
    const scores = studentScores.filter(s => s.studentId === studentId);
    if (scores.length === 0) return 0;
    
    let totalPercentage = 0;
    for (const score of scores) {
      const assessment = assessments.find(a => a.id === score.assessmentId);
      if (assessment) {
        const percentage = (score.score / assessment.maxScore) * 100;
        totalPercentage += percentage;
      }
    }
    
    return parseFloat((totalPercentage / scores.length).toFixed(1));
  };

  const getAssessmentName = (assessmentId: string): string => {
    const assessment = assessments.find(a => a.id === assessmentId);
    return assessment ? assessment.title : 'Unknown Assessment';
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getAssessmentScores = (assessmentId: string): { name: string; score: number; percentage: number }[] => {
    return studentScores
      .filter(score => score.assessmentId === assessmentId)
      .map(score => {
        const student = students.find(s => s.id === score.studentId);
        const assessment = assessments.find(a => a.id === assessmentId);
        const percentage = assessment ? (score.score / assessment.maxScore) * 100 : 0;
        
        return {
          name: student?.name || 'Unknown',
          score: score.score,
          percentage: parseFloat(percentage.toFixed(1))
        };
      });
  };

  const getStudentScores = (studentId: string): { assessment: string; score: number; percentage: number }[] => {
    return studentScores
      .filter(score => score.studentId === studentId)
      .map(score => {
        const assessment = assessments.find(a => a.id === score.assessmentId);
        const percentage = assessment ? (score.score / assessment.maxScore) * 100 : 0;
        
        return {
          assessment: assessment?.title || 'Unknown',
          score: score.score,
          percentage: parseFloat(percentage.toFixed(1))
        };
      });
  };

  const calculateAttendanceRate = (studentId: string): number => {
    const records = studentAttendance.filter(a => a.studentId === studentId);
    if (records.length === 0) return 0;
    
    const presentDays = records.filter(r => r.present).length;
    return parseFloat(((presentDays / records.length) * 100).toFixed(1));
  };

  const handleTableSort = (field: SortField): void => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted students list
  const filteredStudents = students
    .filter(student => {
      // Search filter
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Grade filter
      const matchesGrade = filter === 'all' || student.grade === filter;
      
      return matchesSearch && matchesGrade;
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortField === 'name') {
        return sortDirection === 'asc' ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name);
      } else if (sortField === 'grade') {
        return sortDirection === 'asc' ? 
          parseInt(a.grade) - parseInt(b.grade) : 
          parseInt(b.grade) - parseInt(a.grade);
      } else if (sortField === 'attendance') {
        return sortDirection === 'asc' ? 
          a.attendance - b.attendance : 
          b.attendance - a.attendance;
      }
      return 0;
    });

  // Calculate overall class statistics
  const calculateClassAverage = (): number => {
    if (students.length === 0) return 0;
    
    const individualAverages = students.map(student => calculateStudentAverage(student.id));
    const sum = individualAverages.reduce((acc, avg) => acc + avg, 0);
    return parseFloat((sum / students.length).toFixed(1));
  };

  const calculateOverallAttendance = (): number => {
    if (studentAttendance.length === 0) return 0;
    
    const presentCount = studentAttendance.filter(record => record.present).length;
    return parseFloat(((presentCount / studentAttendance.length) * 100).toFixed(1));
  };

  // Get sorted grade levels for filter
  const gradeOptions = Array.from(new Set(students.map(s => s.grade)))
    .sort((a, b) => parseInt(a) - parseInt(b));

  // Prepare assessment data for bar chart
  const assessmentAverages = assessments.map(assessment => {
    const scores = studentScores.filter(s => s.assessmentId === assessment.id);
    if (scores.length === 0) return { name: assessment.title, average: 0 };
    
    const sum = scores.reduce((acc, score) => acc + (score.score / assessment.maxScore) * 100, 0);
    return {
      name: assessment.title,
      average: parseFloat((sum / scores.length).toFixed(1))
    };
  });

  // Generate template for download
  const generateStudentTemplate = (): void => {
    const template = [
      'name,email,grade,enrollmentDate,attendance,notes',
      'John Doe,john@example.com,10,2023-09-01,92,"Excellent student"',
      'Jane Smith,jane@example.com,9,2023-09-01,88,"Needs help with math"'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateAssessmentTemplate = (): void => {
    const template = [
      'title,date,maxScore,type,description',
      'Mid-term Exam,2023-10-15,100,exam,"Covers chapters 1-5"',
      'Weekly Quiz,2023-09-22,20,quiz,"Vocabulary test"'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessment_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Prepare data for the dashboard
  const topStudents = [...students]
    .sort((a, b) => calculateStudentAverage(b.id) - calculateStudentAverage(a.id))
    .slice(0, 5)
    .map(student => ({
      name: student.name,
      average: calculateStudentAverage(student.id),
      attendance: student.attendance
    }));

  return (
    <div className="min-h-screen flex flex-col theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm p-4 theme-transition">
        <div className="container-fluid flex-between">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Student Progress Tracker</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{darkMode ? 'Dark' : 'Light'}</span>
              <button 
                className="theme-toggle" 
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-gray-100 dark:bg-slate-700 p-2 theme-transition">
        <div className="container-fluid">
          <ul className="flex flex-wrap space-x-1 sm:space-x-2">
            <li>
              <button
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'bg-white dark:bg-slate-600 dark:text-white'} btn-sm md:btn text-sm md:text-base`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'students' ? 'btn-primary' : 'bg-white dark:bg-slate-600 dark:text-white'} btn-sm md:btn text-sm md:text-base`}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'assessments' ? 'btn-primary' : 'bg-white dark:bg-slate-600 dark:text-white'} btn-sm md:btn text-sm md:text-base`}
                onClick={() => setActiveTab('assessments')}
              >
                Assessments
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'bg-white dark:bg-slate-600 dark:text-white'} btn-sm md:btn text-sm md:text-base`}
                onClick={() => setActiveTab('attendance')}
              >
                Attendance
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'bg-white dark:bg-slate-600 dark:text-white'} btn-sm md:btn text-sm md:text-base`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 bg-gray-50 dark:bg-slate-900 theme-transition overflow-x-hidden">
        <div className="container-fluid">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Class Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Total Students</div>
                  <div className="stat-value">{students.length}</div>
                  <div className="stat-desc">Enrolled in your class</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Class Average</div>
                  <div className="stat-value">{calculateClassAverage()}%</div>
                  <div className="stat-desc">Across all assessments</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Assessments</div>
                  <div className="stat-value">{assessments.length}</div>
                  <div className="stat-desc">Total assessments created</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Attendance Rate</div>
                  <div className="stat-value">{calculateOverallAttendance()}%</div>
                  <div className="stat-desc">Average student attendance</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Assessment Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assessmentAverages}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="average" name="Average Score (%)" fill="#4F46E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Top Performing Students</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={topStudents}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="average" name="Average Score (%)" stroke="#4F46E5" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="attendance" name="Attendance (%)" stroke="#10B981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Recent Assessments</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Assessment</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Type</th>
                        <th className="table-header">Average Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {assessments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map(assessment => {
                          const scores = studentScores.filter(s => s.assessmentId === assessment.id);
                          let avgScore = 0;
                          if (scores.length > 0) {
                            const sum = scores.reduce((acc, s) => acc + (s.score / assessment.maxScore) * 100, 0);
                            avgScore = parseFloat((sum / scores.length).toFixed(1));
                          }
                          
                          return (
                            <tr key={assessment.id}>
                              <td className="table-cell">{assessment.title}</td>
                              <td className="table-cell">{new Date(assessment.date).toLocaleDateString()}</td>
                              <td className="table-cell capitalize">{assessment.type}</td>
                              <td className="table-cell">
                                <div className="flex items-center">
                                  <div className="mr-2">{avgScore}%</div>
                                  <div 
                                    className={`h-2 rounded-full w-16 ${avgScore >= 70 ? 'bg-green-500' : avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  >
                                    <div 
                                      className="h-full rounded-full bg-green-300" 
                                      style={{ width: `${avgScore}%` }}
                                    ></div>
                                  </div>
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

          {/* Students View */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold dark:text-white">Students</h2>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="input pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      className="input" 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Grades</option>
                      {gradeOptions.map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                    
                    <div className="flex">
                      <button 
                        className={`btn ${currentView === 'list' ? 'btn-primary' : 'bg-white dark:bg-slate-700 dark:text-white'}`}
                        onClick={() => setCurrentView('list')}
                        aria-label="List view"
                      >
                        List
                      </button>
                      <button 
                        className={`btn ${currentView === 'grid' ? 'btn-primary' : 'bg-white dark:bg-slate-700 dark:text-white'}`}
                        onClick={() => setCurrentView('grid')}
                        aria-label="Grid view"
                      >
                        Grid
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openStudentModal()}
                  >
                    <UserPlus size={16} />
                    <span className="hidden sm:inline">Add Student</span>
                  </button>
                  
                  <button 
                    className="btn bg-white dark:bg-slate-700 dark:text-white flex items-center gap-2"
                    onClick={generateStudentTemplate}
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Template</span>
                  </button>
                </div>
              </div>

              {/* List View */}
              {currentView === 'list' && (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Name</th>
                        <th className="table-header">Email</th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => handleTableSort('grade')}
                        >
                          <div className="flex items-center">
                            Grade
                            {sortField === 'grade' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => handleTableSort('attendance')}
                        >
                          <div className="flex items-center">
                            Attendance
                            {sortField === 'attendance' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="table-header">Avg. Score</th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {filteredStudents.map(student => (
                        <tr key={student.id}>
                          <td className="table-cell font-medium">{student.name}</td>
                          <td className="table-cell">{student.email}</td>
                          <td className="table-cell">{student.grade}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="mr-2">{student.attendance}%</span>
                              <div className={`w-16 h-2 rounded-full ${student.attendance >= 90 ? 'bg-green-200' : student.attendance >= 80 ? 'bg-yellow-200' : 'bg-red-200'}`}>
                                <div 
                                  className={`h-full rounded-full ${student.attendance >= 90 ? 'bg-green-500' : student.attendance >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${student.attendance}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={`font-medium ${calculateStudentAverage(student.id) >= 70 ? 'text-green-600 dark:text-green-400' : calculateStudentAverage(student.id) >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {calculateStudentAverage(student.id)}%
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button 
                                className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100"
                                onClick={() => openStudentModal(student)}
                                aria-label={`Edit ${student.name}`}
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                                    deleteStudent(student.id);
                                  }
                                }}
                                aria-label={`Delete ${student.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid View */}
              {currentView === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="card flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
                            <User size={20} />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium dark:text-white">{student.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Grade {student.grade}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                            onClick={() => openStudentModal(student)}
                            aria-label={`Edit ${student.name}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            aria-label={`Delete ${student.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                          <div className="text-sm dark:text-white truncate">{student.email}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Attendance</div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium dark:text-white mr-2">{student.attendance}%</span>
                            <div className={`w-full h-1.5 rounded-full ${student.attendance >= 90 ? 'bg-green-200' : student.attendance >= 80 ? 'bg-yellow-200' : 'bg-red-200'}`}>
                              <div 
                                className={`h-full rounded-full ${student.attendance >= 90 ? 'bg-green-500' : student.attendance >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${student.attendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
                          <div className={`text-sm font-medium ${calculateStudentAverage(student.id) >= 70 ? 'text-green-600 dark:text-green-400' : calculateStudentAverage(student.id) >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                            {calculateStudentAverage(student.id)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assessments View */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold dark:text-white">Assessments</h2>
                
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openAssessmentModal()}
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Assessment</span>
                  </button>

                  <button 
                    className="btn bg-white dark:bg-slate-700 dark:text-white flex items-center gap-2"
                    onClick={openScoreModal}
                  >
                    <TrendingUp size={16} />
                    <span className="hidden sm:inline">Add Score</span>
                  </button>
                  
                  <button 
                    className="btn bg-white dark:bg-slate-700 dark:text-white flex items-center gap-2"
                    onClick={generateAssessmentTemplate}
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Template</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(assessment => {
                    const scores = studentScores.filter(s => s.assessmentId === assessment.id);
                    let avgScore = 0;
                    if (scores.length > 0) {
                      const sum = scores.reduce((acc, s) => acc + (s.score / assessment.maxScore) * 100, 0);
                      avgScore = parseFloat((sum / scores.length).toFixed(1));
                    }

                    return (
                      <div key={assessment.id} className="card">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-lg dark:text-white">{assessment.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                              {assessment.type} - {new Date(assessment.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                              onClick={() => openAssessmentModal(assessment)}
                              aria-label={`Edit ${assessment.title}`}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${assessment.title}?`)) {
                                  deleteAssessment(assessment.id);
                                }
                              }}
                              aria-label={`Delete ${assessment.title}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {assessment.description || 'No description provided.'}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Max Score</span>
                            <span className="text-sm font-medium dark:text-white">{assessment.maxScore} points</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Submissions</span>
                            <span className="text-sm font-medium dark:text-white">{scores.length} / {students.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Average Score</span>
                            <div className={`px-2 py-0.5 rounded text-xs font-medium ${avgScore >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : avgScore >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                              {avgScore}%
                            </div>
                          </div>
                        </div>

                        {scores.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium mb-2 dark:text-white">Score Distribution</h4>
                            <div className="flex gap-1">
                              <div className="flex-1 h-2 rounded-full bg-red-200 dark:bg-red-900"></div>
                              <div className="flex-1 h-2 rounded-full bg-yellow-200 dark:bg-yellow-900"></div>
                              <div className="flex-1 h-2 rounded-full bg-green-200 dark:bg-green-900"></div>
                            </div>
                            <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1 justify-between">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {assessments.length === 0 && (
                <div className="card text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No assessments created yet</p>
                  <button 
                    className="btn btn-primary inline-flex items-center gap-2"
                    onClick={() => openAssessmentModal()}
                  >
                    <Plus size={16} />
                    Create Your First Assessment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attendance View */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold dark:text-white">Attendance Records</h2>
                
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={openAttendanceModal}
                  >
                    <Clock size={16} />
                    <span className="hidden sm:inline">Record Attendance</span>
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                  <h3 className="text-lg font-medium dark:text-white">Attendance Summary</h3>
                  <select 
                    className="input max-w-xs"
                    defaultValue=""  
                  >
                    <option value="">All Dates</option>
                    {/* Dynamic date options could be added here */}
                    <option value="2023-09">September 2023</option>
                    <option value="2023-10">October 2023</option>
                    <option value="2023-11">November 2023</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Student</th>
                        <th className="table-header">Attendance Rate</th>
                        <th className="table-header">Present Days</th>
                        <th className="table-header">Absent Days</th>
                        <th className="table-header">Total Records</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {students.map(student => {
                        const records = studentAttendance.filter(a => a.studentId === student.id);
                        const presentDays = records.filter(r => r.present).length;
                        const absentDays = records.length - presentDays;
                        const rate = records.length > 0 ? parseFloat(((presentDays / records.length) * 100).toFixed(1)) : 0;

                        return (
                          <tr key={student.id}>
                            <td className="table-cell font-medium">{student.name}</td>
                            <td className="table-cell">
                              <div className="flex items-center">
                                <span className="mr-2">{rate}%</span>
                                <div className={`w-16 h-2 rounded-full ${rate >= 90 ? 'bg-green-200' : rate >= 80 ? 'bg-yellow-200' : 'bg-red-200'}`}>
                                  <div 
                                    className={`h-full rounded-full ${rate >= 90 ? 'bg-green-500' : rate >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${rate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="table-cell text-green-600 dark:text-green-400">{presentDays}</td>
                            <td className="table-cell text-red-600 dark:text-red-400">{absentDays}</td>
                            <td className="table-cell">{records.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium mb-6 dark:text-white">Recent Attendance Records</h3>

                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Student</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {studentAttendance
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((record, index) => (
                          <tr key={index}>
                            <td className="table-cell">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="table-cell font-medium">{getStudentName(record.studentId)}</td>
                            <td className="table-cell">
                              {record.present ? (
                                <span className="badge badge-success">Present</span>
                              ) : (
                                <span className="badge badge-error">Absent</span>
                              )}
                            </td>
                            <td className="table-cell text-sm">{record.notes || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Progress Reports</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Student Performance Comparison</h3>
                  
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={students.map(student => ({
                          name: student.name,
                          average: calculateStudentAverage(student.id),
                          attendance: student.attendance
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="average" name="Average Score (%)" fill="#4F46E5" />
                        <Bar dataKey="attendance" name="Attendance (%)" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This chart shows the average assessment scores and attendance rates for all students.
                  </p>
                </div>

                <div className="card">
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Assessment Type Analysis</h3>
                  
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...new Set(assessments.map(a => a.type))].map(type => {
                          const typeAssessments = assessments.filter(a => a.type === type);
                          const scores = typeAssessments.flatMap(a => 
                            studentScores
                              .filter(s => s.assessmentId === a.id)
                              .map(s => {
                                const assessment = assessments.find(ass => ass.id === s.assessmentId);
                                return assessment ? (s.score / assessment.maxScore) * 100 : 0;
                              })
                          );
                          
                          const avgScore = scores.length > 0 ?
                            parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : 0;
                          
                          return {
                            type: type.charAt(0).toUpperCase() + type.slice(1),
                            average: avgScore,
                            count: typeAssessments.length
                          };
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="average" name="Average Score (%)" fill="#4F46E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This chart shows the average scores across different assessment types.
                  </p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium mb-6 dark:text-white">Individual Student Reports</h3>
                
                <div className="mb-4">
                  <select className="input w-full md:w-64">
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
                
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Select a student to view their detailed performance report.
                </p>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Export Options</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="btn bg-white hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600">
                    Export Class Report (CSV)
                  </button>
                  <button className="btn bg-white hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600">
                    Export Attendance Records (CSV)
                  </button>
                  <button className="btn bg-white hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600">
                    Export Assessment Scores (CSV)
                  </button>
                  <button className="btn bg-white hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600">
                    Export Student List (CSV)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 p-4 shadow-md mt-auto theme-transition">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Add/Edit Student Modal */}
      {isStudentModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeStudentModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
        >
          <div 
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="student-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeStudentModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={addOrUpdateStudent}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input 
                    id="name" 
                    name="name" 
                    type="text" 
                    className="input" 
                    defaultValue={selectedStudent?.name || ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    className="input" 
                    defaultValue={selectedStudent?.email || ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="grade">Grade Level</label>
                  <input 
                    id="grade" 
                    name="grade" 
                    type="text" 
                    pattern="[0-9]+" 
                    className="input" 
                    defaultValue={selectedStudent?.grade || ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="enrollmentDate">Enrollment Date</label>
                  <input 
                    id="enrollmentDate" 
                    name="enrollmentDate" 
                    type="date" 
                    className="input" 
                    defaultValue={selectedStudent?.enrollmentDate || new Date().toISOString().substring(0, 10)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="attendance">Attendance Rate (%)</label>
                  <input 
                    id="attendance" 
                    name="attendance" 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="input" 
                    defaultValue={selectedStudent?.attendance || 100}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input"
                    defaultValue={selectedStudent?.notes || ''}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white" onClick={closeStudentModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedStudent ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Assessment Modal */}
      {isAssessmentModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeAssessmentModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-modal-title"
        >
          <div 
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="assessment-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedAssessment ? 'Edit Assessment' : 'Add New Assessment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeAssessmentModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={addOrUpdateAssessment}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Title</label>
                  <input 
                    id="title" 
                    name="title" 
                    type="text" 
                    className="input" 
                    defaultValue={selectedAssessment?.title || ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input 
                    id="date" 
                    name="date" 
                    type="date" 
                    className="input" 
                    defaultValue={selectedAssessment?.date || new Date().toISOString().substring(0, 10)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maxScore">Maximum Score</label>
                  <input 
                    id="maxScore" 
                    name="maxScore" 
                    type="number" 
                    min="1" 
                    className="input" 
                    defaultValue={selectedAssessment?.maxScore || 100}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="type">Assessment Type</label>
                  <select 
                    id="type" 
                    name="type" 
                    className="input" 
                    defaultValue={selectedAssessment?.type || 'test'}
                    required
                  >
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="input"
                    defaultValue={selectedAssessment?.description || ''}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white" onClick={closeAssessmentModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedAssessment ? 'Update' : 'Add'} Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Score Modal */}
      {isScoreModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeScoreModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="score-modal-title"
        >
          <div 
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="score-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Record Student Score
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeScoreModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={addScore}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="studentId">Student</label>
                  <select 
                    id="studentId" 
                    name="studentId" 
                    className="input" 
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="assessmentId">Assessment</label>
                  <select 
                    id="assessmentId" 
                    name="assessmentId" 
                    className="input" 
                    required
                  >
                    <option value="">Select an assessment</option>
                    {assessments.map(assessment => (
                      <option key={assessment.id} value={assessment.id}>{assessment.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="score">Score</label>
                  <input 
                    id="score" 
                    name="score" 
                    type="number" 
                    min="0" 
                    className="input" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="submissionDate">Date</label>
                  <input 
                    id="submissionDate" 
                    name="submissionDate" 
                    type="date" 
                    className="input" 
                    defaultValue={new Date().toISOString().substring(0, 10)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="feedback">Feedback</label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    rows={3}
                    className="input"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white" onClick={closeScoreModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Attendance Modal */}
      {isAttendanceModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeAttendanceModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="attendance-modal-title"
        >
          <div 
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="attendance-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Record Attendance
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeAttendanceModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={addAttendance}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="studentId">Student</label>
                  <select 
                    id="studentId" 
                    name="studentId" 
                    className="input" 
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input 
                    id="date" 
                    name="date" 
                    type="date" 
                    className="input" 
                    defaultValue={new Date().toISOString().substring(0, 10)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="present" value="true" defaultChecked />
                      <span>Present</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="present" value="false" />
                      <span>Absent</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input"
                    placeholder="E.g., Reason for absence"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white" onClick={closeAttendanceModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
