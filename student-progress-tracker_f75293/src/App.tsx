import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CheckCircle, XCircle, Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, Moon, Sun, BookOpen, Award, ArrowUpDown, AlertCircle } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
type Student = {
 id: string;
 name: string;
 grade: string;
 subject: string;
 averageScore: number;
 lastAssessmentDate: string;
 status: 'At Risk' | 'Needs Improvement' | 'On Track' | 'Excelling';
 notes: string;
 attendance: number;
};

type SortField = 'name' | 'grade' | 'subject' | 'averageScore' | 'attendance' | 'lastAssessmentDate';
type SortDirection = 'asc' | 'desc';

type StudentFormInputs = Omit<Student, 'id' | 'status'>;

type Tab = 'all' | 'at-risk' | 'improvement' | 'on-track' | 'excelling';

const App: React.FC = () => {
 // State
 const [students, setStudents] = useState<Student[]>(sampleStudents);
 const [filteredStudents, setFilteredStudents] = useState<Student[]>(sampleStudents);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortField, setSortField] = useState<SortField>('name');
 const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
 const [showAddModal, setShowAddModal] = useState(false);
 const [editingStudent, setEditingStudent] = useState<Student | null>(null);
 const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
 const [showStudentDetails, setShowStudentDetails] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<Tab>('all');
 const [isDarkMode, setIsDarkMode] = useState(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 // Form handling
 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentFormInputs>();

 // Set up dark mode
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 // Filter and sort students
 useEffect(() => {
 let result = [...students];
 
 // Filter by search term
 if (searchTerm) {
 const term = searchTerm.toLowerCase();
 result = result.filter(student => 
 student.name.toLowerCase().includes(term) ||
 student.subject.toLowerCase().includes(term) ||
 student.grade.toLowerCase().includes(term)
 );
 }
 
 // Filter by tab
 if (activeTab !== 'all') {
 const statusMap: Record<Tab, Student['status'] | undefined> = {
 'all': undefined,
 'at-risk': 'At Risk',
 'improvement': 'Needs Improvement',
 'on-track': 'On Track',
 'excelling': 'Excelling'
 };
 
 const statusFilter = statusMap[activeTab];
 if (statusFilter) {
 result = result.filter(student => student.status === statusFilter);
 }
 }
 
 // Sort
 result.sort((a, b) => {
 let valueA: any = a[sortField];
 let valueB: any = b[sortField];
 
 // Date comparison
 if (sortField === 'lastAssessmentDate') {
 valueA = new Date(valueA);
 valueB = new Date(valueB);
 }
 
 if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
 if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
 return 0;
 });
 
 setFilteredStudents(result);
 }, [students, searchTerm, sortField, sortDirection, activeTab]);

 // Handle form submission
 const onSubmit: SubmitHandler<StudentFormInputs> = (data) => {
 // Calculate status based on average score
 let status: Student['status'];
 if (data.averageScore >= 90) status = 'Excelling';
 else if (data.averageScore >= 75) status = 'On Track';
 else if (data.averageScore >= 60) status = 'Needs Improvement';
 else status = 'At Risk';

 if (editingStudent) {
 // Update existing student
 setStudents(prev => 
 prev.map(student => 
 student.id === editingStudent.id 
 ? { ...student, ...data, status } 
 : student
 )
 );
 } else {
 // Add new student
 const newStudent: Student = {
 ...data,
 id: Date.now().toString(),
 status
 };
 setStudents(prev => [...prev, newStudent]);
 }

 // Reset form and close modal
 reset();
 setShowAddModal(false);
 setEditingStudent(null);
 };

 // Open edit modal
 const handleEdit = (student: Student) => {
 setEditingStudent(student);
 // Populate form with student data
 Object.keys(student).forEach(key => {
 if (key !== 'id' && key !== 'status') {
 setValue(key as keyof StudentFormInputs, student[key as keyof Student] as any);
 }
 });
 setShowAddModal(true);
 };

 // Delete student
 const handleDelete = (id: string) => {
 setStudents(prev => prev.filter(student => student.id !== id));
 setShowConfirmDelete(null);
 };

 // Toggle sort
 const handleSort = (field: SortField) => {
 if (sortField === field) {
 setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('asc');
 }
 };

 // Get status badge class
 const getStatusBadgeClass = (status: Student['status']) => {
 switch (status) {
 case 'At Risk': return 'badge badge-error';
 case 'Needs Improvement': return 'badge badge-warning';
 case 'On Track': return 'badge badge-info';
 case 'Excelling': return 'badge badge-success';
 default: return 'badge';
 }
 };

 // Render sort icon
 const renderSortIcon = (field: SortField) => {
 if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
 return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow theme-transition">
 <div className="container-fluid py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center">
 <div className="flex items-center mb-4 sm:mb-0">
 <BookOpen className="w-8 h-8 mr-2 text-primary-500" />
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
 </div>
 
 <div className="flex items-center space-x-2">
 <button 
 onClick={() => setIsDarkMode(!isDarkMode)}
 className="theme-toggle p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? (
 <Sun className="w-5 h-5 text-yellow-400" />
 ) : (
 <Moon className="w-5 h-5 text-gray-600" />
 )}
 </button>
 </div>
 </div>
 </header>

 <main className="container-fluid py-6 sm:py-8">
 {/* Dashboard Summary */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Total Students</div>
 <div className="stat-value">{students.length}</div>
 <div className="stat-desc">Active tracking</div>
 </div>
 
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">At Risk</div>
 <div className="stat-value text-red-500">
 {students.filter(s => s.status === 'At Risk').length}
 </div>
 <div className="stat-desc">Need immediate attention</div>
 </div>
 
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">On Track</div>
 <div className="stat-value text-blue-500">
 {students.filter(s => s.status === 'On Track').length}
 </div>
 <div className="stat-desc">Performing as expected</div>
 </div>
 
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Excelling</div>
 <div className="stat-value text-green-500">
 {students.filter(s => s.status === 'Excelling').length}
 </div>
 <div className="stat-desc">Exceptional performance</div>
 </div>
 </div>

 {/* Controls */}
 <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
 <div className="flex-1 w-full md:w-auto">
 <div className="relative">
 <input
 type="text"
 placeholder="Search students..."
 className="input pl-10 w-full"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
 </div>
 </div>
 
 <button 
 onClick={() => {
 setEditingStudent(null);
 reset();
 setShowAddModal(true);
 }}
 className="btn btn-primary flex items-center"
 >
 <Plus className="w-5 h-5 mr-1" /> Add Student
 </button>
 </div>

 {/* Tabs */}
 <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
 <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
 <li className="mr-2">
 <button
 onClick={() => setActiveTab('all')}
 className={`inline-block p-4 rounded-t-lg ${activeTab === 'all' ? 'border-b-2 border-primary-500 text-primary-500 dark:text-primary-400' : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
 >
 All Students
 </button>
 </li>
 <li className="mr-2">
 <button
 onClick={() => setActiveTab('at-risk')}
 className={`inline-block p-4 rounded-t-lg ${activeTab === 'at-risk' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
 >
 At Risk
 </button>
 </li>
 <li className="mr-2">
 <button
 onClick={() => setActiveTab('improvement')}
 className={`inline-block p-4 rounded-t-lg ${activeTab === 'improvement' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
 >
 Needs Improvement
 </button>
 </li>
 <li className="mr-2">
 <button
 onClick={() => setActiveTab('on-track')}
 className={`inline-block p-4 rounded-t-lg ${activeTab === 'on-track' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
 >
 On Track
 </button>
 </li>
 <li>
 <button
 onClick={() => setActiveTab('excelling')}
 className={`inline-block p-4 rounded-t-lg ${activeTab === 'excelling' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
 >
 Excelling
 </button>
 </li>
 </ul>
 </div>

 {/* Students Table */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden theme-transition">
 {filteredStudents.length === 0 ? (
 <div className="flex flex-col items-center justify-center p-8 text-center">
 <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
 <p className="text-gray-500 dark:text-gray-400 mb-4">
 {searchTerm ? 'Try adjusting your search terms' : 'Add some students to get started'}
 </p>
 <button 
 onClick={() => {
 setEditingStudent(null);
 reset();
 setShowAddModal(true);
 }}
 className="btn btn-primary"
 >
 <Plus className="w-5 h-5 mr-1" /> Add Student
 </button>
 </div>
 ) : (
 <div className="table-container overflow-x-auto">
 <table className="table w-full">
 <thead>
 <tr>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('name')}
 >
 <div className="flex items-center space-x-1">
 <span>Name</span>
 {renderSortIcon('name')}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('grade')}
 >
 <div className="flex items-center space-x-1">
 <span>Grade</span>
 {renderSortIcon('grade')}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('subject')}
 >
 <div className="flex items-center space-x-1">
 <span>Subject</span>
 {renderSortIcon('subject')}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('averageScore')}
 >
 <div className="flex items-center space-x-1">
 <span>Avg. Score</span>
 {renderSortIcon('averageScore')}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('attendance')}
 >
 <div className="flex items-center space-x-1">
 <span>Attendance %</span>
 {renderSortIcon('attendance')}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('lastAssessmentDate')}
 >
 <div className="flex items-center space-x-1">
 <span>Last Assessment</span>
 {renderSortIcon('lastAssessmentDate')}
 </div>
 </th>
 <th className="table-header">Status</th>
 <th className="table-header text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {filteredStudents.map((student) => (
 <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 theme-transition">
 <td className="table-cell font-medium">
 <button 
 className="text-left hover:text-primary-500 focus:outline-none"
 onClick={() => setShowStudentDetails(student.id === showStudentDetails ? null : student.id)}
 >
 {student.name}
 </button>
 </td>
 <td className="table-cell">{student.grade}</td>
 <td className="table-cell">{student.subject}</td>
 <td className="table-cell">{student.averageScore}%</td>
 <td className="table-cell">{student.attendance}%</td>
 <td className="table-cell">{format(new Date(student.lastAssessmentDate), 'MMM d, yyyy')}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(student.status)}>
 {student.status}
 </span>
 </td>
 <td className="table-cell text-right space-x-2">
 <button
 onClick={() => handleEdit(student)}
 className="btn btn-sm btn-secondary"
 aria-label="Edit Student"
 >
 <Edit className="w-4 h-4" />
 </button>
 <button
 onClick={() => setShowConfirmDelete(student.id)}
 className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-600"
 aria-label="Delete Student"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Student Details */}
 {showStudentDetails && (
 <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 theme-transition">
 {(() => {
 const student = students.find(s => s.id === showStudentDetails);
 if (!student) return null;
 
 return (
 <div className="fade-in">
 <div className="flex items-center mb-4">
 <Award className="w-8 h-8 text-primary-500 mr-2" />
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}'s Details</h2>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
 <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
 <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject Performance</h3>
 <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{student.subject}: {student.averageScore}%</p>
 <span className={getStatusBadgeClass(student.status) + " mt-2"}>{student.status}</span>
 </div>
 
 <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
 <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Grade Level</h3>
 <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{student.grade}</p>
 </div>
 
 <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
 <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Rate</h3>
 <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{student.attendance}%</p>
 </div>
 </div>
 
 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
 <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Teacher Notes</h3>
 <p className="text-gray-900 dark:text-white whitespace-pre-line">{student.notes}</p>
 </div>
 
 <div className="mt-4 text-right">
 <button 
 onClick={() => handleEdit(student)}
 className="btn btn-primary"
 >
 <Edit className="w-4 h-4 mr-1" /> Edit Student
 </button>
 </div>
 </div>
 );
 })()}
 </div>
 )}
 </main>

 {/* Add/Edit Student Modal */}
 {showAddModal && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg mx-auto">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {editingStudent ? 'Edit Student' : 'Add New Student'}
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500 focus:outline-none"
 onClick={() => {
 setShowAddModal(false);
 setEditingStudent(null);
 reset();
 }}
 >
 ×
 </button>
 </div>
 
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
 <div className="form-group">
 <label className="form-label" htmlFor="name">Student Name</label>
 <input
 id="name"
 className={`input ${errors.name ? 'border-red-500' : ''}`}
 {...register('name', { required: 'Student name is required' })}
 />
 {errors.name && <p className="form-error">{errors.name.message}</p>}
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="grade">Grade</label>
 <select
 id="grade"
 className={`input ${errors.grade ? 'border-red-500' : ''}`}
 {...register('grade', { required: 'Grade is required' })}
 >
 <option value="">Select a grade</option>
 <option value="Kindergarten">Kindergarten</option>
 <option value="1st Grade">1st Grade</option>
 <option value="2nd Grade">2nd Grade</option>
 <option value="3rd Grade">3rd Grade</option>
 <option value="4th Grade">4th Grade</option>
 <option value="5th Grade">5th Grade</option>
 <option value="6th Grade">6th Grade</option>
 <option value="7th Grade">7th Grade</option>
 <option value="8th Grade">8th Grade</option>
 <option value="9th Grade">9th Grade</option>
 <option value="10th Grade">10th Grade</option>
 <option value="11th Grade">11th Grade</option>
 <option value="12th Grade">12th Grade</option>
 </select>
 {errors.grade && <p className="form-error">{errors.grade.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="subject">Subject</label>
 <select
 id="subject"
 className={`input ${errors.subject ? 'border-red-500' : ''}`}
 {...register('subject', { required: 'Subject is required' })}
 >
 <option value="">Select a subject</option>
 <option value="Math">Math</option>
 <option value="Science">Science</option>
 <option value="English">English</option>
 <option value="History">History</option>
 <option value="Art">Art</option>
 <option value="Music">Music</option>
 <option value="Physical Education">Physical Education</option>
 <option value="Computer Science">Computer Science</option>
 <option value="Foreign Language">Foreign Language</option>
 </select>
 {errors.subject && <p className="form-error">{errors.subject.message}</p>}
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="averageScore">Average Score (%)</label>
 <input
 id="averageScore"
 type="number"
 min="0"
 max="100"
 className={`input ${errors.averageScore ? 'border-red-500' : ''}`}
 {...register('averageScore', { 
 required: 'Average score is required',
 min: { value: 0, message: 'Score must be at least 0' },
 max: { value: 100, message: 'Score cannot exceed 100' },
 valueAsNumber: true
 })}
 />
 {errors.averageScore && <p className="form-error">{errors.averageScore.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="attendance">Attendance (%)</label>
 <input
 id="attendance"
 type="number"
 min="0"
 max="100"
 className={`input ${errors.attendance ? 'border-red-500' : ''}`}
 {...register('attendance', { 
 required: 'Attendance is required',
 min: { value: 0, message: 'Attendance must be at least 0' },
 max: { value: 100, message: 'Attendance cannot exceed 100' },
 valueAsNumber: true
 })}
 />
 {errors.attendance && <p className="form-error">{errors.attendance.message}</p>}
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="lastAssessmentDate">Last Assessment Date</label>
 <input
 id="lastAssessmentDate"
 type="date"
 className={`input ${errors.lastAssessmentDate ? 'border-red-500' : ''}`}
 {...register('lastAssessmentDate', { required: 'Assessment date is required' })}
 />
 {errors.lastAssessmentDate && <p className="form-error">{errors.lastAssessmentDate.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="notes">Notes</label>
 <textarea
 id="notes"
 rows={4}
 className="input"
 {...register('notes')}
 placeholder="Add any observations or comments about the student's progress..."
 />
 </div>
 
 <div className="modal-footer pt-4">
 <button
 type="button"
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => {
 setShowAddModal(false);
 setEditingStudent(null);
 reset();
 }}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 {editingStudent ? 'Update Student' : 'Add Student'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {showConfirmDelete && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-md mx-auto">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Delete</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 focus:outline-none"
 onClick={() => setShowConfirmDelete(null)}
 >
 ×
 </button>
 </div>
 
 <div className="mt-2">
 <p className="text-gray-600 dark:text-gray-400">
 Are you sure you want to delete this student? This action cannot be undone.
 </p>
 </div>
 
 <div className="modal-footer mt-4">
 <button
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => setShowConfirmDelete(null)}
 >
 Cancel
 </button>
 <button
 className="btn bg-red-500 text-white hover:bg-red-600"
 onClick={() => handleDelete(showConfirmDelete)}
 >
 Delete
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 shadow py-4 theme-transition">
 <div className="container-fluid">
 <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </p>
 </div>
 </footer>
 </div>
 );
};

export default App;

// Sample data
const sampleStudents: Student[] = [
 {
 id: '1',
 name: 'Emma Thompson',
 grade: '3rd Grade',
 subject: 'Math',
 averageScore: 92,
 lastAssessmentDate: '2025-03-15',
 status: 'Excelling',
 notes: 'Emma shows exceptional problem-solving skills. Consider enrichment activities to keep her challenged.',
 attendance: 98,
 },
 {
 id: '2',
 name: 'Michael Garcia',
 grade: '3rd Grade',
 subject: 'English',
 averageScore: 78,
 lastAssessmentDate: '2025-03-12',
 status: 'On Track',
 notes: 'Michael has improved his reading comprehension. Continue to encourage daily reading practice.',
 attendance: 92,
 },
 {
 id: '3',
 name: 'Sophia Lee',
 grade: '4th Grade',
 subject: 'Science',
 averageScore: 85,
 lastAssessmentDate: '2025-03-10',
 status: 'On Track',
 notes: 'Sophia is very interested in hands-on experiments. Participates actively in group discussions.',
 attendance: 95,
 },
 {
 id: '4',
 name: 'Aiden Johnson',
 grade: '5th Grade',
 subject: 'History',
 averageScore: 65,
 lastAssessmentDate: '2025-03-08',
 status: 'Needs Improvement',
 notes: 'Aiden struggles with historical dates and concepts. Recommend additional visual learning aids.',
 attendance: 88,
 },
 {
 id: '5',
 name: 'Olivia Martinez',
 grade: '2nd Grade',
 subject: 'Math',
 averageScore: 45,
 lastAssessmentDate: '2025-03-18',
 status: 'At Risk',
 notes: 'Olivia is having difficulty with basic addition and subtraction. Schedule parent conference to discuss intervention strategies.',
 attendance: 75,
 },
 {
 id: '6',
 name: 'Liam Wilson',
 grade: '6th Grade',
 subject: 'English',
 averageScore: 94,
 lastAssessmentDate: '2025-03-05',
 status: 'Excelling',
 notes: 'Liam consistently produces well-written essays with advanced vocabulary. Consider entering him in the writing competition.',
 attendance: 99,
 },
 {
 id: '7',
 name: 'Ava Brown',
 grade: '1st Grade',
 subject: 'Art',
 averageScore: 88,
 lastAssessmentDate: '2025-03-16',
 status: 'On Track',
 notes: 'Ava shows excellent creativity and attention to detail in her artwork.',
 attendance: 96,
 },
 {
 id: '8',
 name: 'Noah Taylor',
 grade: '7th Grade',
 subject: 'Computer Science',
 averageScore: 55,
 lastAssessmentDate: '2025-03-09',
 status: 'At Risk',
 notes: 'Noah is struggling with programming concepts. Recommend after-school tutoring and more hands-on practice.',
 attendance: 82,
 },
];
