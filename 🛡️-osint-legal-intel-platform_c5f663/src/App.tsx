import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  LogOut, 
  ChartBar, 
  Globe, 
  Zap, 
  Target, 
  Brain,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

// Types and Interfaces
interface ThreatIntelligence {
  id: string;
  source: string;
  type: 'brand_violation' | 'fraud_attempt' | 'competitor_activity' | 'dark_web';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  entities: string[];
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  aiAnalysis?: string;
  riskScore: number;
}

interface MonitoringTarget {
  id: string;
  name: string;
  type: 'brand' | 'competitor' | 'keyword' | 'domain';
  value: string;
  isActive: boolean;
  lastCheck: string;
  threatCount: number;
}

interface IntelligenceReport {
  id: string;
  title: string;
  type: 'summary' | 'threat_assessment' | 'competitor_analysis';
  createdDate: string;
  summary: string;
  findings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AppSettings {
  darkMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  alertThreshold: 'low' | 'medium' | 'high';
  language: string;
  timezone: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    autoRefresh: true,
    refreshInterval: 300,
    alertThreshold: 'medium',
    language: 'en',
    timezone: 'UTC'
  });

  // AI state
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);

  // Data state
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [monitoringTargets, setMonitoringTargets] = useState<MonitoringTarget[]>([]);
  const [reports, setReports] = useState<IntelligenceReport[]>([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<any>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedThreats = localStorage.getItem('osint_threats');
    const savedTargets = localStorage.getItem('osint_targets');
    const savedReports = localStorage.getItem('osint_reports');
    const savedSettings = localStorage.getItem('osint_settings');

    if (savedThreats) {
      setThreats(JSON.parse(savedThreats));
    } else {
      // Initialize with sample data
      const sampleThreats: ThreatIntelligence[] = [
        {
          id: '1',
          source: 'Dark Web Forum',
          type: 'brand_violation',
          severity: 'high',
          description: 'Counterfeit products using company logo found on marketplace',
          entities: ['CompanyLogo', 'CounterfeitGoods', 'OnlineMarketplace'],
          timestamp: '2025-06-07T10:30:00Z',
          status: 'investigating',
          riskScore: 8.5
        },
        {
          id: '2',
          source: 'Social Media Monitor',
          type: 'fraud_attempt',
          severity: 'critical',
          description: 'Phishing campaign targeting company customers detected',
          entities: ['PhishingEmail', 'CustomerData', 'MaliciousDomain'],
          timestamp: '2025-06-07T09:15:00Z',
          status: 'new',
          riskScore: 9.2
        },
        {
          id: '3',
          source: 'Competitor Analysis',
          type: 'competitor_activity',
          severity: 'medium',
          description: 'Competitor launched similar product with aggressive pricing',
          entities: ['CompetitorX', 'ProductLaunch', 'PricingStrategy'],
          timestamp: '2025-06-07T08:45:00Z',
          status: 'resolved',
          riskScore: 6.1
        }
      ];
      setThreats(sampleThreats);
      localStorage.setItem('osint_threats', JSON.stringify(sampleThreats));
    }

    if (savedTargets) {
      setMonitoringTargets(JSON.parse(savedTargets));
    } else {
      const sampleTargets: MonitoringTarget[] = [
        {
          id: '1',
          name: 'Brand Keywords',
          type: 'keyword',
          value: 'CompanyName, BrandName, ProductName',
          isActive: true,
          lastCheck: '2025-06-07T10:00:00Z',
          threatCount: 15
        },
        {
          id: '2',
          name: 'Competitor Domain',
          type: 'domain',
          value: 'competitor-example.com',
          isActive: true,
          lastCheck: '2025-06-07T09:30:00Z',
          threatCount: 8
        },
        {
          id: '3',
          name: 'Executive Names',
          type: 'keyword',
          value: 'CEO Name, CTO Name, CFO Name',
          isActive: true,
          lastCheck: '2025-06-07T09:45:00Z',
          threatCount: 3
        }
      ];
      setMonitoringTargets(sampleTargets);
      localStorage.setItem('osint_targets', JSON.stringify(sampleTargets));
    }

    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      const sampleReports: IntelligenceReport[] = [
        {
          id: '1',
          title: 'Weekly Threat Summary',
          type: 'summary',
          createdDate: '2025-06-07',
          summary: 'Analysis of threats detected this week shows increased phishing activity',
          findings: ['23 new threats detected', '5 critical severity items', '12 brand violations'],
          recommendations: ['Increase email security measures', 'Monitor dark web more frequently'],
          riskLevel: 'high'
        },
        {
          id: '2',
          title: 'Competitor Analysis Report',
          type: 'competitor_analysis',
          createdDate: '2025-06-06',
          summary: 'Comprehensive analysis of competitor activities and market positioning',
          findings: ['New product launches', 'Pricing strategy changes', 'Marketing campaign analysis'],
          recommendations: ['Adjust pricing strategy', 'Enhance product features'],
          riskLevel: 'medium'
        }
      ];
      setReports(sampleReports);
      localStorage.setItem('osint_reports', JSON.stringify(sampleReports));
    }

    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setIsDarkMode(parsedSettings.darkMode);
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save data to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // AI Analysis Functions
  const handleAnalyzeDocument = async () => {
    if (!selectedFile && !promptText.trim()) {
      setAiError("Please provide a document or text to analyze");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const analysisPrompt = promptText.trim() || "Analyze this document for security threats, brand mentions, fraud indicators, and competitor intelligence. Extract key entities and provide a risk assessment. Return JSON with keys: 'entities', 'threats', 'risk_score', 'summary', 'recommendations'";

    try {
      aiLayerRef.current?.sendToAI(analysisPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI analysis request");
    }
  };

  const handleProcessAiResult = (result: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);
      if (parsed.entities && parsed.threats && parsed.risk_score) {
        // Create new threat from AI analysis
        const newThreat: ThreatIntelligence = {
          id: Date.now().toString(),
          source: 'AI Analysis',
          type: 'fraud_attempt',
          severity: parsed.risk_score > 7 ? 'high' : parsed.risk_score > 5 ? 'medium' : 'low',
          description: parsed.summary || 'AI-detected threat from document analysis',
          entities: parsed.entities || [],
          timestamp: new Date().toISOString(),
          status: 'new',
          aiAnalysis: result,
          riskScore: parsed.risk_score || 5.0
        };

        const updatedThreats = [newThreat, ...threats];
        setThreats(updatedThreats);
        saveToStorage('osint_threats', updatedThreats);
      }
    } catch {
      // If not JSON, treat as regular analysis
      const newThreat: ThreatIntelligence = {
        id: Date.now().toString(),
        source: 'AI Analysis',
        type: 'dark_web',
        severity: 'medium',
        description: 'AI analysis results from uploaded content',
        entities: [],
        timestamp: new Date().toISOString(),
        status: 'new',
        aiAnalysis: result,
        riskScore: 6.0
      };

      const updatedThreats = [newThreat, ...threats];
      setThreats(updatedThreats);
      saveToStorage('osint_threats', updatedThreats);
    }
  };

  // CRUD Functions
  const addThreat = (threat: Omit<ThreatIntelligence, 'id'>) => {
    const newThreat: ThreatIntelligence = {
      ...threat,
      id: Date.now().toString()
    };
    const updatedThreats = [newThreat, ...threats];
    setThreats(updatedThreats);
    saveToStorage('osint_threats', updatedThreats);
  };

  const updateThreat = (id: string, updates: Partial<ThreatIntelligence>) => {
    const updatedThreats = threats.map(threat => 
      threat.id === id ? { ...threat, ...updates } : threat
    );
    setThreats(updatedThreats);
    saveToStorage('osint_threats', updatedThreats);
  };

  const deleteThreat = (id: string) => {
    const updatedThreats = threats.filter(threat => threat.id !== id);
    setThreats(updatedThreats);
    saveToStorage('osint_threats', updatedThreats);
  };

  const addMonitoringTarget = (target: Omit<MonitoringTarget, 'id'>) => {
    const newTarget: MonitoringTarget = {
      ...target,
      id: Date.now().toString()
    };
    const updatedTargets = [newTarget, ...monitoringTargets];
    setMonitoringTargets(updatedTargets);
    saveToStorage('osint_targets', updatedTargets);
  };

  const deleteMonitoringTarget = (id: string) => {
    const updatedTargets = monitoringTargets.filter(target => target.id !== id);
    setMonitoringTargets(updatedTargets);
    saveToStorage('osint_targets', updatedTargets);
  };

  // Filter functions
  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.entities.some(entity => entity.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesType = filterType === 'all' || threat.type === filterType;
    return matchesSearch && matchesSeverity && matchesType;
  });

  // Generate CSV export
  const exportToCSV = () => {
    const headers = ['ID', 'Source', 'Type', 'Severity', 'Description', 'Entities', 'Timestamp', 'Status', 'Risk Score'];
    const csvData = threats.map(threat => [
      threat.id,
      threat.source,
      threat.type,
      threat.severity,
      threat.description,
      threat.entities.join('; '),
      threat.timestamp,
      threat.status,
      threat.riskScore.toString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint_threats_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import CSV
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedThreats: ThreatIntelligence[] = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: (Date.now() + index).toString(),
              source: values[1] || 'Imported',
              type: (values[2] as ThreatIntelligence['type']) || 'fraud_attempt',
              severity: (values[3] as ThreatIntelligence['severity']) || 'medium',
              description: values[4] || 'Imported threat',
              entities: values[5] ? values[5].split('; ') : [],
              timestamp: values[6] || new Date().toISOString(),
              status: (values[7] as ThreatIntelligence['status']) || 'new',
              riskScore: parseFloat(values[8]) || 5.0
            };
          });

        const updatedThreats = [...importedThreats, ...threats];
        setThreats(updatedThreats);
        saveToStorage('osint_threats', updatedThreats);
      } catch (error) {
        setAiError('Failed to import CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Download template
  const downloadTemplate = () => {
    const templateHeaders = ['ID', 'Source', 'Type', 'Severity', 'Description', 'Entities', 'Timestamp', 'Status', 'Risk Score'];
    const templateData = [
      ['1', 'Example Source', 'fraud_attempt', 'high', 'Example threat description', 'Entity1; Entity2', '2025-06-07T10:00:00Z', 'new', '8.5']
    ];
    
    const csvContent = [templateHeaders, ...templateData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'osint_threats_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dashboard metrics
  const getDashboardMetrics = () => {
    const totalThreats = threats.length;
    const criticalThreats = threats.filter(t => t.severity === 'critical').length;
    const activeTargets = monitoringTargets.filter(t => t.isActive).length;
    const recentThreats = threats.filter(t => {
      const threatDate = new Date(t.timestamp);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return threatDate > oneDayAgo;
    }).length;

    return { totalThreats, criticalThreats, activeTargets, recentThreats };
  };

  const metrics = getDashboardMetrics();

  // Chart data
  const threatsByType = [
    { name: 'Brand Violations', value: threats.filter(t => t.type === 'brand_violation').length, color: '#ff6b6b' },
    { name: 'Fraud Attempts', value: threats.filter(t => t.type === 'fraud_attempt').length, color: '#4ecdc4' },
    { name: 'Competitor Activity', value: threats.filter(t => t.type === 'competitor_activity').length, color: '#45b7d1' },
    { name: 'Dark Web', value: threats.filter(t => t.type === 'dark_web').length, color: '#96ceb4' }
  ];

  const severityData = [
    { name: 'Critical', count: threats.filter(t => t.severity === 'critical').length },
    { name: 'High', count: threats.filter(t => t.severity === 'high').length },
    { name: 'Medium', count: threats.filter(t => t.severity === 'medium').length },
    { name: 'Low', count: threats.filter(t => t.severity === 'low').length }
  ];

  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayThreats = threats.filter(t => {
      const threatDate = new Date(t.timestamp);
      return threatDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString(),
      threats: dayThreats.length,
      riskScore: dayThreats.length > 0 ? dayThreats.reduce((sum, t) => sum + t.riskScore, 0) / dayThreats.length : 0
    };
  });

  // Modal handlers
  const openModal = (type: string, data?: any) => {
    setModalType(type);
    setShowAddModal(true);
    setFormData(data || {});
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowReportModal(false);
    setModalType('');
    setFormData({});
    document.body.classList.remove('modal-open');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalType === 'threat') {
      if (formData.id) {
        updateThreat(formData.id, formData);
      } else {
        addThreat({
          source: formData.source || '',
          type: formData.type || 'fraud_attempt',
          severity: formData.severity || 'medium',
          description: formData.description || '',
          entities: formData.entities ? formData.entities.split(',').map((e: string) => e.trim()) : [],
          timestamp: new Date().toISOString(),
          status: 'new',
          riskScore: parseFloat(formData.riskScore) || 5.0
        });
      }
    } else if (modalType === 'target') {
      addMonitoringTarget({
        name: formData.name || '',
        type: formData.type || 'keyword',
        value: formData.value || '',
        isActive: true,
        lastCheck: new Date().toISOString(),
        threatCount: 0
      });
    }
    
    closeModal();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'investigating': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'false_positive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Render dashboard
  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            OSINT Intelligence Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time threat monitoring and intelligence analysis
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className="btn btn-primary flex items-center gap-2"
            id="reports-quick-access"
          >
            <FileText className="w-4 h-4" />
            View Reports
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-overview">
        <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-blue-100">Total Threats</div>
              <div className="stat-value text-white">{metrics.totalThreats}</div>
            </div>
            <Shield className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-red-100">Critical Threats</div>
              <div className="stat-value text-white">{metrics.criticalThreats}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-green-100">Active Targets</div>
              <div className="stat-value text-white">{metrics.activeTargets}</div>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-purple-100">Recent (24h)</div>
              <div className="stat-value text-white">{metrics.recentThreats}</div>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={threatsByType}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {threatsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">7-Day Threat Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="threats" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
            <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Threats */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Threats</h3>
          <button
            onClick={() => setActiveTab('threats')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {threats.slice(0, 5).map((threat) => (
            <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${getSeverityColor(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{threat.source}</span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white">{threat.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Risk: {threat.riskScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(threat.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render threats
  const renderThreats = () => (
    <div className="space-y-6" id="threats-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Threat Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and analyze security threats across all sources
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => openModal('threat')}
            className="btn btn-primary flex items-center gap-2"
            id="add-threat-btn"
          >
            <Plus className="w-4 h-4" />
            Add Threat
          </button>
          <button
            onClick={exportToCSV}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            id="export-threats-btn"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search threats..."
                className="input pl-10"
                id="threat-search"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input"
              id="severity-filter"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="form-label">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
              id="type-filter"
            >
              <option value="all">All Types</option>
              <option value="brand_violation">Brand Violation</option>
              <option value="fraud_attempt">Fraud Attempt</option>
              <option value="competitor_activity">Competitor Activity</option>
              <option value="dark_web">Dark Web</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSeverity('all');
                setFilterType('all');
              }}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Threat Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Analysis Prompt (Optional)</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter specific analysis instructions or leave blank for automatic analysis..."
              className="input h-24 resize-none"
              id="ai-prompt-input"
            />
          </div>
          <div>
            <label className="form-label">Upload Document</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="input"
              id="document-upload"
            />
            <button
              onClick={handleAnalyzeDocument}
              disabled={isAiLoading}
              className="btn btn-primary mt-3 w-full flex items-center justify-center gap-2"
              id="analyze-document-btn"
            >
              {isAiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>
        
        {aiError && (
          <div className="alert alert-error mt-4">
            <XCircle className="w-5 h-5" />
            <p>{aiError}</p>
          </div>
        )}
        
        {aiResult && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Analysis Results:</h4>
            <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
              {aiResult}
            </div>
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="csv-import" className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import CSV
            </label>
            <input
              id="csv-import"
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
          <button
            onClick={downloadTemplate}
            className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>

      {/* Threats Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Source</th>
                <th className="table-header">Type</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Description</th>
                <th className="table-header">Risk Score</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell font-medium">{threat.source}</td>
                  <td className="table-cell">
                    <span className="capitalize">{threat.type.replace('_', ' ')}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getSeverityColor(threat.severity)}`}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell max-w-xs">
                    <div className="truncate" title={threat.description}>
                      {threat.description}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{threat.riskScore.toFixed(1)}</span>
                      <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(threat.riskScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(threat.status)}`}>
                      {threat.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    {new Date(threat.timestamp).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('threat', threat)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedThreat(threat)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteThreat(threat.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                        title="Delete"
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

        {filteredThreats.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No threats found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );

  // Render monitoring targets
  const renderMonitoring = () => (
    <div className="space-y-6" id="monitoring-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Monitoring Targets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor your digital assets and competitors
          </p>
        </div>
        <button
          onClick={() => openModal('target')}
          className="btn btn-primary flex items-center gap-2"
          id="add-target-btn"
        >
          <Plus className="w-4 h-4" />
          Add Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monitoringTargets.map((target) => (
          <div key={target.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{target.name}</h3>
                <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                  {target.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${target.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <button
                  onClick={() => deleteMonitoringTarget(target.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Value:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-words">{target.value}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Threats:</span>
                  <span className="ml-2 text-lg font-bold text-red-600">{target.threatCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Last Check:</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(target.lastCheck).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {monitoringTargets.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No monitoring targets configured</p>
          <p className="text-sm">Add targets to start monitoring threats</p>
        </div>
      )}
    </div>
  );

  // Render reports
  const renderReports = () => (
    <div className="space-y-6" id="reports-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Intelligence Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate and manage threat intelligence reports
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="btn btn-primary flex items-center gap-2"
          id="generate-report-btn"
        >
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 capitalize">
                    {report.type.replace('_', ' ')}
                  </span>
                  <span className={`badge ${getSeverityColor(report.riskLevel)}`}>
                    {report.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(report.createdDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Summary</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{report.summary}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Key Findings</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                  {report.findings.slice(0, 3).map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <button className="btn bg-blue-600 text-white hover:bg-blue-700 w-full">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No reports generated yet</p>
          <p className="text-sm">Generate your first intelligence report</p>
        </div>
      )}
    </div>
  );

  // Render settings
  const renderSettings = () => (
    <div className="space-y-6" id="settings-tab">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure your OSINT tool preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
              <button
                onClick={() => {
                  const newDarkMode = !isDarkMode;
                  setIsDarkMode(newDarkMode);
                  const newSettings = { ...settings, darkMode: newDarkMode };
                  setSettings(newSettings);
                  saveToStorage('osint_settings', newSettings);
                }}
                className="theme-toggle"
                id="dark-mode-toggle"
              >
                <span className="theme-toggle-thumb flex items-center justify-center">
                  {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monitoring</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Auto Refresh</span>
              <button
                onClick={() => {
                  const newAutoRefresh = !settings.autoRefresh;
                  const newSettings = { ...settings, autoRefresh: newAutoRefresh };
                  setSettings(newSettings);
                  saveToStorage('osint_settings', newSettings);
                }}
                className={`theme-toggle ${settings.autoRefresh ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
            
            <div>
              <label className="form-label">Refresh Interval (seconds)</label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => {
                  const newSettings = { ...settings, refreshInterval: parseInt(e.target.value) };
                  setSettings(newSettings);
                  saveToStorage('osint_settings', newSettings);
                }}
                className="input"
              >
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
                <option value={3600}>1 hour</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Alert Threshold</label>
              <select
                value={settings.alertThreshold}
                onChange={(e) => {
                  const newSettings = { ...settings, alertThreshold: e.target.value as 'low' | 'medium' | 'high' };
                  setSettings(newSettings);
                  saveToStorage('osint_settings', newSettings);
                }}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={exportToCSV}
              className="btn bg-green-600 text-white hover:bg-green-700 w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                  setThreats([]);
                  setMonitoringTargets([]);
                  setReports([]);
                  localStorage.removeItem('osint_threats');
                  localStorage.removeItem('osint_targets');
                  localStorage.removeItem('osint_reports');
                }
              }}
              className="btn bg-red-600 text-white hover:bg-red-700 w-full flex items-center justify-center gap-2"
              id="delete-all-data-btn"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Regional Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Language</label>
              <select
                value={settings.language}
                onChange={(e) => {
                  const newSettings = { ...settings, language: e.target.value };
                  setSettings(newSettings);
                  saveToStorage('osint_settings', newSettings);
                }}
                className="input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => {
                  const newSettings = { ...settings, timezone: e.target.value };
                  setSettings(newSettings);
                  saveToStorage('osint_settings', newSettings);
                }}
                className="input"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
                <option value="JST">Japan Standard Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">OSINT Intelligence</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Legal Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.first_name} {currentUser.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                    id="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" id="generation_issue_fallback">
        <div className="container-fluid">
          <div className="flex overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
              { id: 'threats', label: 'Threats', icon: AlertTriangle },
              { id: 'monitoring', label: 'Monitoring', icon: Eye },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  id={`${tab.id}-tab`}
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
      <main className="container-fluid py-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'threats' && renderThreats()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalType === 'threat' ? (formData.id ? 'Edit Threat' : 'Add New Threat') : 'Add Monitoring Target'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'threat' ? (
                <>
                  <div>
                    <label className="form-label">Source</label>
                    <input
                      type="text"
                      value={formData.source || ''}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Type</label>
                      <select
                        value={formData.type || 'fraud_attempt'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="input"
                      >
                        <option value="brand_violation">Brand Violation</option>
                        <option value="fraud_attempt">Fraud Attempt</option>
                        <option value="competitor_activity">Competitor Activity</option>
                        <option value="dark_web">Dark Web</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Severity</label>
                      <select
                        value={formData.severity || 'medium'}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input h-24"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Entities (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.entities || ''}
                      onChange={(e) => setFormData({ ...formData, entities: e.target.value })}
                      className="input"
                      placeholder="Entity1, Entity2, Entity3"
                    />
                  </div>
                  <div>
                    <label className="form-label">Risk Score (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.riskScore || 5}
                      onChange={(e) => setFormData({ ...formData, riskScore: e.target.value })}
                      className="input"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="form-label">Target Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Type</label>
                    <select
                      value={formData.type || 'keyword'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input"
                    >
                      <option value="keyword">Keyword</option>
                      <option value="domain">Domain</option>
                      <option value="brand">Brand</option>
                      <option value="competitor">Competitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Value</label>
                    <input
                      type="text"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="input"
                      placeholder="Keywords, domain, or identifier"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {formData.id ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generate Intelligence Report</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Generate comprehensive intelligence reports based on collected threat data.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    const newReport: IntelligenceReport = {
                      id: Date.now().toString(),
                      title: 'Weekly Threat Summary',
                      type: 'summary',
                      createdDate: new Date().toISOString().split('T')[0],
                      summary: 'Comprehensive analysis of threats detected this week',
                      findings: [`${threats.length} total threats detected`, `${threats.filter(t => t.severity === 'critical' || t.severity === 'high').length} high-priority items`],
                      recommendations: ['Continue monitoring', 'Review security protocols'],
                      riskLevel: threats.filter(t => t.severity === 'critical').length > 0 ? 'high' : 'medium'
                    };
                    const updatedReports = [newReport, ...reports];
                    setReports(updatedReports);
                    saveToStorage('osint_reports', updatedReports);
                    setShowReportModal(false);
                  }}
                  className="btn btn-primary"
                >
                  Threat Summary
                </button>
                
                <button
                  onClick={() => {
                    const newReport: IntelligenceReport = {
                      id: Date.now().toString(),
                      title: 'Risk Assessment Report',
                      type: 'threat_assessment',
                      createdDate: new Date().toISOString().split('T')[0],
                      summary: 'Detailed risk assessment based on current threat landscape',
                      findings: ['Risk patterns analyzed', 'Vulnerability assessment completed'],
                      recommendations: ['Implement additional security measures', 'Monitor high-risk areas'],
                      riskLevel: 'high'
                    };
                    const updatedReports = [newReport, ...reports];
                    setReports(updatedReports);
                    saveToStorage('osint_reports', updatedReports);
                    setShowReportModal(false);
                  }}
                  className="btn bg-orange-600 text-white hover:bg-orange-700"
                >
                  Risk Assessment
                </button>
                
                <button
                  onClick={() => {
                    const newReport: IntelligenceReport = {
                      id: Date.now().toString(),
                      title: 'Competitor Intelligence',
                      type: 'competitor_analysis',
                      createdDate: new Date().toISOString().split('T')[0],
                      summary: 'Analysis of competitor activities and market intelligence',
                      findings: ['Competitor movements tracked', 'Market analysis completed'],
                      recommendations: ['Strategic adjustments needed', 'Continue competitive monitoring'],
                      riskLevel: 'medium'
                    };
                    const updatedReports = [newReport, ...reports];
                    setReports(updatedReports);
                    saveToStorage('osint_reports', updatedReports);
                    setShowReportModal(false);
                  }}
                  className="btn bg-green-600 text-white hover:bg-green-700"
                >
                  Competitor Analysis
                </button>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowReportModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="modal-backdrop" onClick={() => setSelectedThreat(null)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Threat Details</h3>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
                  <p className="text-gray-900 dark:text-white">{selectedThreat.source}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedThreat.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity:</span>
                  <span className={`badge ${getSeverityColor(selectedThreat.severity)}`}>
                    {selectedThreat.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span className={`badge ${getStatusColor(selectedThreat.status)}`}>
                    {selectedThreat.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</span>
                <p className="text-gray-900 dark:text-white mt-1">{selectedThreat.description}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Entities:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedThreat.entities.map((entity, index) => (
                    <span key={index} className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Score:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedThreat.riskScore.toFixed(1)}/10
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full" 
                      style={{ width: `${(selectedThreat.riskScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {selectedThreat.aiAnalysis && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Analysis:</span>
                  <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                      {selectedThreat.aiAnalysis}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <select
                  value={selectedThreat.status}
                  onChange={(e) => {
                    updateThreat(selectedThreat.id, { status: e.target.value as ThreatIntelligence['status'] });
                    setSelectedThreat({ ...selectedThreat, status: e.target.value as ThreatIntelligence['status'] });
                  }}
                  className="input flex-1"
                >
                  <option value="new">New</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
                <button
                  onClick={() => {
                    updateThreat(selectedThreat.id, { status: selectedThreat.status });
                    setSelectedThreat(null);
                  }}
                  className="btn btn-primary"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved
          </p>
        </div>
      </footer>

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          handleProcessAiResult(result);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );
};

export default App;