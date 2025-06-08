import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChartBar,
  Settings,
  X,
  ChevronDown,
  Building,
  Mail,
  Phone,
  MapPin,
  Star,
  Target,
  Award,
  Calendar as CalendarIcon,
  User,
  Briefcase,
  GraduationCap,
  MessageCircle,
  CreditCard,
  LogOut
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';

// Types and Interfaces
interface Requisition {
  id: string;
  title: string;
  department: string;
  hiringManager: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'filled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  positions: number;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'intern';
  salaryRange: { min: number; max: number };
  description: string;
  requirements: string[];
  createdDate: string;
  targetDate: string;
  filledPositions: number;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  requisitionId: string;
  status: 'applied' | 'screening' | 'interview' | 'selected' | 'rejected' | 'hired' | 'onboarding';
  source: string;
  appliedDate: string;
  resumeContent?: string;
  skills: string[];
  experience: number;
  education: string;
  currentCompany?: string;
  currentRole?: string;
  expectedSalary?: number;
  notes: string;
  rating: number;
}

interface Interview {
  id: string;
  candidateId: string;
  requisitionId: string;
  type: 'phone' | 'video' | 'onsite' | 'technical';
  round: number;
  scheduledDate: string;
  duration: number;
  interviewer: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  rating?: number;
  recommendation: 'hire' | 'reject' | 'maybe' | 'pending';
  location?: string;
  meetingLink?: string;
}

interface OnboardingTask {
  id: string;
  candidateId: string;
  task: string;
  category: 'documentation' | 'equipment' | 'training' | 'orientation' | 'compliance';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

interface OnboardingCandidate extends Candidate {
  startDate: string;
  onboardingTasks: OnboardingTask[];
  onboardingProgress: number;
}

type ActiveTab = 'dashboard' | 'requisitions' | 'candidates' | 'interviews' | 'onboarding' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [onboardingCandidates, setOnboardingCandidates] = useState<OnboardingCandidate[]>([]);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'requisition' | 'candidate' | 'interview' | 'onboarding'>('requisition');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Form State
  const [requisitionForm, setRequisitionForm] = useState<Partial<Requisition>>({});
  const [candidateForm, setCandidateForm] = useState<Partial<Candidate>>({});
  const [interviewForm, setInterviewForm] = useState<Partial<Interview>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRequisitions = localStorage.getItem('ta_requisitions');
    const savedCandidates = localStorage.getItem('ta_candidates');
    const savedInterviews = localStorage.getItem('ta_interviews');
    const savedOnboarding = localStorage.getItem('ta_onboarding');

    if (savedRequisitions) setRequisitions(JSON.parse(savedRequisitions));
    if (savedCandidates) setCandidates(JSON.parse(savedCandidates));
    if (savedInterviews) setInterviews(JSON.parse(savedInterviews));
    if (savedOnboarding) setOnboardingCandidates(JSON.parse(savedOnboarding));

    // Initialize with sample data if empty
    if (!savedRequisitions) {
      const sampleRequisitions: Requisition[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          hiringManager: 'John Smith',
          status: 'active',
          priority: 'high',
          positions: 2,
          location: 'San Francisco, CA',
          jobType: 'full-time',
          salaryRange: { min: 120000, max: 160000 },
          description: 'We are looking for an experienced software engineer...',
          requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
          createdDate: '2025-05-15',
          targetDate: '2025-07-15',
          filledPositions: 0
        },
        {
          id: '2',
          title: 'UX Designer',
          department: 'Design',
          hiringManager: 'Sarah Johnson',
          status: 'active',
          priority: 'medium',
          positions: 1,
          location: 'Remote',
          jobType: 'full-time',
          salaryRange: { min: 80000, max: 110000 },
          description: 'Join our design team to create amazing user experiences...',
          requirements: ['Figma', 'Adobe Creative Suite', 'User Research', '3+ years experience'],
          createdDate: '2025-05-20',
          targetDate: '2025-08-01',
          filledPositions: 0
        }
      ];
      setRequisitions(sampleRequisitions);
      localStorage.setItem('ta_requisitions', JSON.stringify(sampleRequisitions));
    }

    if (!savedCandidates) {
      const sampleCandidates: Candidate[] = [
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@email.com',
          phone: '+1-555-0123',
          location: 'San Francisco, CA',
          requisitionId: '1',
          status: 'interview',
          source: 'LinkedIn',
          appliedDate: '2025-05-25',
          skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
          experience: 6,
          education: 'BS Computer Science - Stanford University',
          currentCompany: 'Tech Corp',
          currentRole: 'Software Engineer',
          expectedSalary: 140000,
          notes: 'Strong technical background, excellent communication skills',
          rating: 4.5
        },
        {
          id: '2',
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@email.com',
          phone: '+1-555-0124',
          location: 'Austin, TX',
          requisitionId: '2',
          status: 'screening',
          source: 'Company Website',
          appliedDate: '2025-05-28',
          skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
          experience: 4,
          education: 'MFA Design - Art Institute',
          currentCompany: 'Design Studio',
          currentRole: 'UX Designer',
          expectedSalary: 95000,
          notes: 'Creative portfolio, strong user research background',
          rating: 4.2
        }
      ];
      setCandidates(sampleCandidates);
      localStorage.setItem('ta_candidates', JSON.stringify(sampleCandidates));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('ta_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  useEffect(() => {
    localStorage.setItem('ta_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('ta_interviews', JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem('ta_onboarding', JSON.stringify(onboardingCandidates));
  }, [onboardingCandidates]);

  // AI Functions
  const handleAiAnalysis = (type: 'resume' | 'job-description' | 'interview-questions') => {
    let prompt = '';
    
    switch (type) {
      case 'resume':
        prompt = 'Analyze this resume and extract candidate information. Return JSON with keys: "firstName", "lastName", "email", "phone", "location", "skills", "experience", "education", "currentCompany", "currentRole", "summary"';
        break;
      case 'job-description':
        prompt = 'Analyze this job description and extract key requirements. Return JSON with keys: "title", "department", "requirements", "skills", "experience", "education", "summary"';
        break;
      case 'interview-questions':
        prompt = 'Generate 10 interview questions based on this job role and requirements. Return JSON with keys: "technical", "behavioral", "situational" arrays';
        break;
    }

    if (!prompt.trim() && !selectedFile) {
      setAiError("Please provide input or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const parseAiCandidateResult = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      const newCandidate: Partial<Candidate> = {
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        location: parsed.location || '',
        skills: parsed.skills || [],
        experience: parsed.experience || 0,
        education: parsed.education || '',
        currentCompany: parsed.currentCompany || '',
        currentRole: parsed.currentRole || '',
        notes: parsed.summary || ''
      };
      setCandidateForm(prev => ({ ...prev, ...newCandidate }));
      setShowAiPanel(false);
    } catch {
      // Handle as text if JSON parsing fails
      setCandidateForm(prev => ({ ...prev, notes: result }));
    }
  };

  // CRUD Operations
  const createRequisition = (data: Partial<Requisition>) => {
    const newRequisition: Requisition = {
      id: Date.now().toString(),
      title: data.title || '',
      department: data.department || '',
      hiringManager: data.hiringManager || currentUser?.first_name + ' ' + currentUser?.last_name || '',
      status: 'draft',
      priority: data.priority || 'medium',
      positions: data.positions || 1,
      location: data.location || '',
      jobType: data.jobType || 'full-time',
      salaryRange: data.salaryRange || { min: 0, max: 0 },
      description: data.description || '',
      requirements: data.requirements || [],
      createdDate: format(new Date(), 'yyyy-MM-dd'),
      targetDate: data.targetDate || format(addDays(new Date(), 60), 'yyyy-MM-dd'),
      filledPositions: 0
    };
    setRequisitions(prev => [...prev, newRequisition]);
  };

  const updateRequisition = (id: string, data: Partial<Requisition>) => {
    setRequisitions(prev => prev.map(req => req.id === id ? { ...req, ...data } : req));
  };

  const deleteRequisition = (id: string) => {
    setRequisitions(prev => prev.filter(req => req.id !== id));
    setCandidates(prev => prev.filter(cand => cand.requisitionId !== id));
  };

  const createCandidate = (data: Partial<Candidate>) => {
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      location: data.location || '',
      requisitionId: data.requisitionId || '',
      status: 'applied',
      source: data.source || 'Direct',
      appliedDate: format(new Date(), 'yyyy-MM-dd'),
      skills: data.skills || [],
      experience: data.experience || 0,
      education: data.education || '',
      currentCompany: data.currentCompany || '',
      currentRole: data.currentRole || '',
      expectedSalary: data.expectedSalary || 0,
      notes: data.notes || '',
      rating: data.rating || 0
    };
    setCandidates(prev => [...prev, newCandidate]);
  };

  const updateCandidate = (id: string, data: Partial<Candidate>) => {
    setCandidates(prev => prev.map(cand => cand.id === id ? { ...cand, ...data } : cand));
  };

  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(cand => cand.id !== id));
    setInterviews(prev => prev.filter(int => int.candidateId !== id));
  };

  const createInterview = (data: Partial<Interview>) => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      candidateId: data.candidateId || '',
      requisitionId: data.requisitionId || '',
      type: data.type || 'phone',
      round: data.round || 1,
      scheduledDate: data.scheduledDate || '',
      duration: data.duration || 60,
      interviewer: data.interviewer || currentUser?.first_name + ' ' + currentUser?.last_name || '',
      status: 'scheduled',
      recommendation: 'pending',
      location: data.location || '',
      meetingLink: data.meetingLink || ''
    };
    setInterviews(prev => [...prev, newInterview]);
  };

  const updateInterview = (id: string, data: Partial<Interview>) => {
    setInterviews(prev => prev.map(int => int.id === id ? { ...int, ...data } : int));
  };

  // File Operations
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const downloadTemplate = (type: 'candidates' | 'requisitions') => {
    let csvContent = '';
    
    if (type === 'candidates') {
      csvContent = 'firstName,lastName,email,phone,location,requisitionId,source,skills,experience,education,currentCompany,currentRole,expectedSalary,notes\n';
      csvContent += 'John,Doe,john.doe@email.com,+1-555-0123,New York NY,1,LinkedIn,"JavaScript,React,Node.js",5,BS Computer Science,TechCorp,Senior Developer,120000,Excellent candidate';
    } else {
      csvContent = 'title,department,hiringManager,priority,positions,location,jobType,salaryMin,salaryMax,description,requirements,targetDate\n';
      csvContent += 'Software Engineer,Engineering,John Smith,high,2,San Francisco CA,full-time,100000,150000,Looking for experienced developer,"React,TypeScript,Node.js",2025-08-01';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportData = (type: 'candidates' | 'requisitions' | 'interviews') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'candidates':
        data = candidates;
        filename = 'candidates.csv';
        break;
      case 'requisitions':
        data = requisitions;
        filename = 'requisitions.csv';
        break;
      case 'interviews':
        data = interviews;
        filename = 'interviews.csv';
        break;
    }

    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Modal handlers
  const openModal = (type: 'requisition' | 'candidate' | 'interview' | 'onboarding', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'requisition') {
      setRequisitionForm(item || {});
    } else if (type === 'candidate') {
      setCandidateForm(item || {});
    } else if (type === 'interview') {
      setInterviewForm(item || {});
    }
    
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setRequisitionForm({});
    setCandidateForm({});
    setInterviewForm({});
    document.body.classList.remove('modal-open');
  };

  const confirmDelete = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Statistics
  const stats = {
    totalRequisitions: requisitions.length,
    activeRequisitions: requisitions.filter(r => r.status === 'active').length,
    totalCandidates: candidates.length,
    interviewsScheduled: interviews.filter(i => i.status === 'scheduled').length,
    hiresThisMonth: candidates.filter(c => c.status === 'hired' && 
      new Date(c.appliedDate).getMonth() === new Date().getMonth()).length,
    onboardingProgress: onboardingCandidates.length
  };

  // Filtered data
  const filteredRequisitions = requisitions.filter(req => 
    (filterStatus === 'all' || req.status === filterStatus) &&
    (req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     req.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCandidates = candidates.filter(cand => 
    (filterStatus === 'all' || cand.status === filterStatus) &&
    (cand.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cand.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cand.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInterviews = interviews.filter(int => {
    const candidate = candidates.find(c => c.id === int.candidateId);
    return (filterStatus === 'all' || int.status === filterStatus) &&
           (candidate?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            int.interviewer.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Tab Navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'requisitions', label: 'Requisitions', icon: FileText },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
    { id: 'reports', label: 'Reports', icon: ChartBar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderDashboard = () => (
    <div id="welcome_fallback" className="space-y-6">
      <div className="flex-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.first_name}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Here's your hiring pipeline overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <button
          onClick={() => setShowAiPanel(true)}
          className="btn btn-primary flex items-center gap-2"
          id="ai-assistant-button"
        >
          <MessageCircle className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Active Requisitions</div>
              <div className="stat-value">{stats.activeRequisitions}</div>
              <div className="stat-desc">of {stats.totalRequisitions} total</div>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Total Candidates</div>
              <div className="stat-value">{stats.totalCandidates}</div>
              <div className="stat-desc">in pipeline</div>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Interviews Scheduled</div>
              <div className="stat-value">{stats.interviewsScheduled}</div>
              <div className="stat-desc">this week</div>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Hires This Month</div>
              <div className="stat-value">{stats.hiresThisMonth}</div>
              <div className="stat-desc">new team members</div>
            </div>
            <UserPlus className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Requisitions</h3>
          <div className="space-y-3">
            {requisitions.slice(0, 5).map(req => (
              <div key={req.id} className="flex-between p-3 border rounded-lg dark:border-slate-600">
                <div>
                  <div className="font-medium">{req.title}</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">{req.department}</div>
                </div>
                <span className={`badge ${
                  req.status === 'active' ? 'badge-success' :
                  req.status === 'pending' ? 'badge-warning' : 'badge-info'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Candidates</h3>
          <div className="space-y-3">
            {candidates.slice(0, 5).map(cand => (
              <div key={cand.id} className="flex-between p-3 border rounded-lg dark:border-slate-600">
                <div>
                  <div className="font-medium">{cand.firstName} {cand.lastName}</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">{cand.email}</div>
                </div>
                <span className={`badge ${
                  cand.status === 'hired' ? 'badge-success' :
                  cand.status === 'interview' ? 'badge-info' : 'badge-warning'
                }`}>
                  {cand.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequisitions = () => (
    <div id="requisitions-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl font-bold">Job Requisitions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => downloadTemplate('requisitions')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => exportData('requisitions')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal('requisition')}
            className="btn btn-primary flex items-center gap-2"
            id="create-requisition-button"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search requisitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="filled">Filled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Requisitions List */}
      <div className="grid gap-4">
        {filteredRequisitions.map(req => (
          <div key={req.id} className="card border-l-4 border-l-blue-500">
            <div className="flex-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{req.title}</h3>
                  <span className={`badge ${
                    req.status === 'active' ? 'badge-success' :
                    req.status === 'pending' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {req.status}
                  </span>
                  <span className={`badge ${
                    req.priority === 'urgent' ? 'badge-error' :
                    req.priority === 'high' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {req.priority}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {req.department}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {req.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {req.hiringManager}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {req.positions} positions
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    ${req.salaryRange.min.toLocaleString()} - ${req.salaryRange.max.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal('requisition', req)}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  aria-label="Edit requisition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(
                    `Are you sure you want to delete "${req.title}"?`,
                    () => deleteRequisition(req.id)
                  )}
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                  aria-label="Delete requisition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div id="candidates-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <div className="flex gap-2">
          <button
            onClick={() => downloadTemplate('candidates')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => exportData('candidates')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal('candidate')}
            className="btn btn-primary flex items-center gap-2"
            id="add-candidate-button"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="interview">Interview</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
      </div>

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map(cand => {
          const requisition = requisitions.find(req => req.id === cand.requisitionId);
          return (
            <div key={cand.id} className="card border-l-4 border-l-green-500">
              <div className="flex-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{cand.firstName} {cand.lastName}</h3>
                    <span className={`badge ${
                      cand.status === 'hired' ? 'badge-success' :
                      cand.status === 'interview' ? 'badge-info' :
                      cand.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {cand.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{cand.rating}/5</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {cand.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {cand.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {cand.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {cand.experience} years
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Applied for: </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {requisition?.title || 'Unknown Position'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      Skills: {cand.skills.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('interview', { candidateId: cand.id, requisitionId: cand.requisitionId })}
                    className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                    aria-label="Schedule interview"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal('candidate', cand)}
                    className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    aria-label="Edit candidate"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(
                      `Are you sure you want to delete ${cand.firstName} ${cand.lastName}?`,
                      () => deleteCandidate(cand.id)
                    )}
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                    aria-label="Delete candidate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderInterviews = () => (
    <div id="interviews-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl font-bold">Interviews</h1>
        <button
          onClick={() => openModal('interview')}
          className="btn btn-primary flex items-center gap-2"
          id="schedule-interview-button"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>

      {/* Interviews List */}
      <div className="grid gap-4">
        {filteredInterviews.map(interview => {
          const candidate = candidates.find(c => c.id === interview.candidateId);
          const requisition = requisitions.find(r => r.id === interview.requisitionId);
          return (
            <div key={interview.id} className="card border-l-4 border-l-purple-500">
              <div className="flex-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {candidate?.firstName} {candidate?.lastName}
                    </h3>
                    <span className={`badge ${
                      interview.status === 'completed' ? 'badge-success' :
                      interview.status === 'scheduled' ? 'badge-info' :
                      interview.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {interview.status}
                    </span>
                    <span className="badge badge-info">
                      Round {interview.round}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {format(parseISO(interview.scheduledDate), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {interview.interviewer}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {interview.duration} mins
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {interview.type}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Position: </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {requisition?.title || 'Unknown Position'}
                    </span>
                  </div>
                  {interview.feedback && (
                    <div className="mt-1">
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        Feedback: {interview.feedback.substring(0, 100)}...
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('interview', interview)}
                    className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    aria-label="Edit interview"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(
                      `Are you sure you want to delete this interview?`,
                      () => setInterviews(prev => prev.filter(i => i.id !== interview.id))
                    )}
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                    aria-label="Delete interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderOnboarding = () => (
    <div id="onboarding-tab" className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            // Move hired candidates to onboarding
            const hiredCandidates = candidates.filter(c => c.status === 'hired');
            const newOnboardingCandidates = hiredCandidates.map(cand => ({
              ...cand,
              startDate: format(new Date(), 'yyyy-MM-dd'),
              onboardingTasks: [
                { id: '1', candidateId: cand.id, task: 'Complete I-9 Form', category: 'documentation' as const, status: 'pending' as const, assignedTo: 'HR', dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
                { id: '2', candidateId: cand.id, task: 'Setup Computer Account', category: 'equipment' as const, status: 'pending' as const, assignedTo: 'IT', dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd') },
                { id: '3', candidateId: cand.id, task: 'Complete Orientation', category: 'orientation' as const, status: 'pending' as const, assignedTo: 'HR', dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd') }
              ],
              onboardingProgress: 0
            }));
            setOnboardingCandidates(prev => [...prev, ...newOnboardingCandidates]);
          }}
          id="sync-onboarding-button"
        >
          <UserPlus className="w-4 h-4" />
          Sync Hired Candidates
        </button>
      </div>

      {/* Onboarding List */}
      <div className="grid gap-6">
        {onboardingCandidates.map(candidate => (
          <div key={candidate.id} className="card border-l-4 border-l-orange-500">
            <div className="flex-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                <p className="text-gray-600 dark:text-slate-400">Start Date: {format(parseISO(candidate.startDate), 'MMM dd, yyyy')}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-slate-400">Progress</div>
                <div className="text-2xl font-bold text-orange-600">{candidate.onboardingProgress}%</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-4">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${candidate.onboardingProgress}%` }}
              ></div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {candidate.onboardingTasks.map(task => (
                <div key={task.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const updatedTasks = candidate.onboardingTasks.map(t =>
                          t.id === task.id 
                            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' as const }
                            : t
                        );
                        const completedCount = updatedTasks.filter(t => t.status === 'completed').length;
                        const progress = Math.round((completedCount / updatedTasks.length) * 100);
                        
                        setOnboardingCandidates(prev => prev.map(c =>
                          c.id === candidate.id 
                            ? { ...c, onboardingTasks: updatedTasks, onboardingProgress: progress }
                            : c
                        ));
                      }}
                      className={`w-5 h-5 rounded border-2 flex-center ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 dark:border-slate-500'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div>
                      <div className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.task}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        Assigned to: {task.assignedTo} | Due: {format(parseISO(task.dueDate), 'MMM dd')}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${
                    task.status === 'completed' ? 'badge-success' :
                    task.status === 'in-progress' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {onboardingCandidates.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Onboarding Candidates</h3>
          <p className="text-gray-500 dark:text-slate-400">Sync hired candidates to start the onboarding process.</p>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div id="reports-tab" className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-title">Average Time to Hire</div>
          <div className="stat-value">24 days</div>
          <div className="stat-desc">↓ 3 days from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Offer Acceptance Rate</div>
          <div className="stat-value">87%</div>
          <div className="stat-desc">↑ 5% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Cost per Hire</div>
          <div className="stat-value">$3,240</div>
          <div className="stat-desc">↓ $180 from last month</div>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Hiring Pipeline Funnel</h3>
        <div className="space-y-4">
          {[
            { stage: 'Applications Received', count: candidates.length, color: 'bg-blue-500' },
            { stage: 'Phone Screening', count: candidates.filter(c => c.status === 'screening').length, color: 'bg-green-500' },
            { stage: 'Interviews', count: candidates.filter(c => c.status === 'interview').length, color: 'bg-yellow-500' },
            { stage: 'Offers Extended', count: candidates.filter(c => c.status === 'selected').length, color: 'bg-purple-500' },
            { stage: 'Hired', count: candidates.filter(c => c.status === 'hired').length, color: 'bg-orange-500' }
          ].map((stage, index) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">{stage.stage}</div>
              <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6">
                <div 
                  className={`${stage.color} h-6 rounded-full flex-center text-white text-sm font-medium`}
                  style={{ width: `${Math.max((stage.count / candidates.length) * 100, 10)}%` }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Requisitions by Department</h3>
          <div className="space-y-3">
            {Object.entries(
              requisitions.reduce((acc, req) => {
                acc[req.department] = (acc[req.department] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([dept, count]) => (
              <div key={dept} className="flex-between">
                <span className="font-medium">{dept}</span>
                <span className="badge badge-info">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Candidate Sources</h3>
          <div className="space-y-3">
            {Object.entries(
              candidates.reduce((acc, cand) => {
                acc[cand.source] = (acc[cand.source] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([source, count]) => (
              <div key={source} className="flex-between">
                <span className="font-medium">{source}</span>
                <span className="badge badge-success">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="grid gap-6">
        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex-between">
              <div>
                <h4 className="font-medium">Export All Data</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Download all recruitment data as CSV files</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportData('requisitions')}
                  className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Requisitions
                </button>
                <button
                  onClick={() => exportData('candidates')}
                  className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                >
                  Candidates
                </button>
                <button
                  onClick={() => exportData('interviews')}
                  className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  Interviews
                </button>
              </div>
            </div>
            
            <div className="flex-between border-t pt-4 dark:border-slate-600">
              <div>
                <h4 className="font-medium text-red-600">Clear All Data</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Permanently delete all recruitment data</p>
              </div>
              <button
                onClick={() => confirmDelete(
                  'Are you sure you want to delete ALL recruitment data? This action cannot be undone.',
                  () => {
                    setRequisitions([]);
                    setCandidates([]);
                    setInterviews([]);
                    setOnboardingCandidates([]);
                    localStorage.removeItem('ta_requisitions');
                    localStorage.removeItem('ta_candidates');
                    localStorage.removeItem('ta_interviews');
                    localStorage.removeItem('ta_onboarding');
                  }
                )}
                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Requisitions:</span>
              <span className="ml-2">{requisitions.length}</span>
            </div>
            <div>
              <span className="font-medium">Total Candidates:</span>
              <span className="ml-2">{candidates.length}</span>
            </div>
            <div>
              <span className="font-medium">Total Interviews:</span>
              <span className="ml-2">{interviews.length}</span>
            </div>
            <div>
              <span className="font-medium">Onboarding:</span>
              <span className="ml-2">{onboardingCandidates.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (modalType === 'requisition') {
        if (editingItem) {
          updateRequisition(editingItem.id, requisitionForm);
        } else {
          createRequisition(requisitionForm);
        }
      } else if (modalType === 'candidate') {
        if (editingItem) {
          updateCandidate(editingItem.id, candidateForm);
        } else {
          createCandidate(candidateForm);
        }
      } else if (modalType === 'interview') {
        if (editingItem) {
          updateInterview(editingItem.id, interviewForm);
        } else {
          createInterview(interviewForm);
        }
      }
      
      closeModal();
    };

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">
              {editingItem ? 'Edit' : 'Create'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType === 'requisition' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={requisitionForm.title || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      required
                      value={requisitionForm.department || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, department: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={requisitionForm.priority || 'medium'}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Positions</label>
                    <input
                      type="number"
                      min="1"
                      value={requisitionForm.positions || 1}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, positions: parseInt(e.target.value) }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select
                      value={requisitionForm.jobType || 'full-time'}
                      onChange={(e) => setRequisitionForm(prev => ({ ...prev, jobType: e.target.value as any }))}
                      className="input"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Min Salary</label>
                    <input
                      type="number"
                      value={requisitionForm.salaryRange?.min || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ 
                        ...prev, 
                        salaryRange: { ...prev.salaryRange, min: parseInt(e.target.value) || 0, max: prev.salaryRange?.max || 0 }
                      }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Salary</label>
                    <input
                      type="number"
                      value={requisitionForm.salaryRange?.max || ''}
                      onChange={(e) => setRequisitionForm(prev => ({ 
                        ...prev, 
                        salaryRange: { min: prev.salaryRange?.min || 0, max: parseInt(e.target.value) || 0 }
                      }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea
                    rows={4}
                    value={requisitionForm.description || ''}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    placeholder="Describe the role, responsibilities, and what we're looking for..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements (comma-separated)</label>
                  <input
                    type="text"
                    value={requisitionForm.requirements?.join(', ') || ''}
                    onChange={(e) => setRequisitionForm(prev => ({ 
                      ...prev, 
                      requirements: e.target.value.split(',').map(req => req.trim()).filter(req => req)
                    }))}
                    className="input"
                    placeholder="e.g., React, TypeScript, 5+ years experience"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Fill Date</label>
                  <input
                    type="date"
                    value={requisitionForm.targetDate || ''}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="input"
                  />
                </div>
              </>
            )}

            {modalType === 'candidate' && (
              <>
                <div className="flex-between mb-4">
                  <h4 className="font-medium">Candidate Information</h4>
                  <button
                    type="button"
                    onClick={() => setShowAiPanel(true)}
                    className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    AI Parse Resume
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      required
                      value={candidateForm.firstName || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={candidateForm.lastName || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      required
                      value={candidateForm.email || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={candidateForm.phone || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={candidateForm.location || ''}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Position Applied For *</label>
                    <select
                      required
                      value={candidateForm.requisitionId || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, requisitionId: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Position</option>
                      {requisitions.filter(req => req.status === 'active').map(req => (
                        <option key={req.id} value={req.id}>{req.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select
                      value={candidateForm.source || 'Direct'}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, source: e.target.value }))}
                      className="input"
                    >
                      <option value="Direct">Direct Application</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Indeed">Indeed</option>
                      <option value="Referral">Employee Referral</option>
                      <option value="Recruiter">External Recruiter</option>
                      <option value="Job Fair">Job Fair</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={candidateForm.experience || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Salary</label>
                    <input
                      type="number"
                      value={candidateForm.expectedSalary || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, expectedSalary: parseInt(e.target.value) || 0 }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={candidateForm.skills?.join(', ') || ''}
                    onChange={(e) => setCandidateForm(prev => ({ 
                      ...prev, 
                      skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                    }))}
                    className="input"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input
                    type="text"
                    value={candidateForm.education || ''}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, education: e.target.value }))}
                    className="input"
                    placeholder="e.g., BS Computer Science - Stanford University"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Current Company</label>
                    <input
                      type="text"
                      value={candidateForm.currentCompany || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, currentCompany: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Role</label>
                    <input
                      type="text"
                      value={candidateForm.currentRole || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, currentRole: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    rows={3}
                    value={candidateForm.notes || ''}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    placeholder="Additional notes about the candidate..."
                  />
                </div>
              </>
            )}

            {modalType === 'interview' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Candidate *</label>
                    <select
                      required
                      value={interviewForm.candidateId || ''}
                      onChange={(e) => {
                        const candidate = candidates.find(c => c.id === e.target.value);
                        setInterviewForm(prev => ({ 
                          ...prev, 
                          candidateId: e.target.value,
                          requisitionId: candidate?.requisitionId || ''
                        }));
                      }}
                      className="input"
                    >
                      <option value="">Select Candidate</option>
                      {candidates.filter(c => ['applied', 'screening', 'interview'].includes(c.status)).map(cand => (
                        <option key={cand.id} value={cand.id}>
                          {cand.firstName} {cand.lastName} - {requisitions.find(r => r.id === cand.requisitionId)?.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interview Type</label>
                    <select
                      value={interviewForm.type || 'phone'}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="input"
                    >
                      <option value="phone">Phone</option>
                      <option value="video">Video</option>
                      <option value="onsite">Onsite</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Round</label>
                    <input
                      type="number"
                      min="1"
                      value={interviewForm.round || 1}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, round: parseInt(e.target.value) || 1 }))}
                      className="input"
                    />
                  </div>
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
                    <label className="form-label">Status</label>
                    <select
                      value={interviewForm.status || 'scheduled'}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="input"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewForm.scheduledDate || ''}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interviewer</label>
                  <input
                    type="text"
                    value={interviewForm.interviewer || currentUser?.first_name + ' ' + currentUser?.last_name || ''}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewer: e.target.value }))}
                    className="input"
                  />
                </div>

                {(interviewForm.type === 'onsite' || interviewForm.type === 'video') && (
                  <div className="form-group">
                    <label className="form-label">
                      {interviewForm.type === 'onsite' ? 'Location' : 'Meeting Link'}
                    </label>
                    <input
                      type={interviewForm.type === 'video' ? 'url' : 'text'}
                      value={interviewForm.type === 'onsite' ? interviewForm.location || '' : interviewForm.meetingLink || ''}
                      onChange={(e) => setInterviewForm(prev => ({ 
                        ...prev, 
                        [interviewForm.type === 'onsite' ? 'location' : 'meetingLink']: e.target.value 
                      }))}
                      className="input"
                      placeholder={interviewForm.type === 'onsite' ? 'Conference Room A, 2nd Floor' : 'https://zoom.us/j/...'}
                    />
                  </div>
                )}

                {interviewForm.status === 'completed' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Rating (1-5)</label>
                      <select
                        value={interviewForm.rating || ''}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) || 0 }))}
                        className="input"
                      >
                        <option value="">Select Rating</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Below Average</option>
                        <option value="3">3 - Average</option>
                        <option value="4">4 - Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Recommendation</label>
                      <select
                        value={interviewForm.recommendation || 'pending'}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, recommendation: e.target.value as any }))}
                        className="input"
                      >
                        <option value="pending">Pending</option>
                        <option value="hire">Hire</option>
                        <option value="reject">Reject</option>
                        <option value="maybe">Maybe</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Feedback</label>
                      <textarea
                        rows={4}
                        value={interviewForm.feedback || ''}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                        className="input"
                        placeholder="Interview feedback, strengths, areas of concern..."
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAiPanel = () => {
    if (!showAiPanel) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowAiPanel(false)}>
        <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">AI Assistant</h3>
            <button onClick={() => setShowAiPanel(false)} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Upload Resume or Job Description</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="input"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Or enter text manually</label>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="input"
                placeholder="Paste resume content or job description here..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAiAnalysis('resume')}
                disabled={isAiLoading || (!selectedFile && !aiPrompt.trim())}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                Parse Resume
              </button>
              <button
                onClick={() => handleAiAnalysis('job-description')}
                disabled={isAiLoading || (!selectedFile && !aiPrompt.trim())}
                className="btn bg-purple-600 text-white hover:bg-purple-700 flex-1 flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Analyze Job
              </button>
            </div>

            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="w-5 h-5" />
                <p>{aiError.toString()}</p>
              </div>
            )}

            {aiResult && (
              <div className="space-y-3">
                <div className="alert alert-success">
                  <CheckCircle className="w-5 h-5" />
                  <p>Analysis completed successfully!</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{aiResult}</pre>
                </div>
                {modalType === 'candidate' && (
                  <button
                    onClick={() => parseAiCandidateResult(aiResult)}
                    className="btn btn-primary w-full"
                  >
                    Apply to Form
                  </button>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-slate-400">
              <p>💡 The AI can help extract information from resumes and job descriptions. Results may need review and adjustment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowConfirmDialog(false)}>
        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">Confirm Action</h3>
            <button onClick={() => setShowConfirmDialog(false)} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4">
            <p className="text-gray-600 dark:text-slate-400">{confirmMessage}</p>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModal();
        if (showAiPanel) setShowAiPanel(false);
        if (showConfirmDialog) setShowConfirmDialog(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal, showAiPanel, showConfirmDialog]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="generation_issue_fallback">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TalentTracker Pro
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400">
                Welcome, {currentUser?.first_name}
              </span>
              <button
                onClick={logout}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                id={`${tab.id}-tab`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requisitions' && renderRequisitions()}
        {activeTab === 'candidates' && renderCandidates()}
        {activeTab === 'interviews' && renderInterviews()}
        {activeTab === 'onboarding' && renderOnboarding()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Modals */}
      {renderModal()}
      {renderAiPanel()}
      {renderConfirmDialog()}
    </div>
  );
};

export default App;