import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Building, FileText, Upload,
  Download, Settings, Plus, Edit, Trash2, Search, Filter, Eye,
  Calculator, Target, Briefcase, Clock, AlertTriangle, CheckCircle,
  Sun, Moon, Bell, Mail, Phone, Calendar, BarChart3, PieChart as PieChartIcon,
  Users, Globe, Award, Zap, Brain, FileImage, Cpu, Database, CreditCard,
  Percent, Receipt, Smartphone, Laptop, Monitor, Printer, Keyboard, X
} from 'lucide-react';

// Types and Interfaces
interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  investmentAmount: number;
  currentValue: number;
  ownership: number;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Growth' | 'Pre-IPO';
  ebitda: number;
  revenue: number;
  employees: number;
  geography: string;
  status: 'Active' | 'Exited' | 'Distressed';
  irr: number;
  moic: number;
}

interface Deal {
  id: string;
  companyName: string;
  sector: string;
  dealSize: number;
  stage: 'Sourcing' | 'Due Diligence' | 'IC Review' | 'Term Sheet' | 'Legal' | 'Closed';
  probability: number;
  expectedClose: string;
  leadPartner: string;
  ebitdaMultiple: number;
  projectedIrr: number;
  notes: string;
}

interface FundPerformance {
  fundName: string;
  vintage: number;
  committed: number;
  called: number;
  distributed: number;
  nav: number;
  irr: number;
  moic: number;
  dpi: number;
  tvpi: number;
}

interface FinancialMetric {
  period: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
  cashFlow: number;
  debt: number;
  equity: number;
}

// Main App Component
const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [fundPerformance, setFundPerformance] = useState<FundPerformance[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('All');
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // AI Integration State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Dark Mode Hook
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

  // Initialize Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedPortfolio = localStorage.getItem('pe_portfolio_companies');
    const savedDeals = localStorage.getItem('pe_deals');
    const savedFunds = localStorage.getItem('pe_fund_performance');

    if (savedPortfolio) {
      setPortfolioCompanies(JSON.parse(savedPortfolio));
    } else {
      const mockPortfolio: PortfolioCompany[] = [
        {
          id: '1',
          name: 'TechCorp Solutions',
          sector: 'Technology',
          investmentDate: '2022-03-15',
          investmentAmount: 50000000,
          currentValue: 85000000,
          ownership: 65,
          stage: 'Growth',
          ebitda: 12000000,
          revenue: 75000000,
          employees: 450,
          geography: 'UK',
          status: 'Active',
          irr: 35.2,
          moic: 1.7
        },
        {
          id: '2',
          name: 'HealthTech Innovations',
          sector: 'Healthcare',
          investmentDate: '2021-11-08',
          investmentAmount: 35000000,
          currentValue: 62000000,
          ownership: 55,
          stage: 'Series B',
          ebitda: 8500000,
          revenue: 48000000,
          employees: 280,
          geography: 'EU',
          status: 'Active',
          irr: 42.1,
          moic: 1.8
        },
        {
          id: '3',
          name: 'FinanceFlow Ltd',
          sector: 'Financial Services',
          investmentDate: '2020-06-22',
          investmentAmount: 25000000,
          currentValue: 45000000,
          ownership: 40,
          stage: 'Growth',
          ebitda: 6200000,
          revenue: 32000000,
          employees: 180,
          geography: 'UK',
          status: 'Active',
          irr: 28.5,
          moic: 1.8
        }
      ];
      setPortfolioCompanies(mockPortfolio);
      localStorage.setItem('pe_portfolio_companies', JSON.stringify(mockPortfolio));
    }

    if (savedDeals) {
      setDeals(JSON.parse(savedDeals));
    } else {
      const mockDeals: Deal[] = [
        {
          id: '1',
          companyName: 'CleanEnergy Solutions',
          sector: 'Energy',
          dealSize: 75000000,
          stage: 'Due Diligence',
          probability: 70,
          expectedClose: '2025-08-15',
          leadPartner: 'Sarah Johnson',
          ebitdaMultiple: 12.5,
          projectedIrr: 32,
          notes: 'Strong growth potential in renewable energy sector'
        },
        {
          id: '2',
          companyName: 'DataAnalytics Pro',
          sector: 'Technology',
          dealSize: 40000000,
          stage: 'IC Review',
          probability: 85,
          expectedClose: '2025-07-30',
          leadPartner: 'Michael Chen',
          ebitdaMultiple: 15.2,
          projectedIrr: 38,
          notes: 'AI-driven analytics platform with strong market position'
        }
      ];
      setDeals(mockDeals);
      localStorage.setItem('pe_deals', JSON.stringify(mockDeals));
    }

    if (savedFunds) {
      setFundPerformance(JSON.parse(savedFunds));
    } else {
      const mockFunds: FundPerformance[] = [
        {
          fundName: 'UK Growth Fund III',
          vintage: 2021,
          committed: 500000000,
          called: 350000000,
          distributed: 125000000,
          nav: 425000000,
          irr: 28.5,
          moic: 1.6,
          dpi: 0.36,
          tvpi: 1.57
        },
        {
          fundName: 'European Tech Fund II',
          vintage: 2019,
          committed: 300000000,
          called: 285000000,
          distributed: 180000000,
          nav: 245000000,
          irr: 31.2,
          moic: 1.5,
          dpi: 0.63,
          tvpi: 1.49
        }
      ];
      setFundPerformance(mockFunds);
      localStorage.setItem('pe_fund_performance', JSON.stringify(mockFunds));
    }
  };

  const savePortfolioCompanies = (companies: PortfolioCompany[]) => {
    setPortfolioCompanies(companies);
    localStorage.setItem('pe_portfolio_companies', JSON.stringify(companies));
  };

  // AI Integration Functions
  const handleAiAnalysis = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    let fullPrompt = aiPrompt;
    if (selectedFile && !aiPrompt.trim()) {
      fullPrompt = "Analyze this financial document and extract key metrics. Return JSON with keys: revenue, ebitda, netIncome, growth_rate, debt_equity_ratio, key_risks, opportunities, recommendation";
    } else if (selectedFile && aiPrompt.trim()) {
      fullPrompt = aiPrompt + " Return the analysis in JSON format with structured data that can be used to populate our portfolio management system.";
    }

    aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
  };

  const processAiResult = (result: string) => {
    try {
      const jsonResult = JSON.parse(result);
      if (jsonResult.revenue || jsonResult.ebitda) {
        // Auto-populate a new portfolio entry or deal
        const newCompany: PortfolioCompany = {
          id: Date.now().toString(),
          name: jsonResult.company_name || 'AI Analyzed Company',
          sector: jsonResult.sector || 'Unknown',
          investmentDate: new Date().toISOString().split('T')[0],
          investmentAmount: jsonResult.investment_amount || 0,
          currentValue: jsonResult.current_value || 0,
          ownership: jsonResult.ownership || 0,
          stage: 'Growth',
          ebitda: jsonResult.ebitda || 0,
          revenue: jsonResult.revenue || 0,
          employees: jsonResult.employees || 0,
          geography: 'UK',
          status: 'Active',
          irr: jsonResult.irr || 0,
          moic: jsonResult.moic || 0
        };
        
        const updatedCompanies = [...portfolioCompanies, newCompany];
        savePortfolioCompanies(updatedCompanies);
        setNotifications(prev => [...prev, `AI analysis completed and new company "${newCompany.name}" added to portfolio`]);
      }
    } catch (error) {
      // If not JSON, just display as markdown
      console.log('AI result is not JSON, displaying as text');
    }
  };

  // Portfolio Management Functions
  const addCompany = (company: Omit<PortfolioCompany, 'id'>) => {
    const newCompany: PortfolioCompany = {
      ...company,
      id: Date.now().toString()
    };
    const updatedCompanies = [...portfolioCompanies, newCompany];
    savePortfolioCompanies(updatedCompanies);
    setShowModal(false);
  };

  const updateCompany = (id: string, updatedCompany: Omit<PortfolioCompany, 'id'>) => {
    const updatedCompanies = portfolioCompanies.map(company =>
      company.id === id ? { ...updatedCompany, id } : company
    );
    savePortfolioCompanies(updatedCompanies);
    setShowModal(false);
  };

  const deleteCompany = (id: string) => {
    const updatedCompanies = portfolioCompanies.filter(company => company.id !== id);
    savePortfolioCompanies(updatedCompanies);
  };

  // Data Export Functions
  const exportToCsv = () => {
    const csvContent = [
      ['Company', 'Sector', 'Investment Amount', 'Current Value', 'IRR', 'MOIC', 'Status'].join(','),
      ...portfolioCompanies.map(company => [
        company.name,
        company.sector,
        company.investmentAmount,
        company.currentValue,
        company.irr,
        company.moic,
        company.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_companies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and Search
  const filteredCompanies = portfolioCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSector === 'All' || company.sector === filterSector;
    return matchesSearch && matchesFilter;
  });

  const sectors = ['All', ...Array.from(new Set(portfolioCompanies.map(c => c.sector)))];

  // Charts Data
  const portfolioValueData = portfolioCompanies.map(company => ({
    name: company.name,
    value: company.currentValue,
    investment: company.investmentAmount
  }));

  const sectorData = sectors.slice(1).map(sector => ({
    name: sector,
    value: portfolioCompanies
      .filter(c => c.sector === sector)
      .reduce((sum, c) => sum + c.currentValue, 0)
  }));

  const performanceData = [
    { name: 'Q1 2024', irr: 25.3, moic: 1.4 },
    { name: 'Q2 2024', irr: 28.1, moic: 1.5 },
    { name: 'Q3 2024', irr: 31.2, moic: 1.6 },
    { name: 'Q4 2024', irr: 33.5, moic: 1.7 },
    { name: 'Q1 2025', irr: 35.8, moic: 1.8 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Calculate KPIs
  const totalPortfolioValue = portfolioCompanies.reduce((sum, c) => sum + c.currentValue, 0);
  const totalInvestment = portfolioCompanies.reduce((sum, c) => sum + c.investmentAmount, 0);
  const averageIrr = portfolioCompanies.reduce((sum, c) => sum + c.irr, 0) / portfolioCompanies.length || 0;
  const totalMoic = totalPortfolioValue / totalInvestment || 0;

  if (!currentUser) {
    return (
      <div id="welcome_fallback" className="flex-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="heading-1 mb-4">PE CFO Command Center</h1>
          <p className="text-body">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-lg">
          <div className="flex-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="heading-6 text-gray-900 dark:text-white">PE CFO Command Center</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Private Equity Management Suite</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {currentUser.first_name}
              </div>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-lg">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'portfolio', label: 'Portfolio', icon: Building },
              { id: 'deals', label: 'Deal Pipeline', icon: Target },
              { id: 'performance', label: 'Fund Performance', icon: TrendingUp },
              { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container-lg py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="dashboard-content" className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Portfolio Overview</h2>
              <div className="flex gap-3">
                <button onClick={exportToCsv} className="btn btn-secondary btn-sm">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Brain className="w-4 h-4" />
                  AI Analysis
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card card-padding">
                <div className="flex-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      £{(totalPortfolioValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex-center">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+12.5% this quarter</span>
                </div>
              </div>

              <div className="card card-padding">
                <div className="flex-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average IRR</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {averageIrr.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Above target of 25%</span>
                </div>
              </div>

              <div className="card card-padding">
                <div className="flex-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio MOIC</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalMoic.toFixed(1)}x
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex-center">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Strong performance</span>
                </div>
              </div>

              <div className="card card-padding">
                <div className="flex-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Companies</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolioCompanies.filter(c => c.status === 'Active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex-center">
                    <Building className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">2 new this quarter</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Portfolio Value vs Investment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolioValueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: any) => [`£${(value / 1000000).toFixed(1)}M`, '']}
                      labelStyle={{ color: 'var(--color-text-primary)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-primary)', 
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="investment" fill="#94a3b8" name="Investment" />
                    <Bar dataKey="value" fill="#3b82f6" name="Current Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Portfolio by Sector</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`£${(value / 1000000).toFixed(1)}M`, 'Value']}
                      labelStyle={{ color: 'var(--color-text-primary)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-primary)', 
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Trend */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: 'var(--color-text-primary)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-primary)', 
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="irr" stroke="#3b82f6" strokeWidth={3} name="IRR %" />
                  <Line type="monotone" dataKey="moic" stroke="#10b981" strokeWidth={3} name="MOIC" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div id="portfolio-content" className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">Portfolio Companies</h2>
              <button
                onClick={() => {
                  setModalType('add');
                  setSelectedCompany(null);
                  setShowModal(true);
                }}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>

            {/* Filters */}
            <div className="card card-padding">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Search Companies</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search by name or sector..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Filter by Sector</label>
                  <select
                    className="select"
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                  >
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Actions</label>
                  <button onClick={exportToCsv} className="btn btn-secondary w-full">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Portfolio Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Company</th>
                      <th className="table-header-cell">Sector</th>
                      <th className="table-header-cell">Investment</th>
                      <th className="table-header-cell">Current Value</th>
                      <th className="table-header-cell">IRR</th>
                      <th className="table-header-cell">MOIC</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredCompanies.map(company => (
                      <tr key={company.id} className="table-row">
                        <td className="table-cell">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{company.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{company.geography}</div>
                          </div>
                        </td>
                        <td className="table-cell">{company.sector}</td>
                        <td className="table-cell">£{(company.investmentAmount / 1000000).toFixed(1)}M</td>
                        <td className="table-cell">£{(company.currentValue / 1000000).toFixed(1)}M</td>
                        <td className="table-cell">
                          <span className={`font-medium ${company.irr >= 25 ? 'text-green-600' : 'text-orange-600'}`}>
                            {company.irr.toFixed(1)}%
                          </span>
                        </td>
                        <td className="table-cell">{company.moic.toFixed(1)}x</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            company.status === 'Active' ? 'badge-success' :
                            company.status === 'Exited' ? 'badge-primary' : 'badge-error'
                          }`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setModalType('view');
                                setShowModal(true);
                              }}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setModalType('edit');
                                setShowModal(true);
                              }}
                              className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCompany(company.id)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
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

        {/* Deal Pipeline Tab */}
        {activeTab === 'deals' && (
          <div id="deals-content" className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">Deal Pipeline</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Pipeline Value: £{(deals.reduce((sum, deal) => sum + deal.dealSize, 0) / 1000000).toFixed(1)}M
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pipeline Stages */}
              <div className="lg:col-span-2 space-y-4">
                {['Sourcing', 'Due Diligence', 'IC Review', 'Term Sheet', 'Legal', 'Closed'].map(stage => {
                  const stageDeals = deals.filter(deal => deal.stage === stage);
                  return (
                    <div key={stage} className="card card-padding">
                      <div className="flex-between mb-4">
                        <h3 className="heading-6">{stage}</h3>
                        <span className="badge badge-primary">{stageDeals.length}</span>
                      </div>
                      <div className="space-y-3">
                        {stageDeals.map(deal => (
                          <div key={deal.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{deal.companyName}</h4>
                              <span className="text-sm font-medium text-green-600">
                                £{(deal.dealSize / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div>Sector: {deal.sector}</div>
                              <div>Probability: {deal.probability}%</div>
                              <div>Lead: {deal.leadPartner}</div>
                              <div>Expected Close: {new Date(deal.expectedClose).toLocaleDateString()}</div>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${deal.probability}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pipeline Summary */}
              <div className="space-y-6">
                <div className="card card-padding">
                  <h3 className="heading-6 mb-4">Pipeline Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Deals</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{deals.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Deal Size</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        £{(deals.reduce((sum, deal) => sum + deal.dealSize, 0) / deals.length / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Weighted Pipeline</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        £{(deals.reduce((sum, deal) => sum + (deal.dealSize * deal.probability / 100), 0) / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-6 mb-4">Upcoming Closes</h3>
                  <div className="space-y-3">
                    {deals
                      .filter(deal => new Date(deal.expectedClose) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
                      .sort((a, b) => new Date(a.expectedClose).getTime() - new Date(b.expectedClose).getTime())
                      .map(deal => (
                        <div key={deal.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-white">{deal.companyName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(deal.expectedClose).toLocaleDateString()}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            £{(deal.dealSize / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fund Performance Tab */}
        {activeTab === 'performance' && (
          <div id="performance-content" className="space-y-6">
            <h2 className="heading-3">Fund Performance</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {fundPerformance.map((fund, index) => (
                <div key={index} className="card card-padding">
                  <div className="flex-between mb-4">
                    <h3 className="heading-5">{fund.fundName}</h3>
                    <span className="badge badge-primary">Vintage {fund.vintage}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Committed Capital</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        £{(fund.committed / 1000000).toFixed(0)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Called Capital</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        £{(fund.called / 1000000).toFixed(0)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Distributed</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        £{(fund.distributed / 1000000).toFixed(0)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">NAV</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        £{(fund.nav / 1000000).toFixed(0)}M
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-green-700 dark:text-green-400">IRR</div>
                      <div className="text-xl font-bold text-green-800 dark:text-green-300">
                        {fund.irr.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm text-blue-700 dark:text-blue-400">MOIC</div>
                      <div className="text-xl font-bold text-blue-800 dark:text-blue-300">
                        {fund.moic.toFixed(1)}x
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm text-purple-700 dark:text-purple-400">DPI</div>
                      <div className="text-xl font-bold text-purple-800 dark:text-purple-300">
                        {fund.dpi.toFixed(2)}x
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-sm text-orange-700 dark:text-orange-400">TVPI</div>
                      <div className="text-xl font-bold text-orange-800 dark:text-orange-300">
                        {fund.tvpi.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Quarterly Performance Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorIrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: 'var(--color-text-primary)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-primary)', 
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="irr" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIrr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai-analysis' && (
          <div id="ai-analysis-content" className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">AI-Powered Analysis</h2>
              <div className="badge badge-primary">Powered by Advanced AI</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Input Section */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Document Analysis</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Analysis Type</label>
                    <select className="select">
                      <option>Financial Statement Analysis</option>
                      <option>Investment Memo Review</option>
                      <option>Due Diligence Report</option>
                      <option>Market Research Analysis</option>
                      <option>Risk Assessment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Document</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.txt"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          PDF, DOC, XLSX files up to 10MB
                        </p>
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-green-600">
                        Selected: {selectedFile.name}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Custom Analysis Prompt (Optional)</label>
                    <textarea
                      className="textarea"
                      rows={4}
                      placeholder="Enter specific questions or analysis requirements..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAiAnalysis}
                    disabled={isAiLoading || (!aiPrompt.trim() && !selectedFile)}
                    className="btn btn-primary w-full"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Start Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Results Section */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Analysis Results</h3>
                <div className="min-h-[400px]">
                  {isAiLoading && (
                    <div className="flex-center h-40">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing document...</p>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="alert alert-error">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <strong>Analysis Error</strong>
                        <p>{aiError.message || 'Failed to analyze document. Please try again.'}</p>
                      </div>
                    </div>
                  )}

                  {aiResult && (
                    <div className="space-y-4">
                      <div className="alert alert-success">
                        <CheckCircle className="w-5 h-5" />
                        <div>
                          <strong>Analysis Complete</strong>
                          <p>Document has been successfully analyzed.</p>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isAiLoading && !aiResult && !aiError && (
                    <div className="flex-center h-40 text-center">
                      <div>
                        <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Upload a document or enter a prompt to start AI analysis
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Analysis Templates */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Quick Analysis Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Financial Health Check',
                    description: 'Analyze balance sheet and income statement',
                    prompt: 'Analyze the financial health of this company including liquidity ratios, profitability metrics, and debt levels. Return JSON with keys: financial_health_score, liquidity_ratio, debt_to_equity, profitability_trend, key_concerns, recommendations'
                  },
                  {
                    title: 'Market Position Analysis',
                    description: 'Evaluate competitive positioning and market share',
                    prompt: 'Evaluate the market position and competitive advantages of this company. Return JSON with keys: market_share, competitive_advantages, market_trends, growth_potential, threats, strategic_recommendations'
                  },
                  {
                    title: 'Investment Risk Assessment',
                    description: 'Identify key investment risks and mitigation strategies',
                    prompt: 'Conduct a comprehensive risk assessment for this investment opportunity. Return JSON with keys: risk_level, key_risks, financial_risks, operational_risks, market_risks, mitigation_strategies'
                  }
                ].map((template, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{template.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                    <button
                      onClick={() => setAiPrompt(template.prompt)}
                      className="btn btn-secondary btn-sm w-full"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div id="settings-content" className="space-y-6">
            <h2 className="heading-3">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <button onClick={exportToCsv} className="btn btn-secondary w-full">
                      <Download className="w-4 h-4" />
                      Export All Data (CSV)
                    </button>
                    <button
                      onClick={() => {
                        const jsonData = {
                          portfolioCompanies,
                          deals,
                          fundPerformance
                        };
                        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'pe_data_backup.json';
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="btn btn-secondary w-full"
                    >
                      <Database className="w-4 h-4" />
                      Backup All Data (JSON)
                    </button>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="btn btn-error w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </button>
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex-between">
                      <span className="text-sm font-medium">Dark Mode</span>
                      <button
                        onClick={toggleDarkMode}
                        className={`toggle ${isDark ? 'toggle-checked' : ''}`}
                      >
                        <span className="toggle-thumb"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((notification, index) => (
                          <div key={index} className="alert alert-info">
                            <Bell className="w-4 h-4" />
                            <p className="text-sm">{notification}</p>
                          </div>
                        ))}
                        <button
                          onClick={() => setNotifications([])}
                          className="btn btn-secondary btn-sm"
                        >
                          Clear All
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No notifications</p>
                    )}
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">System Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex-between">
                      <span>Version:</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex-between">
                      <span>User:</span>
                      <span>{currentUser.email}</span>
                    </div>
                    <div className="flex-between">
                      <span>Last Updated:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Portfolio Company Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">
                {modalType === 'add' ? 'Add Company' : modalType === 'edit' ? 'Edit Company' : 'Company Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <CompanyForm
              company={selectedCompany}
              mode={modalType}
              onSave={modalType === 'add' ? addCompany : (data) => updateCompany(selectedCompany!.id, data)}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}

      {/* AI Integration Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAiResult(result);
        }}
        onError={setAiError}
        onLoading={setIsAiLoading}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-16">
        <div className="container-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Company Form Component
interface CompanyFormProps {
  company: PortfolioCompany | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (company: Omit<PortfolioCompany, 'id'>) => void;
  onCancel: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, mode, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<PortfolioCompany, 'id'>>({
    name: company?.name || '',
    sector: company?.sector || 'Technology',
    investmentDate: company?.investmentDate || '',
    investmentAmount: company?.investmentAmount || 0,
    currentValue: company?.currentValue || 0,
    ownership: company?.ownership || 0,
    stage: company?.stage || 'Seed',
    ebitda: company?.ebitda || 0,
    revenue: company?.revenue || 0,
    employees: company?.employees || 0,
    geography: company?.geography || 'UK',
    status: company?.status || 'Active',
    irr: company?.irr || 0,
    moic: company?.moic || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (mode === 'view') {
    return (
      <div className="modal-body">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Company:</strong> {company?.name}</div>
          <div><strong>Sector:</strong> {company?.sector}</div>
          <div><strong>Investment:</strong> £{((company?.investmentAmount || 0) / 1000000).toFixed(1)}M</div>
          <div><strong>Current Value:</strong> £{((company?.currentValue || 0) / 1000000).toFixed(1)}M</div>
          <div><strong>Ownership:</strong> {company?.ownership}%</div>
          <div><strong>Stage:</strong> {company?.stage}</div>
          <div><strong>Revenue:</strong> £{((company?.revenue || 0) / 1000000).toFixed(1)}M</div>
          <div><strong>EBITDA:</strong> £{((company?.ebitda || 0) / 1000000).toFixed(1)}M</div>
          <div><strong>Employees:</strong> {company?.employees}</div>
          <div><strong>Geography:</strong> {company?.geography}</div>
          <div><strong>IRR:</strong> {company?.irr?.toFixed(1)}%</div>
          <div><strong>MOIC:</strong> {company?.moic?.toFixed(1)}x</div>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label form-label-required">Company Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Sector</label>
            <select
              className="select"
              value={formData.sector}
              onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
              required
            >
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Consumer">Consumer</option>
              <option value="Industrial">Industrial</option>
              <option value="Energy">Energy</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Investment Date</label>
            <input
              type="date"
              className="input"
              value={formData.investmentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, investmentDate: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Investment Amount (£)</label>
            <input
              type="number"
              className="input"
              value={formData.investmentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, investmentAmount: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Current Value (£)</label>
            <input
              type="number"
              className="input"
              value={formData.currentValue}
              onChange={(e) => setFormData(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Ownership (%)</label>
            <input
              type="number"
              className="input"
              value={formData.ownership}
              onChange={(e) => setFormData(prev => ({ ...prev, ownership: Number(e.target.value) }))}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Stage</label>
            <select
              className="select"
              value={formData.stage}
              onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as any }))}
              required
            >
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Growth">Growth</option>
              <option value="Pre-IPO">Pre-IPO</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Revenue (£)</label>
            <input
              type="number"
              className="input"
              value={formData.revenue}
              onChange={(e) => setFormData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">EBITDA (£)</label>
            <input
              type="number"
              className="input"
              value={formData.ebitda}
              onChange={(e) => setFormData(prev => ({ ...prev, ebitda: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Employees</label>
            <input
              type="number"
              className="input"
              value={formData.employees}
              onChange={(e) => setFormData(prev => ({ ...prev, employees: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Geography</label>
            <select
              className="select"
              value={formData.geography}
              onChange={(e) => setFormData(prev => ({ ...prev, geography: e.target.value }))}
            >
              <option value="UK">UK</option>
              <option value="EU">EU</option>
              <option value="US">US</option>
              <option value="APAC">APAC</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="select"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="Active">Active</option>
              <option value="Exited">Exited</option>
              <option value="Distressed">Distressed</option>
            </select>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {mode === 'add' ? 'Add Company' : 'Update Company'}
        </button>
      </div>
    </form>
  );
};

export default App;