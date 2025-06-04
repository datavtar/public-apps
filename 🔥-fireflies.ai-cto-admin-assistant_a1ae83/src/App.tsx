import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Calendar, Users, Code, GitBranch, AlertTriangle, TrendingUp, TrendingDown, Clock, Target, Zap, Database, Server, Monitor, Settings, Download, Upload, Plus, Edit, Trash2, Eye, Search, Filter, ChevronDown, Brain, FileText, BarChart3, PieChart as LucidePieChart, Activity, CheckCircle, XCircle, AlertCircle, Star, ArrowRight, ArrowUp, ArrowDown, Play, Pause, RefreshCw, Bell, Mail, Phone, Rocket, Shield, Cpu, Cloud, Bug, Wrench, BookOpen, Trophy, Coffee, MessageCircle, Camera, Lightbulb } from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  productivity: number;
  commits: number;
  codeReviews: number;
  availability: 'available' | 'busy' | 'away';
  skills: string[];
  joinDate: string;
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  team: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  lead: string;
  description: string;
  risks: string[];
}

interface Metric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'engineering' | 'performance' | 'quality' | 'team';
  lastUpdated: string;
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastIncident: string;
}

interface Meeting {
  id: string;
  title: string;
  type: 'standup' | 'review' | 'planning' | 'one-on-one' | 'all-hands';
  date: string;
  attendees: number;
  duration: number;
  transcribed: boolean;
  insights: string[];
  actionItems: string[];
}

interface AlertItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string;
  resolved: boolean;
  description: string;
}

interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultView: string;
  reportingCurrency: string;
  timezone: string;
}

type ViewType = 'dashboard' | 'teams' | 'projects' | 'metrics' | 'system' | 'meetings' | 'reports' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 300,
    defaultView: 'dashboard',
    reportingCurrency: 'USD',
    timezone: 'UTC'
  });

  // AI Integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Modal states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const savedTeams = localStorage.getItem('cto-teams');
    const savedProjects = localStorage.getItem('cto-projects');
    const savedMetrics = localStorage.getItem('cto-metrics');
    const savedSystemHealth = localStorage.getItem('cto-system-health');
    const savedMeetings = localStorage.getItem('cto-meetings');
    const savedAlerts = localStorage.getItem('cto-alerts');
    const savedSettings = localStorage.getItem('cto-settings');
    const savedTheme = localStorage.getItem('cto-theme');

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    else setTeams(generateSampleTeams());

    if (savedProjects) setProjects(JSON.parse(savedProjects));
    else setProjects(generateSampleProjects());

    if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
    else setMetrics(generateSampleMetrics());

    if (savedSystemHealth) setSystemHealth(JSON.parse(savedSystemHealth));
    else setSystemHealth(generateSampleSystemHealth());

    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    else setMeetings(generateSampleMeetings());

    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    else setAlerts(generateSampleAlerts());

    if (savedSettings) setSettings(JSON.parse(savedSettings));

    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cto-teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('cto-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('cto-metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('cto-system-health', JSON.stringify(systemHealth));
  }, [systemHealth]);

  useEffect(() => {
    localStorage.setItem('cto-meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('cto-alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('cto-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cto-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cto-theme', 'light');
    }
  }, [isDarkMode]);

  const generateSampleTeams = (): TeamMember[] => [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Frontend Engineer',
      team: 'Product Engineering',
      productivity: 92,
      commits: 47,
      codeReviews: 23,
      availability: 'available',
      skills: ['React', 'TypeScript', 'GraphQL'],
      joinDate: '2022-03-15'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'Staff Backend Engineer',
      team: 'Platform',
      productivity: 88,
      commits: 52,
      codeReviews: 31,
      availability: 'busy',
      skills: ['Python', 'Kubernetes', 'PostgreSQL'],
      joinDate: '2021-08-20'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Engineering Manager',
      team: 'AI/ML',
      productivity: 85,
      commits: 15,
      codeReviews: 45,
      availability: 'available',
      skills: ['Python', 'TensorFlow', 'Leadership'],
      joinDate: '2020-11-10'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'DevOps Engineer',
      team: 'Infrastructure',
      productivity: 90,
      commits: 38,
      codeReviews: 19,
      availability: 'away',
      skills: ['AWS', 'Docker', 'Terraform'],
      joinDate: '2023-01-05'
    }
  ];

  const generateSampleProjects = (): Project[] => [
    {
      id: '1',
      name: 'Real-time Transcription Engine v2.0',
      status: 'active',
      priority: 'high',
      progress: 67,
      team: 'AI/ML',
      startDate: '2025-04-01',
      endDate: '2025-07-15',
      budget: 250000,
      spent: 167500,
      lead: 'Elena Rodriguez',
      description: 'Upgrade transcription accuracy and reduce latency',
      risks: ['Model training delays', 'GPU resource constraints']
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      status: 'active',
      priority: 'medium',
      progress: 34,
      team: 'Product Engineering',
      startDate: '2025-05-01',
      endDate: '2025-08-30',
      budget: 180000,
      spent: 61200,
      lead: 'Sarah Chen',
      description: 'Complete UI/UX overhaul for mobile applications',
      risks: ['Design approval delays', 'Platform compatibility']
    },
    {
      id: '3',
      name: 'Infrastructure Modernization',
      status: 'planning',
      priority: 'critical',
      progress: 12,
      team: 'Infrastructure',
      startDate: '2025-06-15',
      endDate: '2025-12-01',
      budget: 400000,
      spent: 48000,
      lead: 'David Kim',
      description: 'Migrate to microservices and implement auto-scaling',
      risks: ['Migration complexity', 'Downtime concerns']
    }
  ];

  const generateSampleMetrics = (): Metric[] => [
    {
      id: '1',
      name: 'Deployment Frequency',
      value: 23,
      target: 25,
      unit: 'per week',
      trend: 'up',
      category: 'engineering',
      lastUpdated: '2025-06-04T10:30:00Z'
    },
    {
      id: '2',
      name: 'Lead Time',
      value: 2.3,
      target: 2.0,
      unit: 'days',
      trend: 'down',
      category: 'engineering',
      lastUpdated: '2025-06-04T09:15:00Z'
    },
    {
      id: '3',
      name: 'Code Coverage',
      value: 87,
      target: 90,
      unit: '%',
      trend: 'up',
      category: 'quality',
      lastUpdated: '2025-06-04T11:00:00Z'
    },
    {
      id: '4',
      name: 'Team Velocity',
      value: 42,
      target: 40,
      unit: 'story points',
      trend: 'up',
      category: 'team',
      lastUpdated: '2025-06-04T08:45:00Z'
    }
  ];

  const generateSampleSystemHealth = (): SystemHealth[] => [
    {
      service: 'API Gateway',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 120,
      errorRate: 0.02,
      lastIncident: '2025-05-28T14:30:00Z'
    },
    {
      service: 'Transcription Service',
      status: 'warning',
      uptime: 98.9,
      responseTime: 850,
      errorRate: 0.15,
      lastIncident: '2025-06-03T09:15:00Z'
    },
    {
      service: 'Database Cluster',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 45,
      errorRate: 0.001,
      lastIncident: '2025-05-20T11:22:00Z'
    },
    {
      service: 'File Storage',
      status: 'critical',
      uptime: 95.2,
      responseTime: 2300,
      errorRate: 2.1,
      lastIncident: '2025-06-04T07:45:00Z'
    }
  ];

  const generateSampleMeetings = (): Meeting[] => [
    {
      id: '1',
      title: 'Engineering All-Hands',
      type: 'all-hands',
      date: '2025-06-04T15:00:00Z',
      attendees: 45,
      duration: 60,
      transcribed: true,
      insights: ['Team morale is high', 'Infrastructure concerns raised', 'Q3 roadmap approved'],
      actionItems: ['Schedule infrastructure review', 'Update project timelines', 'Plan team building event']
    },
    {
      id: '2',
      title: 'AI/ML Team Standup',
      type: 'standup',
      date: '2025-06-04T09:00:00Z',
      attendees: 8,
      duration: 15,
      transcribed: true,
      insights: ['Model training on track', 'GPU utilization optimized'],
      actionItems: ['Review training metrics', 'Test new model variant']
    },
    {
      id: '3',
      title: 'Architecture Review',
      type: 'review',
      date: '2025-06-03T14:00:00Z',
      attendees: 12,
      duration: 90,
      transcribed: true,
      insights: ['Microservices migration approved', 'Security review needed'],
      actionItems: ['Create migration plan', 'Schedule security audit']
    }
  ];

  const generateSampleAlerts = (): AlertItem[] => [
    {
      id: '1',
      title: 'File Storage Service Degraded',
      severity: 'critical',
      category: 'Infrastructure',
      timestamp: '2025-06-04T07:45:00Z',
      resolved: false,
      description: 'High response times and error rates detected'
    },
    {
      id: '2',
      title: 'Code Coverage Below Target',
      severity: 'medium',
      category: 'Quality',
      timestamp: '2025-06-04T06:30:00Z',
      resolved: false,
      description: 'Product Engineering team coverage dropped to 82%'
    },
    {
      id: '3',
      title: 'Sprint Burndown Behind Schedule',
      severity: 'low',
      category: 'Team',
      timestamp: '2025-06-03T18:00:00Z',
      resolved: true,
      description: 'AI/ML team sprint progress slower than expected'
    }
  ];

  const handleAiAnalysis = (prompt: string, file?: File) => {
    setPromptText(prompt);
    setSelectedFile(file || null);
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const analyzeTeamPerformance = () => {
    const teamData = teams.map(t => `${t.name}: ${t.productivity}% productivity, ${t.commits} commits, ${t.codeReviews} reviews`).join('. ');
    const prompt = `Analyze this engineering team performance data and provide insights on productivity, bottlenecks, and recommendations for improvement. Return JSON with keys "overall_health", "top_performers", "areas_for_improvement", "recommendations". Data: ${teamData}`;
    handleAiAnalysis(prompt);
    setShowAiModal(true);
  };

  const analyzeProjectRisks = () => {
    const projectData = projects.map(p => `${p.name}: ${p.status}, ${p.progress}% complete, risks: ${p.risks.join(', ')}`).join('. ');
    const prompt = `Analyze these project risks and provide a risk assessment with mitigation strategies. Return JSON with keys "high_risk_projects", "critical_risks", "mitigation_strategies", "timeline_impact". Data: ${projectData}`;
    handleAiAnalysis(prompt);
    setShowAiModal(true);
  };

  const generateExecutiveSummary = () => {
    const summary = {
      teams: teams.length,
      projects: projects.length,
      avgProductivity: teams.reduce((acc, t) => acc + t.productivity, 0) / teams.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.resolved).length
    };
    const prompt = `Generate an executive summary for a CTO based on this data. Include key insights, achievements, and concerns. Return JSON with keys "executive_summary", "key_achievements", "concerns", "next_quarter_focus". Data: ${JSON.stringify(summary)}`;
    handleAiAnalysis(prompt);
    setShowAiModal(true);
  };

  const exportData = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvData = [
        ['Type', 'Name', 'Status', 'Value', 'Last Updated'],
        ...teams.map(t => ['Team Member', t.name, t.availability, `${t.productivity}%`, t.joinDate]),
        ...projects.map(p => ['Project', p.name, p.status, `${p.progress}%`, p.startDate]),
        ...metrics.map(m => ['Metric', m.name, m.trend, `${m.value} ${m.unit}`, m.lastUpdated])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cto-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Basic CSV parsing logic would go here
        console.log('Importing data:', text);
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('cto-teams');
      localStorage.removeItem('cto-projects');
      localStorage.removeItem('cto-metrics');
      localStorage.removeItem('cto-system-health');
      localStorage.removeItem('cto-meetings');
      localStorage.removeItem('cto-alerts');
      setTeams([]);
      setProjects([]);
      setMetrics([]);
      setSystemHealth([]);
      setMeetings([]);
      setAlerts([]);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Type', 'Name', 'Role/Status', 'Team/Priority', 'Value1', 'Value2', 'Date'],
      ['Team Member', 'John Doe', 'Senior Engineer', 'Product Engineering', '85', '25', '2025-01-01'],
      ['Project', 'Sample Project', 'active', 'high', '50', '100000', '2025-06-01'],
      ['Metric', 'Code Coverage', 'up', 'quality', '85', '90', '2025-06-04']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cto-dashboard-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': case 'available': case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'warning': case 'busy': case 'on-hold':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'critical': case 'away': case 'planning':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <ArrowRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderDashboard = () => {
    const avgProductivity = teams.length > 0 ? teams.reduce((acc, t) => acc + t.productivity, 0) / teams.length : 0;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    const healthyServices = systemHealth.filter(s => s.status === 'healthy').length;

    const productivityData = teams.map(t => ({
      name: t.name.split(' ')[0],
      productivity: t.productivity,
      commits: t.commits
    }));

    const projectStatusData = [
      { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#10b981' },
      { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#f59e0b' },
      { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#6366f1' },
      { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#ef4444' }
    ];

    return (
      <div className="space-y-6" id="welcome_fallback">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card" id="generation_issue_fallback">
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-title">Team Productivity</div>
                <div className="stat-value">{avgProductivity.toFixed(1)}%</div>
                <div className="stat-desc">Average across all teams</div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-title">Active Projects</div>
                <div className="stat-value">{activeProjects}</div>
                <div className="stat-desc">Out of {projects.length} total</div>
              </div>
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-title">Critical Alerts</div>
                <div className="stat-value">{criticalAlerts}</div>
                <div className="stat-desc">Require immediate attention</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-title">System Health</div>
                <div className="stat-value">{healthyServices}/{systemHealth.length}</div>
                <div className="stat-desc">Services operational</div>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Team Productivity & Commits
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="productivity" fill="#8884d8" name="Productivity %" />
                <Bar dataKey="commits" fill="#82ca9d" name="Commits" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LucidePieChart className="w-5 h-5" />
              Project Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={analyzeTeamPerformance}
              className="btn btn-primary flex items-center gap-2"
              id="analyze-team-performance"
            >
              <Users className="w-4 h-4" />
              Analyze Team Performance
            </button>
            <button
              onClick={analyzeProjectRisks}
              className="btn bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Analyze Project Risks
            </button>
            <button
              onClick={generateExecutiveSummary}
              className="btn bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Executive Summary
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-gray-500">{alert.category}</div>
                  </div>
                </div>
                <div className={`badge ${
                  alert.resolved ? 'badge-success' : 'badge-error'
                }`}>
                  {alert.resolved ? 'Resolved' : 'Active'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTeams = () => {
    const filteredTeams = teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           team.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = !filterTeam || team.team === filterTeam;
      return matchesSearch && matchesTeam;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Engineering Teams</h2>
          <button
            onClick={() => setShowTeamModal(true)}
            className="btn btn-primary flex items-center gap-2"
            id="add-team-member"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="">All Teams</option>
            <option value="Product Engineering">Product Engineering</option>
            <option value="Platform">Platform</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(member => (
            <div key={member.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className={`badge ${getStatusColor(member.availability)}`}>
                  {member.availability}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Productivity</span>
                  <span className="font-semibold">{member.productivity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${member.productivity}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Commits</span>
                  <div className="font-semibold">{member.commits}</div>
                </div>
                <div>
                  <span className="text-gray-500">Reviews</span>
                  <div className="font-semibold">{member.codeReviews}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(member);
                    setShowTeamModal(true);
                  }}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setTeams(teams.filter(t => t.id !== member.id));
                  }}
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const filteredProjects = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Project Portfolio</h2>
          <button
            onClick={() => setShowProjectModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-gray-500">{project.description}</p>
                </div>
                <div className={`badge ${getStatusColor(project.status)}`}>
                  {project.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Progress</span>
                  <div className="font-semibold">{project.progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Budget</span>
                  <div className="font-semibold">${project.budget.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Spent: ${project.spent.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Team Lead</span>
                  <div className="font-semibold">{project.lead}</div>
                  <div className="text-sm text-gray-500">{project.team}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Timeline</span>
                  <div className="font-semibold">{new Date(project.endDate).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">Due date</div>
                </div>
              </div>

              {project.risks.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Risks:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.risks.map((risk, index) => (
                      <span key={index} className="badge bg-red-100 text-red-800 text-xs">
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(project);
                    setShowProjectModal(true);
                  }}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200">
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setProjects(projects.filter(p => p.id !== project.id));
                  }}
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Default View</label>
                <select
                  value={settings.defaultView}
                  onChange={(e) => setSettings({...settings, defaultView: e.target.value})}
                  className="input"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="teams">Teams</option>
                  <option value="projects">Projects</option>
                  <option value="metrics">Metrics</option>
                </select>
              </div>

              <div>
                <label className="form-label">Reporting Currency</label>
                <select
                  value={settings.reportingCurrency}
                  onChange={(e) => setSettings({...settings, reportingCurrency: e.target.value})}
                  className="input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="input"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="form-label">Notifications</span>
                <button
                  onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                  className={`theme-toggle ${settings.notifications ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <span className={`theme-toggle-thumb ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="form-label">Auto Refresh</span>
                <button
                  onClick={() => setSettings({...settings, autoRefresh: !settings.autoRefresh})}
                  className={`theme-toggle ${settings.autoRefresh ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <span className={`theme-toggle-thumb ${settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Import Data</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={importData}
                  className="input"
                />
                <p className="text-sm text-gray-500 mt-1">Upload CSV file to import data</p>
              </div>

              <button
                onClick={downloadTemplate}
                className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>

              <button
                onClick={() => exportData('csv')}
                className="btn bg-green-100 text-green-700 hover:bg-green-200 w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data (CSV)
              </button>

              <button
                onClick={clearAllData}
                className="btn bg-red-100 text-red-700 hover:bg-red-200 w-full flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="form-label">Dark Mode</span>
              <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`theme-toggle ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`theme-toggle-thumb ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderNavigation = () => {
    const navItems = [
      { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { key: 'teams', label: 'Teams', icon: Users },
      { key: 'projects', label: 'Projects', icon: Rocket },
      { key: 'metrics', label: 'Metrics', icon: Activity },
      { key: 'system', label: 'System', icon: Server },
      { key: 'meetings', label: 'Meetings', icon: MessageCircle },
      { key: 'reports', label: 'Reports', icon: FileText },
      { key: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">CTO Dashboard</span>
              </div>
              <div className="hidden md:flex space-x-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setCurrentView(item.key as ViewType)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        currentView === item.key
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'teams':
        return renderTeams();
      case 'projects':
        return renderProjects();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {renderNavigation()}
      
      <main className="container-wide py-8">
        {renderContent()}
      </main>

      {/* AI Modal */}
      {showAiModal && (
        <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Analysis Results
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mt-4">
              {isAiLoading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Analyzing data...</span>
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <p>Error: {aiError.message || 'Failed to analyze data'}</p>
                </div>
              )}
              
              {aiResult && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAiModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container-wide text-center text-gray-500 dark:text-gray-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;