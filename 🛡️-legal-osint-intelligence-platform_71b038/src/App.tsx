import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Shield, Search, FileText, Settings, Upload, Download, Trash2, 
  Eye, AlertTriangle, TrendingUp, Globe, Brain, Database,
  Filter, Calendar, User, Target, Zap, Lock, Key, Bell,
  BarChart3, PieChart as LucidePieChart, Activity, Clock,
  CheckCircle, XCircle, AlertCircle, Info, Plus, Edit,
  X, ChevronDown, ChevronUp, ExternalLink, Copy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

// Types and Interfaces
interface IntelligenceReport {
  id: string;
  title: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  content: string;
  entities: string[];
  tags: string[];
  analysisResult?: string;
  status: 'new' | 'investigating' | 'resolved' | 'archived';
}

interface MonitoringTarget {
  id: string;
  name: string;
  type: 'brand' | 'competitor' | 'keyword' | 'domain';
  value: string;
  active: boolean;
  alertLevel: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface AnalysisResult {
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  recommendations: string[];
  confidence: number;
}

interface DashboardStats {
  totalReports: number;
  activeThreats: number;
  monitoringTargets: number;
  alertsToday: number;
}

type TabType = 'dashboard' | 'investigation' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main app state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [monitoringTargets, setMonitoringTargets] = useState<MonitoringTarget[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalReports: 0,
    activeThreats: 0,
    monitoringTargets: 0,
    alertsToday: 0
  });

  // AI Analysis state
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IntelligenceReport | null>(null);
  const [newTarget, setNewTarget] = useState({
    name: '',
    type: 'brand' as const,
    value: '',
    alertLevel: 'medium' as const
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedReports = localStorage.getItem('osint_reports');
    const savedTargets = localStorage.getItem('osint_targets');
    
    if (savedReports) {
      const parsedReports = JSON.parse(savedReports);
      setReports(parsedReports);
      updateDashboardStats(parsedReports, JSON.parse(savedTargets || '[]'));
    } else {
      // Initialize with sample data
      const sampleReports = generateSampleReports();
      setReports(sampleReports);
      localStorage.setItem('osint_reports', JSON.stringify(sampleReports));
    }

    if (savedTargets) {
      const parsedTargets = JSON.parse(savedTargets);
      setMonitoringTargets(parsedTargets);
    } else {
      // Initialize with sample targets
      const sampleTargets = generateSampleTargets();
      setMonitoringTargets(sampleTargets);
      localStorage.setItem('osint_targets', JSON.stringify(sampleTargets));
    }
  }, []);

  // Update dashboard stats
  const updateDashboardStats = (reportsList: IntelligenceReport[], targetsList: MonitoringTarget[]) => {
    const today = new Date().toDateString();
    const todayReports = reportsList.filter(r => new Date(r.timestamp).toDateString() === today);
    const activeThreats = reportsList.filter(r => r.severity === 'high' || r.severity === 'critical').length;
    
    setDashboardStats({
      totalReports: reportsList.length,
      activeThreats,
      monitoringTargets: targetsList.filter(t => t.active).length,
      alertsToday: todayReports.length
    });
  };

  // Generate sample data
  const generateSampleReports = (): IntelligenceReport[] => {
    const sources = ['Dark Web Monitor', 'Social Media Scanner', 'News Aggregator', 'Deep Web Crawler', 'Brand Monitor'];
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const statuses: Array<'new' | 'investigating' | 'resolved' | 'archived'> = ['new', 'investigating', 'resolved', 'archived'];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `report_${i + 1}`,
      title: `Intelligence Report ${i + 1}: ${['Data Breach Alert', 'Competitor Analysis', 'Brand Mention', 'Threat Detection', 'Fraud Indicator'][i % 5]}`,
      source: sources[i % sources.length],
      severity: severities[i % severities.length],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      content: `Detailed intelligence report content for investigation ${i + 1}. This contains sensitive information regarding potential security threats and requires immediate attention from security analysts.`,
      entities: ['Company XYZ', 'John Doe', '192.168.1.1', 'admin@example.com'].slice(0, Math.ceil(Math.random() * 4)),
      tags: ['cybersecurity', 'threat-intel', 'osint', 'investigation'].slice(0, Math.ceil(Math.random() * 4)),
      status: statuses[i % statuses.length]
    }));
  };

  const generateSampleTargets = (): MonitoringTarget[] => {
    return [
      {
        id: 'target_1',
        name: 'Company Brand Monitor',
        type: 'brand',
        value: 'YourCompany',
        active: true,
        alertLevel: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: 'target_2',
        name: 'Competitor Analysis',
        type: 'competitor',
        value: 'CompetitorCorp',
        active: true,
        alertLevel: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        id: 'target_3',
        name: 'Security Keywords',
        type: 'keyword',
        value: 'data breach, cyber attack, vulnerability',
        active: true,
        alertLevel: 'high',
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Chart data
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyReports = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      reports: reports.filter(r => r.timestamp.split('T')[0] === date).length,
      threats: reports.filter(r => r.timestamp.split('T')[0] === date && (r.severity === 'high' || r.severity === 'critical')).length
    }));

    const severityData = [
      { name: 'Low', value: reports.filter(r => r.severity === 'low').length, color: '#10B981' },
      { name: 'Medium', value: reports.filter(r => r.severity === 'medium').length, color: '#F59E0B' },
      { name: 'High', value: reports.filter(r => r.severity === 'high').length, color: '#EF4444' },
      { name: 'Critical', value: reports.filter(r => r.severity === 'critical').length, color: '#7C2D12' }
    ];

    return { dailyReports, severityData };
  };

  // AI Analysis functions
  const handleAIAnalysis = async () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide text input or select a file for analysis.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      const analysisPrompt = selectedFile 
        ? `Analyze this file for OSINT intelligence gathering. Extract entities, assess threat levels, identify suspicious patterns, and provide security recommendations. Return detailed analysis in structured format.`
        : `Perform OSINT analysis on the following input: "${aiPrompt}". Identify entities, assess security implications, detect potential threats, and provide actionable intelligence. Format the response with clear sections for entities, threat assessment, and recommendations.`;

      aiLayerRef.current?.sendToAI(analysisPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI analysis request");
    }
  };

  const createReportFromAI = () => {
    if (!aiResult) return;

    const newReport: IntelligenceReport = {
      id: `ai_report_${Date.now()}`,
      title: `AI Analysis Report - ${new Date().toLocaleString()}`,
      source: 'AI Analysis Engine',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      content: aiPrompt || 'File analysis',
      entities: [],
      tags: ['ai-analysis', 'automated'],
      analysisResult: aiResult,
      status: 'new'
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem('osint_reports', JSON.stringify(updatedReports));
    updateDashboardStats(updatedReports, monitoringTargets);
    
    setAiPrompt('');
    setSelectedFile(null);
    setAiResult(null);
    setActiveTab('reports');
  };

  // Target management
  const addMonitoringTarget = () => {
    if (!newTarget.name.trim() || !newTarget.value.trim()) return;

    const target: MonitoringTarget = {
      id: `target_${Date.now()}`,
      name: newTarget.name,
      type: newTarget.type,
      value: newTarget.value,
      active: true,
      alertLevel: newTarget.alertLevel,
      createdAt: new Date().toISOString()
    };

    const updatedTargets = [...monitoringTargets, target];
    setMonitoringTargets(updatedTargets);
    localStorage.setItem('osint_targets', JSON.stringify(updatedTargets));
    updateDashboardStats(reports, updatedTargets);

    setNewTarget({ name: '', type: 'brand', value: '', alertLevel: 'medium' });
    setShowAddTargetModal(false);
  };

  const toggleTargetStatus = (targetId: string) => {
    const updatedTargets = monitoringTargets.map(target =>
      target.id === targetId ? { ...target, active: !target.active } : target
    );
    setMonitoringTargets(updatedTargets);
    localStorage.setItem('osint_targets', JSON.stringify(updatedTargets));
    updateDashboardStats(reports, updatedTargets);
  };

  const deleteTarget = (targetId: string) => {
    const updatedTargets = monitoringTargets.filter(target => target.id !== targetId);
    setMonitoringTargets(updatedTargets);
    localStorage.setItem('osint_targets', JSON.stringify(updatedTargets));
    updateDashboardStats(reports, updatedTargets);
  };

  // Report management
  const updateReportStatus = (reportId: string, status: IntelligenceReport['status']) => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, status } : report
    );
    setReports(updatedReports);
    localStorage.setItem('osint_reports', JSON.stringify(updatedReports));
  };

  const deleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('osint_reports', JSON.stringify(updatedReports));
    updateDashboardStats(updatedReports, monitoringTargets);
  };

  // Filtering and searching
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.entities.some(entity => entity.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  // Utility functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      case 'critical': return 'text-red-800 bg-red-200 dark:text-red-200 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'investigating': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
      case 'resolved': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'archived': return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  // Export functionality
  const exportData = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const csvContent = [
        ['ID', 'Title', 'Source', 'Severity', 'Status', 'Timestamp', 'Entities', 'Tags'],
        ...filteredReports.map(report => [
          report.id,
          report.title,
          report.source,
          report.severity,
          report.status,
          report.timestamp,
          report.entities.join(';'),
          report.tags.join(';')
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osint_reports_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAllData = () => {
    setReports([]);
    setMonitoringTargets([]);
    localStorage.removeItem('osint_reports');
    localStorage.removeItem('osint_targets');
    setDashboardStats({ totalReports: 0, activeThreats: 0, monitoringTargets: 0, alertsToday: 0 });
  };

  const { dailyReports, severityData } = getChartData();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">OSINT Intelligence Platform</h1>
          <p className="text-gray-400 mt-2">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-900 text-white">
      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">OSINT Intelligence Platform</h1>
              <p className="text-sm text-gray-400">Legal Intelligence & Security Monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{currentUser.first_name} {currentUser.last_name}</span>
              <span className="text-xs text-gray-500">({currentUser.role})</span>
            </div>
            <button
              onClick={logout}
              className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Lock className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 px-6 py-2 border-b border-gray-700">
        <div className="flex space-x-1">
          {[
            { id: 'dashboard', label: 'Intelligence Dashboard', icon: Activity },
            { id: 'investigation', label: 'AI Investigation Hub', icon: Brain },
            { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings & Targets', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`${id}-tab`}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card bg-gray-800 border border-gray-700">
                <div className="stat-title text-gray-400">Total Reports</div>
                <div className="stat-value text-3xl text-blue-400">{dashboardStats.totalReports}</div>
                <div className="stat-desc text-gray-500">Intelligence collected</div>
              </div>
              <div className="stat-card bg-gray-800 border border-gray-700">
                <div className="stat-title text-gray-400">Active Threats</div>
                <div className="stat-value text-3xl text-red-400">{dashboardStats.activeThreats}</div>
                <div className="stat-desc text-gray-500">High/Critical severity</div>
              </div>
              <div className="stat-card bg-gray-800 border border-gray-700">
                <div className="stat-title text-gray-400">Monitoring Targets</div>
                <div className="stat-value text-3xl text-green-400">{dashboardStats.monitoringTargets}</div>
                <div className="stat-desc text-gray-500">Currently active</div>
              </div>
              <div className="stat-card bg-gray-800 border border-gray-700">
                <div className="stat-title text-gray-400">Today's Alerts</div>
                <div className="stat-value text-3xl text-yellow-400">{dashboardStats.alertsToday}</div>
                <div className="stat-desc text-gray-500">New today</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-gray-800 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Weekly Intelligence Activity
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyReports}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Area type="monotone" dataKey="reports" stroke="#3B82F6" fill="#1E40AF" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="threats" stroke="#EF4444" fill="#DC2626" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card bg-gray-800 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                  Threat Severity Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="card bg-gray-800 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-400" />
                Recent High-Priority Alerts
              </h3>
              <div className="space-y-3">
                {reports
                  .filter(r => r.severity === 'high' || r.severity === 'critical')
                  .slice(0, 5)
                  .map(report => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${report.severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-gray-400">{report.source} • {new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                        {report.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investigation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Brain className="w-6 h-6 mr-2 text-purple-400" />
                AI Investigation Hub
              </h2>
            </div>

            {/* AI Analysis Interface */}
            <div className="card bg-gray-800 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">AI-Powered Intelligence Analysis</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label text-gray-300">Investigation Query or Context</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter text to analyze for intelligence gathering, entity extraction, threat assessment..."
                    className="input bg-gray-900 border-gray-600 text-white h-32 resize-none"
                  />
                </div>

                <div>
                  <label className="form-label text-gray-300">Upload Document/Image for Analysis</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="input bg-gray-900 border-gray-600 text-white"
                    />
                    {selectedFile && (
                      <span className="text-sm text-green-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAIAnalysis}
                  disabled={aiLoading || (!aiPrompt.trim() && !selectedFile)}
                  className="btn bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                  {aiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Error Display */}
            {aiError && (
              <div className="alert alert-error bg-red-900 border border-red-700">
                <XCircle className="w-5 h-5" />
                <p>Analysis Error: {aiError.message || aiError}</p>
              </div>
            )}

            {/* AI Results */}
            {aiResult && (
              <div className="card bg-gray-800 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-green-400" />
                    AI Analysis Results
                  </h3>
                  <button
                    onClick={createReportFromAI}
                    className="btn bg-green-600 hover:bg-green-700 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Report
                  </button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                    {aiResult}
                  </pre>
                </div>
                <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-300 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    AI analysis results should be verified and cross-referenced with additional sources before taking action.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-gray-800 border border-gray-700 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h4 className="font-semibold mb-2">Entity Extraction</h4>
                <p className="text-sm text-gray-400">Identify people, organizations, locations, and IP addresses from text</p>
              </div>
              <div className="card bg-gray-800 border border-gray-700 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <h4 className="font-semibold mb-2">Threat Assessment</h4>
                <p className="text-sm text-gray-400">Analyze content for security threats and risk indicators</p>
              </div>
              <div className="card bg-gray-800 border border-gray-700 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h4 className="font-semibold mb-2">OSINT Correlation</h4>
                <p className="text-sm text-gray-400">Cross-reference data with open source intelligence</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="w-6 h-6 mr-2 text-green-400" />
                Intelligence Reports & Analytics
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportData('csv')}
                  className="btn bg-blue-600 hover:bg-blue-700 flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card bg-gray-800 border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports, entities, content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 bg-gray-900 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="input bg-gray-900 border-gray-600 text-white"
                  >
                    <option value="all">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="card bg-gray-800 border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-300">Report</th>
                      <th className="text-left p-3 text-gray-300">Source</th>
                      <th className="text-left p-3 text-gray-300">Severity</th>
                      <th className="text-left p-3 text-gray-300">Status</th>
                      <th className="text-left p-3 text-gray-300">Timestamp</th>
                      <th className="text-left p-3 text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
                      <tr key={report.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-white">{report.title}</p>
                            <p className="text-sm text-gray-400 truncate max-w-xs">{report.content}</p>
                            {report.entities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {report.entities.slice(0, 3).map(entity => (
                                  <span key={entity} className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                                    {entity}
                                  </span>
                                ))}
                                {report.entities.length > 3 && (
                                  <span className="text-xs text-gray-500">+{report.entities.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-300">{report.source}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {report.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report.id, e.target.value as IntelligenceReport['status'])}
                            className={`text-xs px-2 py-1 rounded border-0 ${getStatusColor(report.status)}`}
                          >
                            <option value="new">New</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-400 text-sm">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteReport(report.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Settings className="w-6 h-6 mr-2 text-gray-400" />
              Settings & Configuration
            </h2>

            {/* Monitoring Targets */}
            <div className="card bg-gray-800 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-400" />
                  Monitoring Targets
                </h3>
                <button
                  onClick={() => setShowAddTargetModal(true)}
                  className="btn bg-green-600 hover:bg-green-700 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Target
                </button>
              </div>

              <div className="space-y-3">
                {monitoringTargets.map(target => (
                  <div key={target.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${target.active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <div>
                        <p className="font-medium text-white">{target.name}</p>
                        <p className="text-sm text-gray-400">
                          {target.type.charAt(0).toUpperCase() + target.type.slice(1)}: {target.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(target.alertLevel)}`}>
                        {target.alertLevel.toUpperCase()}
                      </span>
                      <button
                        onClick={() => toggleTargetStatus(target.id)}
                        className={`btn text-sm ${target.active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {target.active ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => deleteTarget(target.id)}
                        className="btn bg-red-600 hover:bg-red-700 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Management */}
            <div className="card bg-gray-800 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-400" />
                Data Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-gray-400">Download all intelligence reports and targets</p>
                  </div>
                  <button
                    onClick={() => exportData('csv')}
                    className="btn bg-blue-600 hover:bg-blue-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium text-red-400">Clear All Data</p>
                    <p className="text-sm text-gray-400">Permanently delete all reports and targets</p>
                  </div>
                  <button
                    onClick={clearAllData}
                    className="btn bg-red-600 hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="card bg-gray-800 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-400" />
                System Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Reports</p>
                  <p className="text-lg font-semibold">{reports.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Targets</p>
                  <p className="text-lg font-semibold">{monitoringTargets.filter(t => t.active).length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Data Storage</p>
                  <p className="text-lg font-semibold">Local Browser Storage</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Target Modal */}
      {showAddTargetModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTargetModal(false)}>
          <div className="modal-content bg-gray-800 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-white">Add Monitoring Target</h3>
              <button
                onClick={() => setShowAddTargetModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label text-gray-300">Target Name</label>
                <input
                  type="text"
                  value={newTarget.name}
                  onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                  className="input bg-gray-900 border-gray-600 text-white"
                  placeholder="e.g., Company Brand Monitor"
                />
              </div>
              <div>
                <label className="form-label text-gray-300">Target Type</label>
                <select
                  value={newTarget.type}
                  onChange={(e) => setNewTarget({ ...newTarget, type: e.target.value as typeof newTarget.type })}
                  className="input bg-gray-900 border-gray-600 text-white"
                >
                  <option value="brand">Brand</option>
                  <option value="competitor">Competitor</option>
                  <option value="keyword">Keywords</option>
                  <option value="domain">Domain</option>
                </select>
              </div>
              <div>
                <label className="form-label text-gray-300">Target Value</label>
                <input
                  type="text"
                  value={newTarget.value}
                  onChange={(e) => setNewTarget({ ...newTarget, value: e.target.value })}
                  className="input bg-gray-900 border-gray-600 text-white"
                  placeholder="Enter the value to monitor"
                />
              </div>
              <div>
                <label className="form-label text-gray-300">Alert Level</label>
                <select
                  value={newTarget.alertLevel}
                  onChange={(e) => setNewTarget({ ...newTarget, alertLevel: e.target.value as typeof newTarget.alertLevel })}
                  className="input bg-gray-900 border-gray-600 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAddTargetModal(false)}
                className="btn bg-gray-600 hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={addMonitoringTarget}
                className="btn bg-green-600 hover:bg-green-700 text-white"
              >
                Add Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-content bg-gray-800 border border-gray-700 max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-white">Intelligence Report Details</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Source</p>
                  <p className="font-medium text-white">{selectedReport.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Timestamp</p>
                  <p className="font-medium text-white">{new Date(selectedReport.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Severity</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Content</p>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-300">{selectedReport.content}</p>
                </div>
              </div>

              {selectedReport.analysisResult && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">AI Analysis Result</p>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                      {selectedReport.analysisResult}
                    </pre>
                  </div>
                </div>
              )}

              {selectedReport.entities.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Extracted Entities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.entities.map(entity => (
                      <span key={entity} className="px-3 py-1 bg-blue-900 text-blue-300 text-sm rounded-full">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowReportModal(false)}
                className="btn bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4 text-center">
        <p className="text-sm text-gray-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;