import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { parseISO, format, isValid } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  User,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Book,
  Check,
  XCircle,
  Clock,
  Upload,
  Download,
  ArrowLeft,
  Menu,
  Eye,
  ChevronDown,
  Filter
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript Types
type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  createdAt: string;
};

type Grade = {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  date: string;
};

type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  studentCompletions: {
    studentId: string;
    status: 'completed' | 'in-progress' | 'not-started';
    submittedDate?: string;
  }[];
};

type TabType = 'students' | 'grades' | 'attendance' | 'assignments' | 'dashboard' | 'student-details';

type ModalType = 'addStudent' | 'editStudent' | 'addGrade' | 'editGrade' | 'addAttendance' | 'editAttendance' | 'addAssignment' | 'editAssignment' | 'importData' | null;

type AnalyticsData = {
  gradeDistribution: { name: string; value: number }[];
  attendanceOverview: { name: string; value: number }[];
  assignmentCompletion: { name: string; value: number }[];
};

const App: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentModal, setCurrentModal] = useState<ModalType>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({ 
    gradeDistribution: [], 
    attendanceOverview: [], 
    assignmentCompletion: [] 
  });
  const [filterStatus, setFilterStatus] = useState<{ students: string; assignments: string; attendance: string }>({ 
    students: 'all', 
    assignments: 'all', 
    attendance: 'all' 
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) setStudents(JSON.parse(loadedStudents));

    const loadedGrades = localStorage.getItem('grades');
    if (loadedGrades) setGrades(JSON.parse(loadedGrades));

    const loadedAttendance = localStorage.getItem('attendance');
    if (loadedAttendance) setAttendanceRecords(JSON.parse(loadedAttendance));

    const loadedAssignments = localStorage.getItem('assignments');
    if (loadedAssignments) setAssignments(JSON.parse(loadedAssignments));
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Generate analytics data
  useEffect(() => {
    // Grade distribution
    const gradeRanges = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    grades.forEach(grade => {
      if (grade.score >= 90) gradeRanges['A (90-100)']++;
      else if (grade.score >= 80) gradeRanges['B (80-89)']++;
      else if (grade.score >= 70) gradeRanges['C (70-79)']++;
      else if (grade.score >= 60) gradeRanges['D (60-69)']++;
      else gradeRanges['F (0-59)']++;
    });

    const gradeDistribution = Object.entries(gradeRanges).map(([name, value]) => ({ name, value }));

    // Attendance overview
    const attendanceCounts = {
      'Present': 0,
      'Absent': 0,
      'Late': 0
    };

    attendanceRecords.forEach(record => {
      if (record.status === 'present') attendanceCounts['Present']++;
      else if (record.status === 'absent') attendanceCounts['Absent']++;
      else if (record.status === 'late') attendanceCounts['Late']++;
    });

    const attendanceOverview = Object.entries(attendanceCounts).map(([name, value]) => ({ name, value }));

    // Assignment completion stats
    const assignmentCounts = {
      'Completed': 0,
      'In Progress': 0,
      'Not Started': 0
    };

    assignments.forEach(assignment => {
      assignment.studentCompletions.forEach(completion => {
        if (completion.status === 'completed') assignmentCounts['Completed']++;
        else if (completion.status === 'in-progress') assignmentCounts['In Progress']++;
        else if (completion.status === 'not-started') assignmentCounts['Not Started']++;
      });
    });

    const assignmentCompletion = Object.entries(assignmentCounts).map(([name, value]) => ({ name, value }));

    setAnalyticsData({
      gradeDistribution,
      attendanceOverview,
      assignmentCompletion
    });
  }, [grades, attendanceRecords, assignments]);

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && currentModal) {
        setCurrentModal(null);
        setEditItem(null);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [currentModal]);

  // Helper functions
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy');
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Filter functions
  const getFilteredStudents = (): Student[] => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredAssignments = (): Assignment[] => {
    let filtered = assignments;

    if (filterStatus.assignments !== 'all') {
      filtered = filtered.filter(assignment => {
        const hasStatus = assignment.studentCompletions.some(
          completion => completion.status === filterStatus.assignments
        );
        return hasStatus;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredAttendance = (): AttendanceRecord[] => {
    let filtered = attendanceRecords;

    if (filterStatus.attendance !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus.attendance);
    }

    if (searchQuery && selectedStudent === null) {
      filtered = filtered.filter(record => {
        const student = students.find(s => s.id === record.studentId);
        return student && student.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedStudent) {
      filtered = filtered.filter(record => record.studentId === selectedStudent.id);
    }

    return filtered;
  };

  // Student operations
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setStudents([...students, newStudent]);
    setCurrentModal(null);
  };

  const updateStudent = (studentId: string, data: Partial<Student>) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, ...data } : student
    ));
    setCurrentModal(null);
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, ...data });
    }
  };

  const deleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all their grades, attendance records, and assignment completions.')) {
      setStudents(students.filter(student => student.id !== studentId));
      setGrades(grades.filter(grade => grade.studentId !== studentId));
      setAttendanceRecords(attendanceRecords.filter(record => record.studentId !== studentId));
      
      // Remove this student from assignment completions
      setAssignments(assignments.map(assignment => ({
        ...assignment,
        studentCompletions: assignment.studentCompletions.filter(
          completion => completion.studentId !== studentId
        )
      })));

      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(null);
        setActiveTab('students');
      }
    }
  };

  // Grade operations
  const addGrade = (data: Omit<Grade, 'id'>) => {
    const newGrade: Grade = {
      ...data,
      id: generateId()
    };
    setGrades([...grades, newGrade]);
    setCurrentModal(null);
  };

  const updateGrade = (gradeId: string, data: Partial<Grade>) => {
    setGrades(grades.map(grade => 
      grade.id === gradeId ? { ...grade, ...data } : grade
    ));
    setCurrentModal(null);
  };

  const deleteGrade = (gradeId: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(grade => grade.id !== gradeId));
    }
  };

  // Attendance operations
  const addAttendance = (data: Omit<AttendanceRecord, 'id'>) => {
    // Check if record for this student and date already exists
    const existingRecord = attendanceRecords.find(
      record => record.studentId === data.studentId && record.date === data.date
    );

    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(attendanceRecords.map(record => 
        (record.studentId === data.studentId && record.date === data.date) 
          ? { ...record, status: data.status, notes: data.notes } 
          : record
      ));
      alert('Attendance record for this student on this date already exists. It has been updated.');
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        ...data,
        id: generateId()
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
    
    setCurrentModal(null);
  };

  const updateAttendance = (recordId: string, data: Partial<AttendanceRecord>) => {
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === recordId ? { ...record, ...data } : record
    ));
    setCurrentModal(null);
  };

  const deleteAttendance = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      setAttendanceRecords(attendanceRecords.filter(record => record.id !== recordId));
    }
  };

  // Assignment operations
  const addAssignment = (data: Omit<Assignment, 'id' | 'studentCompletions'>) => {
    const studentCompletions = students.map(student => ({
      studentId: student.id,
      status: 'not-started' as const
    }));

    const newAssignment: Assignment = {
      ...data,
      id: generateId(),
      studentCompletions
    };

    setAssignments([...assignments, newAssignment]);
    setCurrentModal(null);
  };

  const updateAssignment = (assignmentId: string, data: Partial<Omit<Assignment, 'studentCompletions'>>) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === assignmentId ? { ...assignment, ...data } : assignment
    ));
    setCurrentModal(null);
  };

  const updateAssignmentStatus = (assignmentId: string, studentId: string, status: 'completed' | 'in-progress' | 'not-started') => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          studentCompletions: assignment.studentCompletions.map(completion => 
            completion.studentId === studentId 
              ? { 
                  ...completion, 
                  status, 
                  submittedDate: status === 'completed' ? new Date().toISOString() : completion.submittedDate 
                } 
              : completion
          )
        };
      }
      return assignment;
    }));
  };

  const deleteAssignment = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
    }
  };

  // Data import/export functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContents = e.target?.result as string;
        let importedData: any;

        // Handle different file types
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(fileContents);
        } else if (file.name.endsWith('.csv')) {
          importedData = parseCSV(fileContents);
        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
          alert('Excel files need to be converted to CSV or JSON first.');
          return;
        } else {
          alert('Unsupported file format. Please use JSON or CSV.');
          return;
        }

        if (typeof importedData !== 'object') {
          throw new Error('Invalid data format');
        }

        // Process the imported data based on current tab
        if (importedData.students && activeTab === 'students') {
          processImportedStudents(importedData.students);
        } else if (importedData.grades && activeTab === 'grades') {
          processImportedGrades(importedData.grades);
        } else if (importedData.attendance && activeTab === 'attendance') {
          processImportedAttendance(importedData.attendance);
        } else if (importedData.assignments && activeTab === 'assignments') {
          processImportedAssignments(importedData.assignments);
        } else {
          alert('No valid data found for the current section.');
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

      } catch (error) {
        console.error('Error importing data:', error);
        alert(`Error importing data: ${(error as Error).message}`);
      }
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): any => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const obj: any = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      
      result.push(obj);
    }

    // Try to determine the type of data based on headers
    if (headers.includes('name') && headers.includes('email')) {
      return { students: result };
    } else if (headers.includes('studentId') && headers.includes('subject') && headers.includes('score')) {
      return { grades: result };
    } else if (headers.includes('studentId') && headers.includes('date') && headers.includes('status')) {
      return { attendance: result };
    } else if (headers.includes('title') && headers.includes('description') && headers.includes('dueDate')) {
      return { assignments: result };
    }

    return { data: result };
  };

  // Process imported data
  const processImportedStudents = (importedStudents: any[]) => {
    try {
      const newStudents = importedStudents.map(student => ({
        id: student.id || generateId(),
        name: student.name || 'Unknown',
        email: student.email || '',
        phone: student.phone || '',
        grade: student.grade || '',
        createdAt: student.createdAt || new Date().toISOString()
      }));

      // Merge with existing students - update if ID exists, add if new
      const mergedStudents = [...students];
      
      newStudents.forEach(newStudent => {
        const existingIndex = mergedStudents.findIndex(s => s.id === newStudent.id);
        if (existingIndex >= 0) {
          mergedStudents[existingIndex] = newStudent;
        } else {
          mergedStudents.push(newStudent);
        }
      });

      setStudents(mergedStudents);
      alert(`Successfully imported/updated ${newStudents.length} students.`);
    } catch (error) {
      console.error('Error processing student data:', error);
      alert(`Error processing student data: ${(error as Error).message}`);
    }
  };

  const processImportedGrades = (importedGrades: any[]) => {
    try {
      const newGrades = importedGrades.map(grade => ({
        id: grade.id || generateId(),
        studentId: grade.studentId,
        subject: grade.subject || 'Unknown',
        score: Number(grade.score) || 0,
        date: grade.date || new Date().toISOString()
      }));

      // Validate student IDs
      const invalidGrades = newGrades.filter(grade => 
        !students.some(student => student.id === grade.studentId)
      );

      if (invalidGrades.length > 0) {
        alert(`Warning: ${invalidGrades.length} grades reference unknown students and will be skipped.`);
      }

      const validGrades = newGrades.filter(grade => 
        students.some(student => student.id === grade.studentId)
      );

      // Merge with existing grades
      const mergedGrades = [...grades];
      
      validGrades.forEach(newGrade => {
        const existingIndex = mergedGrades.findIndex(g => g.id === newGrade.id);
        if (existingIndex >= 0) {
          mergedGrades[existingIndex] = newGrade;
        } else {
          mergedGrades.push(newGrade);
        }
      });

      setGrades(mergedGrades);
      alert(`Successfully imported/updated ${validGrades.length} grades.`);
    } catch (error) {
      console.error('Error processing grade data:', error);
      alert(`Error processing grade data: ${(error as Error).message}`);
    }
  };

  const processImportedAttendance = (importedAttendance: any[]) => {
    try {
      const newRecords = importedAttendance.map(record => ({
        id: record.id || generateId(),
        studentId: record.studentId,
        date: record.date || new Date().toISOString(),
        status: (record.status === 'present' || record.status === 'absent' || record.status === 'late') 
          ? record.status 
          : 'present',
        notes: record.notes || ''
      }));

      // Validate student IDs
      const invalidRecords = newRecords.filter(record => 
        !students.some(student => student.id === record.studentId)
      );

      if (invalidRecords.length > 0) {
        alert(`Warning: ${invalidRecords.length} attendance records reference unknown students and will be skipped.`);
      }

      const validRecords = newRecords.filter(record => 
        students.some(student => student.id === record.studentId)
      );

      // Merge with existing records
      const mergedRecords = [...attendanceRecords];
      
      validRecords.forEach(newRecord => {
        const existingIndex = mergedRecords.findIndex(r => r.id === newRecord.id);
        if (existingIndex >= 0) {
          mergedRecords[existingIndex] = newRecord;
        } else {
          mergedRecords.push(newRecord);
        }
      });

      setAttendanceRecords(mergedRecords);
      alert(`Successfully imported/updated ${validRecords.length} attendance records.`);
    } catch (error) {
      console.error('Error processing attendance data:', error);
      alert(`Error processing attendance data: ${(error as Error).message}`);
    }
  };

  const processImportedAssignments = (importedAssignments: any[]) => {
    try {
      const newAssignments = importedAssignments.map(assignment => {
        // Parse studentCompletions or create default ones for all students
        let studentCompletions = assignment.studentCompletions || [];
        
        if (!Array.isArray(studentCompletions) || studentCompletions.length === 0) {
          studentCompletions = students.map(student => ({
            studentId: student.id,
            status: 'not-started' as const
          }));
        }

        return {
          id: assignment.id || generateId(),
          title: assignment.title || 'Unnamed Assignment',
          description: assignment.description || '',
          dueDate: assignment.dueDate || new Date().toISOString(),
          studentCompletions
        };
      });

      // Merge with existing assignments
      const mergedAssignments = [...assignments];
      
      newAssignments.forEach(newAssignment => {
        const existingIndex = mergedAssignments.findIndex(a => a.id === newAssignment.id);
        if (existingIndex >= 0) {
          mergedAssignments[existingIndex] = newAssignment;
        } else {
          mergedAssignments.push(newAssignment);
        }
      });

      setAssignments(mergedAssignments);
      alert(`Successfully imported/updated ${newAssignments.length} assignments.`);
    } catch (error) {
      console.error('Error processing assignment data:', error);
      alert(`Error processing assignment data: ${(error as Error).message}`);
    }
  };

  // Export current data as JSON
  const exportData = () => {
    let dataToExport: any = {};
    
    if (activeTab === 'students') {
      dataToExport = { students };
    } else if (activeTab === 'grades') {
      dataToExport = { grades };
    } else if (activeTab === 'attendance') {
      dataToExport = { attendance: attendanceRecords };
    } else if (activeTab === 'assignments') {
      dataToExport = { assignments };
    } else if (activeTab === 'dashboard') {
      dataToExport = { students, grades, attendance: attendanceRecords, assignments };
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-tracker-${activeTab}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export template function
  const exportTemplate = () => {
    let template: any = {};
    
    if (activeTab === 'students') {
      template = {
        students: [
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
            grade: '10th'
          }
        ]
      };
    } else if (activeTab === 'grades') {
      template = {
        grades: [
          {
            studentId: '[student_id_here]',
            subject: 'Math',
            score: 85,
            date: new Date().toISOString()
          }
        ]
      };
    } else if (activeTab === 'attendance') {
      template = {
        attendance: [
          {
            studentId: '[student_id_here]',
            date: new Date().toISOString(),
            status: 'present',
            notes: ''
          }
        ]
      };
    } else if (activeTab === 'assignments') {
      template = {
        assignments: [
          {
            title: 'Sample Assignment',
            description: 'Description of the assignment',
            dueDate: new Date().toISOString()
          }
        ]
      };
    }
    
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-tracker-${activeTab}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Form components
  const StudentForm = ({ defaultValues }: { defaultValues?: Partial<Student> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Student>({
      defaultValues: defaultValues || {
        id: '',
        name: '',
        email: '',
        phone: '',
        grade: '',
        createdAt: ''
      }
    });

    const onSubmit = (data: any) => {
      if (defaultValues?.id) {
        updateStudent(defaultValues.id, data);
      } else {
        addStudent(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            id="name"
            type="text"
            className="input"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            id="phone"
            type="tel"
            className="input"
            {...register('phone')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="grade" className="form-label">Grade/Class</label>
          <input
            id="grade"
            type="text"
            className="input"
            {...register('grade')}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Student
          </button>
        </div>
      </form>
    );
  };

  const GradeForm = ({ defaultValues }: { defaultValues?: Partial<Grade> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Grade>({
      defaultValues: defaultValues || {
        id: '',
        studentId: selectedStudent?.id || '',
        subject: '',
        score: 0,
        date: new Date().toISOString().split('T')[0]
      }
    });

    const onSubmit = (data: any) => {
      // Convert score to number
      data.score = Number(data.score);
      
      if (defaultValues?.id) {
        updateGrade(defaultValues.id, data);
      } else {
        addGrade(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!selectedStudent && (
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">Student</label>
            <select
              id="studentId"
              className="input"
              {...register('studentId', { required: 'Student is required' })}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {errors.studentId && <p className="form-error">{errors.studentId.message}</p>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input
            id="subject"
            type="text"
            className="input"
            {...register('subject', { required: 'Subject is required' })}
          />
          {errors.subject && <p className="form-error">{errors.subject.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="score" className="form-label">Score</label>
          <input
            id="score"
            type="number"
            min="0"
            max="100"
            className="input"
            {...register('score', { 
              required: 'Score is required',
              min: { value: 0, message: 'Score must be at least 0' },
              max: { value: 100, message: 'Score cannot exceed 100' }
            })}
          />
          {errors.score && <p className="form-error">{errors.score.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Grade
          </button>
        </div>
      </form>
    );
  };

  const AttendanceForm = ({ defaultValues }: { defaultValues?: Partial<AttendanceRecord> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<AttendanceRecord>({
      defaultValues: defaultValues || {
        id: '',
        studentId: selectedStudent?.id || '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        notes: ''
      }
    });

    const onSubmit = (data: any) => {
      if (defaultValues?.id) {
        updateAttendance(defaultValues.id, data);
      } else {
        addAttendance(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!selectedStudent && (
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">Student</label>
            <select
              id="studentId"
              className="input"
              {...register('studentId', { required: 'Student is required' })}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {errors.studentId && <p className="form-error">{errors.studentId.message}</p>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            id="status"
            className="input"
            {...register('status', { required: 'Status is required' })}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
          {errors.status && <p className="form-error">{errors.status.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            id="notes"
            className="input"
            rows={3}
            placeholder="Optional notes about the attendance..."
            {...register('notes')}
          ></textarea>
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Attendance
          </button>
        </div>
      </form>
    );
  };

  const AssignmentForm = ({ defaultValues }: { defaultValues?: Partial<Assignment> }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Omit<Assignment, 'id' | 'studentCompletions'>>(
      {
        defaultValues: defaultValues || {
          title: '',
          description: '',
          dueDate: new Date().toISOString().split('T')[0]
        }
      }
    );

    const onSubmit = (data: any) => {
      if (defaultValues?.id) {
        updateAssignment(defaultValues.id, data);
      } else {
        addAssignment(data);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            id="title"
            type="text"
            className="input"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="input"
            rows={3}
            {...register('description')}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">Due Date</label>
          <input
            id="dueDate"
            type="date"
            className="input"
            {...register('dueDate', { required: 'Due date is required' })}
          />
          {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => { 
              setCurrentModal(null); 
              setEditItem(null); 
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {defaultValues?.id ? 'Update' : 'Add'} Assignment
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid mx-auto py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Book className="h-6 w-6" />
              Student Progress Tracker
            </h1>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search..."
                className="input input-sm hidden md:block"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hidden md:flex items-center justify-center gap-1"
                onClick={exportData}
              >
                <Download className="h-4 w-4" /> Export
              </button>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hidden md:flex items-center justify-center gap-1"
                onClick={exportTemplate}
              >
                <FileText className="h-4 w-4" /> Template
              </button>
              <label className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hidden md:flex items-center justify-center gap-1 cursor-pointer">
                <Upload className="h-4 w-4" /> Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {/* Mobile search bar */}
          {isMobileMenuOpen && (
            <div className="mt-3 md:hidden">
              <input
                type="text"
                placeholder="Search..."
                className="input w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex justify-between mt-2 gap-2">
                <button 
                  className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 flex items-center justify-center gap-1"
                  onClick={exportData}
                >
                  <Download className="h-4 w-4" /> Export
                </button>
                <button 
                  className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 flex items-center justify-center gap-1"
                  onClick={exportTemplate}
                >
                  <FileText className="h-4 w-4" /> Template
                </button>
                <label className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 flex items-center justify-center gap-1 cursor-pointer">
                  <Upload className="h-4 w-4" /> Import
                  <input
                    type="file"
                    accept=".json,.csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto space-x-4 mt-4 pb-1">
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('dashboard');
                setSelectedStudent(null);
              }}
            >
              Dashboard
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'students' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('students');
                setSelectedStudent(null);
              }}
            >
              Students
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'grades' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('grades');
                setSelectedStudent(null);
              }}
            >
              Grades
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('attendance');
                setSelectedStudent(null);
              }}
            >
              Attendance
            </button>
            <button
              className={`inline-flex items-center px-1 py-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'assignments' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('assignments');
                setSelectedStudent(null);
              }}
            >
              Assignments
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid mx-auto py-6">
        {/* Back to list button when viewing student details */}
        {selectedStudent && (
          <button
            className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 mb-4 flex items-center gap-1"
            onClick={() => {
              setSelectedStudent(null);
              setActiveTab('students');
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Students
          </button>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Dashboard</h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Students</h3>
                  <User className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{students.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total enrolled students</p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Grades</h3>
                  <FileText className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{grades.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total grades recorded</p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Attendance</h3>
                  <Calendar className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{attendanceRecords.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total attendance records</p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Assignments</h3>
                  <Book className="h-5 w-5 text-primary-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{assignments.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total assignments</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Grade Distribution</h3>
                {analyticsData.gradeDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#4f46e5" name="Number of Grades" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No grade data available</p>
                  </div>
                )}
              </div>

              {/* Attendance Overview Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Attendance Overview</h3>
                {analyticsData.attendanceOverview.length > 0 && analyticsData.attendanceOverview.some(item => item.value > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.attendanceOverview}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="present" fill="#10b981" />
                          <Cell key="absent" fill="#ef4444" />
                          <Cell key="late" fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No attendance data available</p>
                  </div>
                )}
              </div>

              {/* Assignment Status Chart */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Assignment Completion</h3>
                {analyticsData.assignmentCompletion.length > 0 && analyticsData.assignmentCompletion.some(item => item.value > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.assignmentCompletion}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="completed" fill="#10b981" />
                          <Cell key="in-progress" fill="#f59e0b" />
                          <Cell key="not-started" fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No assignment data available</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="card shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Activity</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {/* Recent Grades */}
                  {grades.slice(0, 3).map(grade => {
                    const student = students.find(s => s.id === grade.studentId);
                    return (
                      <div key={grade.id} className="flex items-start p-3 border rounded-md border-gray-200 dark:border-gray-700">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student?.name || 'Unknown Student'} - {grade.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Score: {grade.score} - {formatDate(grade.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Recent Attendance */}
                  {attendanceRecords.slice(0, 3).map(record => {
                    const student = students.find(s => s.id === record.studentId);
                    return (
                      <div key={record.id} className="flex items-start p-3 border rounded-md border-gray-200 dark:border-gray-700">
                        <div className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student?.name || 'Unknown Student'} - {record.status}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(record.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* If no recent activity */}
                  {grades.length === 0 && attendanceRecords.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && !selectedStudent && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Students</h2>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setCurrentModal('addStudent')}
              >
                <Plus className="h-4 w-4" /> Add Student
              </button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No students found</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addStudent')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Student
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredStudents().map(student => (
                  <div key={student.id} className="card shadow-sm hover:shadow transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{student.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        {student.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{student.phone}</p>}
                        {student.grade && <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {student.grade}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedStudent(student);
                            setActiveTab('student-details');
                          }} 
                          className="text-gray-500 hover:text-primary-500 transition-colors"
                          aria-label="View student details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditItem(student);
                            setCurrentModal('editStudent');
                          }} 
                          className="text-gray-500 hover:text-primary-500 transition-colors"
                          aria-label="Edit student"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)} 
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          aria-label="Delete student"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Grades</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {grades.filter(g => g.studentId === student.id).length}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {attendanceRecords.filter(r => r.studentId === student.id).length}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assignments.reduce((total, assignment) => {
                              const completion = assignment.studentCompletions.find(c => c.studentId === student.id);
                              return total + (completion?.status === 'completed' ? 1 : 0);
                            }, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Details */}
        {activeTab === 'student-details' && selectedStudent && (
          <div className="space-y-6">
            <div className="card shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
                  {selectedStudent.phone && <p className="text-gray-500 dark:text-gray-400">Phone: {selectedStudent.phone}</p>}
                  {selectedStudent.grade && <p className="text-gray-500 dark:text-gray-400">Grade: {selectedStudent.grade}</p>}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setEditItem(selectedStudent);
                      setCurrentModal('editStudent');
                    }} 
                    className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button 
                    onClick={() => deleteStudent(selectedStudent.id)} 
                    className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Grades Section */}
            <div className="card shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Grades</h3>
                <button
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  onClick={() => setCurrentModal('addGrade')}
                >
                  <Plus className="h-4 w-4" /> Add Grade
                </button>
              </div>

              {grades.filter(grade => grade.studentId === selectedStudent.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No grades recorded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {grades
                        .filter(grade => grade.studentId === selectedStudent.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(grade => (
                          <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{grade.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getScoreClass(grade.score)}`}>
                                {grade.score}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(grade.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(grade);
                                  setCurrentModal('editGrade');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteGrade(grade.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Attendance Section */}
            <div className="card shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attendance</h3>
                <button
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  onClick={() => setCurrentModal('addAttendance')}
                >
                  <Plus className="h-4 w-4" /> Add Attendance
                </button>
              </div>

              {attendanceRecords.filter(record => record.studentId === selectedStudent.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No attendance records</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {attendanceRecords
                        .filter(record => record.studentId === selectedStudent.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(record => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(record.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(record.status)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.notes || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(record);
                                  setCurrentModal('editAttendance');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAttendance(record.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assignments Section */}
            <div className="card shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignments</h3>

              {assignments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No assignments available</p>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => {
                    const completion = assignment.studentCompletions.find(
                      completion => completion.studentId === selectedStudent.id
                    );
                    return (
                      <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{assignment.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {formatDate(assignment.dueDate)}</p>
                          </div>
                          <div>
                            <select
                              className="input input-sm"
                              value={completion?.status || 'not-started'}
                              onChange={(e) => updateAssignmentStatus(
                                assignment.id, 
                                selectedStudent.id, 
                                e.target.value as 'completed' | 'in-progress' | 'not-started'
                              )}
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        {completion?.status === 'completed' && completion.submittedDate && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Completed on {formatDate(completion.submittedDate)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades */}
        {activeTab === 'grades' && !selectedStudent && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grades</h2>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setCurrentModal('addGrade')}
                disabled={students.length === 0}
              >
                <Plus className="h-4 w-4" /> Add Grade
              </button>
            </div>

            {students.length === 0 ? (
              <div className="alert alert-warning">
                <p>You need to add students before you can record grades.</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No grades recorded</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addGrade')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Grade
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {grades
                      .filter(grade => {
                        if (!searchQuery) return true;
                        const student = students.find(s => s.id === grade.studentId);
                        return student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               grade.subject.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(grade => {
                        const student = students.find(s => s.id === grade.studentId);
                        return (
                          <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <button
                                className="text-primary-600 hover:underline"
                                onClick={() => {
                                  const student = students.find(s => s.id === grade.studentId);
                                  if (student) {
                                    setSelectedStudent(student);
                                    setActiveTab('student-details');
                                  }
                                }}
                              >
                                {student?.name || 'Unknown Student'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{grade.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getScoreClass(grade.score)}`}>
                                {grade.score}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(grade.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(grade);
                                  setCurrentModal('editGrade');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteGrade(grade.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Attendance */}
        {activeTab === 'attendance' && !selectedStudent && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <select
                    className="input input-sm pl-8"
                    value={filterStatus.attendance}
                    onChange={(e) => setFilterStatus({ 
                      ...filterStatus, 
                      attendance: e.target.value 
                    })}
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                  <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => setCurrentModal('addAttendance')}
                  disabled={students.length === 0}
                >
                  <Plus className="h-4 w-4" /> Add Attendance
                </button>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="alert alert-warning">
                <p>You need to add students before you can record attendance.</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No attendance records</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addAttendance')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Attendance Record
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {getFilteredAttendance()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(record => {
                        const student = students.find(s => s.id === record.studentId);
                        return (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <button
                                className="text-primary-600 hover:underline"
                                onClick={() => {
                                  const student = students.find(s => s.id === record.studentId);
                                  if (student) {
                                    setSelectedStudent(student);
                                    setActiveTab('student-details');
                                  }
                                }}
                              >
                                {student?.name || 'Unknown Student'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(record.status)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{record.notes || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditItem(record);
                                  setCurrentModal('editAttendance');
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAttendance(record.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Assignments */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assignments</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <select
                    className="input input-sm pl-8"
                    value={filterStatus.assignments}
                    onChange={(e) => setFilterStatus({ 
                      ...filterStatus, 
                      assignments: e.target.value 
                    })}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="not-started">Not Started</option>
                  </select>
                  <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => setCurrentModal('addAssignment')}
                >
                  <Plus className="h-4 w-4" /> Add Assignment
                </button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No assignments</p>
                <button 
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  onClick={() => setCurrentModal('addAssignment')}
                >
                  <Plus className="h-4 w-4" /> Add Your First Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredAssignments().map(assignment => (
                  <div key={assignment.id} className="card shadow-sm hover:shadow transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {formatDate(assignment.dueDate)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditItem(assignment);
                            setCurrentModal('editAssignment');
                          }} 
                          className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button 
                          onClick={() => deleteAssignment(assignment.id)} 
                          className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>

                    {assignment.description && (
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{assignment.description}</p>
                    )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Progress</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {assignment.studentCompletions
                              .filter(completion => {
                                if (!searchQuery) return true;
                                const student = students.find(s => s.id === completion.studentId);
                                return student?.name.toLowerCase().includes(searchQuery.toLowerCase());
                              })
                              .map(completion => {
                                const student = students.find(s => s.id === completion.studentId);
                                if (!student) return null;
                                return (
                                  <tr key={`${assignment.id}-${completion.studentId}`}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      <button
                                        className="text-primary-600 hover:underline"
                                        onClick={() => {
                                          setSelectedStudent(student);
                                          setActiveTab('student-details');
                                        }}
                                      >
                                        {student?.name}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCompletionClass(completion.status)}`}>
                                        {completion.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                                        {completion.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                                        {completion.status === 'not-started' && <XCircle className="h-3 w-3 mr-1" />}
                                        {formatStatus(completion.status)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {completion.submittedDate ? formatDate(completion.submittedDate) : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <select
                                        className="input input-sm"
                                        value={completion.status}
                                        onChange={(e) => updateAssignmentStatus(
                                          assignment.id, 
                                          completion.studentId, 
                                          e.target.value as 'completed' | 'in-progress' | 'not-started'
                                        )}
                                      >
                                        <option value="not-started">Not Started</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                      </select>
                                    </td>
                                  </tr>
                                );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
        <div className="container-fluid mx-auto py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {currentModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => {
            setCurrentModal(null);
            setEditItem(null);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentModal === 'addStudent' && 'Add Student'}
                  {currentModal === 'editStudent' && 'Edit Student'}
                  {currentModal === 'addGrade' && 'Add Grade'}
                  {currentModal === 'editGrade' && 'Edit Grade'}
                  {currentModal === 'addAttendance' && 'Add Attendance'}
                  {currentModal === 'editAttendance' && 'Edit Attendance'}
                  {currentModal === 'addAssignment' && 'Add Assignment'}
                  {currentModal === 'editAssignment' && 'Edit Assignment'}
                </h2>
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => {
                    setCurrentModal(null);
                    setEditItem(null);
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {(currentModal === 'addStudent' || currentModal === 'editStudent') && (
                <StudentForm defaultValues={editItem} />
              )}

              {(currentModal === 'addGrade' || currentModal === 'editGrade') && (
                <GradeForm defaultValues={editItem} />
              )}

              {(currentModal === 'addAttendance' || currentModal === 'editAttendance') && (
                <AttendanceForm defaultValues={editItem} />
              )}

              {(currentModal === 'addAssignment' || currentModal === 'editAssignment') && (
                <AssignmentForm defaultValues={editItem} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for styling
const getScoreClass = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (score >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  if (score >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

const getStatusClass = (status: string): string => {
  if (status === 'present') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status === 'late') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

const getCompletionClass = (status: string): string => {
  if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': return 'In Progress';
    case 'not-started': return 'Not Started';
    default: return status;
  }
};

export default App;