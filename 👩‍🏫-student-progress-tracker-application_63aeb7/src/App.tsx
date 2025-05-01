import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import {
  User,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUp,
  ArrowDown,
  GraduationCap,
  BookOpen,
  Check,
  FileText,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ChartPie as PieChartIcon,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Define types
interface Student {
  id: string;
  name: string;
  grade: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  subjects: Subject[];
  attendance: number;
  notes: string;
}

interface Subject {
  id: string;
  name: string;
  scores: Score[];
}

interface Score {
  id: string;
  date: string;
  value: number;
  maxScore: number;
}

interface StudentFormData {
  name: string;
  grade: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  attendance: number;
  notes: string;
}

interface SubjectFormData {
  name: string;
}

interface ScoreFormData {
  value: number;
  maxScore: number;
  date: string;
}

interface SortConfig {
  key: keyof Student | 'average';
  direction: 'ascending' | 'descending';
}

type ChartType = 'bar' | 'line' | 'pie';

const App: React.FC = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  
  const [studentForm, setStudentForm] = useState<StudentFormData>({ 
    name: '', 
    grade: '', 
    age: 0, 
    gender: 'Male', 
    attendance: 100,
    notes: ''
  });
  const [subjectForm, setSubjectForm] = useState<SubjectFormData>({ name: '' });
  const [scoreForm, setScoreForm] = useState<ScoreFormData>({ value: 0, maxScore: 100, date: new Date().toISOString().split('T')[0] });
  
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingEntityId, setEditingEntityId] = useState<string>('');
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'students' | 'reports'>('dashboard');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Sample data for demonstration
      const sampleStudents: Student[] = [
        {
          id: '1',
          name: 'John Smith',
          grade: '10th',
          age: 16,
          gender: 'Male',
          attendance: 95,
          notes: 'Excellent in mathematics',
          subjects: [
            {
              id: 's1',
              name: 'Mathematics',
              scores: [
                { id: 'sc1', date: '2023-09-15', value: 90, maxScore: 100 },
                { id: 'sc2', date: '2023-10-20', value: 85, maxScore: 100 }
              ]
            },
            {
              id: 's2',
              name: 'Science',
              scores: [
                { id: 'sc3', date: '2023-09-18', value: 78, maxScore: 100 },
                { id: 'sc4', date: '2023-10-22', value: 82, maxScore: 100 }
              ]
            }
          ]
        },
        {
          id: '2',
          name: 'Emily Johnson',
          grade: '9th',
          age: 15,
          gender: 'Female',
          attendance: 92,
          notes: 'Excellent in language arts',
          subjects: [
            {
              id: 's3',
              name: 'English',
              scores: [
                { id: 'sc5', date: '2023-09-14', value: 92, maxScore: 100 },
                { id: 'sc6', date: '2023-10-19', value: 95, maxScore: 100 }
              ]
            },
            {
              id: 's4',
              name: 'History',
              scores: [
                { id: 'sc7', date: '2023-09-16', value: 88, maxScore: 100 },
                { id: 'sc8', date: '2023-10-21', value: 85, maxScore: 100 }
              ]
            }
          ]
        },
        {
          id: '3',
          name: 'Michael Brown',
          grade: '10th',
          age: 16,
          gender: 'Male',
          attendance: 88,
          notes: 'Needs improvement in science',
          subjects: [
            {
              id: 's5',
              name: 'Mathematics',
              scores: [
                { id: 'sc9', date: '2023-09-15', value: 75, maxScore: 100 },
                { id: 'sc10', date: '2023-10-20', value: 80, maxScore: 100 }
              ]
            },
            {
              id: 's6',
              name: 'Science',
              scores: [
                { id: 'sc11', date: '2023-09-18', value: 65, maxScore: 100 },
                { id: 'sc12', date: '2023-10-22', value: 70, maxScore: 100 }
              ]
            }
          ]
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('students', JSON.stringify(sampleStudents));
    }

    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Close modals when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const closeAllModals = () => {
    setShowStudentModal(false);
    setShowSubjectModal(false);
    setShowScoreModal(false);
    setShowDeleteConfirm(false);
    setIsEditMode(false);
  };

  // Student CRUD operations
  const addStudent = () => {
    const newStudent: Student = {
      id: generateId(),
      name: studentForm.name,
      grade: studentForm.grade,
      age: studentForm.age,
      gender: studentForm.gender,
      subjects: [],
      attendance: studentForm.attendance,
      notes: studentForm.notes
    };

    setStudents([...students, newStudent]);
    setShowStudentModal(false);
    setStudentForm({ name: '', grade: '', age: 0, gender: 'Male', attendance: 100, notes: '' });
  };

  const updateStudent = () => {
    if (editingEntityId) {
      const updatedStudents = students.map(student => {
        if (student.id === editingEntityId) {
          return {
            ...student,
            name: studentForm.name,
            grade: studentForm.grade,
            age: studentForm.age,
            gender: studentForm.gender,
            attendance: studentForm.attendance,
            notes: studentForm.notes
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setShowStudentModal(false);
      setIsEditMode(false);
      setEditingEntityId('');
      setStudentForm({ name: '', grade: '', age: 0, gender: 'Male', attendance: 100, notes: '' });
    }
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
    setShowDeleteConfirm(false);
    setSelectedStudent(null);
  };

  // Subject CRUD operations
  const addSubject = () => {
    if (selectedStudent) {
      const newSubject: Subject = {
        id: generateId(),
        name: subjectForm.name,
        scores: []
      };

      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: [...student.subjects, newSubject]
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id) || null);
      setShowSubjectModal(false);
      setSubjectForm({ name: '' });
    }
  };

  const updateSubject = () => {
    if (selectedStudent && selectedSubject && editingEntityId) {
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: student.subjects.map(subject => {
              if (subject.id === editingEntityId) {
                return {
                  ...subject,
                  name: subjectForm.name
                };
              }
              return subject;
            })
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id) || null);
      setShowSubjectModal(false);
      setIsEditMode(false);
      setEditingEntityId('');
      setSubjectForm({ name: '' });
    }
  };

  const deleteSubject = (subjectId: string) => {
    if (selectedStudent) {
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: student.subjects.filter(subject => subject.id !== subjectId)
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id) || null);
      setSelectedSubject(null);
      setShowDeleteConfirm(false);
    }
  };

  // Score CRUD operations
  const addScore = () => {
    if (selectedStudent && selectedSubject) {
      const newScore: Score = {
        id: generateId(),
        value: scoreForm.value,
        maxScore: scoreForm.maxScore,
        date: scoreForm.date
      };

      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: student.subjects.map(subject => {
              if (subject.id === selectedSubject.id) {
                return {
                  ...subject,
                  scores: [...subject.scores, newScore]
                };
              }
              return subject;
            })
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id) || null);
      setSelectedSubject(
        updatedStudents
          .find(s => s.id === selectedStudent.id)?.subjects
          .find(s => s.id === selectedSubject.id) || null
      );
      setShowScoreModal(false);
      setScoreForm({ value: 0, maxScore: 100, date: new Date().toISOString().split('T')[0] });
    }
  };

  const updateScore = () => {
    if (selectedStudent && selectedSubject && editingEntityId) {
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: student.subjects.map(subject => {
              if (subject.id === selectedSubject.id) {
                return {
                  ...subject,
                  scores: subject.scores.map(score => {
                    if (score.id === editingEntityId) {
                      return {
                        ...score,
                        value: scoreForm.value,
                        maxScore: scoreForm.maxScore,
                        date: scoreForm.date
                      };
                    }
                    return score;
                  })
                };
              }
              return subject;
            })
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id) || null);
      setSelectedSubject(
        updatedStudents
          .find(s => s.id === selectedStudent.id)?.subjects
          .find(s => s.id === selectedSubject.id) || null
      );
      setShowScoreModal(false);
      setIsEditMode(false);
      setEditingEntityId('');
      setScoreForm({ value: 0, maxScore: 100, date: new Date().toISOString().split('T')[0] });
    }
  };

  const deleteScore = (scoreId: string) => {
    if (selectedStudent && selectedSubject) {
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            subjects: student.subjects.map(subject => {
              if (subject.id === selectedSubject.id) {
                return {
                  ...subject,
                  scores: subject.scores.filter(score => score.id !== scoreId)
                };
              }
              return subject;
            })
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id) || null);
      setSelectedSubject(
        updatedStudents
          .find(s => s.id === selectedStudent.id)?.subjects
          .find(s => s.id === selectedSubject.id) || null
      );
      setShowDeleteConfirm(false);
    }
  };

  // Calculate average score for a student
  const calculateAverageScore = (student: Student): number => {
    let totalScore = 0;
    let totalMaxScore = 0;
    
    student.subjects.forEach(subject => {
      subject.scores.forEach(score => {
        totalScore += score.value;
        totalMaxScore += score.maxScore;
      });
    });
    
    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  };

  // Calculate average score for a subject
  const calculateSubjectAverage = (subject: Subject): number => {
    if (!subject.scores.length) return 0;
    
    const totalScore = subject.scores.reduce((sum, score) => sum + score.value, 0);
    const totalMaxScore = subject.scores.reduce((sum, score) => sum + score.maxScore, 0);
    
    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  };

  // Format date to display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter and sort students
  const getFilteredAndSortedStudents = (): Student[] => {
    let filteredStudents = [...students];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.grade.toLowerCase().includes(searchLower) ||
        student.notes.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply grade filter
    if (filterGrade !== 'All') {
      filteredStudents = filteredStudents.filter(student => student.grade === filterGrade);
    }
    
    // Apply sorting
    filteredStudents.sort((a, b) => {
      if (sortConfig.key === 'average') {
        const aAvg = calculateAverageScore(a);
        const bAvg = calculateAverageScore(b);
        return sortConfig.direction === 'ascending' ? aAvg - bAvg : bAvg - aAvg;
      } else {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      }
    });
    
    return filteredStudents;
  };

  // Extract unique grades for filter dropdown
  const uniqueGrades = ['All', ...new Set(students.map(student => student.grade))];

  // Handle sorting
  const handleSort = (key: keyof Student | 'average') => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
    });
  };

  // Prepare data for charts
  const getAveragesBySubject = () => {
    const subjectAverages: { [key: string]: { total: number; count: number } } = {};
    
    students.forEach(student => {
      student.subjects.forEach(subject => {
        if (!subjectAverages[subject.name]) {
          subjectAverages[subject.name] = { total: 0, count: 0 };
        }
        const avg = calculateSubjectAverage(subject);
        subjectAverages[subject.name].total += avg;
        subjectAverages[subject.name].count += 1;
      });
    });
    
    return Object.entries(subjectAverages).map(([name, data]) => ({
      name,
      average: data.total / data.count
    }));
  };

  const getStudentAverages = () => {
    return students.map(student => ({
      name: student.name,
      average: calculateAverageScore(student),
      attendance: student.attendance
    }));
  };

  const getGradeDistribution = () => {
    const gradeCount: { [key: string]: number } = {};
    
    students.forEach(student => {
      if (!gradeCount[student.grade]) {
        gradeCount[student.grade] = 0;
      }
      gradeCount[student.grade] += 1;
    });
    
    return Object.entries(gradeCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Generate colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Rendering helpers
  const renderDashboard = () => {
    const subjectAverages = getAveragesBySubject();
    const studentAverages = getStudentAverages();
    const gradeDistribution = getGradeDistribution();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Students</div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-desc">Active students</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Average Score</div>
            <div className="stat-value">
              {students.length > 0 
                ? `${(studentAverages.reduce((sum, s) => sum + s.average, 0) / studentAverages.length).toFixed(1)}%`
                : '0%'}
            </div>
            <div className="stat-desc">Overall performance</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Average Attendance</div>
            <div className="stat-value">
              {students.length > 0 
                ? `${(students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1)}%`
                : '0%'}
            </div>
            <div className="stat-desc">Class attendance rate</div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Subject Performance Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Average']} />
                <Legend />
                <Bar dataKey="average" fill="#8884d8" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Student Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentAverages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#8884d8" name="Average Score (%)" />
                  <Line type="monotone" dataKey="attendance" stroke="#82ca9d" name="Attendance (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Grade Distribution</h3>
            <div className="h-72 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Students']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentList = () => {
    const filteredStudents = getFilteredAndSortedStudents();
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
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
          
          <div className="w-full sm:w-48">
            <select
              className="input"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn btn-primary flex items-center gap-2" 
            onClick={() => {
              setIsEditMode(false);
              setStudentForm({ name: '', grade: '', age: 0, gender: 'Male', attendance: 100, notes: '' });
              setShowStudentModal(true);
            }}
          >
            <Plus className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="table-header">
              <tr>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('grade')}>
                  <div className="flex items-center">
                    <span>Grade</span>
                    {sortConfig.key === 'grade' && (
                      sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('age')}>
                  <div className="flex items-center">
                    <span>Age</span>
                    {sortConfig.key === 'age' && (
                      sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('attendance')}>
                  <div className="flex items-center">
                    <span>Attendance</span>
                    {sortConfig.key === 'attendance' && (
                      sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('average')}>
                  <div className="flex items-center">
                    <span>Average</span>
                    {sortConfig.key === 'average' && (
                      sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr 
                    key={student.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedStudent?.id === student.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="table-cell">{student.name}</td>
                    <td className="table-cell">{student.grade}</td>
                    <td className="table-cell">{student.age}</td>
                    <td className="table-cell">{student.attendance}%</td>
                    <td className="table-cell">{calculateAverageScore(student).toFixed(1)}%</td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditMode(true);
                            setEditingEntityId(student.id);
                            setStudentForm({
                              name: student.name,
                              grade: student.grade,
                              age: student.age,
                              gender: student.gender,
                              attendance: student.attendance,
                              notes: student.notes
                            });
                            setShowStudentModal(true);
                          }}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEntityId(student.id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8">No students found. Add a student to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Selected Student Detail */}
        {selectedStudent && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedStudent.name}'s Profile</h3>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => {
                  setIsEditMode(false);
                  setSubjectForm({ name: '' });
                  setShowSubjectModal(true);
                }}
              >
                <Plus className="h-5 w-5" />
                <span>Add Subject</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="text-lg font-medium mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Grade:</span>
                    <span>{selectedStudent.grade}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Age:</span>
                    <span>{selectedStudent.age}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Gender:</span>
                    <span>{selectedStudent.gender}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Attendance:</span>
                    <span>{selectedStudent.attendance}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Notes:</span>
                    <span className="mt-1">{selectedStudent.notes || 'No notes available'}</span>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h4 className="text-lg font-medium mb-4">Academic Performance</h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Overall Average:</span>
                    <span className="font-semibold text-lg">{calculateAverageScore(selectedStudent).toFixed(1)}%</span>
                  </div>
                  <div className="pt-2">
                    <h5 className="font-medium mb-2">Subject Averages:</h5>
                    {selectedStudent.subjects.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedStudent.subjects.map(subject => (
                          <li key={subject.id} className="flex justify-between">
                            <span>{subject.name}</span>
                            <span>{calculateSubjectAverage(subject).toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No subjects added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subject List */}
            <div className="card">
              <h4 className="text-lg font-medium mb-4">Subjects & Assessments</h4>
              
              {selectedStudent.subjects.length > 0 ? (
                <div className="space-y-6">
                  {selectedStudent.subjects.map(subject => (
                    <div 
                      key={subject.id} 
                      className={`p-4 rounded-md border ${selectedSubject?.id === subject.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">{subject.name}</h5>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditMode(true);
                              setEditingEntityId(subject.id);
                              setSubjectForm({ name: subject.name });
                              setSelectedSubject(subject);
                              setShowSubjectModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(subject);
                              setEditingEntityId(subject.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {subject.scores.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Score</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Percentage</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {subject.scores.map(score => (
                                <tr key={score.id}>
                                  <td className="px-4 py-2 whitespace-nowrap">{formatDate(score.date)}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">{score.value} / {score.maxScore}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">{((score.value / score.maxScore) * 100).toFixed(1)}%</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        onClick={() => {
                                          setIsEditMode(true);
                                          setEditingEntityId(score.id);
                                          setScoreForm({
                                            value: score.value,
                                            maxScore: score.maxScore,
                                            date: score.date
                                          });
                                          setShowScoreModal(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button 
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        onClick={() => {
                                          setEditingEntityId(score.id);
                                          setShowDeleteConfirm(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No assessments recorded yet.</p>
                      )}
                      
                      {selectedSubject?.id === subject.id && (
                        <div className="mt-4">
                          <button 
                            className="btn btn-sm btn-primary flex items-center gap-1"
                            onClick={() => {
                              setIsEditMode(false);
                              setScoreForm({ value: 0, maxScore: 100, date: new Date().toISOString().split('T')[0] });
                              setShowScoreModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Assessment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No subjects added yet. Add a subject to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => {
    const subjectAverages = getAveragesBySubject();
    const studentAverages = getStudentAverages();
    const gradeDistribution = getGradeDistribution();
    
    // Chart components based on selected type
    const renderChartType = () => {
      switch (chartType) {
        case 'bar':
          return (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentAverages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" name="Average Score (%)" />
                  <Bar dataKey="attendance" fill="#82ca9d" name="Attendance (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        case 'line':
          return (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subjectAverages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Average']} />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#8884d8" name="Subject Average" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        case 'pie':
          return (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Students']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        default:
          return null;
      }
    };
    
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-xl font-semibold mb-4 sm:mb-0">Performance Reports</h3>
            <div className="flex space-x-2">
              <button 
                className={`btn ${chartType === 'bar' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'} flex items-center gap-1`}
                onClick={() => setChartType('bar')}
              >
                <BarChartIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Bar</span>
              </button>
              <button 
                className={`btn ${chartType === 'line' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'} flex items-center gap-1`}
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Line</span>
              </button>
              <button 
                className={`btn ${chartType === 'pie' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'} flex items-center gap-1`}
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Pie</span>
              </button>
            </div>
          </div>
          
          {renderChartType()}
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Student Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-cell">Student</th>
                  <th className="table-cell">Grade</th>
                  <th className="table-cell">Average Score</th>
                  <th className="table-cell">Attendance</th>
                  <th className="table-cell">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {students.map(student => {
                  const average = calculateAverageScore(student);
                  let status;
                  if (average >= 90) status = 'Excellent';
                  else if (average >= 80) status = 'Good';
                  else if (average >= 70) status = 'Satisfactory';
                  else if (average >= 60) status = 'Needs Improvement';
                  else status = 'At Risk';
                  
                  return (
                    <tr key={student.id}>
                      <td className="table-cell">{student.name}</td>
                      <td className="table-cell">{student.grade}</td>
                      <td className="table-cell">{average.toFixed(1)}%</td>
                      <td className="table-cell">{student.attendance}%</td>
                      <td className="table-cell">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            average >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            average >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            average >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            average >= 60 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold">Student Progress Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
              </button>
              <button 
                className="md:hidden text-gray-500 dark:text-gray-400"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <nav className="mt-4 md:hidden space-y-2">
              <button 
                className={`w-full text-left py-2 px-4 rounded ${currentView === 'dashboard' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsMobileMenuOpen(false);
                }}
              >
                Dashboard
              </button>
              <button 
                className={`w-full text-left py-2 px-4 rounded ${currentView === 'students' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => {
                  setCurrentView('students');
                  setIsMobileMenuOpen(false);
                }}
              >
                Students
              </button>
              <button 
                className={`w-full text-left py-2 px-4 rounded ${currentView === 'reports' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => {
                  setCurrentView('reports');
                  setIsMobileMenuOpen(false);
                }}
              >
                Reports
              </button>
            </nav>
          )}
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="hidden md:block bg-white shadow-sm dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="container-fluid">
          <div className="flex space-x-8">
            <button 
              className={`px-3 py-4 text-sm font-medium border-b-2 ${currentView === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-3 py-4 text-sm font-medium border-b-2 ${currentView === 'students' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
              onClick={() => setCurrentView('students')}
            >
              Students
            </button>
            <button 
              className={`px-3 py-4 text-sm font-medium border-b-2 ${currentView === 'reports' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
              onClick={() => setCurrentView('reports')}
            >
              Reports
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'students' && renderStudentList()}
        {currentView === 'reports' && renderReports()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner dark:bg-gray-800 py-6 mt-auto">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Modals */}
      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">{isEditMode ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={closeAllModals}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              isEditMode ? updateStudent() : addStudent();
            }}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="grade">Grade</label>
                  <input
                    type="text"
                    id="grade"
                    className="input"
                    value={studentForm.grade}
                    onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    className="input"
                    min="0"
                    value={studentForm.age}
                    onChange={(e) => setStudentForm({...studentForm, age: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    className="input"
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({...studentForm, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="attendance">Attendance (%)</label>
                  <input
                    type="number"
                    id="attendance"
                    className="input"
                    min="0"
                    max="100"
                    value={studentForm.attendance}
                    onChange={(e) => setStudentForm({...studentForm, attendance: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="input"
                    rows={3}
                    value={studentForm.notes}
                    onChange={(e) => setStudentForm({...studentForm, notes: e.target.value})}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" onClick={closeAllModals}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">{isEditMode ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={closeAllModals}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              isEditMode ? updateSubject() : addSubject();
            }}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="subjectName">Subject Name</label>
                  <input
                    type="text"
                    id="subjectName"
                    className="input"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" onClick={closeAllModals}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Score Modal */}
      {showScoreModal && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">{isEditMode ? 'Edit Assessment' : 'Add New Assessment'}</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={closeAllModals}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              isEditMode ? updateScore() : addScore();
            }}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="scoreValue">Score</label>
                  <input
                    type="number"
                    id="scoreValue"
                    className="input"
                    min="0"
                    value={scoreForm.value}
                    onChange={(e) => setScoreForm({...scoreForm, value: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="maxScore">Max Score</label>
                  <input
                    type="number"
                    id="maxScore"
                    className="input"
                    min="1"
                    value={scoreForm.maxScore}
                    onChange={(e) => setScoreForm({...scoreForm, maxScore: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="scoreDate">Date</label>
                  <input
                    type="date"
                    id="scoreDate"
                    className="input"
                    value={scoreForm.date}
                    onChange={(e) => setScoreForm({...scoreForm, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" onClick={closeAllModals}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={closeAllModals}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="my-4">
              <p>Are you sure you want to delete this {selectedSubject ? (selectedSubject.scores.find(s => s.id === editingEntityId) ? 'assessment' : 'subject') : 'student'}? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" onClick={closeAllModals}>Cancel</button>
              <button 
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (selectedSubject) {
                    if (selectedSubject.scores.find(s => s.id === editingEntityId)) {
                      deleteScore(editingEntityId);
                    } else {
                      deleteSubject(editingEntityId);
                    }
                  } else {
                    deleteStudent(editingEntityId);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;