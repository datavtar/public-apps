import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ChevronDown,
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Star,
  Filter,
  Calendar,
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  ChartBar,
  Moon,
  Sun,
  Menu,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  company: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
}

interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  skills: {
    technical: number;
    communication: number;
    teamwork: number;
    problemSolving: number;
    attitude: number;
  };
  feedback: string;
  overallRating: number;
}

interface TemplateForm {
  id: string;
  name: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea';
    options?: string[];
  }>;
}

// Custom Types
type Tab = 'students' | 'evaluations' | 'templates' | 'reports';
type StudentFormMode = 'add' | 'edit' | null;
type EvaluationFormMode = 'add' | 'edit' | null;
type TemplateFormMode = 'add' | 'edit' | null;

const App: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [templates, setTemplates] = useState<TemplateForm[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentFormMode, setStudentFormMode] = useState<StudentFormMode>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [evaluationFormMode, setEvaluationFormMode] = useState<EvaluationFormMode>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [templateFormMode, setTemplateFormMode] = useState<TemplateFormMode>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateForm | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Sample data for new application
  const sampleStudents: Student[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@university.edu',
      course: 'Computer Science',
      company: 'Tech Solutions Inc.',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Emily Johnson',
      email: 'emily.j@university.edu',
      course: 'Information Systems',
      company: 'DataViz Analytics',
      startDate: '2023-07-15',
      endDate: '2023-10-15',
      status: 'active'
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'mchen@university.edu',
      course: 'Data Science',
      company: 'AI Research Lab',
      startDate: '2023-05-01',
      endDate: '2023-11-01',
      status: 'active'
    },
    {
      id: '4',
      name: 'Sophia Rodriguez',
      email: 'srodriguez@university.edu',
      course: 'Marketing',
      company: 'Global Marketing Group',
      startDate: '2023-09-01',
      endDate: '2024-03-01',
      status: 'pending'
    }
  ];

  const sampleEvaluations: Evaluation[] = [
    {
      id: '1',
      studentId: '1',
      date: '2023-07-15',
      skills: {
        technical: 4,
        communication: 3,
        teamwork: 5,
        problemSolving: 4,
        attitude: 5
      },
      feedback: 'John demonstrates excellent technical skills and is a great team player. Could improve on communication skills slightly.',
      overallRating: 4
    },
    {
      id: '2',
      studentId: '1',
      date: '2023-08-20',
      skills: {
        technical: 5,
        communication: 4,
        teamwork: 5,
        problemSolving: 4,
        attitude: 5
      },
      feedback: 'John has shown significant improvement in all areas, particularly in communication. Consistently delivers high quality work.',
      overallRating: 5
    },
    {
      id: '3',
      studentId: '2',
      date: '2023-08-30',
      skills: {
        technical: 3,
        communication: 5,
        teamwork: 4,
        problemSolving: 3,
        attitude: 5
      },
      feedback: 'Emily is an excellent communicator and team player. Technical skills are developing well, and she shows great enthusiasm to learn.',
      overallRating: 4
    }
  ];

  const sampleTemplates: TemplateForm[] = [
    {
      id: '1',
      name: 'Standard Evaluation',
      fields: [
        { name: 'technical', label: 'Technical Skills', type: 'number' },
        { name: 'communication', label: 'Communication', type: 'number' },
        { name: 'teamwork', label: 'Teamwork', type: 'number' },
        { name: 'problemSolving', label: 'Problem Solving', type: 'number' },
        { name: 'attitude', label: 'Attitude', type: 'number' },
        { name: 'feedback', label: 'Written Feedback', type: 'textarea' },
        { name: 'overallRating', label: 'Overall Rating', type: 'number' }
      ]
    },
    {
      id: '2',
      name: 'Project Completion',
      fields: [
        { name: 'projectName', label: 'Project Name', type: 'text' },
        { name: 'completionDate', label: 'Completion Date', type: 'date' },
        { name: 'quality', label: 'Quality of Work', type: 'number' },
        { name: 'timeliness', label: 'Timeliness', type: 'number' },
        { name: 'innovation', label: 'Innovation', type: 'number' },
        { name: 'comments', label: 'Comments', type: 'textarea' }
      ]
    }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load theme preference
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        }
        
        // Load data
        const savedStudents = localStorage.getItem('students');
        const savedEvaluations = localStorage.getItem('evaluations');
        const savedTemplates = localStorage.getItem('templates');

        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
        } else {
          // Use sample data if nothing is saved
          setStudents(sampleStudents);
          localStorage.setItem('students', JSON.stringify(sampleStudents));
        }

        if (savedEvaluations) {
          setEvaluations(JSON.parse(savedEvaluations));
        } else {
          // Use sample data if nothing is saved
          setEvaluations(sampleEvaluations);
          localStorage.setItem('evaluations', JSON.stringify(sampleEvaluations));
        }

        if (savedTemplates) {
          setTemplates(JSON.parse(savedTemplates));
        } else {
          // Use sample data if nothing is saved
          setTemplates(sampleTemplates);
          localStorage.setItem('templates', JSON.stringify(sampleTemplates));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Event Handlers for Students
  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const course = (form.elements.namedItem('course') as HTMLInputElement).value;
    const company = (form.elements.namedItem('company') as HTMLInputElement).value;
    const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
    const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as 'active' | 'completed' | 'pending';

    const newStudent: Student = {
      id: studentFormMode === 'edit' && selectedStudent ? selectedStudent.id : Date.now().toString(),
      name,
      email,
      course,
      company,
      startDate,
      endDate,
      status
    };

    if (studentFormMode === 'add') {
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
    } else if (studentFormMode === 'edit' && selectedStudent) {
      const updatedStudents = students.map(student => 
        student.id === selectedStudent.id ? newStudent : student
      );
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
    }

    setStudentFormMode(null);
    setSelectedStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentFormMode('edit');
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all associated evaluations.')) {
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));

      // Also delete associated evaluations
      const updatedEvaluations = evaluations.filter(evaluation => evaluation.studentId !== id);
      setEvaluations(updatedEvaluations);
      localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    }
  };

  // Event Handlers for Evaluations
  const handleAddEvaluation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const studentId = (form.elements.namedItem('studentId') as HTMLSelectElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const technical = parseInt((form.elements.namedItem('technical') as HTMLInputElement).value, 10);
    const communication = parseInt((form.elements.namedItem('communication') as HTMLInputElement).value, 10);
    const teamwork = parseInt((form.elements.namedItem('teamwork') as HTMLInputElement).value, 10);
    const problemSolving = parseInt((form.elements.namedItem('problemSolving') as HTMLInputElement).value, 10);
    const attitude = parseInt((form.elements.namedItem('attitude') as HTMLInputElement).value, 10);
    const feedback = (form.elements.namedItem('feedback') as HTMLTextAreaElement).value;
    const overallRating = parseInt((form.elements.namedItem('overallRating') as HTMLInputElement).value, 10);

    const newEvaluation: Evaluation = {
      id: evaluationFormMode === 'edit' && selectedEvaluation ? selectedEvaluation.id : Date.now().toString(),
      studentId,
      date,
      skills: {
        technical,
        communication,
        teamwork,
        problemSolving,
        attitude
      },
      feedback,
      overallRating
    };

    if (evaluationFormMode === 'add') {
      const updatedEvaluations = [...evaluations, newEvaluation];
      setEvaluations(updatedEvaluations);
      localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    } else if (evaluationFormMode === 'edit' && selectedEvaluation) {
      const updatedEvaluations = evaluations.map(evaluation => 
        evaluation.id === selectedEvaluation.id ? newEvaluation : evaluation
      );
      setEvaluations(updatedEvaluations);
      localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    }

    setEvaluationFormMode(null);
    setSelectedEvaluation(null);
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setEvaluationFormMode('edit');
  };

  const handleDeleteEvaluation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      const updatedEvaluations = evaluations.filter(evaluation => evaluation.id !== id);
      setEvaluations(updatedEvaluations);
      localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    }
  };

  // Event Handlers for Templates
  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;

    const fieldsContainer = form.querySelector('#template-fields');
    const fieldElements = fieldsContainer?.querySelectorAll('.template-field');
    
    const fields = Array.from(fieldElements || []).map(fieldElement => {
      const fieldName = (fieldElement.querySelector('[name="fieldName"]') as HTMLInputElement)?.value;
      const fieldLabel = (fieldElement.querySelector('[name="fieldLabel"]') as HTMLInputElement)?.value;
      const fieldType = (fieldElement.querySelector('[name="fieldType"]') as HTMLSelectElement)?.value as 'text' | 'number' | 'date' | 'select' | 'textarea';
      
      return {
        name: fieldName,
        label: fieldLabel,
        type: fieldType
      };
    });

    const newTemplate: TemplateForm = {
      id: templateFormMode === 'edit' && selectedTemplate ? selectedTemplate.id : Date.now().toString(),
      name,
      fields
    };

    if (templateFormMode === 'add') {
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    } else if (templateFormMode === 'edit' && selectedTemplate) {
      const updatedTemplates = templates.map(template => 
        template.id === selectedTemplate.id ? newTemplate : template
      );
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    }

    setTemplateFormMode(null);
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (template: TemplateForm) => {
    setSelectedTemplate(template);
    setTemplateFormMode('edit');
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(template => template.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    }
  };

  // Generate and download evaluation template in CSV format
  const downloadTemplate = () => {
    if (!templates.length) return;

    const template = templates[0]; // Use the first template as a default
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = ['Student Name', 'Student Email', 'Date', ...template.fields.map(field => field.label)];
    csvContent += headers.join(',') + '\n';
    
    // Add a sample row
    const sampleRow = ['Student Name', 'student@example.com', new Date().toISOString().split('T')[0]];
    template.fields.forEach(field => {
      switch(field.type) {
        case 'number':
          sampleRow.push('0'); // Default numerical value
          break;
        case 'date':
          sampleRow.push(new Date().toISOString().split('T')[0]); // Today's date
          break;
        default:
          sampleRow.push('Sample ' + field.label); // Text sample
      }
    });
    
    csvContent += sampleRow.join(',');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'evaluation_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students by status and search term
  const filteredStudents = students.filter(student => {
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        student.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        student.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter evaluations by student if one is selected
  const filteredEvaluations = selectedStudentId
    ? evaluations.filter(evaluation => evaluation.studentId === selectedStudentId)
    : evaluations.filter(evaluation => 
        evaluation.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
        students.find(s => s.id === evaluation.studentId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Prepare data for charts
  const prepareRatingData = () => {
    if (!evaluations.length) return [];
    
    const skillLabels = ['Technical', 'Communication', 'Teamwork', 'Problem Solving', 'Attitude'];
    const avgSkills = evaluations.reduce((acc, evaluation) => {
      acc.technical += evaluation.skills.technical;
      acc.communication += evaluation.skills.communication;
      acc.teamwork += evaluation.skills.teamwork;
      acc.problemSolving += evaluation.skills.problemSolving;
      acc.attitude += evaluation.skills.attitude;
      return acc;
    }, {
      technical: 0,
      communication: 0,
      teamwork: 0,
      problemSolving: 0,
      attitude: 0
    });
    
    const count = evaluations.length;
    return [
      { name: 'Technical', value: avgSkills.technical / count },
      { name: 'Communication', value: avgSkills.communication / count },
      { name: 'Teamwork', value: avgSkills.teamwork / count },
      { name: 'Problem Solving', value: avgSkills.problemSolving / count },
      { name: 'Attitude', value: avgSkills.attitude / count }
    ];
  };

  const prepareStatusData = () => {
    const statusCounts = students.reduce((acc: Record<string, number>, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Active', value: statusCounts.active || 0 },
      { name: 'Completed', value: statusCounts.completed || 0 },
      { name: 'Pending', value: statusCounts.pending || 0 }
    ];
  };

  const getStudentName = (id: string): string => {
    const student = students.find(s => s.id === id);
    return student ? student.name : 'Unknown Student';
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Key press handler for ESC key to close forms
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStudentFormMode(null);
        setSelectedStudent(null);
        setEvaluationFormMode(null);
        setSelectedEvaluation(null);
        setTemplateFormMode(null);
        setSelectedTemplate(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-fluid py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <GraduationCap size={32} className="text-primary-600" />
                <h1 className="text-xl md:text-2xl font-bold">Internship Evaluation System</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="theme-toggle"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                {isDarkMode ? (
                  <Sun size={18} className="ml-6 text-yellow-500" />
                ) : (
                  <Moon size={18} className="ml-1 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${isMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <nav className="p-4 space-y-2">
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md ${activeTab === 'students' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => {
                setActiveTab('students');
                setIsMenuOpen(false);
              }}
            >
              <Users size={20} />
              <span>Students</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md ${activeTab === 'evaluations' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => {
                setActiveTab('evaluations');
                setIsMenuOpen(false);
              }}
            >
              <FileText size={20} />
              <span>Evaluations</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md ${activeTab === 'templates' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => {
                setActiveTab('templates');
                setIsMenuOpen(false);
              }}
            >
              <Calendar size={20} />
              <span>Templates</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md ${activeTab === 'reports' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => {
                setActiveTab('reports');
                setIsMenuOpen(false);
              }}
            >
              <ChartBar size={20} />
              <span>Reports</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold">Students</h2>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter size={18} className="text-gray-400" />
                      </div>
                      <select 
                        className="input pl-10"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <button 
                      className="btn btn-primary ml-3 flex items-center gap-2"
                      onClick={() => setStudentFormMode('add')}
                    >
                      <UserPlus size={18} />
                      <span>Add Student</span>
                    </button>
                  </div>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-lg text-gray-500 dark:text-gray-400">No students found matching your criteria.</p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => setStudentFormMode('add')}
                  >
                    Add Your First Student
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header px-4 py-3">Name</th>
                        <th className="table-header px-4 py-3">Email</th>
                        <th className="table-header px-4 py-3 hidden md:table-cell">Course</th>
                        <th className="table-header px-4 py-3 hidden lg:table-cell">Company</th>
                        <th className="table-header px-4 py-3 hidden md:table-cell">Duration</th>
                        <th className="table-header px-4 py-3">Status</th>
                        <th className="table-header px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="table-cell px-4 py-3">{student.name}</td>
                          <td className="table-cell px-4 py-3">{student.email}</td>
                          <td className="table-cell px-4 py-3 hidden md:table-cell">{student.course}</td>
                          <td className="table-cell px-4 py-3 hidden lg:table-cell">{student.company}</td>
                          <td className="table-cell px-4 py-3 hidden md:table-cell">
                            {new Date(student.startDate).toLocaleDateString()} - {new Date(student.endDate).toLocaleDateString()}
                          </td>
                          <td className="table-cell px-4 py-3">
                            <span className={`badge ${getStatusColor(student.status)}`}>
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => handleEditStudent(student)}
                                aria-label="Edit student"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleDeleteStudent(student.id)}
                                aria-label="Delete student"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button 
                                className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                onClick={() => {
                                  setActiveTab('evaluations');
                                  setSelectedStudentId(student.id);
                                }}
                                aria-label="View evaluations"
                              >
                                <FileText size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Student Form Modal */}
              {studentFormMode && (
                <div className="modal-backdrop" onClick={() => { setStudentFormMode(null); setSelectedStudent(null); }}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {studentFormMode === 'add' ? 'Add Student' : 'Edit Student'}
                      </h3>
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => { setStudentFormMode(null); setSelectedStudent(null); }}
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleAddStudent}>
                      <div className="space-y-4 mt-4">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">Name</label>
                          <input 
                            id="name" 
                            name="name" 
                            type="text" 
                            className="input" 
                            defaultValue={selectedStudent?.name || ''}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            className="input" 
                            defaultValue={selectedStudent?.email || ''}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="course" className="form-label">Course</label>
                          <input 
                            id="course" 
                            name="course" 
                            type="text" 
                            className="input" 
                            defaultValue={selectedStudent?.course || ''}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="company" className="form-label">Company</label>
                          <input 
                            id="company" 
                            name="company" 
                            type="text" 
                            className="input" 
                            defaultValue={selectedStudent?.company || ''}
                            required 
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-group">
                            <label htmlFor="startDate" className="form-label">Start Date</label>
                            <input 
                              id="startDate" 
                              name="startDate" 
                              type="date" 
                              className="input" 
                              defaultValue={selectedStudent?.startDate || ''}
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="endDate" className="form-label">End Date</label>
                            <input 
                              id="endDate" 
                              name="endDate" 
                              type="date" 
                              className="input" 
                              defaultValue={selectedStudent?.endDate || ''}
                              required 
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="status" className="form-label">Status</label>
                          <select 
                            id="status" 
                            name="status" 
                            className="input" 
                            defaultValue={selectedStudent?.status || 'pending'}
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          onClick={() => { setStudentFormMode(null); setSelectedStudent(null); }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {studentFormMode === 'add' ? 'Add Student' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedStudentId ? `Evaluations for ${getStudentName(selectedStudentId)}` : 'All Evaluations'}
                  </h2>
                  {selectedStudentId && (
                    <button 
                      className="ml-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center"
                      onClick={() => setSelectedStudentId(null)}
                    >
                      <ArrowLeft size={14} className="mr-1" /> Back to all
                    </button>
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search evaluations..."
                      className="input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      className="btn btn-primary flex items-center gap-2"
                      onClick={() => setEvaluationFormMode('add')}
                    >
                      <Plus size={18} />
                      <span>Add Evaluation</span>
                    </button>
                    <button 
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                      onClick={downloadTemplate}
                    >
                      <Download size={18} />
                      <span>Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {filteredEvaluations.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    {selectedStudentId 
                      ? `No evaluations found for ${getStudentName(selectedStudentId)}.` 
                      : 'No evaluations found matching your criteria.'}
                  </p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => setEvaluationFormMode('add')}
                  >
                    Add Your First Evaluation
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        {!selectedStudentId && (
                          <th className="table-header px-4 py-3">Student</th>
                        )}
                        <th className="table-header px-4 py-3">Date</th>
                        <th className="table-header px-4 py-3 hidden md:table-cell">Technical</th>
                        <th className="table-header px-4 py-3 hidden md:table-cell">Communication</th>
                        <th className="table-header px-4 py-3 hidden md:table-cell">Teamwork</th>
                        <th className="table-header px-4 py-3 hidden sm:table-cell">Overall</th>
                        <th className="table-header px-4 py-3">Rating</th>
                        <th className="table-header px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {filteredEvaluations.map(evaluation => (
                        <tr key={evaluation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          {!selectedStudentId && (
                            <td className="table-cell px-4 py-3">{getStudentName(evaluation.studentId)}</td>
                          )}
                          <td className="table-cell px-4 py-3">{new Date(evaluation.date).toLocaleDateString()}</td>
                          <td className="table-cell px-4 py-3 hidden md:table-cell">
                            <div className="flex">{renderStars(evaluation.skills.technical)}</div>
                          </td>
                          <td className="table-cell px-4 py-3 hidden md:table-cell">
                            <div className="flex">{renderStars(evaluation.skills.communication)}</div>
                          </td>
                          <td className="table-cell px-4 py-3 hidden md:table-cell">
                            <div className="flex">{renderStars(evaluation.skills.teamwork)}</div>
                          </td>
                          <td className="table-cell px-4 py-3 hidden sm:table-cell">
                            <div 
                              className={`truncate max-w-md ${styles.evaluationFeedback}`}
                              title={evaluation.feedback}
                            >
                              {evaluation.feedback}
                            </div>
                          </td>
                          <td className="table-cell px-4 py-3">
                            <div className="flex">{renderStars(evaluation.overallRating)}</div>
                          </td>
                          <td className="table-cell px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => handleEditEvaluation(evaluation)}
                                aria-label="Edit evaluation"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleDeleteEvaluation(evaluation.id)}
                                aria-label="Delete evaluation"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Evaluation Form Modal */}
              {evaluationFormMode && (
                <div className="modal-backdrop" onClick={() => { setEvaluationFormMode(null); setSelectedEvaluation(null); }}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {evaluationFormMode === 'add' ? 'Add Evaluation' : 'Edit Evaluation'}
                      </h3>
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => { setEvaluationFormMode(null); setSelectedEvaluation(null); }}
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleAddEvaluation}>
                      <div className="space-y-4 mt-4">
                        <div className="form-group">
                          <label htmlFor="studentId" className="form-label">Student</label>
                          <select 
                            id="studentId" 
                            name="studentId" 
                            className="input" 
                            defaultValue={selectedEvaluation?.studentId || selectedStudentId || ''}
                            disabled={!!selectedStudentId}
                            required
                          >
                            <option value="" disabled>Select a student</option>
                            {students.map(student => (
                              <option key={student.id} value={student.id}>{student.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="date" className="form-label">Evaluation Date</label>
                          <input 
                            id="date" 
                            name="date" 
                            type="date" 
                            className="input" 
                            defaultValue={selectedEvaluation?.date || new Date().toISOString().split('T')[0]}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Technical Skills</label>
                          <div className="flex items-center">
                            <input 
                              id="technical" 
                              name="technical" 
                              type="range" 
                              min="1" 
                              max="5" 
                              className="w-full" 
                              defaultValue={selectedEvaluation?.skills.technical || 3}
                              required 
                            />
                            <span className="ml-2" id="technicalValue">
                              {selectedEvaluation?.skills.technical || 3}/5
                            </span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Communication</label>
                          <div className="flex items-center">
                            <input 
                              id="communication" 
                              name="communication" 
                              type="range" 
                              min="1" 
                              max="5" 
                              className="w-full" 
                              defaultValue={selectedEvaluation?.skills.communication || 3}
                              required 
                            />
                            <span className="ml-2" id="communicationValue">
                              {selectedEvaluation?.skills.communication || 3}/5
                            </span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Teamwork</label>
                          <div className="flex items-center">
                            <input 
                              id="teamwork" 
                              name="teamwork" 
                              type="range" 
                              min="1" 
                              max="5" 
                              className="w-full" 
                              defaultValue={selectedEvaluation?.skills.teamwork || 3}
                              required 
                            />
                            <span className="ml-2" id="teamworkValue">
                              {selectedEvaluation?.skills.teamwork || 3}/5
                            </span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Problem Solving</label>
                          <div className="flex items-center">
                            <input 
                              id="problemSolving" 
                              name="problemSolving" 
                              type="range" 
                              min="1" 
                              max="5" 
                              className="w-full" 
                              defaultValue={selectedEvaluation?.skills.problemSolving || 3}
                              required 
                            />
                            <span className="ml-2" id="problemSolvingValue">
                              {selectedEvaluation?.skills.problemSolving || 3}/5
                            </span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Attitude</label>
                          <div className="flex items-center">
                            <input 
                              id="attitude" 
                              name="attitude" 
                              type="range" 
                              min="1" 
                              max="5" 
                              className="w-full" 
                              defaultValue={selectedEvaluation?.skills.attitude || 3}
                              required 
                            />
                            <span className="ml-2" id="attitudeValue">
                              {selectedEvaluation?.skills.attitude || 3}/5
                            </span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="feedback" className="form-label">Feedback</label>
                          <textarea 
                            id="feedback" 
                            name="feedback" 
                            rows={4} 
                            className="input" 
                            defaultValue={selectedEvaluation?.feedback || ''}
                            required 
                          ></textarea>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Overall Rating</label>
                          <div className="flex items-center">
                            <input 
                              id="overallRating" 
                              name="overallRating" 
                              type="range" 
                              min="1" 
                              max="5" 
                              className="w-full" 
                              defaultValue={selectedEvaluation?.overallRating || 3}
                              required 
                            />
                            <span className="ml-2" id="overallRatingValue">
                              {selectedEvaluation?.overallRating || 3}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          onClick={() => { setEvaluationFormMode(null); setSelectedEvaluation(null); }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {evaluationFormMode === 'add' ? 'Add Evaluation' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold">Evaluation Templates</h2>
                <div className="flex">
                  <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setTemplateFormMode('add')}
                  >
                    <Plus size={18} />
                    <span>Add Template</span>
                  </button>
                </div>
              </div>

              {templates.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-lg text-gray-500 dark:text-gray-400">No templates found.</p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => setTemplateFormMode('add')}
                  >
                    Create Your First Template
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map(template => (
                    <div key={template.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                        <div className="flex">
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                            onClick={() => handleEditTemplate(template)}
                            aria-label="Edit template"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteTemplate(template.id)}
                            aria-label="Delete template"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Contains {template.fields.length} evaluation fields
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fields:</h4>
                        <ul className="space-y-1">
                          {template.fields.map((field, index) => (
                            <li key={index} className="text-sm">
                              {field.label} - <span className="text-gray-500 dark:text-gray-400">{field.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Template Form Modal */}
              {templateFormMode && (
                <div className="modal-backdrop" onClick={() => { setTemplateFormMode(null); setSelectedTemplate(null); }}>
                  <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {templateFormMode === 'add' ? 'Add Template' : 'Edit Template'}
                      </h3>
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => { setTemplateFormMode(null); setSelectedTemplate(null); }}
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleAddTemplate}>
                      <div className="space-y-6 mt-4">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">Template Name</label>
                          <input 
                            id="name" 
                            name="name" 
                            type="text" 
                            className="input" 
                            defaultValue={selectedTemplate?.name || ''}
                            required 
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="form-label">Template Fields</label>
                          <div id="template-fields" className="space-y-4">
                            {(selectedTemplate?.fields || [
                              { name: 'field1', label: 'Field 1', type: 'text' },
                              { name: 'field2', label: 'Field 2', type: 'number' }
                            ]).map((field, index) => (
                              <div key={index} className="template-field p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="form-group">
                                    <label className="form-label text-xs">Field Name</label>
                                    <input 
                                      name="fieldName" 
                                      type="text" 
                                      className="input input-sm" 
                                      defaultValue={field.name || ''}
                                      placeholder="technical_skill"
                                      required 
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label text-xs">Display Label</label>
                                    <input 
                                      name="fieldLabel" 
                                      type="text" 
                                      className="input input-sm" 
                                      defaultValue={field.label || ''}
                                      placeholder="Technical Skill"
                                      required 
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label text-xs">Field Type</label>
                                    <select 
                                      name="fieldType" 
                                      className="input input-sm" 
                                      defaultValue={field.type || 'text'}
                                      required
                                    >
                                      <option value="text">Text</option>
                                      <option value="number">Number</option>
                                      <option value="date">Date</option>
                                      <option value="select">Select</option>
                                      <option value="textarea">Text Area</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          onClick={() => { setTemplateFormMode(null); setSelectedTemplate(null); }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {templateFormMode === 'add' ? 'Add Template' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Skill Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareRatingData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="value" name="Average Rating" fill="#4338ca" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Student Status Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareStatusData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {prepareStatusData().map((entry, index) => {
                            const colors = ['#4338ca', '#06b6d4', '#eab308'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Evaluation Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stat-card bg-primary-50 dark:bg-primary-900">
                      <div className="stat-title">Total Students</div>
                      <div className="stat-value">{students.length}</div>
                      <div className="stat-desc">
                        {students.filter(s => s.status === 'active').length} currently active
                      </div>
                    </div>
                    <div className="stat-card bg-primary-50 dark:bg-primary-900">
                      <div className="stat-title">Total Evaluations</div>
                      <div className="stat-value">{evaluations.length}</div>
                      <div className="stat-desc">
                        {evaluations.length > 0 
                          ? `Avg Rating: ${(evaluations.reduce((acc, e) => acc + e.overallRating, 0) / evaluations.length).toFixed(1)}` 
                          : 'No data available'}
                      </div>
                    </div>
                    <div className="stat-card bg-primary-50 dark:bg-primary-900">
                      <div className="stat-title">Evaluation Templates</div>
                      <div className="stat-value">{templates.length}</div>
                      <div className="stat-desc">
                        Available for assessments
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Top Performing Students</h4>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header px-4 py-2">Student</th>
                            <th className="table-header px-4 py-2">Avg. Rating</th>
                            <th className="table-header px-4 py-2">Evaluations</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                          {students.map(student => {
                            const studentEvals = evaluations.filter(e => e.studentId === student.id);
                            const avgRating = studentEvals.length > 0 
                              ? studentEvals.reduce((acc, e) => acc + e.overallRating, 0) / studentEvals.length 
                              : 0;
                            return {
                              id: student.id,
                              name: student.name,
                              avgRating,
                              evalCount: studentEvals.length
                            };
                          })
                          .filter(item => item.evalCount > 0)
                          .sort((a, b) => b.avgRating - a.avgRating)
                          .slice(0, 5)
                          .map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="table-cell px-4 py-2">{item.name}</td>
                              <td className="table-cell px-4 py-2">
                                <div className="flex">{renderStars(Math.round(item.avgRating))}</div>
                                <span className="text-xs text-gray-500 ml-1">{item.avgRating.toFixed(1)}</span>
                              </td>
                              <td className="table-cell px-4 py-2">{item.evalCount}</td>
                            </tr>
                          ))}
                          {students.filter(student => evaluations.some(e => e.studentId === student.id)).length === 0 && (
                            <tr>
                              <td colSpan={3} className="table-cell px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                No evaluation data available yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 mt-8">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;