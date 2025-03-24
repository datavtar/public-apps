import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronDown, XCircle, Filter, ArrowUpDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define the types
interface Student {
  id: number;
  name: string;
  progress: number;
  grade: string;
}

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentProgress, setNewStudentProgress] = useState(0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'progress' | 'grade' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isDarkMode, setIsDarkMode] = useState(() => {
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

  const addStudent = () => {
    if (newStudentName.trim() !== '') {
      const newStudent: Student = {
        id: Date.now(),
        name: newStudentName,
        progress: newStudentProgress,
        grade: calculateGrade(newStudentProgress),
      };
      setStudents([...students, newStudent]);
      setNewStudentName('');
      setNewStudentProgress(0);
    }
  };

  const startEditingStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const updateStudent = () => {
    if (editingStudent) {
      const updatedStudents = students.map((student) =>
        student.id === editingStudent.id
          ? { ...editingStudent, grade: calculateGrade(editingStudent.progress) }
          : student
      );
      setStudents(updatedStudents);
      setEditingStudent(null);
    }
  };

  const deleteStudent = (id: number) => {
    const updatedStudents = students.filter((student) => student.id !== id);
    setStudents(updatedStudents);
  };

  const calculateGrade = (progress: number): string => {
    if (progress >= 90) return 'A';
    if (progress >= 80) return 'B';
    if (progress >= 70) return 'C';
    if (progress >= 60) return 'D';
    return 'F';
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterGrade ? student.grade === filterGrade : true)
  );

    const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortField) return 0;

    const fieldA = a[sortField];
    const fieldB = b[sortField];

    let comparison = 0;
    if (fieldA < fieldB) {
      comparison = -1;
    } else if (fieldA > fieldB) {
      comparison = 1;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

    const toggleSortDirection = (field: 'name' | 'progress' | 'grade') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-800 theme-transition-all">

      {/* Theme Toggle */}
      <div className="flex items-center justify-end p-4 space-x-2">
        <span className="text-sm dark:text-slate-300">Light</span>
        <button
          className="theme-toggle relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          role="switch"
        >
          <span
            className={`${isDarkMode ? 'translate-x-5' : 'translate-x-0'} theme-toggle-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          ></span>
        </button>
        <span className="text-sm dark:text-slate-300">Dark</span>
      </div>
      <div className="container-fluid p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-white mb-6">Student Progress Tracker</h1>

        {/* Add Student Form */}
        <div className="card-responsive mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 dark:text-slate-200">Add New Student</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              className="input"
              placeholder="Student Name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              aria-label="Student Name"
              name="studentName"
            />
            <input
              type="number"
              className="input"
              placeholder="Progress (0-100)"
              value={newStudentProgress}
              onChange={(e) => setNewStudentProgress(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
              aria-label="Student Progress"
              name="studentProgress"
              min="0"
              max="100"
            />
            <button className="btn btn-primary flex items-center gap-2" onClick={addStudent} role="button">
              <Plus size={16} /> Add Student
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        className="input w-full pl-10"
                        placeholder="Search Students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search Students"
                        name="searchStudents"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                </div>

                <div className="relative w-full md:w-1/4">
                    <select
                        className="input w-full pr-8 "
                        value={filterGrade || ''}
                        onChange={(e) => setFilterGrade(e.target.value || null)}
                        aria-label="Filter by Grade"
                        name="filterGrade"
                    >
                        <option value="">All Grades</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
                </div>
            </div>


        {/* Edit Student Form */}
        {editingStudent && (
          <div className="card-responsive mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-slate-200">Edit Student</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                className="input"
                value={editingStudent.name}
                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                aria-label="Edit Student Name"
                name="editStudentName"
              />
              <input
                type="number"
                className="input"
                value={editingStudent.progress}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, progress: parseInt((e.target as HTMLInputElement).value, 10) || 0 })
                }
                aria-label="Edit Student Progress"
                name="editStudentProgress"
                min="0"
                max="100"
              />
              <button className="btn btn-primary" onClick={updateStudent} role="button">Update</button>
              <button className="btn btn-secondary" onClick={() => setEditingStudent(null)} role="button">Cancel</button>
            </div>
          </div>
        )}

        {/* Student Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header" onClick={() => toggleSortDirection('name')}>Name {sortField === 'name' && <ArrowUpDown size={16} />}</th>
                <th className="table-header" onClick={() => toggleSortDirection('progress')}>Progress {sortField === 'progress' && <ArrowUpDown size={16} />}</th>
                <th className="table-header" onClick={() => toggleSortDirection('grade')}>Grade {sortField === 'grade' && <ArrowUpDown size={16} />}</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center table-cell py-4">
                    No students found.
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                  <tr key={student.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                    <td className="table-cell">{student.name}</td>
                    <td className="table-cell">{student.progress}%</td>
                    <td className="table-cell">
                      <span className={`badge ${student.grade === 'A' ? 'badge-success' : student.grade === 'B' ? 'badge-info' : student.grade === 'C' ? 'badge-warning' : 'badge-error'}`}>{student.grade}</span>
                    </td>
                    <td className="table-cell">
                      <button className="btn btn-sm btn-primary mr-2" onClick={() => startEditingStudent(student)} role="button">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-sm bg-red-500 text-white hover:bg-red-600" onClick={() => deleteStudent(student.id)} role="button">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-600 dark:text-gray-400">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
