import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, UserPlus, LogOut, Settings, Briefcase, FileText, Users,
  Search, Filter, Plus, Edit, Trash2, Eye, Download, Upload,
  Calendar, MapPin, DollarSign, Star, Clock, CheckCircle,
  AlertCircle, TrendingUp, BarChart3, Target, Award, Send,
  Brain, FileCheck, Gauge, Tags, Building, Phone, Mail,
  GraduationCap, Home, ChevronDown, ChevronUp
} from 'lucide-react';
import styles from './styles/styles.module.css';

type UserRole = 'recruiter' | 'candidate';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  skills: string[];
  requirements: string;
  companyName: string;
  postedDate: string;
  deadline: string;
  type: string;
  assessmentId?: string;
  recruiterId: string;
}

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  resumeText: string;
  coverLetter: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  matchPercentage?: number;
  assessmentScore?: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  timeLimit: number;
  recruiterId: string;
  createdDate: string;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'coding';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface AssessmentResponse {
  applicationId: string;
  responses: { questionId: string; answer: string }[];
  score: number;
  completedDate: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Current page state
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('recruiter');

  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentResponses, setAssessmentResponses] = useState<AssessmentResponse[]>([]);

  // UI states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Form states
  const [jobForm, setJobForm] = useState<Partial<Job>>({});
  const [applicationForm, setApplicationForm] = useState<Partial<Application>>({});
  const [assessmentForm, setAssessmentForm] = useState<Partial<Assessment>>({});

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobs');
    const savedApplications = localStorage.getItem('applications');
    const savedAssessments = localStorage.getItem('assessments');
    const savedResponses = localStorage.getItem('assessmentResponses');
    const savedRole = localStorage.getItem('userRole');

    if (savedJobs) setJobs(JSON.parse(savedJobs));
    if (savedApplications) setApplications(JSON.parse(savedApplications));
    if (savedAssessments) setAssessments(JSON.parse(savedAssessments));
    if (savedResponses) setAssessmentResponses(JSON.parse(savedResponses));
    if (savedRole) setUserRole(savedRole as UserRole);

    // Add sample data if none exists
    if (!savedJobs) {
      const sampleJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          description: 'We are looking for an experienced Frontend Developer with expertise in React, TypeScript, and modern web technologies.',
          location: 'San Francisco, CA',
          salary: '$120,000 - $150,000',
          skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js'],
          requirements: 'Bachelor\'s degree in Computer Science or related field. 5+ years of experience in frontend development.',
          companyName: 'TechCorp Inc.',
          postedDate: '2025-06-01',
          deadline: '2025-06-30',
          type: 'Full-time',
          recruiterId: 'recruiter1'
        },
        {
          id: '2',
          title: 'UX/UI Designer',
          description: 'Creative UX/UI Designer needed to design intuitive user interfaces and improve user experience.',
          location: 'Remote',
          salary: '$80,000 - $110,000',
          skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
          requirements: '3+ years of UX/UI design experience. Portfolio required.',
          companyName: 'Design Studio',
          postedDate: '2025-06-02',
          deadline: '2025-07-15',
          type: 'Full-time',
          recruiterId: 'recruiter2'
        }
      ];
      setJobs(sampleJobs);
      localStorage.setItem('jobs', JSON.stringify(sampleJobs));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('assessmentResponses', JSON.stringify(assessmentResponses));
  }, [assessmentResponses]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  // Keyword matching algorithm for resume screening
  const calculateMatchPercentage = (jobSkills: string[], jobDescription: string, resumeText: string): number => {
    const allJobKeywords = [...jobSkills, ...jobDescription.toLowerCase().split(' ')]
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
    
    const uniqueJobKeywords = [...new Set(allJobKeywords)];
    const resumeWords = resumeText.toLowerCase().split(' ')
      .map(word => word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
    
    let matches = 0;
    uniqueJobKeywords.forEach(keyword => {
      if (resumeWords.includes(keyword)) {
        matches++;
      }
    });
    
    return Math.round((matches / uniqueJobKeywords.length) * 100);
  };

  // Handle job creation/editing
  const handleSaveJob = () => {
    if (!jobForm.title || !jobForm.description || !jobForm.location) {
      alert('Please fill in all required fields');
      return;
    }

    const newJob: Job = {
      id: jobForm.id || Date.now().toString(),
      title: jobForm.title || '',
      description: jobForm.description || '',
      location: jobForm.location || '',
      salary: jobForm.salary || '',
      skills: jobForm.skills || [],
      requirements: jobForm.requirements || '',
      companyName: jobForm.companyName || '',
      postedDate: jobForm.postedDate || new Date().toISOString().split('T')[0],
      deadline: jobForm.deadline || '',
      type: jobForm.type || 'Full-time',
      assessmentId: jobForm.assessmentId,
      recruiterId: currentUser?.id || 'unknown'
    };

    if (jobForm.id) {
      setJobs(jobs.map(job => job.id === jobForm.id ? newJob : job));
    } else {
      setJobs([...jobs, newJob]);
    }

    setJobForm({});
    setIsModalOpen(false);
  };

  // Handle application submission
  const handleSubmitApplication = () => {
    if (!applicationForm.candidateName || !applicationForm.email || !applicationForm.resumeText) {
      alert('Please fill in all required fields');
      return;
    }

    const job = selectedJob;
    if (!job) return;

    const matchPercentage = calculateMatchPercentage(
      job.skills,
      job.description + ' ' + job.requirements,
      applicationForm.resumeText || ''
    );

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId: job.id,
      candidateId: currentUser?.id || 'unknown',
      candidateName: applicationForm.candidateName || '',
      email: applicationForm.email || '',
      phone: applicationForm.phone || '',
      resumeText: applicationForm.resumeText || '',
      coverLetter: applicationForm.coverLetter || '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      matchPercentage
    };

    setApplications([...applications, newApplication]);
    setApplicationForm({});
    setIsModalOpen(false);
    alert('Application submitted successfully!');
  };

  // Handle assessment creation
  const handleSaveAssessment = () => {
    if (!assessmentForm.title || !assessmentForm.questions?.length) {
      alert('Please provide assessment title and at least one question');
      return;
    }

    const newAssessment: Assessment = {
      id: assessmentForm.id || Date.now().toString(),
      title: assessmentForm.title || '',
      description: assessmentForm.description || '',
      questions: assessmentForm.questions || [],
      timeLimit: assessmentForm.timeLimit || 60,
      recruiterId: currentUser?.id || 'unknown',
      createdDate: new Date().toISOString().split('T')[0]
    };

    if (assessmentForm.id) {
      setAssessments(assessments.map(assessment => 
        assessment.id === assessmentForm.id ? newAssessment : assessment
      ));
    } else {
      setAssessments([...assessments, newAssessment]);
    }

    setAssessmentForm({});
    setIsModalOpen(false);
  };

  // AI-powered resume analysis
  const handleAIResumeAnalysis = (resumeText: string, jobDescription: string) => {
    const prompt = `Analyze this resume against the job description and provide insights in JSON format with keys: "match_score" (0-100), "strengths", "gaps", "recommendations", "key_skills_found", "missing_skills". 

Job Description: ${jobDescription}

Resume: ${resumeText}`;
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(prompt);
  };

  // AI-powered job description optimization
  const handleAIJobOptimization = (jobDescription: string) => {
    const prompt = `Optimize this job description to be more attractive to candidates and improve clarity. Return JSON with keys: "optimized_description", "suggested_skills", "improvements_made", "keyword_suggestions". 

Original Job Description: ${jobDescription}`;
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(prompt);
  };

  // Modal management
  const openModal = (type: string, data?: any) => {
    setModalType(type);
    if (type === 'edit-job' && data) {
      setJobForm(data);
    } else if (type === 'edit-assessment' && data) {
      setAssessmentForm(data);
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setJobForm({});
    setApplicationForm({});
    setAssessmentForm({});
    document.body.classList.remove('modal-open');
  };

  // Filter and sort functions
  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'date') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'salary') return a.salary.localeCompare(b.salary);
      return 0;
    });
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'date') return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      if (sortBy === 'name') return a.candidateName.localeCompare(b.candidateName);
      return 0;
    });
  };

  // Export functions
  const exportApplications = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Candidate Name,Email,Phone,Job Title,Applied Date,Status,Match %\n" +
      applications.map(app => {
        const job = jobs.find(j => j.id === app.jobId);
        return `"${app.candidateName}","${app.email}","${app.phone}","${job?.title || 'N/A'}","${app.appliedDate}","${app.status}","${app.matchPercentage || 0}%"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render dashboard
  const renderDashboard = () => {
    const myJobs = jobs.filter(job => job.recruiterId === currentUser?.id).length;
    const myApplications = applications.filter(app => app.candidateId === currentUser?.id).length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const avgMatchScore = applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + (app.matchPercentage || 0), 0) / applications.length)
      : 0;

    return (
      <div className="space-y-6" id="welcome_fallback">
        <div className="flex-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {currentUser?.first_name}!</h1>
            <p className="text-gray-600 dark:text-slate-400">Current Role: {userRole === 'recruiter' ? 'Recruiter' : 'Candidate'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  userRole === 'recruiter' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-slate-400'
                }`}
                onClick={() => setUserRole('recruiter')}
                id="role-switcher-recruiter"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Recruiter
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  userRole === 'candidate' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-slate-400'
                }`}
                onClick={() => setUserRole('candidate')}
                id="role-switcher-candidate"
              >
                <User className="w-4 h-4 inline mr-2" />
                Candidate
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="stat-title">Total Jobs</div>
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-desc">Available positions</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">{userRole === 'recruiter' ? 'My Job Posts' : 'My Applications'}</div>
            <div className="stat-value">{userRole === 'recruiter' ? myJobs : myApplications}</div>
            <div className="stat-desc">{userRole === 'recruiter' ? 'Active posts' : 'Submitted applications'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Pending Applications</div>
            <div className="stat-value">{pendingApplications}</div>
            <div className="stat-desc">Awaiting review</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Avg Match Score</div>
            <div className="stat-value">{avgMatchScore}%</div>
            <div className="stat-desc">Resume-job matching</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{job.companyName} • {job.location}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">{job.salary}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
            <div className="space-y-3">
              {applications.slice(0, 5).map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <h4 className="font-medium">{app.candidateName}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{job?.title || 'Unknown Position'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{app.matchPercentage}% match</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render jobs list
  const renderJobs = () => {
    const filteredJobs = getFilteredJobs();

    return (
      <div className="space-y-6">
        <div className="flex-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Listings</h1>
          {userRole === 'recruiter' && (
            <button
              className="btn btn-primary"
              onClick={() => openModal('create-job')}
              id="create-job-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="job-search"
            />
          </div>
          <select
            className="input sm:w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="salary">Sort by Salary</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              setSelectedJob(job);
              setCurrentPage('job-details');
            }}>
              <div className="flex-between mb-3">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                {userRole === 'recruiter' && job.recruiterId === currentUser?.id && (
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-gray-500 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('edit-job', job);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobs(jobs.filter(j => j.id !== job.id));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-3 line-clamp-3">{job.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Building className="w-4 h-4 mr-2" />
                  {job.companyName}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {job.salary}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline: {job.deadline}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="badge badge-info text-xs">{skill}</span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-xs text-gray-500">+{job.skills.length - 3} more</span>
                )}
              </div>
              {userRole === 'candidate' && (
                <button className="btn btn-primary w-full">
                  View & Apply
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-gray-600 dark:text-slate-400">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Render job details
  const renderJobDetails = () => {
    if (!selectedJob) return null;

    const jobApplications = applications.filter(app => app.jobId === selectedJob.id);
    const assessment = assessments.find(a => a.id === selectedJob.assessmentId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={() => setCurrentPage('jobs')}
          >
            ← Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedJob.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <p className="text-gray-700 dark:text-slate-300 mb-6">{selectedJob.description}</p>
              
              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              <p className="text-gray-700 dark:text-slate-300 mb-6">{selectedJob.requirements}</p>
              
              <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map((skill, index) => (
                  <span key={index} className="badge badge-info">{skill}</span>
                ))}
              </div>
            </div>

            {assessment && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Assessment Required</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">{assessment.title}</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">{assessment.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-blue-600 dark:text-blue-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {assessment.timeLimit} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-4 h-4" />
                      {assessment.questions.length} questions
                    </span>
                  </div>
                </div>
              </div>
            )}

            {userRole === 'recruiter' && jobApplications.length > 0 && (
              <div className="card">
                <div className="flex-between mb-4">
                  <h2 className="text-xl font-semibold">Applications ({jobApplications.length})</h2>
                  <button
                    className="btn bg-green-500 text-white hover:bg-green-600"
                    onClick={exportApplications}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
                <div className="space-y-4">
                  {jobApplications.map(app => (
                    <div key={app.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                      <div className="flex-between mb-3">
                        <div>
                          <h3 className="font-medium">{app.candidateName}</h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400">{app.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`inline-block px-2 py-1 rounded-full text-xs mb-1 ${
                              app.matchPercentage && app.matchPercentage >= 80 ? 'bg-green-100 text-green-800' :
                              app.matchPercentage && app.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {app.matchPercentage}% Match
                            </div>
                            <select
                              className="text-xs border rounded px-2 py-1"
                              value={app.status}
                              onChange={(e) => {
                                setApplications(applications.map(a => 
                                  a.id === app.id ? { ...a, status: e.target.value as Application['status'] } : a
                                ));
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <button
                            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => {
                              setSelectedApplication(app);
                              openModal('view-application');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600"
                            onClick={() => handleAIResumeAnalysis(app.resumeText, selectedJob.description)}
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Applied: {app.appliedDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Job Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Building className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Company:</span>
                  <span>{selectedJob.companyName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Location:</span>
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Salary:</span>
                  <span>{selectedJob.salary}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Type:</span>
                  <span>{selectedJob.type}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Posted:</span>
                  <span>{selectedJob.postedDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Target className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Deadline:</span>
                  <span>{selectedJob.deadline}</span>
                </div>
              </div>
            </div>

            {userRole === 'candidate' && (
              <div className="card">
                <button
                  className="btn btn-primary w-full mb-4"
                  onClick={() => {
                    setApplicationForm({ jobId: selectedJob.id });
                    openModal('apply-job');
                  }}
                  id="apply-job-btn"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply for this Job
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Join {applications.filter(app => app.jobId === selectedJob.id).length} other applicants
                </p>
              </div>
            )}

            {userRole === 'recruiter' && selectedJob.recruiterId === currentUser?.id && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">AI Tools</h3>
                <div className="space-y-3">
                  <button
                    className="btn bg-purple-500 text-white hover:bg-purple-600 w-full"
                    onClick={() => handleAIJobOptimization(selectedJob.description)}
                    disabled={isAiLoading}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Optimize Job Description
                  </button>
                  <p className="text-xs text-gray-500">
                    Use AI to improve job description and attract better candidates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render applications list
  const renderApplications = () => {
    const filteredApplications = getFilteredApplications();
    const userApplications = userRole === 'candidate' 
      ? filteredApplications.filter(app => app.candidateId === currentUser?.id)
      : filteredApplications;

    return (
      <div className="space-y-6">
        <div className="flex-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {userRole === 'candidate' ? 'My Applications' : 'All Applications'}
          </h1>
          {userRole === 'recruiter' && (
            <button
              className="btn bg-green-500 text-white hover:bg-green-600"
              onClick={exportApplications}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search applications..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="input sm:w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="match">Sort by Match %</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Candidate</th>
                  <th className="table-header">Job Position</th>
                  <th className="table-header">Applied Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Match %</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {userApplications.map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <tr key={app.id}>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{app.candidateName}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{job?.title || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{job?.companyName || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="table-cell">{app.appliedDate}</td>
                      <td className="table-cell">
                        {userRole === 'recruiter' ? (
                          <select
                            className="text-sm border rounded px-2 py-1"
                            value={app.status}
                            onChange={(e) => {
                              setApplications(applications.map(a => 
                                a.id === app.id ? { ...a, status: e.target.value as Application['status'] } : a
                              ));
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`badge ${
                            app.status === 'pending' ? 'badge-warning' :
                            app.status === 'shortlisted' ? 'badge-success' :
                            app.status === 'rejected' ? 'badge-error' :
                            'badge-info'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className={`flex items-center gap-2 ${
                          (app.matchPercentage || 0) >= 80 ? 'text-green-600' :
                          (app.matchPercentage || 0) >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          <Gauge className="w-4 h-4" />
                          {app.matchPercentage || 0}%
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => {
                              setSelectedApplication(app);
                              openModal('view-application');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userRole === 'recruiter' && (
                            <button
                              className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600"
                              onClick={() => handleAIResumeAnalysis(app.resumeText, job?.description || '')}
                            >
                              <Brain className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {userApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
            <p className="text-gray-600 dark:text-slate-400">
              {userRole === 'candidate' ? 'Start applying to jobs!' : 'No applications received yet.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render assessments
  const renderAssessments = () => {
    const userAssessments = userRole === 'recruiter' 
      ? assessments.filter(assessment => assessment.recruiterId === currentUser?.id)
      : assessments;

    return (
      <div className="space-y-6">
        <div className="flex-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessments</h1>
          {userRole === 'recruiter' && (
            <button
              className="btn btn-primary"
              onClick={() => openModal('create-assessment')}
              id="create-assessment-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAssessments.map(assessment => (
            <div key={assessment.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex-between mb-3">
                <h3 className="text-lg font-semibold">{assessment.title}</h3>
                {userRole === 'recruiter' && assessment.recruiterId === currentUser?.id && (
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-gray-500 hover:text-blue-500"
                      onClick={() => openModal('edit-assessment', assessment)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={() => setAssessments(assessments.filter(a => a.id !== assessment.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-4">{assessment.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {assessment.timeLimit} minutes
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  {assessment.questions.length} questions
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created: {assessment.createdDate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {userAssessments.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assessments found</h3>
            <p className="text-gray-600 dark:text-slate-400">
              {userRole === 'recruiter' ? 'Create your first assessment!' : 'No assessments available.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render settings
  const renderSettings = () => {
    const handleDataExport = () => {
      const data = {
        jobs,
        applications,
        assessments,
        assessmentResponses,
        exportDate: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'job-management-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleDataImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.jobs) setJobs(data.jobs);
          if (data.applications) setApplications(data.applications);
          if (data.assessments) setAssessments(data.assessments);
          if (data.assessmentResponses) setAssessmentResponses(data.assessmentResponses);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };

    const handleDeleteAllData = () => {
      if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
        setJobs([]);
        setApplications([]);
        setAssessments([]);
        setAssessmentResponses([]);
        localStorage.removeItem('jobs');
        localStorage.removeItem('applications');
        localStorage.removeItem('assessments');
        localStorage.removeItem('assessmentResponses');
        alert('All data has been deleted.');
      }
    };

    return (
      <div className="space-y-6" id="generation_issue_fallback">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                  Download all your data as a JSON file for backup purposes.
                </p>
                <button
                  className="btn bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleDataExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>

              <div>
                <h3 className="font-medium mb-2">Import Data</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                  Import previously exported data to restore your information.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleDataImport}
                  className="input"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2 text-red-600">Delete All Data</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                  Permanently delete all jobs, applications, and assessments.
                </p>
                <button
                  className="btn bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDeleteAllData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Data
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex-between">
                <span>Total Jobs:</span>
                <span className="font-semibold">{jobs.length}</span>
              </div>
              <div className="flex-between">
                <span>Total Applications:</span>
                <span className="font-semibold">{applications.length}</span>
              </div>
              <div className="flex-between">
                <span>Total Assessments:</span>
                <span className="font-semibold">{assessments.length}</span>
              </div>
              <div className="flex-between">
                <span>Pending Applications:</span>
                <span className="font-semibold">
                  {applications.filter(app => app.status === 'pending').length}
                </span>
              </div>
              <div className="flex-between">
                <span>Shortlisted Candidates:</span>
                <span className="font-semibold">
                  {applications.filter(app => app.status === 'shortlisted').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle modals
  const renderModals = () => {
    if (!isModalOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    return (
      <div className="modal-backdrop" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={-1}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {modalType === 'create-job' && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Create New Job</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">×</button>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.title || ''}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.companyName || ''}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                    placeholder="e.g. TechCorp Inc."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.location || ''}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.salary || ''}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="e.g. $80,000 - $120,000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select
                    className="input"
                    value={jobForm.type || 'Full-time'}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="input"
                    value={jobForm.deadline || ''}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.skills?.join(', ') || ''}
                    onChange={(e) => setJobForm({ 
                      ...jobForm, 
                      skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                    })}
                    placeholder="e.g. React, TypeScript, Node.js"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={jobForm.description || ''}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={jobForm.requirements || ''}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    placeholder="Education, experience, and other requirements..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assessment (Optional)</label>
                  <select
                    className="input"
                    value={jobForm.assessmentId || ''}
                    onChange={(e) => setJobForm({ ...jobForm, assessmentId: e.target.value })}
                  >
                    <option value="">No Assessment</option>
                    {assessments
                      .filter(assessment => assessment.recruiterId === currentUser?.id)
                      .map(assessment => (
                        <option key={assessment.id} value={assessment.id}>
                          {assessment.title}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveJob}>
                  Create Job
                </button>
              </div>
            </>
          )}

          {modalType === 'edit-job' && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Edit Job</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">×</button>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.title || ''}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.companyName || ''}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.location || ''}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.salary || ''}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={jobForm.skills?.join(', ') || ''}
                    onChange={(e) => setJobForm({ 
                      ...jobForm, 
                      skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={jobForm.description || ''}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={jobForm.requirements || ''}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveJob}>
                  Update Job
                </button>
              </div>
            </>
          )}

          {modalType === 'apply-job' && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Apply for {selectedJob?.title}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">×</button>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={applicationForm.candidateName || ''}
                    onChange={(e) => setApplicationForm({ ...applicationForm, candidateName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="input"
                    value={applicationForm.email || ''}
                    onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={applicationForm.phone || ''}
                    onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume/CV *</label>
                  <textarea
                    className="input"
                    rows={6}
                    value={applicationForm.resumeText || ''}
                    onChange={(e) => setApplicationForm({ ...applicationForm, resumeText: e.target.value })}
                    placeholder="Paste your resume content here or describe your experience, skills, and qualifications..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Letter</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={applicationForm.coverLetter || ''}
                    onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                    placeholder="Why are you interested in this position? What makes you a good fit?"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmitApplication}>
                  Submit Application
                </button>
              </div>
            </>
          )}

          {modalType === 'view-application' && selectedApplication && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Application Details</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">×</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Candidate Name</label>
                    <p className="font-medium">{selectedApplication.candidateName}</p>
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <p>{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <p>{selectedApplication.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="form-label">Applied Date</label>
                    <p>{selectedApplication.appliedDate}</p>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <span className={`badge ${
                      selectedApplication.status === 'pending' ? 'badge-warning' :
                      selectedApplication.status === 'shortlisted' ? 'badge-success' :
                      selectedApplication.status === 'rejected' ? 'badge-error' :
                      'badge-info'
                    }`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div>
                    <label className="form-label">Match Score</label>
                    <div className={`flex items-center gap-2 ${
                      (selectedApplication.matchPercentage || 0) >= 80 ? 'text-green-600' :
                      (selectedApplication.matchPercentage || 0) >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      <Gauge className="w-4 h-4" />
                      {selectedApplication.matchPercentage || 0}%
                    </div>
                  </div>
                </div>
                <div>
                  <label className="form-label">Resume/CV</label>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">{selectedApplication.resumeText}</p>
                  </div>
                </div>
                {selectedApplication.coverLetter && (
                  <div>
                    <label className="form-label">Cover Letter</label>
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg max-h-32 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>
                  Close
                </button>
                {userRole === 'recruiter' && (
                  <button
                    className="btn bg-purple-500 text-white hover:bg-purple-600"
                    onClick={() => {
                      const job = jobs.find(j => j.id === selectedApplication.jobId);
                      if (job) {
                        handleAIResumeAnalysis(selectedApplication.resumeText, job.description);
                      }
                    }}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Analysis
                  </button>
                )}
              </div>
            </>
          )}

          {modalType === 'create-assessment' && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Create Assessment</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">×</button>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Assessment Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={assessmentForm.title || ''}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                    placeholder="e.g. Frontend Developer Skills Test"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={assessmentForm.description || ''}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                    placeholder="Describe what this assessment evaluates..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="input"
                    value={assessmentForm.timeLimit || 60}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, timeLimit: parseInt(e.target.value) })}
                    min="15"
                    max="180"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Questions</label>
                  <div className="space-y-3">
                    {(assessmentForm.questions || []).map((question, index) => (
                      <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                        <div className="flex-between mb-3">
                          <span className="font-medium">Question {index + 1}</span>
                          <button
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              const questions = assessmentForm.questions?.filter((_, i) => i !== index) || [];
                              setAssessmentForm({ ...assessmentForm, questions });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          className="input mb-2"
                          value={question.question}
                          onChange={(e) => {
                            const questions = [...(assessmentForm.questions || [])];
                            questions[index] = { ...question, question: e.target.value };
                            setAssessmentForm({ ...assessmentForm, questions });
                          }}
                          placeholder="Enter your question..."
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            className="input"
                            value={question.type}
                            onChange={(e) => {
                              const questions = [...(assessmentForm.questions || [])];
                              questions[index] = { ...question, type: e.target.value as AssessmentQuestion['type'] };
                              setAssessmentForm({ ...assessmentForm, questions });
                            }}
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="text">Text Answer</option>
                            <option value="coding">Coding</option>
                          </select>
                          <input
                            type="number"
                            className="input"
                            value={question.points}
                            onChange={(e) => {
                              const questions = [...(assessmentForm.questions || [])];
                              questions[index] = { ...question, points: parseInt(e.target.value) };
                              setAssessmentForm({ ...assessmentForm, questions });
                            }}
                            placeholder="Points"
                            min="1"
                          />
                        </div>
                        {question.type === 'multiple-choice' && (
                          <div className="mt-2">
                            <input
                              type="text"
                              className="input"
                              value={question.options?.join(', ') || ''}
                              onChange={(e) => {
                                const questions = [...(assessmentForm.questions || [])];
                                questions[index] = { 
                                  ...question, 
                                  options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                                };
                                setAssessmentForm({ ...assessmentForm, questions });
                              }}
                              placeholder="Options (comma-separated)"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      className="btn bg-blue-500 text-white hover:bg-blue-600 w-full"
                      onClick={() => {
                        const newQuestion: AssessmentQuestion = {
                          id: Date.now().toString(),
                          question: '',
                          type: 'multiple-choice',
                          points: 10
                        };
                        setAssessmentForm({
                          ...assessmentForm,
                          questions: [...(assessmentForm.questions || []), newQuestion]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveAssessment}>
                  Create Assessment
                </button>
              </div>
            </>
          )}

          {modalType === 'edit-assessment' && (
            <>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Edit Assessment</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">×</button>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Assessment Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={assessmentForm.title || ''}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={assessmentForm.description || ''}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="input"
                    value={assessmentForm.timeLimit || 60}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, timeLimit: parseInt(e.target.value) })}
                    min="15"
                    max="180"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveAssessment}>
                  Update Assessment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Navigation
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: userRole === 'candidate' ? 'My Applications' : 'Applications', icon: FileText },
    { id: 'assessments', label: 'Assessments', icon: FileCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please log in to continue</h1>
          <p className="text-gray-600 dark:text-slate-400">You need to be authenticated to access the job management system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">JobFlow</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span>{currentUser.first_name} {currentUser.last_name}</span>
              </div>
              <button
                className="btn bg-red-500 text-white hover:bg-red-600"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex gap-1 py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-8">
        {currentPage === 'dashboard' && renderDashboard()}
        {currentPage === 'jobs' && renderJobs()}
        {currentPage === 'job-details' && renderJobDetails()}
        {currentPage === 'applications' && renderApplications()}
        {currentPage === 'assessments' && renderAssessments()}
        {currentPage === 'settings' && renderSettings()}
      </main>

      {/* AI Results */}
      {(aiResult || aiError || isAiLoading) && (
        <div className="fixed bottom-4 right-4 w-96 max-w-[90vw] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4 z-50">
          <div className="flex-between mb-3">
            <h3 className="font-semibold">AI Analysis</h3>
            <button
              onClick={() => {
                setAiResult(null);
                setAiError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {isAiLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Analyzing...</span>
            </div>
          )}
          
          {aiError && (
            <div className="text-red-600 text-sm">
              Error: {aiError.message || 'Failed to analyze'}
            </div>
          )}
          
          {aiResult && (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{aiResult}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {renderModals()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;