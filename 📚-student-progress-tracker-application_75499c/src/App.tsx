import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { Camera } from 'react-camera-pro';
import {
  Search,
  Plus,
  UserPlus,
  X,
  Edit,
  Trash2,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Users,
  GraduationCap,
  Upload,
  Download,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Pencil,
  Eye,
  Moon,
  Sun,
  CirclePlus,
  CircleMinus
} from 'lucide-react';
import styles from './styles/styles.module.css';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Types and Interfaces
type StudentID = string;
type GradeID = string;
type AttendanceID = string;
type AssignmentID = string;

type AttendanceStatus = 'present' | 'absent' | 'late';

interface Student {
  id: StudentID;
  name: string;
  email: string;
  phone: string;
  address: string;
  photo?: string;
  grade: string;
  enrollmentDate: string;
}

interface Grade {
  id: GradeID;
  studentId: StudentID;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
  term: string;
}

interface Attendance {
  id: AttendanceID;
  studentId: StudentID;
  date: string;
  status: AttendanceStatus;
  comment?: string;
}

interface Assignment {
  id: AssignmentID;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  maxScore: number;
}

interface StudentAssignment {
  studentId: StudentID;
  assignmentId: AssignmentID;
  status: 'completed' | 'pending' | 'overdue';
  submissionDate?: string;
  score?: number;
  feedback?: string;
}

interface ImportData {
  students?: Student[];
  grades?: Grade[];
  attendances?: Attendance[];
  assignments?: Assignment[];
  studentAssignments?: StudentAssignment[];
}

const App = () => {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>([]);
  
  const [activeTab, setActiveTab] = useState<'students' | 'grades' | 'attendance' | 'assignments'>('students');
  const [selectedStudent, setSelectedStudent] = useState<StudentID | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importType, setImportType] = useState<string>('students');
  const [importData, setImportData] = useState<string>('');
  
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Camera ref
  const cameraRef = useRef<any>(null);
  
  // Current form data states
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
  const [currentGrade, setCurrentGrade] = useState<Partial<Grade>>({});
  const [currentAttendance, setCurrentAttendance] = useState<Partial<Attendance>>({});
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  const [currentStudentAssignment, setCurrentStudentAssignment] = useState<Partial<StudentAssignment>>({});
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    const storedGrades = localStorage.getItem('grades');
    const storedAttendances = localStorage.getItem('attendances');
    const storedAssignments = localStorage.getItem('assignments');
    const storedStudentAssignments = localStorage.getItem('studentAssignments');
    const storedDarkMode = localStorage.getItem('darkMode');
    
    if (storedStudents) setStudents(JSON.parse(storedStudents));
    if (storedGrades) setGrades(JSON.parse(storedGrades));
    if (storedAttendances) setAttendances(JSON.parse(storedAttendances));
    if (storedAssignments) setAssignments(JSON.parse(storedAssignments));
    if (storedStudentAssignments) setStudentAssignments(JSON.parse(storedStudentAssignments));
    if (storedDarkMode) setDarkMode(storedDarkMode === 'true');
    
    // If no data, add sample data
    if (!storedStudents) {
      const sampleStudents: Student[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          address: '123 Main St, Anytown, USA',
          grade: '10',
          enrollmentDate: '2023-09-01'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '234-567-8901',
          address: '456 Oak Ave, Somecity, USA',
          grade: '11',
          enrollmentDate: '2022-09-01'
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('students', JSON.stringify(sampleStudents));
    }
    
    if (!storedGrades) {
      const sampleGrades: Grade[] = [
        {
          id: '1',
          studentId: '1',
          subject: 'Math',
          score: 85,
          maxScore: 100,
          date: '2023-10-15',
          term: 'Fall 2023'
        },
        {
          id: '2',
          studentId: '1',
          subject: 'Science',
          score: 92,
          maxScore: 100,
          date: '2023-10-18',
          term: 'Fall 2023'
        },
        {
          id: '3',
          studentId: '2',
          subject: 'Math',
          score: 78,
          maxScore: 100,
          date: '2023-10-15',
          term: 'Fall 2023'
        }
      ];
      setGrades(sampleGrades);
      localStorage.setItem('grades', JSON.stringify(sampleGrades));
    }
    
    if (!storedAttendances) {
      const sampleAttendances: Attendance[] = [
        {
          id: '1',
          studentId: '1',
          date: '2023-10-20',
          status: 'present'
        },
        {
          id: '2',
          studentId: '1',
          date: '2023-10-21',
          status: 'late',
          comment: 'Bus was late'
        },
        {
          id: '3',
          studentId: '2',
          date: '2023-10-20',
          status: 'present'
        },
        {
          id: '4',
          studentId: '2',
          date: '2023-10-21',
          status: 'absent',
          comment: 'Sick'
        }
      ];
      setAttendances(sampleAttendances);
      localStorage.setItem('attendances', JSON.stringify(sampleAttendances));
    }
    
    if (!storedAssignments) {
      const sampleAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Math Homework',
          description: 'Complete problems 1-20 on page 45',
          dueDate: '2023-10-25',
          subject: 'Math',
          maxScore: 20
        },
        {
          id: '2',
          title: 'Science Lab Report',
          description: 'Write a lab report on the photosynthesis experiment',
          dueDate: '2023-10-30',
          subject: 'Science',
          maxScore: 50
        }
      ];
      setAssignments(sampleAssignments);
      localStorage.setItem('assignments', JSON.stringify(sampleAssignments));
    }
    
    if (!storedStudentAssignments) {
      const sampleStudentAssignments: StudentAssignment[] = [
        {
          studentId: '1',
          assignmentId: '1',
          status: 'completed',
          submissionDate: '2023-10-24',
          score: 18
        },
        {
          studentId: '1',
          assignmentId: '2',
          status: 'pending'
        },
        {
          studentId: '2',
          assignmentId: '1',
          status: 'completed',
          submissionDate: '2023-10-23',
          score: 15
        }
      ];
      setStudentAssignments(sampleStudentAssignments);
      localStorage.setItem('studentAssignments', JSON.stringify(sampleStudentAssignments));
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);
  
  useEffect(() => {
    localStorage.setItem('attendances', JSON.stringify(attendances));
  }, [attendances]);
  
  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);
  
  useEffect(() => {
    localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));
  }, [studentAssignments]);
  
  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  // Modal key handler for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setShowEditForm(false);
        setShowDetailsModal(false);
        setShowCamera(false);
        setShowImportModal(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Helper function to generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Filtered students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get student by ID
  const getStudentById = (id: StudentID): Student | undefined => {
    return students.find(student => student.id === id);
  };
  
  // Get student name by ID
  const getStudentName = (id: StudentID): string => {
    const student = getStudentById(id);
    return student ? student.name : 'Unknown Student';
  };
  
  // Get assignment by ID
  const getAssignmentById = (id: AssignmentID): Assignment | undefined => {
    return assignments.find(assignment => assignment.id === id);
  };
  
  // Get assignment title by ID
  const getAssignmentTitle = (id: AssignmentID): string => {
    const assignment = getAssignmentById(id);
    return assignment ? assignment.title : 'Unknown Assignment';
  };
  
  // Get student assignments
  const getStudentAssignments = (studentId: StudentID): StudentAssignment[] => {
    return studentAssignments.filter(sa => sa.studentId === studentId);
  };
  
  // Get attendance records for a student
  const getStudentAttendance = (studentId: StudentID): Attendance[] => {
    return attendances.filter(attendance => attendance.studentId === studentId);
  };
  
  // Get grades for a student
  const getStudentGrades = (studentId: StudentID): Grade[] => {
    return grades.filter(grade => grade.studentId === studentId);
  };
  
  // Calculate average grade for a student
  const calculateAverageGrade = (studentId: StudentID): number => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;
    
    const totalPercentage = studentGrades.reduce((sum, grade) => {
      return sum + (grade.score / grade.maxScore * 100);
    }, 0);
    
    return Math.round(totalPercentage / studentGrades.length);
  };
  
  // Calculate attendance percentage for a student
  const calculateAttendancePercentage = (studentId: StudentID): number => {
    const studentAttendance = getStudentAttendance(studentId);
    if (studentAttendance.length === 0) return 0;
    
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  };
  
  // Calculate assignment completion percentage for a student
  const calculateAssignmentCompletion = (studentId: StudentID): number => {
    const studentAssignmentList = getStudentAssignments(studentId);
    if (studentAssignmentList.length === 0) return 0;
    
    const completedCount = studentAssignmentList.filter(a => a.status === 'completed').length;
    return Math.round((completedCount / studentAssignmentList.length) * 100);
  };
  
  // Student CRUD operations
  const addStudent = () => {
    if (!currentStudent.name || !currentStudent.email) return;
    
    const newStudent: Student = {
      id: generateId(),
      name: currentStudent.name || '',
      email: currentStudent.email || '',
      phone: currentStudent.phone || '',
      address: currentStudent.address || '',
      photo: currentStudent.photo,
      grade: currentStudent.grade || '',
      enrollmentDate: currentStudent.enrollmentDate || format(new Date(), 'yyyy-MM-dd')
    };
    
    setStudents([...students, newStudent]);
    setCurrentStudent({});
    setShowAddForm(false);
  };
  
  const updateStudent = () => {
    if (!currentStudent.id || !currentStudent.name || !currentStudent.email) return;
    
    const updatedStudents = students.map(student =>
      student.id === currentStudent.id
        ? { ...student, ...currentStudent as Student }
        : student
    );
    
    setStudents(updatedStudents);
    setCurrentStudent({});
    setShowEditForm(false);
  };
  
  const deleteStudent = (id: StudentID) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    // Remove student and all related data
    setStudents(students.filter(student => student.id !== id));
    setGrades(grades.filter(grade => grade.studentId !== id));
    setAttendances(attendances.filter(attendance => attendance.studentId !== id));
    setStudentAssignments(studentAssignments.filter(sa => sa.studentId !== id));
    
    if (selectedStudent === id) {
      setSelectedStudent(null);
    }
  };
  
  // Grade CRUD operations
  const addGrade = () => {
    if (!currentGrade.studentId || !currentGrade.subject || currentGrade.score === undefined) return;
    
    const newGrade: Grade = {
      id: generateId(),
      studentId: currentGrade.studentId,
      subject: currentGrade.subject,
      score: currentGrade.score,
      maxScore: currentGrade.maxScore || 100,
      date: currentGrade.date || format(new Date(), 'yyyy-MM-dd'),
      term: currentGrade.term || 'Current Term'
    };
    
    setGrades([...grades, newGrade]);
    setCurrentGrade({});
    setShowAddForm(false);
  };
  
  const updateGrade = () => {
    if (!currentGrade.id || !currentGrade.subject || currentGrade.score === undefined) return;
    
    const updatedGrades = grades.map(grade =>
      grade.id === currentGrade.id
        ? { ...grade, ...currentGrade as Grade }
        : grade
    );
    
    setGrades(updatedGrades);
    setCurrentGrade({});
    setShowEditForm(false);
  };
  
  const deleteGrade = (id: GradeID) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) return;
    setGrades(grades.filter(grade => grade.id !== id));
  };
  
  // Attendance CRUD operations
  const addAttendance = () => {
    if (!currentAttendance.studentId || !currentAttendance.date || !currentAttendance.status) return;
    
    // Check if attendance for this student and date already exists
    const existingAttendance = attendances.find(
      a => a.studentId === currentAttendance.studentId && a.date === currentAttendance.date
    );
    
    if (existingAttendance) {
      // Update existing attendance
      const updatedAttendances = attendances.map(a =>
        a.id === existingAttendance.id
          ? { ...a, status: currentAttendance.status as AttendanceStatus, comment: currentAttendance.comment }
          : a
      );
      setAttendances(updatedAttendances);
    } else {
      // Add new attendance
      const newAttendance: Attendance = {
        id: generateId(),
        studentId: currentAttendance.studentId,
        date: currentAttendance.date,
        status: currentAttendance.status as AttendanceStatus,
        comment: currentAttendance.comment
      };
      setAttendances([...attendances, newAttendance]);
    }
    
    setCurrentAttendance({});
    setShowAddForm(false);
  };
  
  const updateAttendance = () => {
    if (!currentAttendance.id || !currentAttendance.status) return;
    
    const updatedAttendances = attendances.map(attendance =>
      attendance.id === currentAttendance.id
        ? { ...attendance, ...currentAttendance as Attendance }
        : attendance
    );
    
    setAttendances(updatedAttendances);
    setCurrentAttendance({});
    setShowEditForm(false);
  };
  
  const deleteAttendance = (id: AttendanceID) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    setAttendances(attendances.filter(attendance => attendance.id !== id));
  };
  
  // Assignment CRUD operations
  const addAssignment = () => {
    if (!currentAssignment.title || !currentAssignment.dueDate || !currentAssignment.subject) return;
    
    const newAssignment: Assignment = {
      id: generateId(),
      title: currentAssignment.title,
      description: currentAssignment.description || '',
      dueDate: currentAssignment.dueDate,
      subject: currentAssignment.subject,
      maxScore: currentAssignment.maxScore || 100
    };
    
    setAssignments([...assignments, newAssignment]);
    setCurrentAssignment({});
    setShowAddForm(false);
  };
  
  const updateAssignment = () => {
    if (!currentAssignment.id || !currentAssignment.title || !currentAssignment.dueDate) return;
    
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === currentAssignment.id
        ? { ...assignment, ...currentAssignment as Assignment }
        : assignment
    );
    
    setAssignments(updatedAssignments);
    setCurrentAssignment({});
    setShowEditForm(false);
  };
  
  const deleteAssignment = (id: AssignmentID) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    setAssignments(assignments.filter(assignment => assignment.id !== id));
    setStudentAssignments(studentAssignments.filter(sa => sa.assignmentId !== id));
  };
  
  // Student Assignment CRUD operations
  const addOrUpdateStudentAssignment = (studentId: StudentID, assignmentId: AssignmentID, status: 'completed' | 'pending' | 'overdue', score?: number) => {
    const existingEntry = studentAssignments.find(
      sa => sa.studentId === studentId && sa.assignmentId === assignmentId
    );
    
    if (existingEntry) {
      // Update existing entry
      const updatedEntries = studentAssignments.map(sa =>
        sa.studentId === studentId && sa.assignmentId === assignmentId
          ? {
              ...sa,
              status,
              score: status === 'completed' ? score : undefined,
              submissionDate: status === 'completed' ? format(new Date(), 'yyyy-MM-dd') : undefined
            }
          : sa
      );
      setStudentAssignments(updatedEntries);
    } else {
      // Add new entry
      const newEntry: StudentAssignment = {
        studentId,
        assignmentId,
        status,
        submissionDate: status === 'completed' ? format(new Date(), 'yyyy-MM-dd') : undefined,
        score: status === 'completed' ? score : undefined
      };
      setStudentAssignments([...studentAssignments, newEntry]);
    }
  };
  
  // Import/Export functions
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        if (typeof binaryStr !== 'string') return;
        
        // For CSV, just show the text content
        if (file.name.endsWith('.csv')) {
          setImportData(binaryStr);
          return;
        }
        
        // For Excel files
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          setImportData(JSON.stringify(data, null, 2));
          return;
        }
        
        // For JSON files
        if (file.name.endsWith('.json')) {
          setImportData(binaryStr);
          return;
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsBinaryString(file);
  };
  
  const importDataFromText = () => {
    try {
      const parsedData: ImportData = JSON.parse(importData);
      
      if (importType === 'students' && parsedData.students) {
        // Add IDs if missing
        const newStudents = parsedData.students.map(student => ({
          ...student,
          id: student.id || generateId()
        }));
        setStudents(prevStudents => [...prevStudents, ...newStudents]);
      }
      
      if (importType === 'grades' && parsedData.grades) {
        const newGrades = parsedData.grades.map(grade => ({
          ...grade,
          id: grade.id || generateId()
        }));
        setGrades(prevGrades => [...prevGrades, ...newGrades]);
      }
      
      if (importType === 'attendance' && parsedData.attendances) {
        const newAttendances = parsedData.attendances.map(attendance => ({
          ...attendance,
          id: attendance.id || generateId()
        }));
        setAttendances(prevAttendances => [...prevAttendances, ...newAttendances]);
      }
      
      if (importType === 'assignments' && parsedData.assignments) {
        const newAssignments = parsedData.assignments.map(assignment => ({
          ...assignment,
          id: assignment.id || generateId()
        }));
        setAssignments(prevAssignments => [...prevAssignments, ...newAssignments]);
      }
      
      if (importType === 'studentAssignments' && parsedData.studentAssignments) {
        setStudentAssignments(prevStudentAssignments => [
          ...prevStudentAssignments,
          ...parsedData.studentAssignments
        ]);
      }
      
      setShowImportModal(false);
      setImportData('');
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please check the format.');
    }
  };
  
  const exportTemplate = () => {
    let template: any = {};
    
    if (importType === 'students') {
      template = {
        students: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            address: '123 Main St',
            grade: '10',
            enrollmentDate: '2023-09-01'
          }
        ]
      };
    } else if (importType === 'grades') {
      template = {
        grades: [
          {
            studentId: '1',
            subject: 'Math',
            score: 85,
            maxScore: 100,
            date: '2023-10-15',
            term: 'Fall 2023'
          }
        ]
      };
    } else if (importType === 'attendance') {
      template = {
        attendances: [
          {
            studentId: '1',
            date: '2023-10-20',
            status: 'present',
            comment: 'Optional comment'
          }
        ]
      };
    } else if (importType === 'assignments') {
      template = {
        assignments: [
          {
            title: 'Math Homework',
            description: 'Complete problems 1-20',
            dueDate: '2023-10-25',
            subject: 'Math',
            maxScore: 100
          }
        ]
      };
    } else if (importType === 'studentAssignments') {
      template = {
        studentAssignments: [
          {
            studentId: '1',
            assignmentId: '1',
            status: 'completed',
            submissionDate: '2023-10-24',
            score: 90
          }
        ]
      };
    }
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Render helper components
  const renderStudentList = () => (
    <div className="card">
      <div className="flex-between mb-4">
        <h2 className="text-xl font-semibold">Students</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-primary flex items-center gap-1"
            onClick={() => {
              setCurrentStudent({});
              setShowAddForm(true);
            }}
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
          <button
            className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
            onClick={() => {
              setImportType('students');
              setShowImportModal(true);
            }}
          >
            <Upload size={16} />
            <span>Import</span>
          </button>
        </div>
      </div>
      
      <div className="relative mb-4">
        <input
          type="text"
          className="input pl-10"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No students found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div 
              key={student.id}
              className={`card-sm relative border border-gray-200 dark:border-gray-700 ${selectedStudent === student.id ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-slate-700' : 'bg-white dark:bg-slate-800'}`}
              onClick={() => setSelectedStudent(student.id)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex-center w-full h-full text-gray-500 dark:text-gray-400">
                      <Users size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Grade: {student.grade}</p>
                </div>
              </div>
              
              <div className="flex gap-1 absolute top-2 right-2">
                <button
                  className="p-1 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStudent(student);
                    setShowEditForm(true);
                  }}
                >
                  <Edit size={14} />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStudent(student.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold">{calculateAverageGrade(student.id)}%</div>
                  <div className="text-gray-500 dark:text-gray-400">Avg. Grade</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{calculateAttendancePercentage(student.id)}%</div>
                  <div className="text-gray-500 dark:text-gray-400">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{calculateAssignmentCompletion(student.id)}%</div>
                  <div className="text-gray-500 dark:text-gray-400">Assignments</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderStudentDetail = () => {
    if (!selectedStudent) return null;
    
    const student = getStudentById(selectedStudent);
    if (!student) return null;
    
    const studentGrades = getStudentGrades(selectedStudent);
    const studentAttendance = getStudentAttendance(selectedStudent);
    const studentAssignmentList = getStudentAssignments(selectedStudent);
    
    const gradeData = studentGrades.map(grade => ({
      subject: grade.subject,
      score: (grade.score / grade.maxScore) * 100
    }));
    
    const attendanceData = [
      { name: 'Present', value: studentAttendance.filter(a => a.status === 'present').length },
      { name: 'Absent', value: studentAttendance.filter(a => a.status === 'absent').length },
      { name: 'Late', value: studentAttendance.filter(a => a.status === 'late').length }
    ].filter(item => item.value > 0);
    
    const assignmentData = [
      { name: 'Completed', value: studentAssignmentList.filter(a => a.status === 'completed').length },
      { name: 'Pending', value: studentAssignmentList.filter(a => a.status === 'pending').length },
      { name: 'Overdue', value: studentAssignmentList.filter(a => a.status === 'overdue').length }
    ].filter(item => item.value > 0);
    
    const COLORS = ['#4ade80', '#f87171', '#facc15', '#60a5fa'];
    
    return (
      <div className="card">
        <div className="flex-between mb-6">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <button
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
            onClick={() => setSelectedStudent(null)}
          >
            <ArrowLeft size={16} />
            <span>Back to List</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="card-sm bg-gray-50 dark:bg-slate-700">
              <div className="flex-center flex-col">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-4">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex-center w-full h-full text-gray-500 dark:text-gray-400">
                      <Users size={48} />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-center">{student.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">Grade {student.grade}</p>
                
                <button
                  className="mt-4 btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 flex items-center gap-1"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera size={14} />
                  <span>Update Photo</span>
                </button>
              </div>
              
              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{student.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium">{student.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment Date</p>
                  <p className="font-medium">{student.enrollmentDate}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-6">
            {/* Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="stat-title">Average Grade</div>
                <div className="stat-value">{calculateAverageGrade(student.id)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Attendance Rate</div>
                <div className="stat-value">{calculateAttendancePercentage(student.id)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Assignment Completion</div>
                <div className="stat-value">{calculateAssignmentCompletion(student.id)}%</div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card-sm">
                <h3 className="text-sm font-medium mb-3">Grade Distribution</h3>
                {gradeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gradeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                      <Bar dataKey="score" fill="#4f46e5">
                        {gradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score >= 60 ? '#4ade80' : '#f87171'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-[200px] text-gray-500 dark:text-gray-400">
                    No grade data available
                  </div>
                )}
              </div>
              
              <div className="card-sm">
                <h3 className="text-sm font-medium mb-3">Attendance</h3>
                {attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Days']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-[200px] text-gray-500 dark:text-gray-400">
                    No attendance data available
                  </div>
                )}
              </div>
              
              <div className="card-sm">
                <h3 className="text-sm font-medium mb-3">Assignments</h3>
                {assignmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={assignmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {assignmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Assignments']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-[200px] text-gray-500 dark:text-gray-400">
                    No assignment data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderGradesTab = () => {
    const filteredGrades = selectedStudent
      ? grades.filter(grade => grade.studentId === selectedStudent)
      : grades;
    
    return (
      <div className="card">
        <div className="flex-between mb-4">
          <h2 className="text-xl font-semibold">Grades</h2>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex items-center gap-1"
              onClick={() => {
                setCurrentGrade({ studentId: selectedStudent || '' });
                setShowAddForm(true);
              }}
            >
              <Plus size={16} />
              <span>Add Grade</span>
            </button>
            <button
              className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
              onClick={() => {
                setImportType('grades');
                setShowImportModal(true);
              }}
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
          </div>
        </div>
        
        {filteredGrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No grades available.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {!selectedStudent && <th className="table-header">Student</th>}
                  <th className="table-header">Subject</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Term</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredGrades.map(grade => (
                  <tr key={grade.id}>
                    {!selectedStudent && (
                      <td className="table-cell">{getStudentName(grade.studentId)}</td>
                    )}
                    <td className="table-cell">{grade.subject}</td>
                    <td className="table-cell">
                      <span className={`font-medium ${grade.score / grade.maxScore >= 0.6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {grade.score} / {grade.maxScore} ({Math.round(grade.score / grade.maxScore * 100)}%)
                      </span>
                    </td>
                    <td className="table-cell">{grade.date}</td>
                    <td className="table-cell">{grade.term}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => {
                            setCurrentGrade(grade);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => deleteGrade(grade.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  const renderAttendanceTab = () => {
    // Filter attendances by selected student if one is selected
    const filteredAttendances = selectedStudent
      ? attendances.filter(attendance => attendance.studentId === selectedStudent)
      : attendances.filter(attendance => attendance.date === selectedDate);
    
    // Group attendances by date if a student is selected
    const attendanceByDate = selectedStudent
      ? filteredAttendances.reduce<Record<string, Attendance[]>>((acc, attendance) => {
          const date = attendance.date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(attendance);
          return acc;
        }, {})
      : {};
    
    // Sort dates in descending order
    const sortedDates = Object.keys(attendanceByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const renderAttendanceList = () => {
      if (selectedStudent) {
        // Attendance history view for a single student
        return (
          <div className="space-y-4">
            {sortedDates.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No attendance records available for this student.
              </div>
            ) : (
              sortedDates.map(date => (
                <div key={date} className="card-sm bg-white dark:bg-slate-800">
                  <div className="flex-between mb-2">
                    <h3 className="font-medium">{format(new Date(date), 'MMMM d, yyyy')}</h3>
                    {attendanceByDate[date][0] && (
                      <div className={`badge ${attendanceByDate[date][0].status === 'present' ? 'badge-success' : attendanceByDate[date][0].status === 'late' ? 'badge-warning' : 'badge-error'}`}>
                        {attendanceByDate[date][0].status.charAt(0).toUpperCase() + attendanceByDate[date][0].status.slice(1)}
                      </div>
                    )}
                  </div>
                  {attendanceByDate[date][0]?.comment && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Note: {attendanceByDate[date][0].comment}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => {
                        setCurrentAttendance(attendanceByDate[date][0]);
                        setShowEditForm(true);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => deleteAttendance(attendanceByDate[date][0].id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      }
      
      // Daily attendance view for all students
      const studentsWithAttendance = students.map(student => {
        const attendance = filteredAttendances.find(a => a.studentId === student.id);
        return {
          student,
          attendance
        };
      });
      
      return (
        <div className="space-y-4">
          <div className="flex-between mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="attendance-date" className="font-medium text-gray-700 dark:text-gray-300">
                Date:
              </label>
              <input
                id="attendance-date"
                type="date"
                className="input-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  const previousDay = new Date(selectedDate);
                  previousDay.setDate(previousDay.getDate() - 1);
                  setSelectedDate(format(previousDay, 'yyyy-MM-dd'));
                }}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  const nextDay = new Date(selectedDate);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setSelectedDate(format(nextDay, 'yyyy-MM-dd'));
                }}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          {studentsWithAttendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No students available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentsWithAttendance.map(({ student, attendance }) => (
                <div key={student.id} className="card-sm bg-white dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-center">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users size={16} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Grade {student.grade}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div className="flex gap-3">
                      <button
                        className={`flex-1 btn btn-sm ${attendance?.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                        onClick={() => {
                          addOrUpdateAttendance(student.id, 'present');
                        }}
                      >
                        <Check size={16} className="mr-1" />
                        Present
                      </button>
                      <button
                        className={`flex-1 btn btn-sm ${attendance?.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                        onClick={() => {
                          addOrUpdateAttendance(student.id, 'absent');
                        }}
                      >
                        <X size={16} className="mr-1" />
                        Absent
                      </button>
                      <button
                        className={`flex-1 btn btn-sm ${attendance?.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                        onClick={() => {
                          addOrUpdateAttendance(student.id, 'late');
                        }}
                      >
                        <Clock size={16} className="mr-1" />
                        Late
                      </button>
                    </div>
                    
                    {attendance && (
                      <div className="mt-2 flex justify-end">
                        <button
                          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => {
                            setCurrentAttendance({
                              ...attendance,
                              comment: prompt('Enter comment:', attendance.comment) || undefined
                            });
                            updateAttendance();
                          }}
                        >
                          {attendance.comment ? 'Edit Note' : 'Add Note'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };
    
    const addOrUpdateAttendance = (studentId: StudentID, status: AttendanceStatus) => {
      const existingAttendance = attendances.find(
        a => a.studentId === studentId && a.date === selectedDate
      );
      
      if (existingAttendance) {
        // Update existing attendance
        const updatedAttendances = attendances.map(a =>
          a.id === existingAttendance.id
            ? { ...a, status, comment: a.comment }
            : a
        );
        setAttendances(updatedAttendances);
      } else {
        // Add new attendance
        const newAttendance: Attendance = {
          id: generateId(),
          studentId,
          date: selectedDate,
          status,
          comment: undefined
        };
        setAttendances([...attendances, newAttendance]);
      }
    };
    
    return (
      <div className="card">
        <div className="flex-between mb-4">
          <h2 className="text-xl font-semibold">Attendance</h2>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex items-center gap-1"
              onClick={() => {
                setCurrentAttendance({
                  studentId: selectedStudent || '',
                  date: selectedDate,
                  status: 'present'
                });
                setShowAddForm(true);
              }}
            >
              <Plus size={16} />
              <span>Add Record</span>
            </button>
            <button
              className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
              onClick={() => {
                setImportType('attendance');
                setShowImportModal(true);
              }}
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
          </div>
        </div>
        
        {renderAttendanceList()}
      </div>
    );
  };
  
  const renderAssignmentsTab = () => {
    // Filter assignments by selected student if one is selected
    const filteredAssignments = selectedStudent
      ? studentAssignments
          .filter(sa => sa.studentId === selectedStudent)
          .map(sa => ({
            ...getAssignmentById(sa.assignmentId),
            status: sa.status,
            score: sa.score,
            submissionDate: sa.submissionDate
          }))
          .filter(a => a) as (Assignment & { status: string; score?: number; submissionDate?: string })[]
      : assignments;
    
    const renderAssignmentList = () => {
      if (selectedStudent) {
        // Student assignments view
        return (
          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No assignments available for this student.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssignments.map(assignment => {
                  const isOverdue = assignment.status === 'pending' && new Date(assignment.dueDate) < new Date();
                  const statusColor = assignment.status === 'completed' ? 'green' : (isOverdue ? 'red' : 'yellow');
                  const statusText = assignment.status === 'completed' ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending');
                  
                  return (
                    <div key={assignment.id} className="card-sm bg-white dark:bg-slate-800">
                      <div className="flex-between mb-2">
                        <span className={`badge badge-${statusColor === 'green' ? 'success' : statusColor === 'red' ? 'error' : 'warning'}`}>
                          {statusText}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-lg">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{assignment.subject}</p>
                      
                      {assignment.description && (
                        <p className="text-sm mt-2">{assignment.description}</p>
                      )}
                      
                      {assignment.status === 'completed' && assignment.score !== undefined && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Score:</span>
                            <span className={`font-medium ${assignment.score / assignment.maxScore >= 0.6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {assignment.score} / {assignment.maxScore} ({Math.round(assignment.score / assignment.maxScore * 100)}%)
                            </span>
                          </div>
                          {assignment.submissionDate && (
                            <div className="flex-between mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Submitted:</span>
                              <span className="text-sm">{format(new Date(assignment.submissionDate), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex-end gap-2">
                          {assignment.status !== 'completed' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                const score = assignment.status === 'completed' 
                                  ? assignment.score 
                                  : prompt('Enter score (out of ' + assignment.maxScore + '):')
                                    ? parseInt(prompt('Enter score (out of ' + assignment.maxScore + '):') || '0')
                                    : undefined;
                                
                                addOrUpdateStudentAssignment(
                                  selectedStudent,
                                  assignment.id,
                                  'completed',
                                  score
                                );
                              }}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Mark Complete
                            </button>
                          )}
                          
                          {assignment.status === 'completed' && (
                            <button
                              className="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600"
                              onClick={() => {
                                addOrUpdateStudentAssignment(
                                  selectedStudent,
                                  assignment.id,
                                  'pending'
                                );
                              }}
                            >
                              <XCircle size={16} className="mr-1" />
                              Mark Incomplete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium mb-4">Available Assignments</h3>
              
              {assignments.filter(a => !filteredAssignments.some(fa => fa.id === a.id)).length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No additional assignments available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments
                    .filter(a => !filteredAssignments.some(fa => fa.id === a.id))
                    .map(assignment => (
                      <div key={assignment.id} className="card-sm bg-gray-50 dark:bg-slate-700">
                        <div className="flex-between mb-2">
                          <span className="text-sm font-medium">{assignment.subject}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <h3 className="font-medium">{assignment.title}</h3>
                        
                        {assignment.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{assignment.description}</p>
                        )}
                        
                        <div className="mt-3 flex justify-end">
                          <button
                            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => {
                              addOrUpdateStudentAssignment(
                                selectedStudent,
                                assignment.id,
                                'pending'
                              );
                            }}
                          >
                            <Plus size={16} className="mr-1" />
                            Assign to Student
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // All assignments view
      return (
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No assignments available.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Title</th>
                    <th className="table-header">Subject</th>
                    <th className="table-header">Due Date</th>
                    <th className="table-header">Max Score</th>
                    <th className="table-header">Completion</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {(filteredAssignments as Assignment[]).map(assignment => {
                    const studentCount = students.length;
                    const completedCount = studentAssignments.filter(
                      sa => sa.assignmentId === assignment.id && sa.status === 'completed'
                    ).length;
                    const pendingCount = studentAssignments.filter(
                      sa => sa.assignmentId === assignment.id && sa.status === 'pending'
                    ).length;
                    const assignedCount = completedCount + pendingCount;
                    
                    return (
                      <tr key={assignment.id}>
                        <td className="table-cell font-medium">{assignment.title}</td>
                        <td className="table-cell">{assignment.subject}</td>
                        <td className="table-cell">
                          {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                          {new Date(assignment.dueDate) < new Date() && (
                            <span className="ml-2 badge badge-error">Overdue</span>
                          )}
                        </td>
                        <td className="table-cell">{assignment.maxScore}</td>
                        <td className="table-cell">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {completedCount}/{assignedCount} completed
                            </span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                              <div 
                                className="bg-primary-500 h-2 rounded-full" 
                                style={{ width: assignedCount > 0 ? `${(completedCount / assignedCount) * 100}%` : '0%' }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => {
                                setCurrentAssignment(assignment);
                                setShowEditForm(true);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => setShowDetailsModal(true)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => deleteAssignment(assignment.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <div className="card">
        <div className="flex-between mb-4">
          <h2 className="text-xl font-semibold">Assignments</h2>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex items-center gap-1"
              onClick={() => {
                setCurrentAssignment({});
                setShowAddForm(true);
              }}
            >
              <Plus size={16} />
              <span>Add Assignment</span>
            </button>
            <button
              className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
              onClick={() => {
                setImportType('assignments');
                setShowImportModal(true);
              }}
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
          </div>
        </div>
        
        {renderAssignmentList()}
      </div>
    );
  };
  
  // Form modals
  const renderAddStudentForm = () => (
    <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Add New Student</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowAddForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); addStudent(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="student-name">Name*</label>
            <input
              id="student-name"
              type="text"
              className="input"
              value={currentStudent.name || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="student-email">Email*</label>
            <input
              id="student-email"
              type="email"
              className="input"
              value={currentStudent.email || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="student-phone">Phone</label>
            <input
              id="student-phone"
              type="tel"
              className="input"
              value={currentStudent.phone || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, phone: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="student-address">Address</label>
            <input
              id="student-address"
              type="text"
              className="input"
              value={currentStudent.address || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, address: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="student-grade">Grade</label>
            <input
              id="student-grade"
              type="text"
              className="input"
              value={currentStudent.grade || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, grade: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="student-enrollment">Enrollment Date</label>
            <input
              id="student-enrollment"
              type="date"
              className="input"
              value={currentStudent.enrollmentDate || format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setCurrentStudent({ ...currentStudent, enrollmentDate: e.target.value })}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Student</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderEditStudentForm = () => (
    <div className="modal-backdrop" onClick={() => setShowEditForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Edit Student</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowEditForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); updateStudent(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-name">Name*</label>
            <input
              id="edit-student-name"
              type="text"
              className="input"
              value={currentStudent.name || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-email">Email*</label>
            <input
              id="edit-student-email"
              type="email"
              className="input"
              value={currentStudent.email || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-phone">Phone</label>
            <input
              id="edit-student-phone"
              type="tel"
              className="input"
              value={currentStudent.phone || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, phone: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-address">Address</label>
            <input
              id="edit-student-address"
              type="text"
              className="input"
              value={currentStudent.address || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, address: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-grade">Grade</label>
            <input
              id="edit-student-grade"
              type="text"
              className="input"
              value={currentStudent.grade || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, grade: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-enrollment">Enrollment Date</label>
            <input
              id="edit-student-enrollment"
              type="date"
              className="input"
              value={currentStudent.enrollmentDate || ''}
              onChange={(e) => setCurrentStudent({ ...currentStudent, enrollmentDate: e.target.value })}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowEditForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Student</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderAddGradeForm = () => (
    <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Add New Grade</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowAddForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); addGrade(); }} className="space-y-4">
          {!selectedStudent && (
            <div className="form-group">
              <label className="form-label" htmlFor="grade-student">Student*</label>
              <select
                id="grade-student"
                className="input"
                value={currentGrade.studentId || ''}
                onChange={(e) => setCurrentGrade({ ...currentGrade, studentId: e.target.value })}
                required
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="grade-subject">Subject*</label>
            <input
              id="grade-subject"
              type="text"
              className="input"
              value={currentGrade.subject || ''}
              onChange={(e) => setCurrentGrade({ ...currentGrade, subject: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="grade-score">Score*</label>
              <input
                id="grade-score"
                type="number"
                min="0"
                className="input"
                value={currentGrade.score?.toString() || ''}
                onChange={(e) => setCurrentGrade({ ...currentGrade, score: parseInt(e.target.value) })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="grade-max-score">Max Score</label>
              <input
                id="grade-max-score"
                type="number"
                min="1"
                className="input"
                value={currentGrade.maxScore?.toString() || '100'}
                onChange={(e) => setCurrentGrade({ ...currentGrade, maxScore: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="grade-date">Date</label>
            <input
              id="grade-date"
              type="date"
              className="input"
              value={currentGrade.date || format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setCurrentGrade({ ...currentGrade, date: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="grade-term">Term</label>
            <input
              id="grade-term"
              type="text"
              className="input"
              value={currentGrade.term || ''}
              onChange={(e) => setCurrentGrade({ ...currentGrade, term: e.target.value })}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Grade</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderEditGradeForm = () => (
    <div className="modal-backdrop" onClick={() => setShowEditForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Edit Grade</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowEditForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); updateGrade(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-grade-subject">Subject*</label>
            <input
              id="edit-grade-subject"
              type="text"
              className="input"
              value={currentGrade.subject || ''}
              onChange={(e) => setCurrentGrade({ ...currentGrade, subject: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-grade-score">Score*</label>
              <input
                id="edit-grade-score"
                type="number"
                min="0"
                className="input"
                value={currentGrade.score?.toString() || ''}
                onChange={(e) => setCurrentGrade({ ...currentGrade, score: parseInt(e.target.value) })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="edit-grade-max-score">Max Score</label>
              <input
                id="edit-grade-max-score"
                type="number"
                min="1"
                className="input"
                value={currentGrade.maxScore?.toString() || '100'}
                onChange={(e) => setCurrentGrade({ ...currentGrade, maxScore: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-grade-date">Date</label>
            <input
              id="edit-grade-date"
              type="date"
              className="input"
              value={currentGrade.date || ''}
              onChange={(e) => setCurrentGrade({ ...currentGrade, date: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-grade-term">Term</label>
            <input
              id="edit-grade-term"
              type="text"
              className="input"
              value={currentGrade.term || ''}
              onChange={(e) => setCurrentGrade({ ...currentGrade, term: e.target.value })}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowEditForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Grade</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderAddAttendanceForm = () => (
    <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Add Attendance Record</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowAddForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); addAttendance(); }} className="space-y-4">
          {!selectedStudent && (
            <div className="form-group">
              <label className="form-label" htmlFor="attendance-student">Student*</label>
              <select
                id="attendance-student"
                className="input"
                value={currentAttendance.studentId || ''}
                onChange={(e) => setCurrentAttendance({ ...currentAttendance, studentId: e.target.value })}
                required
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="attendance-date">Date*</label>
            <input
              id="attendance-date"
              type="date"
              className="input"
              value={currentAttendance.date || selectedDate}
              onChange={(e) => setCurrentAttendance({ ...currentAttendance, date: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Status*</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="present"
                  checked={currentAttendance.status === 'present'}
                  onChange={() => setCurrentAttendance({ ...currentAttendance, status: 'present' })}
                  required
                />
                <span>Present</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="absent"
                  checked={currentAttendance.status === 'absent'}
                  onChange={() => setCurrentAttendance({ ...currentAttendance, status: 'absent' })}
                />
                <span>Absent</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="late"
                  checked={currentAttendance.status === 'late'}
                  onChange={() => setCurrentAttendance({ ...currentAttendance, status: 'late' })}
                />
                <span>Late</span>
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="attendance-comment">Comment</label>
            <textarea
              id="attendance-comment"
              className="input"
              rows={3}
              value={currentAttendance.comment || ''}
              onChange={(e) => setCurrentAttendance({ ...currentAttendance, comment: e.target.value })}
            ></textarea>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Record</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderEditAttendanceForm = () => (
    <div className="modal-backdrop" onClick={() => setShowEditForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Edit Attendance Record</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowEditForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); updateAttendance(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Student</label>
            <p className="font-medium">{getStudentName(currentAttendance.studentId || '')}</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Date</label>
            <p className="font-medium">{currentAttendance.date}</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Status*</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="present"
                  checked={currentAttendance.status === 'present'}
                  onChange={() => setCurrentAttendance({ ...currentAttendance, status: 'present' })}
                  required
                />
                <span>Present</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="absent"
                  checked={currentAttendance.status === 'absent'}
                  onChange={() => setCurrentAttendance({ ...currentAttendance, status: 'absent' })}
                />
                <span>Absent</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="late"
                  checked={currentAttendance.status === 'late'}
                  onChange={() => setCurrentAttendance({ ...currentAttendance, status: 'late' })}
                />
                <span>Late</span>
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-attendance-comment">Comment</label>
            <textarea
              id="edit-attendance-comment"
              className="input"
              rows={3}
              value={currentAttendance.comment || ''}
              onChange={(e) => setCurrentAttendance({ ...currentAttendance, comment: e.target.value })}
            ></textarea>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowEditForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Record</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderAddAssignmentForm = () => (
    <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Add New Assignment</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowAddForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); addAssignment(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="assignment-title">Title*</label>
            <input
              id="assignment-title"
              type="text"
              className="input"
              value={currentAssignment.title || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="assignment-subject">Subject*</label>
            <input
              id="assignment-subject"
              type="text"
              className="input"
              value={currentAssignment.subject || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, subject: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="assignment-description">Description</label>
            <textarea
              id="assignment-description"
              className="input"
              rows={3}
              value={currentAssignment.description || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, description: e.target.value })}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="assignment-due-date">Due Date*</label>
            <input
              id="assignment-due-date"
              type="date"
              className="input"
              value={currentAssignment.dueDate || format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, dueDate: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="assignment-max-score">Max Score</label>
            <input
              id="assignment-max-score"
              type="number"
              min="1"
              className="input"
              value={currentAssignment.maxScore?.toString() || '100'}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, maxScore: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Assignment</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderEditAssignmentForm = () => (
    <div className="modal-backdrop" onClick={() => setShowEditForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Edit Assignment</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowEditForm(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); updateAssignment(); }} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-assignment-title">Title*</label>
            <input
              id="edit-assignment-title"
              type="text"
              className="input"
              value={currentAssignment.title || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-assignment-subject">Subject*</label>
            <input
              id="edit-assignment-subject"
              type="text"
              className="input"
              value={currentAssignment.subject || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, subject: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-assignment-description">Description</label>
            <textarea
              id="edit-assignment-description"
              className="input"
              rows={3}
              value={currentAssignment.description || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, description: e.target.value })}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-assignment-due-date">Due Date*</label>
            <input
              id="edit-assignment-due-date"
              type="date"
              className="input"
              value={currentAssignment.dueDate || ''}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, dueDate: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-assignment-max-score">Max Score</label>
            <input
              id="edit-assignment-max-score"
              type="number"
              min="1"
              className="input"
              value={currentAssignment.maxScore?.toString() || '100'}
              onChange={(e) => setCurrentAssignment({ ...currentAssignment, maxScore: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowEditForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Assignment</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const renderCameraModal = () => (
    <div className="modal-backdrop" onClick={() => setShowCamera(false)}>
      <div className="modal-content" style={{ maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Take Photo</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowCamera(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="relative h-96 w-full">
          <Camera ref={cameraRef} />
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            onClick={() => setShowCamera(false)}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              if (cameraRef.current) {
                const photo = cameraRef.current.takePhoto();
                if (selectedStudent) {
                  // Update the student's photo
                  const updatedStudents = students.map(student =>
                    student.id === selectedStudent
                      ? { ...student, photo }
                      : student
                  );
                  setStudents(updatedStudents);
                }
                setShowCamera(false);
              }
            }}
          >
            Take Photo
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderImportModal = () => (
    <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Import Data</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowImportModal(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="import-type">Data Type</label>
            <select
              id="import-type"
              className="input"
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
            >
              <option value="students">Students</option>
              <option value="grades">Grades</option>
              <option value="attendance">Attendance</option>
              <option value="assignments">Assignments</option>
              <option value="studentAssignments">Student Assignments</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Upload File</label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".json,.csv,.xlsx,.xls"
                className="input py-1.5"
                onChange={handleFileUpload}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats: .json, .csv, .xlsx, .xls
              </span>
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex-between mb-1">
              <label className="form-label mb-0">Data Preview</label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                onClick={exportTemplate}
              >
                <Download size={14} />
                <span>Download Template</span>
              </button>
            </div>
            <textarea
              className="input font-mono text-sm"
              rows={10}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your JSON data here or upload a file..."
            ></textarea>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={importDataFromText}
              disabled={!importData.trim()}
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <GraduationCap size={28} className="text-primary-600 dark:text-primary-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
            </div>
            <button
              className="bg-gray-200 dark:bg-slate-700 p-2 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container-fluid py-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'students' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} className="inline-block mr-1" />
            Students
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'grades' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('grades')}
          >
            <FileText size={16} className="inline-block mr-1" />
            Grades
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'attendance' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('attendance')}
          >
            <Calendar size={16} className="inline-block mr-1" />
            Attendance
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'assignments' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('assignments')}
          >
            <Pencil size={16} className="inline-block mr-1" />
            Assignments
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="pb-6">
          {activeTab === 'students' && (
            <div className="space-y-6">
              {!selectedStudent ? renderStudentList() : renderStudentDetail()}
            </div>
          )}
          
          {activeTab === 'grades' && renderGradesTab()}
          
          {activeTab === 'attendance' && renderAttendanceTab()}
          
          {activeTab === 'assignments' && renderAssignmentsTab()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Modals */}
      {showAddForm && activeTab === 'students' && renderAddStudentForm()}
      {showEditForm && activeTab === 'students' && renderEditStudentForm()}
      
      {showAddForm && activeTab === 'grades' && renderAddGradeForm()}
      {showEditForm && activeTab === 'grades' && renderEditGradeForm()}
      
      {showAddForm && activeTab === 'attendance' && renderAddAttendanceForm()}
      {showEditForm && activeTab === 'attendance' && renderEditAttendanceForm()}
      
      {showAddForm && activeTab === 'assignments' && renderAddAssignmentForm()}
      {showEditForm && activeTab === 'assignments' && renderEditAssignmentForm()}
      
      {showCamera && renderCameraModal()}
      {showImportModal && renderImportModal()}
    </div>
  );
};

export default App;
