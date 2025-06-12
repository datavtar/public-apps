import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Plus, Edit, Trash2, Filter, Search, Download, Upload, Settings, 
  Target, TrendingUp, BarChart3, Calendar, Tag, Clock, CheckCircle,
  Circle, AlertCircle, Zap, Star, ArrowUp, ArrowDown, Eye, ChevronDown,
  FileText, Brain, Users, Map, Layout, Sun, Moon, X, Menu, Home,
  ChevronRight, Save, RefreshCw, RotateCcw, Copy, ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface Feature {
  id: string;
  title: string;
  description: string;
  milestone: string;
  status: 'backlog' | 'planned' | 'in-progress' | 'in-review' | 'completed' | 'cancelled';
  stage: 'discovery' | 'design' | 'development' | 'testing' | 'release';
  complexity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  effort: number;
  impact: 'low' | 'medium' | 'high';
  tags: string[];
  comments: string;
  createdDate: string;
  updatedDate: string;
  targetDate?: string;
  assignee?: string;
  dependencies: string[];
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  status: 'planning' | 'active' | 'completed' | 'delayed';
}

interface FilterOptions {
  status: string[];
  stage: string[];
  complexity: string[];
  impact: string[];
  milestone: string[];
  tags: string[];
}

interface Settings {
  customStatuses: string[];
  customStages: string[];
  defaultPriority: number;
  autoSave: boolean;
  theme: 'light' | 'dark';
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Dark mode hook
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

  const { isDark, toggleDarkMode } = useDarkMode();

  // State Management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'features' | 'kanban' | 'analytics' | 'settings'>('dashboard');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [settings, setSettings] = useState<Settings>({
    customStatuses: [],
    customStages: [],
    defaultPriority: 3,
    autoSave: true,
    theme: 'light'
  });

  // Feature Management State
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    stage: [],
    complexity: [],
    impact: [],
    milestone: [],
    tags: []
  });
  const [sortBy, setSortBy] = useState<keyof Feature>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Feature>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Initialize sample data
  useEffect(() => {
    const savedFeatures = localStorage.getItem('productflow_features');
    const savedMilestones = localStorage.getItem('productflow_milestones');
    const savedSettings = localStorage.getItem('productflow_settings');

    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      // Sample data
      const sampleFeatures: Feature[] = [
        {
          id: '1',
          title: 'User Authentication System',
          description: 'Implement secure login, registration, and password recovery functionality with OAuth support',
          milestone: 'MVP Launch',
          status: 'completed',
          stage: 'release',
          complexity: 'high',
          priority: 9,
          effort: 13,
          impact: 'high',
          tags: ['security', 'auth', 'backend'],
          comments: 'Successfully implemented with Google OAuth. Performance metrics look good.',
          createdDate: '2025-05-15',
          updatedDate: '2025-06-10',
          targetDate: '2025-06-15',
          assignee: 'Backend Team',
          dependencies: []
        },
        {
          id: '2',
          title: 'AI-Powered Content Recommendations',
          description: 'Machine learning algorithm to suggest personalized content based on user behavior and preferences',
          milestone: 'Q3 Enhancement',
          status: 'in-progress',
          stage: 'development',
          complexity: 'critical',
          priority: 8,
          effort: 21,
          impact: 'high',
          tags: ['ai', 'ml', 'personalization', 'engagement'],
          comments: 'Initial model training completed. Working on integration with recommendation engine.',
          createdDate: '2025-06-01',
          updatedDate: '2025-06-12',
          targetDate: '2025-07-30',
          assignee: 'AI Team',
          dependencies: ['1']
        },
        {
          id: '3',
          title: 'Mobile App Responsive Design',
          description: 'Optimize UI/UX for mobile devices with touch-friendly controls and responsive layouts',
          milestone: 'Mobile First',
          status: 'planned',
          stage: 'design',
          complexity: 'medium',
          priority: 7,
          effort: 8,
          impact: 'high',
          tags: ['mobile', 'ui', 'responsive', 'design'],
          comments: 'Design mockups in review. Need to validate with user testing.',
          createdDate: '2025-06-05',
          updatedDate: '2025-06-11',
          targetDate: '2025-08-15',
          assignee: 'Design Team',
          dependencies: []
        },
        {
          id: '4',
          title: 'Advanced Analytics Dashboard',
          description: 'Comprehensive analytics with custom reports, data visualization, and export capabilities',
          milestone: 'Data Insights',
          status: 'backlog',
          stage: 'discovery',
          complexity: 'high',
          priority: 6,
          effort: 16,
          impact: 'medium',
          tags: ['analytics', 'dashboard', 'data', 'visualization'],
          comments: 'Requirements gathering in progress. Need to define KPIs and metrics.',
          createdDate: '2025-06-08',
          updatedDate: '2025-06-12',
          targetDate: '2025-09-30',
          assignee: 'Data Team',
          dependencies: ['2']
        },
        {
          id: '5',
          title: 'Real-time Chat Feature',
          description: 'WebSocket-based real-time messaging system with file sharing and emoji support',
          milestone: 'Social Features',
          status: 'in-review',
          stage: 'testing',
          complexity: 'medium',
          priority: 5,
          effort: 12,
          impact: 'medium',
          tags: ['chat', 'realtime', 'websocket', 'social'],
          comments: 'Feature complete. QA testing in progress. Minor UI adjustments needed.',
          createdDate: '2025-05-20',
          updatedDate: '2025-06-11',
          targetDate: '2025-06-20',
          assignee: 'Frontend Team',
          dependencies: ['1']
        }
      ];
      setFeatures(sampleFeatures);
      localStorage.setItem('productflow_features', JSON.stringify(sampleFeatures));
    }

    if (savedMilestones) {
      setMilestones(JSON.parse(savedMilestones));
    } else {
      const sampleMilestones: Milestone[] = [
        {
          id: '1',
          name: 'MVP Launch',
          description: 'Minimum viable product with core features',
          targetDate: '2025-06-30',
          status: 'active'
        },
        {
          id: '2',
          name: 'Q3 Enhancement',
          description: 'Advanced features and improvements',
          targetDate: '2025-09-30',
          status: 'planning'
        },
        {
          id: '3',
          name: 'Mobile First',
          description: 'Mobile optimization and responsive design',
          targetDate: '2025-08-15',
          status: 'planning'
        }
      ];
      setMilestones(sampleMilestones);
      localStorage.setItem('productflow_milestones', JSON.stringify(sampleMilestones));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (features.length > 0) {
      localStorage.setItem('productflow_features', JSON.stringify(features));
    }
  }, [features]);

  useEffect(() => {
    if (milestones.length > 0) {
      localStorage.setItem('productflow_milestones', JSON.stringify(milestones));
    }
  }, [milestones]);

  // Utility Functions
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const getStatusColor = (status: Feature['status']): string => {
    const colors = {
      'backlog': 'badge-gray',
      'planned': 'badge-primary',
      'in-progress': 'badge-warning',
      'in-review': 'badge-info',
      'completed': 'badge-success',
      'cancelled': 'badge-error'
    };
    return colors[status] || 'badge-gray';
  };

  const getComplexityColor = (complexity: Feature['complexity']): string => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'critical': 'text-red-600'
    };
    return colors[complexity] || 'text-gray-600';
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 8) return <ArrowUp className="w-4 h-4 text-red-500" />;
    if (priority >= 6) return <ArrowUp className="w-4 h-4 text-orange-500" />;
    if (priority >= 4) return <ArrowDown className="w-4 h-4 text-yellow-500" />;
    return <ArrowDown className="w-4 h-4 text-green-500" />;
  };

  // Filter and Sort Functions
  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilters = (
      (filters.status.length === 0 || filters.status.includes(feature.status)) &&
      (filters.stage.length === 0 || filters.stage.includes(feature.stage)) &&
      (filters.complexity.length === 0 || filters.complexity.includes(feature.complexity)) &&
      (filters.impact.length === 0 || filters.impact.includes(feature.impact)) &&
      (filters.milestone.length === 0 || filters.milestone.includes(feature.milestone)) &&
      (filters.tags.length === 0 || filters.tags.some(tag => feature.tags.includes(tag)))
    );

    return matchesSearch && matchesFilters;
  });

  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // CRUD Operations
  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: generateId(),
      title: formData.title || '',
      description: formData.description || '',
      milestone: formData.milestone || '',
      status: formData.status || 'backlog',
      stage: formData.stage || 'discovery',
      complexity: formData.complexity || 'medium',
      priority: formData.priority || settings.defaultPriority,
      effort: formData.effort || 1,
      impact: formData.impact || 'medium',
      tags: formData.tags || [],
      comments: formData.comments || '',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      targetDate: formData.targetDate || '',
      assignee: formData.assignee || '',
      dependencies: formData.dependencies || []
    };

    setFeatures(prev => [...prev, newFeature]);
    setFormData({});
    setShowAddFeature(false);
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData(feature);
    setShowAddFeature(true);
  };

  const handleUpdateFeature = () => {
    if (!editingFeature) return;

    const updatedFeature: Feature = {
      ...editingFeature,
      ...formData,
      updatedDate: new Date().toISOString().split('T')[0]
    };

    setFeatures(prev => prev.map(f => f.id === editingFeature.id ? updatedFeature : f));
    setEditingFeature(null);
    setFormData({});
    setShowAddFeature(false);
  };

  const handleDeleteFeature = (id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
    setShowDeleteConfirm(null);
  };

  // AI Functions
  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide an input or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const analysisPrompt = selectedFile 
      ? `Analyze this product document/specification and extract feature details. Return JSON with keys: "title", "description", "complexity", "priority", "effort", "impact", "tags", "milestone", "targetDate", "dependencies". ${aiPrompt || 'Extract as much relevant information as possible.'}`
      : `Analyze this product feature request and provide insights. Return JSON with keys: "complexity_analysis", "priority_recommendation", "effort_estimate", "impact_assessment", "suggested_tags", "potential_risks", "implementation_notes". Feature request: ${aiPrompt}`;

    try {
      aiLayerRef.current?.sendToAI(analysisPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleAIInsertFeature = () => {
    if (!aiResult) return;

    try {
      const parsedData = JSON.parse(aiResult);
      const newFeature: Feature = {
        id: generateId(),
        title: parsedData.title || 'AI Generated Feature',
        description: parsedData.description || '',
        milestone: parsedData.milestone || '',
        status: 'backlog',
        stage: 'discovery',
        complexity: parsedData.complexity || 'medium',
        priority: parsedData.priority || 5,
        effort: parsedData.effort || 1,
        impact: parsedData.impact || 'medium',
        tags: Array.isArray(parsedData.tags) ? parsedData.tags : [],
        comments: 'Generated by AI analysis',
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
        targetDate: parsedData.targetDate || '',
        assignee: '',
        dependencies: Array.isArray(parsedData.dependencies) ? parsedData.dependencies : []
      };

      setFeatures(prev => [...prev, newFeature]);
      setAiResult(null);
      setAiPrompt('');
      setSelectedFile(null);
      setShowAiPanel(false);
    } catch (error) {
      setAiError("Could not parse AI response as feature data. The response may be in text format.");
    }
  };

  // Data Import/Export
  const handleExportData = () => {
    const dataToExport = {
      features,
      milestones,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productflow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Milestone', 'Status', 'Stage', 'Complexity', 'Priority', 'Effort', 'Impact', 'Tags', 'Comments', 'Created Date', 'Target Date', 'Assignee'];
    const csvContent = [
      headers.join(','),
      ...features.map(feature => [
        feature.id,
        `"${feature.title.replace(/"/g, '""')}"`,
        `"${feature.description.replace(/"/g, '""')}"`,
        feature.milestone,
        feature.status,
        feature.stage,
        feature.complexity,
        feature.priority,
        feature.effort,
        feature.impact,
        `"${feature.tags.join(', ')}"`,
        `"${feature.comments.replace(/"/g, '""')}"`,
        feature.createdDate,
        feature.targetDate || '',
        feature.assignee || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productflow-features-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const templateHeaders = ['Title', 'Description', 'Milestone', 'Status', 'Stage', 'Complexity', 'Priority', 'Effort', 'Impact', 'Tags', 'Comments', 'Target Date', 'Assignee'];
    const sampleRow = [
      'Sample Feature',
      'This is a sample feature description',
      'MVP Launch',
      'backlog',
      'discovery',
      'medium',
      '5',
      '8',
      'high',
      'tag1, tag2',
      'Sample comments',
      '2025-12-31',
      'Team Name'
    ];

    const csvContent = [templateHeaders.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productflow-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const newFeatures: Feature[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;

        const feature: Feature = {
          id: generateId(),
          title: values[0]?.replace(/"/g, '') || '',
          description: values[1]?.replace(/"/g, '') || '',
          milestone: values[2] || '',
          status: (values[3] as Feature['status']) || 'backlog',
          stage: (values[4] as Feature['stage']) || 'discovery',
          complexity: (values[5] as Feature['complexity']) || 'medium',
          priority: parseInt(values[6]) || 5,
          effort: parseInt(values[7]) || 1,
          impact: (values[8] as Feature['impact']) || 'medium',
          tags: values[9]?.replace(/"/g, '').split(', ').filter(Boolean) || [],
          comments: values[10]?.replace(/"/g, '') || '',
          createdDate: new Date().toISOString().split('T')[0],
          updatedDate: new Date().toISOString().split('T')[0],
          targetDate: values[11] || '',
          assignee: values[12]?.replace(/"/g, '') || '',
          dependencies: []
        };

        newFeatures.push(feature);
      }

      setFeatures(prev => [...prev, ...newFeatures]);
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // Stats calculations
  const stats = {
    total: features.length,
    completed: features.filter(f => f.status === 'completed').length,
    inProgress: features.filter(f => f.status === 'in-progress').length,
    planned: features.filter(f => f.status === 'planned').length,
    highPriority: features.filter(f => f.priority >= 7).length,
    avgPriority: features.length > 0 ? Math.round(features.reduce((sum, f) => sum + f.priority, 0) / features.length) : 0
  };

  // Render Functions
  const renderDashboard = () => (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 text-white mb-2">Welcome back, {currentUser?.first_name || 'Product Manager'}!</h1>
            <p className="text-blue-100">Here's your product roadmap overview</p>
          </div>
          <Target className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Total Features</p>
              <p className="stat-value">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Completed</p>
              <p className="stat-value text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">In Progress</p>
              <p className="stat-value text-orange-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Planned</p>
              <p className="stat-value text-blue-600">{stats.planned}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">High Priority</p>
              <p className="stat-value text-red-600">{stats.highPriority}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-title">Avg Priority</p>
              <p className="stat-value">{stats.avgPriority}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Features */}
      <div className="card">
        <div className="card-header">
          <h3 className="heading-5">Recent Features</h3>
          <button
            onClick={() => setActiveTab('features')}
            className="btn btn-primary btn-sm"
          >
            View All
          </button>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {features.slice(0, 5).map(feature => (
              <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{feature.title}</h4>
                    <span className={`badge ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </span>
                    {getPriorityIcon(feature.priority)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.description.slice(0, 100)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{feature.milestone}</p>
                  <p className="text-xs text-gray-500">{feature.targetDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Progress */}
      <div className="card">
        <div className="card-header">
          <h3 className="heading-5">Milestone Progress</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {milestones.map(milestone => {
              const milestoneFeatures = features.filter(f => f.milestone === milestone.name);
              const completedCount = milestoneFeatures.filter(f => f.status === 'completed').length;
              const progress = milestoneFeatures.length > 0 ? (completedCount / milestoneFeatures.length) * 100 : 0;
              
              return (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{milestone.name}</h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {completedCount}/{milestoneFeatures.length} features
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Target: {milestone.targetDate}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatureList = () => (
    <div id="features-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-3">Feature Management</h1>
          <p className="text-caption">Manage your product features and roadmap</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAiPanel(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            AI Analysis
          </button>
          <button
            onClick={() => setShowAddFeature(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search features..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as keyof Feature)}
              >
                <option value="priority">Sort by Priority</option>
                <option value="createdDate">Sort by Created Date</option>
                <option value="updatedDate">Sort by Updated Date</option>
                <option value="title">Sort by Title</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn btn-secondary"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                className="btn btn-secondary"
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Feature</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Priority</th>
                  <th className="table-header-cell">Complexity</th>
                  <th className="table-header-cell">Milestone</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {sortedFeatures.map(feature => (
                  <tr key={feature.id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description.slice(0, 80)}...
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {feature.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="badge badge-gray text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(feature.priority)}
                        <span>{feature.priority}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${getComplexityColor(feature.complexity)}`}>
                        {feature.complexity}
                      </span>
                    </td>
                    <td className="table-cell">{feature.milestone}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedFeature(feature)}
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditFeature(feature)}
                          className="btn btn-ghost btn-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(feature.id)}
                          className="btn btn-ghost btn-sm text-red-600"
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={downloadTemplate}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
        
        <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
        </label>
        
        <button
          onClick={handleExportCSV}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  );

  const renderKanbanBoard = () => {
    const statusColumns = ['backlog', 'planned', 'in-progress', 'in-review', 'completed'];
    
    return (
      <div id="kanban-view" className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="heading-3">Kanban Board</h1>
          <button
            onClick={() => setActiveTab('features')}
            className="btn btn-secondary"
          >
            List View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-x-auto min-h-[600px]">
          {statusColumns.map(status => {
            const columnFeatures = sortedFeatures.filter(f => f.status === status);
            
            return (
              <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold capitalize">{status.replace('-', ' ')}</h3>
                  <span className="badge badge-gray">{columnFeatures.length}</span>
                </div>
                
                <div className="space-y-3">
                  {columnFeatures.map(feature => (
                    <div
                      key={feature.id}
                      className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        {getPriorityIcon(feature.priority)}
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${getComplexityColor(feature.complexity)}`}>
                          {feature.complexity}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {feature.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="badge badge-gray text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {feature.targetDate && (
                        <div className="mt-2 text-xs text-gray-500">
                          Due: {feature.targetDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div id="settings-view" className="space-y-6">
      <h1 className="heading-3">Settings</h1>

      {/* Export/Import */}
      <div className="card">
        <div className="card-header">
          <h3 className="heading-5">Data Management</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportData}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            
            <button
              onClick={downloadTemplate}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>
          
          <div className="alert alert-info">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Data Storage</p>
              <p className="text-sm">All data is stored locally in your browser. Export regularly to backup your roadmap.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-800">
        <div className="card-header bg-red-50 dark:bg-red-900/20">
          <h3 className="heading-5 text-red-800 dark:text-red-200">Danger Zone</h3>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Clear all data from the application. This action cannot be undone.
          </p>
          <button
            onClick={() => {
              if (window.confirm && window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                localStorage.removeItem('productflow_features');
                localStorage.removeItem('productflow_milestones');
                localStorage.removeItem('productflow_settings');
                setFeatures([]);
                setMilestones([]);
                window.location.reload();
              }
            }}
            className="btn btn-error"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeatureModal = () => (
    <div className="modal-backdrop" onClick={() => setShowAddFeature(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">
            {editingFeature ? 'Edit Feature' : 'Add New Feature'}
          </h3>
          <button
            onClick={() => {
              setShowAddFeature(false);
              setEditingFeature(null);
              setFormData({});
            }}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="input"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter feature title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Milestone</label>
              <select
                className="select"
                value={formData.milestone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, milestone: e.target.value }))}
              >
                <option value="">Select milestone</option>
                {milestones.map(milestone => (
                  <option key={milestone.id} value={milestone.name}>
                    {milestone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the feature in detail"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={formData.status || 'backlog'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Feature['status'] }))}
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Stage</label>
              <select
                className="select"
                value={formData.stage || 'discovery'}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as Feature['stage'] }))}
              >
                <option value="discovery">Discovery</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="release">Release</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Complexity</label>
              <select
                className="select"
                value={formData.complexity || 'medium'}
                onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as Feature['complexity'] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Impact</label>
              <select
                className="select"
                value={formData.impact || 'medium'}
                onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value as Feature['impact'] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="input"
                value={formData.priority || 5}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Effort (days)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={formData.effort || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, effort: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                type="date"
                className="input"
                value={formData.targetDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="input"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="e.g. frontend, api, urgent"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assignee</label>
              <input
                type="text"
                className="input"
                value={formData.assignee || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                placeholder="Team or person responsible"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Comments</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.comments || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Additional notes or comments"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => {
              setShowAddFeature(false);
              setEditingFeature(null);
              setFormData({});
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={editingFeature ? handleUpdateFeature : handleAddFeature}
            className="btn btn-primary"
            disabled={!formData.title?.trim()}
          >
            {editingFeature ? 'Update Feature' : 'Add Feature'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeatureDetails = () => selectedFeature && (
    <div className="modal-backdrop" onClick={() => setSelectedFeature(null)}>
      <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <h3 className="heading-5">{selectedFeature.title}</h3>
            <span className={`badge ${getStatusColor(selectedFeature.status)}`}>
              {selectedFeature.status}
            </span>
          </div>
          <button
            onClick={() => setSelectedFeature(null)}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="stat-title">Priority</p>
              <div className="flex items-center gap-2">
                {getPriorityIcon(selectedFeature.priority)}
                <span className="stat-value">{selectedFeature.priority}</span>
              </div>
            </div>
            <div className="stat-card">
              <p className="stat-title">Complexity</p>
              <p className={`stat-value ${getComplexityColor(selectedFeature.complexity)}`}>
                {selectedFeature.complexity}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Effort</p>
              <p className="stat-value">{selectedFeature.effort} days</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedFeature.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Milestone:</span>
                    <span className="font-medium">{selectedFeature.milestone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stage:</span>
                    <span className="font-medium">{selectedFeature.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impact:</span>
                    <span className="font-medium">{selectedFeature.impact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Date:</span>
                    <span className="font-medium">{selectedFeature.targetDate || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignee:</span>
                    <span className="font-medium">{selectedFeature.assignee || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{selectedFeature.createdDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="font-medium">{selectedFeature.updatedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedFeature.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFeature.tags.map(tag => (
                    <span key={tag} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedFeature.comments && (
              <div>
                <h4 className="font-semibold mb-2">Comments</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm">{selectedFeature.comments}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => setSelectedFeature(null)}
            className="btn btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              handleEditFeature(selectedFeature);
              setSelectedFeature(null);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Feature
          </button>
        </div>
      </div>
    </div>
  );

  const renderAIPanel = () => showAiPanel && (
    <div className="modal-backdrop" onClick={() => setShowAiPanel(false)}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Feature Analysis
          </h3>
          <button
            onClick={() => setShowAiPanel(false)}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-6">
          <div className="alert alert-info">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">AI-Powered Analysis</p>
              <p className="text-sm">Analyze feature requests, documents, or get strategic insights. The AI may make mistakes, so please review the suggestions carefully.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Feature Request or Question</label>
              <textarea
                className="textarea"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe a feature idea, ask for analysis, or upload a document for processing..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Document (Optional)</label>
              <input
                type="file"
                className="input"
                accept=".txt,.doc,.docx,.pdf,.md"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <button
              onClick={handleAIAnalysis}
              disabled={aiLoading || (!aiPrompt.trim() && !selectedFile)}
              className={`btn btn-primary w-full ${aiLoading ? 'btn-loading' : ''}`}
            >
              {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>

          {aiError && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="text-sm">{typeof aiError === 'string' ? aiError : 'An error occurred during analysis'}</p>
              </div>
            </div>
          )}

          {aiResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">AI Analysis Result</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleAIInsertFeature}
                    className="btn btn-success btn-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add as Feature
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiResult}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={() => {
              setShowAiPanel(false);
              setAiPrompt('');
              setSelectedFile(null);
              setAiResult(null);
              setAiError(null);
            }}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderDeleteConfirm = () => showDeleteConfirm && (
    <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5 text-red-600">Delete Feature</h3>
        </div>
        
        <div className="modal-body">
          <p>Are you sure you want to delete this feature? This action cannot be undone.</p>
        </div>
        
        <div className="modal-footer">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteFeature(showDeleteConfirm)}
            className="btn btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors theme-transition">
      {/* Navigation */}
      <nav className="navbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container container-lg">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                <h1 className="heading-6 text-gray-900 dark:text-white">ProductFlow</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1">
                <button
                  id="dashboard-tab"
                  onClick={() => setActiveTab('dashboard')}
                  className={`nav-link ${activeTab === 'dashboard' ? 'nav-link-active' : ''}`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  id="features-tab"
                  onClick={() => setActiveTab('features')}
                  className={`nav-link ${activeTab === 'features' ? 'nav-link-active' : ''}`}
                >
                  <FileText className="w-4 h-4" />
                  Features
                </button>
                <button
                  id="kanban-tab"
                  onClick={() => setActiveTab('kanban')}
                  className={`nav-link ${activeTab === 'kanban' ? 'nav-link-active' : ''}`}
                >
                  <Layout className="w-4 h-4" />
                  Kanban
                </button>
                <button
                  id="settings-tab"
                  onClick={() => setActiveTab('settings')}
                  className={`nav-link ${activeTab === 'settings' ? 'nav-link-active' : ''}`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>

              <button
                onClick={toggleDarkMode}
                className="btn btn-ghost btn-sm"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <div className="flex overflow-x-auto py-2 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-link whitespace-nowrap ${activeTab === 'dashboard' ? 'nav-link-active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`nav-link whitespace-nowrap ${activeTab === 'features' ? 'nav-link-active' : ''}`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`nav-link whitespace-nowrap ${activeTab === 'kanban' ? 'nav-link-active' : ''}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`nav-link whitespace-nowrap ${activeTab === 'settings' ? 'nav-link-active' : ''}`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="generation_issue_fallback" className="container container-lg py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'features' && renderFeatureList()}
        {activeTab === 'kanban' && renderKanbanBoard()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      {showAddFeature && renderFeatureModal()}
      {selectedFeature && renderFeatureDetails()}
      {renderAIPanel()}
      {renderDeleteConfirm()}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError)}
        onLoading={(loadingStatus) => setAiLoading(loadingStatus)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-16">
        <div className="container container-lg">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;