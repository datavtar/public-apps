import React, { useState, useEffect } from 'react';
import {
  User,
  Book,
  Trash2,
  Plus,
  Edit,
  Search,
  Filter,
  ChevronDown,
  GraduationCap,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ArrowUpDown,
  Check,
  X,
  FileText,
  Clock,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';

// Types
interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  grade: string;
  attendance: number;
  subjects: Record<string, number>;
  lastAssessmentDate: string;
  notes: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  maxScore: number;
  completed: boolean;
  submissions: Record<string, {
    studentId: string;
    submissionDate: string;
    score: number;
    feedback: string;
  }>;
}

type SubjectName = 'Math' | 'Science' | 'English' | 'History' | 'Art';
type Tab = 'students' | 'assignments' | 'analytics';
type AnalyticsView = 'performance' | 'attendance' | 'subjects';

const SUBJECTS: SubjectName[] = ['Math', 'Science', 'English', 'History', 'Art'];
const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

const calculateAverageScore = (subjects: Record<string, number>): number => {
  const values = Object.values(subjects).filter(score => score !== undefined);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

const calculateClassAverage = (students: Student[], subject?: string): number => {
  if (students.length === 0) return 0;
  
  if (subject) {
    const scores = students
      .map(student => student.subjects[subject])
      .filter(score => score !== undefined);
    
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  const averages = students.map(student => calculateAverageScore(student.subjects));
  return averages.reduce((a, b) => a + b, 0) / averages.length;
};

const calculateAttendanceAverage = (students: Student[]): number => {
  if (students.length === 0) return 0;
  return students.reduce((a, b) => a + b.attendance, 0) / students.length;
};

const getGradeDistribution = (students: Student[]): Record<string, number> => {
  const distribution: Record<string, number> = {};
  
  students.forEach(student => {
    const avg = calculateAverageScore(student.subjects);
    let grade = '';
    
    if (avg >= 90) grade = 'A+';
    else if (avg >= 85) grade = 'A';
    else if (avg >= 80) grade = 'B+';
    else if (avg >= 75) grade = 'B';
    else if (avg >= 70) grade = 'C+';
    else if (avg >= 65) grade = 'C';
    else if (avg >= 60) grade = 'D';
    else grade = 'F';
    
    distribution[grade] = (distribution[grade] || 0) + 1;
  });
  
  return distribution;
};

// Generate Initial Data
const generateInitialStudents = (): Student[] => {
  const students: Student[] = [];
  const names = ["Emma Johnson", "Liam Smith", "Olivia Brown", "Noah Garcia", "Ava Martinez", 
                "William Davis", "Sophia Wilson", "James Taylor", "Isabella Anderson", "Benjamin Thomas"];
  
  for (let i = 0; i < 10; i++) {
    const subjects: Record<string, number> = {};
    SUBJECTS.forEach(subject => {
      subjects[subject] = Math.floor(Math.random() * 30) + 70; // 70-100
    });
    
    students.push({
      id: generateId(),
      name: names[i],
      rollNumber: `R${2000 + i}`,
      email: `${names[i].split(' ')[0].toLowerCase()}@example.com`,
      grade: GRADES[Math.floor(Math.random() * 3)], // Mostly high performers
      attendance: Math.floor(Math.random() * 20) + 80, // 80-100%
      subjects,
      lastAssessmentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      notes: ''
    });
  }
  
  return students;
};

const generateInitialAssignments = (): Assignment[] => {
  const assignments: Assignment[] = [];
  const titles = [
    "Weekly Quiz", 
    "Research Paper", 
    "Group Project", 
    "Lab Report", 
    "Book Review"
  ];
  
  for (let i = 0; i < 5; i++) {
    const submissions: Record<string, {
      studentId: string;
      submissionDate: string;
      score: number;
      feedback: string;
    }> = {};
    
    assignments.push({
      id: generateId(),
      title: `${titles[i % titles.length]} - ${SUBJECTS[i % SUBJECTS.length]}`,
      description: `Complete the ${titles[i % titles.length].toLowerCase()} for ${SUBJECTS[i % SUBJECTS.length]}`,
      dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      subject: SUBJECTS[i % SUBJECTS.length],
      maxScore: 100,
      completed: false,
      submissions
    });
  }
  
  return assignments;
};

const App: React.FC = () => {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>('performance');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedAssignments = localStorage.getItem('assignments');
    
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      const initialStudents = generateInitialStudents();
      setStudents(initialStudents);
      localStorage.setItem('students', JSON.stringify(initialStudents));
    }
    
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    } else {
      const initialAssignments = generateInitialAssignments();
      setAssignments(initialAssignments);
      localStorage.setItem('assignments', JSON.stringify(initialAssignments));
    }
    
    // Set up dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

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

  // Filter students based on search term and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === 'all' || student.subjects[filterSubject as SubjectName] !== undefined;
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Filter assignments based on search term and subject filter
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || assignment.subject === filterSubject;
    
    return matchesSearch && matchesSubject;
  });

  // Event handlers
  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const rollNumber = formData.get('rollNumber') as string;
    const email = formData.get('email') as string;
    const grade = formData.get('grade') as string;
    const attendance = parseInt(formData.get('attendance') as string);
    const notes = formData.get('notes') as string;
    
    const subjects: Record<string, number> = {};
    SUBJECTS.forEach(subject => {
      const score = formData.get(`subject-${subject}`);
      subjects[subject] = score ? parseInt(score as string) : 0;
    });
    
    if (selectedStudent) {
      // Update existing student
      setStudents(students.map(student => 
        student.id === selectedStudent.id 
          ? { ...selectedStudent, name, rollNumber, email, grade, attendance, subjects, notes } 
          : student
      ));
    } else {
      // Add new student
      const newStudent: Student = {
        id: generateId(),
        name,
        rollNumber,
        email,
        grade,
        attendance,
        subjects,
        lastAssessmentDate: new Date().toISOString(),
        notes
      };
      
      setStudents([...students, newStudent]);
    }
    
    setSelectedStudent(null);
    setIsStudentModalOpen(false);
  };

  const handleAssignmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const subject = formData.get('subject') as string;
    const maxScore = parseInt(formData.get('maxScore') as string);
    
    if (selectedAssignment) {
      // Update existing assignment
      setAssignments(assignments.map(assignment => 
        assignment.id === selectedAssignment.id 
          ? { ...selectedAssignment, title, description, dueDate, subject, maxScore } 
          : assignment
      ));
    } else {
      // Add new assignment
      const newAssignment: Assignment = {
        id: generateId(),
        title,
        description,
        dueDate,
        subject,
        maxScore,
        completed: false,
        submissions: {}
      };
      
      setAssignments([...assignments, newAssignment]);
    }
    
    setSelectedAssignment(null);
    setIsAssignmentModalOpen(false);
  };

  const handleSubmissionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!selectedAssignment || !selectedStudent) return;
    
    const score = parseInt(formData.get('score') as string);
    const feedback = formData.get('feedback') as string;
    
    const updatedSubmissions = {
      ...selectedAssignment.submissions,
      [selectedStudent.id]: {
        studentId: selectedStudent.id,
        submissionDate: new Date().toISOString(),
        score,
        feedback
      }
    };
    
    setAssignments(assignments.map(assignment => 
      assignment.id === selectedAssignment.id 
        ? { ...selectedAssignment, submissions: updatedSubmissions } 
        : assignment
    ));
    
    // Update student's subject score based on assignment
    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const subjects = { ...student.subjects };
        subjects[selectedAssignment.subject] = score;
        
        return {
          ...student,
          subjects,
          lastAssessmentDate: new Date().toISOString()
        };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    setIsSubmissionModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== id));
    }
  };

  const handleDeleteAssignment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(assignment => assignment.id !== id));
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  const handleMarkAssignmentComplete = (id: string, completed: boolean) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === id 
        ? { ...assignment, completed } 
        : assignment
    ));
  };

  const handleGradeAssignment = (assignment: Assignment, student: Student) => {
    setSelectedAssignment(assignment);
    setSelectedStudent(student);
    setIsSubmissionModalOpen(true);
  };

  const getSubmissionForStudent = (assignmentId: string, studentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;
    
    return assignment.submissions[studentId] || null;
  };

  // Chart data
  const getSubjectPerformanceData = () => {
    return SUBJECTS.map(subject => ({
      name: subject,
      classAverage: parseFloat(calculateClassAverage(students, subject).toFixed(1)),
      selectedStudent: selectedStudent ? 
        (selectedStudent.subjects[subject] || 0) : 
        0
    }));
  };

  const getGradeDistributionData = () => {
    const distribution = getGradeDistribution(students);
    return GRADES.map(grade => ({
      name: grade,
      value: distribution[grade] || 0
    })).filter(item => item.value > 0);
  };

  const getAttendanceData = () => {
    const today = new Date();
    const pastMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      return format(date, 'MMM');
    }).reverse();
    
    return pastMonths.map(month => ({
      name: month,
      average: 85 + Math.floor(Math.random() * 10) // Simulated data
    }));
  };

  // Modal controls
  const openStudentModal = () => {
    setSelectedStudent(null);
    setIsStudentModalOpen(true);
  };

  const openAssignmentModal = () => {
    setSelectedAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setIsStudentModalOpen(false);
  };

  const closeAssignmentModal = () => {
    setSelectedAssignment(null);
    setIsAssignmentModalOpen(false);
  };

  const closeSubmissionModal = () => {
    setSelectedStudent(null);
    setSelectedAssignment(null);
    setIsSubmissionModalOpen(false);
  };

  // UI Components
  const renderNav = () => (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm">
      <div className="flex items-center">
        <GraduationCap className="mr-2 h-6 w-6 text-primary-600 dark:text-primary-400" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Teacher's Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm dark:text-slate-300">Light</span>
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-thumb"></span>
            <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>
          <span className="text-sm dark:text-slate-300">Dark</span>
        </div>
      </div>
    </nav>
  );

  const renderTabs = () => (
    <div className="flex border-b dark:border-slate-700">
      <button
        className={`py-3 px-6 font-medium ${activeTab === 'students' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
        onClick={() => setActiveTab('students')}
      >
        <User className="inline-block mr-2 h-5 w-5" />
        Students
      </button>
      <button
        className={`py-3 px-6 font-medium ${activeTab === 'assignments' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
        onClick={() => setActiveTab('assignments')}
      >
        <Book className="inline-block mr-2 h-5 w-5" />
        Assignments
      </button>
      <button
        className={`py-3 px-6 font-medium ${activeTab === 'analytics' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
        onClick={() => setActiveTab('analytics')}
      >
        <BarChartIcon className="inline-block mr-2 h-5 w-5" />
        Analytics
      </button>
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="flex flex-col md:flex-row justify-between p-4 space-y-4 md:space-y-0 md:space-x-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder={`Search ${activeTab === 'students' ? 'students' : 'assignments'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="input pl-10 pr-10 appearance-none"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {activeTab === 'students' && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="input pl-10 pr-10 appearance-none"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="all">All Grades</option>
              {GRADES.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>
      
      <button
        className="btn btn-primary flex items-center justify-center"
        onClick={activeTab === 'students' ? openStudentModal : openAssignmentModal}
      >
        <Plus className="h-5 w-5 mr-1" />
        Add {activeTab === 'students' ? 'Student' : 'Assignment'}
      </button>
    </div>
  );

  const renderStudentsList = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="table-header px-6 py-3">Name</th>
            <th className="table-header px-6 py-3">Roll Number</th>
            <th className="table-header px-6 py-3">Email</th>
            <th className="table-header px-6 py-3">
              <div className="flex items-center">
                Grade
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </th>
            <th className="table-header px-6 py-3">
              <div className="flex items-center">
                Attendance
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </th>
            <th className="table-header px-6 py-3">Average Score</th>
            <th className="table-header px-6 py-3">Last Assessment</th>
            <th className="table-header px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => {
              const avgScore = calculateAverageScore(student.subjects);
              return (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                  <td className="table-cell">{student.name}</td>
                  <td className="table-cell">{student.rollNumber}</td>
                  <td className="table-cell">{student.email}</td>
                  <td className="table-cell">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.grade.startsWith('A') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      student.grade.startsWith('B') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                      student.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                    >
                      {student.grade}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${student.attendance}%` }}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`font-medium ${avgScore >= 80 ? 'text-green-600 dark:text-green-400' : 
                                                     avgScore >= 70 ? 'text-blue-600 dark:text-blue-400' : 
                                                     avgScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                                                     'text-red-600 dark:text-red-400'}`}>
                      {avgScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {student.lastAssessmentDate ? (
                      format(new Date(student.lastAssessmentDate), 'MMM dd, yyyy')
                    ) : 'Not assessed'}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleEditStudent(student)}
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDeleteStudent(student.id)}
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-slate-400">
                No students found. Add a new student to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderAssignmentsList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredAssignments.length > 0 ? (
        filteredAssignments.map(assignment => {
          const submissionCount = Object.keys(assignment.submissions).length;
          const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.completed;
          
          return (
            <div 
              key={assignment.id} 
              className={`card relative ${isOverdue ? 'border-l-4 border-red-500 dark:border-red-700' : 
                                        assignment.completed ? 'border-l-4 border-green-500 dark:border-green-700' : 
                                        'border-l-4 border-blue-500 dark:border-blue-700'}`}
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => handleEditAssignment(assignment)}
                  aria-label={`Edit ${assignment.title}`}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  aria-label={`Delete ${assignment.title}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.subject === 'Math' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                                                                                                             assignment.subject === 'Science' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                                                                                             assignment.subject === 'English' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                                                                                             assignment.subject === 'History' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                                                                                             'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'}`}>
                  {assignment.subject}
                </span>
                {isOverdue && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Overdue
                  </span>
                )}
                {assignment.completed && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Completed
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 pr-16">{assignment.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{assignment.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mb-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {submissionCount} / {students.length} submissions
                </span>
                
                <div className="flex space-x-2">
                  <button 
                    className={`btn btn-sm ${assignment.completed ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600' : 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'}`}
                    onClick={() => handleMarkAssignmentComplete(assignment.id, !assignment.completed)}
                  >
                    {assignment.completed ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Mark Incomplete
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {submissionCount > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Student Submissions</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Student</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Score</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                        {Object.entries(assignment.submissions).map(([studentId, submission]) => {
                          const student = students.find(s => s.id === studentId);
                          if (!student) return null;
                          
                          return (
                            <tr key={studentId} className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer" onClick={() => handleGradeAssignment(assignment, student)}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                <span className={`font-medium ${submission.score >= (assignment.maxScore * 0.8) ? 'text-green-600 dark:text-green-400' : 
                                                                 submission.score >= (assignment.maxScore * 0.7) ? 'text-blue-600 dark:text-blue-400' : 
                                                                 submission.score >= (assignment.maxScore * 0.6) ? 'text-yellow-600 dark:text-yellow-400' : 
                                                                 'text-red-600 dark:text-red-400'}`}>
                                  {submission.score} / {assignment.maxScore}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary w-full"
                  onClick={() => {
                    // Open student list for grading
                    setSelectedAssignment(assignment);
                    setActiveTab('students');
                  }}
                >
                  Grade Students
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No assignments found</h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4">Create your first assignment to start tracking student progress.</p>
          <button className="btn btn-primary" onClick={openAssignmentModal}>
            <Plus className="h-5 w-5 mr-1" />
            Add Assignment
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalyticsView = () => {
    const analyticsData = {
      totalStudents: students.length,
      averageScore: calculateClassAverage(students).toFixed(1),
      averageAttendance: calculateAttendanceAverage(students).toFixed(1),
      assignmentsCompleted: assignments.filter(a => a.completed).length,
      totalAssignments: assignments.length
    };
    
    return (
      <div className="flex flex-col p-4 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Students</div>
            <div className="stat-value">{analyticsData.totalStudents}</div>
            <div className="stat-desc">Active in your class</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Class Average Score</div>
            <div className="stat-value">{analyticsData.averageScore}</div>
            <div className="stat-desc">Across all subjects</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Average Attendance</div>
            <div className="stat-value">{analyticsData.averageAttendance}%</div>
            <div className="stat-desc">Class attendance rate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Assignments Completed</div>
            <div className="stat-value">{analyticsData.assignmentsCompleted} / {analyticsData.totalAssignments}</div>
            <div className="stat-desc">Progress tracker</div>
          </div>
        </div>
        
        {/* Analytics Tabs */}
        <div className="flex space-x-2 border-b dark:border-slate-700">
          <button
            className={`py-2 px-4 font-medium ${analyticsView === 'performance' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
            onClick={() => setAnalyticsView('performance')}
          >
            <BarChartIcon className="inline-block mr-2 h-4 w-4" />
            Performance
          </button>
          <button
            className={`py-2 px-4 font-medium ${analyticsView === 'attendance' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
            onClick={() => setAnalyticsView('attendance')}
          >
            <Clock className="inline-block mr-2 h-4 w-4" />
            Attendance
          </button>
          <button
            className={`py-2 px-4 font-medium ${analyticsView === 'subjects' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
            onClick={() => setAnalyticsView('subjects')}
          >
            <Book className="inline-block mr-2 h-4 w-4" />
            Subjects
          </button>
        </div>
        
        {/* Analytics Content */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          {analyticsView === 'performance' && (
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Class Performance Overview</h3>
                
                <div className="mt-2 sm:mt-0 flex items-center">
                  <label htmlFor="student-select" className="mr-2 text-sm font-medium text-gray-700 dark:text-slate-300">Compare with:</label>
                  <select 
                    id="student-select"
                    className="input input-sm max-w-xs"
                    onChange={(e) => {
                      const studentId = e.target.value;
                      const student = students.find(s => s.id === studentId) || null;
                      setSelectedStudent(student);
                    }}
                    value={selectedStudent?.id || ''}
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getSubjectPerformanceData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="classAverage" name="Class Average" fill="#8884d8" />
                    {selectedStudent && (
                      <Bar dataKey="selectedStudent" name={selectedStudent.name} fill="#82ca9d" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getGradeDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getGradeDistributionData().map((entry, index) => {
                            const COLORS = ['#4bc0c0', '#36a2eb', '#ffcd56', '#ff9f40', '#ff6384', '#c9cbcf', '#9966ff', '#ff6384'];
                            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Top Performing Students</h3>
                  <div className="overflow-y-auto max-h-64">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Student</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Average</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                        {students
                          .slice()
                          .sort((a, b) => calculateAverageScore(b.subjects) - calculateAverageScore(a.subjects))
                          .slice(0, 5)
                          .map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {calculateAverageScore(student.subjects).toFixed(1)}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.grade.startsWith('A') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                student.grade.startsWith('B') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                student.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                  {student.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {analyticsView === 'attendance' && (
            <div className="flex flex-col space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Class Attendance Trends</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getAttendanceData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="average" name="Attendance %" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Student Attendance</h3>
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Student</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Attendance</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {students
                        .slice()
                        .sort((a, b) => b.attendance - a.attendance)
                        .map(student => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${student.attendance}%` }}></div>
                                </div>
                                <span className="ml-2 text-xs font-medium">{student.attendance}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.attendance >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              student.attendance >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                              student.attendance >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {student.attendance >= 90 ? 'Excellent' : 
                                student.attendance >= 80 ? 'Good' : 
                                student.attendance >= 70 ? 'Fair' : 
                                'Poor'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {analyticsView === 'subjects' && (
            <div className="flex flex-col space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subject Performance Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUBJECTS.map(subject => {
                  const avgScore = calculateClassAverage(students, subject);
                  const bestStudent = [...students].sort((a, b) => 
                    (b.subjects[subject] || 0) - (a.subjects[subject] || 0)
                  )[0];
                  
                  return (
                    <div key={subject} className="card">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{subject}</h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                          {avgScore.toFixed(1)}
                        </div>
                        <div className="ml-2 text-sm text-gray-500 dark:text-slate-400">Class Average</div>
                      </div>
                      
                      {bestStudent && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Highest Score</div>
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900 dark:text-white">{bestStudent.name}</div>
                            <div className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                              {bestStudent.subjects[subject]}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Score Distribution</div>
                        <div className="flex items-center space-x-1">
                          <div className="h-4 rounded-l-full bg-green-500" style={{ width: `${Math.round(students.filter(s => (s.subjects[subject] || 0) >= 80).length / students.length * 100)}%` }}></div>
                          <div className="h-4 bg-blue-500" style={{ width: `${Math.round(students.filter(s => (s.subjects[subject] || 0) >= 70 && (s.subjects[subject] || 0) < 80).length / students.length * 100)}%` }}></div>
                          <div className="h-4 bg-yellow-500" style={{ width: `${Math.round(students.filter(s => (s.subjects[subject] || 0) >= 60 && (s.subjects[subject] || 0) < 70).length / students.length * 100)}%` }}></div>
                          <div className="h-4 rounded-r-full bg-red-500" style={{ width: `${Math.round(students.filter(s => (s.subjects[subject] || 0) < 60).length / students.length * 100)}%` }}></div>
                        </div>
                        <div className="flex text-xs mt-1 justify-between">
                          <span>A: {Math.round(students.filter(s => (s.subjects[subject] || 0) >= 80).length / students.length * 100)}%</span>
                          <span>B: {Math.round(students.filter(s => (s.subjects[subject] || 0) >= 70 && (s.subjects[subject] || 0) < 80).length / students.length * 100)}%</span>
                          <span>C: {Math.round(students.filter(s => (s.subjects[subject] || 0) >= 60 && (s.subjects[subject] || 0) < 70).length / students.length * 100)}%</span>
                          <span>F: {Math.round(students.filter(s => (s.subjects[subject] || 0) < 60).length / students.length * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="card">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Subject Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getSubjectPerformanceData()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="classAverage" name="Class Average" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modals
  const renderStudentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 theme-transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto p-6 m-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
            onClick={closeStudentModal}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleStudentSubmit}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="input" 
                defaultValue={selectedStudent?.name || ''} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                <input 
                  type="text" 
                  id="rollNumber" 
                  name="rollNumber" 
                  className="input" 
                  defaultValue={selectedStudent?.rollNumber || ''} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="input" 
                  defaultValue={selectedStudent?.email || ''} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="grade" className="form-label">Grade</label>
                <select 
                  id="grade" 
                  name="grade" 
                  className="input" 
                  defaultValue={selectedStudent?.grade || GRADES[0]}
                >
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="attendance" className="form-label">Attendance (%)</label>
                <input 
                  type="number" 
                  id="attendance" 
                  name="attendance" 
                  className="input" 
                  min="0" 
                  max="100" 
                  defaultValue={selectedStudent?.attendance || 100} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Subject Scores</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUBJECTS.map(subject => (
                  <div key={subject} className="form-group">
                    <label htmlFor={`subject-${subject}`} className="form-label text-sm">{subject}</label>
                    <input 
                      type="number" 
                      id={`subject-${subject}`} 
                      name={`subject-${subject}`} 
                      className="input" 
                      min="0" 
                      max="100" 
                      defaultValue={selectedStudent?.subjects[subject] || ''} 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea 
                id="notes" 
                name="notes" 
                className="input" 
                rows={3} 
                defaultValue={selectedStudent?.notes || ''} 
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button" 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              onClick={closeStudentModal}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedStudent ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAssignmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 theme-transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto p-6 m-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedAssignment ? 'Edit Assignment' : 'Add New Assignment'}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
            onClick={closeAssignmentModal}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAssignmentSubmit}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Assignment Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                className="input" 
                defaultValue={selectedAssignment?.title || ''} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea 
                id="description" 
                name="description" 
                className="input" 
                rows={3} 
                defaultValue={selectedAssignment?.description || ''} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="dueDate" className="form-label">Due Date</label>
                <input 
                  type="date" 
                  id="dueDate" 
                  name="dueDate" 
                  className="input" 
                  defaultValue={selectedAssignment ? format(new Date(selectedAssignment.dueDate), 'yyyy-MM-dd') : ''} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <select 
                  id="subject" 
                  name="subject" 
                  className="input" 
                  defaultValue={selectedAssignment?.subject || SUBJECTS[0]}
                >
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxScore" className="form-label">Maximum Score</label>
              <input 
                type="number" 
                id="maxScore" 
                name="maxScore" 
                className="input" 
                min="1" 
                max="100" 
                defaultValue={selectedAssignment?.maxScore || 100} 
                required 
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button" 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              onClick={closeAssignmentModal}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedAssignment ? 'Update Assignment' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSubmissionModal = () => {
    if (!selectedAssignment || !selectedStudent) return null;
    
    const submission = getSubmissionForStudent(selectedAssignment.id, selectedStudent.id);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 theme-transition-all">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto p-6 m-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Grade Assignment
            </h2>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
              onClick={closeSubmissionModal}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Assignment</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{selectedAssignment.title}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Student</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{selectedStudent.name}</div>
          </div>
          
          <form onSubmit={handleSubmissionSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="score" className="form-label">Score (out of {selectedAssignment.maxScore})</label>
                <input 
                  type="number" 
                  id="score" 
                  name="score" 
                  className="input" 
                  min="0" 
                  max={selectedAssignment.maxScore} 
                  defaultValue={submission?.score || ''} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="feedback" className="form-label">Feedback</label>
                <textarea 
                  id="feedback" 
                  name="feedback" 
                  className="input" 
                  rows={3} 
                  defaultValue={submission?.feedback || ''} 
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                type="button" 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={closeSubmissionModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Grade
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Event listener for Escape key to close modals
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSubmissionModalOpen) closeSubmissionModal();
        else if (isAssignmentModalOpen) closeAssignmentModal();
        else if (isStudentModalOpen) closeStudentModal();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isStudentModalOpen, isAssignmentModalOpen, isSubmissionModalOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {renderNav()}
      
      <main className="flex-1">
        {renderTabs()}
        
        {(activeTab === 'students' || activeTab === 'assignments') && renderSearchAndFilters()}
        
        {activeTab === 'students' && renderStudentsList()}
        {activeTab === 'assignments' && renderAssignmentsList()}
        {activeTab === 'analytics' && renderAnalyticsView()}
      </main>
      
      <footer className="py-4 px-6 bg-white dark:bg-slate-800 border-t dark:border-slate-700 text-center text-sm text-gray-500 dark:text-slate-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
      
      {isStudentModalOpen && renderStudentModal()}
      {isAssignmentModalOpen && renderAssignmentModal()}
      {isSubmissionModalOpen && renderSubmissionModal()}
    </div>
  );
};

export default App;
