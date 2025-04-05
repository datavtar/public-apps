import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
  User,
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  BarChart2,
  TrendingUp,
  Clock,
  FileText,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Define types and interfaces
type Student = {
  id: string;
  name: string;
  grade: string;
  subjects: Subject[];
  attendance: Attendance[];
  notes: string;
  createdAt: string;
};

type Subject = {
  id: string;
  name: string;
  scores: Score[];
};

type Score = {
  id: string;
  testName: string;
  date: string;
  score: number;
  totalPossible: number;
};

type Attendance = {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
};

type ProgressReportItem = {
  id: string;
  studentId: string;
  date: string;
  title: string;
  content: string;
  goals: string;
};

type Tab = 'students' | 'progress' | 'analytics';

type SortConfig = {
  key: keyof Student | '';
  direction: 'ascending' | 'descending';
};

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

type AttendanceStats = {
  present: number;
  absent: number;
  late: number;
  excused: number;
};

type GradeBreakdown = {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
};

type ScoreType = {
  name: string;
  score: number;
  fill: string;
};

const App: React.FC = () => {
  // State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);
  const [isAddingProgressReport, setIsAddingProgressReport] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'ascending' });
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('all');
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [isAddingScore, setIsAddingScore] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isAddingAttendance, setIsAddingAttendance] = useState<boolean>(false);
  const [editingProgressReport, setEditingProgressReport] = useState<ProgressReportItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sample grade levels
  const gradeOptions = [
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade'
  ];

  // Set theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load data from localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedProgressReports = localStorage.getItem('progressReports');

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    if (savedProgressReports) {
      setProgressReports(JSON.parse(savedProgressReports));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('progressReports', JSON.stringify(progressReports));
  }, [progressReports]);

  // Handle ESC key to close modals
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

  // Handle clicking outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeAllModals();
      }
    };

    if (isAddingStudent || isAddingProgressReport || selectedStudent || editingStudent || isAddingSubject || isAddingScore || isAddingAttendance || editingProgressReport) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingStudent, isAddingProgressReport, selectedStudent, editingStudent, isAddingSubject, isAddingScore, isAddingAttendance, editingProgressReport]);

  // Handle notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const closeAllModals = () => {
    setIsAddingStudent(false);
    setIsAddingProgressReport(false);
    setSelectedStudent(null);
    setEditingStudent(null);
    setIsAddingSubject(false);
    setIsAddingScore(false);
    setSelectedSubject(null);
    setIsAddingAttendance(false);
    setEditingProgressReport(null);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // Filter students based on search term and grade filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = studentGradeFilter === 'all' || student.grade === studentGradeFilter;
    return matchesSearch && matchesGrade;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  // Filter progress reports based on search term
  const filteredProgressReports = progressReports.filter(report => {
    // Find the student to get the name
    const student = students.find(s => s.id === report.studentId);
    const studentName = student ? student.name : '';
    
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort progress reports by date (newest first)
  const sortedProgressReports = [...filteredProgressReports].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Add a new student
  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const grade = formData.get('grade') as string;
    const notes = formData.get('notes') as string;

    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      grade,
      subjects: [],
      attendance: [],
      notes,
      createdAt: new Date().toISOString()
    };

    setStudents([...students, newStudent]);
    setIsAddingStudent(false);
    showNotification(`Student ${name} added successfully`, 'success');
  };

  // Update an existing student
  const handleUpdateStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const grade = formData.get('grade') as string;
    const notes = formData.get('notes') as string;

    const updatedStudents = students.map(student => {
      if (student.id === editingStudent.id) {
        return {
          ...student,
          name,
          grade,
          notes
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setEditingStudent(null);
    showNotification(`Student ${name} updated successfully`, 'success');
  };

  // Delete a student
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      const studentToDelete = students.find(student => student.id === id);
      const updatedStudents = students.filter(student => student.id !== id);
      
      // Also delete all progress reports for this student
      const updatedProgressReports = progressReports.filter(report => report.studentId !== id);
      
      setStudents(updatedStudents);
      setProgressReports(updatedProgressReports);
      
      if (studentToDelete) {
        showNotification(`Student ${studentToDelete.name} deleted successfully`, 'success');
      }
    }
  };

  // Add a new progress report
  const handleAddProgressReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const goals = formData.get('goals') as string;

    const newProgressReport: ProgressReportItem = {
      id: Date.now().toString(),
      studentId,
      date: new Date().toISOString(),
      title,
      content,
      goals
    };

    setProgressReports([...progressReports, newProgressReport]);
    setIsAddingProgressReport(false);
    
    const student = students.find(s => s.id === studentId);
    if (student) {
      showNotification(`Progress report for ${student.name} added successfully`, 'success');
    }
  };

  // Update an existing progress report
  const handleUpdateProgressReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProgressReport) return;

    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const goals = formData.get('goals') as string;

    const updatedProgressReports = progressReports.map(report => {
      if (report.id === editingProgressReport.id) {
        return {
          ...report,
          studentId,
          title,
          content,
          goals
        };
      }
      return report;
    });

    setProgressReports(updatedProgressReports);
    setEditingProgressReport(null);
    
    const student = students.find(s => s.id === studentId);
    if (student) {
      showNotification(`Progress report for ${student.name} updated successfully`, 'success');
    }
  };

  // Delete a progress report
  const handleDeleteProgressReport = (id: string) => {
    if (window.confirm('Are you sure you want to delete this progress report? This action cannot be undone.')) {
      const reportToDelete = progressReports.find(report => report.id === id);
      const studentForReport = reportToDelete ? students.find(s => s.id === reportToDelete.studentId) : null;
      
      const updatedProgressReports = progressReports.filter(report => report.id !== id);
      setProgressReports(updatedProgressReports);
      
      if (reportToDelete && studentForReport) {
        showNotification(`Progress report for ${studentForReport.name} deleted successfully`, 'success');
      }
    }
  };

  // Add a new subject to a student
  const handleAddSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const formData = new FormData(e.currentTarget);
    const subjectName = formData.get('subjectName') as string;

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectName,
      scores: []
    };

    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        return {
          ...student,
          subjects: [...student.subjects, newSubject]
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setIsAddingSubject(false);
    // Update the selected student with the new subject
    const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
    }
    showNotification(`Subject ${subjectName} added to ${selectedStudent.name}`, 'success');
  };

  // Add a new score to a subject
  const handleAddScore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) return;

    const formData = new FormData(e.currentTarget);
    const testName = formData.get('testName') as string;
    const date = formData.get('date') as string;
    const score = parseInt(formData.get('score') as string, 10);
    const totalPossible = parseInt(formData.get('totalPossible') as string, 10);

    const newScore: Score = {
      id: Date.now().toString(),
      testName,
      date,
      score,
      totalPossible
    };

    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const updatedSubjects = student.subjects.map(subject => {
          if (subject.id === selectedSubject.id) {
            return {
              ...subject,
              scores: [...subject.scores, newScore]
            };
          }
          return subject;
        });

        return {
          ...student,
          subjects: updatedSubjects
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setIsAddingScore(false);
    // Update the selected student and subject with the new score
    const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
      const updatedSubject = updatedStudent.subjects.find(s => s.id === selectedSubject.id);
      if (updatedSubject) {
        setSelectedSubject(updatedSubject);
      }
    }
    showNotification(`Score added to ${selectedSubject.name} for ${selectedStudent.name}`, 'success');
  };

  // Add attendance record
  const handleAddAttendance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const status = formData.get('status') as AttendanceStatus;

    const newAttendance: Attendance = {
      id: Date.now().toString(),
      date,
      status
    };

    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        return {
          ...student,
          attendance: [...student.attendance, newAttendance]
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setIsAddingAttendance(false);
    // Update the selected student with the new attendance
    const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
    }
    showNotification(`Attendance recorded for ${selectedStudent.name}`, 'success');
  };

  // Delete a subject
  const handleDeleteSubject = (subjectId: string) => {
    if (!selectedStudent) return;
    if (window.confirm('Are you sure you want to delete this subject? All scores will be lost.')) {
      const subjectToDelete = selectedStudent.subjects.find(s => s.id === subjectId);
      
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: student.subjects.filter(subject => subject.id !== subjectId)
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      // Update the selected student without the deleted subject
      const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
      
      if (subjectToDelete) {
        showNotification(`Subject ${subjectToDelete.name} deleted from ${selectedStudent.name}`, 'success');
      }
    }
  };

  // Delete a score
  const handleDeleteScore = (subjectId: string, scoreId: string) => {
    if (!selectedStudent) return;
    if (window.confirm('Are you sure you want to delete this score?')) {
      const subject = selectedStudent.subjects.find(s => s.id === subjectId);
      const scoreToDelete = subject?.scores.find(s => s.id === scoreId);
      
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          const updatedSubjects = student.subjects.map(subject => {
            if (subject.id === subjectId) {
              return {
                ...subject,
                scores: subject.scores.filter(score => score.id !== scoreId)
              };
            }
            return subject;
          });

          return {
            ...student,
            subjects: updatedSubjects
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      // Update the selected student and subject without the deleted score
      const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
        if (subject) {
          const updatedSubject = updatedStudent.subjects.find(s => s.id === subjectId);
          if (updatedSubject) {
            setSelectedSubject(updatedSubject);
          }
        }
      }
      
      if (subject && scoreToDelete) {
        showNotification(`Score for ${scoreToDelete.testName} deleted from ${subject.name}`, 'success');
      }
    }
  };

  // Delete an attendance record
  const handleDeleteAttendance = (attendanceId: string) => {
    if (!selectedStudent) return;
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      const attendanceToDelete = selectedStudent.attendance.find(a => a.id === attendanceId);
      
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            attendance: student.attendance.filter(attendance => attendance.id !== attendanceId)
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      // Update the selected student without the deleted attendance
      const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
      
      if (attendanceToDelete) {
        showNotification(`Attendance record for ${format(new Date(attendanceToDelete.date), 'MM/dd/yyyy')} deleted`, 'success');
      }
    }
  };

  // Calculate student statistics for analytics
  const calculateStudentStats = () => {
    // Attendance statistics
    const attendanceStats: AttendanceStats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    students.forEach(student => {
      student.attendance.forEach(record => {
        attendanceStats[record.status]++;
      });
    });

    // Convert to chart data format
    const attendanceChartData = [
      { name: 'Present', value: attendanceStats.present, fill: '#4ade80' },
      { name: 'Absent', value: attendanceStats.absent, fill: '#ef4444' },
      { name: 'Late', value: attendanceStats.late, fill: '#facc15' },
      { name: 'Excused', value: attendanceStats.excused, fill: '#60a5fa' }
    ];

    // Grade breakdown (based on average scores)
    const gradeBreakdown: GradeBreakdown = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    students.forEach(student => {
      let totalScore = 0;
      let totalPossible = 0;

      student.subjects.forEach(subject => {
        subject.scores.forEach(score => {
          totalScore += score.score;
          totalPossible += score.totalPossible;
        });
      });

      if (totalPossible > 0) {
        const percentage = (totalScore / totalPossible) * 100;
        if (percentage >= 90) gradeBreakdown.A++;
        else if (percentage >= 80) gradeBreakdown.B++;
        else if (percentage >= 70) gradeBreakdown.C++;
        else if (percentage >= 60) gradeBreakdown.D++;
        else gradeBreakdown.F++;
      }
    });

    // Convert to chart data format
    const gradeChartData = [
      { name: 'A', count: gradeBreakdown.A },
      { name: 'B', count: gradeBreakdown.B },
      { name: 'C', count: gradeBreakdown.C },
      { name: 'D', count: gradeBreakdown.D },
      { name: 'F', count: gradeBreakdown.F }
    ];

    const COLORS = ['#4ade80', '#a3e635', '#facc15', '#fb923c', '#ef4444'];

    // Grade distribution by student grade level
    const gradesByLevel: Record<string, number> = {};
    students.forEach(student => {
      if (!gradesByLevel[student.grade]) {
        gradesByLevel[student.grade] = 0;
      }
      gradesByLevel[student.grade]++;
    });

    // Convert to chart data format
    const gradeLevelData = Object.keys(gradesByLevel)
      .map(grade => ({ name: grade, students: gradesByLevel[grade] }))
      .sort((a, b) => {
        // Sort grade levels in order
        const aIndex = gradeOptions.indexOf(a.name);
        const bIndex = gradeOptions.indexOf(b.name);
        return aIndex - bIndex;
      });

    return { attendanceChartData, gradeChartData, gradeLevelData, COLORS };
  };

  const { attendanceChartData, gradeChartData, gradeLevelData, COLORS } = calculateStudentStats();

  // Calculate average score for a subject
  const calculateSubjectAverage = (subject: Subject) => {
    if (subject.scores.length === 0) return 'N/A';
    
    let totalScore = 0;
    let totalPossible = 0;
    
    subject.scores.forEach(score => {
      totalScore += score.score;
      totalPossible += score.totalPossible;
    });
    
    if (totalPossible === 0) return 'N/A';
    
    const average = (totalScore / totalPossible) * 100;
    return average.toFixed(1) + '%';
  };

  // Calculate letter grade based on percentage
  const calculateLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  // Calculate overall average for student
  const calculateStudentAverage = (student: Student): { average: string; letterGrade: string } => {
    let totalScore = 0;
    let totalPossible = 0;
    
    student.subjects.forEach(subject => {
      subject.scores.forEach(score => {
        totalScore += score.score;
        totalPossible += score.totalPossible;
      });
    });
    
    if (totalPossible === 0) return { average: 'N/A', letterGrade: 'N/A' };
    
    const averagePercentage = (totalScore / totalPossible) * 100;
    const letterGrade = calculateLetterGrade(averagePercentage);
    
    return { 
      average: averagePercentage.toFixed(1) + '%', 
      letterGrade 
    };
  };

  // Calculate attendance percentage
  const calculateAttendancePercentage = (student: Student): string => {
    if (student.attendance.length === 0) return 'N/A';
    
    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === 'present').length;
    
    const percentage = (presentDays / totalDays) * 100;
    return percentage.toFixed(1) + '%';
  };

  // Get score data for charts
  const getScoreData = (student: Student): ScoreType[] => {
    const scoreData: ScoreType[] = [];
    const colors = ['#4ade80', '#a3e635', '#facc15', '#fb923c', '#ef4444', '#60a5fa', '#a78bfa', '#f472b6'];
    
    student.subjects.forEach((subject, index) => {
      if (subject.scores.length > 0) {
        let totalScore = 0;
        let totalPossible = 0;
        
        subject.scores.forEach(score => {
          totalScore += score.score;
          totalPossible += score.totalPossible;
        });
        
        if (totalPossible > 0) {
          const percentage = (totalScore / totalPossible) * 100;
          scoreData.push({
            name: subject.name,
            score: parseFloat(percentage.toFixed(1)),
            fill: colors[index % colors.length]
          });
        }
      }
    });
    
    return scoreData;
  };

  // Get attendance status badge color
  const getAttendanceStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present': return 'badge-success';
      case 'absent': return 'badge-error';
      case 'late': return 'badge-warning';
      case 'excused': return 'badge-info';
      default: return 'badge-info';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'students' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              aria-label="View students"
            >
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span>Students</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'progress' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              aria-label="View progress reports"
            >
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                <span>Progress Reports</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'analytics' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              aria-label="View analytics"
            >
              <div className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'alert alert-success' : 'alert alert-error'} flex items-center shadow-lg max-w-md`}>
            {notification.type === 'success' ? 
              <CheckCircle2 className="h-5 w-5 mr-2" /> : 
              <AlertCircle className="h-5 w-5 mr-2" />}
            <p>{notification.message}</p>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-auto"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="input pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search students"
                  />
                </div>
                
                <div className="relative w-full sm:w-48">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 w-full"
                    value={studentGradeFilter}
                    onChange={(e) => setStudentGradeFilter(e.target.value)}
                    aria-label="Filter by grade"
                  >
                    <option value="all">All Grades</option>
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="btn btn-primary w-full sm:w-auto"
                  aria-label="Add new student"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            {/* Students List */}
            {students.length === 0 ? (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No students found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Add a student to get started.</p>
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="btn btn-primary mt-4 mx-auto"
                  aria-label="Add your first student"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>Add Your First Student</span>
                </button>
              </div>
            ) : sortedStudents.length === 0 ? (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No matching students</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try changing your search or filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStudentGradeFilter('all');
                  }}
                  className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 mt-4 mx-auto"
                  aria-label="Clear filters"
                >
                  <X className="h-5 w-5 mr-2" />
                  <span>Clear Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedStudents.map(student => {
                  const { average, letterGrade } = calculateStudentAverage(student);
                  const attendancePercentage = calculateAttendancePercentage(student);
                  
                  return (
                    <div key={student.id} className="card hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{student.grade}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            aria-label={`Edit ${student.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                            aria-label={`Delete ${student.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="stat-card">
                          <div className="stat-title">Average Grade</div>
                          <div className="stat-value">{average !== 'N/A' ? letterGrade : 'N/A'}</div>
                          <div className="stat-desc">{average}</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-title">Attendance</div>
                          <div className="stat-value">{attendancePercentage}</div>
                          <div className="stat-desc">{student.attendance.length} days recorded</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          <span className="font-medium">Notes:</span> {student.notes || 'No notes yet'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 w-full mt-4"
                        aria-label={`View details for ${student.name}`}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Progress Reports Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Reports</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="input pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search progress reports"
                  />
                </div>
                
                <button
                  onClick={() => setIsAddingProgressReport(true)}
                  className="btn btn-primary w-full sm:w-auto"
                  aria-label="Add new progress report"
                  disabled={students.length === 0}
                  title={students.length === 0 ? "Add students first" : ""}
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>Add Report</span>
                </button>
              </div>
            </div>

            {/* Progress Reports List */}
            {progressReports.length === 0 ? (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No progress reports found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {students.length === 0 ? 
                    "Add students first, then create progress reports." : 
                    "Create your first progress report to track student development."}
                </p>
                {students.length > 0 && (
                  <button
                    onClick={() => setIsAddingProgressReport(true)}
                    className="btn btn-primary mt-4 mx-auto"
                    aria-label="Add your first progress report"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span>Create First Report</span>
                  </button>
                )}
              </div>
            ) : sortedProgressReports.length === 0 ? (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No matching reports</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try changing your search criteria.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 mt-4 mx-auto"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5 mr-2" />
                  <span>Clear Search</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProgressReports.map(report => {
                  const student = students.find(s => s.id === report.studentId);
                  if (!student) return null; // Skip reports for deleted students
                  
                  return (
                    <div key={report.id} className="card hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">- {student.name}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="inline h-4 w-4 mr-1" />
                            {format(new Date(report.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingProgressReport(report)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            aria-label={`Edit report for ${student.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProgressReport(report.id)}
                            className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                            aria-label={`Delete report for ${student.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Notes:</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">{report.content}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Goals:</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">{report.goals}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Class Analytics</h2>
            
            {students.length === 0 ? (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No data available</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Add students and their data to view analytics.</p>
                <button
                  onClick={() => {
                    setActiveTab('students');
                    setIsAddingStudent(true);
                  }}
                  className="btn btn-primary mt-4 mx-auto"
                  aria-label="Add your first student"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>Add Students</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Student Count</h3>
                    <div className="mt-4 flex items-center">
                      <User className="h-6 w-6 text-primary-500 mr-2" />
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{students.length}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Total number of students</p>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Average Attendance</h3>
                    <div className="mt-4 flex items-center">
                      <TrendingUp className="h-6 w-6 text-primary-500 mr-2" />
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(() => {
                          const totalAttendance = students.reduce((acc, student) => acc + student.attendance.length, 0);
                          const totalPresent = students.reduce((acc, student) => {
                            return acc + student.attendance.filter(a => a.status === 'present').length;
                          }, 0);
                          
                          if (totalAttendance === 0) return 'N/A';
                          return ((totalPresent / totalAttendance) * 100).toFixed(1) + '%';
                        })()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Class-wide attendance rate</p>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Progress Reports</h3>
                    <div className="mt-4 flex items-center">
                      <FileText className="h-6 w-6 text-primary-500 mr-2" />
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{progressReports.length}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Total progress reports created</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attendance Breakdown</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={attendanceChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {attendanceChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} records`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={gradeChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                          <Legend />
                          <Bar dataKey="count" name="Students" fill="#4ade80">
                            {gradeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Students by Grade Level</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={gradeLevelData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                        <Legend />
                        <Bar dataKey="students" name="Number of Students" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* MODALS */}
      
      {/* Add Student Modal */}
      {isAddingStudent && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="add-student-modal-title">Add New Student</h3>
              <button
                onClick={() => setIsAddingStudent(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Student Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="input"
                    placeholder="Enter student's full name"
                    aria-labelledby="add-student-modal-title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="grade" className="form-label">Grade Level</label>
                  <select
                    id="grade"
                    name="grade"
                    required
                    className="input"
                    aria-labelledby="add-student-modal-title"
                  >
                    <option value="">Select a grade level</option>
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input resize-none"
                    placeholder="Enter any notes about the student"
                    aria-labelledby="add-student-modal-title"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="edit-student-modal-title">Edit Student</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStudent} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">Student Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    required
                    className="input"
                    defaultValue={editingStudent.name}
                    aria-labelledby="edit-student-modal-title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-grade" className="form-label">Grade Level</label>
                  <select
                    id="edit-grade"
                    name="grade"
                    required
                    className="input"
                    defaultValue={editingStudent.grade}
                    aria-labelledby="edit-student-modal-title"
                  >
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-notes" className="form-label">Notes (Optional)</label>
                  <textarea
                    id="edit-notes"
                    name="notes"
                    rows={3}
                    className="input resize-none"
                    defaultValue={editingStudent.notes}
                    aria-labelledby="edit-student-modal-title"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Update Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Progress Report Modal */}
      {isAddingProgressReport && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="add-report-modal-title">Add Progress Report</h3>
              <button
                onClick={() => setIsAddingProgressReport(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProgressReport} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">Student</label>
                  <select
                    id="studentId"
                    name="studentId"
                    required
                    className="input"
                    aria-labelledby="add-report-modal-title"
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name} - {student.grade}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Report Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="input"
                    placeholder="e.g., Monthly Progress, Quarter 1 Assessment"
                    aria-labelledby="add-report-modal-title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="content" className="form-label">Progress Notes</label>
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    required
                    className="input resize-none"
                    placeholder="Describe the student's progress, achievements, and areas of growth"
                    aria-labelledby="add-report-modal-title"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="goals" className="form-label">Goals and Next Steps</label>
                  <textarea
                    id="goals"
                    name="goals"
                    rows={3}
                    required
                    className="input resize-none"
                    placeholder="List goals and recommended next steps for improvement"
                    aria-labelledby="add-report-modal-title"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddingProgressReport(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Progress Report Modal */}
      {editingProgressReport && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="edit-report-modal-title">Edit Progress Report</h3>
              <button
                onClick={() => setEditingProgressReport(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProgressReport} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="edit-report-studentId" className="form-label">Student</label>
                  <select
                    id="edit-report-studentId"
                    name="studentId"
                    required
                    className="input"
                    defaultValue={editingProgressReport.studentId}
                    aria-labelledby="edit-report-modal-title"
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name} - {student.grade}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-report-title" className="form-label">Report Title</label>
                  <input
                    type="text"
                    id="edit-report-title"
                    name="title"
                    required
                    className="input"
                    defaultValue={editingProgressReport.title}
                    aria-labelledby="edit-report-modal-title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-report-content" className="form-label">Progress Notes</label>
                  <textarea
                    id="edit-report-content"
                    name="content"
                    rows={4}
                    required
                    className="input resize-none"
                    defaultValue={editingProgressReport.content}
                    aria-labelledby="edit-report-modal-title"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-report-goals" className="form-label">Goals and Next Steps</label>
                  <textarea
                    id="edit-report-goals"
                    name="goals"
                    rows={3}
                    required
                    className="input resize-none"
                    defaultValue={editingProgressReport.goals}
                    aria-labelledby="edit-report-modal-title"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingProgressReport(null)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Update Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="student-details-modal-title">{selectedStudent.name} - {selectedStudent.grade}</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2">
                  {/* Student Info & Performance */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Academic Performance</h4>
                    
                    {/* Subject & Score List */}
                    {selectedStudent.subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No subjects added yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedStudent.subjects.map(subject => (
                          <div key={subject.id} className="py-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">{subject.name}</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Average: {calculateSubjectAverage(subject)}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSubject(subject);
                                    setIsAddingScore(true);
                                  }}
                                  className="p-1 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                  aria-label={`Add score to ${subject.name}`}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(subject.id)}
                                  className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                                  aria-label={`Delete ${subject.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Score List */}
                            {subject.scores.length === 0 ? (
                              <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-2">No scores recorded</p>
                            ) : (
                              <div className="mt-2 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead>
                                    <tr>
                                      <th className="table-header text-xs">Test</th>
                                      <th className="table-header text-xs">Date</th>
                                      <th className="table-header text-xs">Score</th>
                                      <th className="table-header text-xs">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {subject.scores.map(score => (
                                      <tr key={score.id}>
                                        <td className="table-cell py-2 text-xs">{score.testName}</td>
                                        <td className="table-cell py-2 text-xs">{format(new Date(score.date), 'MM/dd/yyyy')}</td>
                                        <td className="table-cell py-2 text-xs">
                                          {score.score}/{score.totalPossible} ({((score.score / score.totalPossible) * 100).toFixed(1)}%)
                                        </td>
                                        <td className="table-cell py-2 text-xs">
                                          <button
                                            onClick={() => handleDeleteScore(subject.id, score.id)}
                                            className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                                            aria-label={`Delete score for ${score.testName}`}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setIsAddingSubject(true)}
                      className="btn btn-sm btn-primary mt-4"
                      aria-label="Add new subject"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      <span>Add Subject</span>
                    </button>
                  </div>

                  {/* Attendance Records */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Attendance Records</h4>
                      <button
                        onClick={() => setIsAddingAttendance(true)}
                        className="btn btn-sm btn-primary"
                        aria-label="Add attendance record"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        <span>Add Record</span>
                      </button>
                    </div>
                    
                    {selectedStudent.attendance.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No attendance records yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="table-header">Date</th>
                              <th className="table-header">Status</th>
                              <th className="table-header">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {selectedStudent.attendance
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map(record => (
                                <tr key={record.id}>
                                  <td className="table-cell">{format(new Date(record.date), 'MM/dd/yyyy')}</td>
                                  <td className="table-cell">
                                    <span className={`badge ${getAttendanceStatusColor(record.status)}`}>
                                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="table-cell">
                                    <button
                                      onClick={() => handleDeleteAttendance(record.id)}
                                      className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                                      aria-label={`Delete attendance record for ${format(new Date(record.date), 'MM/dd/yyyy')}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  {/* Performance Chart */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Performance By Subject</h4>
                    
                    {getScoreData(selectedStudent).length === 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add subjects and scores to see performance chart.</p>
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getScoreData(selectedStudent)}
                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                            <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="score" name="Average Score (%)">
                              {getScoreData(selectedStudent).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Reports for this student */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Progress Reports</h4>
                    
                    {progressReports.filter(report => report.studentId === selectedStudent.id).length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No progress reports yet for this student.</p>
                        <button
                          onClick={() => {
                            setSelectedStudent(null);
                            setActiveTab('progress');
                            setIsAddingProgressReport(true);
                          }}
                          className="btn btn-sm btn-primary"
                          aria-label="Create progress report"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          <span>Create Report</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {progressReports
                          .filter(report => report.studentId === selectedStudent.id)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(report => (
                            <div key={report.id} className="bg-white dark:bg-gray-700 rounded p-3 shadow-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">{report.title}</h5>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {format(new Date(report.date), 'MMMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(null);
                                      setActiveTab('progress');
                                      setEditingProgressReport(report);
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    aria-label={`Edit report ${report.title}`}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress:</h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{report.content}</p>
                              </div>
                              
                              <div className="mt-2">
                                <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300">Goals:</h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{report.goals}</p>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer mt-6">
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddingSubject && selectedStudent && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="add-subject-modal-title">Add Subject for {selectedStudent.name}</h3>
              <button
                onClick={() => setIsAddingSubject(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubject} className="mt-4">
              <div className="form-group">
                <label htmlFor="subjectName" className="form-label">Subject Name</label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  required
                  className="input"
                  placeholder="e.g., Math, Science, English"
                  aria-labelledby="add-subject-modal-title"
                />
              </div>
              
              <div className="modal-footer mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Score Modal */}
      {isAddingScore && selectedStudent && selectedSubject && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="add-score-modal-title">Add Score for {selectedSubject.name}</h3>
              <button
                onClick={() => setIsAddingScore(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddScore} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="testName" className="form-label">Test/Assignment Name</label>
                  <input
                    type="text"
                    id="testName"
                    name="testName"
                    required
                    className="input"
                    placeholder="e.g., Midterm Exam, Chapter 5 Quiz"
                    aria-labelledby="add-score-modal-title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="input"
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                    aria-labelledby="add-score-modal-title"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="score" className="form-label">Score</label>
                    <input
                      type="number"
                      id="score"
                      name="score"
                      required
                      min="0"
                      className="input"
                      placeholder="Points earned"
                      aria-labelledby="add-score-modal-title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="totalPossible" className="form-label">Total Possible</label>
                    <input
                      type="number"
                      id="totalPossible"
                      name="totalPossible"
                      required
                      min="1"
                      className="input"
                      placeholder="Maximum points"
                      aria-labelledby="add-score-modal-title"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingScore(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Score</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attendance Record Modal */}
      {isAddingAttendance && selectedStudent && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="add-attendance-modal-title">Add Attendance for {selectedStudent.name}</h3>
              <button
                onClick={() => setIsAddingAttendance(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAttendance} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="input"
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                    aria-labelledby="add-attendance-modal-title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="input"
                    aria-labelledby="add-attendance-modal-title"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingAttendance(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;