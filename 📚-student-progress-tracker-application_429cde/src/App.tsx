import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, ResponsiveContainer, LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Search, Plus, User, Edit, Trash2, Filter, ChevronDown, ArrowLeftRight, Download, X, Check, Calendar, BookOpen, FileText, ChartBar } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  grades: Grade[];
  attendance: AttendanceRecord[];
  homework: HomeworkRecord[];
  participation: ParticipationRecord[];
}

interface Grade {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  category: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

interface HomeworkRecord {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  score: number;
  maxScore: number;
}

interface ParticipationRecord {
  id: string;
  date: string;
  score: number; // 1-5 scale
  notes: string;
}

interface StudentPerformance {
  name: string;
  avgGrade: number;
  attendanceRate: number;
  homeworkRate: number;
  participationAvg: number;
}

interface ReportData {
  studentPerformance: StudentPerformance[];
  classAvgGrade: number;
  classAttendanceRate: number;
  classHomeworkRate: number;
  classParticipationAvg: number;
}

type ActiveTab = 'students' | 'grades' | 'attendance' | 'homework' | 'participation' | 'reports';
type ActiveStudent = string | null;
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State declarations
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('students');
  const [activeStudent, setActiveStudent] = useState<ActiveStudent>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [tempStudent, setTempStudent] = useState<Partial<Student>>({ name: '', email: '' });
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [tempGrade, setTempGrade] = useState<Partial<Grade>>({ title: '', score: 0, maxScore: 100, category: 'Test' });
  const [isAddingAttendance, setIsAddingAttendance] = useState(false);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [tempAttendance, setTempAttendance] = useState<Partial<AttendanceRecord>>({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
  const [isAddingHomework, setIsAddingHomework] = useState(false);
  const [isEditingHomework, setIsEditingHomework] = useState(false);
  const [tempHomework, setTempHomework] = useState<Partial<HomeworkRecord>>({ title: '', date: new Date().toISOString().split('T')[0], completed: false, score: 0, maxScore: 100 });
  const [isAddingParticipation, setIsAddingParticipation] = useState(false);
  const [isEditingParticipation, setIsEditingParticipation] = useState(false);
  const [tempParticipation, setTempParticipation] = useState<Partial<ParticipationRecord>>({ date: new Date().toISOString().split('T')[0], score: 3, notes: '' });
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentEditId, setCurrentEditId] = useState<string>('');

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Load sample data if no saved data exists
      setStudents(generateSampleData());
    }
  }, []);

  // Update localStorage whenever students data changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
    filterStudents();
    generateReportData();
  }, [students, searchTerm, statusFilter, categoryFilter]);

  // Function to filter students based on search term
  const filterStudents = () => {
    let filtered = [...students];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortStudents(filtered, sortBy, sortDirection);
    
    setFilteredStudents(filtered);
  };

  // Function to sort students
  const sortStudents = (studentList: Student[], sortField: string, direction: SortDirection) => {
    return [...studentList].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Determine values based on sort field
      if (sortField === 'name') {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      } else if (sortField === 'email') {
        valueA = a.email.toLowerCase();
        valueB = b.email.toLowerCase();
      } else if (sortField === 'avgGrade') {
        valueA = calculateAverageGrade(a);
        valueB = calculateAverageGrade(b);
      } else if (sortField === 'attendance') {
        valueA = calculateAttendanceRate(a);
        valueB = calculateAttendanceRate(b);
      } else {
        return 0;
      }

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Toggle sort direction
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Generate sample data for initial load
  const generateSampleData = (): Student[] => {
    const sampleStudents: Student[] = [];
    const names = [
      'Emma Thompson', 'Liam Wilson', 'Olivia Martinez', 'Noah Johnson', 'Ava Williams',
      'Ethan Brown', 'Sophia Davis', 'Jackson Miller', 'Isabella Rodriguez', 'Lucas Garcia'
    ];

    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const grades: Grade[] = [];
      const attendance: AttendanceRecord[] = [];
      const homework: HomeworkRecord[] = [];
      const participation: ParticipationRecord[] = [];

      // Generate 5 grades for each student
      for (let j = 0; j < 5; j++) {
        const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
        const date = new Date(today);
        date.setDate(date.getDate() - (j * 7)); // One grade every week
        grades.push({
          id: `grade-${i}-${j}`,
          title: `Assignment ${j + 1}`,
          score,
          maxScore: 100,
          date: date.toISOString().split('T')[0],
          category: j % 2 === 0 ? 'Test' : 'Quiz'
        });
      }

      // Generate attendance for past 20 days
      for (let j = 0; j < 20; j++) {
        const date = new Date(today);
        date.setDate(date.getDate() - j);
        const statusOptions: ('present' | 'absent' | 'late' | 'excused')[] = ['present', 'absent', 'late', 'excused'];
        const randomIndex = Math.floor(Math.random() * 100);
        let status: 'present' | 'absent' | 'late' | 'excused';
        
        // Make 'present' more likely
        if (randomIndex < 80) status = 'present';
        else if (randomIndex < 90) status = 'late';
        else if (randomIndex < 95) status = 'absent';
        else status = 'excused';
        
        attendance.push({
          id: `attendance-${i}-${j}`,
          date: date.toISOString().split('T')[0],
          status,
          notes: ''
        });
      }

      // Generate 10 homework records
      for (let j = 0; j < 10; j++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (j * 3)); // One homework every 3 days
        const completed = Math.random() > 0.2; // 80% chance of completion
        const score = completed ? Math.floor(Math.random() * 20) + 80 : 0;
        
        homework.push({
          id: `homework-${i}-${j}`,
          title: `Homework ${j + 1}`,
          date: date.toISOString().split('T')[0],
          completed,
          score,
          maxScore: 100
        });
      }

      // Generate 15 participation records
      for (let j = 0; j < 15; j++) {
        const date = new Date(today);
        date.setDate(date.getDate() - j);
        const score = Math.floor(Math.random() * 3) + 3; // Random score between 3-5
        
        participation.push({
          id: `participation-${i}-${j}`,
          date: date.toISOString().split('T')[0],
          score,
          notes: ''
        });
      }

      sampleStudents.push({
        id: `student-${i}`,
        name: names[i],
        email: names[i].toLowerCase().replace(' ', '.') + '@example.com',
        grades,
        attendance,
        homework,
        participation
      });
    }

    return sampleStudents;
  };

  // Calculate average grade for a student
  const calculateAverageGrade = (student: Student): number => {
    if (student.grades.length === 0) return 0;
    const totalPoints = student.grades.reduce((sum, grade) => sum + grade.score, 0);
    const maxPoints = student.grades.reduce((sum, grade) => sum + grade.maxScore, 0);
    return maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
  };

  // Calculate attendance rate for a student
  const calculateAttendanceRate = (student: Student): number => {
    if (student.attendance.length === 0) return 0;
    const presentCount = student.attendance.filter(record => record.status === 'present').length;
    return (presentCount / student.attendance.length) * 100;
  };

  // Calculate homework completion rate for a student
  const calculateHomeworkRate = (student: Student): number => {
    if (student.homework.length === 0) return 0;
    const completedCount = student.homework.filter(record => record.completed).length;
    return (completedCount / student.homework.length) * 100;
  };

  // Calculate average participation score for a student
  const calculateParticipationAvg = (student: Student): number => {
    if (student.participation.length === 0) return 0;
    const totalScore = student.participation.reduce((sum, record) => sum + record.score, 0);
    return totalScore / student.participation.length;
  };

  // Generate report data for all students
  const generateReportData = () => {
    if (students.length === 0) {
      setReportData(null);
      return;
    }

    const studentPerformance: StudentPerformance[] = students.map(student => ({
      name: student.name,
      avgGrade: calculateAverageGrade(student),
      attendanceRate: calculateAttendanceRate(student),
      homeworkRate: calculateHomeworkRate(student),
      participationAvg: calculateParticipationAvg(student)
    }));

    const classAvgGrade = studentPerformance.reduce((sum, perf) => sum + perf.avgGrade, 0) / studentPerformance.length;
    const classAttendanceRate = studentPerformance.reduce((sum, perf) => sum + perf.attendanceRate, 0) / studentPerformance.length;
    const classHomeworkRate = studentPerformance.reduce((sum, perf) => sum + perf.homeworkRate, 0) / studentPerformance.length;
    const classParticipationAvg = studentPerformance.reduce((sum, perf) => sum + perf.participationAvg, 0) / studentPerformance.length;

    setReportData({
      studentPerformance,
      classAvgGrade,
      classAttendanceRate,
      classHomeworkRate,
      classParticipationAvg
    });
  };

  // Generate a unique ID
  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Download report as CSV
  const downloadReport = () => {
    if (!reportData) return;

    let csvContent = 'Student,Average Grade,Attendance Rate,Homework Completion,Participation Score\n';
    
    reportData.studentPerformance.forEach(perf => {
      csvContent += `${perf.name},${perf.avgGrade.toFixed(2)}%,${perf.attendanceRate.toFixed(2)}%,${perf.homeworkRate.toFixed(2)}%,${perf.participationAvg.toFixed(2)}\n`;
    });
    
    csvContent += `\nClass Average,${reportData.classAvgGrade.toFixed(2)}%,${reportData.classAttendanceRate.toFixed(2)}%,${reportData.classHomeworkRate.toFixed(2)}%,${reportData.classParticipationAvg.toFixed(2)}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download student data template
  const downloadTemplate = () => {
    const templateContent = 'Name,Email\nJohn Doe,john.doe@example.com\nJane Smith,jane.smith@example.com';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle student form submission
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempStudent.name || !tempStudent.email) return;
    
    if (isEditingStudent) {
      // Update existing student
      const updatedStudents = students.map(student => 
        student.id === currentEditId ? 
        { ...student, name: tempStudent.name || '', email: tempStudent.email || '' } : 
        student
      );
      setStudents(updatedStudents);
      setIsEditingStudent(false);
    } else {
      // Add new student
      const newStudent: Student = {
        id: generateId('student'),
        name: tempStudent.name || '',
        email: tempStudent.email || '',
        grades: [],
        attendance: [],
        homework: [],
        participation: []
      };
      setStudents([...students, newStudent]);
    }
    
    setTempStudent({ name: '', email: '' });
    setCurrentEditId('');
    setIsAddingStudent(false);
  };

  // Handle grade form submission
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeStudent || !tempGrade.title || tempGrade.score === undefined || tempGrade.maxScore === undefined) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    
    if (isEditingGrade) {
      // Update existing grade
      const gradeIndex = updatedStudents[studentIndex].grades.findIndex(g => g.id === currentEditId);
      if (gradeIndex === -1) return;
      
      updatedStudents[studentIndex].grades[gradeIndex] = {
        ...updatedStudents[studentIndex].grades[gradeIndex],
        title: tempGrade.title || '',
        score: tempGrade.score,
        maxScore: tempGrade.maxScore,
        date: tempGrade.date || new Date().toISOString().split('T')[0],
        category: tempGrade.category || 'Test'
      };
    } else {
      // Add new grade
      const newGrade: Grade = {
        id: generateId('grade'),
        title: tempGrade.title || '',
        score: tempGrade.score,
        maxScore: tempGrade.maxScore,
        date: tempGrade.date || new Date().toISOString().split('T')[0],
        category: tempGrade.category || 'Test'
      };
      updatedStudents[studentIndex].grades.push(newGrade);
    }
    
    setStudents(updatedStudents);
    setTempGrade({ title: '', score: 0, maxScore: 100, category: 'Test' });
    setCurrentEditId('');
    setIsAddingGrade(false);
    setIsEditingGrade(false);
  };

  // Handle attendance form submission
  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeStudent || !tempAttendance.date || !tempAttendance.status) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    
    if (isEditingAttendance) {
      // Update existing attendance record
      const recordIndex = updatedStudents[studentIndex].attendance.findIndex(a => a.id === currentEditId);
      if (recordIndex === -1) return;
      
      updatedStudents[studentIndex].attendance[recordIndex] = {
        ...updatedStudents[studentIndex].attendance[recordIndex],
        date: tempAttendance.date || '',
        status: tempAttendance.status,
        notes: tempAttendance.notes || ''
      };
    } else {
      // Add new attendance record
      const newRecord: AttendanceRecord = {
        id: generateId('attendance'),
        date: tempAttendance.date || '',
        status: tempAttendance.status,
        notes: tempAttendance.notes || ''
      };
      updatedStudents[studentIndex].attendance.push(newRecord);
    }
    
    setStudents(updatedStudents);
    setTempAttendance({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
    setCurrentEditId('');
    setIsAddingAttendance(false);
    setIsEditingAttendance(false);
  };

  // Handle homework form submission
  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeStudent || !tempHomework.title || !tempHomework.date) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    
    if (isEditingHomework) {
      // Update existing homework record
      const recordIndex = updatedStudents[studentIndex].homework.findIndex(h => h.id === currentEditId);
      if (recordIndex === -1) return;
      
      updatedStudents[studentIndex].homework[recordIndex] = {
        ...updatedStudents[studentIndex].homework[recordIndex],
        title: tempHomework.title || '',
        date: tempHomework.date || '',
        completed: tempHomework.completed === true,
        score: tempHomework.score !== undefined ? tempHomework.score : 0,
        maxScore: tempHomework.maxScore !== undefined ? tempHomework.maxScore : 100
      };
    } else {
      // Add new homework record
      const newRecord: HomeworkRecord = {
        id: generateId('homework'),
        title: tempHomework.title || '',
        date: tempHomework.date || '',
        completed: tempHomework.completed === true,
        score: tempHomework.score !== undefined ? tempHomework.score : 0,
        maxScore: tempHomework.maxScore !== undefined ? tempHomework.maxScore : 100
      };
      updatedStudents[studentIndex].homework.push(newRecord);
    }
    
    setStudents(updatedStudents);
    setTempHomework({ title: '', date: new Date().toISOString().split('T')[0], completed: false, score: 0, maxScore: 100 });
    setCurrentEditId('');
    setIsAddingHomework(false);
    setIsEditingHomework(false);
  };

  // Handle participation form submission
  const handleParticipationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeStudent || !tempParticipation.date || tempParticipation.score === undefined) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    
    if (isEditingParticipation) {
      // Update existing participation record
      const recordIndex = updatedStudents[studentIndex].participation.findIndex(p => p.id === currentEditId);
      if (recordIndex === -1) return;
      
      updatedStudents[studentIndex].participation[recordIndex] = {
        ...updatedStudents[studentIndex].participation[recordIndex],
        date: tempParticipation.date || '',
        score: tempParticipation.score,
        notes: tempParticipation.notes || ''
      };
    } else {
      // Add new participation record
      const newRecord: ParticipationRecord = {
        id: generateId('participation'),
        date: tempParticipation.date || '',
        score: tempParticipation.score,
        notes: tempParticipation.notes || ''
      };
      updatedStudents[studentIndex].participation.push(newRecord);
    }
    
    setStudents(updatedStudents);
    setTempParticipation({ date: new Date().toISOString().split('T')[0], score: 3, notes: '' });
    setCurrentEditId('');
    setIsAddingParticipation(false);
    setIsEditingParticipation(false);
  };

  // Delete a student
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);
      if (activeStudent === id) {
        setActiveStudent(null);
      }
    }
  };

  // Edit a student
  const handleEditStudent = (student: Student) => {
    setTempStudent({ name: student.name, email: student.email });
    setCurrentEditId(student.id);
    setIsEditingStudent(true);
    setIsAddingStudent(true);
  };

  // Delete a grade
  const handleDeleteGrade = (id: string) => {
    if (!activeStudent || !window.confirm('Are you sure you want to delete this grade?')) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    updatedStudents[studentIndex].grades = updatedStudents[studentIndex].grades.filter(grade => grade.id !== id);
    
    setStudents(updatedStudents);
  };

  // Edit a grade
  const handleEditGrade = (grade: Grade) => {
    setTempGrade({
      title: grade.title,
      score: grade.score,
      maxScore: grade.maxScore,
      date: grade.date,
      category: grade.category
    });
    setCurrentEditId(grade.id);
    setIsEditingGrade(true);
    setIsAddingGrade(true);
  };

  // Delete an attendance record
  const handleDeleteAttendance = (id: string) => {
    if (!activeStudent || !window.confirm('Are you sure you want to delete this attendance record?')) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    updatedStudents[studentIndex].attendance = updatedStudents[studentIndex].attendance.filter(record => record.id !== id);
    
    setStudents(updatedStudents);
  };

  // Edit an attendance record
  const handleEditAttendance = (record: AttendanceRecord) => {
    setTempAttendance({
      date: record.date,
      status: record.status,
      notes: record.notes
    });
    setCurrentEditId(record.id);
    setIsEditingAttendance(true);
    setIsAddingAttendance(true);
  };

  // Delete a homework record
  const handleDeleteHomework = (id: string) => {
    if (!activeStudent || !window.confirm('Are you sure you want to delete this homework record?')) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    updatedStudents[studentIndex].homework = updatedStudents[studentIndex].homework.filter(record => record.id !== id);
    
    setStudents(updatedStudents);
  };

  // Edit a homework record
  const handleEditHomework = (record: HomeworkRecord) => {
    setTempHomework({
      title: record.title,
      date: record.date,
      completed: record.completed,
      score: record.score,
      maxScore: record.maxScore
    });
    setCurrentEditId(record.id);
    setIsEditingHomework(true);
    setIsAddingHomework(true);
  };

  // Delete a participation record
  const handleDeleteParticipation = (id: string) => {
    if (!activeStudent || !window.confirm('Are you sure you want to delete this participation record?')) return;
    
    const studentIndex = students.findIndex(s => s.id === activeStudent);
    if (studentIndex === -1) return;
    
    const updatedStudents = [...students];
    updatedStudents[studentIndex].participation = updatedStudents[studentIndex].participation.filter(record => record.id !== id);
    
    setStudents(updatedStudents);
  };

  // Edit a participation record
  const handleEditParticipation = (record: ParticipationRecord) => {
    setTempParticipation({
      date: record.date,
      score: record.score,
      notes: record.notes
    });
    setCurrentEditId(record.id);
    setIsEditingParticipation(true);
    setIsAddingParticipation(true);
  };

  // Get student by ID
  const getStudentById = (id: string | null): Student | undefined => {
    if (!id) return undefined;
    return students.find(student => student.id === id);
  };

  // Modal close handler with ESC key support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddingStudent(false);
        setIsEditingStudent(false);
        setIsAddingGrade(false);
        setIsEditingGrade(false);
        setIsAddingAttendance(false);
        setIsEditingAttendance(false);
        setIsAddingHomework(false);
        setIsEditingHomework(false);
        setIsAddingParticipation(false);
        setIsEditingParticipation(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Get active student data
  const activeStudentData = getStudentById(activeStudent);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F', '#EB984E', '#EC7063'];

  // Render student list
  const renderStudentList = () => {
    return (
      <div className="space-y-4">
        <div className="flex-between">
          <h2 className="text-2xl font-bold">Students</h2>
          <button 
            onClick={() => {
              setTempStudent({ name: '', email: '' });
              setIsAddingStudent(true);
              setIsEditingStudent(false);
            }}
            className="btn btn-primary flex items-center gap-2"
            aria-label="Add student"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search students"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
            <button 
              onClick={() => handleSort('name')} 
              className="btn btn-secondary flex items-center gap-1"
              aria-label="Sort by name"
            >
              Name
              {sortBy === 'name' && (
                <ArrowLeftRight size={16} className={sortDirection === 'asc' ? 'transform rotate-90' : 'transform -rotate-90'} />
              )}
            </button>
            
            <button 
              onClick={() => handleSort('avgGrade')} 
              className="btn btn-secondary flex items-center gap-1"
              aria-label="Sort by grade"
            >
              Grade
              {sortBy === 'avgGrade' && (
                <ArrowLeftRight size={16} className={sortDirection === 'asc' ? 'transform rotate-90' : 'transform -rotate-90'} />
              )}
            </button>
            
            <button 
              onClick={() => handleSort('attendance')} 
              className="btn btn-secondary flex items-center gap-1"
              aria-label="Sort by attendance"
            >
              Attendance
              {sortBy === 'attendance' && (
                <ArrowLeftRight size={16} className={sortDirection === 'asc' ? 'transform rotate-90' : 'transform -rotate-90'} />
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Avg. Grade</th>
                <th className="table-header">Attendance</th>
                <th className="table-header">Homework</th>
                <th className="table-header">Participation</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No students found. Add a student to get started.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const avgGrade = calculateAverageGrade(student);
                  const attendanceRate = calculateAttendanceRate(student);
                  const homeworkRate = calculateHomeworkRate(student);
                  const participationAvg = calculateParticipationAvg(student);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => {
                        setActiveStudent(student.id);
                        setActiveTab('grades');
                      }}>
                      <td className="table-cell font-medium">{student.name}</td>
                      <td className="table-cell">{student.email}</td>
                      <td className="table-cell">
                        <span className={`${avgGrade >= 90 ? 'badge badge-success' : avgGrade >= 70 ? 'badge badge-info' : 'badge badge-error'}`}>
                          {avgGrade.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`${attendanceRate >= 90 ? 'badge badge-success' : attendanceRate >= 75 ? 'badge badge-info' : 'badge badge-error'}`}>
                          {attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`${homeworkRate >= 90 ? 'badge badge-success' : homeworkRate >= 70 ? 'badge badge-info' : 'badge badge-error'}`}>
                          {homeworkRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`${participationAvg >= 4 ? 'badge badge-success' : participationAvg >= 3 ? 'badge badge-info' : 'badge badge-error'}`}>
                          {participationAvg.toFixed(1)}/5
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleEditStudent(student)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            aria-label={`Edit ${student.name}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label={`Delete ${student.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="space-x-2">
            <button 
              onClick={downloadTemplate}
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              aria-label="Download template"
            >
              <Download size={16} />
              <span>Template</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render grades tab
  const renderGrades = () => {
    if (!activeStudentData) return <div className="text-center py-8">Please select a student first</div>;
    
    const sortedGrades = [...activeStudentData.grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Prepare chart data
    const chartData = [...sortedGrades].reverse().map(grade => ({
      name: grade.title,
      score: (grade.score / grade.maxScore) * 100,
      date: grade.date
    }));
    
    return (
      <div className="space-y-4">
        <div className="flex-between">
          <div>
            <h2 className="text-2xl font-bold">{activeStudentData.name}'s Grades</h2>
            <p className="text-gray-600 dark:text-gray-400">Average: {calculateAverageGrade(activeStudentData).toFixed(1)}%</p>
          </div>
          <div>
            <button 
              onClick={() => {
                setTempGrade({ title: '', score: 0, maxScore: 100, category: 'Test', date: new Date().toISOString().split('T')[0] });
                setIsAddingGrade(true);
                setIsEditingGrade(false);
              }}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Add grade"
            >
              <Plus size={18} />
              <span>Add Grade</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 space-y-4">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Grade Progress</h3>
              <div className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Grade (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No grade data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="card h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Grade Distribution</h3>
                <div>
                  <select 
                    className="input-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    <option value="Test">Tests</option>
                    <option value="Quiz">Quizzes</option>
                    <option value="Project">Projects</option>
                    <option value="Homework">Homework</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
                <table className="table">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr>
                      <th className="table-header">Title</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedGrades.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="table-cell text-center py-4 text-gray-500 dark:text-gray-400">
                          No grades recorded
                        </td>
                      </tr>
                    ) : (
                      sortedGrades
                        .filter(grade => categoryFilter === 'all' || grade.category === categoryFilter)
                        .map(grade => (
                          <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="table-cell font-medium">{grade.title}</td>
                            <td className="table-cell">{grade.date}</td>
                            <td className="table-cell">
                              <span className="badge badge-info">{grade.category}</span>
                            </td>
                            <td className="table-cell">
                              <span className={`font-medium ${(grade.score/grade.maxScore >= 0.9) ? 'text-green-600 dark:text-green-400' : (grade.score/grade.maxScore >= 0.7) ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                {grade.score}/{grade.maxScore} ({((grade.score/grade.maxScore) * 100).toFixed(1)}%)
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditGrade(grade)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  aria-label={`Edit ${grade.title}`}
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteGrade(grade.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  aria-label={`Delete ${grade.title}`}
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
        </div>
      </div>
    );
  };

  // Render attendance tab
  const renderAttendance = () => {
    if (!activeStudentData) return <div className="text-center py-8">Please select a student first</div>;

    const sortedAttendance = [...activeStudentData.attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate stats
    const totalRecords = sortedAttendance.length;
    const presentCount = sortedAttendance.filter(record => record.status === 'present').length;
    const absentCount = sortedAttendance.filter(record => record.status === 'absent').length;
    const lateCount = sortedAttendance.filter(record => record.status === 'late').length;
    const excusedCount = sortedAttendance.filter(record => record.status === 'excused').length;
    
    // Prepare chart data
    const pieData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount },
      { name: 'Late', value: lateCount },
      { name: 'Excused', value: excusedCount }
    ].filter(entry => entry.value > 0);
    
    return (
      <div className="space-y-4">
        <div className="flex-between">
          <div>
            <h2 className="text-2xl font-bold">{activeStudentData.name}'s Attendance</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Attendance Rate: {calculateAttendanceRate(activeStudentData).toFixed(1)}%
            </p>
          </div>
          <div>
            <button 
              onClick={() => {
                setTempAttendance({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
                setIsAddingAttendance(true);
                setIsEditingAttendance(false);
              }}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Add attendance record"
            >
              <Plus size={18} />
              <span>Add Attendance</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 space-y-4">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Attendance Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="card-sm bg-green-50 dark:bg-green-900">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Present</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{presentCount}</p>
                  <p className="text-xs text-green-800 dark:text-green-200">
                    {totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="card-sm bg-red-50 dark:bg-red-900">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Absent</h4>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
                  <p className="text-xs text-red-800 dark:text-red-200">
                    {totalRecords > 0 ? ((absentCount / totalRecords) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="card-sm bg-yellow-50 dark:bg-yellow-900">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Late</h4>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lateCount}</p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    {totalRecords > 0 ? ((lateCount / totalRecords) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="card-sm bg-blue-50 dark:bg-blue-900">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Excused</h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{excusedCount}</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {totalRecords > 0 ? ((excusedCount / totalRecords) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => {
                          const colors = {
                            Present: '#10B981',
                            Absent: '#EF4444',
                            Late: '#F59E0B',
                            Excused: '#3B82F6'
                          };
                          const color = colors[entry.name as keyof typeof colors] || COLORS[index % COLORS.length];
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No attendance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="card h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Attendance Records</h3>
                <div>
                  <select 
                    className="input-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
                <table className="table">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Notes</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="table-cell text-center py-4 text-gray-500 dark:text-gray-400">
                          No attendance records
                        </td>
                      </tr>
                    ) : (
                      sortedAttendance
                        .filter(record => statusFilter === 'all' || record.status === statusFilter)
                        .map(record => (
                          <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="table-cell font-medium">{record.date}</td>
                            <td className="table-cell">
                              <span 
                                className={`badge ${record.status === 'present' ? 'badge-success' : 
                                  record.status === 'absent' ? 'badge-error' : 
                                  record.status === 'late' ? 'badge-warning' : 'badge-info'}`}
                              >
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                            <td className="table-cell">
                              {record.notes ? record.notes : <span className="text-gray-400 dark:text-gray-500">No notes</span>}
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditAttendance(record)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  aria-label={`Edit attendance for ${record.date}`}
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAttendance(record.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  aria-label={`Delete attendance for ${record.date}`}
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
        </div>
      </div>
    );
  };

  // Render homework tab
  const renderHomework = () => {
    if (!activeStudentData) return <div className="text-center py-8">Please select a student first</div>;

    const sortedHomework = [...activeStudentData.homework].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate stats
    const totalHw = sortedHomework.length;
    const completedHw = sortedHomework.filter(hw => hw.completed).length;
    const incompleteHw = totalHw - completedHw;
    const completionRate = totalHw > 0 ? (completedHw / totalHw) * 100 : 0;
    
    // Calculate average score for completed homework
    const completedHomework = sortedHomework.filter(hw => hw.completed);
    const avgScore = completedHomework.length > 0 ? 
      completedHomework.reduce((sum, hw) => sum + (hw.score / hw.maxScore), 0) / completedHomework.length * 100 : 
      0;
    
    // Prepare chart data
    const barData = [
      { name: 'Completed', value: completedHw },
      { name: 'Incomplete', value: incompleteHw }
    ].filter(entry => entry.value > 0);
    
    return (
      <div className="space-y-4">
        <div className="flex-between">
          <div>
            <h2 className="text-2xl font-bold">{activeStudentData.name}'s Homework</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Completion Rate: {completionRate.toFixed(1)}% | Average Score: {avgScore.toFixed(1)}%
            </p>
          </div>
          <div>
            <button 
              onClick={() => {
                setTempHomework({ title: '', date: new Date().toISOString().split('T')[0], completed: false, score: 0, maxScore: 100 });
                setIsAddingHomework(true);
                setIsEditingHomework(false);
              }}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Add homework record"
            >
              <Plus size={18} />
              <span>Add Homework</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 space-y-4">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Homework Summary</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card-sm bg-blue-50 dark:bg-blue-900">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Completion Rate</h4>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{completionRate.toFixed(1)}%</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {completedHw} of {totalHw} assignments
                  </p>
                </div>
                <div className="card-sm bg-green-50 dark:bg-green-900">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Average Score</h4>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{avgScore.toFixed(1)}%</p>
                  <p className="text-xs text-green-800 dark:text-green-200">
                    For completed assignments
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Assignments">
                        {barData.map((entry, index) => {
                          const colors = {
                            Completed: '#10B981',
                            Incomplete: '#EF4444'
                          };
                          const color = colors[entry.name as keyof typeof colors] || COLORS[index % COLORS.length];
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No homework data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="card h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Homework Records</h3>
                <div>
                  <select 
                    className="input-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by completion status"
                  >
                    <option value="all">All Homework</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
                <table className="table">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr>
                      <th className="table-header">Title</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedHomework.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="table-cell text-center py-4 text-gray-500 dark:text-gray-400">
                          No homework records
                        </td>
                      </tr>
                    ) : (
                      sortedHomework
                        .filter(hw => {
                          if (statusFilter === 'all') return true;
                          if (statusFilter === 'completed') return hw.completed;
                          if (statusFilter === 'incomplete') return !hw.completed;
                          return true;
                        })
                        .map(hw => (
                          <tr key={hw.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="table-cell font-medium">{hw.title}</td>
                            <td className="table-cell">{hw.date}</td>
                            <td className="table-cell">
                              <span className={`badge ${hw.completed ? 'badge-success' : 'badge-error'}`}>
                                {hw.completed ? 'Completed' : 'Incomplete'}
                              </span>
                            </td>
                            <td className="table-cell">
                              {hw.completed ? (
                                <span className={`font-medium ${(hw.score/hw.maxScore >= 0.9) ? 'text-green-600 dark:text-green-400' : (hw.score/hw.maxScore >= 0.7) ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {hw.score}/{hw.maxScore} ({((hw.score/hw.maxScore) * 100).toFixed(1)}%)
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditHomework(hw)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  aria-label={`Edit ${hw.title}`}
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteHomework(hw.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  aria-label={`Delete ${hw.title}`}
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
        </div>
      </div>
    );
  };

  // Render participation tab
  const renderParticipation = () => {
    if (!activeStudentData) return <div className="text-center py-8">Please select a student first</div>;

    const sortedParticipation = [...activeStudentData.participation].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate average score
    const avgScore = calculateParticipationAvg(activeStudentData);
    
    // Count by score
    const scoreCount = {
      1: sortedParticipation.filter(p => p.score === 1).length,
      2: sortedParticipation.filter(p => p.score === 2).length,
      3: sortedParticipation.filter(p => p.score === 3).length,
      4: sortedParticipation.filter(p => p.score === 4).length,
      5: sortedParticipation.filter(p => p.score === 5).length
    };
    
    // Prepare chart data
    const barData = [
      { name: '1 (Poor)', value: scoreCount[1] },
      { name: '2 (Fair)', value: scoreCount[2] },
      { name: '3 (Good)', value: scoreCount[3] },
      { name: '4 (Great)', value: scoreCount[4] },
      { name: '5 (Excellent)', value: scoreCount[5] }
    ].filter(entry => entry.value > 0);
    
    // Prepare line chart data (chronological)
    const lineData = [...sortedParticipation]
      .reverse()
      .slice(0, 10) // Take only the last 10 records
      .map(record => ({
        date: record.date,
        score: record.score
      }));
    
    return (
      <div className="space-y-4">
        <div className="flex-between">
          <div>
            <h2 className="text-2xl font-bold">{activeStudentData.name}'s Participation</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Average Participation: {avgScore.toFixed(1)}/5
            </p>
          </div>
          <div>
            <button 
              onClick={() => {
                setTempParticipation({ date: new Date().toISOString().split('T')[0], score: 3, notes: '' });
                setIsAddingParticipation(true);
                setIsEditingParticipation(false);
              }}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Add participation record"
            >
              <Plus size={18} />
              <span>Add Participation</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 space-y-4">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Participation Distribution</h3>
              <div className="h-64">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Number of Days">
                        {barData.map((entry, index) => {
                          // Define colors for each score level
                          const scoreColors = {
                            '1 (Poor)': '#EF4444',
                            '2 (Fair)': '#F59E0B',
                            '3 (Good)': '#3B82F6',
                            '4 (Great)': '#10B981',
                            '5 (Excellent)': '#8B5CF6'
                          };
                          return <Cell key={`cell-${index}`} fill={scoreColors[entry.name as keyof typeof scoreColors]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No participation data available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Recent Participation Trend</h3>
              <div className="h-64">
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Participation Score" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">Not enough participation data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="card h-full">
              <h3 className="text-xl font-semibold mb-4">Participation Records</h3>
              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                <table className="table">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Notes</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedParticipation.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="table-cell text-center py-4 text-gray-500 dark:text-gray-400">
                          No participation records
                        </td>
                      </tr>
                    ) : (
                      sortedParticipation.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="table-cell font-medium">{record.date}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className={`
                                font-medium px-2 py-1 rounded-full text-white 
                                ${record.score === 5 ? 'bg-purple-600 dark:bg-purple-800' : 
                                  record.score === 4 ? 'bg-green-600 dark:bg-green-800' : 
                                  record.score === 3 ? 'bg-blue-600 dark:bg-blue-800' : 
                                  record.score === 2 ? 'bg-yellow-600 dark:bg-yellow-800' : 
                                  'bg-red-600 dark:bg-red-800'}
                              `}>
                                {record.score}/5
                              </span>
                            </div>
                          </td>
                          <td className="table-cell">
                            {record.notes ? record.notes : <span className="text-gray-400 dark:text-gray-500">No notes</span>}
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditParticipation(record)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                aria-label={`Edit participation for ${record.date}`}
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteParticipation(record.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                aria-label={`Delete participation for ${record.date}`}
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
        </div>
      </div>
    );
  };

  // Render reports tab
  const renderReports = () => {
    if (!reportData || students.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500 dark:text-gray-400">No student data available for reporting</p>
        </div>
      );
    }
    
    // Sort student performance by average grade
    const sortedPerformance = [...reportData.studentPerformance].sort((a, b) => b.avgGrade - a.avgGrade);
    
    // Prepare bar chart data for class comparison
    const comparisonData = sortedPerformance.map(student => ({
      name: student.name.split(' ')[0], // Use first name only for brevity
      grade: student.avgGrade,
      attendance: student.attendanceRate,
      homework: student.homeworkRate,
      participation: student.participationAvg * 20 // Scale to 100 for comparison
    }));
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Class Reports</h2>
          <button 
            onClick={downloadReport}
            className="btn btn-primary flex items-center gap-2"
            aria-label="Download report"
          >
            <Download size={18} />
            <span>Download Report</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="card-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-800">
            <h3 className="font-medium text-blue-100">Class Average Grade</h3>
            <p className="text-3xl font-bold mt-1">{reportData.classAvgGrade.toFixed(1)}%</p>
          </div>
          
          <div className="card-sm bg-gradient-to-br from-green-500 to-green-600 text-white dark:from-green-600 dark:to-green-800">
            <h3 className="font-medium text-green-100">Class Attendance Rate</h3>
            <p className="text-3xl font-bold mt-1">{reportData.classAttendanceRate.toFixed(1)}%</p>
          </div>
          
          <div className="card-sm bg-gradient-to-br from-yellow-500 to-yellow-600 text-white dark:from-yellow-600 dark:to-yellow-800">
            <h3 className="font-medium text-yellow-100">Homework Completion</h3>
            <p className="text-3xl font-bold mt-1">{reportData.classHomeworkRate.toFixed(1)}%</p>
          </div>
          
          <div className="card-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white dark:from-purple-600 dark:to-purple-800">
            <h3 className="font-medium text-purple-100">Participation Score</h3>
            <p className="text-3xl font-bold mt-1">{reportData.classParticipationAvg.toFixed(1)}/5</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Student Performance Comparison</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="grade" name="Grade" fill="#8884d8" />
                <Bar dataKey="attendance" name="Attendance" fill="#82ca9d" />
                <Bar dataKey="homework" name="Homework" fill="#ffc658" />
                <Bar dataKey="participation" name="Participation" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Student Rankings</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Rank</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Average Grade</th>
                  <th className="table-header">Attendance Rate</th>
                  <th className="table-header">Homework Completion</th>
                  <th className="table-header">Participation Score</th>
                  <th className="table-header">Overall</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {sortedPerformance.map((student, index) => {
                  // Calculate overall score (weighted average)
                  const overall = (
                    student.avgGrade * 0.4 + 
                    student.attendanceRate * 0.25 + 
                    student.homeworkRate * 0.25 + 
                    (student.participationAvg / 5) * 100 * 0.1
                  ).toFixed(1);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="table-cell font-bold text-center">{index + 1}</td>
                      <td className="table-cell font-medium">{student.name}</td>
                      <td className="table-cell">
                        <span className={`badge ${student.avgGrade >= 90 ? 'badge-success' : student.avgGrade >= 70 ? 'badge-info' : 'badge-error'}`}>
                          {student.avgGrade.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${student.attendanceRate >= 90 ? 'badge-success' : student.attendanceRate >= 75 ? 'badge-info' : 'badge-error'}`}>
                          {student.attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${student.homeworkRate >= 90 ? 'badge-success' : student.homeworkRate >= 70 ? 'badge-info' : 'badge-error'}`}>
                          {student.homeworkRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${student.participationAvg >= 4 ? 'badge-success' : student.participationAvg >= 3 ? 'badge-info' : 'badge-error'}`}>
                          {student.participationAvg.toFixed(1)}/5
                        </span>
                      </td>
                      <td className="table-cell font-bold">{overall}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render student modal
  const renderStudentModal = () => {
    if (!isAddingStudent) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => {
        setIsAddingStudent(false);
        setIsEditingStudent(false);
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="student-modal-title">
              {isEditingStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" 
              onClick={() => {
                setIsAddingStudent(false);
                setIsEditingStudent(false);
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleStudentSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="student-name">Name</label>
                <input 
                  type="text" 
                  id="student-name" 
                  className="input" 
                  value={tempStudent.name || ''}
                  onChange={(e) => setTempStudent({...tempStudent, name: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="student-email">Email</label>
                <input 
                  type="email" 
                  id="student-email" 
                  className="input" 
                  value={tempStudent.email || ''}
                  onChange={(e) => setTempStudent({...tempStudent, email: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsAddingStudent(false);
                  setIsEditingStudent(false);
                }}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditingStudent ? 'Save Changes' : 'Add Student'}
              >
                {isEditingStudent ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render grade modal
  const renderGradeModal = () => {
    if (!isAddingGrade) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => {
        setIsAddingGrade(false);
        setIsEditingGrade(false);
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="grade-modal-title">
              {isEditingGrade ? 'Edit Grade' : 'Add New Grade'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" 
              onClick={() => {
                setIsAddingGrade(false);
                setIsEditingGrade(false);
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleGradeSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="grade-title">Title</label>
                <input 
                  type="text" 
                  id="grade-title" 
                  className="input" 
                  value={tempGrade.title || ''}
                  onChange={(e) => setTempGrade({...tempGrade, title: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="grade-score">Score</label>
                  <input 
                    type="number" 
                    id="grade-score" 
                    className="input" 
                    value={tempGrade.score !== undefined ? tempGrade.score : ''}
                    onChange={(e) => setTempGrade({...tempGrade, score: Number(e.target.value)})}
                    min="0"
                    max={tempGrade.maxScore}
                    required
                    aria-required="true"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="grade-max-score">Max Score</label>
                  <input 
                    type="number" 
                    id="grade-max-score" 
                    className="input" 
                    value={tempGrade.maxScore !== undefined ? tempGrade.maxScore : ''}
                    onChange={(e) => setTempGrade({...tempGrade, maxScore: Number(e.target.value)})}
                    min="1"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="grade-date">Date</label>
                <input 
                  type="date" 
                  id="grade-date" 
                  className="input" 
                  value={tempGrade.date || ''}
                  onChange={(e) => setTempGrade({...tempGrade, date: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="grade-category">Category</label>
                <select
                  id="grade-category"
                  className="input"
                  value={tempGrade.category || 'Test'}
                  onChange={(e) => setTempGrade({...tempGrade, category: e.target.value})}
                  required
                  aria-required="true"
                >
                  <option value="Test">Test</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                  <option value="Homework">Homework</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsAddingGrade(false);
                  setIsEditingGrade(false);
                }}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditingGrade ? 'Save Changes' : 'Add Grade'}
              >
                {isEditingGrade ? 'Save Changes' : 'Add Grade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render attendance modal
  const renderAttendanceModal = () => {
    if (!isAddingAttendance) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => {
        setIsAddingAttendance(false);
        setIsEditingAttendance(false);
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="attendance-modal-title">
              {isEditingAttendance ? 'Edit Attendance Record' : 'Add Attendance Record'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" 
              onClick={() => {
                setIsAddingAttendance(false);
                setIsEditingAttendance(false);
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAttendanceSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="attendance-date">Date</label>
                <input 
                  type="date" 
                  id="attendance-date" 
                  className="input" 
                  value={tempAttendance.date || ''}
                  onChange={(e) => setTempAttendance({...tempAttendance, date: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="attendance-status">Status</label>
                <select
                  id="attendance-status"
                  className="input"
                  value={tempAttendance.status || 'present'}
                  onChange={(e) => setTempAttendance({...tempAttendance, status: e.target.value as 'present' | 'absent' | 'late' | 'excused'})}
                  required
                  aria-required="true"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="attendance-notes">Notes</label>
                <textarea 
                  id="attendance-notes" 
                  className="input" 
                  value={tempAttendance.notes || ''}
                  onChange={(e) => setTempAttendance({...tempAttendance, notes: e.target.value})}
                  rows={3}
                  aria-label="Attendance notes"
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsAddingAttendance(false);
                  setIsEditingAttendance(false);
                }}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditingAttendance ? 'Save Changes' : 'Add Record'}
              >
                {isEditingAttendance ? 'Save Changes' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render homework modal
  const renderHomeworkModal = () => {
    if (!isAddingHomework) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => {
        setIsAddingHomework(false);
        setIsEditingHomework(false);
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="homework-modal-title">
              {isEditingHomework ? 'Edit Homework Record' : 'Add Homework Record'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" 
              onClick={() => {
                setIsAddingHomework(false);
                setIsEditingHomework(false);
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleHomeworkSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="homework-title">Title</label>
                <input 
                  type="text" 
                  id="homework-title" 
                  className="input" 
                  value={tempHomework.title || ''}
                  onChange={(e) => setTempHomework({...tempHomework, title: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="homework-date">Date</label>
                <input 
                  type="date" 
                  id="homework-date" 
                  className="input" 
                  value={tempHomework.date || ''}
                  onChange={(e) => setTempHomework({...tempHomework, date: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <div className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id="homework-completed" 
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" 
                    checked={tempHomework.completed || false}
                    onChange={(e) => setTempHomework({...tempHomework, completed: e.target.checked})}
                    aria-label="Homework completed"
                  />
                  <label className="form-label mb-0 ml-2" htmlFor="homework-completed">Completed</label>
                </div>
              </div>
              
              {tempHomework.completed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="homework-score">Score</label>
                    <input 
                      type="number" 
                      id="homework-score" 
                      className="input" 
                      value={tempHomework.score !== undefined ? tempHomework.score : ''}
                      onChange={(e) => setTempHomework({...tempHomework, score: Number(e.target.value)})}
                      min="0"
                      max={tempHomework.maxScore}
                      required
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="homework-max-score">Max Score</label>
                    <input 
                      type="number" 
                      id="homework-max-score" 
                      className="input" 
                      value={tempHomework.maxScore !== undefined ? tempHomework.maxScore : ''}
                      onChange={(e) => setTempHomework({...tempHomework, maxScore: Number(e.target.value)})}
                      min="1"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsAddingHomework(false);
                  setIsEditingHomework(false);
                }}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditingHomework ? 'Save Changes' : 'Add Record'}
              >
                {isEditingHomework ? 'Save Changes' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render participation modal
  const renderParticipationModal = () => {
    if (!isAddingParticipation) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => {
        setIsAddingParticipation(false);
        setIsEditingParticipation(false);
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="participation-modal-title">
              {isEditingParticipation ? 'Edit Participation Record' : 'Add Participation Record'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" 
              onClick={() => {
                setIsAddingParticipation(false);
                setIsEditingParticipation(false);
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleParticipationSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="participation-date">Date</label>
                <input 
                  type="date" 
                  id="participation-date" 
                  className="input" 
                  value={tempParticipation.date || ''}
                  onChange={(e) => setTempParticipation({...tempParticipation, date: e.target.value})}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="participation-score">Participation Score (1-5)</label>
                <div className="flex space-x-4">
                  {[1, 2, 3, 4, 5].map(score => (
                    <label key={score} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="participation-score" 
                        value={score} 
                        checked={(tempParticipation.score || 3) === score}
                        onChange={() => setTempParticipation({...tempParticipation, score})}
                        className="hidden" 
                        aria-label={`Score ${score}`}
                      />
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center 
                        ${(tempParticipation.score || 3) === score ? 
                          (score === 5 ? 'bg-purple-600 text-white' : 
                          score === 4 ? 'bg-green-600 text-white' : 
                          score === 3 ? 'bg-blue-600 text-white' : 
                          score === 2 ? 'bg-yellow-600 text-white' : 
                          'bg-red-600 text-white') : 
                          'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
                        transition-colors
                      `}>
                        {score}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {(tempParticipation.score || 3) === 5 ? '5 - Excellent participation' : 
                   (tempParticipation.score || 3) === 4 ? '4 - Great participation' : 
                   (tempParticipation.score || 3) === 3 ? '3 - Good participation' : 
                   (tempParticipation.score || 3) === 2 ? '2 - Fair participation' : 
                   '1 - Poor participation'}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="participation-notes">Notes</label>
                <textarea 
                  id="participation-notes" 
                  className="input" 
                  value={tempParticipation.notes || ''}
                  onChange={(e) => setTempParticipation({...tempParticipation, notes: e.target.value})}
                  rows={3}
                  aria-label="Participation notes"
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsAddingParticipation(false);
                  setIsEditingParticipation(false);
                }}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditingParticipation ? 'Save Changes' : 'Add Record'}
              >
                {isEditingParticipation ? 'Save Changes' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Dark mode toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm py-4">
        <div className="container-fluid flex-between">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold">Student Progress Tracker</h1>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="theme-toggle"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-thumb"></span>
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container-fluid py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar / Navigation */}
          <div className="lg:w-64 space-y-4">
            <div className={`flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${styles.sidebarNav}`}>
              <button 
                onClick={() => setActiveTab('students')}
                className={`${styles.navButton} ${activeTab === 'students' ? styles.navButtonActive : ''} flex items-center gap-2 p-3 rounded-md w-full text-left transition-colors`}
                aria-label="Students"
                aria-current={activeTab === 'students' ? 'page' : undefined}
              >
                <User size={20} />
                <span className="responsive-hide">Students</span>
              </button>
              
              {activeStudentData && (
                <>
                  <button 
                    onClick={() => setActiveTab('grades')}
                    className={`${styles.navButton} ${activeTab === 'grades' ? styles.navButtonActive : ''} flex items-center gap-2 p-3 rounded-md w-full text-left transition-colors`}
                    aria-label="Grades"
                    aria-current={activeTab === 'grades' ? 'page' : undefined}
                  >
                    <FileText size={20} />
                    <span className="responsive-hide">Grades</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('attendance')}
                    className={`${styles.navButton} ${activeTab === 'attendance' ? styles.navButtonActive : ''} flex items-center gap-2 p-3 rounded-md w-full text-left transition-colors`}
                    aria-label="Attendance"
                    aria-current={activeTab === 'attendance' ? 'page' : undefined}
                  >
                    <Calendar size={20} />
                    <span className="responsive-hide">Attendance</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('homework')}
                    className={`${styles.navButton} ${activeTab === 'homework' ? styles.navButtonActive : ''} flex items-center gap-2 p-3 rounded-md w-full text-left transition-colors`}
                    aria-label="Homework"
                    aria-current={activeTab === 'homework' ? 'page' : undefined}
                  >
                    <BookOpen size={20} />
                    <span className="responsive-hide">Homework</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('participation')}
                    className={`${styles.navButton} ${activeTab === 'participation' ? styles.navButtonActive : ''} flex items-center gap-2 p-3 rounded-md w-full text-left transition-colors`}
                    aria-label="Participation"
                    aria-current={activeTab === 'participation' ? 'page' : undefined}
                  >
                    <User size={20} />
                    <span className="responsive-hide">Participation</span>
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setActiveTab('reports')}
                className={`${styles.navButton} ${activeTab === 'reports' ? styles.navButtonActive : ''} flex items-center gap-2 p-3 rounded-md w-full text-left transition-colors`}
                aria-label="Reports"
                aria-current={activeTab === 'reports' ? 'page' : undefined}
              >
                <ChartBar size={20} />
                <span className="responsive-hide">Reports</span>
              </button>
            </div>
            
            {activeStudentData && (
              <div className="card p-4 space-y-3">
                <h3 className="font-medium text-lg">{activeStudentData.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activeStudentData.email}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Grade:</span>
                    <span className="ml-1 font-medium">{calculateAverageGrade(activeStudentData).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Attendance:</span>
                    <span className="ml-1 font-medium">{calculateAttendanceRate(activeStudentData).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Homework:</span>
                    <span className="ml-1 font-medium">{calculateHomeworkRate(activeStudentData).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Participation:</span>
                    <span className="ml-1 font-medium">{calculateParticipationAvg(activeStudentData).toFixed(1)}/5</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setActiveStudent(null);
                    setActiveTab('students');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mt-2"
                  aria-label="Back to student list"
                >
                  ← Back to All Students
                </button>
              </div>
            )}
          </div>
          
          {/* Main content area */}
          <div className="lg:flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {activeTab === 'students' && renderStudentList()}
              {activeTab === 'grades' && renderGrades()}
              {activeTab === 'attendance' && renderAttendance()}
              {activeTab === 'homework' && renderHomework()}
              {activeTab === 'participation' && renderParticipation()}
              {activeTab === 'reports' && renderReports()}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Modals */}
      {renderStudentModal()}
      {renderGradeModal()}
      {renderAttendanceModal()}
      {renderHomeworkModal()}
      {renderParticipationModal()}
    </div>
  );
};

export default App;