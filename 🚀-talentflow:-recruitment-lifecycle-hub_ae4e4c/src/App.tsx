import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Users, Plus, Search, Filter, Calendar, FileText, BarChart3, Settings, LogOut,
  Edit, Trash2, Eye, Download, Upload, User, Mail, Phone, MapPin,
  Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown,
  Building, Briefcase, GraduationCap, Award, MessageCircle, Bell,
  Menu, X, ChevronDown, ChevronRight, Star, Target, Coffee
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface JobRequisition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  hiringManager: string;
  status: 'Draft' | 'Open' | 'On Hold' | 'Closed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  openings: number;
  dateCreated: string;
  dateUpdated: string;
  deadline: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  currentCompany: string;
  experience: number;
  education: string;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  appliedJobs: string[];
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  stage: string;
  rating: number;
  notes: string;
  source: 'Website' | 'LinkedIn' | 'Referral' | 'Agency' | 'Job Board';
  dateApplied: string;
  lastContact: string;
}

interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  type: 'Phone' | 'Video' | 'In-person' | 'Technical' | 'Final';
  round: number;
  scheduledDate: string;
  duration: number;
  interviewer: string;
  location?: string;
  meetingLink?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback: string;
  rating: number;
  notes: string;
  nextSteps: string;
}

interface OnboardingTask {
  id: string;
  candidateId: string;
  task: string;
  category: 'Documentation' | 'Equipment' | 'Training' | 'Meeting' | 'System Access';
  assignedTo: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  completedDate?: string;
}

interface Analytics {
  totalRequisitions: number;
  activeRequisitions: number;
  totalCandidates: number;
  newCandidates: number;
  interviewsThisWeek: number;
  hiredThisMonth: number;
  timeToHire: number;
  sourceBreakdown: { [key: string]: number };
  statusDistribution: { [key: string]: number };
}

type ActiveTab = 'dashboard' | 'requisitions' | 'candidates' | 'interviews' | 'onboarding' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // AI State
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // App State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // UI State
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form States
  const [requisitionForm, setRequisitionForm] = useState<Partial<JobRequisition>>({});
  const [candidateForm, setCandidateForm] = useState<Partial<Candidate>>({});
  const [interviewForm, setInterviewForm] = useState<Partial<Interview>>({});
  const [onboardingForm, setOnboardingForm] = useState<Partial<OnboardingTask>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Calculate analytics whenever data changes
  useEffect(() => {
    calculateAnalytics();
  }, [requisitions, candidates, interviews]);

  const loadData = () => {
    try {
      const savedRequisitions = localStorage.getItem('talentflow_requisitions');
      const savedCandidates = localStorage.getItem('talentflow_candidates');
      const savedInterviews = localStorage.getItem('talentflow_interviews');
      const savedOnboarding = localStorage.getItem('talentflow_onboarding');

      if (savedRequisitions) {
        setRequisitions(JSON.parse(savedRequisitions));
      } else {
        // Initialize with sample data
        const sampleRequisitions: JobRequisition[] = [
          {
            id: '1',
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            type: 'Full-time',
            level: 'Senior',
            description: 'We are looking for a Senior Software Engineer to join our team...',
            requirements: ['5+ years experience', 'React', 'Node.js', 'TypeScript'],
            salary: { min: 120000, max: 160000, currency: 'USD' },
            hiringManager: 'John Smith',
            status: 'Open',
            priority: 'High',
            openings: 2,
            dateCreated: '2025-05-15',
            dateUpdated: '2025-06-01',
            deadline: '2025-07-15'
          },
          {
            id: '2',
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote',
            type: 'Full-time',
            level: 'Mid',
            description: 'Seeking an experienced Product Manager to drive product strategy...',
            requirements: ['3+ years PM experience', 'Agile methodologies', 'Data analysis'],
            salary: { min: 100000, max: 130000, currency: 'USD' },
            hiringManager: 'Sarah Johnson',
            status: 'Open',
            priority: 'Medium',
            openings: 1,
            dateCreated: '2025-05-20',
            dateUpdated: '2025-05-25',
            deadline: '2025-08-01'
          }
        ];
        setRequisitions(sampleRequisitions);
        localStorage.setItem('talentflow_requisitions', JSON.stringify(sampleRequisitions));
      }

      if (savedCandidates) {
        setCandidates(JSON.parse(savedCandidates));
      } else {
        // Initialize with sample data
        const sampleCandidates: Candidate[] = [
          {
            id: '1',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@email.com',
            phone: '+1-555-0101',
            location: 'San Francisco, CA',
            currentTitle: 'Software Engineer',
            currentCompany: 'TechCorp',
            experience: 6,
            education: 'MS Computer Science',
            skills: ['React', 'Node.js', 'Python', 'AWS'],
            appliedJobs: ['1'],
            status: 'Interview',
            stage: 'Technical Interview',
            rating: 4,
            notes: 'Strong technical background, excellent communication skills',
            source: 'LinkedIn',
            dateApplied: '2025-05-25',
            lastContact: '2025-06-05'
          },
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Williams',
            email: 'bob.williams@email.com',
            phone: '+1-555-0102',
            location: 'Austin, TX',
            currentTitle: 'Product Analyst',
            currentCompany: 'DataInc',
            experience: 4,
            education: 'MBA',
            skills: ['Product Strategy', 'Analytics', 'SQL', 'Figma'],
            appliedJobs: ['2'],
            status: 'Screening',
            stage: 'Initial Review',
            rating: 3,
            notes: 'Good analytical skills, needs more PM experience',
            source: 'Job Board',
            dateApplied: '2025-06-01',
            lastContact: '2025-06-02'
          }
        ];
        setCandidates(sampleCandidates);
        localStorage.setItem('talentflow_candidates', JSON.stringify(sampleCandidates));
      }

      if (savedInterviews) {
        setInterviews(JSON.parse(savedInterviews));
      } else {
        // Initialize with sample data
        const sampleInterviews: Interview[] = [
          {
            id: '1',
            candidateId: '1',
            jobId: '1',
            type: 'Technical',
            round: 2,
            scheduledDate: '2025-06-12T14:00:00',
            duration: 60,
            interviewer: 'Tech Lead',
            meetingLink: 'https://meet.google.com/abc-def-ghi',
            status: 'Scheduled',
            feedback: '',
            rating: 0,
            notes: '',
            nextSteps: ''
          }
        ];
        setInterviews(sampleInterviews);
        localStorage.setItem('talentflow_interviews', JSON.stringify(sampleInterviews));
      }

      if (savedOnboarding) {
        setOnboardingTasks(JSON.parse(savedOnboarding));
      } else {
        // Initialize with sample data
        const sampleOnboarding: OnboardingTask[] = [
          {
            id: '1',
            candidateId: '1',
            task: 'Setup laptop and development environment',
            category: 'Equipment',
            assignedTo: 'IT Department',
            dueDate: '2025-06-15',
            status: 'Pending',
            priority: 'High',
            notes: 'MacBook Pro with standard dev setup'
          }
        ];
        setOnboardingTasks(sampleOnboarding);
        localStorage.setItem('talentflow_onboarding', JSON.stringify(sampleOnboarding));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = (type: string, data: any) => {
    try {
      localStorage.setItem(`talentflow_${type}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalRequisitions = requisitions.length;
    const activeRequisitions = requisitions.filter(r => r.status === 'Open').length;
    const totalCandidates = candidates.length;
    const newCandidates = candidates.filter(c => new Date(c.dateApplied) >= oneWeekAgo).length;
    const interviewsThisWeek = interviews.filter(i => new Date(i.scheduledDate) >= oneWeekAgo).length;
    const hiredThisMonth = candidates.filter(c => c.status === 'Hired' && new Date(c.lastContact) >= oneMonthAgo).length;

    const sourceBreakdown = candidates.reduce((acc, candidate) => {
      acc[candidate.source] = (acc[candidate.source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const statusDistribution = candidates.reduce((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    setAnalytics({
      totalRequisitions,
      activeRequisitions,
      totalCandidates,
      newCandidates,
      interviewsThisWeek,
      hiredThisMonth,
      timeToHire: 18, // Average days
      sourceBreakdown,
      statusDistribution
    });
  };

  // AI Handlers
  const handleResumeAnalysis = async (file: File) => {
    setSelectedFile(file);
    setAiError(null);
    setAiResult(null);

    const prompt = `Analyze this resume and extract candidate information. Return JSON with keys: "firstName", "lastName", "email", "phone", "location", "currentTitle", "currentCompany", "experience", "education", "skills" (as array), "summary"`;

    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError('Failed to analyze resume');
    }
  };

  const handleJobDescriptionOptimization = async (description: string) => {
    setAiError(null);
    setAiResult(null);

    const prompt = `Optimize this job description for better candidate attraction and SEO. Provide suggestions for improvement. Job Description: ${description}`;

    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to optimize job description');
    }
  };

  const processAIResult = (result: string) => {
    try {
      // Try to parse as JSON first
      const jsonResult = JSON.parse(result);
      if (jsonResult.firstName && activeTab === 'candidates') {
        // Auto-fill candidate form
        setCandidateForm({
          ...candidateForm,
          firstName: jsonResult.firstName || '',
          lastName: jsonResult.lastName || '',
          email: jsonResult.email || '',
          phone: jsonResult.phone || '',
          location: jsonResult.location || '',
          currentTitle: jsonResult.currentTitle || '',
          currentCompany: jsonResult.currentCompany || '',
          experience: jsonResult.experience || 0,
          education: jsonResult.education || '',
          skills: jsonResult.skills || [],
          notes: jsonResult.summary || ''
        });
        setShowCandidateModal(true);
      }
    } catch (error) {
      // If not JSON, treat as markdown text
      setAiResult(result);
    }
  };

  // CRUD Operations
  const createRequisition = () => {
    const newRequisition: JobRequisition = {
      id: Date.now().toString(),
      title: requisitionForm.title || '',
      department: requisitionForm.department || '',
      location: requisitionForm.location || '',
      type: requisitionForm.type || 'Full-time',
      level: requisitionForm.level || 'Mid',
      description: requisitionForm.description || '',
      requirements: requisitionForm.requirements || [],
      salary: requisitionForm.salary || { min: 0, max: 0, currency: 'USD' },
      hiringManager: requisitionForm.hiringManager || currentUser?.first_name + ' ' + currentUser?.last_name || '',
      status: requisitionForm.status || 'Draft',
      priority: requisitionForm.priority || 'Medium',
      openings: requisitionForm.openings || 1,
      dateCreated: new Date().toISOString().split('T')[0],
      dateUpdated: new Date().toISOString().split('T')[0],
      deadline: requisitionForm.deadline || ''
    };

    const updatedRequisitions = [...requisitions, newRequisition];
    setRequisitions(updatedRequisitions);
    saveData('requisitions', updatedRequisitions);
    setRequisitionForm({});
    setShowRequisitionModal(false);
  };

  const createCandidate = () => {
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      firstName: candidateForm.firstName || '',
      lastName: candidateForm.lastName || '',
      email: candidateForm.email || '',
      phone: candidateForm.phone || '',
      location: candidateForm.location || '',
      currentTitle: candidateForm.currentTitle || '',
      currentCompany: candidateForm.currentCompany || '',
      experience: candidateForm.experience || 0,
      education: candidateForm.education || '',
      skills: candidateForm.skills || [],
      appliedJobs: candidateForm.appliedJobs || [],
      status: candidateForm.status || 'New',
      stage: candidateForm.stage || 'Application Review',
      rating: candidateForm.rating || 0,
      notes: candidateForm.notes || '',
      source: candidateForm.source || 'Website',
      dateApplied: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0]
    };

    const updatedCandidates = [...candidates, newCandidate];
    setCandidates(updatedCandidates);
    saveData('candidates', updatedCandidates);
    setCandidateForm({});
    setShowCandidateModal(false);
  };

  const createInterview = () => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      candidateId: interviewForm.candidateId || '',
      jobId: interviewForm.jobId || '',
      type: interviewForm.type || 'Phone',
      round: interviewForm.round || 1,
      scheduledDate: interviewForm.scheduledDate || '',
      duration: interviewForm.duration || 60,
      interviewer: interviewForm.interviewer || '',
      location: interviewForm.location || '',
      meetingLink: interviewForm.meetingLink || '',
      status: interviewForm.status || 'Scheduled',
      feedback: interviewForm.feedback || '',
      rating: interviewForm.rating || 0,
      notes: interviewForm.notes || '',
      nextSteps: interviewForm.nextSteps || ''
    };

    const updatedInterviews = [...interviews, newInterview];
    setInterviews(updatedInterviews);
    saveData('interviews', updatedInterviews);
    setInterviewForm({});
    setShowInterviewModal(false);
  };

  const createOnboardingTask = () => {
    const newTask: OnboardingTask = {
      id: Date.now().toString(),
      candidateId: onboardingForm.candidateId || '',
      task: onboardingForm.task || '',
      category: onboardingForm.category || 'Documentation',
      assignedTo: onboardingForm.assignedTo || '',
      dueDate: onboardingForm.dueDate || '',
      status: onboardingForm.status || 'Pending',
      priority: onboardingForm.priority || 'Medium',
      notes: onboardingForm.notes || ''
    };

    const updatedTasks = [...onboardingTasks, newTask];
    setOnboardingTasks(updatedTasks);
    saveData('onboarding', updatedTasks);
    setOnboardingForm({});
    setShowOnboardingModal(false);
  };

  const deleteItem = (type: string, id: string) => {
    switch (type) {
      case 'requisition':
        const updatedRequisitions = requisitions.filter(r => r.id !== id);
        setRequisitions(updatedRequisitions);
        saveData('requisitions', updatedRequisitions);
        break;
      case 'candidate':
        const updatedCandidates = candidates.filter(c => c.id !== id);
        setCandidates(updatedCandidates);
        saveData('candidates', updatedCandidates);
        break;
      case 'interview':
        const updatedInterviews = interviews.filter(i => i.id !== id);
        setInterviews(updatedInterviews);
        saveData('interviews', updatedInterviews);
        break;
      case 'onboarding':
        const updatedTasks = onboardingTasks.filter(t => t.id !== id);
        setOnboardingTasks(updatedTasks);
        saveData('onboarding', updatedTasks);
        break;
    }
  };

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'object' ? JSON.stringify(value) : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    localStorage.removeItem('talentflow_requisitions');
    localStorage.removeItem('talentflow_candidates');
    localStorage.removeItem('talentflow_interviews');
    localStorage.removeItem('talentflow_onboarding');
    setRequisitions([]);
    setCandidates([]);
    setInterviews([]);
    setOnboardingTasks([]);
  };

  // Filter and sort functions
  const getFilteredAndSortedData = (data: any[], searchFields: string[]) => {
    let filtered = data;

    if (searchTerm) {
      filtered = data.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });
  };

  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="heading-2">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-caption">Welcome back, {currentUser?.first_name}</span>
          <button onClick={logout} className="btn btn-ghost btn-sm">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-title">Active Requisitions</p>
                  <p className="stat-value">{analytics.activeRequisitions}</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary-500" />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-title">Total Candidates</p>
                  <p className="stat-value">{analytics.totalCandidates}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-title">Interviews This Week</p>
                  <p className="stat-value">{analytics.interviewsThisWeek}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-title">Hired This Month</p>
                  <p className="stat-value">{analytics.hiredThisMonth}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Candidate Sources</h3>
              <div className="space-y-3">
                {Object.entries(analytics.sourceBreakdown).map(([source, count]) => (
                  <div key={source} className="flex-between">
                    <span className="text-sm">{source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(count / analytics.totalCandidates) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Candidate Status</h3>
              <div className="space-y-3">
                {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex-between">
                    <span className="text-sm">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(count / analytics.totalCandidates) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card card-padding">
            <h3 className="heading-5 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {candidates.slice(0, 5).map(candidate => (
                <div key={candidate.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                    <p className="text-sm text-gray-600">Applied for {requisitions.find(r => candidate.appliedJobs.includes(r.id))?.title || 'Unknown Position'}</p>
                  </div>
                  <span className={`badge ${candidate.status === 'Hired' ? 'badge-success' : candidate.status === 'Interview' ? 'badge-warning' : 'badge-gray'}`}>
                    {candidate.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderRequisitions = () => (
    <div id="requisitions-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="heading-2">Job Requisitions</h1>
        <button 
          onClick={() => setShowRequisitionModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Requisition
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card card-padding">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Open">Open</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
          <button
            onClick={() => exportToCSV(requisitions, 'requisitions')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Requisitions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getFilteredAndSortedData(requisitions, ['title', 'department', 'hiringManager']).map(req => (
          <div key={req.id} className="card card-padding space-y-4">
            <div className="flex-between">
              <h3 className="heading-5">{req.title}</h3>
              <span className={`badge ${
                req.status === 'Open' ? 'badge-success' : 
                req.status === 'Draft' ? 'badge-gray' : 
                req.status === 'On Hold' ? 'badge-warning' : 'badge-error'
              }`}>
                {req.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                {req.department}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {req.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {req.hiringManager}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                {req.openings} openings
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`badge ${
                req.priority === 'Urgent' ? 'badge-error' : 
                req.priority === 'High' ? 'badge-warning' : 
                req.priority === 'Medium' ? 'badge-primary' : 'badge-gray'
              }`}>
                {req.priority}
              </span>
              <span className="text-sm text-gray-500">
                Due: {new Date(req.deadline).toLocaleDateString()}
              </span>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button 
                onClick={() => {
                  setEditingItem(req);
                  setRequisitionForm(req);
                  setShowRequisitionModal(true);
                }}
                className="btn btn-ghost btn-sm"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteItem('requisition', req.id)}
                className="btn btn-ghost btn-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleJobDescriptionOptimization(req.description)}
                className="btn btn-ghost btn-sm text-blue-600"
              >
                <Star className="w-4 h-4" />
                Optimize
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div id="candidates-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="heading-2">Candidates</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleResumeAnalysis(file);
              }
            }}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="btn btn-secondary">
            <Upload className="w-4 h-4" />
            Upload Resume
          </label>
          <button 
            onClick={() => setShowCandidateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card card-padding">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="New">New</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={() => exportToCSV(candidates, 'candidates')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {getFilteredAndSortedData(candidates, ['firstName', 'lastName', 'email', 'currentTitle']).map(candidate => (
          <div key={candidate.id} className="card card-padding space-y-4">
            <div className="flex-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                  <p className="text-sm text-gray-600">{candidate.currentTitle}</p>
                </div>
              </div>
              <span className={`badge ${
                candidate.status === 'Hired' ? 'badge-success' : 
                candidate.status === 'Interview' ? 'badge-warning' : 
                candidate.status === 'Rejected' ? 'badge-error' : 'badge-gray'
              }`}>
                {candidate.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {candidate.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {candidate.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                {candidate.currentCompany}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {candidate.experience} years experience
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${star <= candidate.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">({candidate.rating}/5)</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map(skill => (
                <span key={skill} className="badge badge-gray text-xs">
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="badge badge-gray text-xs">
                  +{candidate.skills.length - 3} more
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button 
                onClick={() => {
                  setEditingItem(candidate);
                  setCandidateForm(candidate);
                  setShowCandidateModal(true);
                }}
                className="btn btn-ghost btn-sm"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteItem('candidate', candidate.id)}
                className="btn btn-ghost btn-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setInterviewForm({ candidateId: candidate.id });
                  setShowInterviewModal(true);
                }}
                className="btn btn-ghost btn-sm text-blue-600"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterviews = () => (
    <div id="interviews-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="heading-2">Interviews</h1>
        <button 
          onClick={() => setShowInterviewModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Interviews Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Candidate</th>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Interviewer</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {interviews.map(interview => {
                const candidate = candidates.find(c => c.id === interview.candidateId);
                const job = requisitions.find(r => r.id === interview.jobId);
                return (
                  <tr key={interview.id} className="table-row">
                    <td className="table-cell">
                      {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown'}
                    </td>
                    <td className="table-cell">{job?.title || 'Unknown'}</td>
                    <td className="table-cell">
                      <span className="badge badge-primary">{interview.type}</span>
                    </td>
                    <td className="table-cell">
                      {new Date(interview.scheduledDate).toLocaleString()}
                    </td>
                    <td className="table-cell">{interview.interviewer}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        interview.status === 'Completed' ? 'badge-success' : 
                        interview.status === 'Cancelled' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingItem(interview);
                            setInterviewForm(interview);
                            setShowInterviewModal(true);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteItem('interview', interview.id)}
                          className="btn btn-ghost btn-sm text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
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

  const renderOnboarding = () => (
    <div id="onboarding-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="heading-2">Onboarding</h1>
        <button 
          onClick={() => setShowOnboardingModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Onboarding Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {onboardingTasks.map(task => {
          const candidate = candidates.find(c => c.id === task.candidateId);
          return (
            <div key={task.id} className="card card-padding space-y-4">
              <div className="flex-between">
                <h3 className="font-semibold">{task.task}</h3>
                <span className={`badge ${
                  task.status === 'Completed' ? 'badge-success' : 
                  task.status === 'Overdue' ? 'badge-error' : 
                  task.status === 'In Progress' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {task.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  {task.assignedTo}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`badge ${
                  task.priority === 'High' ? 'badge-error' : 
                  task.priority === 'Medium' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {task.priority}
                </span>
                <span className="badge badge-primary">{task.category}</span>
              </div>

              {task.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {task.notes}
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <button 
                  onClick={() => {
                    setEditingItem(task);
                    setOnboardingForm(task);
                    setShowOnboardingModal(true);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteItem('onboarding', task.id)}
                  className="btn btn-ghost btn-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h1 className="heading-2">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Management */}
        <div className="card card-padding space-y-4">
          <h3 className="heading-5">Data Management</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => exportToCSV(requisitions, 'all-requisitions')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export Requisitions
            </button>
            
            <button
              onClick={() => exportToCSV(candidates, 'all-candidates')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export Candidates
            </button>
            
            <button
              onClick={() => exportToCSV(interviews, 'all-interviews')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export Interviews
            </button>

            <button
              onClick={clearAllData}
              className="btn btn-error w-full"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* AI Features */}
        <div className="card card-padding space-y-4">
          <h3 className="heading-5">AI Features</h3>
          
          <div className="space-y-3">
            <div className="form-group">
              <label className="form-label">AI Assistant</label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ask the AI assistant anything about recruitment..."
                className="textarea"
                rows={3}
              />
            </div>

            <button
              onClick={() => {
                if (promptText.trim()) {
                  setAiError(null);
                  setAiResult(null);
                  aiLayerRef.current?.sendToAI(promptText);
                }
              }}
              disabled={!promptText.trim() || isAiLoading}
              className="btn btn-primary w-full"
            >
              {isAiLoading ? 'Processing...' : 'Ask AI'}
            </button>

            {aiResult && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">AI Response:</h4>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiResult.replace(/\n/g, '<br>') }} />
              </div>
            )}

            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="w-4 h-4" />
                {aiError.toString()}
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="card card-padding space-y-4">
          <h3 className="heading-5">System Information</h3>
          
          <div className="space-y-2">
            <div className="flex-between">
              <span className="text-sm text-gray-600">Total Requisitions:</span>
              <span className="font-medium">{requisitions.length}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-gray-600">Total Candidates:</span>
              <span className="font-medium">{candidates.length}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-gray-600">Total Interviews:</span>
              <span className="font-medium">{interviews.length}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-gray-600">Onboarding Tasks:</span>
              <span className="font-medium">{onboardingTasks.length}</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="card card-padding space-y-4">
          <h3 className="heading-5">User Profile</h3>
          
          <div className="space-y-2">
            <div className="flex-between">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="font-medium">{currentUser?.first_name} {currentUser?.last_name}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="font-medium">{currentUser?.email}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-gray-600">Role:</span>
              <span className="font-medium">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Components
  const RequisitionModal = () => (
    showRequisitionModal && (
      <div className="modal-backdrop" onClick={() => setShowRequisitionModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="heading-4">{editingItem ? 'Edit Requisition' : 'New Requisition'}</h2>
            <button 
              onClick={() => setShowRequisitionModal(false)}
              className="btn btn-ghost btn-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Job Title</label>
                <input
                  type="text"
                  value={requisitionForm.title || ''}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, title: e.target.value })}
                  className="input"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label form-label-required">Department</label>
                <input
                  type="text"
                  value={requisitionForm.department || ''}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, department: e.target.value })}
                  className="input"
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={requisitionForm.location || ''}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, location: e.target.value })}
                  className="input"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  value={requisitionForm.type || 'Full-time'}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, type: e.target.value as JobRequisition['type'] })}
                  className="select"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea
                value={requisitionForm.description || ''}
                onChange={(e) => setRequisitionForm({ ...requisitionForm, description: e.target.value })}
                className="textarea"
                rows={4}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={requisitionForm.priority || 'Medium'}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, priority: e.target.value as JobRequisition['priority'] })}
                  className="select"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Openings</label>
                <input
                  type="number"
                  value={requisitionForm.openings || 1}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, openings: parseInt(e.target.value) })}
                  className="input"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input
                  type="date"
                  value={requisitionForm.deadline || ''}
                  onChange={(e) => setRequisitionForm({ ...requisitionForm, deadline: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              onClick={() => setShowRequisitionModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={createRequisition}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Create'} Requisition
            </button>
          </div>
        </div>
      </div>
    )
  );

  const CandidateModal = () => (
    showCandidateModal && (
      <div className="modal-backdrop" onClick={() => setShowCandidateModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="heading-4">{editingItem ? 'Edit Candidate' : 'New Candidate'}</h2>
            <button 
              onClick={() => setShowCandidateModal(false)}
              className="btn btn-ghost btn-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">First Name</label>
                <input
                  type="text"
                  value={candidateForm.firstName || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label form-label-required">Last Name</label>
                <input
                  type="text"
                  value={candidateForm.lastName || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Email</label>
                <input
                  type="email"
                  value={candidateForm.email || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={candidateForm.phone || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Current Title</label>
                <input
                  type="text"
                  value={candidateForm.currentTitle || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, currentTitle: e.target.value })}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Current Company</label>
                <input
                  type="text"
                  value={candidateForm.currentCompany || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, currentCompany: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                value={candidateForm.notes || ''}
                onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                className="textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              onClick={() => setShowCandidateModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={createCandidate}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Add'} Candidate
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAIResult(result);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="navbar shadow-sm">
        <div className="container flex-between">
          <div className="flex items-center gap-4">
            <h1 className="heading-4 text-primary-600">TalentFlow</h1>
            <span className="badge badge-primary">Recruitment Management</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {currentUser?.first_name}
            </span>
            <button onClick={logout} className="btn btn-ghost btn-sm">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="container">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'requisitions', label: 'Requisitions', icon: FileText },
              { id: 'candidates', label: 'Candidates', icon: Users },
              { id: 'interviews', label: 'Interviews', icon: Calendar },
              { id: 'onboarding', label: 'Onboarding', icon: CheckCircle },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="generation_issue_fallback" className="container py-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requisitions' && renderRequisitions()}
        {activeTab === 'candidates' && renderCandidates()}
        {activeTab === 'interviews' && renderInterviews()}
        {activeTab === 'onboarding' && renderOnboarding()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      <RequisitionModal />
      <CandidateModal />

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="modal-backdrop" onClick={() => setShowInterviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-4">Schedule Interview</h2>
              <button 
                onClick={() => setShowInterviewModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Candidate</label>
                  <select
                    value={interviewForm.candidateId || ''}
                    onChange={(e) => setInterviewForm({ ...interviewForm, candidateId: e.target.value })}
                    className="select"
                  >
                    <option value="">Select Candidate</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.firstName} {candidate.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Interview Type</label>
                  <select
                    value={interviewForm.type || 'Phone'}
                    onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value as Interview['type'] })}
                    className="select"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Video">Video</option>
                    <option value="In-person">In-person</option>
                    <option value="Technical">Technical</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewForm.scheduledDate || ''}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    value={interviewForm.duration || 60}
                    onChange={(e) => setInterviewForm({ ...interviewForm, duration: parseInt(e.target.value) })}
                    className="input"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interviewer</label>
                <input
                  type="text"
                  value={interviewForm.interviewer || ''}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowInterviewModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={createInterview}
                className="btn btn-primary"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div className="modal-backdrop" onClick={() => setShowOnboardingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-4">Add Onboarding Task</h2>
              <button 
                onClick={() => setShowOnboardingModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Task</label>
                <input
                  type="text"
                  value={onboardingForm.task || ''}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, task: e.target.value })}
                  className="input"
                  placeholder="e.g. Setup development environment"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={onboardingForm.category || 'Documentation'}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, category: e.target.value as OnboardingTask['category'] })}
                    className="select"
                  >
                    <option value="Documentation">Documentation</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Training">Training</option>
                    <option value="Meeting">Meeting</option>
                    <option value="System Access">System Access</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={onboardingForm.priority || 'Medium'}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, priority: e.target.value as OnboardingTask['priority'] })}
                    className="select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input
                  type="text"
                  value={onboardingForm.assignedTo || ''}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, assignedTo: e.target.value })}
                  className="input"
                  placeholder="e.g. IT Department"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  value={onboardingForm.dueDate || ''}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, dueDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowOnboardingModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={createOnboardingTask}
                className="btn btn-primary"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-4">
        <div className="container text-center">
          <p className="text-sm text-gray-600">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;