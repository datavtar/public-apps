import React, { useState, useEffect } from 'react';
import {
  User,
  Trash2,
  Search,
  Filter,
  Edit,
  Plus,
  ChevronDown,
  Download,
  Upload,
  Briefcase,
  GraduationCap,
  Building,
  FileText,
  Check,
  X,
  BarChart as LucideBarChart,
  PieChart as LucidePieChart,
  ChevronUp,
  Moon,
  Sun,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define Types
interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  placementStatus: 'Placed' | 'Not Placed' | 'Interview Scheduled' | 'Offer Received';
  company?: string;
  package?: number;
  joiningDate?: string;
  skills: string[];
  interviews: Interview[];
}

interface Interview {
  id: string;
  companyName: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  round: string;
  feedback?: string;
  result?: 'Selected' | 'Rejected' | 'On Hold' | 'Pending';
}

interface CompanyData {
  id: string;
  name: string;
  industry: string;
  location: string;
  openPositions: string[];
  visitDate?: string;
  status: 'Upcoming' | 'Visited' | 'Cancelled';
  studentsPlaced: number;
  averagePackage?: number;
  highestPackage?: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface FilterOptions {
  placementStatus: string;
  degree: string;
  branch: string;
  graduationYear: string;
  minCGPA: string;
}

interface ChartData {
  name: string;
  value: number;
}

// Main App Component
const App: React.FC = () => {
  // State Management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'companies' | 'interviews'>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    placementStatus: '',
    degree: '',
    branch: '',
    graduationYear: '',
    minCGPA: '',
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [showCompanyModal, setShowCompanyModal] = useState<boolean>(false);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [selectedInterview, setSelectedInterview] = useState<{ interview: Interview; studentId: string } | null>(null);
  
  // Degrees and branches for dropdown options
  const degrees = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc'];
  const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Electrical', 'Civil', 'Information Technology'];
  const industries = ['IT', 'Finance', 'Manufacturing', 'Healthcare', 'E-commerce', 'Consulting'];
  const skills = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps'];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedCompanies = localStorage.getItem('companies');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Set sample student data
      setStudents(generateSampleStudents());
    }

    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    } else {
      // Set sample company data
      setCompanies(generateSampleCompanies());
    }

    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  // Update darkMode in localStorage and apply to HTML
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Generate sample students data for initial state
  const generateSampleStudents = (): Student[] => {
    return [
      {
        id: '1',
        name: 'Rahul Sharma',
        rollNumber: 'BTH001',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        degree: 'B.Tech',
        branch: 'Computer Science',
        graduationYear: 2023,
        cgpa: 8.7,
        placementStatus: 'Placed',
        company: 'Microsoft',
        package: 1800000,
        joiningDate: '2023-07-15',
        skills: ['JavaScript', 'React', 'Node.js'],
        interviews: [
          {
            id: '1-1',
            companyName: 'Microsoft',
            date: '2023-03-10',
            status: 'Completed',
            round: 'Technical',
            feedback: 'Good problem solving skills',
            result: 'Selected'
          },
          {
            id: '1-2',
            companyName: 'Microsoft',
            date: '2023-03-15',
            status: 'Completed',
            round: 'HR',
            feedback: 'Good communication',
            result: 'Selected'
          }
        ]
      },
      {
        id: '2',
        name: 'Priya Patel',
        rollNumber: 'BTH002',
        email: 'priya.patel@example.com',
        phone: '9876543211',
        degree: 'B.Tech',
        branch: 'Electronics',
        graduationYear: 2023,
        cgpa: 9.2,
        placementStatus: 'Placed',
        company: 'Google',
        package: 2400000,
        joiningDate: '2023-08-01',
        skills: ['Python', 'Machine Learning', 'Data Analysis'],
        interviews: [
          {
            id: '2-1',
            companyName: 'Google',
            date: '2023-02-20',
            status: 'Completed',
            round: 'Technical',
            feedback: 'Excellent coding skills',
            result: 'Selected'
          }
        ]
      },
      {
        id: '3',
        name: 'Amit Kumar',
        rollNumber: 'MTH001',
        email: 'amit.kumar@example.com',
        phone: '9876543212',
        degree: 'M.Tech',
        branch: 'Computer Science',
        graduationYear: 2023,
        cgpa: 8.5,
        placementStatus: 'Interview Scheduled',
        skills: ['Java', 'Spring Boot', 'Microservices'],
        interviews: [
          {
            id: '3-1',
            companyName: 'Amazon',
            date: '2023-05-25',
            status: 'Scheduled',
            round: 'Technical',
            result: 'Pending'
          }
        ]
      },
      {
        id: '4',
        name: 'Neha Singh',
        rollNumber: 'BTH003',
        email: 'neha.singh@example.com',
        phone: '9876543213',
        degree: 'B.Tech',
        branch: 'Information Technology',
        graduationYear: 2024,
        cgpa: 7.8,
        placementStatus: 'Not Placed',
        skills: ['C++', 'Data Structures', 'Algorithms'],
        interviews: []
      },
      {
        id: '5',
        name: 'Vikram Reddy',
        rollNumber: 'BTH004',
        email: 'vikram.reddy@example.com',
        phone: '9876543214',
        degree: 'B.Tech',
        branch: 'Mechanical',
        graduationYear: 2023,
        cgpa: 8.2,
        placementStatus: 'Offer Received',
        company: 'Tata Motors',
        package: 900000,
        skills: ['AutoCAD', 'Mechanical Design', 'Thermal Engineering'],
        interviews: [
          {
            id: '5-1',
            companyName: 'Tata Motors',
            date: '2023-04-05',
            status: 'Completed',
            round: 'Technical',
            feedback: 'Good knowledge of mechanical principles',
            result: 'Selected'
          }
        ]
      }
    ];
  };

  // Generate sample companies data for initial state
  const generateSampleCompanies = (): CompanyData[] => {
    return [
      {
        id: '1',
        name: 'Microsoft',
        industry: 'IT',
        location: 'Bangalore',
        openPositions: ['Software Engineer', 'Data Scientist'],
        visitDate: '2023-03-10',
        status: 'Visited',
        studentsPlaced: 2,
        averagePackage: 1800000,
        highestPackage: 2200000,
        contactPerson: 'Anil Kumar',
        contactEmail: 'anil.kumar@microsoft.com',
        contactPhone: '9876543215'
      },
      {
        id: '2',
        name: 'Google',
        industry: 'IT',
        location: 'Hyderabad',
        openPositions: ['Software Engineer', 'UX Designer'],
        visitDate: '2023-02-20',
        status: 'Visited',
        studentsPlaced: 1,
        averagePackage: 2400000,
        highestPackage: 2400000,
        contactPerson: 'Sunita Rao',
        contactEmail: 'sunita.rao@google.com',
        contactPhone: '9876543216'
      },
      {
        id: '3',
        name: 'Amazon',
        industry: 'E-commerce',
        location: 'Bangalore',
        openPositions: ['Software Development Engineer', 'Product Manager'],
        visitDate: '2023-05-25',
        status: 'Upcoming',
        studentsPlaced: 0,
        contactPerson: 'Rajesh Gupta',
        contactEmail: 'rajesh.gupta@amazon.com',
        contactPhone: '9876543217'
      },
      {
        id: '4',
        name: 'Tata Consultancy Services',
        industry: 'IT',
        location: 'Pune',
        openPositions: ['Systems Engineer', 'Business Analyst'],
        visitDate: '2023-06-15',
        status: 'Upcoming',
        studentsPlaced: 0,
        contactPerson: 'Meena Iyer',
        contactEmail: 'meena.iyer@tcs.com',
        contactPhone: '9876543218'
      },
      {
        id: '5',
        name: 'Tata Motors',
        industry: 'Manufacturing',
        location: 'Mumbai',
        openPositions: ['Mechanical Engineer', 'Design Engineer'],
        visitDate: '2023-04-05',
        status: 'Visited',
        studentsPlaced: 1,
        averagePackage: 900000,
        highestPackage: 900000,
        contactPerson: 'Vivek Shah',
        contactEmail: 'vivek.shah@tatamotors.com',
        contactPhone: '9876543219'
      }
    ];
  };

  // Get placement statistics for dashboard
  const getPlacementStats = () => {
    const totalStudents = students.length;
    const placedStudents = students.filter(student => student.placementStatus === 'Placed').length;
    const offeredStudents = students.filter(student => student.placementStatus === 'Offer Received').length;
    const interviewScheduledStudents = students.filter(student => student.placementStatus === 'Interview Scheduled').length;
    const notPlacedStudents = students.filter(student => student.placementStatus === 'Not Placed').length;

    return {
      totalStudents,
      placedStudents,
      offeredStudents,
      interviewScheduledStudents,
      notPlacedStudents,
      placementPercentage: totalStudents > 0 ? ((placedStudents + offeredStudents) / totalStudents) * 100 : 0,
    };
  };

  // Get company statistics for dashboard
  const getCompanyStats = () => {
    const totalCompanies = companies.length;
    const visitedCompanies = companies.filter(company => company.status === 'Visited').length;
    const upcomingCompanies = companies.filter(company => company.status === 'Upcoming').length;
    const cancelledCompanies = companies.filter(company => company.status === 'Cancelled').length;

    return {
      totalCompanies,
      visitedCompanies,
      upcomingCompanies,
      cancelledCompanies,
    };
  };

  // Calculate average package
  const getAveragePackage = () => {
    const studentsWithPackage = students.filter(student => student.package && student.package > 0);
    
    if (studentsWithPackage.length === 0) return 0;
    
    const totalPackage = studentsWithPackage.reduce((sum, student) => sum + (student.package || 0), 0);
    return totalPackage / studentsWithPackage.length;
  };

  // Calculate highest package
  const getHighestPackage = () => {
    if (students.length === 0) return 0;
    return students.reduce((max, student) => {
      return Math.max(max, student.package || 0);
    }, 0);
  };

  // Prepare data for company placement chart
  const getCompanyPlacementChartData = () => {
    return companies
      .filter(company => company.studentsPlaced > 0)
      .map(company => ({
        name: company.name,
        value: company.studentsPlaced,
      }));
  };

  // Prepare data for branch-wise placement chart
  const getBranchPlacementChartData = () => {
    const branchStats: Record<string, number> = {};
    
    students.forEach(student => {
      if (student.placementStatus === 'Placed' || student.placementStatus === 'Offer Received') {
        branchStats[student.branch] = (branchStats[student.branch] || 0) + 1;
      }
    });
    
    return Object.entries(branchStats).map(([name, value]) => ({ name, value }));
  };

  // Filter students based on search term and other filters
  const filteredStudents = students.filter(student => {
    // Search term filter
    if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by placement status
    if (filters.placementStatus && student.placementStatus !== filters.placementStatus) {
      return false;
    }
    
    // Filter by degree
    if (filters.degree && student.degree !== filters.degree) {
      return false;
    }
    
    // Filter by branch
    if (filters.branch && student.branch !== filters.branch) {
      return false;
    }
    
    // Filter by graduation year
    if (filters.graduationYear && student.graduationYear !== parseInt(filters.graduationYear)) {
      return false;
    }
    
    // Filter by minimum CGPA
    if (filters.minCGPA && student.cgpa < parseFloat(filters.minCGPA)) {
      return false;
    }
    
    return true;
  });

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => {
    if (searchTerm && !company.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !company.industry.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !company.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Handle adding or updating a student
  const handleSaveStudent = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const rollNumber = (form.elements.namedItem('rollNumber') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const degree = (form.elements.namedItem('degree') as HTMLSelectElement).value;
    const branch = (form.elements.namedItem('branch') as HTMLSelectElement).value;
    const graduationYear = parseInt((form.elements.namedItem('graduationYear') as HTMLInputElement).value);
    const cgpa = parseFloat((form.elements.namedItem('cgpa') as HTMLInputElement).value);
    const placementStatus = (form.elements.namedItem('placementStatus') as HTMLSelectElement).value as Student['placementStatus'];
    const company = (form.elements.namedItem('company') as HTMLInputElement).value;
    const packageValue = (form.elements.namedItem('package') as HTMLInputElement).value;
    const joiningDate = (form.elements.namedItem('joiningDate') as HTMLInputElement).value;
    
    // Get skills from checkboxes
    const selectedSkills: string[] = [];
    skills.forEach(skill => {
      const checkbox = form.elements.namedItem(`skill-${skill}`) as HTMLInputElement;
      if (checkbox?.checked) {
        selectedSkills.push(skill);
      }
    });

    if (selectedStudent) {
      // Update existing student
      const updatedStudent: Student = {
        ...selectedStudent,
        name,
        rollNumber,
        email,
        phone,
        degree,
        branch,
        graduationYear,
        cgpa,
        placementStatus,
        skills: selectedSkills,
      };

      if (placementStatus === 'Placed' || placementStatus === 'Offer Received') {
        updatedStudent.company = company;
        updatedStudent.package = packageValue ? parseInt(packageValue) : undefined;
        updatedStudent.joiningDate = joiningDate || undefined;
      } else {
        // Reset placement-related fields if not placed
        updatedStudent.company = undefined;
        updatedStudent.package = undefined;
        updatedStudent.joiningDate = undefined;
      }

      setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
    } else {
      // Add new student
      const newStudent: Student = {
        id: Date.now().toString(),
        name,
        rollNumber,
        email,
        phone,
        degree,
        branch,
        graduationYear,
        cgpa,
        placementStatus,
        skills: selectedSkills,
        interviews: [],
      };

      if (placementStatus === 'Placed' || placementStatus === 'Offer Received') {
        newStudent.company = company;
        newStudent.package = packageValue ? parseInt(packageValue) : undefined;
        newStudent.joiningDate = joiningDate || undefined;
      }

      setStudents([...students, newStudent]);
    }

    // Reset form and close modal
    form.reset();
    setShowStudentModal(false);
    setSelectedStudent(null);
  };

  // Handle adding or updating a company
  const handleSaveCompany = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const industry = (form.elements.namedItem('industry') as HTMLSelectElement).value;
    const location = (form.elements.namedItem('location') as HTMLInputElement).value;
    
    // Get open positions
    const positions = (form.elements.namedItem('positions') as HTMLTextAreaElement).value;
    const openPositions = positions.split('\n').filter(p => p.trim() !== '');
    
    const visitDate = (form.elements.namedItem('visitDate') as HTMLInputElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as CompanyData['status'];
    const studentsPlaced = parseInt((form.elements.namedItem('studentsPlaced') as HTMLInputElement).value || '0');
    const averagePackage = (form.elements.namedItem('averagePackage') as HTMLInputElement).value;
    const highestPackage = (form.elements.namedItem('highestPackage') as HTMLInputElement).value;
    const contactPerson = (form.elements.namedItem('contactPerson') as HTMLInputElement).value;
    const contactEmail = (form.elements.namedItem('contactEmail') as HTMLInputElement).value;
    const contactPhone = (form.elements.namedItem('contactPhone') as HTMLInputElement).value;

    if (selectedCompany) {
      // Update existing company
      const updatedCompany: CompanyData = {
        ...selectedCompany,
        name,
        industry,
        location,
        openPositions,
        visitDate: visitDate || undefined,
        status,
        studentsPlaced,
        contactPerson: contactPerson || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
      };

      if (status === 'Visited') {
        updatedCompany.averagePackage = averagePackage ? parseInt(averagePackage) : undefined;
        updatedCompany.highestPackage = highestPackage ? parseInt(highestPackage) : undefined;
      } else {
        // Reset package fields if not visited
        updatedCompany.averagePackage = undefined;
        updatedCompany.highestPackage = undefined;
      }

      setCompanies(companies.map(c => c.id === selectedCompany.id ? updatedCompany : c));
    } else {
      // Add new company
      const newCompany: CompanyData = {
        id: Date.now().toString(),
        name,
        industry,
        location,
        openPositions,
        visitDate: visitDate || undefined,
        status,
        studentsPlaced,
        contactPerson: contactPerson || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
      };

      if (status === 'Visited') {
        newCompany.averagePackage = averagePackage ? parseInt(averagePackage) : undefined;
        newCompany.highestPackage = highestPackage ? parseInt(highestPackage) : undefined;
      }

      setCompanies([...companies, newCompany]);
    }

    // Reset form and close modal
    form.reset();
    setShowCompanyModal(false);
    setSelectedCompany(null);
  };

  // Handle adding or updating an interview
  const handleSaveInterview = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
    const companyName = (form.elements.namedItem('companyName') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as Interview['status'];
    const round = (form.elements.namedItem('round') as HTMLInputElement).value;
    const feedback = (form.elements.namedItem('feedback') as HTMLTextAreaElement).value;
    const result = (form.elements.namedItem('result') as HTMLSelectElement).value as Interview['result'];

    // Get the student ID
    const studentId = (form.elements.namedItem('studentId') as HTMLInputElement).value;
    const student = students.find(s => s.id === studentId);

    if (!student) return;

    if (selectedInterview) {
      // Update existing interview
      const updatedInterview: Interview = {
        ...selectedInterview.interview,
        companyName,
        date,
        status,
        round,
        feedback: feedback || undefined,
        result: result || undefined,
      };

      const updatedStudent = {
        ...student,
        interviews: student.interviews.map(i => 
          i.id === selectedInterview.interview.id ? updatedInterview : i
        ),
      };

      setStudents(students.map(s => s.id === studentId ? updatedStudent : s));
    } else {
      // Add new interview
      const newInterview: Interview = {
        id: `${studentId}-${Date.now()}`,
        companyName,
        date,
        status,
        round,
        feedback: feedback || undefined,
        result: result || undefined,
      };

      const updatedStudent = {
        ...student,
        interviews: [...student.interviews, newInterview],
      };

      setStudents(students.map(s => s.id === studentId ? updatedStudent : s));
    }

    // Reset form and close modal
    form.reset();
    setShowInterviewModal(false);
    setSelectedInterview(null);
  };

  // Handle deleting a student
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== id));
    }
  };

  // Handle deleting a company
  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(company => company.id !== id));
    }
  };

  // Handle deleting an interview
  const handleDeleteInterview = (studentId: string, interviewId: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const updatedStudent = {
        ...student,
        interviews: student.interviews.filter(i => i.id !== interviewId),
      };

      setStudents(students.map(s => s.id === studentId ? updatedStudent : s));
    }
  };

  // Generate student data template for download
  const generateStudentTemplate = () => {
    const template = {
      name: 'Student Name',
      rollNumber: 'ROLL001',
      email: 'student@example.com',
      phone: '9876543210',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: 2023,
      cgpa: 8.5,
      placementStatus: 'Not Placed',
      skills: ['JavaScript', 'Python'],
    };

    const blob = new Blob([JSON.stringify([template], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate company data template for download
  const generateCompanyTemplate = () => {
    const template = {
      name: 'Company Name',
      industry: 'IT',
      location: 'City Name',
      openPositions: ['Position 1', 'Position 2'],
      visitDate: '2023-05-15',
      status: 'Upcoming',
      contactPerson: 'Contact Name',
      contactEmail: 'contact@company.com',
      contactPhone: '9876543210',
    };

    const blob = new Blob([JSON.stringify([template], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle importing student data
  const handleImportStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedStudents = JSON.parse(e.target?.result as string) as Student[];
        // Validate each student object has required fields
        const validStudents = importedStudents.filter(student => 
          student.name && student.rollNumber && student.email && 
          student.degree && student.branch && student.graduationYear &&
          student.cgpa !== undefined && student.placementStatus
        );

        // Add ids if not present and ensure interviews array
        const processedStudents = validStudents.map(student => ({
          ...student,
          id: student.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
          interviews: student.interviews || [],
        }));

        setStudents([...students, ...processedStudents]);
        alert(`Imported ${processedStudents.length} students successfully.`);
      } catch (error) {
        alert('Error importing students. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
  };

  // Handle importing company data
  const handleImportCompanies = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCompanies = JSON.parse(e.target?.result as string) as CompanyData[];
        // Validate each company object has required fields
        const validCompanies = importedCompanies.filter(company => 
          company.name && company.industry && company.location && 
          company.openPositions && company.status !== undefined
        );

        // Add ids if not present
        const processedCompanies = validCompanies.map(company => ({
          ...company,
          id: company.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
          studentsPlaced: company.studentsPlaced || 0,
        }));

        setCompanies([...companies, ...processedCompanies]);
        alert(`Imported ${processedCompanies.length} companies successfully.`);
      } catch (error) {
        alert('Error importing companies. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
  };

  // Close modals when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStudentModal(false);
        setShowCompanyModal(false);
        setShowInterviewModal(false);
        setSelectedStudent(null);
        setSelectedCompany(null);
        setSelectedInterview(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Render method
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow theme-transition">
        <div className="container-fluid py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Tracker</h1>
          
          <div className="flex items-center space-x-4">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb">
                {darkMode ? (
                  <Sun className="h-3 w-3 text-yellow-400" />
                ) : (
                  <Moon className="h-3 w-3 text-gray-700" />
                )}
              </span>
            </button>
            
            <nav className="flex space-x-2">
              <button 
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`btn ${activeTab === 'students' ? 'btn-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
              <button 
                className={`btn ${activeTab === 'companies' ? 'btn-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setActiveTab('companies')}
              >
                Companies
              </button>
              <button 
                className={`btn ${activeTab === 'interviews' ? 'btn-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setActiveTab('interviews')}
              >
                Interviews
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Placement Stats */}
              <div className="stat-card">
                <div className="stat-title">Placement Rate</div>
                <div className="stat-value">{getPlacementStats().placementPercentage.toFixed(1)}%</div>
                <div className="stat-desc">
                  {getPlacementStats().placedStudents + getPlacementStats().offeredStudents} / {getPlacementStats().totalStudents} students
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Average Package</div>
                <div className="stat-value">₹{(getAveragePackage() / 100000).toFixed(1)}L</div>
                <div className="stat-desc">For placed students</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Highest Package</div>
                <div className="stat-value">₹{(getHighestPackage() / 100000).toFixed(1)}L</div>
                <div className="stat-desc">Top offer this year</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Visiting Companies</div>
                <div className="stat-value">{getCompanyStats().totalCompanies}</div>
                <div className="stat-desc">
                  {getCompanyStats().visitedCompanies} visited, {getCompanyStats().upcomingCompanies} upcoming
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placement Status Chart */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Branch-wise Placements</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBranchPlacementChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Placed Students" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Company Placement Chart */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Company-wise Placements</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCompanyPlacementChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCompanyPlacementChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Student Status Summary */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Student Placement Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="font-medium text-green-800 dark:text-green-200">Placed</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{getPlacementStats().placedStudents}</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="font-medium text-blue-800 dark:text-blue-200">Offer Received</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{getPlacementStats().offeredStudents}</div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Interview Scheduled</div>
                  <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{getPlacementStats().interviewScheduledStudents}</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <div className="font-medium text-red-800 dark:text-red-200">Not Placed</div>
                  <div className="text-2xl font-bold text-red-900 dark:text-red-100">{getPlacementStats().notPlacedStudents}</div>
                </div>
              </div>
            </div>

            {/* Upcoming Visits */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Upcoming Company Visits</h3>
              {companies.filter(c => c.status === 'Upcoming').length > 0 ? (
                <div className="space-y-4">
                  {companies
                    .filter(c => c.status === 'Upcoming')
                    .sort((a, b) => {
                      const dateA = a.visitDate ? new Date(a.visitDate).getTime() : 0;
                      const dateB = b.visitDate ? new Date(b.visitDate).getTime() : 0;
                      return dateA - dateB;
                    })
                    .map(company => (
                      <div key={company.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{company.name}</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {company.visitDate ? new Date(company.visitDate).toLocaleDateString() : 'Date not set'} | {company.location}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Positions: {company.openPositions.join(', ')}
                          </p>
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowCompanyModal(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No upcoming company visits scheduled.</p>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-bold">Students</h2>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => {
                    setSelectedStudent(null);
                    setShowStudentModal(true);
                  }}
                >
                  <Plus size={16} />
                  Add Student
                </button>
                
                <div className="relative">
                  <button 
                    className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    onClick={() => generateStudentTemplate()}
                  >
                    <Download size={16} />
                    Template
                  </button>
                </div>
                
                <div className="relative">
                  <button 
                    className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    onClick={() => document.getElementById('importStudents')?.click()}
                  >
                    <Upload size={16} />
                    Import
                  </button>
                  <input 
                    type="file" 
                    id="importStudents" 
                    className="hidden" 
                    accept=".json"
                    onChange={handleImportStudents}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button 
                className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filters
                {showFilters ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="form-label">Placement Status</label>
                    <select 
                      className="input"
                      value={filters.placementStatus}
                      onChange={(e) => setFilters({...filters, placementStatus: e.target.value})}
                    >
                      <option value="">All</option>
                      <option value="Placed">Placed</option>
                      <option value="Not Placed">Not Placed</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offer Received">Offer Received</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Degree</label>
                    <select 
                      className="input"
                      value={filters.degree}
                      onChange={(e) => setFilters({...filters, degree: e.target.value})}
                    >
                      <option value="">All</option>
                      {degrees.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Branch</label>
                    <select 
                      className="input"
                      value={filters.branch}
                      onChange={(e) => setFilters({...filters, branch: e.target.value})}
                    >
                      <option value="">All</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Graduation Year</label>
                    <select 
                      className="input"
                      value={filters.graduationYear}
                      onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
                    >
                      <option value="">All</option>
                      {[...new Set(students.map(s => s.graduationYear))].sort().map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Minimum CGPA</label>
                    <input 
                      type="number" 
                      className="input"
                      min="0"
                      max="10"
                      step="0.1"
                      value={filters.minCGPA}
                      onChange={(e) => setFilters({...filters, minCGPA: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button 
                    className="btn bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => setFilters({
                      placementStatus: '',
                      degree: '',
                      branch: '',
                      graduationYear: '',
                      minCGPA: '',
                    })}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Students Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Roll Number</th>
                    <th className="table-header">Degree & Branch</th>
                    <th className="table-header">CGPA</th>
                    <th className="table-header">Year</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Company & Package</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <User size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                              <div className="text-gray-500 dark:text-gray-400 text-sm">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">{student.rollNumber}</td>
                        <td className="table-cell">
                          <div>{student.degree}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm">{student.branch}</div>
                        </td>
                        <td className="table-cell">{student.cgpa}</td>
                        <td className="table-cell">{student.graduationYear}</td>
                        <td className="table-cell">
                          <span className={
                            `badge ${
                              student.placementStatus === 'Placed' ? 'badge-success' : 
                              student.placementStatus === 'Not Placed' ? 'badge-error' : 
                              student.placementStatus === 'Interview Scheduled' ? 'badge-warning' : 
                              'badge-info'
                            }`
                          }>
                            {student.placementStatus}
                          </span>
                        </td>
                        <td className="table-cell">
                          {(student.placementStatus === 'Placed' || student.placementStatus === 'Offer Received') && student.company ? (
                            <div>
                              <div>{student.company}</div>
                              {student.package && (
                                <div className="text-gray-500 dark:text-gray-400 text-sm">
                                  ₹{(student.package / 100000).toFixed(1)}L
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                              aria-label={`Edit ${student.name}`}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteStudent(student.id)}
                              aria-label={`Delete ${student.name}`}
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedInterview(null);
                                setShowInterviewModal(true);
                              }}
                              aria-label={`Add interview for ${student.name}`}
                            >
                              <Briefcase size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-bold">Companies</h2>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => {
                    setSelectedCompany(null);
                    setShowCompanyModal(true);
                  }}
                >
                  <Plus size={16} />
                  Add Company
                </button>
                
                <div className="relative">
                  <button 
                    className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    onClick={() => generateCompanyTemplate()}
                  >
                    <Download size={16} />
                    Template
                  </button>
                </div>
                
                <div className="relative">
                  <button 
                    className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    onClick={() => document.getElementById('importCompanies')?.click()}
                  >
                    <Upload size={16} />
                    Import
                  </button>
                  <input 
                    type="file" 
                    id="importCompanies" 
                    className="hidden" 
                    accept=".json"
                    onChange={handleImportCompanies}
                  />
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map(company => (
                  <div key={company.id} className="card">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium">{company.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowCompanyModal(true);
                          }}
                          aria-label={`Edit ${company.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteCompany(company.id)}
                          aria-label={`Delete ${company.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Building size={16} className="mr-1" />
                      {company.industry} | {company.location}
                    </div>
                    
                    <div className="mt-2">
                      <span className={
                        `badge ${
                          company.status === 'Visited' ? 'badge-success' : 
                          company.status === 'Upcoming' ? 'badge-info' : 
                          'badge-error'
                        }`
                      }>
                        {company.status}
                      </span>
                    </div>
                    
                    {company.visitDate && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Visit Date: {new Date(company.visitDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-sm">Open Positions:</h4>
                      <ul className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {company.openPositions.map((position, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span> {position}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {company.status === 'Visited' && (
                      <div className="mt-3">
                        <h4 className="font-medium text-sm">Placement Results:</h4>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Placed</div>
                            <div className="font-bold">{company.studentsPlaced}</div>
                          </div>
                          {company.averagePackage && (
                            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Avg CTC</div>
                              <div className="font-bold">₹{(company.averagePackage / 100000).toFixed(1)}L</div>
                            </div>
                          )}
                          {company.highestPackage && (
                            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              <div className="text-xs text-gray-500 dark:text-gray-400">High CTC</div>
                              <div className="font-bold">₹{(company.highestPackage / 100000).toFixed(1)}L</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {company.contactPerson && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        <div>Contact: {company.contactPerson}</div>
                        {company.contactEmail && <div>{company.contactEmail}</div>}
                        {company.contactPhone && <div>{company.contactPhone}</div>}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No companies found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Upcoming Interviews</h2>
            
            {/* Upcoming Interviews */}
            <div className="card">
              {students.some(student => 
                student.interviews.some(interview => interview.status === 'Scheduled')
              ) ? (
                <div className="space-y-4">
                  {students
                    .filter(student => 
                      student.interviews.some(interview => interview.status === 'Scheduled')
                    )
                    .map(student => (
                      <div key={student.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <h3 className="font-medium">{student.name} ({student.rollNumber})</h3>
                        
                        <div className="mt-2 space-y-2">
                          {student.interviews
                            .filter(interview => interview.status === 'Scheduled')
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map(interview => (
                              <div 
                                key={interview.id} 
                                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                              >
                                <div>
                                  <div className="font-medium">{interview.companyName}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {new Date(interview.date).toLocaleDateString()} | {interview.round}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    className="btn btn-sm bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setSelectedInterview({interview, studentId: student.id});
                                      setShowInterviewModal(true);
                                    }}
                                  >
                                    Update
                                  </button>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No upcoming interviews scheduled.</p>
              )}
            </div>
            
            <h2 className="text-xl font-bold mt-6">All Interview Records</h2>
            
            {/* Interview History */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Company</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Round</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Result</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {students.some(student => student.interviews.length > 0) ? (
                    students
                      .filter(student => student.interviews.length > 0)
                      .flatMap(student => 
                        student.interviews.map(interview => (
                          <tr key={interview.id}>
                            <td className="table-cell">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-gray-500 dark:text-gray-400 text-sm">{student.rollNumber}</div>
                            </td>
                            <td className="table-cell">{interview.companyName}</td>
                            <td className="table-cell">{new Date(interview.date).toLocaleDateString()}</td>
                            <td className="table-cell">{interview.round}</td>
                            <td className="table-cell">
                              <span className={
                                `badge ${
                                  interview.status === 'Completed' ? 'badge-success' : 
                                  interview.status === 'Scheduled' ? 'badge-info' : 
                                  'badge-error'
                                }`
                              }>
                                {interview.status}
                              </span>
                            </td>
                            <td className="table-cell">
                              {interview.result ? (
                                <span className={
                                  `badge ${
                                    interview.result === 'Selected' ? 'badge-success' : 
                                    interview.result === 'Rejected' ? 'badge-error' : 
                                    interview.result === 'On Hold' ? 'badge-warning' : 
                                    'badge-info'
                                  }`
                                }>
                                  {interview.result}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </td>
                            <td className="table-cell">
                              <div className="flex space-x-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setSelectedInterview({interview, studentId: student.id});
                                    setShowInterviewModal(true);
                                  }}
                                  aria-label={`Edit interview`}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteInterview(student.id, interview.id)}
                                  aria-label={`Delete interview`}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                  ) : (
                    <tr>
                      <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                        No interview records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Student Modal */}
      {showStudentModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
        >
          <div 
            className="modal-content max-w-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="student-modal-title">
                {selectedStudent ? 'Edit Student' : 'Add Student'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                onClick={() => {
                  setShowStudentModal(false);
                  setSelectedStudent(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    className="input" 
                    defaultValue={selectedStudent?.name || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="rollNumber">Roll Number</label>
                  <input 
                    type="text" 
                    id="rollNumber"
                    name="rollNumber"
                    className="input" 
                    defaultValue={selectedStudent?.rollNumber || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    className="input" 
                    defaultValue={selectedStudent?.email || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    className="input" 
                    defaultValue={selectedStudent?.phone || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="degree">Degree</label>
                  <select 
                    id="degree"
                    name="degree"
                    className="input" 
                    defaultValue={selectedStudent?.degree || degrees[0]}
                    required
                  >
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="branch">Branch</label>
                  <select 
                    id="branch"
                    name="branch"
                    className="input" 
                    defaultValue={selectedStudent?.branch || branches[0]}
                    required
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="graduationYear">Graduation Year</label>
                  <input 
                    type="number" 
                    id="graduationYear"
                    name="graduationYear"
                    min="2020"
                    max="2030"
                    className="input" 
                    defaultValue={selectedStudent?.graduationYear || new Date().getFullYear()}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="cgpa">CGPA</label>
                  <input 
                    type="number" 
                    id="cgpa"
                    name="cgpa"
                    min="0"
                    max="10"
                    step="0.1"
                    className="input" 
                    defaultValue={selectedStudent?.cgpa || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="placementStatus">Placement Status</label>
                  <select 
                    id="placementStatus"
                    name="placementStatus"
                    className="input" 
                    defaultValue={selectedStudent?.placementStatus || 'Not Placed'}
                    required
                  >
                    <option value="Not Placed">Not Placed</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer Received">Offer Received</option>
                    <option value="Placed">Placed</option>
                  </select>
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Skills</label>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {skills.map(skill => (
                      <div key={skill} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`skill-${skill}`}
                          name={`skill-${skill}`}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                          defaultChecked={selectedStudent?.skills.includes(skill)}
                        />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300" htmlFor={`skill-${skill}`}>
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Company details for placed students */}
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="company">Company (if placed)</label>
                  <input 
                    type="text" 
                    id="company"
                    name="company"
                    className="input" 
                    defaultValue={selectedStudent?.company || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="package">Package (₹)</label>
                  <input 
                    type="number" 
                    id="package"
                    name="package"
                    className="input" 
                    defaultValue={selectedStudent?.package || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="joiningDate">Joining Date</label>
                  <input 
                    type="date" 
                    id="joiningDate"
                    name="joiningDate"
                    className="input" 
                    defaultValue={selectedStudent?.joiningDate || ''}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                  onClick={() => {
                    setShowStudentModal(false);
                    setSelectedStudent(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Check size={16} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => {
            setShowCompanyModal(false);
            setSelectedCompany(null);
          }}
        >
          <div 
            className="modal-content max-w-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="company-modal-title">
                {selectedCompany ? 'Edit Company' : 'Add Company'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                onClick={() => {
                  setShowCompanyModal(false);
                  setSelectedCompany(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSaveCompany}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Company Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    className="input" 
                    defaultValue={selectedCompany?.name || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="industry">Industry</label>
                  <select 
                    id="industry"
                    name="industry"
                    className="input" 
                    defaultValue={selectedCompany?.industry || industries[0]}
                    required
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input 
                    type="text" 
                    id="location"
                    name="location"
                    className="input" 
                    defaultValue={selectedCompany?.location || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="visitDate">Visit Date</label>
                  <input 
                    type="date" 
                    id="visitDate"
                    name="visitDate"
                    className="input" 
                    defaultValue={selectedCompany?.visitDate || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select 
                    id="status"
                    name="status"
                    className="input" 
                    defaultValue={selectedCompany?.status || 'Upcoming'}
                    required
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Visited">Visited</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="studentsPlaced">Students Placed</label>
                  <input 
                    type="number" 
                    id="studentsPlaced"
                    name="studentsPlaced"
                    min="0"
                    className="input" 
                    defaultValue={selectedCompany?.studentsPlaced || 0}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="averagePackage">Average Package (₹)</label>
                  <input 
                    type="number" 
                    id="averagePackage"
                    name="averagePackage"
                    className="input" 
                    defaultValue={selectedCompany?.averagePackage || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="highestPackage">Highest Package (₹)</label>
                  <input 
                    type="number" 
                    id="highestPackage"
                    name="highestPackage"
                    className="input" 
                    defaultValue={selectedCompany?.highestPackage || ''}
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="positions">Open Positions (one per line)</label>
                  <textarea 
                    id="positions"
                    name="positions"
                    rows={3}
                    className="input" 
                    defaultValue={selectedCompany?.openPositions.join('\n') || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="contactPerson">Contact Person</label>
                  <input 
                    type="text" 
                    id="contactPerson"
                    name="contactPerson"
                    className="input" 
                    defaultValue={selectedCompany?.contactPerson || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">Contact Email</label>
                  <input 
                    type="email" 
                    id="contactEmail"
                    name="contactEmail"
                    className="input" 
                    defaultValue={selectedCompany?.contactEmail || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="contactPhone">Contact Phone</label>
                  <input 
                    type="tel" 
                    id="contactPhone"
                    name="contactPhone"
                    className="input" 
                    defaultValue={selectedCompany?.contactPhone || ''}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                  onClick={() => {
                    setShowCompanyModal(false);
                    setSelectedCompany(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Check size={16} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {showInterviewModal && selectedStudent && (
        <div 
          className="modal-backdrop" 
          onClick={() => {
            setShowInterviewModal(false);
            setSelectedInterview(null);
          }}
        >
          <div 
            className="modal-content max-w-lg" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="interview-modal-title">
                {selectedInterview ? 'Update Interview' : 'Add Interview'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                onClick={() => {
                  setShowInterviewModal(false);
                  setSelectedInterview(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSaveInterview}>
              <input type="hidden" name="studentId" value={selectedStudent.id} />
              
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="student">Student</label>
                  <input 
                    type="text" 
                    id="student"
                    className="input" 
                    value={`${selectedStudent.name} (${selectedStudent.rollNumber})`}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">Company</label>
                  <input 
                    type="text" 
                    id="companyName"
                    name="companyName"
                    className="input" 
                    defaultValue={selectedInterview?.interview.companyName || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Interview Date</label>
                  <input 
                    type="date" 
                    id="date"
                    name="date"
                    className="input" 
                    defaultValue={selectedInterview?.interview.date || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select 
                    id="status"
                    name="status"
                    className="input" 
                    defaultValue={selectedInterview?.interview.status || 'Scheduled'}
                    required
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="round">Round</label>
                  <input 
                    type="text" 
                    id="round"
                    name="round"
                    className="input" 
                    placeholder="e.g. Technical, HR, Coding Test"
                    defaultValue={selectedInterview?.interview.round || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="feedback">Feedback</label>
                  <textarea 
                    id="feedback"
                    name="feedback"
                    rows={3}
                    className="input" 
                    defaultValue={selectedInterview?.interview.feedback || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="result">Result</label>
                  <select 
                    id="result"
                    name="result"
                    className="input" 
                    defaultValue={selectedInterview?.interview.result || 'Pending'}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                  onClick={() => {
                    setShowInterviewModal(false);
                    setSelectedInterview(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Check size={16} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;