import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  PieChart as PieChartIcon, LogOut,
  BarChart3,
  Calculator,
  Settings,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Brain,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  Target,
  Shield,
  Clock,
  ArrowUp,
  ArrowDown,
  Moon,
  Sun
} from 'lucide-react';

// Types and Interfaces
interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  investmentAmount: number;
  currentValuation: number;
  ownership: number;
  stage: string;
  status: 'Active' | 'Exited' | 'Written Off';
  lastUpdate: string;
  irr: number;
  multiple: number;
  ebitda: number;
  revenue: number;
}

interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  dealSize: number;
  valuation: number;
  probability: number;
  expectedClose: string;
  leadPartner: string;
  status: 'Pipeline' | 'Due Diligence' | 'Committee' | 'Closed' | 'Declined';
  lastActivity: string;
}

interface Fund {
  id: string;
  name: string;
  vintage: number;
  size: number;
  committed: number;
  called: number;
  invested: number;
  realized: number;
  nav: number;
  irr: number;
  multiple: number;
  managementFee: number;
  carriedInterest: number;
}

interface InvestorCommitment {
  id: string;
  investorName: string;
  fundId: string;
  commitment: number;
  called: number;
  distributed: number;
  nav: number;
  type: 'Pension Fund' | 'Sovereign Wealth' | 'Insurance' | 'Endowment' | 'Family Office' | 'Fund of Funds';
  region: string;
}

interface CashFlowItem {
  id: string;
  date: string;
  type: 'Capital Call' | 'Distribution' | 'Management Fee' | 'Exit Proceeds' | 'Operating Expense';
  amount: number;
  fundId: string;
  description: string;
  status: 'Scheduled' | 'Completed' | 'Overdue';
}

interface ComplianceItem {
  id: string;
  type: 'AIFM Reporting' | 'FCA Filing' | 'Tax Return' | 'Audit' | 'Investor Report' | 'Regulatory Update';
  description: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  assignee: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

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

function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // AI States
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Main app states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFund, setSelectedFund] = useState<string>('all');

  // Data states
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [investors, setInvestors] = useState<InvestorCommitment[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlowItem[]>([]);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);

  // Modal states
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedPortfolio = localStorage.getItem('pe_portfolio');
    const savedDeals = localStorage.getItem('pe_deals');
    const savedFunds = localStorage.getItem('pe_funds');
    const savedInvestors = localStorage.getItem('pe_investors');
    const savedCashFlows = localStorage.getItem('pe_cashflows');
    const savedCompliance = localStorage.getItem('pe_compliance');

    if (savedPortfolio) {
      setPortfolioCompanies(JSON.parse(savedPortfolio));
    } else {
      initializeSampleData();
    }

    if (savedDeals) setDeals(JSON.parse(savedDeals));
    else initializeDealsData();

    if (savedFunds) setFunds(JSON.parse(savedFunds));
    else initializeFundsData();

    if (savedInvestors) setInvestors(JSON.parse(savedInvestors));
    else initializeInvestorsData();

    if (savedCashFlows) setCashFlows(JSON.parse(savedCashFlows));
    else initializeCashFlowsData();

    if (savedCompliance) setCompliance(JSON.parse(savedCompliance));
    else initializeComplianceData();
  };

  const initializeSampleData = () => {
    const samplePortfolio: PortfolioCompany[] = [
      {
        id: '1',
        name: 'TechCorp Solutions',
        sector: 'Technology',
        investmentDate: '2022-03-15',
        investmentAmount: 25000000,
        currentValuation: 45000000,
        ownership: 35,
        stage: 'Growth',
        status: 'Active',
        lastUpdate: '2025-06-01',
        irr: 28.5,
        multiple: 1.8,
        ebitda: 8500000,
        revenue: 52000000
      },
      {
        id: '2',
        name: 'HealthTech Innovations',
        sector: 'Healthcare',
        investmentDate: '2021-08-20',
        investmentAmount: 40000000,
        currentValuation: 85000000,
        ownership: 42,
        stage: 'Expansion',
        status: 'Active',
        lastUpdate: '2025-05-28',
        irr: 35.2,
        multiple: 2.1,
        ebitda: 12000000,
        revenue: 68000000
      },
      {
        id: '3',
        name: 'GreenEnergy Systems',
        sector: 'Renewable Energy',
        investmentDate: '2020-11-10',
        investmentAmount: 60000000,
        currentValuation: 120000000,
        ownership: 38,
        stage: 'Late Stage',
        status: 'Active',
        lastUpdate: '2025-06-05',
        irr: 42.1,
        multiple: 2.0,
        ebitda: 18000000,
        revenue: 95000000
      }
    ];
    setPortfolioCompanies(samplePortfolio);
    localStorage.setItem('pe_portfolio', JSON.stringify(samplePortfolio));
  };

  const initializeDealsData = () => {
    const sampleDeals: Deal[] = [
      {
        id: '1',
        companyName: 'FinTech Dynamics',
        sector: 'Financial Services',
        stage: 'Series B',
        dealSize: 35000000,
        valuation: 150000000,
        probability: 75,
        expectedClose: '2025-08-15',
        leadPartner: 'James Morrison',
        status: 'Due Diligence',
        lastActivity: '2025-06-08'
      },
      {
        id: '2',
        companyName: 'AI Robotics Ltd',
        sector: 'Technology',
        stage: 'Growth',
        dealSize: 50000000,
        valuation: 200000000,
        probability: 60,
        expectedClose: '2025-09-30',
        leadPartner: 'Sarah Chen',
        status: 'Pipeline',
        lastActivity: '2025-06-06'
      }
    ];
    setDeals(sampleDeals);
    localStorage.setItem('pe_deals', JSON.stringify(sampleDeals));
  };

  const initializeFundsData = () => {
    const sampleFunds: Fund[] = [
      {
        id: '1',
        name: 'UK Growth Fund III',
        vintage: 2022,
        size: 500000000,
        committed: 500000000,
        called: 320000000,
        invested: 280000000,
        realized: 85000000,
        nav: 375000000,
        irr: 24.8,
        multiple: 1.64,
        managementFee: 2.0,
        carriedInterest: 20
      },
      {
        id: '2',
        name: 'European Tech Fund II',
        vintage: 2020,
        size: 300000000,
        committed: 300000000,
        called: 285000000,
        invested: 270000000,
        realized: 180000000,
        nav: 420000000,
        irr: 31.2,
        multiple: 2.11,
        managementFee: 2.0,
        carriedInterest: 20
      }
    ];
    setFunds(sampleFunds);
    localStorage.setItem('pe_funds', JSON.stringify(sampleFunds));
  };

  const initializeInvestorsData = () => {
    const sampleInvestors: InvestorCommitment[] = [
      {
        id: '1',
        investorName: 'UK Pension Fund',
        fundId: '1',
        commitment: 100000000,
        called: 65000000,
        distributed: 25000000,
        nav: 85000000,
        type: 'Pension Fund',
        region: 'UK'
      },
      {
        id: '2',
        investorName: 'European Insurance Group',
        fundId: '1',
        commitment: 75000000,
        called: 48000000,
        distributed: 18000000,
        nav: 62000000,
        type: 'Insurance',
        region: 'Europe'
      }
    ];
    setInvestors(sampleInvestors);
    localStorage.setItem('pe_investors', JSON.stringify(sampleInvestors));
  };

  const initializeCashFlowsData = () => {
    const sampleCashFlows: CashFlowItem[] = [
      {
        id: '1',
        date: '2025-07-15',
        type: 'Capital Call',
        amount: 25000000,
        fundId: '1',
        description: 'Q3 Capital Call for new investments',
        status: 'Scheduled'
      },
      {
        id: '2',
        date: '2025-06-30',
        type: 'Distribution',
        amount: 15000000,
        fundId: '2',
        description: 'Partial exit distribution - TechCorp',
        status: 'Completed'
      }
    ];
    setCashFlows(sampleCashFlows);
    localStorage.setItem('pe_cashflows', JSON.stringify(sampleCashFlows));
  };

  const initializeComplianceData = () => {
    const sampleCompliance: ComplianceItem[] = [
      {
        id: '1',
        type: 'AIFM Reporting',
        description: 'Q2 2025 AIFM Regulatory Reporting',
        dueDate: '2025-07-31',
        status: 'In Progress',
        assignee: 'Compliance Team',
        priority: 'High'
      },
      {
        id: '2',
        type: 'Investor Report',
        description: 'Q2 Fund Performance Report',
        dueDate: '2025-07-15',
        status: 'Pending',
        assignee: 'Finance Team',
        priority: 'Medium'
      }
    ];
    setCompliance(sampleCompliance);
    localStorage.setItem('pe_compliance', JSON.stringify(sampleCompliance));
  };

  // AI Functions
  const handleAiAnalysis = () => {
    if (!promptText?.trim() && !selectedFile) {
      setAiError("Please provide text input or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    let analysisPrompt = promptText;
    
    if (selectedFile && !promptText?.trim()) {
      analysisPrompt = "Analyze this financial document and extract key investment metrics, financial data, and insights relevant for private equity analysis. Provide a comprehensive analysis including financial performance, risk factors, market position, and investment recommendations.";
    } else if (selectedFile && promptText?.trim()) {
      analysisPrompt = `${promptText} 

Additional context: This is for a UK private equity firm's analysis. Please focus on metrics relevant to PE investments such as EBITDA, revenue growth, market positioning, competitive landscape, and exit potential.`;
    }

    try {
      aiLayerRef.current?.sendToAI(analysisPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI analysis request");
    }
  };

  const handleDocumentExtraction = (file: File) => {
    const extractionPrompt = `Analyze this financial document and extract key data in JSON format with the following fields:
    {
      "companyName": "string",
      "revenue": "number",
      "ebitda": "number", 
      "netIncome": "number",
      "totalAssets": "number",
      "totalDebt": "number",
      "employeeCount": "number",
      "sector": "string",
      "keyMetrics": ["array of key financial metrics"],
      "riskFactors": ["array of identified risks"],
      "growthDrivers": ["array of growth opportunities"]
    }

    Focus on extracting accurate financial data and relevant business metrics for private equity investment analysis.`;

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(extractionPrompt, file);
    } catch (error) {
      setAiError("Failed to process document extraction");
    }
  };

  // Portfolio Functions
  const addPortfolioCompany = (company: Omit<PortfolioCompany, 'id'>) => {
    const newCompany = {
      ...company,
      id: Date.now().toString()
    };
    const updated = [...portfolioCompanies, newCompany];
    setPortfolioCompanies(updated);
    localStorage.setItem('pe_portfolio', JSON.stringify(updated));
  };

  const updatePortfolioCompany = (id: string, updates: Partial<PortfolioCompany>) => {
    const updated = portfolioCompanies.map(company => 
      company.id === id ? { ...company, ...updates } : company
    );
    setPortfolioCompanies(updated);
    localStorage.setItem('pe_portfolio', JSON.stringify(updated));
  };

  const deletePortfolioCompany = (id: string) => {
    const updated = portfolioCompanies.filter(company => company.id !== id);
    setPortfolioCompanies(updated);
    localStorage.setItem('pe_portfolio', JSON.stringify(updated));
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, dataType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
          });
          obj.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return obj;
        });

        switch (dataType) {
          case 'portfolio':
            setPortfolioCompanies(data);
            localStorage.setItem('pe_portfolio', JSON.stringify(data));
            break;
          case 'deals':
            setDeals(data);
            localStorage.setItem('pe_deals', JSON.stringify(data));
            break;
          case 'funds':
            setFunds(data);
            localStorage.setItem('pe_funds', JSON.stringify(data));
            break;
        }
      } catch (error) {
        alert('Error importing file. Please ensure it\'s a valid CSV format.');
      }
    };
    reader.readAsText(file);
  };

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    const totalInvested = portfolioCompanies.reduce((sum, company) => sum + company.investmentAmount, 0);
    const totalValuation = portfolioCompanies.reduce((sum, company) => sum + company.currentValuation, 0);
    const totalRealized = funds.reduce((sum, fund) => sum + fund.realized, 0);
    const averageIRR = portfolioCompanies.length > 0 ? 
      portfolioCompanies.reduce((sum, company) => sum + company.irr, 0) / portfolioCompanies.length : 0;

    return {
      totalInvested,
      totalValuation,
      totalRealized,
      averageIRR,
      unrealizedGain: totalValuation - totalInvested,
      activeCompanies: portfolioCompanies.filter(c => c.status === 'Active').length
    };
  };

  const metrics = calculateMetrics();

  // Chart data
  const portfolioPerformanceData = portfolioCompanies.map(company => ({
    name: company.name,
    invested: company.investmentAmount / 1000000,
    current: company.currentValuation / 1000000,
    irr: company.irr
  }));

  const sectorAllocationData = portfolioCompanies.reduce((acc: any[], company) => {
    const existing = acc.find(item => item.name === company.sector);
    if (existing) {
      existing.value += company.currentValuation;
    } else {
      acc.push({ name: company.sector, value: company.currentValuation });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const renderDashboard = () => (
    <div id="welcome_fallback" className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-blue-100">Total Invested</div>
              <div className="stat-value">£{(metrics.totalInvested / 1000000).toFixed(1)}M</div>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-green-100">Current Valuation</div>
              <div className="stat-value">£{(metrics.totalValuation / 1000000).toFixed(1)}M</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-purple-100">Average IRR</div>
              <div className="stat-value">{metrics.averageIRR.toFixed(1)}%</div>
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-orange-100">Active Companies</div>
              <div className="stat-value">{metrics.activeCompanies}</div>
            </div>
            <Building className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={portfolioPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`£${value}M`, '']} />
              <Bar dataKey="invested" fill="#94a3b8" name="Invested" />
              <Bar dataKey="current" fill="#3b82f6" name="Current Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorAllocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorAllocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`£${(value / 1000000).toFixed(1)}M`, 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {portfolioCompanies.slice(0, 3).map(company => (
            <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last updated: {company.lastUpdate}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">£{(company.currentValuation / 1000000).toFixed(1)}M</div>
                <div className={`text-sm flex items-center ${company.irr > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {company.irr > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                  {Math.abs(company.irr).toFixed(1)}% IRR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div id="portfolio-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="heading-3">Portfolio Companies</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowAddPortfolio(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
          <button
            onClick={() => exportToCSV(portfolioCompanies, 'portfolio-companies')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="card card-padding">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
            className="select"
          >
            <option value="all">All Funds</option>
            {funds.map(fund => (
              <option key={fund.id} value={fund.id}>{fund.name}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Company</th>
                <th className="table-header-cell">Sector</th>
                <th className="table-header-cell">Investment</th>
                <th className="table-header-cell">Current Value</th>
                <th className="table-header-cell">IRR</th>
                <th className="table-header-cell">Multiple</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {portfolioCompanies
                .filter(company => 
                  company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.sector.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(company => (
                  <tr key={company.id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.ownership}% ownership</div>
                      </div>
                    </td>
                    <td className="table-cell">{company.sector}</td>
                    <td className="table-cell">£{(company.investmentAmount / 1000000).toFixed(1)}M</td>
                    <td className="table-cell">£{(company.currentValuation / 1000000).toFixed(1)}M</td>
                    <td className="table-cell">
                      <span className={`font-medium ${company.irr > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {company.irr.toFixed(1)}%
                      </span>
                    </td>
                    <td className="table-cell">{company.multiple.toFixed(1)}x</td>
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
                          onClick={() => setEditingItem(company)}
                          className="btn btn-sm btn-ghost"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePortfolioCompany(company.id)}
                          className="btn btn-sm btn-ghost text-red-600"
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
  );

  const renderDeals = () => (
    <div id="deals-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="heading-3">Deal Pipeline</h2>
        <button
          onClick={() => setShowAddDeal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </button>
      </div>

      <div className="card card-padding">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Company</th>
                <th className="table-header-cell">Sector</th>
                <th className="table-header-cell">Deal Size</th>
                <th className="table-header-cell">Valuation</th>
                <th className="table-header-cell">Probability</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Expected Close</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {deals.map(deal => (
                <tr key={deal.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{deal.companyName}</div>
                      <div className="text-sm text-gray-500">Lead: {deal.leadPartner}</div>
                    </div>
                  </td>
                  <td className="table-cell">{deal.sector}</td>
                  <td className="table-cell">£{(deal.dealSize / 1000000).toFixed(1)}M</td>
                  <td className="table-cell">£{(deal.valuation / 1000000).toFixed(1)}M</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      deal.status === 'Pipeline' ? 'badge-gray' :
                      deal.status === 'Due Diligence' ? 'badge-warning' :
                      deal.status === 'Committee' ? 'badge-primary' :
                      deal.status === 'Closed' ? 'badge-success' : 'badge-error'
                    }`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="table-cell">{deal.expectedClose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAiAnalysis = () => (
    <div id="ai-analysis-tab" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="heading-3">AI-Powered Analysis</h2>
        <button
          onClick={() => setShowAiAnalysis(true)}
          className="btn btn-primary"
        >
          <Brain className="w-4 h-4" />
          Start Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Document Analysis</h3>
          <p className="text-body mb-4">
            Upload financial documents, investment memos, or due diligence reports for AI-powered analysis.
          </p>
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  handleDocumentExtraction(file);
                }
              }}
              className="input"
            />
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = 'data:text/csv;charset=utf-8,Company Name,Revenue,EBITDA,Net Income,Total Assets,Total Debt,Employee Count,Sector\nSample Corp,50000000,12000000,8000000,45000000,15000000,250,Technology';
                link.download = 'financial-data-template.csv';
                link.click();
              }}
              className="btn btn-secondary btn-sm"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Market Analysis</h3>
          <p className="text-body mb-4">
            Get AI insights on market trends, competitive landscape, and investment opportunities.
          </p>
          <div className="space-y-4">
            <textarea
              placeholder="Describe the market, sector, or specific analysis you need..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="textarea"
              rows={4}
            />
            <button
              onClick={handleAiAnalysis}
              disabled={isAiLoading}
              className="btn btn-primary"
            >
              {isAiLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {aiResult && (
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Analysis Results</h3>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiResult}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {aiError && (
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5" />
          <div>
            <strong>Analysis Error:</strong> {aiError.message || aiError}
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h2 className="heading-3">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Import Portfolio Data</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileImport(e, 'portfolio')}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">Import Deals Data</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileImport(e, 'deals')}
                className="input"
              />
            </div>
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  localStorage.clear();
                  setPortfolioCompanies([]);
                  setDeals([]);
                  setFunds([]);
                  setInvestors([]);
                  setCashFlows([]);
                  setCompliance([]);
                  alert('All data has been cleared.');
                }}
                className="btn btn-error"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Theme</label>
              <button
                onClick={toggleDarkMode}
                className="btn btn-secondary flex items-center gap-2"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select className="select">
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fiscal Year End</label>
              <select className="select">
                <option value="december">December 31</option>
                <option value="march">March 31</option>
                <option value="june">June 30</option>
                <option value="september">September 30</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="navbar bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container container-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="heading-5 font-bold">PE CFO Dashboard</h1>
            <span className="badge badge-primary">UK Private Equity</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{currentUser.first_name} {currentUser.last_name}</div>
                  <div className="text-xs text-gray-500">{currentUser.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b">
        <div className="container container-lg">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'portfolio', label: 'Portfolio', icon: Building },
              { id: 'deals', label: 'Deal Pipeline', icon: Target },
              { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''} flex items-center gap-2`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container container-lg py-8" id="generation_issue_fallback">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'deals' && renderDeals()}
        {activeTab === 'ai-analysis' && renderAiAnalysis()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Add Portfolio Modal */}
      {showAddPortfolio && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">Add Portfolio Company</h3>
              <button
                onClick={() => setShowAddPortfolio(false)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const company = {
                  name: formData.get('name') as string,
                  sector: formData.get('sector') as string,
                  investmentDate: formData.get('investmentDate') as string,
                  investmentAmount: Number(formData.get('investmentAmount')),
                  currentValuation: Number(formData.get('currentValuation')),
                  ownership: Number(formData.get('ownership')),
                  stage: formData.get('stage') as string,
                  status: formData.get('status') as 'Active' | 'Exited' | 'Written Off',
                  lastUpdate: new Date().toISOString().split('T')[0],
                  irr: Number(formData.get('irr')),
                  multiple: Number(formData.get('multiple')),
                  ebitda: Number(formData.get('ebitda')),
                  revenue: Number(formData.get('revenue'))
                };
                addPortfolioCompany(company);
                setShowAddPortfolio(false);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Company Name</label>
                    <input name="name" type="text" className="input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sector</label>
                    <select name="sector" className="select">
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Consumer">Consumer</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Renewable Energy">Renewable Energy</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Investment Date</label>
                    <input name="investmentDate" type="date" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Investment Amount (£)</label>
                    <input name="investmentAmount" type="number" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Valuation (£)</label>
                    <input name="currentValuation" type="number" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ownership (%)</label>
                    <input name="ownership" type="number" min="0" max="100" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select name="stage" className="select">
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Growth">Growth</option>
                      <option value="Expansion">Expansion</option>
                      <option value="Late Stage">Late Stage</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="status" className="select">
                      <option value="Active">Active</option>
                      <option value="Exited">Exited</option>
                      <option value="Written Off">Written Off</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">IRR (%)</label>
                    <input name="irr" type="number" step="0.1" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Multiple (x)</label>
                    <input name="multiple" type="number" step="0.1" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">EBITDA (£)</label>
                    <input name="ebitda" type="number" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Revenue (£)</label>
                    <input name="revenue" type="number" className="input" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowAddPortfolio(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t py-6 mt-12">
        <div className="container container-lg text-center text-sm text-gray-600 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;