import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  User, Settings, LogOut, TrendingUp, TrendingDown, DollarSign, Target, 
  FileText, Upload, Download, Plus, Edit, Trash2, Search, Filter, 
  Calendar, Clock, ChevronDown, ChevronUp, Building, Briefcase, 
  BarChart as BarChartIcon, PieChart as PieChartIcon, Sun, Moon,
  Eye, AlertTriangle, CheckCircle, Circle, Brain, Zap, Database,
  CreditCard, Percent, Users, Globe, Phone, Mail, Tag, Award,
  ArrowUp, ArrowDown, ArrowRight, RefreshCw, ExternalLink, MapPin,
  Menu, X, Bell, Star, Bookmark, MessageCircle, Share, Download as DownloadIcon
} from 'lucide-react';

// Types and Interfaces
interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: 'Sourced' | 'Initial Review' | 'Due Diligence' | 'Term Sheet' | 'Closing' | 'Closed' | 'Passed';
  dealSize: number;
  valuation: number;
  probability: number;
  targetClose: string;
  leadPartner: string;
  description: string;
  location: string;
  founded: number;
  employees: number;
  revenue: number;
  ebitda: number;
  growth: number;
  risks: string[];
  opportunities: string[];
  createdAt: string;
  lastUpdated: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  initialInvestment: number;
  currentValuation: number;
  ownership: number;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Growth' | 'Exit';
  status: 'Performing' | 'Underperforming' | 'At Risk' | 'Exited';
  lastQuarterRevenue: number;
  lastQuarterGrowth: number;
  ebitdaMargin: number;
  cashBurn: number;
  runway: number;
  nextMilestone: string;
  keyMetrics: { [key: string]: number };
  boardMeetingDate: string;
  risks: string[];
  notes: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
  category: 'Due Diligence' | 'Legal' | 'Financial' | 'Operational' | 'Other';
  relatedDeal?: string;
  relatedPortfolio?: string;
}

interface MarketData {
  sector: string;
  avgValuation: number;
  avgGrowth: number;
  dealCount: number;
  trend: 'up' | 'down' | 'stable';
}

interface AIAnalysis {
  id: string;
  documentName: string;
  analysisType: 'Pitch Deck' | 'Financial Statement' | 'Market Research' | 'Due Diligence' | 'Other';
  keyFindings: string[];
  risks: string[];
  opportunities: string[];
  recommendation: string;
  confidence: number;
  createdAt: string;
  fullAnalysis: string;
}

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

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioCompany[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [filterSector, setFilterSector] = useState<string>('All');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioCompany | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample data initialization
  useEffect(() => {
    const savedDeals = localStorage.getItem('pe_deals');
    const savedPortfolio = localStorage.getItem('pe_portfolio');
    const savedTasks = localStorage.getItem('pe_tasks');
    const savedAnalyses = localStorage.getItem('pe_analyses');

    if (savedDeals) {
      setDeals(JSON.parse(savedDeals));
    } else {
      const sampleDeals: Deal[] = [
        {
          id: '1',
          companyName: 'TechFlow Solutions',
          sector: 'SaaS',
          stage: 'Due Diligence',
          dealSize: 50000000,
          valuation: 200000000,
          probability: 75,
          targetClose: '2025-08-15',
          leadPartner: 'Sarah Chen',
          description: 'AI-powered workflow automation platform for enterprises',
          location: 'San Francisco, CA',
          founded: 2019,
          employees: 125,
          revenue: 25000000,
          ebitda: 5000000,
          growth: 150,
          risks: ['Competitive market', 'Customer concentration'],
          opportunities: ['International expansion', 'Product line extension'],
          createdAt: '2025-05-01',
          lastUpdated: '2025-06-10'
        },
        {
          id: '2',
          companyName: 'GreenEnergy Dynamics',
          sector: 'CleanTech',
          stage: 'Term Sheet',
          dealSize: 75000000,
          valuation: 300000000,
          probability: 85,
          targetClose: '2025-07-30',
          leadPartner: 'Michael Rodriguez',
          description: 'Next-generation solar panel manufacturing with 40% efficiency gains',
          location: 'Austin, TX',
          founded: 2020,
          employees: 200,
          revenue: 45000000,
          ebitda: 9000000,
          growth: 200,
          risks: ['Regulatory changes', 'Supply chain disruption'],
          opportunities: ['Government incentives', 'Corporate sustainability trends'],
          createdAt: '2025-04-15',
          lastUpdated: '2025-06-11'
        }
      ];
      setDeals(sampleDeals);
      localStorage.setItem('pe_deals', JSON.stringify(sampleDeals));
    }

    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    } else {
      const samplePortfolio: PortfolioCompany[] = [
        {
          id: '1',
          name: 'DataVault Corp',
          sector: 'Enterprise Software',
          investmentDate: '2024-03-15',
          initialInvestment: 25000000,
          currentValuation: 80000000,
          ownership: 35,
          stage: 'Series B',
          status: 'Performing',
          lastQuarterRevenue: 12000000,
          lastQuarterGrowth: 45,
          ebitdaMargin: 25,
          cashBurn: 2000000,
          runway: 18,
          nextMilestone: 'Series C fundraising',
          keyMetrics: { arr: 48000000, ndr: 120, cac: 5000, ltv: 45000 },
          boardMeetingDate: '2025-06-25',
          risks: ['Key person dependency'],
          notes: 'Strong performance, on track for Series C'
        },
        {
          id: '2',
          name: 'HealthTech Innovations',
          sector: 'Healthcare',
          investmentDate: '2023-08-20',
          initialInvestment: 40000000,
          currentValuation: 120000000,
          ownership: 42,
          stage: 'Growth',
          status: 'Performing',
          lastQuarterRevenue: 18000000,
          lastQuarterGrowth: 35,
          ebitdaMargin: 30,
          cashBurn: 3000000,
          runway: 24,
          nextMilestone: 'FDA approval for new product',
          keyMetrics: { patients: 50000, engagement: 85, retention: 92 },
          boardMeetingDate: '2025-06-20',
          risks: ['Regulatory approval delays'],
          notes: 'FDA submission on track, strong user growth'
        }
      ];
      setPortfolio(samplePortfolio);
      localStorage.setItem('pe_portfolio', JSON.stringify(samplePortfolio));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Complete financial due diligence',
          description: 'Review last 3 years of audited financials for TechFlow Solutions',
          assignee: 'Alex Kumar',
          dueDate: '2025-06-20',
          priority: 'High',
          status: 'In Progress',
          category: 'Due Diligence',
          relatedDeal: '1'
        },
        {
          id: '2',
          title: 'Board meeting preparation',
          description: 'Prepare quarterly board deck for DataVault Corp',
          assignee: 'Sarah Chen',
          dueDate: '2025-06-23',
          priority: 'Medium',
          status: 'Pending',
          category: 'Operational',
          relatedPortfolio: '1'
        }
      ];
      setTasks(sampleTasks);
      localStorage.setItem('pe_tasks', JSON.stringify(sampleTasks));
    }

    if (savedAnalyses) {
      setAnalyses(JSON.parse(savedAnalyses));
    } else {
      setAnalyses([]);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pe_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('pe_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('pe_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pe_analyses', JSON.stringify(analyses));
  }, [analyses]);

  // Helper functions
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Performing': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Underperforming': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'At Risk': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'Exited': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'Critical': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'High': return 'text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // AI Analysis functions
  const handleAiAnalysis = async () => {
    if (!selectedFile && !aiPrompt.trim()) {
      setAiError('Please provide a prompt or select a file to analyze.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    let prompt = aiPrompt;
    if (selectedFile && !prompt.trim()) {
      prompt = `Analyze this ${selectedFile.type.includes('image') ? 'image' : 'document'} for investment insights.`;
    }

    // Enhanced prompt for structured analysis
    const enhancedPrompt = `${prompt}

Please provide a comprehensive investment analysis and return the response in JSON format with the following structure:
{
  "summary": "Brief executive summary",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "financialHighlights": {
    "revenue": "Revenue information if available",
    "growth": "Growth metrics if available",
    "profitability": "Profitability information if available"
  },
  "risks": ["Risk 1", "Risk 2", "Risk 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "recommendation": "Investment recommendation",
  "confidence": "Confidence level (1-100)",
  "nextSteps": ["Next step 1", "Next step 2"],
  "marketAnalysis": "Market analysis if relevant",
  "competitivePosition": "Competitive position analysis"
}

Focus on investment-relevant insights, financial metrics, market position, risks, and opportunities.`;

    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to analyze document. Please try again.');
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    
    // Try to parse JSON response for structured data
    try {
      const jsonResponse = JSON.parse(result);
      if (jsonResponse.keyFindings && jsonResponse.risks && jsonResponse.opportunities) {
        const newAnalysis: AIAnalysis = {
          id: Date.now().toString(),
          documentName: selectedFile?.name || 'Text Analysis',
          analysisType: 'Other',
          keyFindings: jsonResponse.keyFindings || [],
          risks: jsonResponse.risks || [],
          opportunities: jsonResponse.opportunities || [],
          recommendation: jsonResponse.recommendation || '',
          confidence: parseInt(jsonResponse.confidence) || 75,
          createdAt: new Date().toISOString(),
          fullAnalysis: result
        };
        
        setAnalyses(prev => [newAnalysis, ...prev]);
        setShowAiAnalysis(true);
      }
    } catch (e) {
      // If not JSON, treat as markdown
      const newAnalysis: AIAnalysis = {
        id: Date.now().toString(),
        documentName: selectedFile?.name || 'Text Analysis',
        analysisType: 'Other',
        keyFindings: ['See full analysis for details'],
        risks: ['See full analysis for details'],
        opportunities: ['See full analysis for details'],
        recommendation: 'See full analysis',
        confidence: 75,
        createdAt: new Date().toISOString(),
        fullAnalysis: result
      };
      
      setAnalyses(prev => [newAnalysis, ...prev]);
      setShowAiAnalysis(true);
    }
  };

  // Deal management functions
  const addDeal = (dealData: Partial<Deal>) => {
    const newDeal: Deal = {
      id: Date.now().toString(),
      companyName: dealData.companyName || '',
      sector: dealData.sector || 'Technology',
      stage: dealData.stage || 'Sourced',
      dealSize: dealData.dealSize || 0,
      valuation: dealData.valuation || 0,
      probability: dealData.probability || 50,
      targetClose: dealData.targetClose || '',
      leadPartner: dealData.leadPartner || currentUser?.first_name + ' ' + currentUser?.last_name || '',
      description: dealData.description || '',
      location: dealData.location || '',
      founded: dealData.founded || new Date().getFullYear(),
      employees: dealData.employees || 0,
      revenue: dealData.revenue || 0,
      ebitda: dealData.ebitda || 0,
      growth: dealData.growth || 0,
      risks: dealData.risks || [],
      opportunities: dealData.opportunities || [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setDeals(prev => [...prev, newDeal]);
    setShowAddDeal(false);
  };

  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, ...updates, lastUpdated: new Date().toISOString() }
        : deal
    ));
    setEditingDeal(null);
  };

  const deleteDeal = (dealId: string) => {
    setDeals(prev => prev.filter(deal => deal.id !== dealId));
  };

  // Portfolio management functions
  const addPortfolioCompany = (companyData: Partial<PortfolioCompany>) => {
    const newCompany: PortfolioCompany = {
      id: Date.now().toString(),
      name: companyData.name || '',
      sector: companyData.sector || 'Technology',
      investmentDate: companyData.investmentDate || new Date().toISOString().split('T')[0],
      initialInvestment: companyData.initialInvestment || 0,
      currentValuation: companyData.currentValuation || 0,
      ownership: companyData.ownership || 0,
      stage: companyData.stage || 'Seed',
      status: companyData.status || 'Performing',
      lastQuarterRevenue: companyData.lastQuarterRevenue || 0,
      lastQuarterGrowth: companyData.lastQuarterGrowth || 0,
      ebitdaMargin: companyData.ebitdaMargin || 0,
      cashBurn: companyData.cashBurn || 0,
      runway: companyData.runway || 0,
      nextMilestone: companyData.nextMilestone || '',
      keyMetrics: companyData.keyMetrics || {},
      boardMeetingDate: companyData.boardMeetingDate || '',
      risks: companyData.risks || [],
      notes: companyData.notes || ''
    };
    
    setPortfolio(prev => [...prev, newCompany]);
    setShowAddPortfolio(false);
  };

  const updatePortfolioCompany = (companyId: string, updates: Partial<PortfolioCompany>) => {
    setPortfolio(prev => prev.map(company => 
      company.id === companyId ? { ...company, ...updates } : company
    ));
    setEditingPortfolio(null);
  };

  const deletePortfolioCompany = (companyId: string) => {
    setPortfolio(prev => prev.filter(company => company.id !== companyId));
  };

  // Data export functions
  const exportData = (type: 'deals' | 'portfolio' | 'all') => {
    let data: any = {};
    let filename = '';
    
    switch (type) {
      case 'deals':
        data = deals;
        filename = 'pe-deals.json';
        break;
      case 'portfolio':
        data = portfolio;
        filename = 'pe-portfolio.json';
        break;
      case 'all':
        data = { deals, portfolio, tasks, analyses };
        filename = 'pe-data-export.json';
        break;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart data preparation
  const portfolioPerformanceData = portfolio.map(company => ({
    name: company.name,
    valuation: company.currentValuation / 1000000,
    growth: company.lastQuarterGrowth,
    investment: company.initialInvestment / 1000000
  }));

  const dealPipelineData = [
    { stage: 'Sourced', count: deals.filter(d => d.stage === 'Sourced').length, value: deals.filter(d => d.stage === 'Sourced').reduce((sum, d) => sum + d.dealSize, 0) / 1000000 },
    { stage: 'Initial Review', count: deals.filter(d => d.stage === 'Initial Review').length, value: deals.filter(d => d.stage === 'Initial Review').reduce((sum, d) => sum + d.dealSize, 0) / 1000000 },
    { stage: 'Due Diligence', count: deals.filter(d => d.stage === 'Due Diligence').length, value: deals.filter(d => d.stage === 'Due Diligence').reduce((sum, d) => sum + d.dealSize, 0) / 1000000 },
    { stage: 'Term Sheet', count: deals.filter(d => d.stage === 'Term Sheet').length, value: deals.filter(d => d.stage === 'Term Sheet').reduce((sum, d) => sum + d.dealSize, 0) / 1000000 },
    { stage: 'Closing', count: deals.filter(d => d.stage === 'Closing').length, value: deals.filter(d => d.stage === 'Closing').reduce((sum, d) => sum + d.dealSize, 0) / 1000000 }
  ];

  const sectorAllocationData = portfolio.reduce((acc: any[], company) => {
    const existing = acc.find(item => item.sector === company.sector);
    if (existing) {
      existing.value += company.currentValuation;
      existing.count += 1;
    } else {
      acc.push({ sector: company.sector, value: company.currentValuation, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Filter functions
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'All' || deal.stage === filterStage;
    const matchesSector = filterSector === 'All' || deal.sector === filterSector;
    return matchesSearch && matchesStage && matchesSector;
  });

  const filteredPortfolio = portfolio.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'All' || company.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  // Calculate key metrics
  const totalPortfolioValue = portfolio.reduce((sum, company) => sum + company.currentValuation, 0);
  const totalInvested = portfolio.reduce((sum, company) => sum + company.initialInvestment, 0);
  const totalReturn = totalPortfolioValue - totalInvested;
  const returnMultiple = totalInvested > 0 ? totalPortfolioValue / totalInvested : 0;
  const activeDealCount = deals.filter(deal => !['Closed', 'Passed'].includes(deal.stage)).length;
  const totalPipelineValue = deals.filter(deal => !['Closed', 'Passed'].includes(deal.stage)).reduce((sum, deal) => sum + deal.dealSize, 0);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PE Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition" id="welcome_fallback">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PE Command Center</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChartIcon },
                { id: 'deals', label: 'Deal Pipeline', icon: Target },
                { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'documents', label: 'AI Analysis', icon: Brain },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.first_name} {currentUser.last_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChartIcon },
                { id: 'deals', label: 'Deal Pipeline', icon: Target },
                { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'documents', label: 'AI Analysis', icon: Brain },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="generation_issue_fallback">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPortfolioValue)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {formatPercentage((returnMultiple - 1) * 100)} return
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Deals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeDealCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalPipelineValue)} pipeline value
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Companies</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{portfolio.length}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {portfolio.filter(c => c.status === 'Performing').length} performing
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Return Multiple</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{returnMultiple.toFixed(1)}x</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalReturn)} total return
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Deal Pipeline Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deal Pipeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealPipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Portfolio Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="valuation" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {deals.slice(0, 3).map(deal => (
                  <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{deal.companyName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stage: {deal.stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(deal.dealSize)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{deal.probability}% probability</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deal Pipeline Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deal Pipeline</h1>
              <button
                onClick={() => setShowAddDeal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Deal
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search companies..."
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stage</label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="input"
                  >
                    <option value="All">All Stages</option>
                    <option value="Sourced">Sourced</option>
                    <option value="Initial Review">Initial Review</option>
                    <option value="Due Diligence">Due Diligence</option>
                    <option value="Term Sheet">Term Sheet</option>
                    <option value="Closing">Closing</option>
                    <option value="Closed">Closed</option>
                    <option value="Passed">Passed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sector</label>
                  <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="input"
                  >
                    <option value="All">All Sectors</option>
                    <option value="SaaS">SaaS</option>
                    <option value="FinTech">FinTech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDeals.map(deal => (
                <div key={deal.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{deal.companyName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{deal.sector} • {deal.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingDeal(deal)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Stage</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        deal.stage === 'Closed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        deal.stage === 'Passed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {deal.stage}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Deal Size</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(deal.dealSize)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Valuation</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(deal.valuation)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Probability</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{deal.probability}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Target Close</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(deal.targetClose).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Lead Partner</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{deal.leadPartner}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{deal.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredDeals.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deals found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new deal to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
              <button
                onClick={() => setShowAddPortfolio(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Company
              </button>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Value</h3>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalPortfolioValue)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatPercentage((returnMultiple - 1) * 100)} total return
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Companies</h3>
                <p className="text-3xl font-bold text-green-600">{portfolio.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {portfolio.filter(c => c.status === 'Performing').length} performing
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Avg Growth</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {portfolio.length > 0 ? formatPercentage(portfolio.reduce((sum, c) => sum + c.lastQuarterGrowth, 0) / portfolio.length) : '0%'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last quarter</p>
              </div>
            </div>

            {/* Portfolio Companies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Companies</h3>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search companies..."
                        className="input pl-10"
                      />
                    </div>
                    <select
                      value={filterSector}
                      onChange={(e) => setFilterSector(e.target.value)}
                      className="input"
                    >
                      <option value="All">All Sectors</option>
                      <option value="Enterprise Software">Enterprise Software</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="FinTech">FinTech</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valuation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Growth</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ownership</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPortfolio.map(company => (
                      <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{company.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{company.sector}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(company.currentValuation)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatPercentage(((company.currentValuation - company.initialInvestment) / company.initialInvestment) * 100)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {company.lastQuarterGrowth >= 0 ? (
                              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm ${company.lastQuarterGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(company.lastQuarterGrowth)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {company.ownership}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPortfolio(company)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletePortfolioCompany(company.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPortfolio.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new company to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sector Allocation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio by Sector</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorAllocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sector, percent }) => `${sector} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Value']}
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Investment Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Investment vs Valuation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolioPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="investment" fill="#EF4444" name="Initial Investment ($M)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="valuation" fill="#10B981" name="Current Valuation ($M)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Deal Stage Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deal Stage Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dealPipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Deployed Capital</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalInvested)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Current Portfolio Value</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalPortfolioValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Unrealized Gains</span>
                    <span className="font-semibold text-green-600">{formatCurrency(totalReturn)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Deal Size</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {deals.length > 0 ? formatCurrency(deals.reduce((sum, d) => sum + d.dealSize, 0) / deals.length) : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Portfolio IRR</span>
                    <span className="font-semibold text-blue-600">24.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">TVPI Multiple</span>
                    <span className="font-semibold text-purple-600">{returnMultiple.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Document Analysis</h1>
            </div>

            {/* AI Analysis Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analyze Investment Documents</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Document (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="input"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Analysis Prompt
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you'd like to analyze... (e.g., 'Analyze this pitch deck for investment potential', 'Extract key financial metrics from this document', 'Evaluate market opportunity and risks')"
                    rows={4}
                    className="textarea"
                  />
                </div>

                <button
                  onClick={handleAiAnalysis}
                  disabled={isAiLoading || (!selectedFile && !aiPrompt.trim())}
                  className="btn btn-primary"
                >
                  {isAiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI responses may contain inaccuracies. Please review all analyses with professional judgment.
                </p>
              </div>

              {/* AI Results */}
              {aiResult && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">AI Analysis Result</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Error</h4>
                  <p className="text-red-700 dark:text-red-400">{aiError.toString()}</p>
                </div>
              )}
            </div>

            {/* Previous Analyses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Previous Analyses</h3>
              
              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No analyses yet</h4>
                  <p className="text-gray-500 dark:text-gray-400">Upload a document and run an AI analysis to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map(analysis => (
                    <div key={analysis.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{analysis.documentName}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(analysis.createdAt).toLocaleDateString()} • Confidence: {analysis.confidence}%
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          analysis.analysisType === 'Pitch Deck' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          analysis.analysisType === 'Financial Statement' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {analysis.analysisType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Key Findings</h5>
                          <ul className="space-y-1">
                            {analysis.keyFindings.slice(0, 3).map((finding, idx) => (
                              <li key={idx} className="text-gray-600 dark:text-gray-400">• {finding}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Risks</h5>
                          <ul className="space-y-1">
                            {analysis.risks.slice(0, 3).map((risk, idx) => (
                              <li key={idx} className="text-red-600 dark:text-red-400">• {risk}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Opportunities</h5>
                          <ul className="space-y-1">
                            {analysis.opportunities.slice(0, 3).map((opp, idx) => (
                              <li key={idx} className="text-green-600 dark:text-green-400">• {opp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {analysis.recommendation && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">Recommendation</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.recommendation}</p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setAiResult(analysis.fullAnalysis);
                          setShowAiAnalysis(true);
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Full Analysis →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => exportData('deals')}
                    className="btn btn-secondary"
                  >
                    <Download className="h-4 w-4" />
                    Export Deals
                  </button>
                  <button
                    onClick={() => exportData('portfolio')}
                    className="btn btn-secondary"
                  >
                    <Download className="h-4 w-4" />
                    Export Portfolio
                  </button>
                  <button
                    onClick={() => exportData('all')}
                    className="btn btn-primary"
                  >
                    <Download className="h-4 w-4" />
                    Export All Data
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                        localStorage.removeItem('pe_deals');
                        localStorage.removeItem('pe_portfolio');
                        localStorage.removeItem('pe_tasks');
                        localStorage.removeItem('pe_analyses');
                        setDeals([]);
                        setPortfolio([]);
                        setTasks([]);
                        setAnalyses([]);
                      }
                    }}
                    className="btn btn-error"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All Data
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This will permanently delete all deals, portfolio companies, tasks, and analyses.
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
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

            {/* User Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="text-gray-900 dark:text-white">{currentUser.first_name} {currentUser.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-gray-900 dark:text-white">{currentUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="text-gray-900 dark:text-white">{currentUser.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Deal</h3>
              <button
                onClick={() => setShowAddDeal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DealForm
              onSubmit={addDeal}
              onCancel={() => setShowAddDeal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {editingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Deal</h3>
              <button
                onClick={() => setEditingDeal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DealForm
              deal={editingDeal}
              onSubmit={(data) => updateDeal(editingDeal.id, data)}
              onCancel={() => setEditingDeal(null)}
            />
          </div>
        </div>
      )}

      {/* Add Portfolio Modal */}
      {showAddPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Portfolio Company</h3>
              <button
                onClick={() => setShowAddPortfolio(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PortfolioForm
              onSubmit={addPortfolioCompany}
              onCancel={() => setShowAddPortfolio(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Portfolio Modal */}
      {editingPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Portfolio Company</h3>
              <button
                onClick={() => setEditingPortfolio(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PortfolioForm
              company={editingPortfolio}
              onSubmit={(data) => updatePortfolioCompany(editingPortfolio.id, data)}
              onCancel={() => setEditingPortfolio(null)}
            />
          </div>
        </div>
      )}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={setAiError}
        onLoading={setIsAiLoading}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Deal Form Component
interface DealFormProps {
  deal?: Deal;
  onSubmit: (data: Partial<Deal>) => void;
  onCancel: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ deal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Deal>>(deal || {
    companyName: '',
    sector: 'SaaS',
    stage: 'Sourced',
    dealSize: 0,
    valuation: 0,
    probability: 50,
    targetClose: '',
    leadPartner: '',
    description: '',
    location: '',
    founded: new Date().getFullYear(),
    employees: 0,
    revenue: 0,
    ebitda: 0,
    growth: 0,
    risks: [],
    opportunities: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
          <input
            type="text"
            required
            value={formData.companyName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sector</label>
          <select
            value={formData.sector || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
            className="input"
          >
            <option value="SaaS">SaaS</option>
            <option value="FinTech">FinTech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="CleanTech">CleanTech</option>
            <option value="E-commerce">E-commerce</option>
            <option value="AI/ML">AI/ML</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
          <select
            value={formData.stage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as Deal['stage'] }))}
            className="input"
          >
            <option value="Sourced">Sourced</option>
            <option value="Initial Review">Initial Review</option>
            <option value="Due Diligence">Due Diligence</option>
            <option value="Term Sheet">Term Sheet</option>
            <option value="Closing">Closing</option>
            <option value="Closed">Closed</option>
            <option value="Passed">Passed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Probability (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.probability || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deal Size ($)</label>
          <input
            type="number"
            min="0"
            value={formData.dealSize || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, dealSize: parseInt(e.target.value) || 0 }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valuation ($)</label>
          <input
            type="number"
            min="0"
            value={formData.valuation || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, valuation: parseInt(e.target.value) || 0 }))}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Close Date</label>
          <input
            type="date"
            value={formData.targetClose || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, targetClose: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Partner</label>
          <input
            type="text"
            value={formData.leadPartner || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, leadPartner: e.target.value }))}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="textarea"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {deal ? 'Update Deal' : 'Add Deal'}
        </button>
      </div>
    </form>
  );
};

// Portfolio Form Component
interface PortfolioFormProps {
  company?: PortfolioCompany;
  onSubmit: (data: Partial<PortfolioCompany>) => void;
  onCancel: () => void;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ company, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PortfolioCompany>>(company || {
    name: '',
    sector: 'Technology',
    investmentDate: '',
    initialInvestment: 0,
    currentValuation: 0,
    ownership: 0,
    stage: 'Seed',
    status: 'Performing',
    lastQuarterRevenue: 0,
    lastQuarterGrowth: 0,
    ebitdaMargin: 0,
    cashBurn: 0,
    runway: 0,
    nextMilestone: '',
    keyMetrics: {},
    boardMeetingDate: '',
    risks: [],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sector</label>
          <select
            value={formData.sector || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
            className="input"
          >
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="FinTech">FinTech</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Enterprise Software">Enterprise Software</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Date</label>
          <input
            type="date"
            value={formData.investmentDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, investmentDate: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
          <select
            value={formData.stage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as PortfolioCompany['stage'] }))}
            className="input"
          >
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="Growth">Growth</option>
            <option value="Exit">Exit</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Investment ($)</label>
          <input
            type="number"
            min="0"
            value={formData.initialInvestment || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, initialInvestment: parseInt(e.target.value) || 0 }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Valuation ($)</label>
          <input
            type="number"
            min="0"
            value={formData.currentValuation || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, currentValuation: parseInt(e.target.value) || 0 }))}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ownership (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.ownership || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, ownership: parseInt(e.target.value) || 0 }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={formData.status || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PortfolioCompany['status'] }))}
            className="input"
          >
            <option value="Performing">Performing</option>
            <option value="Underperforming">Underperforming</option>
            <option value="At Risk">At Risk</option>
            <option value="Exited">Exited</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="textarea"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {company ? 'Update Company' : 'Add Company'}
        </button>
      </div>
    </form>
  );
};

export default App;