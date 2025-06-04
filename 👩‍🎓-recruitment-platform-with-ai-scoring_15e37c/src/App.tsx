import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, Plus, Search, Filter, Eye, Download, Upload, Settings,
  Briefcase, Users, FileText, BarChart3, Edit, Trash2, Star,
  Clock, CheckCircle, XCircle, ChevronDown, ArrowUp, ArrowDown,
  Send, Calendar, Building, MapPin, DollarSign, Target, Brain,
  Zap, LogOut, Menu, X, Award, Gauge, TrendingUp
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  posted: string;
  status: 'active' | 'closed' | 'draft';
  applications: number;
}

interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  coverLetter?: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  matchScore?: number;
  skills?: string[];
  experience?: string;
  parsedData?: any;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  timeLimit?: number;
  passingScore?: number;
  created: string;
  jobIds: string[];
}

interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'text' | 'code' | 'file-upload' | 'rating';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  required: boolean;
}

type ViewType = 'dashboard' | 'jobs' | 'applications' | 'assessments' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Main state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  
  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // Form states
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as const,
    salary: '',
    description: '',
    requirements: '',
    skills: '',
    experience: ''
  });
  
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    timeLimit: '',
    passingScore: '',
    questions: [] as AssessmentQuestion[]
  });
  
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple-choice' as const,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    required: true
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    saveData();
  }, [jobs, applications, assessments]);

  const loadData = () => {
    try {
      const savedJobs = localStorage.getItem('recruitment_jobs');
      const savedApplications = localStorage.getItem('recruitment_applications');
      const savedAssessments = localStorage.getItem('recruitment_assessments');
      
      if (savedJobs) setJobs(JSON.parse(savedJobs));
      if (savedApplications) setApplications(JSON.parse(savedApplications));
      if (savedAssessments) setAssessments(JSON.parse(savedAssessments));
      
      // Add sample data if empty
      if (!savedJobs) {
        const sampleJobs: Job[] = [
          {
            id: '1',
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            type: 'full-time',
            salary: '$120,000 - $150,000',
            description: 'We are looking for a senior software engineer to join our team.',
            requirements: ['5+ years experience', 'React expertise', 'Node.js knowledge'],
            skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
            experience: '5+ years',
            posted: '2025-05-20',
            status: 'active',
            applications: 12
          },
          {
            id: '2',
            title: 'Product Manager',
            company: 'Startup Inc',
            location: 'Remote',
            type: 'remote',
            salary: '$90,000 - $120,000',
            description: 'Product manager to drive product strategy.',
            requirements: ['3+ years PM experience', 'Agile methodology', 'Stakeholder management'],
            skills: ['Product Strategy', 'Agile', 'Data Analysis'],
            experience: '3+ years',
            posted: '2025-05-15',
            status: 'active',
            applications: 8
          }
        ];
        setJobs(sampleJobs);
      }
      
      if (!savedApplications) {
        const sampleApplications: Application[] = [
          {
            id: '1',
            jobId: '1',
            candidateName: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0123',
            appliedDate: '2025-05-22',
            status: 'new',
            matchScore: 85,
            skills: ['React', 'Node.js', 'JavaScript'],
            experience: '6 years'
          },
          {
            id: '2',
            jobId: '1',
            candidateName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1-555-0124',
            appliedDate: '2025-05-21',
            status: 'shortlisted',
            matchScore: 92,
            skills: ['React', 'TypeScript', 'AWS', 'Node.js'],
            experience: '7 years'
          }
        ];
        setApplications(sampleApplications);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('recruitment_jobs', JSON.stringify(jobs));
      localStorage.setItem('recruitment_applications', JSON.stringify(applications));
      localStorage.setItem('recruitment_assessments', JSON.stringify(assessments));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleCreateJob = () => {
    if (!jobForm.title || !jobForm.company) return;
    
    const newJob: Job = {
      id: Date.now().toString(),
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location,
      type: jobForm.type,
      salary: jobForm.salary,
      description: jobForm.description,
      requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
      skills: jobForm.skills.split(',').map(s => s.trim()).filter(s => s),
      experience: jobForm.experience,
      posted: new Date().toISOString().split('T')[0],
      status: 'active',
      applications: 0
    };
    
    if (editingJob) {
      setJobs(prev => prev.map(job => job.id === editingJob.id ? { ...newJob, id: editingJob.id } : job));
    } else {
      setJobs(prev => [...prev, newJob]);
    }
    
    resetJobForm();
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    setApplications(prev => prev.filter(app => app.jobId !== jobId));
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      company: '',
      location: '',
      type: 'full-time',
      salary: '',
      description: '',
      requirements: '',
      skills: '',
      experience: ''
    });
    setEditingJob(null);
    setShowJobModal(false);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements.join('\n'),
      skills: job.skills.join(', '),
      experience: job.experience
    });
    setShowJobModal(true);
  };

  const handleFileUpload = async (file: File, applicationId?: string) => {
    setSelectedFile(file);
    
    if (applicationId) {
      const application = applications.find(app => app.id === applicationId);
      const job = jobs.find(j => j.id === application?.jobId);
      
      if (application && job) {
        const prompt = `Analyze this resume and extract key information. Compare it with the job requirements and calculate a match score (0-100%). Job requirements: ${job.requirements.join(', ')}. Required skills: ${job.skills.join(', ')}. Required experience: ${job.experience}. Return JSON with keys: "skills", "experience", "matchScore", "summary", "education", "contact".`;
        
        setAiPrompt(prompt);
        
        try {
          aiLayerRef.current?.sendToAI(prompt, file);
        } catch (error) {
          setAiError('Failed to process resume');
        }
      }
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    
    try {
      const parsedData = JSON.parse(result);
      
      if (selectedApplication) {
        setApplications(prev => prev.map(app => 
          app.id === selectedApplication.id 
            ? {
                ...app,
                matchScore: parsedData.matchScore || 0,
                skills: parsedData.skills || [],
                experience: parsedData.experience || '',
                parsedData
              }
            : app
        ));
      }
    } catch (error) {
      console.error('Error parsing AI result:', error);
    }
  };

  const handleCreateAssessment = () => {
    if (!assessmentForm.title) return;
    
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      title: assessmentForm.title,
      description: assessmentForm.description,
      questions: assessmentForm.questions,
      timeLimit: assessmentForm.timeLimit ? parseInt(assessmentForm.timeLimit) : undefined,
      passingScore: assessmentForm.passingScore ? parseInt(assessmentForm.passingScore) : undefined,
      created: new Date().toISOString().split('T')[0],
      jobIds: []
    };
    
    if (editingAssessment) {
      setAssessments(prev => prev.map(assessment => 
        assessment.id === editingAssessment.id 
          ? { ...newAssessment, id: editingAssessment.id }
          : assessment
      ));
    } else {
      setAssessments(prev => [...prev, newAssessment]);
    }
    
    resetAssessmentForm();
  };

  const resetAssessmentForm = () => {
    setAssessmentForm({
      title: '',
      description: '',
      timeLimit: '',
      passingScore: '',
      questions: []
    });
    setEditingAssessment(null);
    setShowAssessmentModal(false);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question) return;
    
    const question: AssessmentQuestion = {
      id: Date.now().toString(),
      type: newQuestion.type,
      question: newQuestion.question,
      options: newQuestion.type === 'multiple-choice' ? newQuestion.options.filter(o => o.trim()) : undefined,
      correctAnswer: newQuestion.correctAnswer,
      points: newQuestion.points,
      required: newQuestion.required
    };
    
    setAssessmentForm(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));
    
    setNewQuestion({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      required: true
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setAssessmentForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleUpdateApplicationStatus = (applicationId: string, status: Application['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status } : app
    ));
  };

  const exportData = () => {
    const data = {
      jobs,
      applications,
      assessments,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setJobs([]);
      setApplications([]);
      setAssessments([]);
      localStorage.removeItem('recruitment_jobs');
      localStorage.removeItem('recruitment_applications');
      localStorage.removeItem('recruitment_assessments');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = applications.length;
    const newApplications = applications.filter(app => app.status === 'new').length;
    const shortlistedCandidates = applications.filter(app => app.status === 'shortlisted').length;
    const avgMatchScore = applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length)
      : 0;
    
    return {
      totalJobs,
      activeJobs,
      totalApplications,
      newApplications,
      shortlistedCandidates,
      avgMatchScore
    };
  };

  const stats = getStats();

  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('jobs')}
            className="btn btn-primary btn-sm"
            id="create-job-quick"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stat-card" id="total-jobs-stat">
          <div className="flex-between">
            <div>
              <div className="stat-title">Total Jobs</div>
              <div className="stat-value">{stats.totalJobs}</div>
              <div className="stat-desc">{stats.activeJobs} active</div>
            </div>
            <Briefcase className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Applications</div>
              <div className="stat-value">{stats.totalApplications}</div>
              <div className="stat-desc">{stats.newApplications} new</div>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Shortlisted</div>
              <div className="stat-value">{stats.shortlistedCandidates}</div>
              <div className="stat-desc">Ready for interview</div>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Avg Match Score</div>
              <div className="stat-value">{stats.avgMatchScore}%</div>
              <div className="stat-desc">AI-powered matching</div>
            </div>
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Assessments</div>
              <div className="stat-value">{assessments.length}</div>
              <div className="stat-desc">Created</div>
            </div>
            <FileText className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Success Rate</div>
              <div className="stat-value">87%</div>
              <div className="stat-desc">Hiring efficiency</div>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {applications.slice(0, 5).map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">{app.candidateName}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{job?.title}</p>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      app.status === 'new' ? 'badge-info' :
                      app.status === 'shortlisted' ? 'badge-success' :
                      app.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {app.status}
                    </div>
                    {app.matchScore && (
                      <p className="text-sm mt-1">{app.matchScore}% match</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Active Jobs</h3>
          <div className="space-y-3">
            {jobs.filter(job => job.status === 'active').slice(0, 5).map(job => (
              <div key={job.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{job.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{job.applications} applications</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Posted {job.posted}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Job Postings</h1>
        <button
          onClick={() => setShowJobModal(true)}
          className="btn btn-primary"
          id="create-job-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              id="job-search"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex-between mb-3">
              <div className={`badge ${
                job.status === 'active' ? 'badge-success' :
                job.status === 'closed' ? 'badge-error' : 'badge-warning'
              }`}>
                {job.status}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditJob(job)}
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-2">{job.company}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                <DollarSign className="w-4 h-4 mr-2" />
                {job.salary}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-2" />
                Posted {job.posted}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 3).map(skill => (
                <span key={skill} className="badge badge-info text-xs">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs text-gray-500">+{job.skills.length - 3} more</span>
              )}
            </div>
            
            <div className="flex-between">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {job.applications} applications
              </span>
              <button
                onClick={() => {
                  setCurrentView('applications');
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                View Applications
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">No jobs found</p>
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const newApp: Application = {
                  id: Date.now().toString(),
                  jobId: jobs[0]?.id || '',
                  candidateName: 'Manual Upload',
                  email: '',
                  phone: '',
                  resumeFile: file,
                  appliedDate: new Date().toISOString().split('T')[0],
                  status: 'new'
                };
                setApplications(prev => [...prev, newApp]);
                handleFileUpload(file, newApp.id);
              }
            }}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="btn btn-primary cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Resume
          </label>
        </div>
      </div>
      
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
              id="application-search"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Match Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredApplications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.candidateName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {app.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {job?.title || 'Unknown Job'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.matchScore ? (
                        <div className="flex items-center">
                          <div className={`w-12 h-2 rounded-full mr-2 ${
                            app.matchScore >= 80 ? 'bg-green-500' :
                            app.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm">{app.matchScore}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not analyzed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value as Application['status'])}
                        className={`text-xs px-2 py-1 rounded-full border-none ${
                          app.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          app.status === 'shortlisted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {app.appliedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowApplicationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.resumeFile && (
                        <button
                          onClick={() => handleFileUpload(app.resumeFile!, app.id)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Re-analyze with AI"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">No applications found</p>
        </div>
      )}
    </div>
  );

  const renderAssessments = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Assessments</h1>
        <button
          onClick={() => setShowAssessmentModal(true)}
          className="btn btn-primary"
          id="create-assessment-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map(assessment => (
          <div key={assessment.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex-between mb-3">
              <div className="badge badge-info">
                {assessment.questions.length} questions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingAssessment(assessment);
                    setAssessmentForm({
                      title: assessment.title,
                      description: assessment.description,
                      timeLimit: assessment.timeLimit?.toString() || '',
                      passingScore: assessment.passingScore?.toString() || '',
                      questions: assessment.questions
                    });
                    setShowAssessmentModal(true);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setAssessments(prev => prev.filter(a => a.id !== assessment.id));
                  }}
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{assessment.title}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-4 text-sm">
              {assessment.description}
            </p>
            
            <div className="space-y-2 mb-4">
              {assessment.timeLimit && (
                <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {assessment.timeLimit} minutes
                </div>
              )}
              {assessment.passingScore && (
                <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                  <Target className="w-4 h-4 mr-2" />
                  {assessment.passingScore}% to pass
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-2" />
                Created {assessment.created}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Question Types:</p>
              <div className="flex flex-wrap gap-1">
                {[...new Set(assessment.questions.map(q => q.type))].map(type => (
                  <span key={type} className="badge badge-success text-xs">
                    {type.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {assessments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">No assessments created yet</p>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Export All Data</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Download all your recruitment data as a backup
              </p>
              <button
                onClick={exportData}
                className="btn bg-green-600 text-white hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
            
            <div>
              <label className="form-label">Clear All Data</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Permanently delete all jobs, applications, and assessments
              </p>
              <button
                onClick={clearAllData}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Resume Screening</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                AI automatically analyzes resumes and calculates match scores
              </p>
              <div className="badge badge-success">Enabled</div>
            </div>
            
            <div>
              <label className="form-label">Matching Criteria</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Skills, experience, and requirements are analyzed for job matching
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-info">Skills</span>
                <span className="badge badge-info">Experience</span>
                <span className="badge badge-info">Education</span>
                <span className="badge badge-info">Keywords</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Platform Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Job Boards</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Jobs can be synced with external job boards
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-warning">LinkedIn (Coming Soon)</span>
                <span className="badge badge-warning">Indeed (Coming Soon)</span>
                <span className="badge badge-warning">Glassdoor (Coming Soon)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">User</label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {currentUser?.first_name} {currentUser?.last_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {currentUser?.email}
              </p>
            </div>
            
            <button
              onClick={logout}
              className="btn bg-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'jobs':
        return renderJobs();
      case 'applications':
        return renderApplications();
      case 'assessments':
        return renderAssessments();
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <div className="card text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-gray-500 dark:text-slate-400">
                Detailed recruitment metrics and insights will be available in future updates.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex-center bg-gray-50 dark:bg-slate-900">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Recruitment Platform</h2>
          <p className="text-gray-600 dark:text-slate-400">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="generation_issue_fallback">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">RecruitPro</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:block">
                Welcome, {currentUser.first_name}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 min-h-screen theme-transition`}>
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'jobs', icon: Briefcase, label: 'Jobs' },
              { id: 'applications', icon: Users, label: 'Applications' },
              { id: 'assessments', icon: FileText, label: 'Assessments' },
              { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as ViewType);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                  id={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="container-fluid py-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Job Modal */}
      {showJobModal && (
        <div className="modal-backdrop" onClick={() => resetJobForm()}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h3>
              <button onClick={resetJobForm}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    value={jobForm.company}
                    onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                    className="input"
                    placeholder="e.g. Tech Corp"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                    className="input"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                    className="input"
                    placeholder="e.g. $80,000 - $120,000"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input
                    type="text"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="input"
                    placeholder="e.g. 3-5 years"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={4}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Requirements (one per line)</label>
                <textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="5+ years experience\nBachelor's degree\nReact expertise"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                  className="input"
                  placeholder="React, Node.js, TypeScript, AWS"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={resetJobForm}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                disabled={!jobForm.title || !jobForm.company}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="modal-backdrop" onClick={() => setShowApplicationModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Application Details</h3>
              <button onClick={() => setShowApplicationModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Candidate Name</label>
                  <p className="text-sm">{selectedApplication.candidateName}</p>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
              </div>
              
              {selectedApplication.phone && (
                <div>
                  <label className="form-label">Phone</label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
              )}
              
              {selectedApplication.matchScore && (
                <div>
                  <label className="form-label">AI Match Score</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-full h-3 rounded-full ${
                      selectedApplication.matchScore >= 80 ? 'bg-green-500' :
                      selectedApplication.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} style={{ width: `${selectedApplication.matchScore}%` }} />
                    <span className="text-sm font-medium">{selectedApplication.matchScore}%</span>
                  </div>
                </div>
              )}
              
              {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                <div>
                  <label className="form-label">Extracted Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.map(skill => (
                      <span key={skill} className="badge badge-info">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedApplication.experience && (
                <div>
                  <label className="form-label">Experience</label>
                  <p className="text-sm">{selectedApplication.experience}</p>
                </div>
              )}
              
              {selectedApplication.parsedData?.summary && (
                <div>
                  <label className="form-label">AI Summary</label>
                  <p className="text-sm">{selectedApplication.parsedData.summary}</p>
                </div>
              )}
              
              {selectedApplication.resumeFile && (
                <div>
                  <label className="form-label">Resume</label>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{selectedApplication.resumeFile.name}</span>
                    <button
                      onClick={() => handleFileUpload(selectedApplication.resumeFile!, selectedApplication.id)}
                      className="btn btn-sm btn-primary ml-auto"
                      disabled={isAiLoading}
                    >
                      {isAiLoading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-1" />
                          Re-analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <div className="modal-backdrop" onClick={() => resetAssessmentForm()}>
          <div className="modal-content max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
              </h3>
              <button onClick={resetAssessmentForm}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Assessment Title *</label>
                  <input
                    type="text"
                    value={assessmentForm.title}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="e.g. Technical Assessment"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={assessmentForm.timeLimit}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, timeLimit: e.target.value }))}
                    className="input"
                    placeholder="60"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={assessmentForm.description}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Describe what this assessment evaluates..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assessmentForm.passingScore}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, passingScore: e.target.value }))}
                    className="input"
                    placeholder="70"
                  />
                </div>
              </div>
              
              {/* Questions Section */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Questions ({assessmentForm.questions.length})</h4>
                
                {/* Existing Questions */}
                {assessmentForm.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 mb-4">
                    <div className="flex-between mb-2">
                      <span className="text-sm font-medium">Question {index + 1}</span>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm mb-2">{question.question}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="badge badge-info">{question.type}</span>
                      <span className="badge badge-success">{question.points} pts</span>
                      {question.required && <span className="badge badge-warning">Required</span>}
                    </div>
                  </div>
                ))}
                
                {/* Add New Question */}
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4">
                  <h5 className="font-medium mb-3">Add New Question</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">Question Type</label>
                      <select
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as AssessmentQuestion['type'] }))}
                        className="input"
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="text">Text Answer</option>
                        <option value="code">Code</option>
                        <option value="file-upload">File Upload</option>
                        <option value="rating">Rating Scale</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Points</label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestion.points}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Question Text *</label>
                    <textarea
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      className="input"
                      rows={2}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  
                  {newQuestion.type === 'multiple-choice' && (
                    <div className="form-group">
                      <label className="form-label">Options</label>
                      {newQuestion.options.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="input mb-2"
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newQuestion.required}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                        className="mr-2"
                      />
                      Required
                    </label>
                    
                    <button
                      onClick={handleAddQuestion}
                      disabled={!newQuestion.question}
                      className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={resetAssessmentForm}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssessment}
                disabled={!assessmentForm.title || assessmentForm.questions.length === 0}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;