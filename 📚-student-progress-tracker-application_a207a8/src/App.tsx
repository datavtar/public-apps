import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, isValid, parse } from 'date-fns';
import { 
    User, UserPlus, Edit, Trash2, Search, Filter, ArrowUp, ArrowDown, Check, X, 
    Calendar, BookOpen, Target, Upload, Download, Sun, Moon, Save, AlertCircle, GraduationCap, FileText, History, 
    ArrowDownUp, // Added import
    Plus // Added import
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Type Definitions
type Grade = {
  id: string;
  assignmentName: string;
  score: number;
  total: number;
  date: string; // ISO string format
};

type AttendanceStatus = 'present' | 'absent' | 'late';

type AttendanceRecord = {
  id: string;
  date: string; // ISO string format
  status: AttendanceStatus;
};

type HomeworkRecord = {
  id: string;
  assignmentName: string;
  date: string; // ISO string format
  completed: boolean;
};

type Student = {
  id: string;
  name: string;
  grades: Grade[];
  attendance: AttendanceRecord[];
  homework: HomeworkRecord[];
  goals: string;
};

type SortConfig = {
  key: keyof Student | 'averageGrade' | 'attendanceRate' | 'homeworkRate';
  direction: 'ascending' | 'descending';
} | null;

type ModalType = 
  | 'addStudent' 
  | 'editStudent' 
  | 'viewStudent' 
  | 'addGrade' 
  | 'editGrade' 
  | 'addAttendance' 
  | 'editAttendance' 
  | 'addHomework' 
  | 'editHomework' 
  | 'uploadFile'
  | null;

type ModalState = {
  type: ModalType;
  studentId?: string; // For actions related to a specific student
  recordId?: string; // For editing/deleting specific records (grade, attendance, homework)
};

// Helper Functions
const generateId = (): string => `_${Math.random().toString(36).substr(2, 9)}`;

const calculateAverageGrade = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const totalScore = grades.reduce((sum, grade) => sum + (grade.score / grade.total) * 100, 0);
  return parseFloat((totalScore / grades.length).toFixed(1));
};

const calculateAttendanceRate = (attendance: AttendanceRecord[]): number => {
  if (attendance.length === 0) return 100; // Assume 100% if no records yet
  const presentCount = attendance.filter(record => record.status === 'present' || record.status === 'late').length;
  return parseFloat(((presentCount / attendance.length) * 100).toFixed(1));
};

const calculateHomeworkCompletionRate = (homework: HomeworkRecord[]): number => {
  if (homework.length === 0) return 100; // Assume 100% if no records yet
  const completedCount = homework.filter(record => record.completed).length;
  return parseFloat(((completedCount / homework.length) * 100).toFixed(1));
};

// Sample Data (used if local storage is empty)
const initialStudentsData: Student[] = [
  {
    id: generateId(),
    name: 'Alice Wonderland',
    grades: [
      { id: generateId(), assignmentName: 'Math Quiz 1', score: 8, total: 10, date: new Date(2024, 8, 15).toISOString() },
      { id: generateId(), assignmentName: 'History Essay', score: 88, total: 100, date: new Date(2024, 8, 20).toISOString() },
    ],
    attendance: [
      { id: generateId(), date: new Date(2024, 8, 1).toISOString(), status: 'present' },
      { id: generateId(), date: new Date(2024, 8, 2).toISOString(), status: 'present' },
      { id: generateId(), date: new Date(2024, 8, 3).toISOString(), status: 'absent' },
    ],
    homework: [
      { id: generateId(), assignmentName: 'Math Problems Ch1', date: new Date(2024, 8, 10).toISOString(), completed: true },
      { id: generateId(), assignmentName: 'Reading Ch2', date: new Date(2024, 8, 17).toISOString(), completed: false },
    ],
    goals: 'Improve essay writing skills and math quiz scores.',
  },
  {
    id: generateId(),
    name: 'Bob The Builder',
    grades: [
        { id: generateId(), assignmentName: 'Science Project', score: 9, total: 10, date: new Date(2024, 8, 18).toISOString() },
    ],
    attendance: [
        { id: generateId(), date: new Date(2024, 8, 1).toISOString(), status: 'present' },
        { id: generateId(), date: new Date(2024, 8, 2).toISOString(), status: 'late' },
        { id: generateId(), date: new Date(2024, 8, 3).toISOString(), status: 'present' },
    ],
    homework: [
        { id: generateId(), assignmentName: 'Build a Model', date: new Date(2024, 8, 12).toISOString(), completed: true },
    ],
    goals: 'Complete all homework on time.',
  },
];

// Theme Toggle Component
const ThemeToggle: React.FC<{ isDarkMode: boolean; toggleDarkMode: () => void }> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="theme-toggle focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
      name="theme-toggle"
    >
      <span className="sr-only">Toggle dark mode</span>
      <span className={`${styles.themeToggleIcon} ${isDarkMode ? styles.moonIcon : styles.sunIcon}`}>
        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
      </span>
      <span className={`theme-toggle-thumb ${isDarkMode ? styles.thumbDark : styles.thumbLight}`}></span>
    </button>
  );
};

// Main App Component
function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Local Storage Effects ---
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('studentData');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        setStudents(initialStudentsData); // Initialize with sample data if none exists
      }
    } catch (err) {
      console.error("Error loading data from localStorage:", err);
      setError("Failed to load student data. Please clear local storage or contact support.");
      setStudents(initialStudentsData); // Fallback to initial data on error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { // Avoid saving initial empty/loading state
      try {
        localStorage.setItem('studentData', JSON.stringify(students));
      } catch (err) {
        console.error("Error saving data to localStorage:", err);
        setError("Failed to save student data. Changes might not persist.");
      }
    }
  }, [students, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // --- Modal Management ---
  const openModal = useCallback((type: ModalType, studentId?: string, recordId?: string) => {
    setModalState({ type, studentId, recordId });
    document.body.classList.add('modal-open');
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null });
    document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
          closeModal();
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
        window.removeEventListener('keydown', handleEsc);
    };
 }, [closeModal]);

  // --- CRUD Operations ---
  const addStudent = (name: string, goals: string) => {
    const newStudent: Student = { id: generateId(), name, goals, grades: [], attendance: [], homework: [] };
    setStudents(prev => [...prev, newStudent]);
    closeModal();
  };

  const updateStudent = (id: string, name: string, goals: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name, goals } : s));
    closeModal();
  };

  const deleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student and all their records?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      closeModal(); // Close the view modal if the student was deleted from there
    }
  };

  const addGrade = (studentId: string, grade: Omit<Grade, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grades: [...s.grades, { ...grade, id: generateId() }] } : s));
    closeModal();
  };

  const updateGrade = (studentId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grades: s.grades.map(g => g.id === gradeId ? { ...updatedGrade, id: gradeId } : g) } : s));
    closeModal();
  };

  const deleteGrade = (studentId: string, gradeId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grades: s.grades.filter(g => g.id !== gradeId) } : s));
  };

  // Similar functions for Attendance and Homework...
  const addAttendance = (studentId: string, record: Omit<AttendanceRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: [...s.attendance, { ...record, id: generateId() }] } : s));
    closeModal();
  };

  const updateAttendance = (studentId: string, recordId: string, updatedRecord: Omit<AttendanceRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: s.attendance.map(a => a.id === recordId ? { ...updatedRecord, id: recordId } : a) } : s));
    closeModal();
  };

  const deleteAttendance = (studentId: string, recordId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: s.attendance.filter(a => a.id !== recordId) } : s));
  };

  const addHomework = (studentId: string, record: Omit<HomeworkRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, homework: [...s.homework, { ...record, id: generateId() }] } : s));
    closeModal();
  };

  const updateHomework = (studentId: string, recordId: string, updatedRecord: Omit<HomeworkRecord, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, homework: s.homework.map(h => h.id === recordId ? { ...updatedRecord, id: recordId } : h) } : s));
    closeModal();
  };

  const deleteHomework = (studentId: string, recordId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, homework: s.homework.filter(h => h.id !== recordId) } : s));
  };

  // --- File Handling ---
  const generateCsvTemplate = (): string => {
    const header = 'studentName,assignmentName,score,total,attendanceDate(YYYY-MM-DD),attendanceStatus(present/absent/late),homeworkName,homeworkDate(YYYY-MM-DD),homeworkCompleted(true/false),studentGoal';
    // Add a sample row structure
    const sampleRow = 'Student Example Name,Sample Assignment,85,100,2024-09-01,present,Sample Homework,2024-09-02,true,Sample Goal'; 
    return `${header}\n${sampleRow}`;
};

  const downloadTemplate = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_data_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsv = (csvText: string): { studentsToAdd: Student[], errors: string[] } => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data: Record<string, any>[] = [];
    const errors: string[] = [];
    const expectedHeaders = ['studentName', 'assignmentName', 'score', 'total', 'attendanceDate(YYYY-MM-DD)', 'attendanceStatus(present/absent/late)', 'homeworkName', 'homeworkDate(YYYY-MM-DD)', 'homeworkCompleted(true/false)', 'studentGoal'];
    
    // Basic header validation
    if (headers.length !== expectedHeaders.length || !headers.every((h, i) => h === expectedHeaders[i])) {
        errors.push(`Invalid CSV header. Expected: ${expectedHeaders.join(',')}`);
        return { studentsToAdd: [], errors };
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Incorrect number of columns. Expected ${headers.length}, got ${values.length}.`);
            continue;
        }
        const rowData: Record<string, any> = {};
        headers.forEach((header, index) => {
            rowData[header] = values[index]?.trim() ?? '';
        });
        data.push(rowData);
    }

    const studentsMap: Record<string, Student> = {};

    data.forEach((row, index) => {
        const rowIndex = index + 2; // CSV row number (1-based, accounting for header)
        const studentName = row['studentName'];
        if (!studentName) {
            errors.push(`Row ${rowIndex}: Missing student name.`);
            return; // Skip this row
        }

        if (!studentsMap[studentName]) {
             // Try to find existing student first before creating new one
            const existingStudent = students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
            if (existingStudent) {
                studentsMap[studentName] = { ...existingStudent }; // Copy existing student to update
                 // Update goal if provided in this row and different from existing goal
                if (row['studentGoal'] && existingStudent.goals !== row['studentGoal']) {
                    studentsMap[studentName].goals = row['studentGoal'];
                }
            } else {
                studentsMap[studentName] = {
                    id: generateId(),
                    name: studentName,
                    grades: [],
                    attendance: [],
                    homework: [],
                    goals: row['studentGoal'] || '',
                };
            }
        }
         // Update goal if provided in this row for subsequent rows of the same student
        else if (row['studentGoal'] && studentsMap[studentName].goals !== row['studentGoal']) {
            studentsMap[studentName].goals = row['studentGoal'];
        }

        // Add Grade
        const assignmentName = row['assignmentName'];
        const scoreStr = row['score'];
        const totalStr = row['total'];
        if (assignmentName && scoreStr && totalStr) {
            const score = parseFloat(scoreStr);
            const total = parseFloat(totalStr);
            if (!isNaN(score) && !isNaN(total) && total > 0) {
                // Avoid adding duplicate grades based on name and score/total (simple check)
                if (!studentsMap[studentName].grades.some(g => g.assignmentName === assignmentName && g.score === score && g.total === total)) {
                    studentsMap[studentName].grades.push({
                        id: generateId(),
                        assignmentName,
                        score,
                        total,
                        date: new Date().toISOString(), // Use current date as placeholder
                    });
                }
            } else {
                errors.push(`Row ${rowIndex}: Invalid grade score/total ('${scoreStr}', '${totalStr}') for assignment '${assignmentName}'.`);
            }
        }

        // Add Attendance
        const attendanceDateStr = row['attendanceDate(YYYY-MM-DD)'];
        const attendanceStatus = row['attendanceStatus(present/absent/late)']?.toLowerCase() as AttendanceStatus;
        if (attendanceDateStr && ['present', 'absent', 'late'].includes(attendanceStatus)) {
            const attendanceDate = parse(attendanceDateStr, 'yyyy-MM-dd', new Date());
            if (isValid(attendanceDate)) {
                // Avoid adding duplicate attendance for the same date
                if (!studentsMap[studentName].attendance.some(a => format(parseISO(a.date), 'yyyy-MM-dd') === attendanceDateStr)) {
                     studentsMap[studentName].attendance.push({
                        id: generateId(),
                        date: attendanceDate.toISOString(),
                        status: attendanceStatus,
                    });
                }
            } else {
                errors.push(`Row ${rowIndex}: Invalid attendance date format ('${attendanceDateStr}'). Use YYYY-MM-DD.`);
            }
        } else if (attendanceDateStr && !attendanceStatus) {
            errors.push(`Row ${rowIndex}: Missing attendance status for date '${attendanceDateStr}'.`);
        } else if (attendanceDateStr && !['present', 'absent', 'late'].includes(attendanceStatus)) {
             errors.push(`Row ${rowIndex}: Invalid attendance status '${attendanceStatus}' for date '${attendanceDateStr}'. Must be 'present', 'absent', or 'late'.`);
        }

        // Add Homework
        const homeworkName = row['homeworkName'];
        const homeworkDateStr = row['homeworkDate(YYYY-MM-DD)'];
        const homeworkCompletedStr = row['homeworkCompleted(true/false)']?.toLowerCase();
        if (homeworkName && homeworkDateStr && (homeworkCompletedStr === 'true' || homeworkCompletedStr === 'false')) {
            const homeworkDate = parse(homeworkDateStr, 'yyyy-MM-dd', new Date());
            const completed = homeworkCompletedStr === 'true';
            if (isValid(homeworkDate)) {
                 // Avoid adding duplicate homework based on name and date
                 if (!studentsMap[studentName].homework.some(h => h.assignmentName === homeworkName && format(parseISO(h.date), 'yyyy-MM-dd') === homeworkDateStr)) {
                     studentsMap[studentName].homework.push({
                        id: generateId(),
                        assignmentName: homeworkName,
                        date: homeworkDate.toISOString(),
                        completed,
                    });
                 }
            } else {
                errors.push(`Row ${rowIndex}: Invalid homework date format ('${homeworkDateStr}'). Use YYYY-MM-DD.`);
            }
        } else if (homeworkName && homeworkDateStr && homeworkCompletedStr === undefined) {
             errors.push(`Row ${rowIndex}: Missing homework completion status for '${homeworkName}' on date '${homeworkDateStr}'.`);
        } else if (homeworkName && homeworkDateStr && homeworkCompletedStr !== 'true' && homeworkCompletedStr !== 'false') {
             errors.push(`Row ${rowIndex}: Invalid homework completion status '${homeworkCompletedStr}'. Must be 'true' or 'false'.`);
        }
    });

    const studentsToAdd = Object.values(studentsMap);
    return { studentsToAdd, errors };
};


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError('Failed to read the file.');
        return;
      }
      try {
        const { studentsToAdd, errors } = parseCsv(text);
        
        if (errors.length > 0) {
             // Show only first few errors for brevity
            setError(`CSV Parsing Errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...and more.' : ''}`);
             // Still add the students that could be parsed, merge with existing
             if (studentsToAdd.length > 0) {
                 setStudents(prevStudents => {
                    const updatedStudents = [...prevStudents];
                    studentsToAdd.forEach(newStudentData => {
                        const existingIndex = updatedStudents.findIndex(s => s.id === newStudentData.id || s.name.toLowerCase() === newStudentData.name.toLowerCase());
                        if (existingIndex !== -1) {
                            // Merge data intelligently: Keep existing ID, update name/goal, append new records only if not already present
                            const existing = updatedStudents[existingIndex];
                            const mergedStudent = { ...existing }; // Start with existing data
                            
                            // Update name/goal if provided in CSV
                            mergedStudent.name = newStudentData.name;
                            mergedStudent.goals = newStudentData.goals;

                            // Append new grades if not duplicate
                            newStudentData.grades.forEach(newGrade => {
                                if (!existing.grades.some(g => g.assignmentName === newGrade.assignmentName && g.score === newGrade.score && g.total === newGrade.total)) {
                                    mergedStudent.grades.push(newGrade);
                                }
                            });
                             // Append new attendance if not duplicate
                            newStudentData.attendance.forEach(newAtt => {
                                const newAttDateStr = format(parseISO(newAtt.date), 'yyyy-MM-dd');
                                if (!existing.attendance.some(a => format(parseISO(a.date), 'yyyy-MM-dd') === newAttDateStr)) {
                                    mergedStudent.attendance.push(newAtt);
                                }
                            });
                             // Append new homework if not duplicate
                            newStudentData.homework.forEach(newHw => {
                                const newHwDateStr = format(parseISO(newHw.date), 'yyyy-MM-dd');
                                if (!existing.homework.some(h => h.assignmentName === newHw.assignmentName && format(parseISO(h.date), 'yyyy-MM-dd') === newHwDateStr)) {
                                    mergedStudent.homework.push(newHw);
                                }
                            });

                            updatedStudents[existingIndex] = mergedStudent;
                        } else {
                            // Add as a completely new student
                            updatedStudents.push(newStudentData);
                        }
                    });
                    return updatedStudents;
                 });
                 alert("Data uploaded with some errors. Please review the error messages and the imported data.");
             } else {
                 alert("CSV parsing failed. Please check the errors and the file format.");
             }
        } else if (studentsToAdd.length > 0) {
             // Merge parsed students with existing ones
             setStudents(prevStudents => {
                const updatedStudents = [...prevStudents];
                studentsToAdd.forEach(newStudentData => {
                     const existingIndex = updatedStudents.findIndex(s => s.id === newStudentData.id || s.name.toLowerCase() === newStudentData.name.toLowerCase());
                     if (existingIndex !== -1) {
                          // Merge logic (same as above)
                          const existing = updatedStudents[existingIndex];
                          const mergedStudent = { ...existing };
                          mergedStudent.name = newStudentData.name;
                          mergedStudent.goals = newStudentData.goals;
                           newStudentData.grades.forEach(newGrade => {
                                if (!existing.grades.some(g => g.assignmentName === newGrade.assignmentName && g.score === newGrade.score && g.total === newGrade.total)) {
                                    mergedStudent.grades.push(newGrade);
                                }
                            });
                            newStudentData.attendance.forEach(newAtt => {
                                const newAttDateStr = format(parseISO(newAtt.date), 'yyyy-MM-dd');
                                if (!existing.attendance.some(a => format(parseISO(a.date), 'yyyy-MM-dd') === newAttDateStr)) {
                                    mergedStudent.attendance.push(newAtt);
                                }
                            });
                            newStudentData.homework.forEach(newHw => {
                                const newHwDateStr = format(parseISO(newHw.date), 'yyyy-MM-dd');
                                if (!existing.homework.some(h => h.assignmentName === newHw.assignmentName && format(parseISO(h.date), 'yyyy-MM-dd') === newHwDateStr)) {
                                    mergedStudent.homework.push(newHw);
                                }
                            });
                          updatedStudents[existingIndex] = mergedStudent;
                     } else {
                        updatedStudents.push(newStudentData);
                     }
                });
                return updatedStudents;
             });
            setError(null); // Clear previous errors
            alert('Student data uploaded successfully!');
            closeModal();
        } else {
             setError('No valid student data found in the file.');
        }
      } catch (err: any) {
        console.error("Error processing CSV:", err);
        setError(`An unexpected error occurred during file processing: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setError('Error reading the file.');
    };
    reader.readAsText(file);

    // Reset file input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // --- Filtering & Sorting Logic ---
  const sortedStudents = useMemo(() => {
    let sortableStudents = [...students];
    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case 'averageGrade':
            aValue = calculateAverageGrade(a.grades);
            bValue = calculateAverageGrade(b.grades);
            break;
          case 'attendanceRate':
            aValue = calculateAttendanceRate(a.attendance);
            bValue = calculateAttendanceRate(b.attendance);
            break;
          case 'homeworkRate':
            aValue = calculateHomeworkCompletionRate(a.homework);
            bValue = calculateHomeworkCompletionRate(b.homework);
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          default: // Should not happen with defined keys, but as fallback:
             aValue = a[sortConfig.key as keyof Student] as string | number;
             bValue = b[sortConfig.key as keyof Student] as string | number;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  const filteredAndSortedStudents = useMemo(() => {
    return sortedStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedStudents, searchTerm]);

  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortConfig['key']) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowDownUp size={14} className="ml-1 text-gray-400 dark:text-slate-500" />;
    }
    return sortConfig.direction === 'ascending' ? 
           <ArrowUp size={14} className="ml-1 text-primary-600 dark:text-primary-400" /> : 
           <ArrowDown size={14} className="ml-1 text-primary-600 dark:text-primary-400" />;
  };

  // --- UI Rendering Logic ---
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const selectedStudentData = useMemo(() => {
    return students.find(s => s.id === modalState.studentId);
  }, [students, modalState.studentId]);

  const renderStudentForm = (student?: Student) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const goals = formData.get('goals') as string;
      if (student?.id) {
        updateStudent(student.id, name, goals);
      } else {
        addStudent(name, goals);
      }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
                <label htmlFor="studentName" className="form-label">Student Name</label>
                <input 
                    id="studentName"
                    name="name"
                    type="text" 
                    className="input input-responsive" 
                    defaultValue={student?.name ?? ''} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="studentGoals" className="form-label">Goals/Targets</label>
                <textarea 
                    id="studentGoals"
                    name="goals"
                    className="input input-responsive" 
                    rows={3}
                    defaultValue={student?.goals ?? ''}
                />
            </div>
            <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Cancel</button>
                <button type="submit" className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                   <Save size={16} /> {student ? 'Save Changes' : 'Add Student'}
                </button>
            </div>
        </form>
    );
  };

  const renderRecordForm = (
    type: 'Grade' | 'Attendance' | 'Homework',
    studentId: string,
    record?: Grade | AttendanceRecord | HomeworkRecord
  ) => {
    const isEdit = !!record;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            if (type === 'Grade') {
                const assignmentName = formData.get('assignmentName') as string;
                const score = parseFloat(formData.get('score') as string);
                const total = parseFloat(formData.get('total') as string);
                const dateStr = formData.get('date') as string;
                const date = dateStr ? parseISO(dateStr).toISOString() : new Date().toISOString(); // Default to now if empty

                if (!assignmentName || isNaN(score) || isNaN(total) || total <= 0) {
                     setError("Please provide a valid assignment name, score, and positive total marks.");
                     return;
                }
                const gradeData = { assignmentName, score, total, date };
                if (isEdit && record?.id) updateGrade(studentId, record.id, gradeData);
                else addGrade(studentId, gradeData);

            } else if (type === 'Attendance') {
                const dateStr = formData.get('date') as string;
                const status = formData.get('status') as AttendanceStatus;
                const date = dateStr ? parseISO(dateStr).toISOString() : new Date().toISOString();
                if (!dateStr || !status || !['present', 'absent', 'late'].includes(status)) {
                     setError("Please provide a valid date and status (present, absent, late).");
                     return;
                }
                const attendanceData = { date, status };
                if (isEdit && record?.id) updateAttendance(studentId, record.id, attendanceData);
                else addAttendance(studentId, attendanceData);

            } else if (type === 'Homework') {
                 const assignmentName = formData.get('assignmentName') as string;
                 const dateStr = formData.get('date') as string;
                 const completed = formData.get('completed') === 'on'; // Checkbox value
                 const date = dateStr ? parseISO(dateStr).toISOString() : new Date().toISOString();
                 if (!assignmentName || !dateStr) {
                     setError("Please provide a valid assignment name and date.");
                     return;
                 }
                 const homeworkData = { assignmentName, date, completed };
                 if (isEdit && record?.id) updateHomework(studentId, record.id, homeworkData);
                 else addHomework(studentId, homeworkData);
            }
            setError(null); // Clear error on successful submission
        } catch (error) {
            console.error("Form submission error:", error);
            setError("An error occurred. Please check your input and try again.");
        }
    };

    const defaultDate = (record?.date ? format(parseISO(record.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'Grade' && (
                <>
                    <div className="form-group">
                        <label htmlFor="assignmentName" className="form-label">Assignment Name</label>
                        <input id="assignmentName" name="assignmentName" type="text" className="input input-responsive" defaultValue={(record as Grade)?.assignmentName ?? ''} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="score" className="form-label">Score</label>
                            <input id="score" name="score" type="number" step="0.1" className="input input-responsive" defaultValue={(record as Grade)?.score ?? ''} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="total" className="form-label">Total Points</label>
                            <input id="total" name="total" type="number" step="0.1" min="0.1" className="input input-responsive" defaultValue={(record as Grade)?.total ?? ''} required />
                        </div>
                    </div>
                     <div className="form-group">
                        <label htmlFor="gradeDate" className="form-label">Date</label>
                        <input id="gradeDate" name="date" type="date" className="input input-responsive" defaultValue={defaultDate} required />
                    </div>
                </>
            )}
            {type === 'Attendance' && (
                <>
                    <div className="form-group">
                        <label htmlFor="attendanceDate" className="form-label">Date</label>
                        <input id="attendanceDate" name="date" type="date" className="input input-responsive" defaultValue={defaultDate} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status" className="form-label">Status</label>
                        <select id="status" name="status" className="input input-responsive" defaultValue={(record as AttendanceRecord)?.status ?? 'present'} required>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                </>
            )}
            {type === 'Homework' && (
                <>
                    <div className="form-group">
                        <label htmlFor="hwAssignmentName" className="form-label">Homework Assignment</label>
                        <input id="hwAssignmentName" name="assignmentName" type="text" className="input input-responsive" defaultValue={(record as HomeworkRecord)?.assignmentName ?? ''} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="homeworkDate" className="form-label">Due Date</label>
                        <input id="homeworkDate" name="date" type="date" className="input input-responsive" defaultValue={defaultDate} required />
                    </div>
                    <div className="form-group flex items-center gap-2">
                        <input id="completed" name="completed" type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" defaultChecked={(record as HomeworkRecord)?.completed ?? false} />
                        <label htmlFor="completed" className="form-label mb-0">Completed</label>
                    </div>
                </>
            )}
             {error && <p className="form-error flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
            <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Cancel</button>
                <button type="submit" className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                    <Save size={16} /> {isEdit ? 'Save Changes' : `Add ${type}`}
                </button>
            </div>
        </form>
    );
  };

  const renderStudentDetailView = (student: Student) => {
    if (!student) return <p className="text-center text-gray-500 dark:text-slate-400">Student not found.</p>;

    const avgGrade = calculateAverageGrade(student.grades);
    const attRate = calculateAttendanceRate(student.attendance);
    const hwRate = calculateHomeworkCompletionRate(student.homework);

    const gradeDataForChart = student.grades
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .map(g => ({ 
            name: g.assignmentName.length > 15 ? g.assignmentName.substring(0, 12) + '...' : g.assignmentName,
            date: format(parseISO(g.date), 'MMM d'),
            percentage: parseFloat(((g.score / g.total) * 100).toFixed(1)),
        }));

    return (
        <div className="space-y-6 p-1">
            {/* Student Header & Quick Actions */} 
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap size={24} /> {student.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Target size={14} /> Goals: {student.goals || 'Not set'}
                    </p>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2 flex-wrap">
                    <button onClick={() => openModal('editStudent', student.id)} className="btn btn-secondary btn-sm btn-responsive flex items-center justify-center gap-1">
                        <Edit size={14} /> Edit Info
                    </button>
                    <button onClick={() => deleteStudent(student.id)} className="btn bg-red-600 hover:bg-red-700 text-white btn-sm btn-responsive flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Delete Student
                    </button>
                </div>
            </div>

             {/* Summary Stats */} 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                    <div className="stat-title">Average Grade</div>
                    <div className="stat-value">{avgGrade}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Attendance Rate</div>
                    <div className="stat-value">{attRate}%</div>
                </div>
                 <div className="stat-card">
                    <div className="stat-title">Homework Completion</div>
                    <div className="stat-value">{hwRate}%</div>
                </div>
            </div>

            {/* Grade Chart */} 
            {student.grades.length > 1 && (
                <div className="card-responsive theme-transition-all mb-6">
                    <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-slate-200">Grade Trend</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={gradeDataForChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-base)" strokeOpacity={0.2} />
                            <XAxis dataKey="date" stroke="var(--color-text-base)" fontSize={12} />
                            <YAxis stroke="var(--color-text-base)" fontSize={12} domain={[0, 100]} unit="%" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', borderRadius: 'var(--radius-md)'}} 
                                itemStyle={{ color: 'var(--color-text-base)'}}
                                labelStyle={{ color: 'var(--color-text-base)', fontWeight: 'bold' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="percentage" name="Grade (%) " stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Data Sections (Grades, Attendance, Homework) */} 
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                 {/* Grades Section */}           
                <div className="card-responsive theme-transition-all">
                   <div className="flex-between mb-3">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-slate-200">Grades</h4>
                        <button onClick={() => openModal('addGrade', student.id)} className="btn btn-primary btn-sm btn-responsive flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Grade
                         </button>
                    </div>
                    {student.grades.length > 0 ? (
                        <div className="table-container theme-transition-all">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-cell px-3 py-2">Assignment</th>
                                        <th className="table-cell px-3 py-2 text-center">Score</th>
                                        <th className="table-cell px-3 py-2 text-center">Date</th>
                                        <th className="table-cell px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {student.grades.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(grade => (
                                        <tr key={grade.id}>
                                            <td className="table-cell px-3 py-2 font-medium text-gray-900 dark:text-white">{grade.assignmentName}</td>
                                            <td className="table-cell px-3 py-2 text-center">{grade.score}/{grade.total} <span className="text-xs text-gray-500 dark:text-slate-400">({((grade.score / grade.total) * 100).toFixed(0)}%)</span></td>
                                            <td className="table-cell px-3 py-2 text-center">{format(parseISO(grade.date), 'MMM d, yyyy')}</td>
                                            <td className="table-cell px-3 py-2 text-right space-x-1">
                                                <button onClick={() => openModal('editGrade', student.id, grade.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit grade for ${grade.assignmentName}`}><Edit size={16} /></button>
                                                <button onClick={() => deleteGrade(student.id, grade.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete grade for ${grade.assignmentName}`}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-gray-500 dark:text-slate-400 py-4">No grades recorded yet.</p>}
                </div>

                {/* Attendance Section */} 
                 <div className="card-responsive theme-transition-all">
                     <div className="flex-between mb-3">
                         <h4 className="text-lg font-medium text-gray-800 dark:text-slate-200">Attendance</h4>
                         <button onClick={() => openModal('addAttendance', student.id)} className="btn btn-primary btn-sm btn-responsive flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Record
                         </button>
                     </div>
                    {student.attendance.length > 0 ? (
                         <div className="table-container theme-transition-all">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-cell px-3 py-2">Date</th>
                                        <th className="table-cell px-3 py-2 text-center">Status</th>
                                        <th className="table-cell px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {student.attendance.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(att => (
                                        <tr key={att.id}>
                                            <td className="table-cell px-3 py-2 font-medium text-gray-900 dark:text-white">{format(parseISO(att.date), 'MMM d, yyyy')}</td>
                                            <td className="table-cell px-3 py-2 text-center">
                                                <span className={`badge ${att.status === 'present' ? 'badge-success' : att.status === 'absent' ? 'badge-error' : 'badge-warning'}`}>
                                                    {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="table-cell px-3 py-2 text-right space-x-1">
                                                <button onClick={() => openModal('editAttendance', student.id, att.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit attendance for ${format(parseISO(att.date), 'MMM d, yyyy')}`}><Edit size={16} /></button>
                                                <button onClick={() => deleteAttendance(student.id, att.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete attendance for ${format(parseISO(att.date), 'MMM d, yyyy')}`}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : <p className="text-center text-gray-500 dark:text-slate-400 py-4">No attendance records yet.</p>}
                 </div>

                {/* Homework Section */} 
                <div className="card-responsive theme-transition-all">
                     <div className="flex-between mb-3">
                         <h4 className="text-lg font-medium text-gray-800 dark:text-slate-200">Homework</h4>
                         <button onClick={() => openModal('addHomework', student.id)} className="btn btn-primary btn-sm btn-responsive flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Record
                         </button>
                     </div>
                    {student.homework.length > 0 ? (
                         <div className="table-container theme-transition-all">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-cell px-3 py-2">Assignment</th>
                                        <th className="table-cell px-3 py-2 text-center">Due Date</th>
                                        <th className="table-cell px-3 py-2 text-center">Status</th>
                                        <th className="table-cell px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {student.homework.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(hw => (
                                        <tr key={hw.id}>
                                            <td className="table-cell px-3 py-2 font-medium text-gray-900 dark:text-white">{hw.assignmentName}</td>
                                            <td className="table-cell px-3 py-2 text-center">{format(parseISO(hw.date), 'MMM d, yyyy')}</td>
                                            <td className="table-cell px-3 py-2 text-center">
                                                {hw.completed ? 
                                                    <span className="badge badge-success"><Check size={14} className="inline mr-1"/> Completed</span> : 
                                                    <span className="badge badge-error"><X size={14} className="inline mr-1"/> Incomplete</span>}
                                            </td>
                                            <td className="table-cell px-3 py-2 text-right space-x-1">
                                                <button onClick={() => openModal('editHomework', student.id, hw.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit homework status for ${hw.assignmentName}`}><Edit size={16} /></button>
                                                <button onClick={() => deleteHomework(student.id, hw.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete homework record for ${hw.assignmentName}`}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : <p className="text-center text-gray-500 dark:text-slate-400 py-4">No homework records yet.</p>}
                 </div>
            </div>

        </div>
    );
  };

  const renderModalContent = () => {
    const { type, studentId, recordId } = modalState;
    const student = studentId ? students.find(s => s.id === studentId) : undefined;
    let record: Grade | AttendanceRecord | HomeworkRecord | undefined;

    if (student && recordId) {
        if (type === 'editGrade') record = student.grades.find(g => g.id === recordId);
        else if (type === 'editAttendance') record = student.attendance.find(a => a.id === recordId);
        else if (type === 'editHomework') record = student.homework.find(h => h.id === recordId);
    }

    switch (type) {
      case 'addStudent':
        return renderStudentForm();
      case 'editStudent':
        return student ? renderStudentForm(student) : <p>Student not found.</p>;
      case 'viewStudent':
        return student ? renderStudentDetailView(student) : <p>Student not found.</p>;
      case 'addGrade':
        return studentId ? renderRecordForm('Grade', studentId) : <p>Student ID missing.</p>;
      case 'editGrade':
        return studentId && record ? renderRecordForm('Grade', studentId, record as Grade) : <p>Grade record not found.</p>;
       case 'addAttendance':
        return studentId ? renderRecordForm('Attendance', studentId) : <p>Student ID missing.</p>;
      case 'editAttendance':
        return studentId && record ? renderRecordForm('Attendance', studentId, record as AttendanceRecord) : <p>Attendance record not found.</p>;
      case 'addHomework':
        return studentId ? renderRecordForm('Homework', studentId) : <p>Student ID missing.</p>;
      case 'editHomework':
        return studentId && record ? renderRecordForm('Homework', studentId, record as HomeworkRecord) : <p>Homework record not found.</p>;
       case 'uploadFile':
           return (
             <div className="space-y-4">
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Student Data (CSV)</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400">Upload a CSV file with student data. Existing students with the same name will be updated, new students will be added.</p>
                 {error && <p className="alert alert-error"><AlertCircle size={16}/> {error}</p>}
                 <div className="form-group">
                     <label htmlFor="csvFile" className="form-label">Select CSV File</label>
                     <input 
                        id="csvFile" 
                        name="csvFile"
                        type="file" 
                        accept=".csv"
                        className="input input-responsive file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300 dark:hover:file:bg-primary-800 cursor-pointer" 
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                    />
                 </div>
                 <button 
                    type="button" 
                    onClick={downloadTemplate} 
                    className="btn btn-secondary btn-responsive w-full flex items-center justify-center gap-1">
                    <Download size={16} /> Download CSV Template
                 </button>
                  <div className="modal-footer">
                     <button type="button" onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 btn-responsive">Close</button>
                 </div>
             </div>
         );
      default:
        return null;
    }
  };

  const getModalTitle = (): string => {
    const { type, studentId } = modalState;
    const studentName = studentId ? students.find(s => s.id === studentId)?.name : '';
    switch (type) {
      case 'addStudent': return 'Add New Student';
      case 'editStudent': return `Edit Student: ${studentName}`;
      case 'viewStudent': return `Student Details: ${studentName}`;
      case 'addGrade': return `Add Grade for ${studentName}`;
      case 'editGrade': return `Edit Grade for ${studentName}`;
      case 'addAttendance': return `Add Attendance for ${studentName}`;
      case 'editAttendance': return `Edit Attendance for ${studentName}`;
      case 'addHomework': return `Add Homework for ${studentName}`;
      case 'editHomework': return `Edit Homework for ${studentName}`;
      case 'uploadFile': return 'Upload Data';
      default: return '';
    }
  }

  if (isLoading) {
    return (
        <div className="flex-center h-screen">
            <div className="skeleton w-16 h-16 rounded-full"></div>
             <p className="ml-4 text-lg font-medium">Loading Student Data...</p>
        </div>
    );
  }

  // Main App Layout
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */} 
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-all">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-16">
            <div className="flex items-center gap-2">
               <GraduationCap className="text-primary-600 dark:text-primary-400" size={28} />
               <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Student Progress Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Global Error Display */} 
         {error && modalState.type !== 'uploadFile' && (
             <div className="alert alert-error mb-4">
                <AlertCircle size={20} />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto p-1"><X size={18} /></button>
             </div>
         )}
         
         {/* Controls: Search, Add, Upload */} 
         <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64 md:w-80">
                 <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="input input-responsive pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search students"
                    name="search-students"
                 />
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap justify-end w-full sm:w-auto">
                 <button 
                    onClick={() => openModal('uploadFile')}
                    className="btn btn-secondary btn-responsive flex items-center justify-center gap-1">
                     <Upload size={16} /> Upload Data
                 </button>
                 <button 
                    onClick={() => openModal('addStudent')} 
                    className="btn btn-primary btn-responsive flex items-center justify-center gap-1">
                     <UserPlus size={16} /> Add Student
                 </button>
            </div>
         </div>

         {/* Student List Table */} 
         <div className="table-container theme-transition-all">
            <table className="table">
                <thead className="table-header">
                    <tr>
                        <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('name')}>
                             <div className="flex items-center">Name {getSortIcon('name')}</div>
                        </th>
                        <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-center hidden md:table-cell" onClick={() => requestSort('averageGrade')}>
                             <div className="flex items-center justify-center">Avg. Grade {getSortIcon('averageGrade')}</div>
                         </th>
                         <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-center hidden md:table-cell" onClick={() => requestSort('attendanceRate')}>
                             <div className="flex items-center justify-center">Attendance {getSortIcon('attendanceRate')}</div>
                         </th>
                         <th className="table-cell px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-center hidden md:table-cell" onClick={() => requestSort('homeworkRate')}>
                             <div className="flex items-center justify-center">Homework {getSortIcon('homeworkRate')}</div>
                         </th>
                        <th className="table-cell px-3 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-all">
                    {filteredAndSortedStudents.length > 0 ? (
                        filteredAndSortedStudents.map(student => {
                            const avgGrade = calculateAverageGrade(student.grades);
                            const attRate = calculateAttendanceRate(student.attendance);
                            const hwRate = calculateHomeworkCompletionRate(student.homework);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition-bg">
                                    <td className="table-cell px-3 py-3 font-medium text-gray-900 dark:text-white">
                                        <button onClick={() => openModal('viewStudent', student.id)} className="hover:underline text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                             <User size={16} /> {student.name}
                                        </button>
                                    </td>
                                     <td className="table-cell px-3 py-3 text-center hidden md:table-cell">
                                         <span className={`font-medium ${avgGrade < 70 ? 'text-red-600 dark:text-red-400' : avgGrade < 85 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                             {avgGrade}%
                                         </span>
                                     </td>
                                     <td className="table-cell px-3 py-3 text-center hidden md:table-cell">
                                         <span className={`font-medium ${attRate < 80 ? 'text-red-600 dark:text-red-400' : attRate < 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                             {attRate}%
                                         </span>
                                     </td>
                                     <td className="table-cell px-3 py-3 text-center hidden md:table-cell">
                                         <span className={`font-medium ${hwRate < 70 ? 'text-red-600 dark:text-red-400' : hwRate < 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                             {hwRate}%
                                         </span>
                                     </td>
                                    <td className="table-cell px-3 py-3 text-right space-x-1">
                                        <button onClick={() => openModal('viewStudent', student.id)} className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label={`View details for ${student.name}`} title="View Details">
                                            <History size={16} />
                                        </button>
                                        <button onClick={() => openModal('editStudent', student.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label={`Edit student ${student.name}`} title="Edit Student">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => deleteStudent(student.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete student ${student.name}`} title="Delete Student">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">
                                {students.length === 0 ? 'No students added yet.' : 'No students match your search.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </main>

      {/* Footer */} 
      <footer className="bg-gray-100 dark:bg-slate-900 py-4 mt-auto theme-transition-all">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

       {/* Modal */} 
       {modalState.type && (
        <div 
            className="modal-backdrop fade-in flex items-center justify-center" 
            onClick={closeModal} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
        >
          <div 
            className={`modal-content theme-transition-all ${modalState.type === 'viewStudent' ? 'max-w-3xl' : 'max-w-lg'} w-full`} 
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{getModalTitle()}</h3>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" 
                aria-label="Close modal"
                name="close-modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
