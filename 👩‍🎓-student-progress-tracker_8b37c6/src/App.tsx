import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { ArrowDown, ArrowUp, Calendar, Check, ChevronDown, Download, Edit, FileText, Filter, Plus, Search, Target, Trash2, Upload, User, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

// Types
interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  targetGrade?: string;
  targetAttendance?: number;
  targetHomework?: number;
}

interface Assignment {
  id: string;
  title: string;
  date: string;
  maxScore: number;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  feedback?: string;
}

interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface Homework {
  id: string;
  studentId: string;
  title: string;
  dueDate: string;
  status: 'completed' | 'incomplete' | 'late';
  notes?: string;
}

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  grade: string;
  averageScore: number;
  attendanceRate: number;
  homeworkCompletionRate: number;
  targetGrade?: string;
  targetAttendance?: number;
  targetHomework?: number;
}

interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

// Enum types
enum TabType {
  Students = 'students',
  Grades = 'grades',
  Attendance = 'attendance',
  Homework = 'homework',
  Reports = 'reports'
}

enum ModalType {
  None = 'none',
  AddStudent = 'addStudent',
  EditStudent = 'editStudent',
  AddAssignment = 'addAssignment',
  RecordGrade = 'recordGrade',
  RecordAttendance = 'recordAttendance',
  AddHomework = 'addHomework',
  RecordHomework = 'recordHomework',
  ViewStudentReport = 'viewStudentReport',
  SetGoals = 'setGoals',
  ImportData = 'importData'
}

function App() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>(TabType.Students);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [homeworkRecords, setHomeworkRecords] = useState<Homework[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<ModalType>(ModalType.None);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [fileUploadType, setFileUploadType] = useState<'students' | 'grades' | 'attendance' | 'homework'>('students');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Initialize with sample data if none exists
      const sampleStudents = generateSampleStudents();
      setStudents(sampleStudents);
      localStorage.setItem('students', JSON.stringify(sampleStudents));
    }

    const savedAssignments = localStorage.getItem('assignments');
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    } else {
      const sampleAssignments = generateSampleAssignments();
      setAssignments(sampleAssignments);
      localStorage.setItem('assignments', JSON.stringify(sampleAssignments));
    }

    const savedGrades = localStorage.getItem('grades');
    if (savedGrades) {
      setGrades(JSON.parse(savedGrades));
    } else {
      const sampleGrades = generateSampleGrades();
      setGrades(sampleGrades);
      localStorage.setItem('grades', JSON.stringify(sampleGrades));
    }

    const savedAttendance = localStorage.getItem('attendance');
    if (savedAttendance) {
      setAttendanceRecords(JSON.parse(savedAttendance));
    } else {
      const sampleAttendance = generateSampleAttendance();
      setAttendanceRecords(sampleAttendance);
      localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
    }

    const savedHomework = localStorage.getItem('homework');
    if (savedHomework) {
      setHomeworkRecords(JSON.parse(savedHomework));
    } else {
      const sampleHomework = generateSampleHomework();
      setHomeworkRecords(sampleHomework);
      localStorage.setItem('homework', JSON.stringify(sampleHomework));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('homework', JSON.stringify(homeworkRecords));
  }, [homeworkRecords]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard event handler for Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalState !== ModalType.None) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalState]);

  // Helper functions to generate sample data
  function generateSampleStudents(): Student[] {
    return [
      { id: '1', name: 'Alice Johnson', email: 'alice@school.edu', grade: '10A', targetGrade: 'A', targetAttendance: 95, targetHomework: 100 },
      { id: '2', name: 'Bob Smith', email: 'bob@school.edu', grade: '10A', targetGrade: 'B+', targetAttendance: 90, targetHomework: 90 },
      { id: '3', name: 'Charlie Brown', email: 'charlie@school.edu', grade: '10B', targetGrade: 'A-', targetAttendance: 92, targetHomework: 95 },
      { id: '4', name: 'Diana Prince', email: 'diana@school.edu', grade: '10B', targetGrade: 'A', targetAttendance: 98, targetHomework: 100 },
      { id: '5', name: 'Edward Wilson', email: 'edward@school.edu', grade: '10A', targetGrade: 'B', targetAttendance: 85, targetHomework: 80 },
    ];
  }

  function generateSampleAssignments(): Assignment[] {
    return [
      { id: '1', title: 'Math Quiz 1', date: '2024-01-15', maxScore: 100 },
      { id: '2', title: 'Science Report', date: '2024-01-22', maxScore: 50 },
      { id: '3', title: 'History Essay', date: '2024-02-05', maxScore: 100 },
      { id: '4', title: 'English Literature Analysis', date: '2024-02-12', maxScore: 75 },
      { id: '5', title: 'Midterm Exam', date: '2024-03-01', maxScore: 200 },
    ];
  }

  function generateSampleGrades(): Grade[] {
    return [
      { id: '1', studentId: '1', assignmentId: '1', score: 95 },
      { id: '2', studentId: '1', assignmentId: '2', score: 48 },
      { id: '3', studentId: '1', assignmentId: '3', score: 92 },
      { id: '4', studentId: '2', assignmentId: '1', score: 82 },
      { id: '5', studentId: '2', assignmentId: '2', score: 41 },
      { id: '6', studentId: '3', assignmentId: '1', score: 88 },
      { id: '7', studentId: '3', assignmentId: '3', score: 95 },
      { id: '8', studentId: '4', assignmentId: '1', score: 97 },
      { id: '9', studentId: '4', assignmentId: '2', score: 49 },
      { id: '10', studentId: '5', assignmentId: '1', score: 78 },
    ];
  }

  function generateSampleAttendance(): Attendance[] {
    const dates = ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'];
    const statuses: Array<'present' | 'absent' | 'late' | 'excused'> = ['present', 'absent', 'late', 'excused'];
    const attendance: Attendance[] = [];
    let id = 1;

    for (const studentId of ['1', '2', '3', '4', '5']) {
      for (const date of dates) {
        // Higher chance of present status
        const randomIndex = Math.floor(Math.random() * (statuses.length + 3));
        const status = randomIndex >= statuses.length ? 'present' : statuses[randomIndex];
        
        attendance.push({
          id: id.toString(),
          studentId,
          date,
          status: status as 'present' | 'absent' | 'late' | 'excused',
          notes: status !== 'present' ? `Student was ${status}` : undefined
        });
        id++;
      }
    }

    return attendance;
  }

  function generateSampleHomework(): Homework[] {
    const titles = ['Math Problems', 'Science Questions', 'History Research', 'English Reading', 'Project Work'];
    const dates = ['2024-01-14', '2024-01-21', '2024-02-04', '2024-02-11', '2024-02-28'];
    const statuses: Array<'completed' | 'incomplete' | 'late'> = ['completed', 'incomplete', 'late'];
    const homework: Homework[] = [];
    let id = 1;

    for (const studentId of ['1', '2', '3', '4', '5']) {
      for (let i = 0; i < titles.length; i++) {
        // Higher chance of completed status
        const randomIndex = Math.floor(Math.random() * (statuses.length + 3));
        const status = randomIndex >= statuses.length ? 'completed' : statuses[randomIndex];
        
        homework.push({
          id: id.toString(),
          studentId,
          title: titles[i],
          dueDate: dates[i],
          status: status as 'completed' | 'incomplete' | 'late',
          notes: status !== 'completed' ? `Homework was ${status}` : undefined
        });
        id++;
      }
    }

    return homework;
  }

  // Utility functions
  const closeModal = () => {
    setModalState(ModalType.None);
    setCurrentStudent(null);
    setCurrentAssignment(null);
  };

  const openModal = (type: ModalType, student?: Student, assignment?: Assignment) => {
    setModalState(type);
    if (student) setCurrentStudent(student);
    if (assignment) setCurrentAssignment(assignment);
  };

  const generateId = (): string => {
    return Date.now().toString();
  };

  const handleAddStudent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStudent: Student = {
      id: generateId(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      grade: formData.get('grade') as string,
    };
    setStudents([...students, newStudent]);
    closeModal();
  };

  const handleUpdateStudent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStudent) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedStudent: Student = {
      ...currentStudent,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      grade: formData.get('grade') as string,
    };
    
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    closeModal();
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove all associated grades, attendance, and homework records.')) {
      setStudents(students.filter(s => s.id !== studentId));
      setGrades(grades.filter(g => g.studentId !== studentId));
      setAttendanceRecords(attendanceRecords.filter(a => a.studentId !== studentId));
      setHomeworkRecords(homeworkRecords.filter(h => h.studentId !== studentId));
    }
  };

  const handleAddAssignment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAssignment: Assignment = {
      id: generateId(),
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      maxScore: parseInt(formData.get('maxScore') as string, 10),
    };
    setAssignments([...assignments, newAssignment]);
    closeModal();
  };

  const handleRecordGrade = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStudent || !currentAssignment) return;
    
    const formData = new FormData(e.currentTarget);
    const score = parseInt(formData.get('score') as string, 10);
    const feedback = formData.get('feedback') as string;
    
    // Check if a grade already exists for this student and assignment
    const existingGradeIndex = grades.findIndex(
      g => g.studentId === currentStudent.id && g.assignmentId === currentAssignment.id
    );
    
    if (existingGradeIndex !== -1) {
      // Update existing grade
      const updatedGrades = [...grades];
      updatedGrades[existingGradeIndex] = {
        ...updatedGrades[existingGradeIndex],
        score,
        feedback
      };
      setGrades(updatedGrades);
    } else {
      // Add new grade
      const newGrade: Grade = {
        id: generateId(),
        studentId: currentStudent.id,
        assignmentId: currentAssignment.id,
        score,
        feedback
      };
      setGrades([...grades, newGrade]);
    }
    
    closeModal();
  };

  const handleRecordAttendance = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStudent) return;
    
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const status = formData.get('status') as 'present' | 'absent' | 'late' | 'excused';
    const notes = formData.get('notes') as string;
    
    // Check if attendance already exists for this student and date
    const existingAttendanceIndex = attendanceRecords.findIndex(
      a => a.studentId === currentStudent.id && a.date === date
    );
    
    if (existingAttendanceIndex !== -1) {
      // Update existing attendance
      const updatedAttendance = [...attendanceRecords];
      updatedAttendance[existingAttendanceIndex] = {
        ...updatedAttendance[existingAttendanceIndex],
        status,
        notes
      };
      setAttendanceRecords(updatedAttendance);
    } else {
      // Add new attendance
      const newAttendance: Attendance = {
        id: generateId(),
        studentId: currentStudent.id,
        date,
        status,
        notes
      };
      setAttendanceRecords([...attendanceRecords, newAttendance]);
    }
    
    closeModal();
  };

  const handleBulkAttendance = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const status = formData.get('status') as 'present' | 'absent' | 'late' | 'excused';
    const notes = formData.get('notes') as string;
    
    if (selectedStudentIds.size === 0) {
      alert('Please select at least one student');
      return;
    }
    
    const newAttendanceRecords: Attendance[] = [];
    const updatedAttendanceRecords = [...attendanceRecords];
    
    selectedStudentIds.forEach(studentId => {
      // Check if attendance already exists for this student and date
      const existingAttendanceIndex = attendanceRecords.findIndex(
        a => a.studentId === studentId && a.date === date
      );
      
      if (existingAttendanceIndex !== -1) {
        // Update existing attendance
        updatedAttendanceRecords[existingAttendanceIndex] = {
          ...updatedAttendanceRecords[existingAttendanceIndex],
          status,
          notes
        };
      } else {
        // Add new attendance
        newAttendanceRecords.push({
          id: generateId(),
          studentId,
          date,
          status,
          notes
        });
      }
    });
    
    setAttendanceRecords([...updatedAttendanceRecords, ...newAttendanceRecords]);
    setSelectedStudentIds(new Set());
    closeModal();
  };

  const handleAddHomework = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const dueDate = formData.get('dueDate') as string;
    
    const newHomeworkAssignments: Homework[] = [];
    
    // Add homework record for all students
    students.forEach(student => {
      newHomeworkAssignments.push({
        id: generateId(),
        studentId: student.id,
        title,
        dueDate,
        status: 'incomplete'
      });
    });
    
    setHomeworkRecords([...homeworkRecords, ...newHomeworkAssignments]);
    closeModal();
  };

  const handleRecordHomework = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStudent) return;
    
    const formData = new FormData(e.currentTarget);
    const homeworkId = formData.get('homeworkId') as string;
    const status = formData.get('status') as 'completed' | 'incomplete' | 'late';
    const notes = formData.get('notes') as string;
    
    // Update the homework record
    setHomeworkRecords(homeworkRecords.map(h => {
      if (h.id === homeworkId) {
        return {
          ...h,
          status,
          notes
        };
      }
      return h;
    }));
    
    closeModal();
  };

  const handleSetGoals = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStudent) return;
    
    const formData = new FormData(e.currentTarget);
    const targetGrade = formData.get('targetGrade') as string;
    const targetAttendance = parseInt(formData.get('targetAttendance') as string, 10);
    const targetHomework = parseInt(formData.get('targetHomework') as string, 10);
    
    // Update the student with new targets
    setStudents(students.map(s => {
      if (s.id === currentStudent.id) {
        return {
          ...s,
          targetGrade,
          targetAttendance,
          targetHomework
        };
      }
      return s;
    }));
    
    closeModal();
  };

  // Function to toggle student selection for bulk operations
  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudentIds);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudentIds(newSelection);
  };

  // Select or deselect all students
  const toggleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      // Deselect all
      setSelectedStudentIds(new Set());
    } else {
      // Select all filtered students
      const allIds = new Set(filteredStudents.map(student => student.id));
      setSelectedStudentIds(allIds);
    }
  };

  // Function to handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const rows = csvData.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        
        if (fileUploadType === 'students') {
          processStudentsCsv(headers, rows);
        } else if (fileUploadType === 'grades') {
          processGradesCsv(headers, rows);
        } else if (fileUploadType === 'attendance') {
          processAttendanceCsv(headers, rows);
        } else if (fileUploadType === 'homework') {
          processHomeworkCsv(headers, rows);
        }
        
        closeModal();
      } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Error processing CSV file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
  };

  // Process CSV data for different entities
  const processStudentsCsv = (headers: string[], rows: string[]) => {
    const requiredHeaders = ['name', 'email', 'grade'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      alert(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      return;
    }
    
    const nameIndex = headers.indexOf('name');
    const emailIndex = headers.indexOf('email');
    const gradeIndex = headers.indexOf('grade');
    const targetGradeIndex = headers.indexOf('targetGrade');
    const targetAttendanceIndex = headers.indexOf('targetAttendance');
    const targetHomeworkIndex = headers.indexOf('targetHomework');
    
    const newStudents: Student[] = [];
    
    // Start from 1 to skip headers
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue; // Skip empty rows
      
      const columns = row.split(',').map(col => col.trim());
      
      const newStudent: Student = {
        id: generateId(),
        name: columns[nameIndex],
        email: columns[emailIndex],
        grade: columns[gradeIndex],
      };
      
      if (targetGradeIndex !== -1 && columns[targetGradeIndex]) {
        newStudent.targetGrade = columns[targetGradeIndex];
      }
      
      if (targetAttendanceIndex !== -1 && columns[targetAttendanceIndex]) {
        newStudent.targetAttendance = parseInt(columns[targetAttendanceIndex], 10);
      }
      
      if (targetHomeworkIndex !== -1 && columns[targetHomeworkIndex]) {
        newStudent.targetHomework = parseInt(columns[targetHomeworkIndex], 10);
      }
      
      newStudents.push(newStudent);
    }
    
    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      alert(`Successfully imported ${newStudents.length} students`);
    } else {
      alert('No valid student data found in the CSV');
    }
  };

  const processGradesCsv = (headers: string[], rows: string[]) => {
    const requiredHeaders = ['studentEmail', 'assignmentTitle', 'score'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      alert(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      return;
    }
    
    const studentEmailIndex = headers.indexOf('studentEmail');
    const assignmentTitleIndex = headers.indexOf('assignmentTitle');
    const scoreIndex = headers.indexOf('score');
    const feedbackIndex = headers.indexOf('feedback');
    
    const newGrades: Grade[] = [];
    const errors: string[] = [];
    
    // Start from 1 to skip headers
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue; // Skip empty rows
      
      const columns = row.split(',').map(col => col.trim());
      
      const studentEmail = columns[studentEmailIndex];
      const assignmentTitle = columns[assignmentTitleIndex];
      const score = parseInt(columns[scoreIndex], 10);
      const feedback = feedbackIndex !== -1 ? columns[feedbackIndex] : undefined;
      
      // Find student by email
      const student = students.find(s => s.email === studentEmail);
      if (!student) {
        errors.push(`Row ${i}: Student with email ${studentEmail} not found`);
        continue;
      }
      
      // Find assignment by title
      const assignment = assignments.find(a => a.title === assignmentTitle);
      if (!assignment) {
        errors.push(`Row ${i}: Assignment with title ${assignmentTitle} not found`);
        continue;
      }
      
      // Check if grade already exists
      const existingGrade = grades.find(
        g => g.studentId === student.id && g.assignmentId === assignment.id
      );
      
      if (existingGrade) {
        // Will update existing grade
        existingGrade.score = score;
        if (feedback) existingGrade.feedback = feedback;
      } else {
        // Create new grade
        newGrades.push({
          id: generateId(),
          studentId: student.id,
          assignmentId: assignment.id,
          score,
          feedback
        });
      }
    }
    
    if (newGrades.length > 0 || errors.length === 0) {
      setGrades([...grades, ...newGrades]);
      alert(`Successfully imported ${newGrades.length} grades${errors.length > 0 ? ` with ${errors.length} errors` : ''}`);
      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }
    } else {
      alert('No valid grade data found in the CSV. Please check the console for errors.');
      console.error('Import errors:', errors);
    }
  };

  const processAttendanceCsv = (headers: string[], rows: string[]) => {
    const requiredHeaders = ['studentEmail', 'date', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      alert(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      return;
    }
    
    const studentEmailIndex = headers.indexOf('studentEmail');
    const dateIndex = headers.indexOf('date');
    const statusIndex = headers.indexOf('status');
    const notesIndex = headers.indexOf('notes');
    
    const newAttendance: Attendance[] = [];
    const updatedAttendance = [...attendanceRecords];
    const errors: string[] = [];
    
    // Start from 1 to skip headers
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue; // Skip empty rows
      
      const columns = row.split(',').map(col => col.trim());
      
      const studentEmail = columns[studentEmailIndex];
      const date = columns[dateIndex];
      const status = columns[statusIndex] as 'present' | 'absent' | 'late' | 'excused';
      const notes = notesIndex !== -1 ? columns[notesIndex] : undefined;
      
      // Validate status
      if (!['present', 'absent', 'late', 'excused'].includes(status)) {
        errors.push(`Row ${i}: Invalid status '${status}'. Must be present, absent, late, or excused`);
        continue;
      }
      
      // Find student by email
      const student = students.find(s => s.email === studentEmail);
      if (!student) {
        errors.push(`Row ${i}: Student with email ${studentEmail} not found`);
        continue;
      }
      
      // Check if attendance already exists
      const existingAttendanceIndex = attendanceRecords.findIndex(
        a => a.studentId === student.id && a.date === date
      );
      
      if (existingAttendanceIndex !== -1) {
        // Update existing attendance
        updatedAttendance[existingAttendanceIndex] = {
          ...updatedAttendance[existingAttendanceIndex],
          status,
          notes
        };
      } else {
        // Create new attendance
        newAttendance.push({
          id: generateId(),
          studentId: student.id,
          date,
          status,
          notes
        });
      }
    }
    
    if (newAttendance.length > 0 || errors.length === 0) {
      setAttendanceRecords([...updatedAttendance, ...newAttendance]);
      alert(`Successfully imported ${newAttendance.length} attendance records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`);
      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }
    } else {
      alert('No valid attendance data found in the CSV. Please check the console for errors.');
      console.error('Import errors:', errors);
    }
  };

  const processHomeworkCsv = (headers: string[], rows: string[]) => {
    const requiredHeaders = ['studentEmail', 'title', 'dueDate', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      alert(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      return;
    }
    
    const studentEmailIndex = headers.indexOf('studentEmail');
    const titleIndex = headers.indexOf('title');
    const dueDateIndex = headers.indexOf('dueDate');
    const statusIndex = headers.indexOf('status');
    const notesIndex = headers.indexOf('notes');
    
    const newHomework: Homework[] = [];
    const updatedHomework = [...homeworkRecords];
    const errors: string[] = [];
    
    // Start from 1 to skip headers
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue; // Skip empty rows
      
      const columns = row.split(',').map(col => col.trim());
      
      const studentEmail = columns[studentEmailIndex];
      const title = columns[titleIndex];
      const dueDate = columns[dueDateIndex];
      const status = columns[statusIndex] as 'completed' | 'incomplete' | 'late';
      const notes = notesIndex !== -1 ? columns[notesIndex] : undefined;
      
      // Validate status
      if (!['completed', 'incomplete', 'late'].includes(status)) {
        errors.push(`Row ${i}: Invalid status '${status}'. Must be completed, incomplete, or late`);
        continue;
      }
      
      // Find student by email
      const student = students.find(s => s.email === studentEmail);
      if (!student) {
        errors.push(`Row ${i}: Student with email ${studentEmail} not found`);
        continue;
      }
      
      // Check if homework already exists
      const existingHomeworkIndex = homeworkRecords.findIndex(
        h => h.studentId === student.id && h.title === title && h.dueDate === dueDate
      );
      
      if (existingHomeworkIndex !== -1) {
        // Update existing homework
        updatedHomework[existingHomeworkIndex] = {
          ...updatedHomework[existingHomeworkIndex],
          status,
          notes
        };
      } else {
        // Create new homework
        newHomework.push({
          id: generateId(),
          studentId: student.id,
          title,
          dueDate,
          status,
          notes
        });
      }
    }
    
    if (newHomework.length > 0 || errors.length === 0) {
      setHomeworkRecords([...updatedHomework, ...newHomework]);
      alert(`Successfully imported ${newHomework.length} homework records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`);
      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }
    } else {
      alert('No valid homework data found in the CSV. Please check the console for errors.');
      console.error('Import errors:', errors);
    }
  };

  // Function to generate a template CSV for each entity type
  const generateTemplate = (type: 'students' | 'grades' | 'attendance' | 'homework') => {
    let headers = [];
    let sampleData = [];
    
    switch (type) {
      case 'students':
        headers = ['name', 'email', 'grade', 'targetGrade', 'targetAttendance', 'targetHomework'];
        sampleData = ['John Doe', 'john@school.edu', '10A', 'A', '95', '100'];
        break;
        
      case 'grades':
        headers = ['studentEmail', 'assignmentTitle', 'score', 'feedback'];
        sampleData = ['john@school.edu', 'Math Quiz 1', '95', 'Excellent work!'];
        break;
        
      case 'attendance':
        headers = ['studentEmail', 'date', 'status', 'notes'];
        sampleData = ['john@school.edu', '2024-01-15', 'present', ''];
        break;
        
      case 'homework':
        headers = ['studentEmail', 'title', 'dueDate', 'status', 'notes'];
        sampleData = ['john@school.edu', 'Math Problems', '2024-01-14', 'completed', ''];
        break;
    }
    
    const csv = [headers.join(','), sampleData.join(',')].join('\n');
    downloadCsv(csv, `${type}_template.csv`);
  };

  // Function to download a CSV file
  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data processing functions
  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter(grade => grade.studentId === studentId);
  };

  const getStudentAttendance = (studentId: string): Attendance[] => {
    return attendanceRecords.filter(attendance => attendance.studentId === studentId);
  };

  const getStudentHomework = (studentId: string): Homework[] => {
    return homeworkRecords.filter(homework => homework.studentId === studentId);
  };

  const calculateStudentAverageScore = (studentId: string): number => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;
    
    // Get assignment details for each grade to calculate weighted average
    let totalScore = 0;
    let totalMaxScore = 0;
    
    studentGrades.forEach(grade => {
      const assignment = assignments.find(a => a.id === grade.assignmentId);
      if (assignment) {
        totalScore += grade.score;
        totalMaxScore += assignment.maxScore;
      }
    });
    
    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  };

  const calculateStudentAttendanceRate = (studentId: string): number => {
    const studentAttendance = getStudentAttendance(studentId);
    if (studentAttendance.length === 0) return 0;
    
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    return (presentCount / studentAttendance.length) * 100;
  };

  const calculateStudentHomeworkCompletionRate = (studentId: string): number => {
    const studentHomework = getStudentHomework(studentId);
    if (studentHomework.length === 0) return 0;
    
    const completedCount = studentHomework.filter(h => h.status === 'completed').length;
    return (completedCount / studentHomework.length) * 100;
  };

  const getStudentSummary = (studentId: string): StudentSummary | null => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      averageScore: calculateStudentAverageScore(studentId),
      attendanceRate: calculateStudentAttendanceRate(studentId),
      homeworkCompletionRate: calculateStudentHomeworkCompletionRate(studentId),
      targetGrade: student.targetGrade,
      targetAttendance: student.targetAttendance,
      targetHomework: student.targetHomework
    };
  };

  // Get assignment details by id
  const getAssignmentById = (assignmentId: string): Assignment | undefined => {
    return assignments.find(a => a.id === assignmentId);
  };

  // Filtering and sorting functions
  const filterStudents = (students: Student[], searchTerm: string, gradeFilter: string): Student[] => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
      
      return matchesSearch && matchesGrade;
    });
  };

  const sortItems = <T extends { [key: string]: any }>(items: T[], sortConfig: SortConfig): T[] => {
    return [...items].sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      
      // Handle null/undefined values
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valueB == null) return sortConfig.direction === 'ascending' ? 1 : -1;
      
      // Handle numeric values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'ascending' 
          ? valueA - valueB 
          : valueB - valueA;
      }
      
      // Handle string values
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'ascending' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  };

  const handleSort = (key: string) => {
    if (sortConfig.key === key) {
      // If already sorting by this key, toggle direction
      setSortConfig({
        key,
        direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
      });
    } else {
      // If sorting by a new key, default to ascending
      setSortConfig({
        key,
        direction: 'ascending'
      });
    }
  };

  // Chart data processing
  const prepareAttendanceChartData = (studentId: string) => {
    const attendanceData = getStudentAttendance(studentId);
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };
    
    attendanceData.forEach(record => {
      statusCounts[record.status]++;
    });
    
    return [
      { status: 'Present', count: statusCounts.present },
      { status: 'Absent', count: statusCounts.absent },
      { status: 'Late', count: statusCounts.late },
      { status: 'Excused', count: statusCounts.excused },
    ];
  };

  const prepareHomeworkChartData = (studentId: string) => {
    const homeworkData = getStudentHomework(studentId);
    const statusCounts = {
      completed: 0,
      incomplete: 0,
      late: 0
    };
    
    homeworkData.forEach(record => {
      statusCounts[record.status]++;
    });
    
    return [
      { status: 'Completed', count: statusCounts.completed },
      { status: 'Incomplete', count: statusCounts.incomplete },
      { status: 'Late', count: statusCounts.late },
    ];
  };

  const prepareGradesChartData = (studentId: string) => {
    const studentGrades = getStudentGrades(studentId);
    
    return studentGrades.map(grade => {
      const assignment = getAssignmentById(grade.assignmentId);
      return {
        assignment: assignment?.title ?? 'Unknown',
        score: (grade.score / (assignment?.maxScore ?? 100)) * 100
      };
    }).sort((a, b) => a.assignment.localeCompare(b.assignment));
  };

  // UI helpers and computed values
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade))).sort();
  const filteredStudents = sortItems(filterStudents(students, searchTerm, filterGrade), sortConfig);
  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Get assignment completion status for specific student
  const getAssignmentCompletionStatus = (studentId: string) => {
    const totalAssignments = assignments.length;
    const completedAssignments = grades.filter(g => g.studentId === studentId).length;
    return { total: totalAssignments, completed: completedAssignments };
  };

  // Status indicator color helper
  const getStatusColor = (type: 'attendance' | 'homework', status: string): string => {
    if (type === 'attendance') {
      switch (status) {
        case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'excused': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
    } else {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'incomplete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
    }
  };

  // Get grade letter from percentage
  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setModalState(ModalType.ImportData)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Upload size={16} />
                Import Data
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm dark:text-slate-300">Light</span>
                <button 
                  className="theme-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
                <span className="text-sm dark:text-slate-300">Dark</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto hide-scrollbar">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === TabType.Students ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab(TabType.Students)}
          >
            Students
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === TabType.Grades ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab(TabType.Grades)}
          >
            Grades
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === TabType.Attendance ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab(TabType.Attendance)}
          >
            Attendance
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === TabType.Homework ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab(TabType.Homework)}
          >
            Homework
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === TabType.Reports ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab(TabType.Reports)}
          >
            Reports
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {/* Students Tab */}
          {activeTab === TabType.Students && (
            <div>
              <div className="flex-between flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      className="input py-2 pl-2 pr-8"
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                    >
                      <option value="all">All Grades</option>
                      {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openModal(ModalType.AddStudent)}
                  >
                    <Plus size={16} />
                    Add Student
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-1">
                            Name {getSortIndicator('name')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('email')}>
                          <div className="flex items-center gap-1">
                            Email {getSortIndicator('email')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('grade')}>
                          <div className="flex items-center gap-1">
                            Grade {getSortIndicator('grade')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                            No students found. Add a new student to get started.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {student.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {student.grade}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => openModal(ModalType.SetGoals, student)}
                                >
                                  <Target size={18} />
                                </button>
                                <button
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => openModal(ModalType.ViewStudentReport, student)}
                                >
                                  <FileText size={18} />
                                </button>
                                <button
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => openModal(ModalType.EditStudent, student)}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteStudent(student.id)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === TabType.Grades && (
            <div>
              <div className="flex-between flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search students or assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      className="input py-2 pl-2 pr-8"
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                    >
                      <option value="all">All Grades</option>
                      {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openModal(ModalType.AddAssignment)}
                  >
                    <Plus size={16} />
                    Add Assignment
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Max Score
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {assignments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                            No assignments found. Add a new assignment to get started.
                          </td>
                        </tr>
                      ) : (
                        assignments.map(assignment => (
                          <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {assignment.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {new Date(assignment.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {assignment.maxScore}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                onClick={() => {
                                  // Open student selection for grading
                                  setCurrentAssignment(assignment);
                                  setModalState(ModalType.RecordGrade);
                                }}
                              >
                                Record Grades
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Individual Student Grades Section */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Student Grades</h2>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Student
                          </th>
                          {assignments.map(assignment => (
                            <th key={assignment.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                              {assignment.title}
                            </th>
                          ))}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Average
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={assignments.length + 2} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                              No students found.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map(student => {
                            const studentGrades = getStudentGrades(student.id);
                            const avgScore = calculateStudentAverageScore(student.id);
                            
                            return (
                              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {student.name}
                                </td>
                                {assignments.map(assignment => {
                                  const grade = studentGrades.find(g => g.assignmentId === assignment.id);
                                  const scorePercentage = grade ? (grade.score / assignment.maxScore) * 100 : 0;
                                  const displayGrade = grade ? grade.score : '-';
                                  
                                  return (
                                    <td key={assignment.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                      {displayGrade === '-' ? (
                                        <button
                                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                          onClick={() => {
                                            openModal(ModalType.RecordGrade, student, assignment);
                                          }}
                                        >
                                          + Add
                                        </button>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span 
                                            className={`${scorePercentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                          >
                                            {displayGrade} / {assignment.maxScore}
                                          </span>
                                          <button
                                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 ml-2"
                                            onClick={() => {
                                              openModal(ModalType.RecordGrade, student, assignment);
                                            }}
                                          >
                                            <Edit size={14} />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span 
                                    className={`font-medium ${avgScore >= 90 ? 'text-green-600 dark:text-green-400' : 
                                      avgScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-red-600 dark:text-red-400'}`}
                                  >
                                    {avgScore.toFixed(1)}% ({getGradeLetter(avgScore)})
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === TabType.Attendance && (
            <div>
              <div className="flex-between flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <input
                      type="date"
                      className="input py-2"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      className="input py-2 pl-2 pr-8"
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                    >
                      <option value="all">All Grades</option>
                      {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openModal(ModalType.RecordAttendance)}
                    disabled={selectedStudentIds.size === 0}
                  >
                    <Plus size={16} />
                    Bulk Record
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                              checked={selectedStudentIds.size > 0 && selectedStudentIds.size === filteredStudents.length}
                              onChange={toggleSelectAll}
                            />
                            Select
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Status for {new Date(currentDate).toLocaleDateString()}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => {
                          const attendance = attendanceRecords.find(
                            a => a.studentId === student.id && a.date === currentDate
                          );
                          
                          return (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <input
                                  type="checkbox"
                                  className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                                  checked={selectedStudentIds.has(student.id)}
                                  onChange={() => toggleStudentSelection(student.id)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                {student.grade}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {attendance ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('attendance', attendance.status)}`}>
                                    {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                                    {attendance.notes && (
                                      <span className="ml-1 text-gray-500 dark:text-slate-400">{attendance.notes}</span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-slate-500">Not recorded</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => openModal(ModalType.RecordAttendance, student)}
                                >
                                  {attendance ? 'Edit' : 'Record'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                {['present', 'absent', 'late', 'excused'].map(status => {
                  const count = attendanceRecords.filter(
                    a => a.date === currentDate && a.status === status
                  ).length;
                  const percentage = filteredStudents.length > 0 ? (count / filteredStudents.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="stat-card">
                      <div className="stat-title">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                      <div className="stat-value">{count}</div>
                      <div className="stat-desc">{percentage.toFixed(1)}% of class</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Homework Tab */}
          {activeTab === TabType.Homework && (
            <div>
              <div className="flex-between flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search students or homework..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      className="input py-2 pl-2 pr-8"
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                    >
                      <option value="all">All Grades</option>
                      {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openModal(ModalType.AddHomework)}
                  >
                    <Plus size={16} />
                    Add Homework
                  </button>
                </div>
              </div>

              {/* Homework Assignments */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Homework Assignments</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {homeworkRecords
                    .filter((homework, index, self) => {
                      // Filter unique homework titles
                      return index === self.findIndex(h => h.title === homework.title && h.dueDate === homework.dueDate);
                    })
                    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                    .slice(0, 5)
                    .map(homework => {
                      const totalStudents = students.length;
                      const completed = homeworkRecords.filter(
                        h => h.title === homework.title && h.dueDate === homework.dueDate && h.status === 'completed'
                      ).length;
                      const completionRate = totalStudents > 0 ? (completed / totalStudents) * 100 : 0;
                      
                      return (
                        <div key={`${homework.title}-${homework.dueDate}`} className="px-6 py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-medium text-gray-900 dark:text-white">{homework.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                Due: {new Date(homework.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {completed} / {totalStudents} completed
                              </div>
                              <div className="mt-1 h-2 w-24 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-600 dark:bg-primary-500" 
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Student Homework Status */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Student Homework Status</h2>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Homework
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                        {filteredStudents.flatMap(student => {
                          // Get homework for this student
                          const studentHomework = getStudentHomework(student.id)
                            .filter(hw => {
                              // Filter by search term if present
                              return searchTerm === '' || 
                                hw.title.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                            .slice(0, 5); // Show most recent 5 homework assignments
                          
                          if (studentHomework.length === 0) return [];
                          
                          return studentHomework.map(hw => (
                            <tr key={hw.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                {hw.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                {new Date(hw.dueDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('homework', hw.status)}`}>
                                  {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => {
                                    setCurrentStudent(student);
                                    openModal(ModalType.RecordHomework);
                                    // We'll pass homework id through form selection
                                  }}
                                >
                                  Update Status
                                </button>
                              </td>
                            </tr>
                          ));
                        })}
                        
                        {filteredStudents.length === 0 || filteredStudents.every(student => getStudentHomework(student.id).length === 0) ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                              No homework records found.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === TabType.Reports && (
            <div>
              <div className="flex-between flex-wrap gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Progress Reports</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      className="input py-2 pl-2 pr-8"
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                    >
                      <option value="all">All Grades</option>
                      {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => {
                  const summary = getStudentSummary(student.id);
                  if (!summary) return null;
                  
                  const completion = getAssignmentCompletionStatus(student.id);
                  const avgScore = summary.averageScore;
                  const attendanceRate = summary.attendanceRate;
                  const homeworkRate = summary.homeworkCompletionRate;
                  
                  // Determine progress against targets
                  const gradeTarget = summary.targetGrade ? getNumericGradeValue(summary.targetGrade) : 90;
                  const attendanceTarget = summary.targetAttendance ?? 95;
                  const homeworkTarget = summary.targetHomework ?? 100;
                  
                  const gradeProgress = avgScore / gradeTarget * 100;
                  const attendanceProgress = attendanceRate / attendanceTarget * 100;
                  const homeworkProgress = homeworkRate / homeworkTarget * 100;
                  
                  return (
                    <div key={student.id} className="card overflow-hidden">
                      <div className="flex-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{student.grade} - {student.email}</p>
                        </div>
                        <button
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          onClick={() => openModal(ModalType.ViewStudentReport, student)}
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex-between text-sm mb-1">
                            <span className="font-medium text-gray-700 dark:text-slate-300">Overall Grade: {avgScore.toFixed(1)}% ({getGradeLetter(avgScore)})</span>
                            <span className="text-gray-500 dark:text-slate-400">
                              Target: {summary.targetGrade || 'Not set'}
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${gradeProgress >= 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-primary-600 dark:bg-primary-500'}`}
                              style={{ width: `${Math.min(gradeProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex-between text-sm mb-1">
                            <span className="font-medium text-gray-700 dark:text-slate-300">Attendance: {attendanceRate.toFixed(1)}%</span>
                            <span className="text-gray-500 dark:text-slate-400">
                              Target: {summary.targetAttendance ? `${summary.targetAttendance}%` : 'Not set'}
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${attendanceProgress >= 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-primary-600 dark:bg-primary-500'}`}
                              style={{ width: `${Math.min(attendanceProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex-between text-sm mb-1">
                            <span className="font-medium text-gray-700 dark:text-slate-300">Homework: {homeworkRate.toFixed(1)}%</span>
                            <span className="text-gray-500 dark:text-slate-400">
                              Target: {summary.targetHomework ? `${summary.targetHomework}%` : 'Not set'}
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${homeworkProgress >= 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-primary-600 dark:bg-primary-500'}`}
                              style={{ width: `${Math.min(homeworkProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            Assignments: {completion.completed}/{completion.total} completed
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredStudents.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-slate-400">
                    No students found matching your search criteria.
                  </div>
                )}
              </div>
              
              {/* Class Summary Charts */}
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Class Performance Summary</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Class Average Grades Chart */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average Grades by Assignment</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getClassAveragesByAssignment()}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="assignment" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <Tooltip 
                            formatter={(value) => [`${value.toFixed(1)}%`, 'Average Score']} 
                            labelFormatter={(label) => `Assignment: ${label}`}
                          />
                          <Bar 
                            dataKey="average" 
                            fill="#6366f1" 
                            name="Average Score"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Attendance Trends Chart */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Trends</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getAttendanceTrends()}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <Tooltip 
                            formatter={(value) => [`${value.toFixed(1)}%`, 'Present Rate']} 
                            labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="presentRate" 
                            stroke="#4ade80" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                            name="Present Rate" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-md py-4 mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-slate-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {modalState !== ModalType.None && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Add Student Modal */}
            {modalState === ModalType.AddStudent && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Student</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddStudent}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input"
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
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="grade" className="form-label">Grade/Class</label>
                      <input
                        type="text"
                        id="grade"
                        name="grade"
                        className="input"
                        placeholder="e.g. 10A"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Student</button>
                  </div>
                </form>
              </>
            )}

            {/* Edit Student Modal */}
            {modalState === ModalType.EditStudent && currentStudent && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Student</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleUpdateStudent}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="edit-name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        className="input"
                        defaultValue={currentStudent.name}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-email" className="form-label">Email</label>
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        className="input"
                        defaultValue={currentStudent.email}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-grade" className="form-label">Grade/Class</label>
                      <input
                        type="text"
                        id="edit-grade"
                        name="grade"
                        className="input"
                        defaultValue={currentStudent.grade}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Student</button>
                  </div>
                </form>
              </>
            )}

            {/* Add Assignment Modal */}
            {modalState === ModalType.AddAssignment && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Assignment</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddAssignment}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="title" className="form-label">Assignment Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="maxScore" className="form-label">Maximum Score</label>
                      <input
                        type="number"
                        id="maxScore"
                        name="maxScore"
                        className="input"
                        min="1"
                        defaultValue="100"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Assignment</button>
                  </div>
                </form>
              </>
            )}

            {/* Record Grade Modal */}
            {modalState === ModalType.RecordGrade && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Record Grade</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                {!currentStudent && currentAssignment ? (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                      Select a student to record grade for "{currentAssignment.title}"
                    </h4>
                    <div className="max-h-60 overflow-y-auto mt-2">
                      <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                        {students.map(student => (
                          <li key={student.id} className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 px-2 rounded cursor-pointer"
                            onClick={() => openModal(ModalType.RecordGrade, student, currentAssignment)}
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{student.grade} - {student.email}</p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : currentStudent && !currentAssignment ? (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                      Select an assignment to record grade for {currentStudent.name}
                    </h4>
                    <div className="max-h-60 overflow-y-auto mt-2">
                      <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                        {assignments.map(assignment => (
                          <li key={assignment.id} className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 px-2 rounded cursor-pointer"
                            onClick={() => openModal(ModalType.RecordGrade, currentStudent, assignment)}
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">
                                Date: {new Date(assignment.date).toLocaleDateString()} | Max Score: {assignment.maxScore}
                              </p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : currentStudent && currentAssignment ? (
                  <form onSubmit={handleRecordGrade}>
                    <div className="mt-4">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Student: {currentStudent.name}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Assignment: {currentAssignment.title}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Max Score: {currentAssignment.maxScore}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="form-group">
                          <label htmlFor="score" className="form-label">Score</label>
                          <input
                            type="number"
                            id="score"
                            name="score"
                            className="input"
                            min="0"
                            max={currentAssignment.maxScore}
                            defaultValue={
                              grades.find(
                                g => g.studentId === currentStudent.id && g.assignmentId === currentAssignment.id
                              )?.score || ''
                            }
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="feedback" className="form-label">Feedback (Optional)</label>
                          <textarea
                            id="feedback"
                            name="feedback"
                            className="input"
                            rows={3}
                            defaultValue={
                              grades.find(
                                g => g.studentId === currentStudent.id && g.assignmentId === currentAssignment.id
                              )?.feedback || ''
                            }
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Grade</button>
                    </div>
                  </form>
                ) : null}
              </>
            )}

            {/* Record Attendance Modal */}
            {modalState === ModalType.RecordAttendance && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentStudent ? `Record Attendance for ${currentStudent.name}` : 'Bulk Record Attendance'}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={currentStudent ? handleRecordAttendance : handleBulkAttendance}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="attendance-date" className="form-label">Date</label>
                      <input
                        type="date"
                        id="attendance-date"
                        name="date"
                        className="input"
                        defaultValue={currentDate}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="attendance-status" className="form-label">Status</label>
                      <select
                        id="attendance-status"
                        name="status"
                        className="input"
                        defaultValue={currentStudent ? 
                          attendanceRecords.find(
                            a => a.studentId === currentStudent.id && a.date === currentDate
                          )?.status || 'present' : 'present'}
                        required
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="attendance-notes" className="form-label">Notes (Optional)</label>
                      <textarea
                        id="attendance-notes"
                        name="notes"
                        className="input"
                        rows={2}
                        defaultValue={currentStudent ? 
                          attendanceRecords.find(
                            a => a.studentId === currentStudent.id && a.date === currentDate
                          )?.notes || '' : ''}
                      ></textarea>
                    </div>
                    
                    {!currentStudent && (
                      <div className="alert alert-info flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2">This will record attendance for {selectedStudentIds.size} selected students.</span>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {currentStudent ? 'Save Attendance' : 'Save Bulk Attendance'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Add Homework Modal */}
            {modalState === ModalType.AddHomework && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Homework</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddHomework}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="homework-title" className="form-label">Homework Title</label>
                      <input
                        type="text"
                        id="homework-title"
                        name="title"
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="homework-due-date" className="form-label">Due Date</label>
                      <input
                        type="date"
                        id="homework-due-date"
                        name="dueDate"
                        className="input"
                        required
                      />
                    </div>
                    
                    <div className="alert alert-info flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2">This homework will be assigned to all students.</span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Homework</button>
                  </div>
                </form>
              </>
            )}

            {/* Record Homework Modal */}
            {modalState === ModalType.RecordHomework && currentStudent && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Homework Status</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleRecordHomework}>
                  <div className="mt-4 space-y-4">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Student: {currentStudent.name}</p>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="homework-id" className="form-label">Homework Assignment</label>
                      <select
                        id="homework-id"
                        name="homeworkId"
                        className="input"
                        defaultValue=""
                        required
                      >
                        <option value="" disabled>Select a homework assignment</option>
                        {getStudentHomework(currentStudent.id)
                          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                          .map(hw => (
                            <option key={hw.id} value={hw.id}>
                              {hw.title} - Due: {new Date(hw.dueDate).toLocaleDateString()} - Status: {hw.status}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="homework-status" className="form-label">Status</label>
                      <select
                        id="homework-status"
                        name="status"
                        className="input"
                        defaultValue="completed"
                        required
                      >
                        <option value="completed">Completed</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="late">Late</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="homework-notes" className="form-label">Notes (Optional)</label>
                      <textarea
                        id="homework-notes"
                        name="notes"
                        className="input"
                        rows={2}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Status</button>
                  </div>
                </form>
              </>
            )}

            {/* View Student Report Modal */}
            {modalState === ModalType.ViewStudentReport && currentStudent && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Student Progress Report</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">{currentStudent.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{currentStudent.grade} - {currentStudent.email}</p>
                  </div>
                  
                  {/* Summary Stats */}
                  {(() => {
                    const summary = getStudentSummary(currentStudent.id);
                    if (!summary) return null;
                    
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="stat-card">
                          <div className="stat-title">Average Grade</div>
                          <div className="stat-value">
                            {summary.averageScore.toFixed(1)}% ({getGradeLetter(summary.averageScore)})
                          </div>
                          <div className="stat-desc">
                            Target: {summary.targetGrade || 'Not set'}
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-title">Attendance Rate</div>
                          <div className="stat-value">{summary.attendanceRate.toFixed(1)}%</div>
                          <div className="stat-desc">
                            Target: {summary.targetAttendance ? `${summary.targetAttendance}%` : 'Not set'}
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-title">Homework Completion</div>
                          <div className="stat-value">{summary.homeworkCompletionRate.toFixed(1)}%</div>
                          <div className="stat-desc">
                            Target: {summary.targetHomework ? `${summary.targetHomework}%` : 'Not set'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Charts */}
                  <div className="space-y-6">
                    {/* Grades Chart */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Assignment Performance</h5>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={prepareGradesChartData(currentStudent.id)}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="assignment" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                            <Tooltip 
                              formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} 
                              labelFormatter={(label) => `Assignment: ${label}`}
                            />
                            <Bar 
                              dataKey="score" 
                              fill="#6366f1" 
                              name="Score" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Attendance & Homework Charts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Attendance Breakdown</h5>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareAttendanceChartData(currentStudent.id)}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="status" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#10b981" name="Count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Homework Breakdown</h5>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareHomeworkChartData(currentStudent.id)}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="status" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#f59e0b" name="Count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Close</button>
                  <button 
                    type="button" 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => openModal(ModalType.SetGoals, currentStudent)}
                  >
                    <Target size={16} />
                    Set Goals
                  </button>
                </div>
              </>
            )}

            {/* Set Goals Modal */}
            {modalState === ModalType.SetGoals && currentStudent && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Set Goals for {currentStudent.name}</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSetGoals}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="target-grade" className="form-label">Target Grade</label>
                      <select
                        id="target-grade"
                        name="targetGrade"
                        className="input"
                        defaultValue={currentStudent.targetGrade || 'A'}
                      >
                        {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'].map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="target-attendance" className="form-label">Target Attendance Rate (%)</label>
                      <input
                        type="number"
                        id="target-attendance"
                        name="targetAttendance"
                        className="input"
                        min="0"
                        max="100"
                        defaultValue={currentStudent.targetAttendance || 95}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="target-homework" className="form-label">Target Homework Completion Rate (%)</label>
                      <input
                        type="number"
                        id="target-homework"
                        name="targetHomework"
                        className="input"
                        min="0"
                        max="100"
                        defaultValue={currentStudent.targetHomework || 100}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Goals</button>
                  </div>
                </form>
              </>
            )}

            {/* Import Data Modal */}
            {modalState === ModalType.ImportData && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Data</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-4 space-y-6">
                  <div className="form-group">
                    <label htmlFor="import-type" className="form-label">Select Data Type</label>
                    <select
                      id="import-type"
                      className="input"
                      value={fileUploadType}
                      onChange={(e) => setFileUploadType(e.target.value as 'students' | 'grades' | 'attendance' | 'homework')}
                    >
                      <option value="students">Students</option>
                      <option value="grades">Grades</option>
                      <option value="attendance">Attendance</option>
                      <option value="homework">Homework</option>
                    </select>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">How to import</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-slate-400 space-y-1">
                      <li>Download the template CSV file for {fileUploadType}</li>
                      <li>Fill in your data according to the template</li>
                      <li>Upload the completed CSV file</li>
                    </ol>
                    
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-sm bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 flex items-center gap-2"
                        onClick={() => generateTemplate(fileUploadType)}
                      >
                        <Download size={14} />
                        Download Template
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Upload CSV File
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Choose File
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Only CSV files are supported. Make sure your file matches the template format.
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn bg-gray-200 text-gray-800" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
  // Helper function for report charts
  function getNumericGradeValue(gradeLetter: string): number {
    switch (gradeLetter) {
      case 'A+': return 97;
      case 'A': return 93;
      case 'A-': return 90;
      case 'B+': return 87;
      case 'B': return 83;
      case 'B-': return 80;
      case 'C+': return 77;
      case 'C': return 73;
      case 'C-': return 70;
      case 'D+': return 67;
      case 'D': return 63;
      case 'D-': return 60;
      case 'F': return 55;
      default: return 90; // Default target
    }
  }
  
  // Function to get class averages by assignment for chart
  function getClassAveragesByAssignment() {
    return assignments.map(assignment => {
      const assignmentGrades = grades.filter(g => g.assignmentId === assignment.id);
      let totalScore = 0;
      assignmentGrades.forEach(grade => {
        totalScore += (grade.score / assignment.maxScore) * 100;
      });
      const average = assignmentGrades.length > 0 ? totalScore / assignmentGrades.length : 0;
      
      return {
        assignment: assignment.title,
        average
      };
    });
  }
  
  // Function to get attendance trends for chart
  function getAttendanceTrends() {
    // Get all unique dates with attendance records
    const dates = Array.from(new Set(attendanceRecords.map(a => a.date)))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return dates.map(date => {
      const dayRecords = attendanceRecords.filter(a => a.date === date);
      const presentCount = dayRecords.filter(r => r.status === 'present').length;
      const totalCount = dayRecords.length;
      const presentRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
      
      return {
        date,
        presentRate
      };
    });
  }
}

export default App;