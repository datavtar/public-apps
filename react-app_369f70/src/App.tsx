import React, { useState, useEffect } from 'react';
import { User, UserPlus, Edit, Trash2, Calendar, BookOpen, MessageCircle, ChartBar, Plus, Search, Filter, Check, X, GraduationCap, Clock, Target, Mail, Phone, FileText, Download, Upload, Sun, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  enrollmentDate: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
}

interface Grade {
  id: string;
  studentId: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
  type: 'exam' | 'assignment' | 'quiz' | 'project';
  comments?: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  maxScore: number;
  type: 'homework' | 'project' | 'exam' | 'quiz';
  status: 'active' | 'completed' | 'overdue';
}

interface Communication {
  id: string;
  studentId: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'sent' | 'pending' | 'read';
}

type Tab = 'students' | 'grades' | 'attendance' | 'assignments' | 'communication' | 'reports';

function App() {
  // State Management
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize sample data
  useEffect(() => {
    const sampleStudents: Student[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '2005-03-15',
        enrollmentDate: '2023-09-01',
        guardianName: 'Robert Smith',
        guardianPhone: '(555) 123-4568',
        address: '123 Main St, City, State 12345'
      },
      {
        id: '2',
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@email.com',
        phone: '(555) 234-5678',
        dateOfBirth: '2005-07-22',
        enrollmentDate: '2023-09-01',
        guardianName: 'Sarah Johnson',
        guardianPhone: '(555) 234-5679',
        address: '456 Oak Ave, City, State 12345'
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '(555) 345-6789',
        dateOfBirth: '2005-11-08',
        enrollmentDate: '2023-09-01',
        guardianName: 'David Brown',
        guardianPhone: '(555) 345-6790',
        address: '789 Pine St, City, State 12345'
      }
    ];

    const sampleGrades: Grade[] = [
      { id: '1', studentId: '1', subject: 'Mathematics', assignment: 'Algebra Test', score: 85, maxScore: 100, date: '2024-01-15', type: 'exam', comments: 'Good work on quadratic equations' },
      { id: '2', studentId: '1', subject: 'Science', assignment: 'Physics Lab', score: 92, maxScore: 100, date: '2024-01-12', type: 'assignment', comments: 'Excellent lab report' },
      { id: '3', studentId: '2', subject: 'English', assignment: 'Essay Writing', score: 88, maxScore: 100, date: '2024-01-14', type: 'assignment', comments: 'Well structured essay' },
      { id: '4', studentId: '2', subject: 'Mathematics', assignment: 'Geometry Quiz', score: 76, maxScore: 100, date: '2024-01-16', type: 'quiz', comments: 'Review angle calculations' },
      { id: '5', studentId: '3', subject: 'History', assignment: 'World War II Project', score: 95, maxScore: 100, date: '2024-01-13', type: 'project', comments: 'Outstanding research and presentation' }
    ];

    const sampleAttendance: AttendanceRecord[] = [
      { id: '1', studentId: '1', date: '2024-01-15', status: 'present' },
      { id: '2', studentId: '1', date: '2024-01-16', status: 'present' },
      { id: '3', studentId: '2', date: '2024-01-15', status: 'late', notes: 'Arrived 10 minutes late' },
      { id: '4', studentId: '2', date: '2024-01-16', status: 'present' },
      { id: '5', studentId: '3', date: '2024-01-15', status: 'absent', notes: 'Sick leave' },
      { id: '6', studentId: '3', date: '2024-01-16', status: 'present' }
    ];

    const sampleAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Mathematics Chapter 5 Homework',
        subject: 'Mathematics',
        description: 'Complete exercises 1-20 from Chapter 5: Linear Equations',
        dueDate: '2024-01-20',
        assignedDate: '2024-01-15',
        maxScore: 100,
        type: 'homework',
        status: 'active'
      },
      {
        id: '2',
        title: 'Science Fair Project',
        subject: 'Science',
        description: 'Prepare a science fair project on renewable energy sources',
        dueDate: '2024-02-15',
        assignedDate: '2024-01-10',
        maxScore: 150,
        type: 'project',
        status: 'active'
      },
      {
        id: '3',
        title: 'English Literature Essay',
        subject: 'English',
        description: 'Write a 1000-word essay on Shakespeare\'s Hamlet',
        dueDate: '2024-01-18',
        assignedDate: '2024-01-08',
        maxScore: 100,
        type: 'homework',
        status: 'overdue'
      }
    ];

    const sampleCommunications: Communication[] = [
      {
        id: '1',
        studentId: '1',
        type: 'email',
        subject: 'Great Progress in Mathematics',
        message: 'John has shown excellent improvement in algebra. Keep up the good work!',
        date: '2024-01-15',
        priority: 'medium',
        status: 'sent'
      },
      {
        id: '2',
        studentId: '2',
        type: 'phone',
        subject: 'Attendance Concern',
        message: 'Called to discuss Emma\'s recent tardiness and ways to improve punctuality.',
        date: '2024-01-14',
        priority: 'high',
        status: 'sent'
      },
      {
        id: '3',
        studentId: '3',
        type: 'meeting',
        subject: 'Parent-Teacher Conference',
        message: 'Scheduled meeting to discuss Michael\'s exceptional performance and future opportunities.',
        date: '2024-01-16',
        priority: 'low',
        status: 'pending'
      }
    ];

    // Load from localStorage or use sample data
    const loadedStudents = localStorage.getItem('students');
    const loadedGrades = localStorage.getItem('grades');
    const loadedAttendance = localStorage.getItem('attendance');
    const loadedAssignments = localStorage.getItem('assignments');
    const loadedCommunications = localStorage.getItem('communications');
    const loadedDarkMode = localStorage.getItem('darkMode');

    setStudents(loadedStudents ? JSON.parse(loadedStudents) : sampleStudents);
    setGrades(loadedGrades ? JSON.parse(loadedGrades) : sampleGrades);
    setAttendance(loadedAttendance ? JSON.parse(loadedAttendance) : sampleAttendance);
    setAssignments(loadedAssignments ? JSON.parse(loadedAssignments) : sampleAssignments);
    setCommunications(loadedCommunications ? JSON.parse(loadedCommunications) : sampleCommunications);
    setIsDarkMode(loadedDarkMode === 'true');
  }, []);

  // Save to localStorage whenever data changes
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

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper Functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const calculateGPA = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    const average = studentGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0) / studentGrades.length;
    return Math.round(average * 100) / 100;
  };

  const getAttendanceRate = (studentId: string) => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    if (studentAttendance.length === 0) return 100;
    const presentCount = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  };

  // Modal Functions
  const openModal = (type: 'add' | 'edit', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    document.body.classList.remove('modal-open');
  };

  // CRUD Operations
  const handleAddStudent = (formData: FormData) => {
    const newStudent: Student = {
      id: generateId(),
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      enrollmentDate: formData.get('enrollmentDate') as string,
      guardianName: formData.get('guardianName') as string,
      guardianPhone: formData.get('guardianPhone') as string,
      address: formData.get('address') as string
    };
    setStudents([...students, newStudent]);
    closeModal();
  };

  const handleEditStudent = (formData: FormData) => {
    const updatedStudent: Student = {
      ...selectedItem,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      enrollmentDate: formData.get('enrollmentDate') as string,
      guardianName: formData.get('guardianName') as string,
      guardianPhone: formData.get('guardianPhone') as string,
      address: formData.get('address') as string
    };
    setStudents(students.map(s => s.id === selectedItem.id ? updatedStudent : s));
    closeModal();
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove all related grades, attendance, and communication records.')) {
      setStudents(students.filter(s => s.id !== studentId));
      setGrades(grades.filter(g => g.studentId !== studentId));
      setAttendance(attendance.filter(a => a.studentId !== studentId));
      setCommunications(communications.filter(c => c.studentId !== studentId));
    }
  };

  const handleAddGrade = (formData: FormData) => {
    const newGrade: Grade = {
      id: generateId(),
      studentId: formData.get('studentId') as string,
      subject: formData.get('subject') as string,
      assignment: formData.get('assignment') as string,
      score: Number(formData.get('score')),
      maxScore: Number(formData.get('maxScore')),
      date: formData.get('date') as string,
      type: formData.get('type') as 'exam' | 'assignment' | 'quiz' | 'project',
      comments: formData.get('comments') as string
    };
    setGrades([...grades, newGrade]);
    closeModal();
  };

  const handleEditGrade = (formData: FormData) => {
    const updatedGrade: Grade = {
      ...selectedItem,
      studentId: formData.get('studentId') as string,
      subject: formData.get('subject') as string,
      assignment: formData.get('assignment') as string,
      score: Number(formData.get('score')),
      maxScore: Number(formData.get('maxScore')),
      date: formData.get('date') as string,
      type: formData.get('type') as 'exam' | 'assignment' | 'quiz' | 'project',
      comments: formData.get('comments') as string
    };
    setGrades(grades.map(g => g.id === selectedItem.id ? updatedGrade : g));
    closeModal();
  };

  const handleDeleteGrade = (gradeId: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(g => g.id !== gradeId));
    }
  };

  const handleAddAttendance = (formData: FormData) => {
    const newAttendance: AttendanceRecord = {
      id: generateId(),
      studentId: formData.get('studentId') as string,
      date: formData.get('date') as string,
      status: formData.get('status') as 'present' | 'absent' | 'late' | 'excused',
      notes: formData.get('notes') as string
    };
    setAttendance([...attendance, newAttendance]);
    closeModal();
  };

  const handleEditAttendance = (formData: FormData) => {
    const updatedAttendance: AttendanceRecord = {
      ...selectedItem,
      studentId: formData.get('studentId') as string,
      date: formData.get('date') as string,
      status: formData.get('status') as 'present' | 'absent' | 'late' | 'excused',
      notes: formData.get('notes') as string
    };
    setAttendance(attendance.map(a => a.id === selectedItem.id ? updatedAttendance : a));
    closeModal();
  };

  const handleDeleteAttendance = (attendanceId: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      setAttendance(attendance.filter(a => a.id !== attendanceId));
    }
  };

  const handleAddAssignment = (formData: FormData) => {
    const newAssignment: Assignment = {
      id: generateId(),
      title: formData.get('title') as string,
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      dueDate: formData.get('dueDate') as string,
      assignedDate: formData.get('assignedDate') as string,
      maxScore: Number(formData.get('maxScore')),
      type: formData.get('type') as 'homework' | 'project' | 'exam' | 'quiz',
      status: 'active'
    };
    setAssignments([...assignments, newAssignment]);
    closeModal();
  };

  const handleEditAssignment = (formData: FormData) => {
    const updatedAssignment: Assignment = {
      ...selectedItem,
      title: formData.get('title') as string,
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      dueDate: formData.get('dueDate') as string,
      assignedDate: formData.get('assignedDate') as string,
      maxScore: Number(formData.get('maxScore')),
      type: formData.get('type') as 'homework' | 'project' | 'exam' | 'quiz',
      status: formData.get('status') as 'active' | 'completed' | 'overdue'
    };
    setAssignments(assignments.map(a => a.id === selectedItem.id ? updatedAssignment : a));
    closeModal();
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    }
  };

  const handleAddCommunication = (formData: FormData) => {
    const newCommunication: Communication = {
      id: generateId(),
      studentId: formData.get('studentId') as string,
      type: formData.get('type') as 'email' | 'phone' | 'meeting' | 'note',
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      date: formData.get('date') as string,
      priority: formData.get('priority') as 'low' | 'medium' | 'high',
      status: 'sent'
    };
    setCommunications([...communications, newCommunication]);
    closeModal();
  };

  const handleEditCommunication = (formData: FormData) => {
    const updatedCommunication: Communication = {
      ...selectedItem,
      studentId: formData.get('studentId') as string,
      type: formData.get('type') as 'email' | 'phone' | 'meeting' | 'note',
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      date: formData.get('date') as string,
      priority: formData.get('priority') as 'low' | 'medium' | 'high',
      status: formData.get('status') as 'sent' | 'pending' | 'read'
    };
    setCommunications(communications.map(c => c.id === selectedItem.id ? updatedCommunication : c));
    closeModal();
  };

  const handleDeleteCommunication = (communicationId: string) => {
    if (window.confirm('Are you sure you want to delete this communication record?')) {
      setCommunications(communications.filter(c => c.id !== communicationId));
    }
  };

  // Export/Import Functions
  const exportData = () => {
    const data = {
      students,
      grades,
      attendance,
      assignments,
      communications,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.students) setStudents(data.students);
          if (data.grades) setGrades(data.grades);
          if (data.attendance) setAttendance(data.attendance);
          if (data.assignments) setAssignments(data.assignments);
          if (data.communications) setCommunications(data.communications);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter Functions
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  const filteredGrades = grades.filter(grade => {
    const searchLower = searchTerm.toLowerCase();
    const student = students.find(s => s.id === grade.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    return (
      grade.subject.toLowerCase().includes(searchLower) ||
      grade.assignment.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower)
    );
  });

  const filteredAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date).toDateString();
    const selectedDateObj = new Date(selectedDate).toDateString();
    return recordDate === selectedDateObj;
  });

  const filteredAssignments = assignments.filter(assignment => {
    if (filterStatus === 'all') return true;
    return assignment.status === filterStatus;
  });

  const filteredCommunications = communications.filter(comm => {
    const searchLower = searchTerm.toLowerCase();
    const student = students.find(s => s.id === comm.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    return (
      comm.subject.toLowerCase().includes(searchLower) ||
      comm.message.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower)
    );
  });

  // Form Handlers
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    if (activeTab === 'students') {
      modalType === 'add' ? handleAddStudent(formData) : handleEditStudent(formData);
    } else if (activeTab === 'grades') {
      modalType === 'add' ? handleAddGrade(formData) : handleEditGrade(formData);
    } else if (activeTab === 'attendance') {
      modalType === 'add' ? handleAddAttendance(formData) : handleEditAttendance(formData);
    } else if (activeTab === 'assignments') {
      modalType === 'add' ? handleAddAssignment(formData) : handleEditAssignment(formData);
    } else if (activeTab === 'communication') {
      modalType === 'add' ? handleAddCommunication(formData) : handleEditCommunication(formData);
    }
  };

  // Keyboard handler for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Tab Configuration
  const tabs = [
    { id: 'students' as Tab, label: 'Students', icon: User },
    { id: 'grades' as Tab, label: 'Grades', icon: GraduationCap },
    { id: 'attendance' as Tab, label: 'Attendance', icon: Calendar },
    { id: 'assignments' as Tab, label: 'Assignments', icon: BookOpen },
    { id: 'communication' as Tab, label: 'Communication', icon: MessageCircle },
    { id: 'reports' as Tab, label: 'Reports', icon: ChartBar }
  ];

  // Chart Data for Reports
  const gradeDistributionData = [
    { name: 'A (90-100)', value: grades.filter(g => (g.score/g.maxScore)*100 >= 90).length },
    { name: 'B (80-89)', value: grades.filter(g => (g.score/g.maxScore)*100 >= 80 && (g.score/g.maxScore)*100 < 90).length },
    { name: 'C (70-79)', value: grades.filter(g => (g.score/g.maxScore)*100 >= 70 && (g.score/g.maxScore)*100 < 80).length },
    { name: 'D (60-69)', value: grades.filter(g => (g.score/g.maxScore)*100 >= 60 && (g.score/g.maxScore)*100 < 70).length },
    { name: 'F (0-59)', value: grades.filter(g => (g.score/g.maxScore)*100 < 60).length }
  ];

  const attendanceData = students.map(student => ({
    name: `${student.firstName} ${student.lastName}`,
    rate: getAttendanceRate(student.id)
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className={`min-h-screen theme-transition ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 min-h-screen">
        {/* Header */}
        <header className="bg-primary-600 dark:bg-slate-800 text-white shadow-lg">
          <div className="container-fluid py-4">
            <div className="flex-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8" />
                <h1 className="text-xl sm:text-2xl font-bold">Student Progress Tracker</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={exportData}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 text-sm flex items-center gap-2"
                  aria-label="Export data"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <label className="btn bg-white text-primary-600 hover:bg-gray-100 text-sm flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    aria-label="Import data file"
                  />
                </label>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 p-2"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="container-fluid">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container-fluid py-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-2xl font-bold">Students</h2>
                <button
                  onClick={() => openModal('add')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-4">
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
              </div>

              {/* Students Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="card">
                    <div className="flex-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex-center">
                          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.firstName} {student.lastName}</h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('edit', student)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          aria-label="Edit student"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex-between">
                        <span>GPA:</span>
                        <span className="font-medium">{calculateGPA(student.id)}%</span>
                      </div>
                      <div className="flex-between">
                        <span>Attendance:</span>
                        <span className="font-medium">{getAttendanceRate(student.id)}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-slate-400">{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-slate-400 truncate">{student.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === 'grades' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-2xl font-bold">Grades</h2>
                <button
                  onClick={() => openModal('add')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Grade
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search grades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Grades Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Student</th>
                      <th className="table-header px-6 py-3">Subject</th>
                      <th className="table-header px-6 py-3">Assignment</th>
                      <th className="table-header px-6 py-3">Score</th>
                      <th className="table-header px-6 py-3">Type</th>
                      <th className="table-header px-6 py-3">Date</th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredGrades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="table-cell font-medium">{getStudentName(grade.studentId)}</td>
                        <td className="table-cell">{grade.subject}</td>
                        <td className="table-cell">{grade.assignment}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{grade.score}/{grade.maxScore}</span>
                            <span className={`badge ${
                              (grade.score/grade.maxScore)*100 >= 90 ? 'badge-success' :
                              (grade.score/grade.maxScore)*100 >= 80 ? 'badge-info' :
                              (grade.score/grade.maxScore)*100 >= 70 ? 'badge-warning' : 'badge-error'
                            }`}>
                              {Math.round((grade.score/grade.maxScore)*100)}%
                            </span>
                          </div>
                        </td>
                        <td className="table-cell capitalize">{grade.type}</td>
                        <td className="table-cell">{new Date(grade.date).toLocaleDateString()}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('edit', grade)}
                              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                              aria-label="Edit grade"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Delete grade"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-2xl font-bold">Attendance</h2>
                <button
                  onClick={() => openModal('add')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Mark Attendance
                </button>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <label htmlFor="attendance-date" className="form-label mb-0">Date:</label>
                  <input
                    id="attendance-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Attendance Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Student</th>
                      <th className="table-header px-6 py-3">Status</th>
                      <th className="table-header px-6 py-3">Notes</th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredAttendance.map((record) => (
                      <tr key={record.id}>
                        <td className="table-cell font-medium">{getStudentName(record.studentId)}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            record.status === 'present' ? 'badge-success' :
                            record.status === 'late' ? 'badge-warning' :
                            record.status === 'excused' ? 'badge-info' : 'badge-error'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="table-cell">{record.notes || '-'}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('edit', record)}
                              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                              aria-label="Edit attendance"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAttendance(record.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Delete attendance"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-2xl font-bold">Assignments</h2>
                <button
                  onClick={() => openModal('add')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Assignment
                </button>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Assignments</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Assignments Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="card">
                    <div className="flex-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex-center">
                          <BookOpen className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{assignment.subject}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('edit', assignment)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          aria-label="Edit assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{assignment.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{assignment.type}</span>
                      </div>
                      <div className="flex-between">
                        <span>Due Date:</span>
                        <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex-between">
                        <span>Max Score:</span>
                        <span className="font-medium">{assignment.maxScore} points</span>
                      </div>
                      <div className="flex-between">
                        <span>Status:</span>
                        <span className={`badge ${
                          assignment.status === 'active' ? 'badge-info' :
                          assignment.status === 'completed' ? 'badge-success' : 'badge-error'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-2xl font-bold">Communication</h2>
                <button
                  onClick={() => openModal('add')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Communication
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Communications List */}
              <div className="space-y-4">
                {filteredCommunications.map((comm) => (
                  <div key={comm.id} className="card">
                    <div className="flex-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex-center ${
                          comm.type === 'email' ? 'bg-blue-100 dark:bg-blue-900' :
                          comm.type === 'phone' ? 'bg-green-100 dark:bg-green-900' :
                          comm.type === 'meeting' ? 'bg-purple-100 dark:bg-purple-900' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {comm.type === 'email' && <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                          {comm.type === 'phone' && <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />}
                          {comm.type === 'meeting' && <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                          {comm.type === 'note' && <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{comm.subject}</h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {getStudentName(comm.studentId)} • {new Date(comm.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          comm.priority === 'high' ? 'badge-error' :
                          comm.priority === 'medium' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {comm.priority}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('edit', comm)}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                            aria-label="Edit communication"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCommunication(comm.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Delete communication"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300">{comm.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Reports & Analytics</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Students</div>
                  <div className="stat-value">{students.length}</div>
                  <div className="stat-desc">Active students</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Total Grades</div>
                  <div className="stat-value">{grades.length}</div>
                  <div className="stat-desc">Recorded grades</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Average GPA</div>
                  <div className="stat-value">
                    {students.length > 0 ? Math.round(students.reduce((sum, student) => sum + calculateGPA(student.id), 0) / students.length) : 0}%
                  </div>
                  <div className="stat-desc">Class average</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Attendance Rate</div>
                  <div className="stat-value">
                    {students.length > 0 ? Math.round(students.reduce((sum, student) => sum + getAttendanceRate(student.id), 0) / students.length) : 0}%
                  </div>
                  <div className="stat-desc">Overall attendance</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grade Distribution */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip />
                      <Legend />
                      <Cell />
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Attendance Rates */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Student Attendance Rates</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="rate" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {grades.slice(-5).reverse().map((grade) => (
                    <div key={grade.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium">{getStudentName(grade.studentId)} - {grade.subject}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{grade.assignment}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{grade.score}/{grade.maxScore}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(grade.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">
                  {modalType === 'add' ? 'Add' : 'Edit'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                {/* Student Form */}
                {activeTab === 'students' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="firstName">First Name</label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          defaultValue={selectedItem?.firstName || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="lastName">Last Name</label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          defaultValue={selectedItem?.lastName || ''}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={selectedItem?.email || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={selectedItem?.phone || ''}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="dateOfBirth">Date of Birth</label>
                        <input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          defaultValue={selectedItem?.dateOfBirth || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="enrollmentDate">Enrollment Date</label>
                        <input
                          id="enrollmentDate"
                          name="enrollmentDate"
                          type="date"
                          defaultValue={selectedItem?.enrollmentDate || ''}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="guardianName">Guardian Name</label>
                        <input
                          id="guardianName"
                          name="guardianName"
                          type="text"
                          defaultValue={selectedItem?.guardianName || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="guardianPhone">Guardian Phone</label>
                        <input
                          id="guardianPhone"
                          name="guardianPhone"
                          type="tel"
                          defaultValue={selectedItem?.guardianPhone || ''}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="address">Address</label>
                      <textarea
                        id="address"
                        name="address"
                        defaultValue={selectedItem?.address || ''}
                        className="input"
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Grade Form */}
                {activeTab === 'grades' && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="studentId">Student</label>
                      <select
                        id="studentId"
                        name="studentId"
                        defaultValue={selectedItem?.studentId || ''}
                        className="input"
                        required
                      >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="subject">Subject</label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          defaultValue={selectedItem?.subject || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="assignment">Assignment</label>
                        <input
                          id="assignment"
                          name="assignment"
                          type="text"
                          defaultValue={selectedItem?.assignment || ''}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="score">Score</label>
                        <input
                          id="score"
                          name="score"
                          type="number"
                          min="0"
                          defaultValue={selectedItem?.score || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="maxScore">Max Score</label>
                        <input
                          id="maxScore"
                          name="maxScore"
                          type="number"
                          min="1"
                          defaultValue={selectedItem?.maxScore || '100'}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="type">Type</label>
                        <select
                          id="type"
                          name="type"
                          defaultValue={selectedItem?.type || 'assignment'}
                          className="input"
                          required
                        >
                          <option value="assignment">Assignment</option>
                          <option value="exam">Exam</option>
                          <option value="quiz">Quiz</option>
                          <option value="project">Project</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">Date</label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={selectedItem?.date || new Date().toISOString().split('T')[0]}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="comments">Comments</label>
                      <textarea
                        id="comments"
                        name="comments"
                        defaultValue={selectedItem?.comments || ''}
                        className="input"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Attendance Form */}
                {activeTab === 'attendance' && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="studentId">Student</label>
                      <select
                        id="studentId"
                        name="studentId"
                        defaultValue={selectedItem?.studentId || ''}
                        className="input"
                        required
                      >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="date">Date</label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          defaultValue={selectedItem?.date || selectedDate}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="status">Status</label>
                        <select
                          id="status"
                          name="status"
                          defaultValue={selectedItem?.status || 'present'}
                          className="input"
                          required
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="notes">Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        defaultValue={selectedItem?.notes || ''}
                        className="input"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Assignment Form */}
                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="title">Title</label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        defaultValue={selectedItem?.title || ''}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="subject">Subject</label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        defaultValue={selectedItem?.subject || ''}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        defaultValue={selectedItem?.description || ''}
                        className="input"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="assignedDate">Assigned Date</label>
                        <input
                          id="assignedDate"
                          name="assignedDate"
                          type="date"
                          defaultValue={selectedItem?.assignedDate || new Date().toISOString().split('T')[0]}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="dueDate">Due Date</label>
                        <input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          defaultValue={selectedItem?.dueDate || ''}
                          className="input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="maxScore">Max Score</label>
                        <input
                          id="maxScore"
                          name="maxScore"
                          type="number"
                          min="1"
                          defaultValue={selectedItem?.maxScore || '100'}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="type">Type</label>
                        <select
                          id="type"
                          name="type"
                          defaultValue={selectedItem?.type || 'homework'}
                          className="input"
                          required
                        >
                          <option value="homework">Homework</option>
                          <option value="project">Project</option>
                          <option value="exam">Exam</option>
                          <option value="quiz">Quiz</option>
                        </select>
                      </div>
                      {modalType === 'edit' && (
                        <div className="form-group">
                          <label className="form-label" htmlFor="status">Status</label>
                          <select
                            id="status"
                            name="status"
                            defaultValue={selectedItem?.status || 'active'}
                            className="input"
                            required
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Communication Form */}
                {activeTab === 'communication' && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="studentId">Student</label>
                      <select
                        id="studentId"
                        name="studentId"
                        defaultValue={selectedItem?.studentId || ''}
                        className="input"
                        required
                      >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="type">Type</label>
                        <select
                          id="type"
                          name="type"
                          defaultValue={selectedItem?.type || 'email'}
                          className="input"
                          required
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="meeting">Meeting</option>
                          <option value="note">Note</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="priority">Priority</label>
                        <select
                          id="priority"
                          name="priority"
                          defaultValue={selectedItem?.priority || 'medium'}
                          className="input"
                          required
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="date">Date</label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          defaultValue={selectedItem?.date || new Date().toISOString().split('T')[0]}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    {modalType === 'edit' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="status">Status</label>
                        <select
                          id="status"
                          name="status"
                          defaultValue={selectedItem?.status || 'sent'}
                          className="input"
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="sent">Sent</option>
                          <option value="read">Read</option>
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label" htmlFor="subject">Subject</label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        defaultValue={selectedItem?.subject || ''}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        defaultValue={selectedItem?.message || ''}
                        className="input"
                        rows={5}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalType === 'add' ? 'Add' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-8">
          <div className="container-fluid text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;