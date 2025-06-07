import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Shield, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Download, 
  Upload, 
  Eye, 
  Brain, 
  Target, 
  Globe, 
  Database, 
  ChartBar,
  Clock,
  Filter,
  Plus,
  Edit,
  Trash2,
  LogOut,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Types and Interfaces
interface IntelligenceData {
  id: string;
  title: string;
  source: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  entity_type: string;
  description: string;
  timestamp: string;
  tags: string[];
  confidence_score: number;
  location?: string;
  related_entities?: string[];
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  created_date: string;
  last_updated: string;
  intelligence_items: string[];
  findings: string;
}

interface MonitoringTarget {
  id: string;
  name: string;
  type: 'brand' | 'competitor' | 'person' | 'domain';
  keywords: string[];
  status: 'active' | 'paused';
  created_date: string;
  last_scan: string;
  alerts_count: number;
}

interface AlertItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  source: string;
  read: boolean;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('osint_darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // AI Layer States
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Data States
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [monitoringTargets, setMonitoringTargets] = useState<MonitoringTarget[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // UI States
  const [selectedIntelligence, setSelectedIntelligence] = useState<IntelligenceData | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCriteria, setFilterCriteria] = useState<string>('all');

  // Load data on component mount
  useEffect(() => {
    loadDataFromStorage();
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('osint_darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('osint_darkMode', 'false');
    }
  }, [isDarkMode]);

  // Data Management Functions
  const loadDataFromStorage = (): void => {
    try {
      const storedIntelligence = localStorage.getItem('osint_intelligence_data');
      const storedCases = localStorage.getItem('osint_cases');
      const storedTargets = localStorage.getItem('osint_monitoring_targets');
      const storedAlerts = localStorage.getItem('osint_alerts');

      if (storedIntelligence) {
        setIntelligenceData(JSON.parse(storedIntelligence));
      } else {
        setIntelligenceData(generateSampleIntelligenceData());
      }

      if (storedCases) {
        setCases(JSON.parse(storedCases));
      } else {
        setCases(generateSampleCases());
      }

      if (storedTargets) {
        setMonitoringTargets(JSON.parse(storedTargets));
      } else {
        setMonitoringTargets(generateSampleTargets());
      }

      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      } else {
        setAlerts(generateSampleAlerts());
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  };

  const saveDataToStorage = (): void => {
    try {
      localStorage.setItem('osint_intelligence_data', JSON.stringify(intelligenceData));
      localStorage.setItem('osint_cases', JSON.stringify(cases));
      localStorage.setItem('osint_monitoring_targets', JSON.stringify(monitoringTargets));
      localStorage.setItem('osint_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  // Generate Sample Data
  const generateSampleIntelligenceData = (): IntelligenceData[] => {
    return [
      {
        id: 'intel_001',
        title: 'Suspicious Domain Registration',
        source: 'Dark Web Monitoring',
        threat_level: 'high',
        entity_type: 'Domain',
        description: 'Suspicious domain registered with similar name to target company',
        timestamp: '2025-06-07T10:30:00Z',
        tags: ['phishing', 'domain-abuse', 'brand-protection'],
        confidence_score: 0.85,
        location: 'Unknown',
        related_entities: ['target-company.com']
      },
      {
        id: 'intel_002',
        title: 'Leaked Credentials Found',
        source: 'Breach Monitoring',
        threat_level: 'critical',
        entity_type: 'Credentials',
        description: 'Employee credentials found in recent data breach',
        timestamp: '2025-06-06T15:45:00Z',
        tags: ['data-breach', 'credentials', 'employee-security'],
        confidence_score: 0.92,
        location: 'Dark Web Forum',
        related_entities: ['john.doe@company.com']
      },
      {
        id: 'intel_003',
        title: 'Competitor Patent Filing',
        source: 'Patent Monitoring',
        threat_level: 'medium',
        entity_type: 'Patent',
        description: 'Competitor filed patent in similar technology area',
        timestamp: '2025-06-05T09:15:00Z',
        tags: ['competitor-analysis', 'patent', 'technology'],
        confidence_score: 0.78,
        location: 'USPTO',
        related_entities: ['competitor-corp']
      }
    ];
  };

  const generateSampleCases = (): Case[] => {
    return [
      {
        id: 'case_001',
        title: 'Brand Impersonation Investigation',
        description: 'Investigating fake social media accounts impersonating company brand',
        status: 'active',
        priority: 'high',
        assigned_to: currentUser?.username || 'analyst',
        created_date: '2025-06-01T00:00:00Z',
        last_updated: '2025-06-07T12:00:00Z',
        intelligence_items: ['intel_001'],
        findings: 'Multiple fake accounts identified across social platforms'
      },
      {
        id: 'case_002',
        title: 'Data Breach Response',
        description: 'Responding to credential leak discovered in dark web monitoring',
        status: 'active',
        priority: 'critical',
        assigned_to: currentUser?.username || 'analyst',
        created_date: '2025-06-06T00:00:00Z',
        last_updated: '2025-06-07T11:30:00Z',
        intelligence_items: ['intel_002'],
        findings: 'Credentials confirmed legitimate, users notified for password reset'
      }
    ];
  };

  const generateSampleTargets = (): MonitoringTarget[] => {
    return [
      {
        id: 'target_001',
        name: 'Company Brand',
        type: 'brand',
        keywords: ['company-name', 'brand-variations'],
        status: 'active',
        created_date: '2025-06-01T00:00:00Z',
        last_scan: '2025-06-07T12:00:00Z',
        alerts_count: 3
      },
      {
        id: 'target_002',
        name: 'CEO Monitoring',
        type: 'person',
        keywords: ['ceo-name', 'executive-title'],
        status: 'active',
        created_date: '2025-06-01T00:00:00Z',
        last_scan: '2025-06-07T11:45:00Z',
        alerts_count: 1
      }
    ];
  };

  const generateSampleAlerts = (): AlertItem[] => {
    return [
      {
        id: 'alert_001',
        title: 'High-Risk Domain Detected',
        severity: 'high',
        message: 'New domain registered with company name variations',
        timestamp: '2025-06-07T10:30:00Z',
        source: 'Domain Monitoring',
        read: false
      },
      {
        id: 'alert_002',
        title: 'Credential Breach Alert',
        severity: 'critical',
        message: 'Employee credentials found in data breach',
        timestamp: '2025-06-06T15:45:00Z',
        source: 'Dark Web Monitoring',
        read: true
      }
    ];
  };

  // AI Processing Functions
  const handleAIAnalysis = (analysisType: string, data?: any): void => {
    let prompt = '';
    
    switch (analysisType) {
      case 'threat_assessment':
        prompt = `Analyze the following intelligence data and provide a comprehensive threat assessment. Return JSON with keys "threat_level", "risk_factors", "recommendations", "entities_involved", "timeline_analysis": ${JSON.stringify(data)}`;
        break;
      case 'entity_extraction':
        prompt = `Extract and analyze entities from this intelligence report. Return JSON with keys "persons", "organizations", "locations", "domains", "financial_info", "relationships": ${JSON.stringify(data)}`;
        break;
      case 'fraud_detection':
        prompt = `Analyze this data for potential fraud indicators. Return JSON with keys "fraud_probability", "suspicious_patterns", "risk_indicators", "recommended_actions": ${JSON.stringify(data)}`;
        break;
      case 'sentiment_analysis':
        prompt = `Perform sentiment analysis on social media mentions and online content. Return JSON with keys "overall_sentiment", "sentiment_breakdown", "key_themes", "reputation_impact": ${JSON.stringify(data)}`;
        break;
      default:
        prompt = promptText;
    }

    if (!prompt.trim()) {
      setAiError('Please provide analysis parameters or input text.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI analysis request');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Modal Management
  const openModal = (type: string, data?: any): void => {
    setModalType(type);
    if (type === 'edit_intelligence' && data) {
      setSelectedIntelligence(data);
    }
    if (type === 'edit_case' && data) {
      setSelectedCase(data);
    }
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = (): void => {
    setShowModal(false);
    setModalType('');
    setSelectedIntelligence(null);
    setSelectedCase(null);
    document.body.classList.remove('modal-open');
  };

  // Data Export Functions
  const exportDataAsCSV = (dataType: string): void => {
    let csvContent = '';
    let filename = '';

    switch (dataType) {
      case 'intelligence':
        csvContent = convertIntelligenceToCSV(intelligenceData);
        filename = 'intelligence_data.csv';
        break;
      case 'cases':
        csvContent = convertCasesToCSV(cases);
        filename = 'cases_data.csv';
        break;
      case 'alerts':
        csvContent = convertAlertsToCSV(alerts);
        filename = 'alerts_data.csv';
        break;
      default:
        return;
    }

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

  const convertIntelligenceToCSV = (data: IntelligenceData[]): string => {
    const headers = ['ID', 'Title', 'Source', 'Threat Level', 'Entity Type', 'Description', 'Timestamp', 'Tags', 'Confidence Score'];
    const rows = data.map(item => [
      item.id,
      item.title,
      item.source,
      item.threat_level,
      item.entity_type,
      item.description,
      item.timestamp,
      item.tags.join(';'),
      item.confidence_score.toString()
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const convertCasesToCSV = (data: Case[]): string => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Assigned To', 'Created Date', 'Findings'];
    const rows = data.map(item => [
      item.id,
      item.title,
      item.description,
      item.status,
      item.priority,
      item.assigned_to,
      item.created_date,
      item.findings
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const convertAlertsToCSV = (data: AlertItem[]): string => {
    const headers = ['ID', 'Title', 'Severity', 'Message', 'Timestamp', 'Source', 'Read'];
    const rows = data.map(item => [
      item.id,
      item.title,
      item.severity,
      item.message,
      item.timestamp,
      item.source,
      item.read.toString()
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  // Chart Data Preparation
  const getThreatLevelData = () => {
    const threatCounts = intelligenceData.reduce((acc, item) => {
      acc[item.threat_level] = (acc[item.threat_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(threatCounts).map(([level, count]) => ({
      threat_level: level,
      count
    }));
  };

  const getTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const count = intelligenceData.filter(item => 
        item.timestamp.startsWith(date)
      ).length;
      return { date, intelligence_items: count };
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Save data whenever state changes
  useEffect(() => {
    saveDataToStorage();
  }, [intelligenceData, cases, monitoringTargets, alerts]);

  // Filter functions
  const getFilteredIntelligence = () => {
    return intelligenceData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterCriteria === 'all' || item.threat_level === filterCriteria;
      
      return matchesSearch && matchesFilter;
    });
  };

  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6" id="dashboard-content">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card" id="total-intelligence-stat">
          <div className="stat-title">Total Intelligence</div>
          <div className="stat-value">{intelligenceData.length}</div>
          <div className="stat-desc">↗︎ 12% from last week</div>
        </div>
        <div className="stat-card" id="active-cases-stat">
          <div className="stat-title">Active Cases</div>
          <div className="stat-value">{cases.filter(c => c.status === 'active').length}</div>
          <div className="stat-desc">2 critical priority</div>
        </div>
        <div className="stat-card" id="high-threats-stat">
          <div className="stat-title">High Threats</div>
          <div className="stat-value">{intelligenceData.filter(i => i.threat_level === 'high' || i.threat_level === 'critical').length}</div>
          <div className="stat-desc">Requires attention</div>
        </div>
        <div className="stat-card" id="monitoring-targets-stat">
          <div className="stat-title">Monitoring Targets</div>
          <div className="stat-value">{monitoringTargets.filter(t => t.status === 'active').length}</div>
          <div className="stat-desc">Active monitoring</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card" id="threat-level-chart">
          <h3 className="text-lg font-medium mb-4">Threat Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getThreatLevelData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ threat_level, count }) => `${threat_level}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {getThreatLevelData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" id="intelligence-timeline-chart">
          <h3 className="text-lg font-medium mb-4">Intelligence Timeline (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="intelligence_items" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card" id="recent-alerts">
        <h3 className="text-lg font-medium mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.slice(0, 5).map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
              alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntelligenceCollection = () => (
    <div className="space-y-6" id="intelligence-collection-content">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Intelligence Collection</h2>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('add_intelligence')}
            className="btn btn-primary flex items-center gap-2"
            id="add-intelligence-btn"
          >
            <Plus className="w-4 h-4" />
            Add Intelligence
          </button>
          <button
            onClick={() => exportDataAsCSV('intelligence')}
            className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card" id="intelligence-search-filter">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search intelligence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterCriteria}
            onChange={(e) => setFilterCriteria(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="all">All Threat Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Intelligence List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" id="intelligence-grid">
        {getFilteredIntelligence().map(intel => (
          <div key={intel.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-lg">{intel.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                intel.threat_level === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                intel.threat_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                intel.threat_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {intel.threat_level}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{intel.description}</p>
            
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Source:</span>
                <span>{intel.source}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span>{(intel.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(intel.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {intel.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => openModal('edit_intelligence', intel)}
                className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleAIAnalysis('threat_assessment', intel)}
                className="btn btn-sm btn-primary flex items-center gap-1"
              >
                <Brain className="w-3 h-3" />
                Analyze
              </button>
            </div>
          </div>
        ))}
      </div>

      {getFilteredIntelligence().length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No intelligence data found matching your criteria.</p>
        </div>
      )}
    </div>
  );

  const renderAnalysisReports = () => (
    <div className="space-y-6" id="analysis-reports-content">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Analysis & Reports</h2>
      </div>

      {/* AI Analysis Interface */}
      <div className="card" id="ai-analysis-interface">
        <h3 className="text-lg font-medium mb-4">AI-Powered Analysis</h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Analysis Prompt</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter your analysis request or upload a document for processing..."
              className="input w-full h-24 resize-none"
            />
          </div>
          
          <div>
            <label className="form-label">Upload Document (Optional)</label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="input w-full"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAIAnalysis('threat_assessment')}
              disabled={isAiLoading}
              className="btn btn-primary flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Threat Assessment
            </button>
            <button
              onClick={() => handleAIAnalysis('entity_extraction')}
              disabled={isAiLoading}
              className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Entity Extraction
            </button>
            <button
              onClick={() => handleAIAnalysis('fraud_detection')}
              disabled={isAiLoading}
              className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Fraud Detection
            </button>
            <button
              onClick={() => handleAIAnalysis('sentiment_analysis')}
              disabled={isAiLoading}
              className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Sentiment Analysis
            </button>
          </div>
        </div>
      </div>

      {/* AI Results */}
      {isAiLoading && (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Processing AI analysis...</span>
          </div>
        </div>
      )}

      {aiError && (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5" />
          <p>AI Analysis Error: {aiError.toString()}</p>
        </div>
      )}

      {aiResult && (
        <div className="card" id="ai-results">
          <h3 className="text-lg font-medium mb-4">AI Analysis Results</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiResult);
              }}
              className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Copy Results
            </button>
          </div>
        </div>
      )}

      {/* Quick Analysis Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="analysis-templates">
        <div className="card">
          <h4 className="font-medium mb-2">Domain Analysis</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Analyze suspicious domains for potential threats</p>
          <button
            onClick={() => {
              setPromptText('Analyze the following domain for potential security threats, phishing indicators, and reputation issues. Provide detailed assessment including WHOIS data analysis, DNS records, and threat intelligence.');
              handleAIAnalysis('threat_assessment');
            }}
            className="btn btn-sm btn-primary w-full"
          >
            Run Domain Analysis
          </button>
        </div>
        
        <div className="card">
          <h4 className="font-medium mb-2">Social Media Monitoring</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Monitor brand mentions and sentiment analysis</p>
          <button
            onClick={() => {
              setPromptText('Analyze social media mentions and online content for brand sentiment, potential threats, and reputation risks. Provide comprehensive sentiment analysis and threat indicators.');
              handleAIAnalysis('sentiment_analysis');
            }}
            className="btn btn-sm btn-primary w-full"
          >
            Monitor Social Media
          </button>
        </div>
        
        <div className="card">
          <h4 className="font-medium mb-2">Document Intelligence</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Extract intelligence from uploaded documents</p>
          <button
            onClick={() => {
              setPromptText('Extract and analyze intelligence from this document. Identify entities, threats, relationships, and provide structured intelligence summary with threat assessment.');
              handleAIAnalysis('entity_extraction');
            }}
            className="btn btn-sm btn-primary w-full"
          >
            Process Document
          </button>
        </div>
      </div>
    </div>
  );

  const renderDarkWebMonitoring = () => (
    <div className="space-y-6" id="darkweb-monitoring-content">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dark Web Monitoring</h2>
      </div>

      {/* Monitoring Targets */}
      <div className="card" id="monitoring-targets">
        <h3 className="text-lg font-medium mb-4">Monitoring Targets</h3>
        <div className="space-y-4">
          {monitoringTargets.map(target => (
            <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
              <div>
                <h4 className="font-medium">{target.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type: {target.type} | Keywords: {target.keywords.join(', ')}
                </p>
                <p className="text-xs text-gray-500">
                  Last scan: {new Date(target.last_scan).toLocaleString()} | Alerts: {target.alerts_count}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  target.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {target.status}
                </span>
                <button className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => openModal('add_target')}
          className="btn btn-primary mt-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Monitoring Target
        </button>
      </div>

      {/* Dark Web Intelligence Feed */}
      <div className="card" id="darkweb-intelligence">
        <h3 className="text-lg font-medium mb-4">Recent Dark Web Intelligence</h3>
        <div className="space-y-4">
          {intelligenceData
            .filter(intel => intel.source.toLowerCase().includes('dark web'))
            .map(intel => (
              <div key={intel.id} className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{intel.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{intel.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Source: {intel.source} | Confidence: {(intel.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    intel.threat_level === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    intel.threat_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {intel.threat_level}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Dark Web Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="darkweb-stats">
        <div className="stat-card">
          <div className="stat-title">Active Monitors</div>
          <div className="stat-value">{monitoringTargets.filter(t => t.status === 'active').length}</div>
          <div className="stat-desc">Scanning continuously</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Threats Detected</div>
          <div className="stat-value">{intelligenceData.filter(i => i.source.includes('Dark Web')).length}</div>
          <div className="stat-desc">This week</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">High Priority</div>
          <div className="stat-value">{intelligenceData.filter(i => i.source.includes('Dark Web') && (i.threat_level === 'high' || i.threat_level === 'critical')).length}</div>
          <div className="stat-desc">Requires immediate attention</div>
        </div>
      </div>
    </div>
  );

  const renderCasesManagement = () => (
    <div className="space-y-6" id="cases-management-content">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cases Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('add_case')}
            className="btn btn-primary flex items-center gap-2"
            id="add-case-btn"
          >
            <Plus className="w-4 h-4" />
            New Case
          </button>
          <button
            onClick={() => exportDataAsCSV('cases')}
            className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="cases-grid">
        {cases.map(caseItem => (
          <div key={caseItem.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-lg">{caseItem.title}</h3>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  caseItem.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  caseItem.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {caseItem.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  caseItem.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  caseItem.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  caseItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {caseItem.priority}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{caseItem.description}</p>
            
            <div className="space-y-2 text-xs text-gray-500 mb-4">
              <div className="flex justify-between">
                <span>Assigned to:</span>
                <span>{caseItem.assigned_to}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(caseItem.created_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last updated:</span>
                <span>{new Date(caseItem.last_updated).toLocaleDateString()}</span>
              </div>
            </div>
            
            {caseItem.findings && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm mb-4">
                <strong>Findings:</strong> {caseItem.findings}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => openModal('edit_case', caseItem)}
                className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleAIAnalysis('threat_assessment', caseItem)}
                className="btn btn-sm btn-primary flex items-center gap-1"
              >
                <Brain className="w-3 h-3" />
                AI Analysis
              </button>
            </div>
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No cases found. Create your first case to get started.</p>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="settings-content">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      {/* General Settings */}
      <div className="card" id="general-settings">
        <h3 className="text-lg font-medium mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Dark Mode</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark mode interface</p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb flex items-center justify-center">
                {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" id="data-management">
        <h3 className="text-lg font-medium mb-4">Data Management</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Export All Data</label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Download all intelligence data, cases, and alerts</p>
            <div className="flex gap-2">
              <button
                onClick={() => exportDataAsCSV('intelligence')}
                className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
              >
                Export Intelligence
              </button>
              <button
                onClick={() => exportDataAsCSV('cases')}
                className="btn btn-sm bg-green-500 text-white hover:bg-green-600"
              >
                Export Cases
              </button>
              <button
                onClick={() => exportDataAsCSV('alerts')}
                className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600"
              >
                Export Alerts
              </button>
            </div>
          </div>
          
          <div>
            <label className="form-label">Import Intelligence Data</label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload CSV file with intelligence data</p>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                className="input flex-1"
                onChange={(e) => {
                  // Handle CSV import logic here
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('Importing file:', file.name);
                  }
                }}
              />
              <button className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600">
                <Download className="w-4 h-4" />
                Template
              </button>
            </div>
          </div>
          
          <div>
            <label className="form-label">Clear All Data</label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Remove all stored intelligence data, cases, and alerts</p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  localStorage.removeItem('osint_intelligence_data');
                  localStorage.removeItem('osint_cases');
                  localStorage.removeItem('osint_monitoring_targets');
                  localStorage.removeItem('osint_alerts');
                  window.location.reload();
                }
              }}
              className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="card" id="ai-configuration">
        <h3 className="text-lg font-medium mb-4">AI Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">AI Analysis Preferences</label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Configure AI analysis settings and preferences</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Default Analysis Language</label>
                <select className="input">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="form-label">Confidence Threshold</label>
                <select className="input">
                  <option value="0.7">70%</option>
                  <option value="0.8">80%</option>
                  <option value="0.9">90%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="card" id="account-info">
        <h3 className="text-lg font-medium mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={currentUser?.username || ''}
                readOnly
                className="input bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={currentUser?.email || ''}
                readOnly
                className="input bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={currentUser?.first_name || ''}
                readOnly
                className="input bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={currentUser?.last_name || ''}
                readOnly
                className="input bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div
        className="modal-backdrop"
        onClick={closeModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 id="modal-title" className="text-lg font-medium">
              {modalType === 'add_intelligence' && 'Add Intelligence'}
              {modalType === 'edit_intelligence' && 'Edit Intelligence'}
              {modalType === 'add_case' && 'Add Case'}
              {modalType === 'edit_case' && 'Edit Case'}
              {modalType === 'add_target' && 'Add Monitoring Target'}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div className="mt-4">
            {(modalType === 'add_intelligence' || modalType === 'edit_intelligence') && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    defaultValue={selectedIntelligence?.title || ''}
                    className="input w-full"
                    placeholder="Intelligence title"
                  />
                </div>
                <div>
                  <label className="form-label">Source</label>
                  <input
                    type="text"
                    defaultValue={selectedIntelligence?.source || ''}
                    className="input w-full"
                    placeholder="Source of intelligence"
                  />
                </div>
                <div>
                  <label className="form-label">Threat Level</label>
                  <select
                    defaultValue={selectedIntelligence?.threat_level || 'low'}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    defaultValue={selectedIntelligence?.description || ''}
                    className="input w-full h-24 resize-none"
                    placeholder="Detailed description"
                  />
                </div>
              </div>
            )}

            {(modalType === 'add_case' || modalType === 'edit_case') && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Case Title</label>
                  <input
                    type="text"
                    defaultValue={selectedCase?.title || ''}
                    className="input w-full"
                    placeholder="Case title"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    defaultValue={selectedCase?.description || ''}
                    className="input w-full h-24 resize-none"
                    placeholder="Case description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      defaultValue={selectedCase?.status || 'active'}
                      className="input w-full"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      defaultValue={selectedCase?.priority || 'medium'}
                      className="input w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'add_target' && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Target Name</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Monitoring target name"
                  />
                </div>
                <div>
                  <label className="form-label">Target Type</label>
                  <select className="input w-full">
                    <option value="brand">Brand</option>
                    <option value="competitor">Competitor</option>
                    <option value="person">Person</option>
                    <option value="domain">Domain</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Keywords</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Comma-separated keywords"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              onClick={closeModal}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle save logic here
                closeModal();
              }}
              className="btn btn-primary"
            >
              {modalType.startsWith('add_') ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle Escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition" id="welcome_fallback">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError)}
        onLoading={(loadingStatus) => setIsAiLoading(loadingStatus)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3" id="generation_issue_fallback">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">OSINT Intelligence</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Legal Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser.first_name}</span>
              </div>
              <button
                onClick={logout}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
              { id: 'intelligence', label: 'Intelligence', icon: Database },
              { id: 'analysis', label: 'AI Analysis', icon: Brain },
              { id: 'darkweb', label: 'Dark Web', icon: Globe },
              { id: 'cases', label: 'Cases', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
      <main className="container-fluid py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'intelligence' && renderIntelligenceCollection()}
        {activeTab === 'analysis' && renderAnalysisReports()}
        {activeTab === 'darkweb' && renderDarkWebMonitoring()}
        {activeTab === 'cases' && renderCasesManagement()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default App;