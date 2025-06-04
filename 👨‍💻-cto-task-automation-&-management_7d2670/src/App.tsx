import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Settings, Calendar, TrendingUp, Code, Database, 
  Shield, Brain, ChartBar, CheckCircle, AlertTriangle, 
  Clock, Target, Zap, FileText, MessageCircle, Search,
  Filter, Download, Upload, Plus, Edit, Trash2, Eye,
  BarChart as LucideBarChart, PieChart as LucidePieChart, Activity, Server, /* Aliased BarChart from lucide-react */
  GitBranch, Bug, Cpu, Globe, Mail, Phone, Laptop,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Star,
  Gauge, Terminal, Key, Lock, UserCheck, Package,
  Building, Trophy, Medal, Lightbulb, Coffee, Rocket
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  ResponsiveContainer 
} from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'active' | 'away' | 'busy';
  productivity: number;
  tasksCompleted: number;
  currentProject: string;
  skills: string[];
  joinDate: string;
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'development' | 'testing' | 'deployed';
  progress: number;
  deadline: string;
  teamLead: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  techStack: string[];
  description: string;
  budget: number;
  spent: number;
  risks: string[];
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  attendees: string[];
  transcript: string;
  actionItems: string[];
  decisions: string[];
  type: 'standup' | 'planning' | 'review' | 'strategic';
}

interface TechnicalDebt {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  effort: number;
  component: string;
  assignee: string;
  created: string;
}

type ViewType = 'dashboard' | 'team' | 'projects' | 'systems' | 'meetings' | 'debt' | 'settings';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [technicalDebt, setTechnicalDebt] = useState<TechnicalDebt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'team' | 'project' | 'meeting' | 'debt'>('team');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const aiLayerRef = useRef<AILayerHandle>(null);

  useEffect(() => {
    loadData();
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'true' || (savedTheme === null && prefersDark));
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const loadData = () => {
    try {
      const savedTeam = localStorage.getItem('fireflies_team');
      const savedProjects = localStorage.getItem('fireflies_projects');
      const savedMetrics = localStorage.getItem('fireflies_metrics');
      const savedMeetings = localStorage.getItem('fireflies_meetings');
      const savedDebt = localStorage.getItem('fireflies_debt');

      if (savedTeam) {
        setTeamMembers(JSON.parse(savedTeam));
      } else {
        setTeamMembers(getDefaultTeamData());
      }

      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        setProjects(getDefaultProjectData());
      }

      if (savedMetrics) {
        setSystemMetrics(JSON.parse(savedMetrics));
      } else {
        setSystemMetrics(getDefaultMetricsData());
      }

      if (savedMeetings) {
        setMeetings(JSON.parse(savedMeetings));
      } else {
        setMeetings(getDefaultMeetingData());
      }

      if (savedDebt) {
        setTechnicalDebt(JSON.parse(savedDebt));
      } else {
        setTechnicalDebt(getDefaultDebtData());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('fireflies_team', JSON.stringify(teamMembers));
      localStorage.setItem('fireflies_projects', JSON.stringify(projects));
      localStorage.setItem('fireflies_metrics', JSON.stringify(systemMetrics));
      localStorage.setItem('fireflies_meetings', JSON.stringify(meetings));
      localStorage.setItem('fireflies_debt', JSON.stringify(technicalDebt));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    saveData();
  }, [teamMembers, projects, systemMetrics, meetings, technicalDebt]);

  const getDefaultTeamData = (): TeamMember[] => [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Frontend Engineer',
      email: 'sarah@fireflies.ai',
      avatar: '👩‍💻',
      status: 'active',
      productivity: 92,
      tasksCompleted: 28,
      currentProject: 'AI Dashboard v2.0',
      skills: ['React', 'TypeScript', 'WebRTC'],
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Backend Architect',
      email: 'marcus@fireflies.ai',
      avatar: '👨‍💻',
      status: 'active',
      productivity: 88,
      tasksCompleted: 24,
      currentProject: 'Transcription Engine',
      skills: ['Node.js', 'Python', 'Kubernetes'],
      joinDate: '2022-08-20'
    },
    {
      id: '3',
      name: 'Emily Watson',
      role: 'ML Engineer',
      email: 'emily@fireflies.ai',
      avatar: '🤖',
      status: 'busy',
      productivity: 95,
      tasksCompleted: 31,
      currentProject: 'NLP Enhancement',
      skills: ['Python', 'TensorFlow', 'NLP'],
      joinDate: '2023-03-10'
    },
    {
      id: '4',
      name: 'Alex Kim',
      role: 'DevOps Engineer',
      email: 'alex@fireflies.ai',
      avatar: '⚙️',
      status: 'away',
      productivity: 85,
      tasksCompleted: 19,
      currentProject: 'Infrastructure Scaling',
      skills: ['AWS', 'Docker', 'Terraform'],
      joinDate: '2022-11-05'
    }
  ];

  const getDefaultProjectData = (): Project[] => [
    {
      id: '1',
      name: 'AI Dashboard v2.0',
      status: 'development',
      progress: 75,
      deadline: '2025-07-15',
      teamLead: 'Sarah Chen',
      priority: 'high',
      techStack: ['React', 'TypeScript', 'WebSocket'],
      description: 'Next-generation meeting analytics dashboard',
      budget: 150000,
      spent: 112500,
      risks: ['Integration complexity', 'Performance requirements']
    },
    {
      id: '2',
      name: 'Transcription Engine',
      status: 'testing',
      progress: 90,
      deadline: '2025-06-30',
      teamLead: 'Marcus Rodriguez',
      priority: 'critical',
      techStack: ['Python', 'WebRTC', 'Redis'],
      description: 'Real-time speech-to-text processing',
      budget: 200000,
      spent: 180000,
      risks: ['Accuracy targets', 'Latency optimization']
    },
    {
      id: '3',
      name: 'NLP Enhancement',
      status: 'development',
      progress: 60,
      deadline: '2025-08-20',
      teamLead: 'Emily Watson',
      priority: 'medium',
      techStack: ['Python', 'TensorFlow', 'BERT'],
      description: 'Improved natural language understanding',
      budget: 120000,
      spent: 72000,
      risks: ['Model performance', 'Training data quality']
    }
  ];

  const getDefaultMetricsData = (): SystemMetric[] => [
    {
      id: '1',
      name: 'API Response Time',
      value: 250,
      unit: 'ms',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '2025-06-04T10:30:00Z'
    },
    {
      id: '2',
      name: 'System Uptime',
      value: 99.9,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      lastUpdated: '2025-06-04T10:30:00Z'
    },
    {
      id: '3',
      name: 'Error Rate',
      value: 0.02,
      unit: '%',
      status: 'healthy',
      trend: 'down',
      lastUpdated: '2025-06-04T10:30:00Z'
    },
    {
      id: '4',
      name: 'Active Users',
      value: 15420,
      unit: 'users',
      status: 'healthy',
      trend: 'up',
      lastUpdated: '2025-06-04T10:30:00Z'
    },
    {
      id: '5',
      name: 'Database Load',
      value: 68,
      unit: '%',
      status: 'warning',
      trend: 'up',
      lastUpdated: '2025-06-04T10:30:00Z'
    }
  ];

  const getDefaultMeetingData = (): Meeting[] => [
    {
      id: '1',
      title: 'Weekly Engineering Standup',
      date: '2025-06-04T09:00:00Z',
      duration: 30,
      attendees: ['Sarah Chen', 'Marcus Rodriguez', 'Emily Watson', 'Alex Kim'],
      transcript: 'Discussion about AI Dashboard progress, backend API optimization, and deployment pipeline improvements.',
      actionItems: ['Complete user authentication flow', 'Optimize database queries', 'Setup staging environment'],
      decisions: ['Move to microservices architecture', 'Implement Redis caching'],
      type: 'standup'
    },
    {
      id: '2',
      title: 'Q2 Strategy Planning',
      date: '2025-06-03T14:00:00Z',
      duration: 120,
      attendees: ['CTO', 'Sarah Chen', 'Marcus Rodriguez', 'Emily Watson'],
      transcript: 'Strategic discussion about product roadmap, technology investments, and team scaling plans.',
      actionItems: ['Finalize hiring plan', 'Evaluate new ML frameworks', 'Budget allocation review'],
      decisions: ['Prioritize AI accuracy improvements', 'Expand backend team'],
      type: 'strategic'
    }
  ];

  const getDefaultDebtData = (): TechnicalDebt[] => [
    {
      id: '1',
      title: 'Legacy Authentication System',
      severity: 'high',
      impact: 'Security vulnerabilities and performance issues',
      effort: 40,
      component: 'Auth Service',
      assignee: 'Marcus Rodriguez',
      created: '2025-05-15'
    },
    {
      id: '2',
      title: 'Outdated Dependencies',
      severity: 'medium',
      impact: 'Security patches and new feature limitations',
      effort: 16,
      component: 'Frontend',
      assignee: 'Sarah Chen',
      created: '2025-05-20'
    },
    {
      id: '3',
      title: 'Database Query Optimization',
      severity: 'critical',
      impact: 'Slow response times affecting user experience',
      effort: 24,
      component: 'Database',
      assignee: 'Alex Kim',
      created: '2025-05-25'
    }
  ];

  const handleAISend = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setError('Please provide a prompt or select a file.');
      return;
    }

    setAiResult(null);
    setError(null);

    try {
      aiLayerRef.current?.sendToAI(aiPrompt, selectedFile || undefined);
    } catch (error) {
      setError('Failed to process AI request');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAiPrompt('Analyze this meeting transcript and extract key insights, action items, and decisions in JSON format.');
    }
  };

  const exportData = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'team':
        data = teamMembers;
        filename = `fireflies-team-${timestamp}.csv`;
        break;
      case 'projects':
        data = projects;
        filename = `fireflies-projects-${timestamp}.csv`;
        break;
      case 'meetings':
        data = meetings;
        filename = `fireflies-meetings-${timestamp}.csv`;
        break;
      case 'debt':
        data = technicalDebt;
        filename = `fireflies-technical-debt-${timestamp}.csv`;
        break;
      default:
        return;
    }

    const csvContent = convertToCSV(data);
    downloadCSV(csvContent, filename);
  };

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openModal = (type: 'team' | 'project' | 'meeting' | 'debt', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    document.body.classList.remove('modal-open');
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && showModal) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const filteredTeam = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || member.status === filterStatus)
  );

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || project.status === filterStatus)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': case 'deployed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'warning': case 'testing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical': case 'busy': case 'development': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'away': case 'planning': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const renderDashboard = () => {
    const teamProductivity = teamMembers.length > 0 ? teamMembers.reduce((sum, member) => sum + member.productivity, 0) / teamMembers.length : 0; // Fixed NaN issue
    const activeProjects = projects.filter(p => p.status === 'development' || p.status === 'testing').length;
    const criticalIssues = technicalDebt.filter(d => d.severity === 'critical').length;
    const healthyMetrics = systemMetrics.filter(m => m.status === 'healthy').length;

    const projectStatusData = [
      { name: 'Planning', value: projects.filter(p => p.status === 'planning').length },
      { name: 'Development', value: projects.filter(p => p.status === 'development').length },
      { name: 'Testing', value: projects.filter(p => p.status === 'testing').length },
      { name: 'Deployed', value: projects.filter(p => p.status === 'deployed').length }
    ];

    const teamPerformanceData = teamMembers.map(member => ({
      name: member.name.split(' ')[0],
      productivity: member.productivity,
      tasks: member.tasksCompleted
    }));

    return (
      <div id="welcome_fallback" className="space-y-6">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Team Productivity</div>
                <div className="stat-value">{teamProductivity.toFixed(1)}%</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  +2.3% from last week
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Active Projects</div>
                <div className="stat-value">{activeProjects}</div>
                <div className="stat-desc flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  {projects.length} total projects
                </div>
              </div>
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">System Health</div>
                <div className="stat-value">{healthyMetrics}/{systemMetrics.length}</div>
                <div className="stat-desc flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-green-500" />
                  All systems operational
                </div>
              </div>
              <Server className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Critical Issues</div>
                <div className="stat-value text-red-600">{criticalIssues}</div>
                <div className="stat-desc flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Requires attention
                </div>
              </div>
              <Bug className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LucideBarChart className="w-5 h-5" /> {/* Updated to use aliased LucideBarChart icon */}
              Team Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformanceData}> {/* This is recharts' BarChart */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="productivity" fill="#3B82F6" name="Productivity %" />
                <Bar dataKey="tasks" fill="#10B981" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LucidePieChart className="w-5 h-5" /> {/* This uses the aliased PieChart icon */}
              Project Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Emily Watson completed NLP model training</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <GitBranch className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Sarah Chen merged feature branch for Dashboard v2.0</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Server className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Alex Kim deployed infrastructure updates</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportData('team')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal('team')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="away">Away</option>
          <option value="busy">Busy</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map((member) => (
          <div key={member.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{member.avatar}</div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{member.role}</p>
                </div>
              </div>
              <span className={`badge ${getStatusColor(member.status)}`}>
                {member.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Productivity</span>
                <span className="font-medium">{member.productivity}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all" 
                  style={{ width: `${member.productivity}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-medium">{member.tasksCompleted}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500 dark:text-slate-400">Current Project: </span>
                <span className="font-medium">{member.currentProject}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => openModal('team', member)}
                className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Project Portfolio
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportData('projects')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal('project')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-40"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="development">Development</option>
          <option value="testing">Testing</option>
          <option value="deployed">Deployed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-gray-600 dark:text-slate-400">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`badge ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-slate-400">Progress</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 dark:text-slate-400">Budget</div>
                <div className="mt-1">
                  <span className="font-medium">${(project.spent / 1000).toFixed(0)}k</span>
                  <span className="text-gray-500 dark:text-slate-400"> / ${(project.budget / 1000).toFixed(0)}k</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 dark:text-slate-400">Deadline</div>
                <div className="mt-1 font-medium">
                  {new Date(project.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-slate-400">Lead:</span>
                <span className="font-medium">{project.teamLead}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openModal('project', project)}
                  className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemsView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="w-6 h-6" />
          System Monitoring
        </h2>
        <button className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Real-time View
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemMetrics.map((metric) => (
          <div key={metric.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{metric.name}</h3>
              <span className={`badge ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl font-bold">
                {metric.value.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">
                  {metric.unit}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                {metric.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                {metric.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />} 
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Last updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          System Performance Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { time: '00:00', cpu: 45, memory: 62, disk: 78 },
            { time: '04:00', cpu: 52, memory: 58, disk: 81 },
            { time: '08:00', cpu: 68, memory: 72, disk: 79 },
            { time: '12:00', cpu: 71, memory: 75, disk: 82 },
            { time: '16:00', cpu: 65, memory: 68, disk: 80 },
            { time: '20:00', cpu: 58, memory: 64, disk: 78 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
            <Line type="monotone" dataKey="memory" stroke="#10B981" name="Memory %" />
            <Line type="monotone" dataKey="disk" stroke="#F59E0B" name="Disk %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMeetingsView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Meeting Insights
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportData('meetings')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal('meeting')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Meeting
          </button>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div id="ai_analysis_section" className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Meeting Analysis
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Upload Meeting Transcript</label>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">Analysis Prompt (Optional)</label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Analyze meeting for key insights..."
                className="input"
              />
            </div>
          </div>
          
          <button
            onClick={handleAISend}
            disabled={isLoading || (!aiPrompt.trim() && !selectedFile)}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          
          {error && (
            <div className="alert alert-error">
              <AlertTriangle className="w-4 h-4" />
              {error.toString()}
            </div>
          )}
          
          {aiResult && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">AI Analysis Results:</h4>
              <div className="whitespace-pre-wrap text-sm">{aiResult}</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{meeting.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(meeting.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {meeting.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {meeting.attendees.length} attendees
                  </span>
                </div>
              </div>
              <span className={`badge ${meeting.type === 'strategic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                {meeting.type}
              </span>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Transcript Preview:</h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">{meeting.transcript}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Action Items ({meeting.actionItems.length})
                </h4>
                <ul className="text-sm space-y-1">
                  {meeting.actionItems.slice(0, 2).map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                  {meeting.actionItems.length > 2 && (
                    <li className="text-gray-500 dark:text-slate-400">+{meeting.actionItems.length - 2} more</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Key Decisions ({meeting.decisions.length})
                </h4>
                <ul className="text-sm space-y-1">
                  {meeting.decisions.slice(0, 2).map((decision, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      {decision}
                    </li>
                  ))}
                  {meeting.decisions.length > 2 && (
                    <li className="text-gray-500 dark:text-slate-400">+{meeting.decisions.length - 2} more</li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => openModal('meeting', meeting)}
                className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                View Full
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTechnicalDebtView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="w-6 h-6" />
          Technical Debt Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportData('debt')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal('debt')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Issue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-title">Critical Issues</div>
          <div className="stat-value text-red-600">
            {technicalDebt.filter(d => d.severity === 'critical').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">High Priority</div>
          <div className="stat-value text-orange-600">
            {technicalDebt.filter(d => d.severity === 'high').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Effort</div>
          <div className="stat-value">
            {technicalDebt.reduce((sum, d) => sum + d.effort, 0)}h
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Components</div>
          <div className="stat-value">
            {new Set(technicalDebt.map(d => d.component)).size}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {technicalDebt
          .sort((a, b) => {
            const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
          })
          .map((debt) => (
            <div key={debt.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{debt.title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 mt-1">{debt.impact}</p>
                </div>
                <span className={`badge ${getPriorityColor(debt.severity)}`}>
                  {debt.severity}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Component</div>
                  <div className="font-medium">{debt.component}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Effort Required</div>
                  <div className="font-medium">{debt.effort}h</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Assignee</div>
                  <div className="font-medium">{debt.assignee}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Created</div>
                  <div className="font-medium">{new Date(debt.created).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openModal('debt', debt)}
                  className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button className="btn btn-sm bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Resolve
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div id="settings_page" className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings & Configuration
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dark Mode</label>
                <p className="text-sm text-gray-500 dark:text-slate-400">Toggle between light and dark themes</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => {
                const allData = {
                  team: teamMembers,
                  projects: projects,
                  metrics: systemMetrics,
                  meetings: meetings,
                  technicalDebt: technicalDebt,
                  exportDate: new Date().toISOString()
                };
                const dataStr = JSON.stringify(allData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `fireflies-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
              }}
              className="btn bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                  localStorage.clear();
                  setTeamMembers(getDefaultTeamData());
                  setProjects(getDefaultProjectData());
                  setSystemMetrics(getDefaultMetricsData());
                  setMeetings(getDefaultMeetingData());
                  setTechnicalDebt(getDefaultDebtData());
                }
              }}
              className="btn bg-red-600 text-white hover:bg-red-700 w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Data
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Data Import
          </h3>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      if (data.team) setTeamMembers(data.team);
                      if (data.projects) setProjects(data.projects);
                      if (data.metrics) setSystemMetrics(data.metrics);
                      if (data.meetings) setMeetings(data.meetings);
                      if (data.technicalDebt) setTechnicalDebt(data.technicalDebt);
                      alert('Data imported successfully!');
                    } catch (error) {
                      alert('Error importing data. Please check the file format.');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              className="input"
            />
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Import data from a previously exported JSON file
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Local Storage Only</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                All data is stored locally in your browser. No data is sent to external servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">
              {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              ×
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500 dark:text-slate-400">
              Modal form for {modalType} would be implemented here with proper form validation and data handling.
            </p>
          </div>
          
          <div className="modal-footer">
            <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={closeModal} className="btn btn-primary">
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setError(error)}
        onLoading={(loading) => setIsLoading(loading)}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div id="generation_issue_fallback" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fireflies CTO Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Executive Command Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-slate-400">☀️</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="theme-toggle"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
                <span className="text-sm text-gray-500 dark:text-slate-400">🌙</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  CTO
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-slate-800 h-screen sticky top-0 border-r border-gray-200 dark:border-slate-700 theme-transition">
          <div className="p-4">
            <div className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'projects', label: 'Projects', icon: Rocket },
                { id: 'systems', label: 'Systems', icon: Server },
                { id: 'meetings', label: 'Meetings', icon: MessageCircle },
                { id: 'debt', label: 'Tech Debt', icon: Bug },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as ViewType);
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="container-wide">
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'team' && renderTeamView()}
            {currentView === 'projects' && renderProjectsView()}
            {currentView === 'systems' && renderSystemsView()}
            {currentView === 'meetings' && renderMeetingsView()}
            {currentView === 'debt' && renderTechnicalDebtView()}
            {currentView === 'settings' && renderSettingsView()}
          </div>
        </main>
      </div>

      {/* Modal */}
      {renderModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-wide">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
