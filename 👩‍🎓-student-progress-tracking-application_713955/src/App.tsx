import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Upload, Download, X, Search, Filter, Save, AlertCircle, CheckCircle, UserCheck, UserX, Clock, Shield } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface Assignment {
  id: string;
  name: string;
  maxScore: number;
  score: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  assignments: Assignment[];
  attendance: {
    date: string;
    status: AttendanceStatus;
  }[];
}

interface CSVImportData {
  studentName: string;
  email: string;
  assignmentName: string;
  maxScore: string;
  score: string;
  attendanceDate: string;
  attendanceStatus: string;
}

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'assignment' | 'attendance' | 'import'>('student');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', email: '' });
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [newAssignment, setNewAssignment] = useState({ name: '', maxScore: 0, score: 0 });
  const [newAttendance, setNewAttendance] = useState({ date: '', status: 'present' as AttendanceStatus });
  const [importData, setImportData] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('studentProgressData');
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        setStudents(parsedStudents);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    } else {
      // Initialize with sample data
      const sampleData: Student[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          assignments: [
            { id: '1', name: 'Math Quiz 1', maxScore: 100, score: 85 },
            { id: '2', name: 'History Essay', maxScore: 100, score: 92 },
            { id: '3', name: 'Science Lab', maxScore: 50, score: 45 }
          ],
          attendance: [
            { date: '2024-01-15', status: 'present' },
            { date: '2024-01-16', status: 'present' },
            { date: '2024-01-17', status: 'late' },
            { date: '2024-01-18', status: 'present' }
          ]
        },
        {
          id: '2',
          name: 'Emily Johnson',
          email: 'emily.johnson@email.com',
          assignments: [
            { id: '1', name: 'Math Quiz 1', maxScore: 100, score: 95 },
            { id: '2', name: 'History Essay', maxScore: 100, score: 88 },
            { id: '3', name: 'Science Lab', maxScore: 50, score: 48 }
          ],
          attendance: [
            { date: '2024-01-15', status: 'present' },
            { date: '2024-01-16', status: 'absent' },
            { date: '2024-01-17', status: 'excused' },
            { date: '2024-01-18', status: 'present' }
          ]
        },
        {
          id: '3',
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          assignments: [
            { id: '1', name: 'Math Quiz 1', maxScore: 100, score: 78 },
            { id: '2', name: 'History Essay', maxScore: 100, score: 84 },
            { id: '3', name: 'Science Lab', maxScore: 50, score: 42 }
          ],
          attendance: [
            { date: '2024-01-15', status: 'present' },
            { date: '2024-01-16', status: 'present' },
            { date: '2024-01-17', status: 'present' },
            { date: '2024-01-18', status: 'late' }
          ]
        }
      ];
      setStudents(sampleData);
      localStorage.setItem('studentProgressData', JSON.stringify(sampleData));
    }
  }, []);

  // Save to localStorage whenever students data changes
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('studentProgressData', JSON.stringify(students));
    }
  }, [students]);

  // Calculate overall grade for a student
  const calculateOverallGrade = (assignments: Assignment[]): number => {
    if (assignments.length === 0) return 0;
    const totalScore = assignments.reduce((sum, assignment) => sum + assignment.score, 0);
    const totalMaxScore = assignments.reduce((sum, assignment) => sum + assignment.maxScore, 0);
    return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  };

  // Calculate attendance percentage
  const calculateAttendancePercentage = (attendance: { date: string; status: AttendanceStatus }[]): number => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(record => record.status === 'present' || record.status === 'late').length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  // Get attendance status icon
  const getAttendanceStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <UserX className="w-4 h-4 text-red-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'excused':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Open modal
  const openModal = (type: 'student' | 'assignment' | 'attendance' | 'import', student?: Student) => {
    setModalType(type);
    setEditingStudent(student || null);
    if (student) {
      setNewStudent({ name: student.name, email: student.email });
      setSelectedStudentId(student.id);
    } else {
      setNewStudent({ name: '', email: '' });
      setSelectedStudentId('');
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setNewStudent({ name: '', email: '' });
    setNewAssignment({ name: '', maxScore: 0, score: 0 });
    setNewAttendance({ date: '', status: 'present' });
    setImportData('');
    setSelectedStudentId('');
    document.body.classList.remove('modal-open');
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Add or update student
  const handleSaveStudent = () => {
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    if (editingStudent) {
      setStudents(prev => prev.map(student => 
        student.id === editingStudent.id 
          ? { ...student, name: newStudent.name, email: newStudent.email }
          : student
      ));
      showNotification('success', 'Student updated successfully');
    } else {
      const newStudentData: Student = {
        id: Date.now().toString(),
        name: newStudent.name,
        email: newStudent.email,
        assignments: [],
        attendance: []
      };
      setStudents(prev => [...prev, newStudentData]);
      showNotification('success', 'Student added successfully');
    }
    closeModal();
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(student => student.id !== studentId));
      showNotification('success', 'Student deleted successfully');
    }
  };

  // Add assignment
  const handleAddAssignment = () => {
    if (!selectedStudentId || !newAssignment.name.trim() || newAssignment.maxScore <= 0) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    const assignment: Assignment = {
      id: Date.now().toString(),
      name: newAssignment.name,
      maxScore: newAssignment.maxScore,
      score: Math.min(newAssignment.score, newAssignment.maxScore)
    };

    setStudents(prev => prev.map(student => 
      student.id === selectedStudentId
        ? { ...student, assignments: [...student.assignments, assignment] }
        : student
    ));
    showNotification('success', 'Assignment added successfully');
    closeModal();
  };

  // Add attendance
  const handleAddAttendance = () => {
    if (!selectedStudentId || !newAttendance.date) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    setStudents(prev => prev.map(student => 
      student.id === selectedStudentId
        ? { 
            ...student, 
            attendance: [...student.attendance, {
              date: newAttendance.date,
              status: newAttendance.status
            }]
          }
        : student
    ));
    showNotification('success', 'Attendance added successfully');
    closeModal();
  };

  // Generate CSV template
  const generateCSVTemplate = () => {
    const headers = 'Student Name,Email,Assignment Name,Max Score,Score,Attendance Date,Attendance Status\n';
    const sampleRow = 'John Doe,john.doe@email.com,Math Quiz,100,85,2024-01-15,present\n';
    const csvContent = headers + sampleRow;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_data_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse CSV data
  const parseCSVData = (csvText: string): CSVImportData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data: CSVImportData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 7) {
        data.push({
          studentName: values[0],
          email: values[1],
          assignmentName: values[2],
          maxScore: values[3],
          score: values[4],
          attendanceDate: values[5],
          attendanceStatus: values[6]
        });
      }
    }
    return data;
  };

  // Import CSV data
  const handleImportData = () => {
    if (!importData.trim()) {
      showNotification('error', 'Please paste CSV data');
      return;
    }

    try {
      const csvData = parseCSVData(importData);
      if (csvData.length === 0) {
        showNotification('error', 'No valid data found in CSV');
        return;
      }

      const importedStudents: { [key: string]: Student } = {};

      csvData.forEach(row => {
        const studentKey = `${row.studentName}-${row.email}`;
        
        if (!importedStudents[studentKey]) {
          importedStudents[studentKey] = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: row.studentName,
            email: row.email,
            assignments: [],
            attendance: []
          };
        }

        if (row.assignmentName && row.maxScore && row.score) {
          const assignment: Assignment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: row.assignmentName,
            maxScore: parseInt(row.maxScore) || 0,
            score: parseInt(row.score) || 0
          };
          importedStudents[studentKey].assignments.push(assignment);
        }

        if (row.attendanceDate && row.attendanceStatus) {
          const attendanceStatus = row.attendanceStatus.toLowerCase() as AttendanceStatus;
          if (['present', 'absent', 'late', 'excused'].includes(attendanceStatus)) {
            importedStudents[studentKey].attendance.push({
              date: row.attendanceDate,
              status: attendanceStatus
            });
          }
        }
      });

      const newStudents = Object.values(importedStudents);
      setStudents(prev => [...prev, ...newStudents]);
      showNotification('success', `Imported ${newStudents.length} students successfully`);
      closeModal();
    } catch (error) {
      showNotification('error', 'Error parsing CSV data. Please check the format.');
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = 'Student Name,Email,Assignment Name,Max Score,Score,Attendance Date,Attendance Status\n';
    let csvContent = headers;

    students.forEach(student => {
      student.assignments.forEach(assignment => {
        csvContent += `"${student.name}","${student.email}","${assignment.name}",${assignment.maxScore},${assignment.score},,\n`;
      });
      
      student.attendance.forEach(record => {
        csvContent += `"${student.name}","${student.email}",,,,"${record.date}","${record.status}"\n`;
      });
      
      if (student.assignments.length === 0 && student.attendance.length === 0) {
        csvContent += `"${student.name}","${student.email}",,,,\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_progress_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter students based on search and filter criteria
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const hasFilterStatus = student.attendance.some(record => record.status === filterStatus);
    return matchesSearch && hasFilterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg theme-transition ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? 
              <CheckCircle className="w-5 h-5" /> : 
              <AlertCircle className="w-5 h-5" />
            }
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Track grades and attendance for students</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => openModal('student')}
                className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                role="button"
                name="add-student"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
              <button
                onClick={() => openModal('import')}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                role="button"
                name="import-data"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
              <button
                onClick={exportToCSV}
                className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                role="button"
                name="export-data"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container-wide py-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 theme-transition">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                  name="search-students"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | 'all')}
                className="input w-full"
                name="filter-attendance"
              >
                <option value="all">All Students</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="container-wide pb-8">
        {filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center theme-transition">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              {students.length === 0 ? 'Get started by adding your first student or importing data from CSV.' : 'No students match your current search criteria.'}
            </p>
            {students.length === 0 && (
              <button
                onClick={() => openModal('student')}
                className="btn btn-primary"
                role="button"
                name="add-first-student"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Student
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden theme-transition">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700">
                    <th className="table-header">Student Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Assignments</th>
                    <th className="table-header">Overall Grade</th>
                    <th className="table-header">Attendance</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredStudents.map((student) => {
                    const overallGrade = calculateOverallGrade(student.assignments);
                    const attendancePercentage = calculateAttendancePercentage(student.attendance);
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                        <td className="table-cell">
                          <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                        </td>
                        <td className="table-cell">
                          <div className="text-gray-500 dark:text-slate-400">{student.email}</div>
                        </td>
                        <td className="table-cell">
                          <div className="space-y-1">
                            {student.assignments.length === 0 ? (
                              <span className="text-gray-400 dark:text-slate-500 text-sm">No assignments</span>
                            ) : (
                              student.assignments.slice(0, 3).map((assignment) => (
                                <div key={assignment.id} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                  {assignment.name}: {assignment.score}/{assignment.maxScore}
                                </div>
                              ))
                            )}
                            {student.assignments.length > 3 && (
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                +{student.assignments.length - 3} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              overallGrade >= 90 ? 'text-green-600 dark:text-green-400' :
                              overallGrade >= 80 ? 'text-blue-600 dark:text-blue-400' :
                              overallGrade >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {overallGrade}%
                            </span>
                            <span className={`badge ${
                              overallGrade >= 90 ? 'badge-success' :
                              overallGrade >= 80 ? 'badge-info' :
                              overallGrade >= 70 ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {overallGrade >= 90 ? 'A' :
                               overallGrade >= 80 ? 'B' :
                               overallGrade >= 70 ? 'C' :
                               overallGrade >= 60 ? 'D' : 'F'}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                attendancePercentage >= 95 ? 'text-green-600 dark:text-green-400' :
                                attendancePercentage >= 85 ? 'text-blue-600 dark:text-blue-400' :
                                attendancePercentage >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {attendancePercentage}%
                              </span>
                            </div>
                            {student.attendance.length > 0 && (
                              <div className="flex gap-1">
                                {student.attendance.slice(-5).map((record, index) => (
                                  <div key={index} className="flex items-center" title={`${record.date}: ${record.status}`}>
                                    {getAttendanceStatusIcon(record.status)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex flex-col sm:flex-row gap-1">
                            <button
                              onClick={() => openModal('student', student)}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex items-center justify-center gap-1"
                              role="button"
                              name={`edit-student-${student.id}`}
                            >
                              <Edit2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                openModal('assignment');
                              }}
                              className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 flex items-center justify-center gap-1"
                              role="button"
                              name={`add-assignment-${student.id}`}
                            >
                              <Plus className="w-3 h-3" />
                              <span className="hidden sm:inline">Assignment</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                openModal('attendance');
                              }}
                              className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 flex items-center justify-center gap-1"
                              role="button"
                              name={`add-attendance-${student.id}`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span className="hidden sm:inline">Attendance</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 flex items-center justify-center gap-1"
                              role="button"
                              name={`delete-student-${student.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalType === 'student' && (editingStudent ? 'Edit Student' : 'Add New Student')}
                {modalType === 'assignment' && 'Add Assignment'}
                {modalType === 'attendance' && 'Add Attendance Record'}
                {modalType === 'import' && 'Import Data from CSV'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                role="button"
                name="close-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              {modalType === 'student' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="student-name">Student Name *</label>
                    <input
                      id="student-name"
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter student name"
                      name="student-name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="student-email">Email *</label>
                    <input
                      id="student-email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                      placeholder="Enter email address"
                      name="student-email"
                    />
                  </div>
                </div>
              )}

              {modalType === 'assignment' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="student-select">Select Student *</label>
                    <select
                      id="student-select"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="input"
                      name="student-select"
                    >
                      <option value="">Choose a student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignment-name">Assignment Name *</label>
                    <input
                      id="assignment-name"
                      type="text"
                      value={newAssignment.name}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter assignment name"
                      name="assignment-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="max-score">Max Score *</label>
                      <input
                        id="max-score"
                        type="number"
                        min="1"
                        value={newAssignment.maxScore || ''}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 0 }))}
                        className="input"
                        placeholder="100"
                        name="max-score"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="score">Score Earned</label>
                      <input
                        id="score"
                        type="number"
                        min="0"
                        max={newAssignment.maxScore}
                        value={newAssignment.score || ''}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                        className="input"
                        placeholder="85"
                        name="score"
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'attendance' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="attendance-student-select">Select Student *</label>
                    <select
                      id="attendance-student-select"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="input"
                      name="attendance-student-select"
                    >
                      <option value="">Choose a student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="attendance-date">Date *</label>
                    <input
                      id="attendance-date"
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                      className="input"
                      name="attendance-date"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="attendance-status">Status *</label>
                    <select
                      id="attendance-status"
                      value={newAttendance.status}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, status: e.target.value as AttendanceStatus }))}
                      className="input"
                      name="attendance-status"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  </div>
                </div>
              )}

              {modalType === 'import' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">CSV Format Instructions</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
                      Upload data in CSV format with columns: Student Name, Email, Assignment Name, Max Score, Score, Attendance Date, Attendance Status
                    </p>
                    <button
                      onClick={generateCSVTemplate}
                      className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      role="button"
                      name="download-template"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="csv-data">Paste CSV Data *</label>
                    <textarea
                      id="csv-data"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="input"
                      rows={8}
                      placeholder="Student Name,Email,Assignment Name,Max Score,Score,Attendance Date,Attendance Status
John Doe,john.doe@email.com,Math Quiz,100,85,2024-01-15,present"
                      name="csv-data"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={closeModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                role="button"
                name="cancel-modal"
              >
                Cancel
              </button>
              <button
                onClick={
                  modalType === 'student' ? handleSaveStudent :
                  modalType === 'assignment' ? handleAddAssignment :
                  modalType === 'attendance' ? handleAddAttendance :
                  handleImportData
                }
                className="btn btn-primary flex items-center gap-2"
                role="button"
                name="save-modal"
              >
                <Save className="w-4 h-4" />
                {modalType === 'student' && (editingStudent ? 'Update Student' : 'Add Student')}
                {modalType === 'assignment' && 'Add Assignment'}
                {modalType === 'attendance' && 'Add Attendance'}
                {modalType === 'import' && 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-wide">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;