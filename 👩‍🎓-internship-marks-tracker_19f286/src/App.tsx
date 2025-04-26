import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Users, Trash2, Download, Upload, Plus, Edit, Eye, Search, ArrowUpDown, Check, X, Filter, UserCheck } from 'lucide-react';
import styles from './styles/styles.module.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

// Define TypeScript interfaces for our data models
interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  rollNumber: string;
  batch: string;
}

interface Company {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface Internship {
  id: string;
  studentId: string;
  companyId: string;
  startDate: string;
  endDate: string;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  projectTitle: string;
}

interface Evaluation {
  id: string;
  internshipId: string;
  evaluationDate: string;
  presentationMarks: number;
  reportMarks: number;
  supervisorFeedbackMarks: number;
  attendanceMarks: number;
  totalMarks: number;
  remarks: string;
}

interface StatsData {
  name: string;
  value: number;
}

type TabType = 'students' | 'companies' | 'internships' | 'evaluations' | 'statistics';

const App: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentInternship, setCurrentInternship] = useState<Internship | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statsFilter, setStatsFilter] = useState('department');
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    batch: '',
    company: '',
    status: ''
  });

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedCompanies = localStorage.getItem('companies');
    const savedInternships = localStorage.getItem('internships');
    const savedEvaluations = localStorage.getItem('evaluations');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));
    if (savedInternships) setInternships(JSON.parse(savedInternships));
    if (savedEvaluations) setEvaluations(JSON.parse(savedEvaluations));
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');

    // Add some sample data if nothing exists
    if (!savedStudents && !savedCompanies && !savedInternships && !savedEvaluations) {
      const sampleStudents: Student[] = [
        { id: '1', name: 'John Smith', email: 'john@example.com', department: 'Computer Science', rollNumber: 'CS2020001', batch: '2020' },
        { id: '2', name: 'Emma Johnson', email: 'emma@example.com', department: 'Electrical Engineering', rollNumber: 'EE2021015', batch: '2021' },
        { id: '3', name: 'Michael Brown', email: 'michael@example.com', department: 'Mechanical Engineering', rollNumber: 'ME2020022', batch: '2020' },
        { id: '4', name: 'Sophia Liu', email: 'sophia@example.com', department: 'Computer Science', rollNumber: 'CS2021008', batch: '2021' },
      ];

      const sampleCompanies: Company[] = [
        { id: '1', name: 'TechCorp Solutions', address: '123 Tech Park, Bangalore', contactPerson: 'James Wilson', email: 'james@techcorp.com', phone: '+91-9876543210' },
        { id: '2', name: 'InnovateX', address: '456 Innovation Hub, Mumbai', contactPerson: 'Sarah Miller', email: 'sarah@innovatex.com', phone: '+91-8765432109' },
        { id: '3', name: 'DataSystems Inc', address: '789 Cyber City, Hyderabad', contactPerson: 'David Chen', email: 'david@datasystems.com', phone: '+91-7654321098' },
      ];

      const sampleInternships: Internship[] = [
        { id: '1', studentId: '1', companyId: '1', startDate: '2023-05-01', endDate: '2023-07-31', status: 'Completed', projectTitle: 'Machine Learning Algorithm Development' },
        { id: '2', studentId: '2', companyId: '2', startDate: '2023-06-15', endDate: '2023-08-15', status: 'Completed', projectTitle: 'Energy Efficiency Systems' },
        { id: '3', studentId: '3', companyId: '3', startDate: '2023-06-01', endDate: '2023-08-31', status: 'Completed', projectTitle: 'Industrial Automation Framework' },
        { id: '4', studentId: '4', companyId: '1', startDate: '2023-12-01', endDate: '2024-02-28', status: 'Ongoing', projectTitle: 'Database Optimization Project' },
      ];

      const sampleEvaluations: Evaluation[] = [
        { id: '1', internshipId: '1', evaluationDate: '2023-08-10', presentationMarks: 18, reportMarks: 24, supervisorFeedbackMarks: 27, attendanceMarks: 9, totalMarks: 78, remarks: 'Excellent performance. Developed innovative solutions.' },
        { id: '2', internshipId: '2', evaluationDate: '2023-08-20', presentationMarks: 17, reportMarks: 23, supervisorFeedbackMarks: 25, attendanceMarks: 10, totalMarks: 75, remarks: 'Good technical skills. Could improve documentation.' },
        { id: '3', internshipId: '3', evaluationDate: '2023-09-05', presentationMarks: 19, reportMarks: 25, supervisorFeedbackMarks: 26, attendanceMarks: 9, totalMarks: 79, remarks: 'Outstanding work ethic. Implemented complex solutions.' },
      ];

      setStudents(sampleStudents);
      setCompanies(sampleCompanies);
      setInternships(sampleInternships);
      setEvaluations(sampleEvaluations);

      localStorage.setItem('students', JSON.stringify(sampleStudents));
      localStorage.setItem('companies', JSON.stringify(sampleCompanies));
      localStorage.setItem('internships', JSON.stringify(sampleInternships));
      localStorage.setItem('evaluations', JSON.stringify(sampleEvaluations));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('internships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  // Dark mode toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Event handlers for modals
  const openModal = (type: string, isView = false) => {
    setModalType(type);
    setIsViewMode(isView);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModalType('');
    setIsModalOpen(false);
    setCurrentStudent(null);
    setCurrentCompany(null);
    setCurrentInternship(null);
    setCurrentEvaluation(null);
    setIsViewMode(false);
    document.body.classList.remove('modal-open');
  };

  // CRUD operations for Student
  const addStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const department = (form.elements.namedItem('department') as HTMLInputElement).value;
    const rollNumber = (form.elements.namedItem('rollNumber') as HTMLInputElement).value;
    const batch = (form.elements.namedItem('batch') as HTMLInputElement).value;

    const newStudent: Student = {
      id: currentStudent ? currentStudent.id : Date.now().toString(),
      name,
      email,
      department,
      rollNumber,
      batch
    };

    if (currentStudent) {
      setStudents(students.map(student => student.id === currentStudent.id ? newStudent : student));
    } else {
      setStudents([...students, newStudent]);
    }

    closeModal();
  };

  const editStudent = (student: Student) => {
    setCurrentStudent(student);
    openModal('student');
  };

  const viewStudent = (student: Student) => {
    setCurrentStudent(student);
    openModal('student', true);
  };

  const deleteStudent = (id: string) => {
    // Check if student has internship records
    const hasInternships = internships.some(internship => internship.studentId === id);
    if (hasInternships) {
      alert('Cannot delete student with associated internship records');
      return;
    }
    setStudents(students.filter(student => student.id !== id));
  };

  // CRUD operations for Company
  const addCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const address = (form.elements.namedItem('address') as HTMLInputElement).value;
    const contactPerson = (form.elements.namedItem('contactPerson') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

    const newCompany: Company = {
      id: currentCompany ? currentCompany.id : Date.now().toString(),
      name,
      address,
      contactPerson,
      email,
      phone
    };

    if (currentCompany) {
      setCompanies(companies.map(company => company.id === currentCompany.id ? newCompany : company));
    } else {
      setCompanies([...companies, newCompany]);
    }

    closeModal();
  };

  const editCompany = (company: Company) => {
    setCurrentCompany(company);
    openModal('company');
  };

  const viewCompany = (company: Company) => {
    setCurrentCompany(company);
    openModal('company', true);
  };

  const deleteCompany = (id: string) => {
    // Check if company has internship records
    const hasInternships = internships.some(internship => internship.companyId === id);
    if (hasInternships) {
      alert('Cannot delete company with associated internship records');
      return;
    }
    setCompanies(companies.filter(company => company.id !== id));
  };

  // CRUD operations for Internship
  const addInternship = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const studentId = (form.elements.namedItem('studentId') as HTMLSelectElement).value;
    const companyId = (form.elements.namedItem('companyId') as HTMLSelectElement).value;
    const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
    const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as 'Ongoing' | 'Completed' | 'Upcoming';
    const projectTitle = (form.elements.namedItem('projectTitle') as HTMLInputElement).value;

    const newInternship: Internship = {
      id: currentInternship ? currentInternship.id : Date.now().toString(),
      studentId,
      companyId,
      startDate,
      endDate,
      status,
      projectTitle
    };

    if (currentInternship) {
      setInternships(internships.map(internship => internship.id === currentInternship.id ? newInternship : internship));
    } else {
      setInternships([...internships, newInternship]);
    }

    closeModal();
  };

  const editInternship = (internship: Internship) => {
    setCurrentInternship(internship);
    openModal('internship');
  };

  const viewInternship = (internship: Internship) => {
    setCurrentInternship(internship);
    openModal('internship', true);
  };

  const deleteInternship = (id: string) => {
    // Check if internship has evaluation records
    const hasEvaluations = evaluations.some(evaluation => evaluation.internshipId === id);
    if (hasEvaluations) {
      alert('Cannot delete internship with associated evaluation records');
      return;
    }
    setInternships(internships.filter(internship => internship.id !== id));
  };

  // CRUD operations for Evaluation
  const addEvaluation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const internshipId = (form.elements.namedItem('internshipId') as HTMLSelectElement).value;
    const evaluationDate = (form.elements.namedItem('evaluationDate') as HTMLInputElement).value;
    const presentationMarks = parseInt((form.elements.namedItem('presentationMarks') as HTMLInputElement).value, 10);
    const reportMarks = parseInt((form.elements.namedItem('reportMarks') as HTMLInputElement).value, 10);
    const supervisorFeedbackMarks = parseInt((form.elements.namedItem('supervisorFeedbackMarks') as HTMLInputElement).value, 10);
    const attendanceMarks = parseInt((form.elements.namedItem('attendanceMarks') as HTMLInputElement).value, 10);
    const remarks = (form.elements.namedItem('remarks') as HTMLTextAreaElement).value;

    const totalMarks = presentationMarks + reportMarks + supervisorFeedbackMarks + attendanceMarks;

    const newEvaluation: Evaluation = {
      id: currentEvaluation ? currentEvaluation.id : Date.now().toString(),
      internshipId,
      evaluationDate,
      presentationMarks,
      reportMarks,
      supervisorFeedbackMarks,
      attendanceMarks,
      totalMarks,
      remarks
    };

    if (currentEvaluation) {
      setEvaluations(evaluations.map(evaluation => evaluation.id === currentEvaluation.id ? newEvaluation : evaluation));
    } else {
      setEvaluations([...evaluations, newEvaluation]);
    }

    closeModal();
  };

  const editEvaluation = (evaluation: Evaluation) => {
    setCurrentEvaluation(evaluation);
    openModal('evaluation');
  };

  const viewEvaluation = (evaluation: Evaluation) => {
    setCurrentEvaluation(evaluation);
    openModal('evaluation', true);
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(evaluations.filter(evaluation => evaluation.id !== id));
  };

  // Helper function to get student name by ID
  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  // Helper function to get company name by ID
  const getCompanyName = (companyId: string): string => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  // Helper function to get internship details by ID
  const getInternshipDetails = (internshipId: string): { studentName: string; companyName: string; projectTitle: string } => {
    const internship = internships.find(i => i.id === internshipId);
    if (!internship) {
      return { studentName: 'Unknown', companyName: 'Unknown', projectTitle: 'Unknown' };
    }
    
    return {
      studentName: getStudentName(internship.studentId),
      companyName: getCompanyName(internship.companyId),
      projectTitle: internship.projectTitle
    };
  };

  // Sort and filter logic
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = <T extends object>(data: T[], column: keyof T | null): T[] => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' ? 
          valueA.localeCompare(valueB) : 
          valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
  };

  // Filter logic for each tab
  const getFilteredStudents = () => {
    let filtered = students;
    
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterOptions.department) {
      filtered = filtered.filter(student => student.department === filterOptions.department);
    }
    
    if (filterOptions.batch) {
      filtered = filtered.filter(student => student.batch === filterOptions.batch);
    }
    
    return sortData(filtered, sortColumn as keyof Student);
  };

  const getFilteredCompanies = () => {
    let filtered = companies;
    
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return sortData(filtered, sortColumn as keyof Company);
  };

  const getFilteredInternships = () => {
    let filtered = internships;
    
    if (searchTerm) {
      filtered = filtered.filter(internship => {
        const student = students.find(s => s.id === internship.studentId);
        const company = companies.find(c => c.id === internship.companyId);
        return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               internship.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    if (filterOptions.status) {
      filtered = filtered.filter(internship => internship.status === filterOptions.status);
    }
    
    if (filterOptions.company) {
      filtered = filtered.filter(internship => internship.companyId === filterOptions.company);
    }
    
    return sortData(filtered, sortColumn as keyof Internship);
  };

  const getFilteredEvaluations = () => {
    let filtered = evaluations;
    
    if (searchTerm) {
      filtered = filtered.filter(evaluation => {
        const internship = internships.find(i => i.id === evaluation.internshipId);
        if (!internship) return false;
        
        const student = students.find(s => s.id === internship.studentId);
        const company = companies.find(c => c.id === internship.companyId);
        
        return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               internship.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    return sortData(filtered, sortColumn as keyof Evaluation);
  };

  // Export data to Excel
  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Download templates
  const downloadTemplate = (type: string) => {
    let templateData: any[] = [];
    
    switch (type) {
      case 'students':
        templateData = [{
          name: 'John Doe',
          email: 'john@example.com',
          department: 'Computer Science',
          rollNumber: 'CS2023001',
          batch: '2023'
        }];
        break;
      case 'companies':
        templateData = [{
          name: 'Tech Company',
          address: '123 Tech St, City',
          contactPerson: 'Jane Smith',
          email: 'jane@techcompany.com',
          phone: '+91-1234567890'
        }];
        break;
      case 'internships':
        templateData = [{
          studentId: 'student_id_here',
          companyId: 'company_id_here',
          startDate: '2023-01-01',
          endDate: '2023-03-31',
          status: 'Completed',
          projectTitle: 'Project Title'
        }];
        break;
      case 'evaluations':
        templateData = [{
          internshipId: 'internship_id_here',
          evaluationDate: '2023-04-15',
          presentationMarks: 18,
          reportMarks: 25,
          supervisorFeedbackMarks: 28,
          attendanceMarks: 9,
          remarks: 'Excellent work'
        }];
        break;
      default:
        break;
    }
    
    exportToExcel(templateData, `${type}_template`);
  };

  // Import data from Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) return;
      
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      try {
        if (jsonData.length === 0) {
          alert('No data found in the file');
          return;
        }
        
        switch (type) {
          case 'students':
            const newStudents = jsonData.map((item: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              name: item.name,
              email: item.email,
              department: item.department,
              rollNumber: item.rollNumber,
              batch: item.batch
            }));
            setStudents([...students, ...newStudents]);
            break;
          case 'companies':
            const newCompanies = jsonData.map((item: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              name: item.name,
              address: item.address,
              contactPerson: item.contactPerson,
              email: item.email,
              phone: item.phone
            }));
            setCompanies([...companies, ...newCompanies]);
            break;
          case 'internships':
            const newInternships = jsonData.map((item: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              studentId: item.studentId,
              companyId: item.companyId,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
              projectTitle: item.projectTitle
            }));
            setInternships([...internships, ...newInternships]);
            break;
          case 'evaluations':
            const newEvaluations = jsonData.map((item: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              internshipId: item.internshipId,
              evaluationDate: item.evaluationDate,
              presentationMarks: item.presentationMarks,
              reportMarks: item.reportMarks,
              supervisorFeedbackMarks: item.supervisorFeedbackMarks,
              attendanceMarks: item.attendanceMarks,
              totalMarks: item.presentationMarks + item.reportMarks + item.supervisorFeedbackMarks + item.attendanceMarks,
              remarks: item.remarks
            }));
            setEvaluations([...evaluations, ...newEvaluations]);
            break;
          default:
            break;
        }
        
        alert('Data imported successfully');
        // Reset file input
        e.target.value = '';
        
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file');
    };
    
    reader.readAsBinaryString(file);
  };

  // Prepare statistics data
  const getStatistics = () => {
    // Department Statistics
    const departmentStats: StatsData[] = [];
    const departmentMap = new Map<string, number>();
    
    students.forEach(student => {
      const dept = student.department;
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
    });
    
    departmentMap.forEach((value, key) => {
      departmentStats.push({ name: key, value });
    });

    // Company Statistics
    const companyStats: StatsData[] = [];
    const companyMap = new Map<string, number>();
    
    internships.forEach(internship => {
      const companyName = getCompanyName(internship.companyId);
      companyMap.set(companyName, (companyMap.get(companyName) || 0) + 1);
    });
    
    companyMap.forEach((value, key) => {
      companyStats.push({ name: key, value });
    });

    // Batch Statistics
    const batchStats: StatsData[] = [];
    const batchMap = new Map<string, number>();
    
    students.forEach(student => {
      const batch = student.batch;
      batchMap.set(batch, (batchMap.get(batch) || 0) + 1);
    });
    
    batchMap.forEach((value, key) => {
      batchStats.push({ name: key, value });
    });

    // Status Statistics
    const statusStats: StatsData[] = [];
    const statusMap = new Map<string, number>();
    
    internships.forEach(internship => {
      const status = internship.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    
    statusMap.forEach((value, key) => {
      statusStats.push({ name: key, value });
    });

    // Performance Statistics
    const performanceData = evaluations.map(evaluation => {
      const internship = internships.find(i => i.id === evaluation.internshipId);
      if (!internship) return null;

      const studentName = getStudentName(internship.studentId);
      return {
        name: studentName,
        marks: evaluation.totalMarks
      };
    }).filter(Boolean);

    return {
      departmentStats,
      companyStats,
      batchStats,
      statusStats,
      performanceData
    };
  };

  // Prepare unique departments and batches for filters
  const departments = [...new Set(students.map(student => student.department))];
  const batches = [...new Set(students.map(student => student.batch))];

  // Keyboard event handler for ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <UserCheck className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Internship Evaluation System</h1>
            </div>
            <div className="flex items-center">
              <button 
                className="theme-toggle mr-4" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">{isDarkMode ? 'Dark' : 'Light'} Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container-fluid mt-6">
        <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-700">
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'students' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('students')}
          >
            <Users className="inline-block h-4 w-4 mr-1" />
            Students
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'companies' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('companies')}
          >
            <Users className="inline-block h-4 w-4 mr-1" />
            Companies
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'internships' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('internships')}
          >
            <Users className="inline-block h-4 w-4 mr-1" />
            Internships
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'evaluations' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('evaluations')}
          >
            <Users className="inline-block h-4 w-4 mr-1" />
            Evaluations
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'statistics' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('statistics')}
          >
            <Users className="inline-block h-4 w-4 mr-1" />
            Statistics
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container-fluid py-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between mb-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-0">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            {activeTab === 'students' && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select
                  className="input"
                  value={filterOptions.department}
                  onChange={(e) => setFilterOptions({...filterOptions, department: e.target.value})}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={filterOptions.batch}
                  onChange={(e) => setFilterOptions({...filterOptions, batch: e.target.value})}
                >
                  <option value="">All Batches</option>
                  {batches.map((batch, index) => (
                    <option key={index} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'internships' && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select
                  className="input"
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
                <select
                  className="input"
                  value={filterOptions.company}
                  onChange={(e) => setFilterOptions({...filterOptions, company: e.target.value})}
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeTab !== 'statistics' && (
              <button 
                className="btn btn-primary flex items-center justify-center gap-2"
                onClick={() => openModal(activeTab.slice(0, -1))}
              >
                <Plus className="h-4 w-4" />
                Add {activeTab.slice(0, -1)}
              </button>
            )}
            
            {activeTab !== 'statistics' && (
              <button 
                className="btn bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 flex items-center justify-center gap-2"
                onClick={() => downloadTemplate(activeTab)}
              >
                <Download className="h-4 w-4" />
                Template
              </button>
            )}
            
            {activeTab !== 'statistics' && (
              <div className="relative inline-block">
                <input
                  type="file"
                  id="fileUpload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".xlsx, .xls"
                  onChange={(e) => handleFileUpload(e, activeTab)}
                />
                <button className="btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </button>
              </div>
            )}
            
            {activeTab !== 'statistics' && (
              <button 
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 flex items-center justify-center gap-2"
                onClick={() => {
                  let data: any[] = [];
                  
                  switch (activeTab) {
                    case 'students':
                      data = getFilteredStudents();
                      break;
                    case 'companies':
                      data = getFilteredCompanies();
                      break;
                    case 'internships':
                      data = getFilteredInternships().map(internship => ({
                        ...internship,
                        studentName: getStudentName(internship.studentId),
                        companyName: getCompanyName(internship.companyId),
                      }));
                      break;
                    case 'evaluations':
                      data = getFilteredEvaluations().map(evaluation => {
                        const details = getInternshipDetails(evaluation.internshipId);
                        return {
                          ...evaluation,
                          studentName: details.studentName,
                          companyName: details.companyName,
                          projectTitle: details.projectTitle,
                        };
                      });
                      break;
                    default:
                      break;
                  }
                  
                  exportToExcel(data, activeTab);
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Statistics View */}
        {activeTab === 'statistics' && (
          <div className="space-y-8">
            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">Internship Statistics</h2>
                <div>
                  <select
                    className="input"
                    value={statsFilter}
                    onChange={(e) => setStatsFilter(e.target.value)}
                  >
                    <option value="department">By Department</option>
                    <option value="company">By Company</option>
                    <option value="batch">By Batch</option>
                    <option value="status">By Status</option>
                    <option value="performance">By Performance</option>
                  </select>
                </div>
              </div>
              
              <div className="w-full">
                {statsFilter === 'department' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getStatistics().departmentStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Students" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsChart>
                          <Pie
                            data={getStatistics().departmentStats}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getStatistics().departmentStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {statsFilter === 'company' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getStatistics().companyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Internships" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsChart>
                          <Pie
                            data={getStatistics().companyStats}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getStatistics().companyStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {statsFilter === 'batch' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getStatistics().batchStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Students" fill="#FF8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsChart>
                          <Pie
                            data={getStatistics().batchStats}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getStatistics().batchStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {statsFilter === 'status' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getStatistics().statusStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Internships" fill="#FFBB28" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsChart>
                          <Pie
                            data={getStatistics().statusStats}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getStatistics().statusStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {statsFilter === 'performance' && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getStatistics().performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="marks" name="Total Marks" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Students</div>
                <div className="stat-value">{students.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Companies</div>
                <div className="stat-value">{companies.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Internships</div>
                <div className="stat-value">{internships.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Completed Evaluations</div>
                <div className="stat-value">{evaluations.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Student Management Table */}
        {activeTab === 'students' && (
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header" onClick={() => handleSort('rollNumber')}>
                      <div className="flex items-center cursor-pointer">
                        Roll No.
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header" onClick={() => handleSort('name')}>
                      <div className="flex items-center cursor-pointer">
                        Name
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header" onClick={() => handleSort('department')}>
                      <div className="flex items-center cursor-pointer">
                        Department
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header" onClick={() => handleSort('batch')}>
                      <div className="flex items-center cursor-pointer">
                        Batch
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {getFilteredStudents().map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell">{student.rollNumber}</td>
                      <td className="table-cell font-medium">{student.name}</td>
                      <td className="table-cell">{student.department}</td>
                      <td className="table-cell">{student.batch}</td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewStudent(student)}
                            className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center p-1 rounded"
                            aria-label="View student"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => editStudent(student)}
                            className="btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center p-1 rounded"
                            aria-label="Edit student"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 flex items-center justify-center p-1 rounded"
                            aria-label="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredStudents().length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-cell text-center text-gray-500 dark:text-gray-400">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Company Management Table */}
        {activeTab === 'companies' && (
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header" onClick={() => handleSort('name')}>
                      <div className="flex items-center cursor-pointer">
                        Name
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header">Contact Person</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {getFilteredCompanies().map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell font-medium">{company.name}</td>
                      <td className="table-cell">{company.contactPerson}</td>
                      <td className="table-cell">{company.email}</td>
                      <td className="table-cell">{company.phone}</td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewCompany(company)}
                            className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center p-1 rounded"
                            aria-label="View company"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => editCompany(company)}
                            className="btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center p-1 rounded"
                            aria-label="Edit company"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCompany(company.id)}
                            className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 flex items-center justify-center p-1 rounded"
                            aria-label="Delete company"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredCompanies().length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-cell text-center text-gray-500 dark:text-gray-400">
                        No companies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Internship Management Table */}
        {activeTab === 'internships' && (
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Company</th>
                    <th className="table-header">Project Title</th>
                    <th className="table-header">Duration</th>
                    <th className="table-header" onClick={() => handleSort('status')}>
                      <div className="flex items-center cursor-pointer">
                        Status
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {getFilteredInternships().map((internship) => (
                    <tr key={internship.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell font-medium">{getStudentName(internship.studentId)}</td>
                      <td className="table-cell">{getCompanyName(internship.companyId)}</td>
                      <td className="table-cell">{internship.projectTitle}</td>
                      <td className="table-cell">
                        {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${internship.status === 'Completed' ? 'badge-success' : internship.status === 'Ongoing' ? 'badge-info' : 'badge-warning'}`}>
                          {internship.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewInternship(internship)}
                            className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center p-1 rounded"
                            aria-label="View internship"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => editInternship(internship)}
                            className="btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center p-1 rounded"
                            aria-label="Edit internship"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteInternship(internship.id)}
                            className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 flex items-center justify-center p-1 rounded"
                            aria-label="Delete internship"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredInternships().length === 0 && (
                    <tr>
                      <td colSpan={6} className="table-cell text-center text-gray-500 dark:text-gray-400">
                        No internships found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evaluation Management Table */}
        {activeTab === 'evaluations' && (
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Project</th>
                    <th className="table-header">Company</th>
                    <th className="table-header">Evaluation Date</th>
                    <th className="table-header" onClick={() => handleSort('totalMarks')}>
                      <div className="flex items-center cursor-pointer">
                        Total Marks
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {getFilteredEvaluations().map((evaluation) => {
                    const internship = internships.find(i => i.id === evaluation.internshipId);
                    if (!internship) return null;
                    
                    const studentName = getStudentName(internship.studentId);
                    const companyName = getCompanyName(internship.companyId);
                    
                    return (
                      <tr key={evaluation.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{studentName}</td>
                        <td className="table-cell">{internship.projectTitle}</td>
                        <td className="table-cell">{companyName}</td>
                        <td className="table-cell">{new Date(evaluation.evaluationDate).toLocaleDateString()}</td>
                        <td className="table-cell">
                          <span className={`font-semibold ${evaluation.totalMarks >= 75 ? 'text-green-600 dark:text-green-400' : evaluation.totalMarks >= 60 ? 'text-blue-600 dark:text-blue-400' : evaluation.totalMarks >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                            {evaluation.totalMarks}/100
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewEvaluation(evaluation)}
                              className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center p-1 rounded"
                              aria-label="View evaluation"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => editEvaluation(evaluation)}
                              className="btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center p-1 rounded"
                              aria-label="Edit evaluation"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteEvaluation(evaluation.id)}
                              className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 flex items-center justify-center p-1 rounded"
                              aria-label="Delete evaluation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {getFilteredEvaluations().length === 0 && (
                    <tr>
                      <td colSpan={6} className="table-cell text-center text-gray-500 dark:text-gray-400">
                        No evaluations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-backdrop theme-transition" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Student Modal */}
            {modalType === 'student' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                    {currentStudent ? (isViewMode ? 'Student Details' : 'Edit Student') : 'Add New Student'}
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={isViewMode ? undefined : addStudent}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        className="input" 
                        defaultValue={currentStudent?.name}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        className="input" 
                        defaultValue={currentStudent?.email}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="department" className="form-label">Department</label>
                      <input 
                        type="text" 
                        id="department" 
                        name="department"
                        className="input" 
                        defaultValue={currentStudent?.department}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                      <input 
                        type="text" 
                        id="rollNumber" 
                        name="rollNumber"
                        className="input" 
                        defaultValue={currentStudent?.rollNumber}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="batch" className="form-label">Batch</label>
                      <input 
                        type="text" 
                        id="batch" 
                        name="batch"
                        className="input" 
                        defaultValue={currentStudent?.batch}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                      <button 
                        type="submit"
                        className="btn btn-primary"
                      >
                        {currentStudent ? 'Update' : 'Save'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Company Modal */}
            {modalType === 'company' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                    {currentCompany ? (isViewMode ? 'Company Details' : 'Edit Company') : 'Add New Company'}
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={isViewMode ? undefined : addCompany}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Company Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        className="input" 
                        defaultValue={currentCompany?.name}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address" className="form-label">Address</label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address"
                        className="input" 
                        defaultValue={currentCompany?.address}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                      <input 
                        type="text" 
                        id="contactPerson" 
                        name="contactPerson"
                        className="input" 
                        defaultValue={currentCompany?.contactPerson}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        className="input" 
                        defaultValue={currentCompany?.email}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input 
                        type="text" 
                        id="phone" 
                        name="phone"
                        className="input" 
                        defaultValue={currentCompany?.phone}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                      <button 
                        type="submit"
                        className="btn btn-primary"
                      >
                        {currentCompany ? 'Update' : 'Save'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Internship Modal */}
            {modalType === 'internship' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                    {currentInternship ? (isViewMode ? 'Internship Details' : 'Edit Internship') : 'Add New Internship'}
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={isViewMode ? undefined : addInternship}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="studentId" className="form-label">Student</label>
                      <select 
                        id="studentId" 
                        name="studentId"
                        className="input" 
                        defaultValue={currentInternship?.studentId}
                        disabled={isViewMode}
                        required
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.name} ({student.rollNumber})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="companyId" className="form-label">Company</label>
                      <select 
                        id="companyId" 
                        name="companyId"
                        className="input" 
                        defaultValue={currentInternship?.companyId}
                        disabled={isViewMode}
                        required
                      >
                        <option value="">Select Company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="projectTitle" className="form-label">Project Title</label>
                      <input 
                        type="text" 
                        id="projectTitle" 
                        name="projectTitle"
                        className="input" 
                        defaultValue={currentInternship?.projectTitle}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="startDate" className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        id="startDate" 
                        name="startDate"
                        className="input" 
                        defaultValue={currentInternship?.startDate}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="endDate" className="form-label">End Date</label>
                      <input 
                        type="date" 
                        id="endDate" 
                        name="endDate"
                        className="input" 
                        defaultValue={currentInternship?.endDate}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select 
                        id="status" 
                        name="status"
                        className="input" 
                        defaultValue={currentInternship?.status}
                        disabled={isViewMode}
                        required
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                      <button 
                        type="submit"
                        className="btn btn-primary"
                      >
                        {currentInternship ? 'Update' : 'Save'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Evaluation Modal */}
            {modalType === 'evaluation' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                    {currentEvaluation ? (isViewMode ? 'Evaluation Details' : 'Edit Evaluation') : 'Add New Evaluation'}
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={isViewMode ? undefined : addEvaluation}>
                  <div className="mt-4 space-y-4">
                    <div className="form-group">
                      <label htmlFor="internshipId" className="form-label">Internship</label>
                      <select 
                        id="internshipId" 
                        name="internshipId"
                        className="input" 
                        defaultValue={currentEvaluation?.internshipId}
                        disabled={isViewMode}
                        required
                      >
                        <option value="">Select Internship</option>
                        {internships.map(internship => {
                          const studentName = getStudentName(internship.studentId);
                          const companyName = getCompanyName(internship.companyId);
                          return (
                            <option key={internship.id} value={internship.id}>
                              {studentName} - {internship.projectTitle} at {companyName}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="evaluationDate" className="form-label">Evaluation Date</label>
                      <input 
                        type="date" 
                        id="evaluationDate" 
                        name="evaluationDate"
                        className="input" 
                        defaultValue={currentEvaluation?.evaluationDate}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="presentationMarks" className="form-label">Presentation Marks (20)</label>
                        <input 
                          type="number" 
                          id="presentationMarks" 
                          name="presentationMarks"
                          className="input" 
                          min="0"
                          max="20"
                          defaultValue={currentEvaluation?.presentationMarks}
                          readOnly={isViewMode}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reportMarks" className="form-label">Report Marks (30)</label>
                        <input 
                          type="number" 
                          id="reportMarks" 
                          name="reportMarks"
                          className="input" 
                          min="0"
                          max="30"
                          defaultValue={currentEvaluation?.reportMarks}
                          readOnly={isViewMode}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="supervisorFeedbackMarks" className="form-label">Supervisor Feedback (40)</label>
                        <input 
                          type="number" 
                          id="supervisorFeedbackMarks" 
                          name="supervisorFeedbackMarks"
                          className="input" 
                          min="0"
                          max="40"
                          defaultValue={currentEvaluation?.supervisorFeedbackMarks}
                          readOnly={isViewMode}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="attendanceMarks" className="form-label">Attendance Marks (10)</label>
                        <input 
                          type="number" 
                          id="attendanceMarks" 
                          name="attendanceMarks"
                          className="input" 
                          min="0"
                          max="10"
                          defaultValue={currentEvaluation?.attendanceMarks}
                          readOnly={isViewMode}
                          required
                        />
                      </div>
                    </div>
                    {isViewMode && (
                      <div className="form-group">
                        <label className="form-label">Total Marks</label>
                        <div className="input flex items-center">
                          <span className="font-semibold text-lg">
                            {currentEvaluation?.totalMarks}/100
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor="remarks" className="form-label">Remarks</label>
                      <textarea 
                        id="remarks" 
                        name="remarks"
                        className="input" 
                        rows={3}
                        defaultValue={currentEvaluation?.remarks}
                        readOnly={isViewMode}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                      <button 
                        type="submit"
                        className="btn btn-primary"
                      >
                        {currentEvaluation ? 'Update' : 'Save'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-6 mt-auto theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
