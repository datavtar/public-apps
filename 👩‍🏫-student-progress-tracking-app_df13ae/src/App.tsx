import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
  User, UserPlus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, Sun, Moon, BookOpen, Calendar, BarChart, GraduationCap, Plus, Save, FileText, Download
} from 'lucide-react';

// Types and Interfaces
interface Student {
  id: string;
  name: string;
  grade: string;
  subjects: string[];
  createdAt: string; // Store as ISO string
}

interface ProgressRecord {
  id: string;
  studentId: string;
  subject: string;
  date: string; // Store as ISO string
  score: number; // Assuming 0-100 scale
  notes?: string;
}

type SortKey = keyof Student | 'subjectCount';
interface SortConfig {
  key: SortKey | null;
  direction: 'ascending' | 'descending';
}

type StudentFormData = Omit<Student, 'id' | 'createdAt' | 'subjects'> & {
  subjects: string; // Comma-separated string for input
};

type ProgressFormData = Omit<ProgressRecord, 'id' | 'studentId'>;

// Constants
const LOCAL_STORAGE_KEYS = {
  STUDENTS: 'progressTracker_students',
  PROGRESS: 'progressTracker_progress',
  DARK_MODE: 'progressTracker_darkMode',
};

const GRADES = ['Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Art', 'Music', 'Physical Education'];
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Helper function to generate unique IDs
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Default Data (if localStorage is empty)
const defaultStudents: Student[] = [
  {
    id: generateId(),
    name: 'Alice Wonderland',
    grade: '5th',
    subjects: ['Math', 'Science', 'English'],
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Bob The Builder',
    grade: '3rd',
    subjects: ['Math', 'Art'],
    createdAt: new Date().toISOString(),
  },
];

const defaultProgress: ProgressRecord[] = [
  {
    id: generateId(),
    studentId: defaultStudents[0].id,
    subject: 'Math',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    score: 85,
    notes: 'Good understanding of fractions.',
  },
  {
    id: generateId(),
    studentId: defaultStudents[0].id,
    subject: 'Math',
    date: new Date().toISOString(),
    score: 90,
    notes: 'Improved calculation speed.',
  },
    {
    id: generateId(),
    studentId: defaultStudents[0].id,
    subject: 'Science',
    date: new Date().toISOString(),
    score: 78,
  },
  {
    id: generateId(),
    studentId: defaultStudents[1].id,
    subject: 'Art',
    date: new Date().toISOString(),
    score: 95,
    notes: 'Excellent creativity.',
  },
];

// Main App Component
const App: React.FC = () => {
  // --- State ---
  const [students, setStudents] = useState<Student[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForProgress, setStudentForProgress] = useState<Student | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // --- Effects ---
  // Load data from localStorage on initial render
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedStudents = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
      const storedProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRESS);

      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents(defaultStudents);
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
      }

      if (storedProgress) {
        setProgressRecords(JSON.parse(storedProgress));
      } else {
        setProgressRecords(defaultProgress);
        localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(defaultProgress));
      }

    } catch (err) {
      console.error('Failed to load data from localStorage:', err);
      setError('Could not load saved data. Please refresh or clear application storage.');
      // Fallback to defaults if parsing fails
      setStudents(defaultStudents);
      setProgressRecords(defaultProgress);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save students to localStorage when they change
  useEffect(() => {
    if (!isLoading) { // Avoid saving initial empty/default state before loading
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      } catch (err) {
        console.error('Failed to save students to localStorage:', err);
        setError('Could not save student data.');
      }
    }
  }, [students, isLoading]);

  // Save progress records to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(progressRecords));
      } catch (err) {
        console.error('Failed to save progress to localStorage:', err);
        setError('Could not save progress data.');
      }
    }
  }, [progressRecords, isLoading]);

  // Apply dark mode class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'false');
    }
  }, [isDarkMode]);

  // Close modals on 'Escape' key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeStudentModal();
        closeProgressModal();
        closeDetailModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []); // Empty dependency array ensures this effect runs only once


  // --- Modal Management ---
  const openStudentModal = (student: Student | null = null) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeStudentModal = () => {
    setIsStudentModalOpen(false);
    setEditingStudent(null);
    document.body.classList.remove('modal-open');
  };

  const openProgressModal = (student: Student) => {
    setStudentForProgress(student);
    setIsProgressModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeProgressModal = () => {
    setIsProgressModalOpen(false);
    setStudentForProgress(null);
    document.body.classList.remove('modal-open');
  };

  const openDetailModal = (student: Student) => {
    setSelectedStudentForDetail(student);
    setIsDetailModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStudentForDetail(null);
    document.body.classList.remove('modal-open');
  };


  // --- Data Handling ---
  const addStudent = (studentData: StudentFormData) => {
    const newStudent: Student = {
      ...studentData,
      id: generateId(),
      subjects: studentData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, updatedData: StudentFormData) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === id ? { ...s, ...updatedData, subjects: updatedData.subjects.split(',').map(sub => sub.trim()).filter(Boolean) } : s
      )
    );
  };

  const deleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student and all their progress records?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setProgressRecords(prev => prev.filter(p => p.studentId !== id));
    }
  };

  const addProgressRecord = (studentId: string, progressData: ProgressFormData) => {
    const newRecord: ProgressRecord = {
      ...progressData,
      id: generateId(),
      date: new Date(progressData.date).toISOString(), // Ensure date is stored consistently
      studentId,
    };
    setProgressRecords(prev => [...prev, newRecord]);
  };

  // --- Filtering and Sorting ---
  const filteredAndSortedStudents = useMemo(() => {
    let result = students;

    // Filtering
    if (searchTerm) {
      result = result.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterGrade) {
      result = result.filter(student => student.grade === filterGrade);
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'subjectCount') {
          aValue = a.subjects.length;
          bValue = b.subjects.length;
        } else {
          aValue = a[sortConfig.key as keyof Student] as string | number;
          bValue = b[sortConfig.key as keyof Student] as string | number;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
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

    return result;
  }, [students, searchTerm, filterGrade, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // --- Theme Toggle ---
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // --- Form Hooks ---
  const { register: studentRegister, handleSubmit: handleStudentSubmit, reset: resetStudentForm, setValue: setStudentValue } = useForm<StudentFormData>();
  const { register: progressRegister, handleSubmit: handleProgressSubmit, reset: resetProgressForm } = useForm<ProgressFormData>();

  // --- Form Submit Handlers ---
  const onStudentSubmit: SubmitHandler<StudentFormData> = (data) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, data);
    } else {
      addStudent(data);
    }
    closeStudentModal();
    resetStudentForm();
  };

  const onProgressSubmit: SubmitHandler<ProgressFormData> = (data) => {
    if (studentForProgress) {
      addProgressRecord(studentForProgress.id, data);
    }
    closeProgressModal();
    resetProgressForm();
  };

  // Effect to populate student form when editing
  useEffect(() => {
    if (editingStudent) {
      setStudentValue('name', editingStudent.name);
      setStudentValue('grade', editingStudent.grade);
      setStudentValue('subjects', editingStudent.subjects.join(', '));
    } else {
      resetStudentForm();
    }
  }, [editingStudent, setStudentValue, resetStudentForm]);

  // Effect to reset forms when modals close
  useEffect(() => {
    if (!isStudentModalOpen) resetStudentForm();
    if (!isProgressModalOpen) resetProgressForm();
  }, [isStudentModalOpen, isProgressModalOpen, resetStudentForm, resetProgressForm]);

  // --- Data for Charts ---
  const getProgressDataForChart = useCallback((studentId: string | undefined, subject: string | undefined) => {
    if (!studentId || !subject) return [];
    return progressRecords
      .filter(p => p.studentId === studentId && p.subject === subject)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(p => ({ date: format(new Date(p.date), 'MMM dd'), score: p.score, notes: p.notes }));
  }, [progressRecords]);

  const getOverallProgressDistribution = useCallback((studentId: string | undefined) => {
      if (!studentId) return [];
      const studentProgress = progressRecords.filter(p => p.studentId === studentId);
      const subjectScores = studentProgress.reduce((acc, record) => {
        if (!acc[record.subject]) {
          acc[record.subject] = { totalScore: 0, count: 0 };
        }
        acc[record.subject].totalScore += record.score;
        acc[record.subject].count += 1;
        return acc;
      }, {} as Record<string, { totalScore: number; count: number }>);

      return Object.entries(subjectScores).map(([subject, data]) => ({
        name: subject,
        value: Math.round(data.totalScore / data.count),
      }));
    }, [progressRecords]);

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="space-y-3 p-6">
          <div className="skeleton-text w-1/2 mx-auto"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-primary-600 dark:text-primary-400" size={28} />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Student Progress Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="theme-toggle"
                role="switch"
                aria-checked={isDarkMode}
              >
                <span className="theme-toggle-thumb flex items-center justify-center">
                  {isDarkMode ? <Moon size={12} className='text-slate-500'/> : <Sun size={12} className='text-yellow-500' />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="alert alert-error mb-4" role="alert">
            <X size={20}/> <span>{error}</span>
          </div>
        )}

        {/* Controls and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-responsive pl-10 w-full"
                aria-label="Search students by name"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="input input-responsive w-full sm:w-auto"
              aria-label="Filter students by grade"
            >
              <option value="">All Grades</option>
              {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </div>
          <button onClick={() => openStudentModal()} className="btn btn-primary btn-responsive w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2">
            <UserPlus size={18} /> Add Student
          </button>
        </div>

        {/* Student Table */}
        <div className="table-container card shadow-lg theme-transition-all">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell px-4 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-1">Name {getSortIcon('name')}</div>
                </th>
                <th className="table-cell px-4 py-3 cursor-pointer hidden md:table-cell" onClick={() => requestSort('grade')}>
                  <div className="flex items-center gap-1">Grade {getSortIcon('grade')}</div>
                </th>
                <th className="table-cell px-4 py-3 cursor-pointer hidden lg:table-cell" onClick={() => requestSort('subjectCount')}>
                   <div className="flex items-center gap-1">Subjects {getSortIcon('subjectCount')}</div>
                </th>
                <th className="table-cell px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 theme-transition-bg">
              {filteredAndSortedStudents.length > 0 ? (
                filteredAndSortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition-bg">
                    <td className="table-cell px-4 py-3 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                            <User size={16} />
                            {student.name}
                        </div>
                    </td>
                    <td className="table-cell px-4 py-3 hidden md:table-cell">{student.grade}</td>
                    <td className="table-cell px-4 py-3 hidden lg:table-cell">
                      {student.subjects.map(sub => (
                        <span key={sub} className="badge badge-info mr-1 mb-1">{sub}</span>
                      ))}
                      {student.subjects.length === 0 && <span className="text-gray-500 dark:text-slate-400">No subjects</span>}
                    </td>
                    <td className="table-cell px-4 py-3">
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <button onClick={() => openDetailModal(student)} className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 flex items-center gap-1" aria-label={`View details for ${student.name}`}>
                          <BarChart size={14} /> <span className="hidden sm:inline">Details</span>
                        </button>
                        <button onClick={() => openProgressModal(student)} className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 flex items-center gap-1" aria-label={`Add progress for ${student.name}`}>
                          <Plus size={14} /> <span className="hidden sm:inline">Progress</span>
                        </button>
                        <button onClick={() => openStudentModal(student)} className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 flex items-center gap-1" aria-label={`Edit ${student.name}`}>
                          <Edit size={14} /> <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button onClick={() => deleteStudent(student.id)} className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex items-center gap-1" aria-label={`Delete ${student.name}`}>
                          <Trash2 size={14} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="table-cell px-4 py-10 text-center text-gray-500 dark:text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-800 text-center py-4 text-sm text-gray-600 dark:text-slate-400 theme-transition-bg">
        Copyright \u00A9 {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Student Add/Edit Modal */}
      {isStudentModalOpen && (
        <div className="modal-backdrop" onClick={closeStudentModal} role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
          <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="student-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={closeStudentModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleStudentSubmit(onStudentSubmit)} className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="student-name" className="form-label">Name</label>
                <input id="student-name" type="text" {...studentRegister('name', { required: 'Name is required' })} className="input" />
                {/* {studentErrors.name && <p className="form-error">{studentErrors.name.message}</p>} */}
              </div>
              <div className="form-group">
                <label htmlFor="student-grade" className="form-label">Grade</label>
                <select id="student-grade" {...studentRegister('grade', { required: 'Grade is required' })} className="input">
                  <option value="">Select Grade</option>
                  {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                </select>
                {/* {studentErrors.grade && <p className="form-error">{studentErrors.grade.message}</p>} */}
              </div>
              <div className="form-group">
                <label htmlFor="student-subjects" className="form-label">Subjects (comma-separated)</label>
                <input id="student-subjects" type="text" {...studentRegister('subjects')} className="input" placeholder='e.g., Math, Science, Art' />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Enter subjects separated by commas.</p>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeStudentModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex items-center justify-center gap-2">
                  <Save size={18} /> {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {isProgressModalOpen && studentForProgress && (
        <div className="modal-backdrop" onClick={closeProgressModal} role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
          <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="progress-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Add Progress for {studentForProgress.name}
              </h3>
              <button onClick={closeProgressModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleProgressSubmit(onProgressSubmit)} className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="progress-subject" className="form-label">Subject</label>
                <select id="progress-subject" {...progressRegister('subject', { required: 'Subject is required' })} className="input">
                  <option value="">Select Subject</option>
                  {(studentForProgress.subjects.length > 0 ? studentForProgress.subjects : SUBJECTS).map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                   {studentForProgress.subjects.length === 0 && <option disabled>No subjects defined for student</option>}
                </select>
                {/* {progressErrors.subject && <p className="form-error">{progressErrors.subject.message}</p>} */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="form-group">
                  <label htmlFor="progress-date" className="form-label">Date</label>
                  <input id="progress-date" type="date" {...progressRegister('date', { required: 'Date is required', valueAsDate: true })} className="input" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  {/* {progressErrors.date && <p className="form-error">{progressErrors.date.message}</p>} */}
                </div>
                 <div className="form-group">
                  <label htmlFor="progress-score" className="form-label">Score (0-100)</label>
                  <input id="progress-score" type="number" {...progressRegister('score', { required: 'Score is required', min: 0, max: 100, valueAsNumber: true })} className="input" />
                  {/* {progressErrors.score && <p className="form-error">{progressErrors.score.message}</p>} */}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="progress-notes" className="form-label">Notes (Optional)</label>
                <textarea id="progress-notes" {...progressRegister('notes')} className="input" rows={3}></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeProgressModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex items-center justify-center gap-2">
                  <Save size={18} /> Add Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {isDetailModalOpen && selectedStudentForDetail && (
        <div className="modal-backdrop" onClick={closeDetailModal} role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
          <div className="modal-content max-w-2xl theme-transition-all" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
                <h3 id="detail-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                   <User size={22} /> {selectedStudentForDetail.name} - Progress Details
                </h3>
                <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close modal">
                   <X size={24} />
                </button>
            </div>

            <div className="mt-4 space-y-6">
              {/* Student Info */}
              <div className="card card-sm bg-gray-50 dark:bg-slate-700 theme-transition-bg">
                <p><strong className="font-medium">Grade:</strong> {selectedStudentForDetail.grade}</p>
                <p><strong className="font-medium">Subjects Tracked:</strong> 
                  {selectedStudentForDetail.subjects.length > 0 
                    ? selectedStudentForDetail.subjects.join(', ')
                    : <span className='italic text-gray-500 dark:text-slate-400'>None specified</span>}
                </p>
                <p><strong className="font-medium">Student Since:</strong> {format(new Date(selectedStudentForDetail.createdAt), 'MMMM dd, yyyy')}</p>
              </div>

              {/* Overall Progress Pie Chart */}
               {getOverallProgressDistribution(selectedStudentForDetail.id).length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-2 dark:text-white">Average Score by Subject</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getOverallProgressDistribution(selectedStudentForDetail.id)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {getOverallProgressDistribution(selectedStudentForDetail.id).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`Average: ${value.toFixed(1)}`, 'Score']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
               )}

              {/* Progress Charts per Subject */}
              <div>
                <h4 className="text-lg font-medium mb-4 dark:text-white">Progress Over Time</h4>
                {selectedStudentForDetail.subjects.length > 0 ? (
                  selectedStudentForDetail.subjects.map((subject, index) => {
                  const subjectProgress = getProgressDataForChart(selectedStudentForDetail.id, subject);
                  return subjectProgress.length > 0 ? (
                    <div key={subject} className={`mb-6 ${index > 0 ? 'pt-6 border-t border-gray-200 dark:border-slate-600' : ''}`}>
                      <h5 className="font-semibold mb-2 dark:text-slate-200">{subject}</h5>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={subjectProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-secondary)"/>
                            <XAxis dataKey="date" stroke="var(--color-text-base)"/>
                            <YAxis domain={[0, 100]} stroke="var(--color-text-base)"/>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}
                                itemStyle={{ color: 'var(--color-text-base)' }}
                                formatter={(value: number, name: string, props) => [`Score: ${value}`, props.payload.notes ? `Notes: ${props.payload.notes}` : null]}
                                labelFormatter={(label) => `Date: ${label}`}
                             />
                             <Legend />
                             <Line type="monotone" dataKey="score" stroke={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={2} activeDot={{ r: 8 }} name={subject} />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                     </div>
                    ) : (
                       <p key={subject} className='text-gray-500 dark:text-slate-400 text-sm italic mb-2'>No progress recorded for {subject} yet.</p>
                    );
                  })
                ) : (
                   <p className='text-gray-500 dark:text-slate-400 text-sm italic'>No subjects defined for this student to track progress.</p>
                )}
                 {/* Show progress for subjects not explicitly defined if records exist */}
                {SUBJECTS.filter(sub => !selectedStudentForDetail.subjects.includes(sub)).map((subject, index) => {
                   const subjectProgress = getProgressDataForChart(selectedStudentForDetail.id, subject);
                   const colorIndex = selectedStudentForDetail.subjects.length + index;
                   return subjectProgress.length > 0 ? (
                     <div key={subject} className={`mb-6 pt-6 border-t border-gray-200 dark:border-slate-600`}>
                       <h5 className="font-semibold mb-2 dark:text-slate-200">{subject} (Other)</h5>
                       <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={subjectProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-secondary)"/>
                             <XAxis dataKey="date" stroke="var(--color-text-base)"/>
                             <YAxis domain={[0, 100]} stroke="var(--color-text-base)"/>
                             <Tooltip
                                contentStyle={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}
                                itemStyle={{ color: 'var(--color-text-base)' }}
                                formatter={(value: number, name: string, props) => [`Score: ${value}`, props.payload.notes ? `Notes: ${props.payload.notes}` : null]}
                                labelFormatter={(label) => `Date: ${label}`}
                             />
                             <Legend />
                             <Line type="monotone" dataKey="score" stroke={PIE_COLORS[colorIndex % PIE_COLORS.length]} strokeWidth={2} activeDot={{ r: 8 }} name={subject} />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                     </div>
                   ) : null;
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => { closeDetailModal(); openProgressModal(selectedStudentForDetail); }} className="btn btn-secondary flex items-center justify-center gap-2">
                 <Plus size={18} /> Add More Progress
              </button>
              <button onClick={closeDetailModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
