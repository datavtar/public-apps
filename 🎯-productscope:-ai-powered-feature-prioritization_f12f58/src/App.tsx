import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  Target, 
  TrendingUp, 
  ChartBar, 
  Download, 
  Upload, 
  Settings, 
  Tag, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Brain,
  FileText,
  BarChart3,
  Kanban,
  Map,
  Sun,
  Moon,
  LogOut,
  ArrowLeftRight, X
} from 'lucide-react';

// Types and Interfaces
interface Feature {
  id: string;
  title: string;
  description: string;
  milestone: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  stage: 'Discovery' | 'Design' | 'Development' | 'Testing' | 'Launch' | 'Post-Launch';
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  businessValue: number; // 1-10 scale
  effortEstimate: number; // Story points or days
  tags: string[];
  comments: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignee?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Delayed';
  color: string;
}

interface FilterState {
  search: string;
  status: string;
  stage: string;
  milestone: string;
  complexity: string;
  priority: string;
  tags: string[];
}

type ViewMode = 'dashboard' | 'features' | 'roadmap' | 'priority-matrix' | 'analytics' | 'settings';

// Custom hook for dark mode
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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [features, setFeatures] = useState<Feature[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Filter and Search State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    stage: '',
    milestone: '',
    complexity: '',
    priority: '',
    tags: []
  });

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Feature>>({});
  const [milestoneFormData, setMilestoneFormData] = useState<Partial<Milestone>>({});

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedFeatures = localStorage.getItem('productscope_features');
    const savedMilestones = localStorage.getItem('productscope_milestones');

    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      // Sample data
      const sampleFeatures: Feature[] = [
        {
          id: '1',
          title: 'AI-Powered Content Generation',
          description: 'Implement advanced AI capabilities for automatic content generation with customizable templates and brand voice training.',
          milestone: 'Q1 2025 Release',
          status: 'In Progress',
          stage: 'Development',
          complexity: 'Very High',
          priority: 'Critical',
          businessValue: 9,
          effortEstimate: 21,
          tags: ['AI', 'Core Feature', 'Revenue'],
          comments: 'Key differentiator for competitive advantage. Requires careful testing for quality assurance.',
          createdAt: '2025-01-15',
          updatedAt: '2025-02-10',
          dueDate: '2025-03-30',
          assignee: 'AI Team Lead'
        },
        {
          id: '2',
          title: 'Advanced Analytics Dashboard',
          description: 'Comprehensive analytics suite with real-time metrics, custom reports, and predictive insights for user behavior analysis.',
          milestone: 'Q1 2025 Release',
          status: 'Not Started',
          stage: 'Design',
          complexity: 'High',
          priority: 'High',
          businessValue: 8,
          effortEstimate: 13,
          tags: ['Analytics', 'Dashboard', 'Insights'],
          comments: 'Stakeholder feedback required on dashboard layout and key metrics.',
          createdAt: '2025-01-20',
          updatedAt: '2025-02-05',
          dueDate: '2025-04-15',
          assignee: 'Analytics Team'
        },
        {
          id: '3',
          title: 'Mobile Application',
          description: 'Native mobile applications for iOS and Android with offline capabilities and push notifications.',
          milestone: 'Q2 2025 Release',
          status: 'Not Started',
          stage: 'Discovery',
          complexity: 'Very High',
          priority: 'Medium',
          businessValue: 7,
          effortEstimate: 34,
          tags: ['Mobile', 'iOS', 'Android', 'Offline'],
          comments: 'Market research needed to validate mobile user demand and feature priorities.',
          createdAt: '2025-02-01',
          updatedAt: '2025-02-08',
          dueDate: '2025-06-30',
          assignee: 'Mobile Team'
        }
      ];
      setFeatures(sampleFeatures);
      localStorage.setItem('productscope_features', JSON.stringify(sampleFeatures));
    }

    if (savedMilestones) {
      setMilestones(JSON.parse(savedMilestones));
    } else {
      // Sample milestones
      const sampleMilestones: Milestone[] = [
        {
          id: '1',
          name: 'Q1 2025 Release',
          description: 'Major feature release focusing on AI capabilities and user experience improvements',
          targetDate: '2025-03-31',
          status: 'Active',
          color: '#3b82f6'
        },
        {
          id: '2',
          name: 'Q2 2025 Release',
          description: 'Mobile expansion and advanced analytics rollout',
          targetDate: '2025-06-30',
          status: 'Planning',
          color: '#10b981'
        }
      ];
      setMilestones(sampleMilestones);
      localStorage.setItem('productscope_milestones', JSON.stringify(sampleMilestones));
    }
  };

  const saveFeatures = (updatedFeatures: Feature[]) => {
    setFeatures(updatedFeatures);
    localStorage.setItem('productscope_features', JSON.stringify(updatedFeatures));
  };

  const saveMilestones = (updatedMilestones: Milestone[]) => {
    setMilestones(updatedMilestones);
    localStorage.setItem('productscope_milestones', JSON.stringify(updatedMilestones));
  };

  // Feature CRUD operations
  const handleSaveFeature = () => {
    if (!formData.title?.trim()) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (selectedFeature) {
      // Update existing feature
      const updatedFeatures = features.map(f => 
        f.id === selectedFeature.id 
          ? { ...selectedFeature, ...formData, updatedAt: timestamp }
          : f
      );
      saveFeatures(updatedFeatures);
    } else {
      // Create new feature
      const newFeature: Feature = {
        id: Date.now().toString(),
        title: formData.title || '',
        description: formData.description || '',
        milestone: formData.milestone || '',
        status: formData.status || 'Not Started',
        stage: formData.stage || 'Discovery',
        complexity: formData.complexity || 'Medium',
        priority: formData.priority || 'Medium',
        businessValue: formData.businessValue || 5,
        effortEstimate: formData.effortEstimate || 1,
        tags: formData.tags || [],
        comments: formData.comments || '',
        createdAt: timestamp,
        updatedAt: timestamp,
        dueDate: formData.dueDate,
        assignee: formData.assignee
      };
      saveFeatures([...features, newFeature]);
    }

    setShowFeatureModal(false);
    setSelectedFeature(null);
    setFormData({});
  };

  const handleDeleteFeature = (id: string) => {
    const updatedFeatures = features.filter(f => f.id !== id);
    saveFeatures(updatedFeatures);
    setShowDeleteConfirm(null);
  };

  const handleEditFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    setFormData(feature);
    setShowFeatureModal(true);
  };

  const handleSaveMilestone = () => {
    if (!milestoneFormData.name?.trim()) return;

    if (selectedMilestone) {
      const updatedMilestones = milestones.map(m => 
        m.id === selectedMilestone.id 
          ? { ...selectedMilestone, ...milestoneFormData }
          : m
      );
      saveMilestones(updatedMilestones);
    } else {
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        name: milestoneFormData.name || '',
        description: milestoneFormData.description || '',
        targetDate: milestoneFormData.targetDate || '',
        status: milestoneFormData.status || 'Planning',
        color: milestoneFormData.color || '#3b82f6'
      };
      saveMilestones([...milestones, newMilestone]);
    }

    setShowMilestoneModal(false);
    setSelectedMilestone(null);
    setMilestoneFormData({});
  };

  // AI Integration
  const handleAIAnalysis = () => {
    if (!aiPrompt.trim()) return;

    const additionalContext = `
    Analyze the following product feature request and provide insights in JSON format with these fields:
    {
      "suggested_title": "Improved version of the title",
      "enhanced_description": "Enhanced and detailed description",
      "complexity_assessment": "Low|Medium|High|Very High",
      "priority_recommendation": "Critical|High|Medium|Low", 
      "business_value_score": 1-10,
      "effort_estimate": 1-55,
      "suggested_tags": ["tag1", "tag2", "tag3"],
      "risk_factors": ["risk1", "risk2"],
      "success_metrics": ["metric1", "metric2"],
      "dependencies": ["dependency1", "dependency2"]
    }
    
    Base your analysis on product management best practices, considering user impact, technical complexity, business value, and market trends.
    `;

    const fullPrompt = `${aiPrompt}\n\n${additionalContext}`;

    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(fullPrompt);
  };

  const handleAIResultParsing = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      if (parsed.suggested_title) {
        setFormData(prev => ({
          ...prev,
          title: parsed.suggested_title,
          description: parsed.enhanced_description,
          complexity: parsed.complexity_assessment,
          priority: parsed.priority_recommendation,
          businessValue: parsed.business_value_score,
          effortEstimate: parsed.effort_estimate,
          tags: parsed.suggested_tags || []
        }));
        setShowAiPanel(false);
        setShowFeatureModal(true);
      }
    } catch (error) {
      // If not JSON, treat as markdown
      setAiResult(result);
    }
  };

  // Filter functions
  const getFilteredFeatures = () => {
    return features.filter(feature => {
      const matchesSearch = !filters.search || 
        feature.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        feature.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        feature.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = !filters.status || feature.status === filters.status;
      const matchesStage = !filters.stage || feature.stage === filters.stage;
      const matchesMilestone = !filters.milestone || feature.milestone === filters.milestone;
      const matchesComplexity = !filters.complexity || feature.complexity === filters.complexity;
      const matchesPriority = !filters.priority || feature.priority === filters.priority;
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => feature.tags.includes(tag));

      return matchesSearch && matchesStatus && matchesStage && 
             matchesMilestone && matchesComplexity && matchesPriority && matchesTags;
    });
  };

  // Export/Import functions
  const exportToCSV = () => {
    const headers = [
      'ID', 'Title', 'Description', 'Milestone', 'Status', 'Stage', 
      'Complexity', 'Priority', 'Business Value', 'Effort Estimate', 
      'Tags', 'Comments', 'Created At', 'Updated At', 'Due Date', 'Assignee'
    ];
    
    const csvContent = [
      headers.join(','),
      ...features.map(f => [
        f.id,
        `"${f.title}"`,
        `"${f.description}"`,
        `"${f.milestone}"`,
        f.status,
        f.stage,
        f.complexity,
        f.priority,
        f.businessValue,
        f.effortEstimate,
        `"${f.tags.join('; ')}"`,
        `"${f.comments}"`,
        f.createdAt,
        f.updatedAt,
        f.dueDate || '',
        `"${f.assignee || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productscope-features-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const templateHeaders = [
      'Title', 'Description', 'Milestone', 'Status', 'Stage', 
      'Complexity', 'Priority', 'Business Value', 'Effort Estimate', 
      'Tags', 'Comments', 'Due Date', 'Assignee'
    ];
    
    const sampleRow = [
      'Sample Feature Title',
      'Detailed description of the feature',
      'Q1 2025 Release',
      'Not Started',
      'Discovery',
      'Medium',
      'High',
      '7',
      '8',
      'tag1; tag2; tag3',
      'Additional comments',
      '2025-06-30',
      'Team Lead'
    ];

    const csvContent = [
      templateHeaders.join(','),
      sampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productscope-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const importedFeatures: Feature[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length >= headers.length - 3) { // Allow some optional fields
          const timestamp = new Date().toISOString().split('T')[0];
          
          const feature: Feature = {
            id: Date.now().toString() + i,
            title: values[0] || '',
            description: values[1] || '',
            milestone: values[2] || '',
            status: (values[3] as Feature['status']) || 'Not Started',
            stage: (values[4] as Feature['stage']) || 'Discovery',
            complexity: (values[5] as Feature['complexity']) || 'Medium',
            priority: (values[6] as Feature['priority']) || 'Medium',
            businessValue: parseInt(values[7]) || 5,
            effortEstimate: parseInt(values[8]) || 1,
            tags: values[9] ? values[9].split(';').map(t => t.trim()) : [],
            comments: values[10] || '',
            createdAt: timestamp,
            updatedAt: timestamp,
            dueDate: values[11] || undefined,
            assignee: values[12] || undefined
          };
          
          importedFeatures.push(feature);
        }
      }
      
      if (importedFeatures.length > 0) {
        saveFeatures([...features, ...importedFeatures]);
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  // Priority Matrix calculations
  const getPriorityMatrixData = () => {
    return features.map(feature => ({
      ...feature,
      x: feature.businessValue,
      y: feature.effortEstimate
    }));
  };

  // Analytics calculations
  const getAnalyticsData = () => {
    const statusCounts = features.reduce((acc, feature) => {
      acc[feature.status] = (acc[feature.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const complexityCounts = features.reduce((acc, feature) => {
      acc[feature.complexity] = (acc[feature.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stageCounts = features.reduce((acc, feature) => {
      acc[feature.stage] = (acc[feature.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { statusCounts, complexityCounts, stageCounts };
  };

  const getStatusIcon = (status: Feature['status']) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'On Hold': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Cancelled': return <Circle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Feature['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getComplexityColor = (complexity: Feature['complexity']) => {
    switch (complexity) {
      case 'Very High': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const filteredFeatures = getFilteredFeatures();
  const analyticsData = getAnalyticsData();
  const priorityMatrixData = getPriorityMatrixData();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ProductScope</h1>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.first_name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowAiPanel(true)}
                className="btn btn-primary btn-sm flex items-center gap-2"
                id="ai-assistant-button"
              >
                <Brain className="w-4 h-4" />
                AI Assistant
              </button>
              
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'features', label: 'Features', icon: FileText },
              { id: 'roadmap', label: 'Roadmap', icon: Map },
              { id: 'priority-matrix', label: 'Priority Matrix', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: ChartBar },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${id}-tab`}
                onClick={() => setCurrentView(id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentView === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div id="generation_issue_fallback" className="max-w-7xl mx-auto">
          
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="space-y-6" id="dashboard-view">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Features</div>
                  <div className="stat-value">{features.length}</div>
                  <div className="stat-change stat-increase">+2 this week</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">In Progress</div>
                  <div className="stat-value">{features.filter(f => f.status === 'In Progress').length}</div>
                  <div className="stat-change stat-increase">+1 this week</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Completed</div>
                  <div className="stat-value">{features.filter(f => f.status === 'Completed').length}</div>
                  <div className="stat-change stat-increase">+0 this week</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Avg Business Value</div>
                  <div className="stat-value">
                    {features.length > 0 ? (features.reduce((sum, f) => sum + f.businessValue, 0) / features.length).toFixed(1) : '0'}
                  </div>
                  <div className="stat-change stat-increase">+0.2 this week</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card card-padding">
                <h2 className="heading-5 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedFeature(null);
                      setFormData({});
                      setShowFeatureModal(true);
                    }}
                    className="btn btn-primary"
                    id="add-feature-quick"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                  
                  <button
                    onClick={downloadTemplate}
                    className="btn btn-secondary"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="btn btn-secondary"
                  >
                    <Download className="w-4 h-4" />
                    Export Features
                  </button>
                  
                  <label className="btn btn-secondary cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import Features
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Recent Features */}
              <div className="card card-padding">
                <h2 className="heading-5 mb-4">Recent Features</h2>
                <div className="space-y-3">
                  {features.slice(0, 5).map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(feature.status)}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{feature.milestone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${getPriorityColor(feature.priority)}`}>
                          {feature.priority}
                        </span>
                        <button
                          onClick={() => handleEditFeature(feature)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features View */}
          {currentView === 'features' && (
            <div className="space-y-6" id="features-view">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="heading-3">Feature Management</h2>
                <button
                  onClick={() => {
                    setSelectedFeature(null);
                    setFormData({});
                    setShowFeatureModal(true);
                  }}
                  className="btn btn-primary"
                  id="add-feature-button"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>

              {/* Filters */}
              <div className="card card-padding">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Search features..."
                      className="input"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <select
                      className="select"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">All Status</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <select
                      className="select"
                      value={filters.stage}
                      onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                    >
                      <option value="">All Stages</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="Testing">Testing</option>
                      <option value="Launch">Launch</option>
                      <option value="Post-Launch">Post-Launch</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <select
                      className="select"
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <select
                      className="select"
                      value={filters.complexity}
                      onChange={(e) => setFilters(prev => ({ ...prev, complexity: e.target.value }))}
                    >
                      <option value="">All Complexity</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <select
                      className="select"
                      value={filters.milestone}
                      onChange={(e) => setFilters(prev => ({ ...prev, milestone: e.target.value }))}
                    >
                      <option value="">All Milestones</option>
                      {milestones.map(milestone => (
                        <option key={milestone.id} value={milestone.name}>
                          {milestone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Features Table */}
              <div className="card">
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Title</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Stage</th>
                        <th className="table-header-cell">Priority</th>
                        <th className="table-header-cell">Complexity</th>
                        <th className="table-header-cell">Business Value</th>
                        <th className="table-header-cell">Effort</th>
                        <th className="table-header-cell">Milestone</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredFeatures.map(feature => (
                        <tr key={feature.id} className="table-row">
                          <td className="table-cell">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{feature.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {feature.description}
                              </div>
                              {feature.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {feature.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="badge badge-gray text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                  {feature.tags.length > 2 && (
                                    <span className="text-xs text-gray-500">+{feature.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(feature.status)}
                              <span className="text-sm">{feature.status}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-sm">{feature.stage}</span>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${getPriorityColor(feature.priority)}`}>
                              {feature.priority}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${getComplexityColor(feature.complexity)}`}>
                              {feature.complexity}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(feature.businessValue / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{feature.businessValue}/10</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-sm">{feature.effortEstimate}pt</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-sm">{feature.milestone}</span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditFeature(feature)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(feature.id)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
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

          {/* Roadmap View */}
          {currentView === 'roadmap' && (
            <div className="space-y-6" id="roadmap-view">
              <div className="flex items-center justify-between">
                <h2 className="heading-3">Product Roadmap</h2>
                <button
                  onClick={() => {
                    setSelectedMilestone(null);
                    setMilestoneFormData({});
                    setShowMilestoneModal(true);
                  }}
                  className="btn btn-primary"
                  id="add-milestone-button"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>

              <div className="space-y-8">
                {milestones.map(milestone => {
                  const milestoneFeatures = features.filter(f => f.milestone === milestone.name);
                  
                  return (
                    <div key={milestone.id} className="card card-padding">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: milestone.color }}
                          ></div>
                          <div>
                            <h3 className="heading-5">{milestone.name}</h3>
                            <p className="text-caption">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(milestone.targetDate).toLocaleDateString()}
                          </span>
                          <span className={`badge ${
                            milestone.status === 'Active' ? 'badge-primary' :
                            milestone.status === 'Completed' ? 'badge-success' :
                            milestone.status === 'Delayed' ? 'badge-error' : 'badge-gray'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {milestoneFeatures.map(feature => (
                          <div key={feature.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                              {getStatusIcon(feature.status)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {feature.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`badge ${getPriorityColor(feature.priority)}`}>
                                {feature.priority}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {feature.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {milestoneFeatures.length === 0 && (
                          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                            No features assigned to this milestone yet.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Priority Matrix View */}
          {currentView === 'priority-matrix' && (
            <div className="space-y-6" id="priority-matrix-view">
              <h2 className="heading-3">Priority Matrix</h2>
              
              <div className="card card-padding">
                <div className="relative h-96 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  {/* Axis Labels */}
                  <div className="absolute -left-16 top-1/2 transform -rotate-90 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Effort (Story Points)
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Business Value (1-10)
                  </div>
                  
                  {/* Quadrant Labels */}
                  <div className="absolute top-4 left-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    High Effort, Low Value
                  </div>
                  <div className="absolute top-4 right-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    High Effort, High Value
                  </div>
                  <div className="absolute bottom-16 left-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Low Effort, Low Value
                  </div>
                  <div className="absolute bottom-16 right-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Low Effort, High Value (Quick Wins)
                  </div>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  
                  {/* Feature Points */}
                  <div className="absolute inset-4">
                    {priorityMatrixData.map(feature => {
                      const x = ((feature.businessValue - 1) / 9) * 100;
                      const y = 100 - ((Math.min(feature.effortEstimate, 50) - 1) / 49) * 100;
                      
                      return (
                        <div
                          key={feature.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                          style={{ left: `${x}%`, top: `${y}%` }}
                          title={`${feature.title} - Value: ${feature.businessValue}, Effort: ${feature.effortEstimate}`}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 border-white ${
                            feature.priority === 'Critical' ? 'bg-red-500' :
                            feature.priority === 'High' ? 'bg-orange-500' :
                            feature.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                          } group-hover:scale-150 transition-transform`}></div>
                          
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {feature.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Low</span>
                  </div>
                </div>
              </div>

              {/* Quick Wins */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Quick Wins (High Value, Low Effort)</h3>
                <div className="space-y-3">
                  {features
                    .filter(f => f.businessValue >= 7 && f.effortEstimate <= 5)
                    .map(feature => (
                      <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Value: {feature.businessValue}/10 • Effort: {feature.effortEstimate}pt
                          </p>
                        </div>
                        <span className={`badge ${getPriorityColor(feature.priority)}`}>
                          {feature.priority}
                        </span>
                      </div>
                    ))}
                  
                  {features.filter(f => f.businessValue >= 7 && f.effortEstimate <= 5).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">No quick wins identified.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && (
            <div className="space-y-6" id="analytics-view">
              <h2 className="heading-3">Analytics & Insights</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card card-padding">
                  <h3 className="heading-6 mb-4">Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status as Feature['status'])}
                          <span className="text-sm">{status}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-6 mb-4">Complexity Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.complexityCounts).map(([complexity, count]) => (
                      <div key={complexity} className="flex items-center justify-between">
                        <span className={`badge ${getComplexityColor(complexity as Feature['complexity'])}`}>
                          {complexity}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-6 mb-4">Stage Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.stageCounts).map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="text-sm">{stage}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Value vs Effort Chart */}
              <div className="card card-padding">
                <h3 className="heading-6 mb-4">Business Value vs Effort Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">High Value Features (7+)</h4>
                    <div className="space-y-2">
                      {features
                        .filter(f => f.businessValue >= 7)
                        .sort((a, b) => b.businessValue - a.businessValue)
                        .slice(0, 5)
                        .map(feature => (
                          <div key={feature.id} className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                            <span className="text-sm font-medium">{feature.title}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature.businessValue}/10</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Low Effort Features (≤5pt)</h4>
                    <div className="space-y-2">
                      {features
                        .filter(f => f.effortEstimate <= 5)
                        .sort((a, b) => a.effortEstimate - b.effortEstimate)
                        .slice(0, 5)
                        .map(feature => (
                          <div key={feature.id} className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-900/20">
                            <span className="text-sm font-medium">{feature.title}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature.effortEstimate}pt</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card card-padding">
                <h3 className="heading-6 mb-4">Recommendations</h3>
                <div className="space-y-4">
                  <div className="alert alert-info">
                    <TrendingUp className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">Focus on Quick Wins</h4>
                      <p>You have {features.filter(f => f.businessValue >= 7 && f.effortEstimate <= 5).length} features with high business value and low effort. Consider prioritizing these for quick impact.</p>
                    </div>
                  </div>
                  
                  <div className="alert alert-warning">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">Review High Effort Features</h4>
                      <p>You have {features.filter(f => f.effortEstimate > 20).length} features requiring significant effort. Ensure they align with strategic goals and consider breaking them down.</p>
                    </div>
                  </div>
                  
                  <div className="alert alert-success">
                    <Target className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">Balanced Portfolio</h4>
                      <p>Your feature portfolio shows a good balance across different complexity levels and business values. Continue maintaining this strategic mix.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="space-y-6" id="settings-view">
              <h2 className="heading-3">Settings</h2>
              
              {/* Milestone Management */}
              <div className="card card-padding">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-5">Milestone Management</h3>
                  <button
                    onClick={() => {
                      setSelectedMilestone(null);
                      setMilestoneFormData({});
                      setShowMilestoneModal(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>
                
                <div className="space-y-3">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: milestone.color }}
                        ></div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{milestone.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(milestone.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMilestone(milestone);
                          setMilestoneFormData(milestone);
                          setShowMilestoneModal(true);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Export All Data</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Download all features and milestones as CSV</p>
                    </div>
                    <button onClick={exportToCSV} className="btn btn-secondary btn-sm">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Import Template</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Download CSV template for bulk import</p>
                    </div>
                    <button onClick={downloadTemplate} className="btn btn-secondary btn-sm">
                      <Download className="w-4 h-4" />
                      Template
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-200">Clear All Data</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">Permanently delete all features and milestones</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (features.length > 0 || milestones.length > 0) {
                          setShowDeleteConfirm('all');
                        }
                      }}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* App Preferences */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">App Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDark ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowFeatureModal(false);
            setSelectedFeature(null);
            setFormData({});
          }
        }}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">
                {selectedFeature ? 'Edit Feature' : 'Add New Feature'}
              </h3>
              <button
                onClick={() => {
                  setShowFeatureModal(false);
                  setSelectedFeature(null);
                  setFormData({});
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
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
                  placeholder="Detailed description of the feature"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="select"
                    value={formData.status || 'Not Started'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Feature['status'] }))}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Stage</label>
                  <select
                    className="select"
                    value={formData.stage || 'Discovery'}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as Feature['stage'] }))}
                  >
                    <option value="Discovery">Discovery</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Launch">Launch</option>
                    <option value="Post-Launch">Post-Launch</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="select"
                    value={formData.priority || 'Medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Feature['priority'] }))}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Complexity</label>
                  <select
                    className="select"
                    value={formData.complexity || 'Medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as Feature['complexity'] }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Business Value (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input"
                    value={formData.businessValue || 5}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessValue: parseInt(e.target.value) || 5 }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Effort Estimate (Points)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.effortEstimate || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, effortEstimate: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    }))}
                    placeholder="e.g., AI, Core Feature, Revenue"
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
                  setShowFeatureModal(false);
                  setSelectedFeature(null);
                  setFormData({});
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSaveFeature} className="btn btn-primary">
                {selectedFeature ? 'Update Feature' : 'Add Feature'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">
                {selectedMilestone ? 'Edit Milestone' : 'Add New Milestone'}
              </h3>
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setSelectedMilestone(null);
                  setMilestoneFormData({});
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={milestoneFormData.name || ''}
                  onChange={(e) => setMilestoneFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Q1 2025 Release"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={milestoneFormData.description || ''}
                  onChange={(e) => setMilestoneFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this milestone"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Target Date</label>
                  <input
                    type="date"
                    className="input"
                    value={milestoneFormData.targetDate || ''}
                    onChange={(e) => setMilestoneFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="select"
                    value={milestoneFormData.status || 'Planning'}
                    onChange={(e) => setMilestoneFormData(prev => ({ ...prev, status: e.target.value as Milestone['status'] }))}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="color"
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                  value={milestoneFormData.color || '#3b82f6'}
                  onChange={(e) => setMilestoneFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setSelectedMilestone(null);
                  setMilestoneFormData({});
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSaveMilestone} className="btn btn-primary">
                {selectedMilestone ? 'Update Milestone' : 'Add Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Confirm Delete</h3>
            </div>
            
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-300">
                {showDeleteConfirm === 'all' 
                  ? 'Are you sure you want to delete all features and milestones? This action cannot be undone.'
                  : 'Are you sure you want to delete this feature? This action cannot be undone.'
                }
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm === 'all') {
                    setFeatures([]);
                    setMilestones([]);
                    localStorage.removeItem('productscope_features');
                    localStorage.removeItem('productscope_milestones');
                  } else {
                    handleDeleteFeature(showDeleteConfirm);
                  }
                  setShowDeleteConfirm(null);
                }}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Panel Modal */}
      {showAiPanel && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Feature Assistant
              </h3>
              <button
                onClick={() => {
                  setShowAiPanel(false);
                  setAiPrompt('');
                  setAiResult(null);
                  setAiError(null);
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Describe your feature idea</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., A real-time collaboration feature that allows multiple users to edit documents simultaneously with conflict resolution..."
                />
              </div>
              
              <button
                onClick={handleAIAnalysis}
                disabled={!aiPrompt.trim() || aiLoading}
                className="btn btn-primary w-full"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Analyze Feature
                  </>
                )}
              </button>
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Analysis Failed</h4>
                    <p>Failed to analyze the feature. Please try again.</p>
                  </div>
                </div>
              )}
              
              {aiResult && (
                <div className="alert alert-info">
                  <div className="w-full">
                    <h4 className="font-medium mb-2">AI Analysis Result</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {aiResult.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
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
      )}

      {/* AILayer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={handleAIResultParsing}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="px-6 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;