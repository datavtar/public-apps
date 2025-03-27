import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Plus, Edit, Trash2, Search, Sun, Moon, ArrowUpDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types and Interfaces ---

interface Student {
  id: string;
  name: string;
  subject: string;
  grade: Grade;
  lastUpdated: number; // Store as timestamp for sorting
  notes?: string;
}

type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A';

const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'F', 'N/A'];

type StudentFormData = Omit<Student, 'id' | 'lastUpdated'>;

type SortKey = keyof Pick<Student, 'name' | 'subject' | 'grade' | 'lastUpdated'>;

interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

// --- Initial Data (Simulated) ---

const initialStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Smith',
    subject: 'Mathematics',
    grade: 'A',
    lastUpdated: new Date('2024-05-20T10:00:00Z').getTime(),
    notes: 'Excellent understanding of calculus concepts.',
  },
  {
    id: '2',
    name: 'Bob Johnson',
    subject: 'History',
    grade: 'B',
    lastUpdated: new Date('2024-05-19T14:30:00Z').getTime(),
  },
  {
    id: '3',
    name: 'Charlie Brown',
    subject: 'Physics',
    grade: 'C',
    lastUpdated: new Date('2024-05-21T09:15:00Z').getTime(),
    notes: 'Needs improvement in applying formulas.',
  },
  {
    id: '4',
    name: 'Diana Prince',
    subject: 'Mathematics',
    grade: 'A',
    lastUpdated: new Date('2024-05-22T11:00:00Z').getTime(),
  },
];

// --- Theme Toggle Component Logic ---

const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' ||
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return { isDarkMode, toggleTheme };
};

// --- Main App Component ---

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastUpdated', direction: 'descending' });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentFormData>();

  // --- Computed Values ---

  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(students.map(s => s.subject));
    return ['', ...Array.from(subjects).sort()]; // Add empty option for 'All'
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(student =>
        filterSubject ? student.subject === filterSubject : true
      );
  }, [students, searchTerm, filterSubject]);

  const sortedStudents = useMemo(() => {
    const sortableStudents = [...filteredStudents];
    sortableStudents.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableStudents;
  }, [filteredStudents, sortConfig]);

  // --- Event Handlers & Logic ---

  const openModalForAdd = () => {
    setEditingStudent(null);
    reset({ name: '', subject: '', grade: 'N/A', notes: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (student: Student) => {
    setEditingStudent(student);
    reset({ name: student.name, subject: student.subject, grade: student.grade, notes: student.notes || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const onSubmit: SubmitHandler<StudentFormData> = (data) => {
    const now = Date.now();
    if (editingStudent) {
      // Update existing student
      setStudents(prev =>
        prev.map(s =>
          s.id === editingStudent.id ? { ...s, ...data, lastUpdated: now } : s
        )
      );
    } else {
      // Add new student
      const newStudent: Student = {
        ...data,
        id: crypto.randomUUID(), // Simple unique ID generation
        lastUpdated: now,
      };
      setStudents(prev => [newStudent, ...prev]);
    }
    closeModal();
  };

  // Helper to format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const getGradeBadgeClass = (grade: Grade): string => {
    switch (grade) {
      case 'A': return 'badge badge-success';
      case 'B': return 'badge badge-info'; // Using info for B
      case 'C': return 'badge badge-warning';
      case 'D':
      case 'F': return 'badge badge-error';
      default: return 'badge bg-gray-500 text-white'; // N/A or other
    }
  };

  // --- JSX ---

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">Student Progress Tracker</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">Light</span>
              {/* Theme Toggle */}
              <button
                className={styles.themeToggle}
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                name="theme-toggle"
              >
                <span className={`${styles.themeToggleThumb} ${isDarkMode ? styles.darkMode : ''}`}></span>
                {isDarkMode ? <Moon size={14} className={styles.moonIcon} /> : <Sun size={14} className={styles.sunIcon} />}
              </button>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">Dark</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Controls: Search, Filter, Add */}
        <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Search */}
          <div className="sm:col-span-1">
            <label htmlFor="search" className="form-label">Search</label>
            <div className="relative">
              <input
                id="search"
                type="text"
                className="input input-responsive pl-10" // Add padding for icon
                placeholder="Search by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                name="search"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Filter */}
          <div className="sm:col-span-1">
            <label htmlFor="filterSubject" className="form-label">Filter by Subject</label>
            <select
              id="filterSubject"
              className="input input-responsive"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              name="filter-subject"
            >
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject || 'All Subjects'}</option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <div className="sm:col-span-1 sm:text-right">
            <button
              className="btn btn-primary btn-responsive w-full sm:w-auto transition-transform hover:scale-105"
              onClick={openModalForAdd}
              name="add-student"
            >
              <Plus size={18} className="mr-1 -ml-1" />
              Add Student
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="card card-responsive shadow-md overflow-hidden">
          {sortedStudents.length > 0 ? (
             <div className="table-container overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="table-header text-left">
                      <button onClick={() => handleSort('name')} className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-300" name="sort-name">
                        <span>Name</span>
                        {sortConfig.key === 'name' && <ArrowUpDown size={14} />}
                      </button>
                    </th>
                    <th className="table-header text-left">
                       <button onClick={() => handleSort('subject')} className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-300" name="sort-subject">
                        <span>Subject</span>
                        {sortConfig.key === 'subject' && <ArrowUpDown size={14} />}
                      </button>
                    </th>
                    <th className="table-header text-center">
                      <button onClick={() => handleSort('grade')} className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-300 mx-auto" name="sort-grade">
                        <span>Grade</span>
                        {sortConfig.key === 'grade' && <ArrowUpDown size={14} />}
                      </button>
                    </th>
                    <th className="table-header text-left hidden md:table-cell">
                      <button onClick={() => handleSort('lastUpdated')} className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-300" name="sort-lastUpdated">
                        <span>Last Updated</span>
                         {sortConfig.key === 'lastUpdated' && <ArrowUpDown size={14} />}
                      </button>
                    </th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">
                        {student.name}
                        {student.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block truncate">{student.notes}</p>}
                      </td>
                      <td className="table-cell text-gray-600 dark:text-gray-300">{student.subject}</td>
                      <td className="table-cell text-center">
                        <span className={getGradeBadgeClass(student.grade)}>{student.grade}</span>
                      </td>
                      <td className="table-cell text-gray-600 dark:text-gray-300 hidden md:table-cell">{formatDate(student.lastUpdated)}</td>
                      <td className="table-cell text-right space-x-2">
                        <button
                          className="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 p-1.5 rounded transition-colors" // Adjusted for icon only feel
                          onClick={() => openModalForEdit(student)}
                          aria-label={`Edit ${student.name}`}
                          name={`edit-${student.id}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-sm bg-red-500 text-white hover:bg-red-600 p-1.5 rounded transition-colors" // Adjusted for icon only feel
                          onClick={() => handleDelete(student.id)}
                          aria-label={`Delete ${student.name}`}
                          name={`delete-${student.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-gray-500 dark:text-gray-400">
              No students found matching your criteria.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 theme-transition">
        Copyright (c) 2025 Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black bg-opacity-50 dark:bg-opacity-70 fade-in">
          <div className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md theme-transition-all slide-in">
            <form onSubmit={handleSubmit(onSubmit)} name="student-form">
              <div className="modal-header flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full -mr-2" // Adjusted for better spacing
                  onClick={closeModal}
                  aria-label="Close modal"
                  name="close-modal"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Student Name</label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Student name is required' })}
                    className={`input input-responsive ${errors.name ? 'border-red-500' : ''}`}
                    aria-invalid={errors.name ? "true" : "false"}
                    name="name"
                  />
                  {errors.name && <p className="form-error text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    {...register('subject', { required: 'Subject is required' })}
                    className={`input input-responsive ${errors.subject ? 'border-red-500' : ''}`}
                    aria-invalid={errors.subject ? "true" : "false"}
                    name="subject"
                  />
                  {errors.subject && <p className="form-error text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="grade">Grade</label>
                  <select
                    id="grade"
                    {...register('grade', { required: 'Grade is required' })}
                    className={`input input-responsive ${errors.grade ? 'border-red-500' : ''}`}
                    aria-invalid={errors.grade ? "true" : "false"}
                    name="grade"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.grade && <p className="form-error text-red-500 text-xs mt-1">{errors.grade.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    className="input input-responsive resize-none" // Prevent resizing
                    name="notes"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer flex justify-end space-x-3 p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                  onClick={closeModal}
                  name="cancel-modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary transition-transform hover:scale-105"
                  name="submit-modal"
                >
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
