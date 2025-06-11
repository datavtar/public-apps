import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Users, UserPlus, Calendar, BarChart3, Settings, Search, Filter, Plus, 
  Edit, Trash2, Eye, Download, Upload, FileText, Clock, CheckCircle, 
  X, XCircle, AlertCircle, TrendingUp, TrendingDown, Moon, Sun, LogOut,
  Building, Mail, Phone, MapPin, GraduationCap, Briefcase, Star,
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Target, Award,
  FileImage, MessageCircle, UserCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Types and Interfaces
interface Requisition {
  id: string;
  title: string;
  department: string;
  hiringManager: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Draft' | 'Open' | 'On Hold' | 'Closed' | 'Cancelled';
  openDate: string;
  targetCloseDate: string;
  description: string;
  requirements: string[];
  budget: number;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experience: string;
  skills: string[];
  applicationsCount: number;
  createdAt: string;
}

interface Application {
  id: string;
  requisitionId: string;
  candidateName: string;
  email: string;
  phone: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Technical' | 'Final' | 'Offer' | 'Hired' | 'Rejected';
  appliedDate: string;
  resumeUrl?: string;
  coverLetter?: string;
  experience: number;
  currentCompany: string;
  currentRole: string;
  location: string;
  expectedSalary: number;
  noticePeriod: string;
  skills: string[];
  rating: number;
  notes: string;
  source: 'Website' | 'LinkedIn' | 'Referral' | 'Agency' | 'Job Board';
  lastUpdated: string;
}

interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  requisitionTitle: string;
  type: 'Phone' | 'Video' | 'In-person' | 'Technical' | 'Panel';
  round: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: string;
  rating?: number;
  notes?: string;
  meetingLink?: string;
  location?: string;
}

interface OnboardingTask {
  id: string;
  applicationId: string;
  candidateName: string;
  requisitionTitle: string;
  startDate: string;
  department: string;
  manager: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
  }[];
  documentsRequired: string[];
  equipmentAssigned: string[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  completionPercentage: number;
}

interface HiringMetrics {
  totalRequisitions: number;
  activeRequisitions: number;
  totalApplications: number;
  totalInterviews: number;
  totalHires: number;
  avgTimeToHire: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number }>;
  hiringTrend: Array<{ month: string; hires: number; applications: number }>;
  departmentMetrics: Array<{ department: string; openPositions: number; hires: number }>;
}

// Custom hook for dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // AI-related states
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Data states
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => void } | null>(null);

  // Form states
  const [requisitionForm, setRequisitionForm] = useState<Partial<Requisition>>({});
  const [applicationForm, setApplicationForm] = useState<Partial<Application>>({});
  const [interviewForm, setInterviewForm] = useState<Partial<Interview>>({});

  // Load data from localStorage
  useEffect(() => {
    const savedRequisitions = localStorage.getItem('talentflow_requisitions');
    const savedApplications = localStorage.getItem('talentflow_applications');
    const savedInterviews = localStorage.getItem('talentflow_interviews');
    const savedOnboarding = localStorage.getItem('talentflow_onboarding');

    if (savedRequisitions) {
      setRequisitions(JSON.parse(savedRequisitions));
    } else {
      // Initialize with sample data
      const sampleRequisitions: Requisition[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          hiringManager: 'John Smith',
          priority: 'High',
          status: 'Open',
          openDate: '2025-05-15',
          targetCloseDate: '2025-07-15',
          description: 'We are looking for a senior software engineer with React and Node.js experience.',
          requirements: ['5+ years experience', 'React expertise', 'Node.js', 'Team leadership'],
          budget: 120000,
          location: 'San Francisco, CA',
          type: 'Full-time',
          experience: '5-8 years',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
          applicationsCount: 23,
          createdAt: '2025-05-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          hiringManager: 'Sarah Johnson',
          priority: 'Medium',
          status: 'Open',
          openDate: '2025-05-20',
          targetCloseDate: '2025-08-01',
          description: 'Seeking an experienced product manager to lead our mobile app development.',
          requirements: ['3+ years PM experience', 'Mobile app experience', 'Agile methodology'],
          budget: 110000,
          location: 'Remote',
          type: 'Full-time',
          experience: '3-5 years',
          skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
          applicationsCount: 15,
          createdAt: '2025-05-20T10:00:00Z'
        }
      ];
      setRequisitions(sampleRequisitions);
      localStorage.setItem('talentflow_requisitions', JSON.stringify(sampleRequisitions));
    }

    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    } else {
      // Initialize with sample data
      const sampleApplications: Application[] = [
        {
          id: '1',
          requisitionId: '1',
          candidateName: 'Alice Chen',
          email: 'alice.chen@email.com',
          phone: '+1-555-0123',
          status: 'Interview',
          appliedDate: '2025-05-22',
          experience: 6,
          currentCompany: 'TechCorp',
          currentRole: 'Software Engineer',
          location: 'San Francisco, CA',
          expectedSalary: 125000,
          noticePeriod: '2 weeks',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
          rating: 4.5,
          notes: 'Strong technical background, excellent communication skills',
          source: 'LinkedIn',
          lastUpdated: '2025-06-01T10:00:00Z'
        },
        {
          id: '2',
          requisitionId: '1',
          candidateName: 'David Rodriguez',
          email: 'david.r@email.com',
          phone: '+1-555-0124',
          status: 'Screening',
          appliedDate: '2025-05-25',
          experience: 5,
          currentCompany: 'StartupXYZ',
          currentRole: 'Full Stack Developer',
          location: 'Austin, TX',
          expectedSalary: 115000,
          noticePeriod: '1 month',
          skills: ['React', 'Python', 'PostgreSQL', 'Kubernetes'],
          rating: 4.0,
          notes: 'Good technical skills, needs improvement in system design',
          source: 'Website',
          lastUpdated: '2025-06-05T10:00:00Z'
        }
      ];
      setApplications(sampleApplications);
      localStorage.setItem('talentflow_applications', JSON.stringify(sampleApplications));
    }

    if (savedInterviews) {
      setInterviews(JSON.parse(savedInterviews));
    } else {
      // Initialize with sample data
      const sampleInterviews: Interview[] = [
        {
          id: '1',
          applicationId: '1',
          candidateName: 'Alice Chen',
          requisitionTitle: 'Senior Software Engineer',
          type: 'Technical',
          round: 2,
          scheduledDate: '2025-06-12',
          scheduledTime: '14:00',
          duration: 90,
          interviewer: 'John Smith',
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/abc-def-ghi'
        }
      ];
      setInterviews(sampleInterviews);
      localStorage.setItem('talentflow_interviews', JSON.stringify(sampleInterviews));
    }

    if (savedOnboarding) {
      setOnboardingTasks(JSON.parse(savedOnboarding));
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('talentflow_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  useEffect(() => {
    localStorage.setItem('talentflow_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('talentflow_interviews', JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem('talentflow_onboarding', JSON.stringify(onboardingTasks));
  }, [onboardingTasks]);

  // Calculate metrics
  const calculateMetrics = (): HiringMetrics => {
    const totalRequisitions = requisitions.length;
    const activeRequisitions = requisitions.filter(r => r.status === 'Open').length;
    const totalApplications = applications.length;
    const totalInterviews = interviews.length;
    const totalHires = applications.filter(a => a.status === 'Hired').length;
    
    const hiredApplications = applications.filter(a => a.status === 'Hired');
    const avgTimeToHire = hiredApplications.length > 0 
      ? hiredApplications.reduce((sum, app) => {
          const applied = new Date(app.appliedDate);
          const hired = new Date(app.lastUpdated);
          return sum + (hired.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / hiredApplications.length
      : 0;

    const conversionRate = totalApplications > 0 ? (totalHires / totalApplications) * 100 : 0;

    const sourceCount = applications.reduce((acc, app) => {
      acc[app.source] = (acc[app.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const hiringTrend = [
      { month: 'Jan', hires: 8, applications: 45 },
      { month: 'Feb', hires: 12, applications: 52 },
      { month: 'Mar', hires: 15, applications: 67 },
      { month: 'Apr', hires: 10, applications: 41 },
      { month: 'May', hires: 18, applications: 73 },
      { month: 'Jun', hires: totalHires, applications: totalApplications }
    ];

    const departmentCount = requisitions.reduce((acc, req) => {
      acc[req.department] = (acc[req.department] || { open: 0, hires: 0 });
      if (req.status === 'Open') acc[req.department].open++;
      const deptHires = applications.filter(app => 
        app.requisitionId === req.id && app.status === 'Hired'
      ).length;
      acc[req.department].hires += deptHires;
      return acc;
    }, {} as Record<string, { open: number; hires: number }>);

    const departmentMetrics = Object.entries(departmentCount)
      .map(([department, data]) => ({
        department,
        openPositions: data.open,
        hires: data.hires
      }));

    return {
      totalRequisitions,
      activeRequisitions,
      totalApplications,
      totalInterviews,
      totalHires,
      avgTimeToHire,
      conversionRate,
      topSources,
      hiringTrend,
      departmentMetrics
    };
  };

  // AI Functions
  const handleSendToAI = (prompt: string, file?: File) => {
    if (!prompt?.trim() && !file) {
      setAiError("Please provide a prompt or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleResumeAnalysis = () => {
    if (!selectedFile) {
      setAiError("Please select a resume file to analyze.");
      return;
    }

    const prompt = `Analyze this resume and extract candidate information. Return JSON with the following fields:
    {
      "candidateName": "Full name",
      "email": "Email address",
      "phone": "Phone number", 
      "experience": "Years of experience as number",
      "currentCompany": "Current company name",
      "currentRole": "Current job title",
      "location": "Location/City",
      "skills": ["Array of technical skills"],
      "education": "Educational background",
      "summary": "Brief professional summary"
    }`;

    handleSendToAI(prompt, selectedFile);
  };

  const handleJobDescriptionGeneration = () => {
    if (!selectedRequisition) {
      setAiError("Please select a requisition to generate job description for.");
      return;
    }

    const prompt = `Generate a comprehensive job description for the position "${selectedRequisition.title}" in the ${selectedRequisition.department} department. 
    
    Position details:
    - Title: ${selectedRequisition.title}
    - Department: ${selectedRequisition.department}
    - Type: ${selectedRequisition.type}
    - Experience: ${selectedRequisition.experience}
    - Location: ${selectedRequisition.location}
    - Skills required: ${selectedRequisition.skills.join(', ')}
    - Budget: $${selectedRequisition.budget.toLocaleString()}
    
    Please provide a detailed job description with company overview, role responsibilities, qualifications, and benefits.`;

    handleSendToAI(prompt);
  };

  // CRUD Functions
  const addRequisition = (requisition: Partial<Requisition>) => {
    const newRequisition: Requisition = {
      id: Date.now().toString(),
      title: requisition.title || '',
      department: requisition.department || '',
      hiringManager: requisition.hiringManager || '',
      priority: requisition.priority || 'Medium',
      status: requisition.status || 'Draft',
      openDate: requisition.openDate || new Date().toISOString().split('T')[0],
      targetCloseDate: requisition.targetCloseDate || '',
      description: requisition.description || '',
      requirements: requisition.requirements || [],
      budget: requisition.budget || 0,
      location: requisition.location || '',
      type: requisition.type || 'Full-time',
      experience: requisition.experience || '',
      skills: requisition.skills || [],
      applicationsCount: 0,
      createdAt: new Date().toISOString()
    };

    setRequisitions(prev => [...prev, newRequisition]);
    setShowRequisitionModal(false);
    setRequisitionForm({});
  };

  const updateRequisition = (id: string, updates: Partial<Requisition>) => {
    setRequisitions(prev => prev.map(req => 
      req.id === id ? { ...req, ...updates } : req
    ));
  };

  const deleteRequisition = (id: string) => {
    setConfirmAction({
      title: 'Delete Requisition',
      message: 'Are you sure you want to delete this requisition? This action cannot be undone.',
      action: () => {
        setRequisitions(prev => prev.filter(req => req.id !== id));
        setApplications(prev => prev.filter(app => app.requisitionId !== id));
        setShowConfirmDialog(false);
      }
    });
    setShowConfirmDialog(true);
  };

  const addApplication = (application: Partial<Application>) => {
    const newApplication: Application = {
      id: Date.now().toString(),
      requisitionId: application.requisitionId || '',
      candidateName: application.candidateName || '',
      email: application.email || '',
      phone: application.phone || '',
      status: application.status || 'Applied',
      appliedDate: application.appliedDate || new Date().toISOString().split('T')[0],
      experience: application.experience || 0,
      currentCompany: application.currentCompany || '',
      currentRole: application.currentRole || '',
      location: application.location || '',
      expectedSalary: application.expectedSalary || 0,
      noticePeriod: application.noticePeriod || '',
      skills: application.skills || [],
      rating: application.rating || 0,
      notes: application.notes || '',
      source: application.source || 'Website',
      lastUpdated: new Date().toISOString()
    };

    setApplications(prev => [...prev, newApplication]);
    
    // Update requisition applications count
    setRequisitions(prev => prev.map(req => 
      req.id === newApplication.requisitionId 
        ? { ...req, applicationsCount: req.applicationsCount + 1 }
        : req
    ));

    setShowApplicationModal(false);
    setApplicationForm({});
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { ...app, status, lastUpdated: new Date().toISOString() }
        : app
    ));
  };

  const bulkUpdateApplications = (ids: string[], status: Application['status']) => {
    setApplications(prev => prev.map(app => 
      ids.includes(app.id)
        ? { ...app, status, lastUpdated: new Date().toISOString() }
        : app
    ));
    setSelectedApplications([]);
    setShowBulkActions(false);
  };

  const addInterview = (interview: Partial<Interview>) => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      applicationId: interview.applicationId || '',
      candidateName: interview.candidateName || '',
      requisitionTitle: interview.requisitionTitle || '',
      type: interview.type || 'Phone',
      round: interview.round || 1,
      scheduledDate: interview.scheduledDate || '',
      scheduledTime: interview.scheduledTime || '',
      duration: interview.duration || 60,
      interviewer: interview.interviewer || '',
      status: interview.status || 'Scheduled',
      meetingLink: interview.meetingLink || '',
      location: interview.location || ''
    };

    setInterviews(prev => [...prev, newInterview]);
    setShowInterviewModal(false);
    setInterviewForm({});
  };

  // File operations
  const downloadTemplate = (type: string) => {
    let csvContent = '';
    let filename = '';

    if (type === 'requisitions') {
      csvContent = 'Title,Department,Hiring Manager,Priority,Status,Open Date,Target Close Date,Description,Budget,Location,Type,Experience,Skills\n';
      csvContent += 'Senior Software Engineer,Engineering,John Smith,High,Open,2025-06-11,2025-08-11,Looking for experienced developer,120000,San Francisco,Full-time,5+ years,"React,Node.js,TypeScript"';
      filename = 'requisitions_template.csv';
    } else if (type === 'applications') {
      csvContent = 'Candidate Name,Email,Phone,Requisition ID,Status,Applied Date,Experience,Current Company,Current Role,Location,Expected Salary,Notice Period,Skills,Source\n';
      csvContent += 'John Doe,john@email.com,555-0123,1,Applied,2025-06-11,5,TechCorp,Developer,San Francisco,115000,2 weeks,"React,JavaScript",LinkedIn';
      filename = 'applications_template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';

    if (type === 'requisitions') {
      data = requisitions;
      filename = 'requisitions_export.csv';
    } else if (type === 'applications') {
      data = applications;
      filename = 'applications_export.csv';
    } else if (type === 'interviews') {
      data = interviews;
      filename = 'interviews_export.csv';
    }

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (Array.isArray(value)) return `"${value.join(';')}"`;
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const item: any = {};
          
          headers.forEach((header, index) => {
            if (values[index]) {
              if (header.toLowerCase().includes('skills') || header.toLowerCase().includes('requirements')) {
                item[header] = values[index].split(';');
              } else if (header.toLowerCase().includes('budget') || header.toLowerCase().includes('salary') || header.toLowerCase().includes('experience')) {
                item[header] = parseFloat(values[index]) || 0;
              } else {
                item[header] = values[index];
              }
            }
          });

          if (type === 'requisitions' && item.Title) {
            addRequisition({
              title: item.Title,
              department: item.Department,
              hiringManager: item['Hiring Manager'],
              priority: item.Priority as Requisition['priority'],
              status: item.Status as Requisition['status'],
              openDate: item['Open Date'],
              targetCloseDate: item['Target Close Date'],
              description: item.Description,
              budget: item.Budget,
              location: item.Location,
              type: item.Type as Requisition['type'],
              experience: item.Experience,
              skills: item.Skills || []
            });
          } else if (type === 'applications' && item['Candidate Name']) {
            addApplication({
              candidateName: item['Candidate Name'],
              email: item.Email,
              phone: item.Phone,
              requisitionId: item['Requisition ID'],
              status: item.Status as Application['status'],
              appliedDate: item['Applied Date'],
              experience: item.Experience,
              currentCompany: item['Current Company'],
              currentRole: item['Current Role'],
              location: item.Location,
              expectedSalary: item['Expected Salary'],
              noticePeriod: item['Notice Period'],
              skills: item.Skills || [],
              source: item.Source as Application['source']
            });
          }
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Filter functions
  const getFilteredRequisitions = () => {
    return requisitions.filter(req => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.hiringManager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'All' || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.currentCompany.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter(app => app.status === status);
  };

  const getUpcomingInterviews = () => {
    const today = new Date().toISOString().split('T')[0];
    return interviews.filter(interview => 
      interview.scheduledDate >= today && interview.status === 'Scheduled'
    ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'High': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Low': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
      case 'Scheduled':
      case 'Applied': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Screening':
      case 'Interview': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Offer':
      case 'Completed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'Hired': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Rejected':
      case 'Cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'On Hold': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Process AI result for resume analysis
  useEffect(() => {
    if (aiResult && selectedFile) {
      try {
        const parsedResult = JSON.parse(aiResult);
        if (parsedResult.candidateName) {
          setApplicationForm({
            candidateName: parsedResult.candidateName,
            email: parsedResult.email,
            phone: parsedResult.phone,
            experience: parseInt(parsedResult.experience) || 0,
            currentCompany: parsedResult.currentCompany,
            currentRole: parsedResult.currentRole,
            location: parsedResult.location,
            skills: parsedResult.skills || [],
            notes: parsedResult.summary || ''
          });
          setSelectedFile(null);
          setAiResult(null);
        }
      } catch (error) {
        // If not JSON, just display the result
        console.log('AI result is not JSON format');
      }
    }
  }, [aiResult]);

  const metrics = calculateMetrics();

  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900 dark:text-white">Talent Acquisition Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Overview of your hiring pipeline and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('requisitions')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Active Requisitions</p>
              <p className="stat-value">{metrics.activeRequisitions}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="stat-change stat-increase">
            <TrendingUp className="w-4 h-4" />
            +12% from last month
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Total Applications</p>
              <p className="stat-value">{metrics.totalApplications}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="stat-change stat-increase">
            <TrendingUp className="w-4 h-4" />
            +8% from last month
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Interviews Scheduled</p>
              <p className="stat-value">{metrics.totalInterviews}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="stat-change">
            <Clock className="w-4 h-4" />
            5 this week
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Conversion Rate</p>
              <p className="stat-value">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="stat-change stat-increase">
            <TrendingUp className="w-4 h-4" />
            +2.3% from last month
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card card-padding">
          <h3 className="heading-5 mb-6">Hiring Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.hiringTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="hires" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-6">Department Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.departmentMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="department" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="openPositions" fill="#3B82F6" />
              <Bar dataKey="hires" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Application Pipeline */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-6">Application Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {['Applied', 'Screening', 'Interview', 'Technical', 'Final', 'Offer', 'Hired'].map(status => {
            const count = getApplicationsByStatus(status as Application['status']).length;
            return (
              <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="card card-padding">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-5">Upcoming Interviews</h3>
          <button
            onClick={() => setActiveTab('interviews')}
            className="btn btn-secondary btn-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {getUpcomingInterviews().slice(0, 5).map(interview => (
            <div key={interview.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{interview.candidateName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{interview.requisitionTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{interview.scheduledDate}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{interview.scheduledTime}</p>
              </div>
            </div>
          ))}
          {getUpcomingInterviews().length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No upcoming interviews scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRequisitions = () => (
    <div id="requisitions-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900 dark:text-white">Job Requisitions</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage open positions and hiring requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadTemplate('requisitions')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileImport(e, 'requisitions')}
              className="hidden"
            />
          </label>
          <button
            onClick={() => exportData('requisitions')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowRequisitionModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Requisition
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select"
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Open">Open</option>
          <option value="On Hold">On Hold</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Requisitions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {getFilteredRequisitions().map(requisition => (
          <div key={requisition.id} className="card card-padding card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="heading-6 text-gray-900 dark:text-white mb-2">{requisition.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{requisition.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${getPriorityColor(requisition.priority)}`}>
                  {requisition.priority}
                </span>
                <span className={`badge ${getStatusColor(requisition.status)}`}>
                  {requisition.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="w-4 h-4" />
                <span>{requisition.hiringManager}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{requisition.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{requisition.applicationsCount} applications</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Due: {new Date(requisition.targetCloseDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {requisition.skills.slice(0, 3).map(skill => (
                <span key={skill} className="badge badge-gray text-xs">
                  {skill}
                </span>
              ))}
              {requisition.skills.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{requisition.skills.length - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ${requisition.budget.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRequisition(requisition);
                    setRequisitionForm(requisition);
                    setShowRequisitionModal(true);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRequisition(requisition.id)}
                  className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('applications');
                    setFilterStatus('All');
                    setSearchTerm('');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Apps
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredRequisitions().length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-5 text-gray-900 dark:text-white mb-2">No requisitions found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first job requisition</p>
          <button
            onClick={() => setShowRequisitionModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Requisition
          </button>
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div id="applications-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900 dark:text-white">Applications</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Track and manage candidate applications</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedApplications.length} selected
              </span>
              <button
                onClick={() => setShowBulkActions(true)}
                className="btn btn-secondary btn-sm"
              >
                Bulk Actions
              </button>
            </div>
          )}
          <button
            onClick={() => downloadTemplate('applications')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileImport(e, 'applications')}
              className="hidden"
            />
          </label>
          <button
            onClick={() => exportData('applications')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowApplicationModal(true)}
            className="btn btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select"
        >
          <option value="All">All Status</option>
          <option value="Applied">Applied</option>
          <option value="Screening">Screening</option>
          <option value="Interview">Interview</option>
          <option value="Technical">Technical</option>
          <option value="Final">Final</option>
          <option value="Offer">Offer</option>
          <option value="Hired">Hired</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-4">
          {['Applied', 'Screening', 'Interview', 'Technical', 'Final', 'Offer', 'Hired'].map(status => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{status}</h3>
                  <span className="badge badge-gray">
                    {getApplicationsByStatus(status as Application['status']).length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getApplicationsByStatus(status as Application['status']).map(application => {
                    const requisition = requisitions.find(r => r.id === application.requisitionId);
                    return (
                      <div key={application.id} className="card card-padding bg-white dark:bg-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {application.candidateName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {requisition?.title || 'Unknown Position'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplications(prev => [...prev, application.id]);
                              } else {
                                setSelectedApplications(prev => prev.filter(id => id !== application.id));
                              }
                            }}
                            className="checkbox"
                          />
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Briefcase className="w-3 h-3" />
                            <span>{application.experience} years • {application.currentCompany}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {application.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < application.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="badge badge-primary text-xs">
                            {application.source}
                          </span>
                          <div className="flex items-center gap-1">
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application.id, e.target.value as Application['status'])}
                              className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Screening">Screening</option>
                              <option value="Interview">Interview</option>
                              <option value="Technical">Technical</option>
                              <option value="Final">Final</option>
                              <option value="Offer">Offer</option>
                              <option value="Hired">Hired</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications Table (Alternative View) */}
      <div className="card">
        <div className="card-header">
          <h3 className="heading-6">All Applications</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApplications(getFilteredApplications().map(app => app.id));
                      } else {
                        setSelectedApplications([]);
                      }
                    }}
                    className="checkbox"
                  />
                </th>
                <th className="table-header-cell">Candidate</th>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Applied Date</th>
                <th className="table-header-cell">Experience</th>
                <th className="table-header-cell">Rating</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {getFilteredApplications().map(application => {
                const requisition = requisitions.find(r => r.id === application.requisitionId);
                return (
                  <tr key={application.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplications(prev => [...prev, application.id]);
                          } else {
                            setSelectedApplications(prev => prev.filter(id => id !== application.id));
                          }
                        }}
                        className="checkbox"
                      />
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {application.candidateName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {application.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {requisition?.title || 'Unknown Position'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      {application.experience} years
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < application.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setApplicationForm(application);
                            setShowApplicationModal(true);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setInterviewForm({
                              applicationId: application.id,
                              candidateName: application.candidateName,
                              requisitionTitle: requisition?.title || ''
                            });
                            setShowInterviewModal(true);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Calendar className="w-4 h-4" />
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
    </div>
  );

  const renderInterviews = () => (
    <div id="interviews-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900 dark:text-white">Interviews</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Schedule and manage candidate interviews</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportData('interviews')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowInterviewModal(true)}
            className="btn btn-primary"
          >
            <Calendar className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-6">Interview Calendar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviews
            .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
            .map(interview => (
              <div key={interview.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {interview.candidateName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {interview.requisitionTitle}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(interview.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{interview.scheduledTime} ({interview.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{interview.interviewer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="badge badge-gray text-xs">
                      {interview.type} • Round {interview.round}
                    </span>
                  </div>
                </div>

                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm w-full mb-2"
                  >
                    Join Meeting
                  </a>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setInterviewForm(interview);
                      setShowInterviewModal(true);
                    }}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {interview.status === 'Scheduled' && (
                    <button
                      onClick={() => {
                        setInterviews(prev => prev.map(int =>
                          int.id === interview.id
                            ? { ...int, status: 'Completed' as Interview['status'] }
                            : int
                        ));
                      }}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {interviews.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-5 text-gray-900 dark:text-white mb-2">No interviews scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start by scheduling your first interview</p>
            <button
              onClick={() => setShowInterviewModal(true)}
              className="btn btn-primary"
            >
              <Calendar className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-8">
      <div>
        <h1 className="heading-2 text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your preferences and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Tools */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-6">AI-Powered Tools</h3>
          
          <div className="space-y-6">
            {/* Resume Analysis */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resume Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload candidate resumes to automatically extract information and populate application forms.
              </p>
              
              <div className="space-y-3">
                <label className="btn btn-secondary cursor-pointer">
                  <FileImage className="w-4 h-4" />
                  Upload Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedFile.name}</span>
                    <button
                      onClick={handleResumeAnalysis}
                      disabled={isAiLoading}
                      className={`btn btn-primary btn-sm ${isAiLoading ? 'btn-loading' : ''}`}
                    >
                      {isAiLoading ? 'Analyzing...' : 'Analyze Resume'}
                    </button>
                  </div>
                )}

                {aiResult && selectedFile && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Resume analyzed successfully! The extracted information will be pre-filled when you create a new application.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description Generator */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Job Description Generator</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate comprehensive job descriptions based on requisition details.
              </p>
              
              <div className="space-y-3">
                <select
                  value={selectedRequisition?.id || ''}
                  onChange={(e) => {
                    const req = requisitions.find(r => r.id === e.target.value);
                    setSelectedRequisition(req || null);
                  }}
                  className="select"
                >
                  <option value="">Select a requisition</option>
                  {requisitions.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.title} - {req.department}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleJobDescriptionGeneration}
                  disabled={!selectedRequisition || isAiLoading}
                  className={`btn btn-primary ${isAiLoading ? 'btn-loading' : ''}`}
                >
                  {isAiLoading ? 'Generating...' : 'Generate Job Description'}
                </button>

                {aiResult && !selectedFile && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-semibold mb-2">Generated Job Description:</h5>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="w-4 h-4" />
                <span>{aiError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-6">Data Management</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Export Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download your data in CSV format for backup or analysis.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => exportData('requisitions')}
                  className="btn btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Requisitions
                </button>
                <button
                  onClick={() => exportData('applications')}
                  className="btn btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Applications
                </button>
                <button
                  onClick={() => exportData('interviews')}
                  className="btn btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Interviews
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Import Templates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download CSV templates to prepare your data for import.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadTemplate('requisitions')}
                  className="btn btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Requisitions Template
                </button>
                <button
                  onClick={() => downloadTemplate('applications')}
                  className="btn btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Applications Template
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Clear All Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Remove all data from the system. This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  setConfirmAction({
                    title: 'Clear All Data',
                    message: 'Are you sure you want to delete all data? This action cannot be undone.',
                    action: () => {
                      localStorage.removeItem('talentflow_requisitions');
                      localStorage.removeItem('talentflow_applications');
                      localStorage.removeItem('talentflow_interviews');
                      localStorage.removeItem('talentflow_onboarding');
                      setRequisitions([]);
                      setApplications([]);
                      setInterviews([]);
                      setOnboardingTasks([]);
                      setShowConfirmDialog(false);
                    }
                  });
                  setShowConfirmDialog(true);
                }}
                className="btn btn-error btn-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TalentFlow</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {currentUser.first_name}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-link ${activeTab === 'dashboard' ? 'nav-link-active' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('requisitions')}
              className={`nav-link ${activeTab === 'requisitions' ? 'nav-link-active' : ''}`}
            >
              <Briefcase className="w-4 h-4" />
              Requisitions
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`nav-link ${activeTab === 'applications' ? 'nav-link-active' : ''}`}
            >
              <Users className="w-4 h-4" />
              Applications
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`nav-link ${activeTab === 'interviews' ? 'nav-link-active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              Interviews
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`nav-link ${activeTab === 'settings' ? 'nav-link-active' : ''}`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="generation_issue_fallback" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requisitions' && renderRequisitions()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'interviews' && renderInterviews()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      {showRequisitionModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowRequisitionModal(false);
            setRequisitionForm({});
            setSelectedRequisition(null);
          }
        }}>
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">
                {selectedRequisition ? 'Edit Requisition' : 'Add New Requisition'}
              </h3>
              <button
                onClick={() => {
                  setShowRequisitionModal(false);
                  setRequisitionForm({});
                  setSelectedRequisition(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedRequisition) {
                  updateRequisition(selectedRequisition.id, requisitionForm);
                  setShowRequisitionModal(false);
                  setSelectedRequisition(null);
                } else {
                  addRequisition(requisitionForm);
                }
                setRequisitionForm({});
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Job Title</label>
                    <input
                      type="text"
                      value={requisitionForm.title || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Department</label>
                    <select
                      value={requisitionForm.department || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, department: e.target.value }))}
                      className="select"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Hiring Manager</label>
                    <input
                      type="text"
                      value={requisitionForm.hiringManager || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, hiringManager: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={requisitionForm.priority || 'Medium'}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, priority: e.target.value as Requisition['priority'] }))}
                      className="select"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={requisitionForm.status || 'Draft'}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, status: e.target.value as Requisition['status'] }))}
                      className="select"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Open">Open</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employment Type</label>
                    <select
                      value={requisitionForm.type || 'Full-time'}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, type: e.target.value as Requisition['type'] }))}
                      className="select"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget ($)</label>
                    <input
                      type="number"
                      value={requisitionForm.budget || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Target Close Date</label>
                    <input
                      type="date"
                      value={requisitionForm.targetCloseDate || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, targetCloseDate: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={requisitionForm.location || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, location: e.target.value }))}
                      className="input"
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea
                    value={requisitionForm.description || ''}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="textarea"
                    rows={4}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input
                    type="text"
                    value={requisitionForm.experience || ''}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="input"
                    placeholder="e.g., 3-5 years, Entry level, Senior level"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={requisitionForm.skills?.join(', ') || ''}
                    onChange={(e) => setRequisitionForm(prev => ({ 
                      ...prev, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    }))}
                    className="input"
                    placeholder="e.g., React, Node.js, TypeScript, Leadership"
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequisitionModal(false);
                      setRequisitionForm({});
                      setSelectedRequisition(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedRequisition ? 'Update Requisition' : 'Create Requisition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showApplicationModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowApplicationModal(false);
            setApplicationForm({});
            setSelectedApplication(null);
          }
        }}>
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">
                {selectedApplication ? 'Edit Application' : 'Add New Application'}
              </h3>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setApplicationForm({});
                  setSelectedApplication(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedApplication) {
                  setApplications(prev => prev.map(app => 
                    app.id === selectedApplication.id 
                      ? { ...app, ...applicationForm, lastUpdated: new Date().toISOString() }
                      : app
                  ));
                  setShowApplicationModal(false);
                  setSelectedApplication(null);
                } else {
                  addApplication(applicationForm);
                }
                setApplicationForm({});
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Candidate Name</label>
                    <input
                      type="text"
                      value={applicationForm.candidateName || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, candidateName: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Email</label>
                    <input
                      type="email"
                      value={applicationForm.email || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={applicationForm.phone || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Position</label>
                    <select
                      value={applicationForm.requisitionId || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, requisitionId: e.target.value }))}
                      className="select"
                      required
                    >
                      <option value="">Select Position</option>
                      {requisitions.filter(r => r.status === 'Open').map(req => (
                        <option key={req.id} value={req.id}>
                          {req.title} - {req.department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={applicationForm.status || 'Applied'}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, status: e.target.value as Application['status'] }))}
                      className="select"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interview">Interview</option>
                      <option value="Technical">Technical</option>
                      <option value="Final">Final</option>
                      <option value="Offer">Offer</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input
                      type="number"
                      min="0"
                      value={applicationForm.experience || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select
                      value={applicationForm.source || 'Website'}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, source: e.target.value as Application['source'] }))}
                      className="select"
                    >
                      <option value="Website">Website</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Agency">Agency</option>
                      <option value="Job Board">Job Board</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Current Company</label>
                    <input
                      type="text"
                      value={applicationForm.currentCompany || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, currentCompany: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Role</label>
                    <input
                      type="text"
                      value={applicationForm.currentRole || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, currentRole: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={applicationForm.location || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, location: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Salary ($)</label>
                    <input
                      type="number"
                      value={applicationForm.expectedSalary || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, expectedSalary: parseInt(e.target.value) || 0 }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notice Period</label>
                    <input
                      type="text"
                      value={applicationForm.noticePeriod || ''}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, noticePeriod: e.target.value }))}
                      className="input"
                      placeholder="e.g., 2 weeks, 1 month"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={applicationForm.skills?.join(', ') || ''}
                    onChange={(e) => setApplicationForm(prev => ({ 
                      ...prev, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    }))}
                    className="input"
                    placeholder="e.g., React, Node.js, TypeScript, Leadership"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    value={applicationForm.rating || 0}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="select"
                  >
                    <option value={0}>No rating</option>
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={applicationForm.notes || ''}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="textarea"
                    rows={3}
                    placeholder="Add any notes about the candidate..."
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationModal(false);
                      setApplicationForm({});
                      setSelectedApplication(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedApplication ? 'Update Application' : 'Create Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showInterviewModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowInterviewModal(false);
            setInterviewForm({});
          }
        }}>
          <div className="modal-content max-w-xl">
            <div className="modal-header">
              <h3 className="heading-5">Schedule Interview</h3>
              <button
                onClick={() => {
                  setShowInterviewModal(false);
                  setInterviewForm({});
                }}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (interviewForm.id) {
                  setInterviews(prev => prev.map(int => 
                    int.id === interviewForm.id ? { ...int, ...interviewForm } as Interview : int
                  ));
                } else {
                  addInterview(interviewForm);
                }
                setInterviewForm({});
              }} className="space-y-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Application</label>
                  <select
                    value={interviewForm.applicationId || ''}
                    onChange={(e) => {
                      const app = applications.find(a => a.id === e.target.value);
                      const req = app ? requisitions.find(r => r.id === app.requisitionId) : null;
                      setInterviewForm(prev => ({ 
                        ...prev, 
                        applicationId: e.target.value,
                        candidateName: app?.candidateName || '',
                        requisitionTitle: req?.title || ''
                      }));
                    }}
                    className="select"
                    required
                    disabled={!!interviewForm.applicationId}
                  >
                    <option value="">Select Application</option>
                    {applications.filter(app => ['Screening', 'Interview', 'Technical', 'Final'].includes(app.status)).map(app => {
                      const req = requisitions.find(r => r.id === app.requisitionId);
                      return (
                        <option key={app.id} value={app.id}>
                          {app.candidateName} - {req?.title}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Interview Type</label>
                    <select
                      value={interviewForm.type || 'Phone'}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, type: e.target.value as Interview['type'] }))}
                      className="select"
                      required
                    >
                      <option value="Phone">Phone</option>
                      <option value="Video">Video</option>
                      <option value="In-person">In-person</option>
                      <option value="Technical">Technical</option>
                      <option value="Panel">Panel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Round</label>
                    <select
                      value={interviewForm.round || 1}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, round: parseInt(e.target.value) }))}
                      className="select"
                    >
                      <option value={1}>Round 1</option>
                      <option value={2}>Round 2</option>
                      <option value={3}>Round 3</option>
                      <option value={4}>Round 4</option>
                      <option value={5}>Round 5</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Date</label>
                    <input
                      type="date"
                      value={interviewForm.scheduledDate || ''}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Time</label>
                    <input
                      type="time"
                      value={interviewForm.scheduledTime || ''}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={interviewForm.duration || 60}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Interviewer</label>
                    <input
                      type="text"
                      value={interviewForm.interviewer || ''}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewer: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input
                    type="url"
                    value={interviewForm.meetingLink || ''}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                    className="input"
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={interviewForm.location || ''}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                    placeholder="Conference Room A, Office Address, etc."
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInterviewModal(false);
                      setInterviewForm({});
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {interviewForm.id ? 'Update Interview' : 'Schedule Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBulkActions && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowBulkActions(false);
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Bulk Actions</h3>
              <button
                onClick={() => setShowBulkActions(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update status for {selectedApplications.length} selected applications
              </p>
              <div className="space-y-3">
                {['Screening', 'Interview', 'Technical', 'Final', 'Offer', 'Hired', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => bulkUpdateApplications(selectedApplications, status as Application['status'])}
                    className="btn btn-secondary w-full justify-start"
                  >
                    Move to {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && confirmAction && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">{confirmAction.title}</h3>
            </div>
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-400">{confirmAction.message}</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.action}
                className="btn btn-error"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;