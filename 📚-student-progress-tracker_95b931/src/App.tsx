import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

import {
  Users, UserPlus, UserRound, Pencil, Trash2, Search, Filter as FilterIcon, ArrowUpDown, XCircle, CheckCircle, BookOpen, FileText,
  LayoutDashboard, BarChart3, Settings, Sun, Moon, LogOut, PlusCircle, Download, Upload, BrainCircuit, Sparkles, Eye,
  ChevronDown, ChevronUp, AlertTriangle, Info, CalendarDays, Save, HelpCircle, MessageSquare, FileSpreadsheet, Trash
} from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Constants
const APP_NAME = "Student Progress Tracker";
const CURRENT_YEAR = 2025;
const TODAY_DATE = "2025-06-06";

// Types and Interfaces
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  classId: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxPoints: number;
  classId: string;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number | null;
  comments?: string;
  gradedDate?: string;
}

interface ClassSubject {
  id: string;
  name: string;
}

interface GradeCategory {
  id: string;
  name: string;
  weight: number; // Percentage
}

type AppTab = "dashboard" | "students" | "assignments" | "reports" | "ai-tools" | "settings";

type ModalType = "addStudent" | "editStudent" | "addAssignment" | "editAssignment" | "gradeAssignment" | "confirmDelete" | "viewStudentReport" | "manageClasses" | "manageGradeCategories" | "aiHelp" | null;

interface SortConfig {
  key: keyof Student | keyof Assignment | keyof Grade;
  direction: 'ascending' | 'descending';
}

const initialStudents: Student[] = [
  { id: 's1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', classId: 'c1' },
  { id: 's2', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', classId: 'c1' },
  { id: 's3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', classId: 'c2' },
];

const initialAssignments: Assignment[] = [
  { id: 'a1', title: 'Algebra Homework 1', dueDate: '2025-06-15', maxPoints: 100, classId: 'c1', description: 'Chapter 1 problems' },
  { id: 'a2', title: 'History Essay', dueDate: '2025-06-20', maxPoints: 50, classId: 'c2', description: 'Essay on the Renaissance' },
  { id: 'a3', title: 'Science Lab Report', dueDate: '2025-07-01', maxPoints: 75, classId: 'c1', description: 'Photosynthesis experiment' },
];

const initialGrades: Grade[] = [
  { id: 'g1', studentId: 's1', assignmentId: 'a1', score: 85, comments: 'Good effort', gradedDate: '2025-06-17' },
  { id: 'g2', studentId: 's2', assignmentId: 'a1', score: 92, comments: 'Excellent work!', gradedDate: '2025-06-17' },
  { id: 'g3', studentId: 's1', assignmentId: 'a3', score: 68, comments: 'Needs more detail in methodology.', gradedDate: '2025-07-03' },
];

const initialClasses: ClassSubject[] = [
  { id: 'c1', name: 'Math Grade 10' },
  { id: 'c2', name: 'History Grade 10' },
];

const initialGradeCategories: GradeCategory[] = [
  { id: 'gc1', name: 'Homework', weight: 30 },
  { id: 'gc2', name: 'Quizzes', weight: 20 },
  { id: 'gc3', name: 'Exams', weight: 50 },
];

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('spt-darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [students, setStudents] = useState<Student[]>(() => JSON.parse(localStorage.getItem('spt-students') || JSON.stringify(initialStudents)));
  const [assignments, setAssignments] = useState<Assignment[]>(() => JSON.parse(localStorage.getItem('spt-assignments') || JSON.stringify(initialAssignments)));
  const [grades, setGrades] = useState<Grade[]>(() => JSON.parse(localStorage.getItem('spt-grades') || JSON.stringify(initialGrades)));
  const [classes, setClasses] = useState<ClassSubject[]>(() => JSON.parse(localStorage.getItem('spt-classes') || JSON.stringify(initialClasses)));
  const [gradeCategories, setGradeCategories] = useState<GradeCategory[]>(() => JSON.parse(localStorage.getItem('spt-gradeCategories') || JSON.stringify(initialGradeCategories)));

  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [currentItem, setCurrentItem] = useState<Student | Assignment | Grade | ClassSubject | GradeCategory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'assignment' | 'grade' | 'class' | 'gradeCategory'; id: string } | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [formState, setFormState] = useState<any>({});
  const [gradeFormState, setGradeFormState] = useState<{ studentId: string, assignmentId: string, score: string, comments: string }>({ studentId: '', assignmentId: '', score: '', comments: '' });
  
  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null); // Not used in this app for now
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [currentAiTask, setCurrentAiTask] = useState<string | null>(null); // To identify which AI task is running

  // Persist data to localStorage
  useEffect(() => { localStorage.setItem('spt-darkMode', String(isDarkMode)); document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('spt-students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('spt-assignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('spt-grades', JSON.stringify(grades)); }, [grades]);
  useEffect(() => { localStorage.setItem('spt-classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('spt-gradeCategories', JSON.stringify(gradeCategories)); }, [gradeCategories]);

  // Modal escape key handler
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);


  const getStudentAverage = useCallback((studentId: string): number | string => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.score !== null);
    if (studentGrades.length === 0) return 'N/A';
    const totalScore = studentGrades.reduce((acc, g) => {
        const assignment = assignments.find(a => a.id === g.assignmentId);
        if (assignment && assignment.maxPoints > 0 && g.score !== null) {
            return acc + (g.score / assignment.maxPoints) * 100;
        }
        return acc;
    }, 0);
    const relevantAssignmentsCount = studentGrades.filter(g => {
        const assignment = assignments.find(a => a.id === g.assignmentId);
        return assignment && assignment.maxPoints > 0;
    }).length;

    return relevantAssignmentsCount > 0 ? parseFloat((totalScore / relevantAssignmentsCount).toFixed(1)) : 'N/A';
  }, [grades, assignments]);
  
  const getAssignmentAverage = useCallback((assignmentId: string): number | string => {
    const assignmentGrades = grades.filter(g => g.assignmentId === assignmentId && g.score !== null);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment || assignmentGrades.length === 0) return 'N/A';
    const totalScore = assignmentGrades.reduce((acc, g) => acc + (g.score ?? 0), 0);
    return parseFloat((totalScore / assignmentGrades.length).toFixed(1));
  }, [grades, assignments]);

  const openModal = (type: ModalType, item: Student | Assignment | Grade | ClassSubject | GradeCategory | null = null) => {
    setModalOpen(type);
    setCurrentItem(item);
    if (item && (type === 'editStudent' || type === 'editAssignment' || type === 'manageClasses' || type === 'manageGradeCategories')) {
      setFormState(item);
    } else if (type === 'addStudent' || type === 'addAssignment' || type === 'manageClasses' || type === 'manageGradeCategories') {
      setFormState({});
    } else if (type === 'gradeAssignment' && item && 'studentId' in item && 'assignmentId' in item) { // Grade object
      const gradeItem = item as Grade;
      setGradeFormState({ studentId: gradeItem.studentId, assignmentId: gradeItem.assignmentId, score: gradeItem.score?.toString() || '', comments: gradeItem.comments || '' });
    }
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModalOpen(null);
    setCurrentItem(null);
    setFormState({});
    setGradeFormState({ studentId: '', assignmentId: '', score: '', comments: '' });
    setItemToDelete(null);
    setAiResult(null);
    setAiError(null);
    setAiPromptText('');
    setCurrentAiTask(null);
    document.body.classList.remove('modal-open');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev: any) => ({ ...prev, [name]: name === 'maxPoints' || name === 'weight' ? parseFloat(value) : value }));
  };

  const handleGradeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGradeFormState(prev => ({ ...prev, [name]: name === 'score' ? value : value }));
  };

  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSaveStudent = () => {
    if (!formState.firstName || !formState.lastName || !formState.classId) {
      alert("First Name, Last Name, and Class are required.");
      return;
    }
    if (modalOpen === 'addStudent') {
      setStudents(prev => [...prev, { ...formState, id: generateId() } as Student]);
    } else if (modalOpen === 'editStudent' && currentItem) {
      setStudents(prev => prev.map(s => s.id === (currentItem as Student).id ? { ...s, ...formState } : s));
    }
    closeModal();
  };

  const handleSaveAssignment = () => {
    if (!formState.title || !formState.dueDate || !formState.maxPoints || !formState.classId) {
        alert("Title, Due Date, Max Points, and Class are required.");
        return;
    }
    if (isNaN(formState.maxPoints) || formState.maxPoints <= 0) {
        alert("Max Points must be a positive number.");
        return;
    }
    if (modalOpen === 'addAssignment') {
      setAssignments(prev => [...prev, { ...formState, id: generateId() } as Assignment]);
    } else if (modalOpen === 'editAssignment' && currentItem) {
      setAssignments(prev => prev.map(a => a.id === (currentItem as Assignment).id ? { ...a, ...formState } : a));
    }
    closeModal();
  };
  
  const handleSaveGrade = () => {
    if (gradeFormState.score === '' || isNaN(parseFloat(gradeFormState.score))) {
        alert("Valid score is required.");
        return;
    }
    const scoreValue = parseFloat(gradeFormState.score);
    const assignment = assignments.find(a => a.id === gradeFormState.assignmentId);
    if (assignment && (scoreValue < 0 || scoreValue > assignment.maxPoints)) {
        alert(`Score must be between 0 and ${assignment.maxPoints}.`);
        return;
    }

    const existingGrade = grades.find(g => g.studentId === gradeFormState.studentId && g.assignmentId === gradeFormState.assignmentId);
    if (existingGrade) {
      setGrades(prev => prev.map(g => g.id === existingGrade.id ? { ...g, score: scoreValue, comments: gradeFormState.comments, gradedDate: TODAY_DATE } : g));
    } else {
      setGrades(prev => [...prev, { id: generateId(), ...gradeFormState, score: scoreValue, gradedDate: TODAY_DATE } as Grade]);
    }
    closeModal();
  };

  const confirmDelete = (type: 'student' | 'assignment' | 'grade' | 'class' | 'gradeCategory', id: string) => {
    setItemToDelete({ type, id });
    setModalOpen('confirmDelete');
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    if (type === 'student') {
      setStudents(prev => prev.filter(s => s.id !== id));
      setGrades(prev => prev.filter(g => g.studentId !== id)); // Also delete related grades
    } else if (type === 'assignment') {
      setAssignments(prev => prev.filter(a => a.id !== id));
      setGrades(prev => prev.filter(g => g.assignmentId !== id)); // Also delete related grades
    } else if (type === 'grade') {
        setGrades(prev => prev.filter(g => g.id !== id));
    } else if (type === 'class') {
        setClasses(prev => prev.filter(c => c.id !== id));
        // Optionally handle cascading deletes for students/assignments in this class
    } else if (type === 'gradeCategory') {
        setGradeCategories(prev => prev.filter(gc => gc.id !== id));
    }
    closeModal();
  };
  
  const handleSaveClassSubject = () => {
    if (!formState.name) {
        alert("Class/Subject name is required.");
        return;
    }
    if (currentItem && (currentItem as ClassSubject).id) { // Editing
        setClasses(prev => prev.map(c => c.id === (currentItem as ClassSubject).id ? { ...c, name: formState.name } : c));
    } else { // Adding
        setClasses(prev => [...prev, { id: generateId(), name: formState.name }]);
    }
    setCurrentItem(null); // Important: Reset currentItem to allow adding multiple
    setFormState({}); // Reset form for next entry
    // Do not close modal to allow multiple additions/edits
  };

  const handleDeleteClassSubject = (id: string) => {
    // Add confirmation if students/assignments are linked to this class
    const isClassUsed = students.some(s => s.classId === id) || assignments.some(a => a.classId === id);
    if (isClassUsed) {
        if (!window.confirm("This class has students or assignments associated with it. Deleting it will remove these associations. Are you sure? This action may require you to reassign students/assignments.")) {
            return;
        }
        // update students and assignments to remove classId or set to a default/null
        setStudents(prev => prev.map(s => s.classId === id ? {...s, classId: ''} : s));
        setAssignments(prev => prev.map(a => a.classId === id ? {...a, classId: ''} : a));
    }
    setClasses(prev => prev.filter(c => c.id !== id));
  };
  
  const handleSaveGradeCategory = () => {
    if (!formState.name || formState.weight === undefined || isNaN(formState.weight) || formState.weight < 0 || formState.weight > 100) {
        alert("Valid category name and weight (0-100) are required.");
        return;
    }
    const totalWeight = gradeCategories.reduce((sum, cat) => sum + (cat.id === (currentItem as GradeCategory)?.id ? 0 : cat.weight), 0) + formState.weight;
    if (totalWeight > 100 && !(currentItem && (currentItem as GradeCategory).id && gradeCategories.find(c => c.id === (currentItem as GradeCategory).id)?.weight === formState.weight) ){
      if (!window.confirm(`Adding this category will make the total weight ${totalWeight}%. Do you want to proceed and adjust other categories later?`)) {
          return;
      }
    }

    if (currentItem && (currentItem as GradeCategory).id) { // Editing
        setGradeCategories(prev => prev.map(gc => gc.id === (currentItem as GradeCategory).id ? { ...gc, name: formState.name, weight: formState.weight } : gc));
    } else { // Adding
        setGradeCategories(prev => [...prev, { id: generateId(), name: formState.name, weight: formState.weight }]);
    }
    setCurrentItem(null);
    setFormState({});
  };

  const handleDeleteGradeCategory = (id: string) => {
    setGradeCategories(prev => prev.filter(gc => gc.id !== id));
  };

  // AI Handler
  const handleSendToAI = (taskIdentifier: string, prompt: string) => {
    if (!prompt?.trim()) {
      setAiError("Please provide a prompt for the AI.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    setIsAiLoading(true);
    setCurrentAiTask(taskIdentifier);
    // We use aiPromptText state to hold the prompt passed to AILayer component,
    // but send it directly to sendToAI for immediate use.
    setAiPromptText(prompt); 
    aiLayerRef.current?.sendToAI(prompt); 
  };

  const onAiResult = (apiResult: string) => {
    setAiResult(apiResult);
    setIsAiLoading(false);
  };
  const onAiError = (apiError: any) => {
    setAiError(apiError);
    setIsAiLoading(false);
  };
  const onAiLoading = (loadingStatus: boolean) => {
    setIsAiLoading(loadingStatus);
  };

  // Data computations for dashboard and reports
  const totalStudents = students.length;
  const averageClassGrade = useMemo(() => {
    const allAverages = students.map(s => getStudentAverage(s.id)).filter(avg => typeof avg === 'number') as number[];
    return allAverages.length > 0 ? parseFloat((allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length).toFixed(1)) : 'N/A';
  }, [students, getStudentAverage]);

  const upcomingAssignments = useMemo(() => assignments
    .filter(a => new Date(a.dueDate) >= new Date(TODAY_DATE))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3), [assignments]);

  // Filtering and Sorting Logic
  const filteredStudents = useMemo(() => {
    let S = students.filter(student =>
      (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterClass === '' || student.classId === filterClass)
    );
    if (sortConfig && sortConfig.key in S[0] ) {
      S.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Student];
        const bValue = b[sortConfig.key as keyof Student];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return S;
  }, [students, searchTerm, filterClass, sortConfig]);

  const filteredAssignments = useMemo(() => {
    let A = assignments.filter(assignment =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterClass === '' || assignment.classId === filterClass)
    );
     if (sortConfig && sortConfig.key in A[0]) {
      A.sort((a,b) => {
        const aValue = a[sortConfig.key as keyof Assignment];
        const bValue = b[sortConfig.key as keyof Assignment];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return A;
  }, [assignments, searchTerm, filterClass, sortConfig]);

  const requestSort = (key: keyof Student | keyof Assignment | keyof Grade) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Student | keyof Assignment | keyof Grade) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 inline ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  // Report Data
  const gradeDistributionData = useMemo(() => {
    const distribution = { 'A (90+)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0, 'N/A': 0 };
    students.forEach(student => {
      const avg = getStudentAverage(student.id);
      if (typeof avg === 'number') {
        if (avg >= 90) distribution['A (90+)']++;
        else if (avg >= 80) distribution['B (80-89)']++;
        else if (avg >= 70) distribution['C (70-79)']++;
        else if (avg >= 60) distribution['D (60-69)']++;
        else distribution['F (<60)']++;
      } else {
        distribution['N/A']++;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [students, getStudentAverage]);

  const assignmentCompletionData = useMemo(() => {
    return assignments.map(assignment => {
      const gradedCount = grades.filter(g => g.assignmentId === assignment.id && g.score !== null).length;
      const totalStudentsInClass = students.filter(s => s.classId === assignment.classId).length;
      const completionRate = totalStudentsInClass > 0 ? (gradedCount / totalStudentsInClass) * 100 : 0;
      return { name: assignment.title, completion: parseFloat(completionRate.toFixed(1)) };
    });
  }, [assignments, grades, students]);
  
  const studentProgressChartData = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.score !== null);
    return studentGrades.map(grade => {
        const assignment = assignments.find(a => a.id === grade.assignmentId);
        if (!assignment || grade.score === null) return null;
        return {
            name: assignment.title.substring(0,15) + (assignment.title.length > 15 ? "..." : ""), // Shorten name for chart
            score: (grade.score / assignment.maxPoints) * 100, // Percentage score
            dueDate: assignment.dueDate,
        };
    }).filter(item => item !== null).sort((a,b) => new Date(a!.dueDate).getTime() - new Date(b!.dueDate).getTime()) as {name:string; score:number; dueDate:string}[];
  };


  // Settings: Data Management
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllData = () => {
    exportToCSV(students, 'students_data');
    exportToCSV(assignments, 'assignments_data');
    exportToCSV(grades, 'grades_data');
    exportToCSV(classes, 'classes_data');
    exportToCSV(gradeCategories, 'grade_categories_data');
  };
  
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>, type: 'students' | 'assignments') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length < 2) {
            alert("CSV file is empty or has no data rows.");
            return;
        }
        const headers = lines[0].trim().split(',');
        const dataRows = lines.slice(1).map(line => {
            const values = line.trim().split(',');
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].replace(/^"|"$/g, '') : undefined; // Handle quoted strings
            });
            return row;
        }).filter(row => Object.values(row).some(val => val !== undefined)); // Filter out empty rows

        try {
            if (type === 'students') {
                const newStudents = dataRows.map(row => ({
                    id: generateId(),
                    firstName: row.firstName || 'N/A',
                    lastName: row.lastName || 'N/A',
                    email: row.email,
                    classId: row.classId || '',
                } as Student));
                setStudents(prev => [...prev, ...newStudents]);
            } else if (type === 'assignments') {
                const newAssignments = dataRows.map(row => ({
                    id: generateId(),
                    title: row.title || 'N/A',
                    description: row.description,
                    dueDate: row.dueDate || TODAY_DATE,
                    maxPoints: parseInt(row.maxPoints) || 100,
                    classId: row.classId || '',
                } as Assignment));
                setAssignments(prev => [...prev, ...newAssignments]);
            }
            alert(`${type} imported successfully!`);
        } catch (error) {
            console.error("Error importing CSV:", error);
            alert(`Error importing CSV. Please check file format and console for details. Template expects columns: ${headers.join(', ')}`);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const getCSVTemplate = (type: 'students' | 'assignments') => {
    let headers: string[];
    if (type === 'students') headers = ['firstName', 'lastName', 'email', 'classId'];
    else headers = ['title', 'description', 'dueDate', 'maxPoints', 'classId'];
    
    const csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to delete ALL data? This action cannot be undone.")) {
        setStudents([]);
        setAssignments([]);
        setGrades([]);
        setClasses([]);
        setGradeCategories([]);
        localStorage.removeItem('spt-students');
        localStorage.removeItem('spt-assignments');
        localStorage.removeItem('spt-grades');
        localStorage.removeItem('spt-classes');
        localStorage.removeItem('spt-gradeCategories');
        alert("All data has been cleared.");
    }
  };

  // Tab rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'students': return renderStudentsTab();
      case 'assignments': return renderAssignmentsTab();
      case 'reports': return renderReportsTab();
      case 'ai-tools': return renderAIToolsTab();
      case 'settings': return renderSettingsTab();
      default: return <div id="generation_issue_fallback">Select a tab</div>;
    }
  };

  // Specific Tab Render Functions
  const renderDashboard = () => (
    <div id="dashboard-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 fade-in">
      <div className="stat-card col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Welcome, {currentUser?.first_name || 'Teacher'}!</h2>
        <p className="text-gray-500 dark:text-gray-400">Today is {new Date(TODAY_DATE).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Here's a summary of your classes:</p>
      </div>
      <div className="stat-card" id="total-students-stat">
        <div className="stat-title">Total Students</div>
        <div className="stat-value flex items-center"><Users className="w-8 h-8 mr-2 text-primary-500"/> {totalStudents}</div>
      </div>
      <div className="stat-card" id="avg-class-grade-stat">
        <div className="stat-title">Average Class Grade</div>
        <div className="stat-value flex items-center"><BarChart3 className="w-8 h-8 mr-2 text-green-500"/> {averageClassGrade}%</div>
        <div className="stat-desc">Across all graded assignments</div>
      </div>
      <div className="stat-card" id="upcoming-assignments-stat">
        <div className="stat-title">Upcoming Assignments ({upcomingAssignments.length})</div>
        {upcomingAssignments.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {upcomingAssignments.map(a => (
              <li key={a.id} className="flex justify-between">
                <span>{a.title}</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">{new Date(a.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No upcoming assignments.</p>}
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 card">
          <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
              <button onClick={() => openModal('addStudent')} className="btn btn-primary flex items-center gap-2" id="quick-add-student-btn"><UserPlus size={18}/> Add Student</button>
              <button onClick={() => openModal('addAssignment')} className="btn btn-primary flex items-center gap-2" id="quick-add-assignment-btn"><FileText size={18}/> Add Assignment</button>
              <button onClick={() => setActiveTab('reports')} className="btn btn-secondary flex items-center gap-2" id="quick-view-reports-btn"><BarChart3 size={18}/> View Reports</button>
          </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div id="students-content" className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">Manage Students</h2>
        <button onClick={() => openModal('addStudent')} className="btn btn-primary btn-responsive flex items-center gap-2" id="add-student-btn">
          <UserPlus size={18} /> Add Student
        </button>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search students..."
          className="input input-responsive flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="student-search-input"
        />
        <select
          className="input input-responsive"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          id="student-class-filter"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header cursor-pointer" onClick={() => requestSort('lastName')} id="student-name-header">Name {getSortIndicator('lastName')}</th>
              <th className="table-header hidden md:table-cell" id="student-email-header">Email</th>
              <th className="table-header" id="student-class-header">Class</th>
              <th className="table-header" id="student-avg-grade-header">Avg. Grade</th>
              <th className="table-header" id="student-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            {filteredStudents.length > 0 ? filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="table-cell font-medium">{student.firstName} {student.lastName}</td>
                <td className="table-cell hidden md:table-cell">{student.email || 'N/A'}</td>
                <td className="table-cell">{classes.find(c => c.id === student.classId)?.name || 'Unassigned'}</td>
                <td className="table-cell">{getStudentAverage(student.id)}%</td>
                <td className="table-cell space-x-2">
                  <button onClick={() => openModal('viewStudentReport', student)} className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200" title="View Report" aria-label={`View report for ${student.firstName}`}><Eye size={18}/></button>
                  <button onClick={() => openModal('editStudent', student)} className="p-1 text-yellow-500 hover:text-yellow-700" title="Edit" aria-label={`Edit ${student.firstName}`}><Pencil size={18}/></button>
                  <button onClick={() => confirmDelete('student', student.id)} className="p-1 text-red-500 hover:text-red-700" title="Delete" aria-label={`Delete ${student.firstName}`}><Trash2 size={18}/></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="table-cell text-center py-10 text-gray-500">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAssignmentsTab = () => (
    <div id="assignments-content" className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">Manage Assignments</h2>
        <button onClick={() => openModal('addAssignment')} className="btn btn-primary btn-responsive flex items-center gap-2" id="add-assignment-btn">
          <PlusCircle size={18} /> Add Assignment
        </button>
      </div>
       <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search assignments..."
          className="input input-responsive flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="assignment-search-input"
        />
        <select
          className="input input-responsive"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          id="assignment-class-filter"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header cursor-pointer" onClick={() => requestSort('title')} id="assignment-title-header">Title {getSortIndicator('title')}</th>
              <th className="table-header hidden md:table-cell" id="assignment-class-header">Class</th>
              <th className="table-header cursor-pointer hidden sm:table-cell" onClick={() => requestSort('dueDate')} id="assignment-due-date-header">Due Date {getSortIndicator('dueDate')}</th>
              <th className="table-header" id="assignment-max-points-header">Max Points</th>
              <th className="table-header" id="assignment-avg-score-header">Avg. Score</th>
              <th className="table-header" id="assignment-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            {filteredAssignments.length > 0 ? filteredAssignments.map(assignment => (
              <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="table-cell font-medium">{assignment.title}</td>
                <td className="table-cell hidden md:table-cell">{classes.find(c => c.id === assignment.classId)?.name || 'Unassigned'}</td>
                <td className="table-cell hidden sm:table-cell">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                <td className="table-cell">{assignment.maxPoints}</td>
                <td className="table-cell">{getAssignmentAverage(assignment.id)}</td>
                <td className="table-cell space-x-2">
                  {/* Simplified: For a full grading UI, would need another layer/modal */}
                  <button onClick={() => { /* Logic to show grading UI per student for this assignment */ alert('Grading UI per student for this assignment needs further implementation. For now, edit student grades individually from student reports or a dedicated grading section.');}} className="p-1 text-blue-500 hover:text-blue-700" title="Grade Students" aria-label={`Grade students for ${assignment.title}`}><CheckCircle size={18}/></button>
                  <button onClick={() => openModal('editAssignment', assignment)} className="p-1 text-yellow-500 hover:text-yellow-700" title="Edit" aria-label={`Edit ${assignment.title}`}><Pencil size={18}/></button>
                  <button onClick={() => confirmDelete('assignment', assignment.id)} className="p-1 text-red-500 hover:text-red-700" title="Delete" aria-label={`Delete ${assignment.title}`}><Trash2 size={18}/></button>
                </td>
              </tr>
            )) : (
               <tr><td colSpan={6} className="table-cell text-center py-10 text-gray-500">No assignments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div id="reports-content" className="p-6 space-y-8">
      <h2 className="text-2xl font-semibold mb-6">Reports & Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card" id="grade-distribution-chart">
          <h3 className="text-lg font-medium mb-4">Overall Grade Distribution</h3>
          {students.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={gradeDistributionData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {gradeDistributionData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4560', '#A9A9A9'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400">No student data available for grade distribution.</p>}
        </div>
        <div className="card" id="assignment-completion-chart">
          <h3 className="text-lg font-medium mb-4">Assignment Completion Rates</h3>
          {assignments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentCompletionData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={80} tick={{fontSize: 10}} />
                <YAxis label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="completion" fill="#82ca9d" name="Completion Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400">No assignment data available.</p>}
        </div>
      </div>
       <div className="card mt-6" id="individual-student-reports-section">
            <h3 className="text-lg font-medium mb-4">Individual Student Reports</h3>
            {students.length > 0 ? (
              <ul className="space-y-2">
                {students.map(student => (
                    <li key={student.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
                        <span>{student.firstName} {student.lastName} ({classes.find(c => c.id === student.classId)?.name || 'N/A'})</span>
                        <button onClick={() => openModal('viewStudentReport', student)} className="btn btn-sm btn-primary flex items-center gap-1"><Eye size={16}/> View Report</button>
                    </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 dark:text-gray-400">No students to display reports for.</p>}
        </div>
    </div>
  );
  
  const renderAIToolsTab = () => {
    const parseAIResult = (resultString: string | null) => {
        if (!resultString) return null;
        try {
            return JSON.parse(resultString);
        } catch (e) {
            // If not JSON, return as plain text (Markdown might be here)
            return resultString;
        }
    };
    const aiContent = parseAIResult(aiResult);

    return (
        <div id="ai-tools-content" className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">AI Smart Tools</h2>
                <button onClick={() => openModal('aiHelp')} className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 flex items-center gap-2">
                    <HelpCircle size={16} /> AI Usage Guide
                </button>
            </div>
            
            <div className="alert alert-info" role="alert">
                <Info size={20} className="flex-shrink-0"/>
                <span>AI suggestions are for guidance only. Always review and verify information before use. AI can make mistakes.</span>
            </div>

            {/* AI Feature 1: Performance Insights */}
            <div className="card" id="ai-performance-insights">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><BrainCircuit size={20} /> Student Performance Insights</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select a student to get AI-powered insights on their performance.</p>
                <select 
                    className="input mb-3" 
                    id="ai-student-selector"
                    onChange={(e) => {
                        const studentId = e.target.value;
                        if (studentId) {
                            const student = students.find(s => s.id === studentId);
                            const studentGrades = grades.filter(g => g.studentId === studentId)
                                .map(gr => {
                                    const ass = assignments.find(a => a.id === gr.assignmentId);
                                    return { title: ass?.title, score: gr.score, maxPoints: ass?.maxPoints, comments: gr.comments };
                                });
                            const prompt = `Analyze student ${student?.firstName} ${student?.lastName}'s performance. Data: ${JSON.stringify(studentGrades)}. Provide insights into strengths, weaknesses, and 2-3 actionable recommendations for improvement. Return JSON with keys 'strengths' (array of strings), 'weaknesses' (array of strings), 'recommendations' (array of strings).`;
                            handleSendToAI('performanceInsights', prompt);
                        }
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>Select a student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
                {currentAiTask === 'performanceInsights' && (
                    isAiLoading ? <div className="skeleton h-20 w-full mt-2"></div> :
                    aiError ? <div className="alert alert-error mt-2">{typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</div> :
                    aiContent && typeof aiContent === 'object' && (
                        <div className="mt-3 space-y-2 prose dark:prose-invert max-w-none">
                            <h4>Strengths:</h4>
                            <ul>{aiContent.strengths?.map((s:string, i:number) => <li key={`strength-${i}`}>{s}</li>) || <li>Not available</li>}</ul>
                            <h4>Weaknesses:</h4>
                            <ul>{aiContent.weaknesses?.map((w:string, i:number) => <li key={`weakness-${i}`}>{w}</li>) || <li>Not available</li>}</ul>
                            <h4>Recommendations:</h4>
                            <ul>{aiContent.recommendations?.map((r:string, i:number) => <li key={`rec-${i}`}>{r}</li>)  || <li>Not available</li>}</ul>
                        </div>
                    )
                )}
            </div>

            {/* AI Feature 2: Assignment Idea Generator */}
            <div className="card" id="ai-assignment-ideas">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><Sparkles size={20} /> Assignment Idea Generator</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Get creative assignment ideas for your class.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input type="text" id="ai-subject-topic" placeholder="Subject/Topic (e.g., WW2 History)" className="input" />
                    <select id="ai-class-selector-ideas" className="input">
                        <option value="">Select Class (Optional)</option>
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => {
                        const topic = (document.getElementById('ai-subject-topic') as HTMLInputElement).value;
                        const className = (document.getElementById('ai-class-selector-ideas') as HTMLSelectElement).value;
                        if (!topic) { alert("Please enter a subject/topic."); return; }
                        const prompt = `Generate 3 creative assignment ideas for a ${className || 'general'} class on the topic of '${topic}'. Include a brief description and estimated difficulty (Easy, Medium, Hard) for each. Return JSON array with objects having keys 'title', 'description', 'difficulty'.`;
                        handleSendToAI('assignmentIdeas', prompt);
                    }} 
                    className="btn btn-primary"
                    disabled={isAiLoading && currentAiTask === 'assignmentIdeas'}
                    id="generate-assignment-ideas-btn"
                >
                    {isAiLoading && currentAiTask === 'assignmentIdeas' ? 'Generating...' : 'Get Ideas'}
                </button>
                {currentAiTask === 'assignmentIdeas' && (
                    isAiLoading ? <div className="skeleton h-20 w-full mt-2"></div> :
                    aiError ? <div className="alert alert-error mt-2">{typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</div> :
                    aiContent && Array.isArray(aiContent) && (
                        <div className="mt-3 space-y-3">
                            {aiContent.map((idea: any, index: number) => (
                                <div key={index} className="p-3 border rounded-md dark:border-slate-600">
                                    <h5 className="font-semibold">{idea.title} <span className={`badge ${idea.difficulty === 'Easy' ? 'badge-success' : idea.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'}`}>{idea.difficulty}</span></h5>
                                    <p className="text-sm">{idea.description}</p>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
            
            {/* AI Feature 3: Feedback Suggester (Simplified for this tab, ideally integrated in grading flow) */}
            <div className="card" id="ai-feedback-suggester">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><MessageSquare size={20} /> Feedback Suggester</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Get AI suggestions for student feedback. (This is a demo - ideally, integrate this into the grading workflow).</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input type="text" id="ai-feedback-assignment-title" placeholder="Assignment Title" className="input" />
                    <input type="number" id="ai-feedback-score" placeholder="Score (e.g., 75)" className="input" />
                    <input type="number" id="ai-feedback-max-points" placeholder="Max Points (e.g., 100)" className="input" />
                </div>
                <textarea id="ai-feedback-focus" placeholder="Optional: Specific area to focus feedback on (e.g., clarity of explanation)" className="input mb-3 w-full" rows={2}></textarea>
                <button 
                    onClick={() => {
                        const assignmentTitle = (document.getElementById('ai-feedback-assignment-title') as HTMLInputElement).value;
                        const score = (document.getElementById('ai-feedback-score') as HTMLInputElement).value;
                        const maxPoints = (document.getElementById('ai-feedback-max-points') as HTMLInputElement).value;
                        const focusArea = (document.getElementById('ai-feedback-focus') as HTMLTextAreaElement).value;

                        if (!assignmentTitle || !score || !maxPoints) { alert("Please provide Assignment Title, Score, and Max Points."); return; }
                        let prompt = `A student scored ${score} out of ${maxPoints} on an assignment titled '${assignmentTitle}'. Provide a concise, constructive feedback comment (2-3 sentences) appropriate for this score.`;
                        if(focusArea) prompt += ` Focus on ${focusArea}.`;
                        prompt += ` Return JSON with key 'feedback_comment' (string).`;
                        handleSendToAI('feedbackSuggestion', prompt);
                    }} 
                    className="btn btn-primary"
                    disabled={isAiLoading && currentAiTask === 'feedbackSuggestion'}
                    id="get-feedback-suggestion-btn"
                >
                    {isAiLoading && currentAiTask === 'feedbackSuggestion' ? 'Generating...' : 'Get Feedback Suggestion'}
                </button>
                {currentAiTask === 'feedbackSuggestion' && (
                    isAiLoading ? <div className="skeleton h-16 w-full mt-2"></div> :
                    aiError ? <div className="alert alert-error mt-2">{typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</div> :
                    aiContent && typeof aiContent === 'object' && 'feedback_comment' in aiContent && (
                        <div className="mt-3 p-3 border rounded-md dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
                            <p className="font-semibold">Suggested Feedback:</p>
                            <p>{aiContent.feedback_comment}</p>
                        </div>
                    )
                )}
            </div>
            {((isAiLoading && aiResult === null) || aiError) && <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">Tip: If AI response is not JSON as expected, it might appear as plain text. Check console for details if parsing fails.</p>}
        </div>
    );
  };


  const renderSettingsTab = () => (
    <div id="settings-content" className="p-6 space-y-8">
        <h2 className="text-2xl font-semibold">Application Settings</h2>

        {/* Theme Settings already in header, could add more display options here */}
        <div className="card" id="display-settings-card">
            <h3 className="text-lg font-medium mb-4">Display & Theme</h3>
            <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <button 
                    className="theme-toggle"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    id="theme-toggle-settings"
                >
                    <span className="theme-toggle-thumb"></span>
                </button>
            </div>
             {/* Placeholder for language/timezone */}
            <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <label htmlFor="language-select" className="form-label">Language (Placeholder)</label>
                <select id="language-select" className="input" disabled><option>English (US)</option></select>
            </div>
            <div className="mt-4">
                <label htmlFor="timezone-select" className="form-label">Timezone (Placeholder)</label>
                <select id="timezone-select" className="input" disabled><option>System Default</option></select>
            </div>
        </div>
        
        <div className="card" id="manage-classes-card">
            <h3 className="text-lg font-medium mb-4">Manage Classes/Subjects</h3>
            <button onClick={() => openModal('manageClasses')} className="btn btn-secondary btn-sm mb-3 flex items-center gap-2" id="manage-classes-btn"><PlusCircle size={16}/> Add/Edit Classes</button>
            <ul className="space-y-1 text-sm">
                {classes.map(c => <li key={c.id}>{c.name}</li>)}
                {classes.length === 0 && <p className="text-gray-500 dark:text-gray-400">No classes defined.</p>}
            </ul>
        </div>

        <div className="card" id="manage-grade-categories-card">
            <h3 className="text-lg font-medium mb-4">Manage Grade Categories & Weights</h3>
             <button onClick={() => openModal('manageGradeCategories')} className="btn btn-secondary btn-sm mb-3 flex items-center gap-2" id="manage-grade-categories-btn"><PlusCircle size={16}/> Add/Edit Categories</button>
            <ul className="space-y-1 text-sm">
                {gradeCategories.map(gc => <li key={gc.id}>{gc.name} ({gc.weight}%)</li>)}
                {gradeCategories.length === 0 && <p className="text-gray-500 dark:text-gray-400">No grade categories defined.</p>}
                 <li className="pt-2 mt-2 border-t dark:border-slate-700 font-semibold">Total Weight: {gradeCategories.reduce((sum, cat) => sum + cat.weight, 0)}%
                 {gradeCategories.reduce((sum, cat) => sum + cat.weight, 0) !== 100 && <span className="ml-2 text-red-500 text-xs">(Should be 100%)</span>}
                 </li>
            </ul>
        </div>
        
        <div className="card" id="data-management-card">
            <h3 className="text-lg font-medium mb-4">Data Management</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium mb-1">Import Data (CSV)</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="import-students-csv" className="form-label">Import Students</label>
                            <input type="file" id="import-students-csv" accept=".csv" onChange={(e) => handleImportCSV(e, 'students')} className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                            <button onClick={() => getCSVTemplate('students')} className="text-xs text-primary-600 hover:underline mt-1">Download Template</button>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="import-assignments-csv" className="form-label">Import Assignments</label>
                            <input type="file" id="import-assignments-csv" accept=".csv" onChange={(e) => handleImportCSV(e, 'assignments')} className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                            <button onClick={() => getCSVTemplate('assignments')} className="text-xs text-primary-600 hover:underline mt-1">Download Template</button>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium mb-1">Export Data</h4>
                    <button onClick={handleExportAllData} className="btn btn-secondary flex items-center gap-2" id="export-all-data-btn"><FileSpreadsheet size={18}/> Export All Data (CSV)</button>
                </div>
                <div>
                    <h4 className="font-medium mb-1 text-red-600 dark:text-red-400">Danger Zone</h4>
                    <button onClick={handleClearAllData} className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2" id="clear-all-data-btn"><Trash size={18}/> Clear All Application Data</button>
                </div>
            </div>
        </div>
    </div>
  );

  const NavItem: React.FC<{tab: AppTab; label: string; icon: React.ElementType}> = ({ tab, label, icon: Icon }) => (
    <button
      id={`${tab}-tab`}
      onClick={() => { setActiveTab(tab); setSearchTerm(''); setFilterClass(''); setSortConfig(null);}}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === tab
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
      role="tab"
      aria-selected={activeTab === tab}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition-all" id="welcome_fallback">
      <AILayer ref={aiLayerRef} prompt={aiPromptText} attachment={aiSelectedFile || undefined} onResult={onAiResult} onError={onAiError} onLoading={onAiLoading} />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] no-print">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-3 text-xl font-bold text-gray-800 dark:text-white">{APP_NAME}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Welcome, {currentUser?.first_name || 'Teacher'}!
              </span>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                id="theme-toggle-header"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={logout}
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                id="logout-btn"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
        {/* Navigation Tabs */}
        <nav className="bg-gray-50 dark:bg-slate-700 shadow-sm" aria-label="Main navigation" role="tablist">
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            <NavItem tab="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem tab="students" label="Students" icon={Users} />
            <NavItem tab="assignments" label="Assignments" icon={FileText} />
            <NavItem tab="reports" label="Reports" icon={BarChart3} />
            <NavItem tab="ai-tools" label="AI Tools" icon={Sparkles} />
            <NavItem tab="settings" label="Settings" icon={Settings} />
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="container-wide mx-auto p-0 sm:p-4 md:p-6">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400 no-print">
        Copyright &copy; {CURRENT_YEAR} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modals */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Add/Edit Student Modal */}
            {(modalOpen === 'addStudent' || modalOpen === 'editStudent') && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium">{modalOpen === 'addStudent' ? 'Add New Student' : 'Edit Student'}</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input id="firstName" name="firstName" type="text" className="input" value={formState.firstName || ''} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input id="lastName" name="lastName" type="text" className="input" value={formState.lastName || ''} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email (Optional)</label>
                    <input id="email" name="email" type="email" className="input" value={formState.email || ''} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="classId">Class</label>
                    <select id="classId" name="classId" className="input" value={formState.classId || ''} onChange={handleFormChange} required>
                        <option value="" disabled>Select a class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                  <button onClick={handleSaveStudent} className="btn btn-primary flex items-center gap-2"><Save size={18}/> Save Student</button>
                </div>
              </>
            )}
            {/* Add/Edit Assignment Modal */}
            {(modalOpen === 'addAssignment' || modalOpen === 'editAssignment') && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium">{modalOpen === 'addAssignment' ? 'Add New Assignment' : 'Edit Assignment'}</h3>
                   <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input id="title" name="title" type="text" className="input" value={formState.title || ''} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="description">Description (Optional)</label>
                    <textarea id="description" name="description" className="input" value={formState.description || ''} onChange={handleFormChange} rows={3}></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dueDate">Due Date</label>
                    <input id="dueDate" name="dueDate" type="date" className="input" value={formState.dueDate || TODAY_DATE} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="maxPoints">Max Points</label>
                    <input id="maxPoints" name="maxPoints" type="number" min="1" className="input" value={formState.maxPoints || ''} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="classIdAssignment">Class</label>
                    <select id="classIdAssignment" name="classId" className="input" value={formState.classId || ''} onChange={handleFormChange} required>
                        <option value="" disabled>Select a class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                  <button onClick={handleSaveAssignment} className="btn btn-primary flex items-center gap-2"><Save size={18}/> Save Assignment</button>
                </div>
              </>
            )}
            {/* Grade Assignment Modal */}
            {modalOpen === 'gradeAssignment' && currentItem && 'studentId' in currentItem && 'assignmentId' in currentItem && (
                <>
                    <div className="modal-header">
                        <h3 className="text-lg font-medium">Grade Assignment</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                    </div>
                    <div className="space-y-4 mt-4">
                        <p>Student: <strong>{students.find(s => s.id === gradeFormState.studentId)?.firstName} {students.find(s => s.id === gradeFormState.studentId)?.lastName}</strong></p>
                        <p>Assignment: <strong>{assignments.find(a => a.id === gradeFormState.assignmentId)?.title}</strong> (Max Points: {assignments.find(a => a.id === gradeFormState.assignmentId)?.maxPoints})</p>
                        <div className="form-group">
                            <label className="form-label" htmlFor="score">Score</label>
                            <input id="score" name="score" type="number" className="input" value={gradeFormState.score} onChange={handleGradeFormChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="comments">Comments (Optional)</label>
                            <textarea id="comments" name="comments" className="input" value={gradeFormState.comments} onChange={handleGradeFormChange} rows={3}></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                        <button onClick={handleSaveGrade} className="btn btn-primary flex items-center gap-2"><Save size={18}/> Save Grade</button>
                    </div>
                </>
            )}
            {/* View Student Report Modal */}
            {modalOpen === 'viewStudentReport' && currentItem && 'firstName' in currentItem && (
                <>
                    <div className="modal-header">
                        <h3 className="text-lg font-medium">Student Report: {(currentItem as Student).firstName} {(currentItem as Student).lastName}</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                    </div>
                    <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <p>Overall Average: <strong>{getStudentAverage((currentItem as Student).id)}%</strong></p>
                        <h4 className="text-md font-medium mt-4">Grade History:</h4>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th className="table-header">Assignment</th><th className="table-header">Score</th><th className="table-header">Max Points</th><th className="table-header">Percentage</th><th className="table-header">Comments</th><th className="table-header">Actions</th></tr></thead>
                                <tbody>
                                    {assignments.filter(a => a.classId === (currentItem as Student).classId).map(assignment => {
                                        const grade = grades.find(g => g.studentId === (currentItem as Student).id && g.assignmentId === assignment.id);
                                        return (
                                            <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                                <td className="table-cell">{assignment.title}</td>
                                                <td className="table-cell">{grade?.score ?? 'N/G'}</td>
                                                <td className="table-cell">{assignment.maxPoints}</td>
                                                <td className="table-cell">{grade?.score !== null && grade?.score !== undefined ? ((grade.score / assignment.maxPoints) * 100).toFixed(1) + '%' : 'N/A'}</td>
                                                <td className="table-cell text-xs">{grade?.comments || '-'}</td>
                                                <td className="table-cell">
                                                    <button onClick={() => openModal('gradeAssignment', {studentId: (currentItem as Student).id, assignmentId: assignment.id, score: grade?.score, comments: grade?.comments} as Grade)} className="p-1 text-blue-500 hover:text-blue-700" title="Grade/Edit Grade"><Pencil size={16}/></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {assignments.filter(a => a.classId === (currentItem as Student).classId).length === 0 && <tr><td colSpan={6} className="table-cell text-center">No assignments for this student's class.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        
                        <h4 className="text-md font-medium mt-6">Progress Chart:</h4>
                        {studentProgressChartData((currentItem as Student).id).length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={studentProgressChartData((currentItem as Student).id)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{fontSize: 10}}/>
                                    <YAxis domain={[0, 100]} label={{ value: 'Score %', angle: -90, position: 'insideLeft' }}/>
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-sm text-gray-500 dark:text-gray-400">No graded assignments to display progress.</p>}
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Close</button>
                        {/* Add PDF export button here if desired */}
                    </div>
                </>
            )}
            {/* Manage Classes/Subjects Modal */}
            {modalOpen === 'manageClasses' && (
                <>
                    <div className="modal-header">
                        <h3 className="text-lg font-medium">Manage Classes/Subjects</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                    </div>
                    <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="form-group flex gap-2 items-end">
                            <div className="flex-grow">
                                <label className="form-label" htmlFor="className">
                                    {currentItem ? 'Edit Class/Subject Name' : 'New Class/Subject Name'}
                                </label>
                                <input id="className" name="name" type="text" className="input" value={formState.name || ''} onChange={handleFormChange} />
                            </div>
                            <button onClick={handleSaveClassSubject} className="btn btn-primary h-fit">
                                {currentItem ? 'Update' : 'Add'}
                            </button>
                            {currentItem && <button onClick={() => { setCurrentItem(null); setFormState({});}} className="btn bg-gray-200 dark:bg-slate-600 h-fit">Cancel Edit</button>}
                        </div>
                        <h4 className="text-md font-medium mt-4">Existing Classes/Subjects:</h4>
                        {classes.length > 0 ? (
                            <ul className="space-y-2">
                                {classes.map(c => (
                                    <li key={c.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
                                        <span>{c.name}</span>
                                        <div className="space-x-2">
                                            <button onClick={() => { setCurrentItem(c); setFormState(c); }} className="p-1 text-yellow-500 hover:text-yellow-700" title="Edit"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteClassSubject(c.id)} className="p-1 text-red-500 hover:text-red-700" title="Delete"><Trash2 size={16}/></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500 dark:text-gray-400">No classes defined yet.</p>}
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Done</button>
                    </div>
                </>
            )}
            {/* Manage Grade Categories Modal */}
            {modalOpen === 'manageGradeCategories' && (
                <>
                    <div className="modal-header">
                        <h3 className="text-lg font-medium">Manage Grade Categories</h3>
                         <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                    </div>
                     <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="form-group grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                            <div className="md:col-span-2">
                                <label className="form-label" htmlFor="categoryName">
                                  {currentItem ? 'Edit Category Name' : 'New Category Name'}
                                </label>
                                <input id="categoryName" name="name" type="text" className="input" value={formState.name || ''} onChange={handleFormChange} />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="categoryWeight">Weight (%)</label>
                                <input id="categoryWeight" name="weight" type="number" min="0" max="100" className="input" value={formState.weight || ''} onChange={handleFormChange} />
                            </div>
                             <div className="md:col-span-3 flex gap-2">
                                <button onClick={handleSaveGradeCategory} className="btn btn-primary">
                                    {currentItem ? 'Update Category' : 'Add Category'}
                                </button>
                                {currentItem && <button onClick={() => { setCurrentItem(null); setFormState({});}} className="btn bg-gray-200 dark:bg-slate-600">Cancel Edit</button>}
                            </div>
                        </div>
                        <h4 className="text-md font-medium mt-4">Existing Categories:</h4>
                        {gradeCategories.length > 0 ? (
                            <ul className="space-y-2">
                                {gradeCategories.map(gc => (
                                    <li key={gc.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
                                        <span>{gc.name} ({gc.weight}%)</span>
                                        <div className="space-x-2">
                                            <button onClick={() => { setCurrentItem(gc); setFormState(gc);}} className="p-1 text-yellow-500 hover:text-yellow-700" title="Edit"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteGradeCategory(gc.id)} className="p-1 text-red-500 hover:text-red-700" title="Delete"><Trash2 size={16}/></button>
                                        </div>
                                    </li>
                                ))}
                                <li className="pt-2 mt-2 border-t dark:border-slate-700 font-semibold">Total Weight: {gradeCategories.reduce((sum, cat) => sum + cat.weight, 0)}%</li>
                            </ul>
                        ) : <p className="text-sm text-gray-500 dark:text-gray-400">No grade categories defined yet.</p>}
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Done</button>
                    </div>
                </>
            )}
            {/* AI Help Modal */}
            {modalOpen === 'aiHelp' && (
                <>
                    <div className="modal-header">
                        <h3 className="text-lg font-medium flex items-center gap-2"><HelpCircle size={24}/> AI Smart Tools Guide</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                    </div>
                    <div className="mt-2 prose dark:prose-invert max-w-none text-sm space-y-3">
                        <p>Our AI Smart Tools are designed to assist you in various teaching tasks. Here's how they work:</p>
                        <h4>Student Performance Insights:</h4>
                        <p>Select a student from the dropdown. The AI will analyze their available grades and assignment details to provide insights on their strengths, weaknesses, and actionable recommendations. The AI receives anonymized grade data (scores, max points, comments, assignment titles) for the selected student.</p>
                        <h4>Assignment Idea Generator:</h4>
                        <p>Enter a subject or topic (e.g., "Photosynthesis", "Shakespearean Sonnets") and optionally select a class. The AI will generate three creative assignment ideas with descriptions and difficulty levels.</p>
                        <h4>Feedback Suggester:</h4>
                        <p>Provide an assignment title, the student's score, and the maximum possible score. Optionally, add a specific area you want the feedback to focus on. The AI will generate a constructive feedback comment. This is best used as a starting point for your personalized feedback.</p>
                        <div className="alert alert-warning mt-4">
                            <AlertTriangle size={20}/>
                            <span><strong>Important:</strong> AI responses are generated based on patterns and data. Always review suggestions for accuracy and appropriateness before using them. AI can make mistakes or generate biased content. Your professional judgment is crucial.</span>
                        </div>
                        <p>The AI aims for JSON responses for structured data (insights, ideas, feedback comments). If the response isn't structured as expected, it might appear as plain text.</p>
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeModal} className="btn btn-primary">Got it!</button>
                    </div>
                </>
            )}
            {/* Confirm Delete Modal */}
            {modalOpen === 'confirmDelete' && itemToDelete && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-400 flex items-center gap-2"><AlertTriangle/> Confirm Deletion</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close modal"><XCircle size={22}/></button>
                </div>
                <p className="mt-4">Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.</p>
                {(itemToDelete.type === 'student' || itemToDelete.type === 'assignment') && <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">All associated grades will also be deleted.</p>}
                {(itemToDelete.type === 'class' && (students.some(s => s.classId === itemToDelete.id) || assignments.some(a => a.classId === itemToDelete.id))) &&
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">This class has students or assignments. Deleting it will remove these associations. Consider reassigning them first.</p>
                }
                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                  <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"><Trash2 size={18}/> Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;