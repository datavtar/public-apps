import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  TrendingUp, TrendingDown, DollarSign, Target, FileText, Users, 
  Settings, Download, Upload, Plus, Edit, Trash2, Search, Filter,
  BarChart3, PieChart, Calendar, AlertTriangle, CheckCircle,
  Building, Globe, Clock, Calculator, Eye, Brain, MessageCircle,
  Sun, Moon, Menu, X, ArrowUp, ArrowDown, Percent, CreditCard, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Fund {
  id: string;
  name: string;
  vintage: number;
  targetSize: number;
  committedCapital: number;
  deployedCapital: number;
  nav: number;
  irr: number;
  multiple: number;
  status: 'Fundraising' | 'Investment' | 'Harvesting' | 'Liquidated';
}

interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: 'Sourcing' | 'Due Diligence' | 'Investment Committee' | 'Closed' | 'Rejected';
  investmentAmount: number;
  valuation: number;
  dateAdded: string;
  expectedClose: string;
  fundId: string;
  notes: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  initialInvestment: number;
  currentValuation: number;
  ownership: number;
  ebitda: number;
  revenue: number;
  fundId: string;
  status: 'Active' | 'Exited' | 'Distressed';
}

interface FinancialReport {
  id: string;
  fundId: string;
  quarter: string;
  year: number;
  nav: number;
  distributions: number;
  capitalCalls: number;
  expenses: number;
  performanceFee: number;
  managementFee: number;
  dateGenerated: string;
}

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Complete' | 'Overdue';
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

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [funds, setFunds] = useState<Fund[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);

  // Modal states
  const [showAddFund, setShowAddFund] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Form states
  const [newFund, setNewFund] = useState<Partial<Fund>>({});
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({});
  const [newCompany, setNewCompany] = useState<Partial<PortfolioCompany>>({});

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFundFilter, setSelectedFundFilter] = useState('all');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFunds = localStorage.getItem('pe-funds');
    const savedDeals = localStorage.getItem('pe-deals');
    const savedCompanies = localStorage.getItem('pe-companies');
    const savedReports = localStorage.getItem('pe-reports');
    const savedCompliance = localStorage.getItem('pe-compliance');

    if (savedFunds) setFunds(JSON.parse(savedFunds));
    if (savedDeals) setDeals(JSON.parse(savedDeals));
    if (savedCompanies) setPortfolioCompanies(JSON.parse(savedCompanies));
    if (savedReports) setFinancialReports(JSON.parse(savedReports));
    if (savedCompliance) setComplianceItems(JSON.parse(savedCompliance));

    // Initialize with sample data if empty
    if (!savedFunds) {
      const sampleFunds: Fund[] = [
        {
          id: '1',
          name: 'PE Fund IV',
          vintage: 2023,
          targetSize: 500000000,
          committedCapital: 450000000,
          deployedCapital: 180000000,
          nav: 195000000,
          irr: 12.5,
          multiple: 1.08,
          status: 'Investment'
        },
        {
          id: '2',
          name: 'PE Fund III',
          vintage: 2020,
          targetSize: 300000000,
          committedCapital: 300000000,
          deployedCapital: 280000000,
          nav: 385000000,
          irr: 18.2,
          multiple: 1.38,
          status: 'Harvesting'
        }
      ];
      setFunds(sampleFunds);
      localStorage.setItem('pe-funds', JSON.stringify(sampleFunds));
    }

    if (!savedCompliance) {
      const sampleCompliance: ComplianceItem[] = [
        {
          id: '1',
          title: 'FCA Quarterly Report',
          description: 'Submit quarterly regulatory report to FCA',
          dueDate: '2025-07-15',
          status: 'Pending',
          assignee: 'Compliance Team',
          priority: 'High'
        },
        {
          id: '2',
          title: 'AIFMD Annual Report',
          description: 'Alternative Investment Fund Managers Directive annual reporting',
          dueDate: '2025-08-30',
          status: 'In Progress',
          assignee: 'Legal Team',
          priority: 'Critical'
        }
      ];
      setComplianceItems(sampleCompliance);
      localStorage.setItem('pe-compliance', JSON.stringify(sampleCompliance));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pe-funds', JSON.stringify(funds));
  }, [funds]);

  useEffect(() => {
    localStorage.setItem('pe-deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('pe-companies', JSON.stringify(portfolioCompanies));
  }, [portfolioCompanies]);

  useEffect(() => {
    localStorage.setItem('pe-reports', JSON.stringify(financialReports));
  }, [financialReports]);

  useEffect(() => {
    localStorage.setItem('pe-compliance', JSON.stringify(complianceItems));
  }, [complianceItems]);

  // Confirmation dialog helper
  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Fund management functions
  const addFund = () => {
    if (newFund.name && newFund.targetSize && newFund.vintage) {
      const fund: Fund = {
        id: Date.now().toString(),
        name: newFund.name,
        vintage: newFund.vintage,
        targetSize: newFund.targetSize,
        committedCapital: newFund.committedCapital || 0,
        deployedCapital: 0,
        nav: 0,
        irr: 0,
        multiple: 1.0,
        status: newFund.status || 'Fundraising'
      };
      setFunds([...funds, fund]);
      setNewFund({});
      setShowAddFund(false);
    }
  };

  const deleteFund = (id: string) => {
    showConfirmation('Are you sure you want to delete this fund?', () => {
      setFunds(funds.filter(f => f.id !== id));
    });
  };

  // Deal management functions
  const addDeal = () => {
    if (newDeal.companyName && newDeal.investmentAmount && newDeal.fundId) {
      const deal: Deal = {
        id: Date.now().toString(),
        companyName: newDeal.companyName,
        sector: newDeal.sector || '',
        stage: newDeal.stage || 'Sourcing',
        investmentAmount: newDeal.investmentAmount,
        valuation: newDeal.valuation || 0,
        dateAdded: new Date().toISOString().split('T')[0],
        expectedClose: newDeal.expectedClose || '',
        fundId: newDeal.fundId,
        notes: newDeal.notes || ''
      };
      setDeals([...deals, deal]);
      setNewDeal({});
      setShowAddDeal(false);
    }
  };

  // Portfolio company management
  const addPortfolioCompany = () => {
    if (newCompany.name && newCompany.initialInvestment && newCompany.fundId) {
      const company: PortfolioCompany = {
        id: Date.now().toString(),
        name: newCompany.name,
        sector: newCompany.sector || '',
        investmentDate: newCompany.investmentDate || new Date().toISOString().split('T')[0],
        initialInvestment: newCompany.initialInvestment,
        currentValuation: newCompany.currentValuation || newCompany.initialInvestment,
        ownership: newCompany.ownership || 0,
        ebitda: newCompany.ebitda || 0,
        revenue: newCompany.revenue || 0,
        fundId: newCompany.fundId,
        status: newCompany.status || 'Active'
      };
      setPortfolioCompanies([...portfolioCompanies, company]);
      setNewCompany({});
      setShowAddCompany(false);
    }
  };

  // AI Functions
  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide a question or upload a document to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    let finalPrompt = aiPrompt;
    if (selectedFile && !aiPrompt.trim()) {
      finalPrompt = "Analyze this financial document and extract key insights for private equity decision making.";
    }

    const additionalContext = `
You are assisting a CFO of a UK-based private equity firm. Please provide comprehensive financial analysis and insights.
Focus on: investment metrics, risk assessment, regulatory compliance (UK/FCA), portfolio optimization, and actionable recommendations.
If analyzing documents, extract key financial metrics, investment terms, and red flags.
Provide responses in markdown format with clear sections and bullet points.`;

    const fullPrompt = finalPrompt + additionalContext;

    try {
      aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleDocumentExtraction = (file: File) => {
    setSelectedFile(file);
    setAiResult(null);
    setAiError(null);

    const extractionPrompt = `Analyze this financial document and extract key data in JSON format with these fields:
{
  "documentType": "term_sheet | financial_statement | investment_memo | compliance_report",
  "companyName": "string",
  "sector": "string", 
  "investmentAmount": "number",
  "valuation": "number",
  "ownership": "number",
  "revenue": "number",
  "ebitda": "number",
  "keyMetrics": ["array of key financial metrics"],
  "riskFactors": ["array of identified risks"],
  "summary": "string"
}

Extract financial data for private equity analysis. Focus on investment terms, valuations, and performance metrics.`;

    try {
      aiLayerRef.current?.sendToAI(extractionPrompt, file);
    } catch (error) {
      setAiError("Failed to process document extraction");
    }
  };

  const processExtractedData = (jsonData: any) => {
    try {
      if (jsonData.documentType === 'term_sheet' && jsonData.companyName) {
        // Auto-populate deal form
        setNewDeal({
          companyName: jsonData.companyName,
          sector: jsonData.sector,
          investmentAmount: jsonData.investmentAmount,
          valuation: jsonData.valuation,
          stage: 'Due Diligence'
        });
        setShowAddDeal(true);
      } else if (jsonData.documentType === 'financial_statement' && jsonData.companyName) {
        // Update portfolio company if exists
        const existingCompany = portfolioCompanies.find(c => 
          c.name.toLowerCase().includes(jsonData.companyName.toLowerCase())
        );
        
        if (existingCompany) {
          const updatedCompanies = portfolioCompanies.map(c => 
            c.id === existingCompany.id 
              ? { ...c, revenue: jsonData.revenue || c.revenue, ebitda: jsonData.ebitda || c.ebitda }
              : c
          );
          setPortfolioCompanies(updatedCompanies);
        }
      }
    } catch (error) {
      console.error('Error processing extracted data:', error);
    }
  };

  // Handle AI result to check for JSON extraction
  useEffect(() => {
    if (aiResult && selectedFile) {
      try {
        // Try to parse as JSON for extraction
        const parsed = JSON.parse(aiResult);
        if (parsed.documentType) {
          processExtractedData(parsed);
        }
      } catch {
        // Not JSON, treat as regular markdown response
      }
    }
  }, [aiResult, selectedFile]);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate KPIs
  const totalAUM = funds.reduce((sum, fund) => sum + fund.nav, 0);
  const totalCommitted = funds.reduce((sum, fund) => sum + fund.committedCapital, 0);
  const totalDeployed = funds.reduce((sum, fund) => sum + fund.deployedCapital, 0);
  const weightedIRR = funds.reduce((sum, fund) => sum + (fund.irr * fund.nav), 0) / totalAUM || 0;

  // Chart data
  const fundPerformanceData = funds.map(fund => ({
    name: fund.name,
    NAV: fund.nav / 1000000,
    IRR: fund.irr,
    Multiple: fund.multiple
  }));

  const sectorData = portfolioCompanies.reduce((acc, company) => {
    const sector = company.sector || 'Other';
    const existing = acc.find(item => item.name === sector);
    if (existing) {
      existing.value += company.currentValuation;
    } else {
      acc.push({ name: sector, value: company.currentValuation });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Filter functions
  const filteredDeals = deals.filter(deal => 
    (selectedFundFilter === 'all' || deal.fundId === selectedFundFilter) &&
    (searchTerm === '' || deal.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCompanies = portfolioCompanies.filter(company =>
    (selectedFundFilter === 'all' || company.fundId === selectedFundFilter) &&
    (searchTerm === '' || company.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Render Dashboard
  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="heading-2">Portfolio Overview</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => setShowAIChat(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            AI Assistant
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total AUM</p>
              <p className="text-2xl font-bold">£{(totalAUM / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Weighted IRR</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {weightedIRR.toFixed(1)}%
                <TrendingUp className="w-5 h-5 text-success-600" />
              </p>
            </div>
            <Target className="w-8 h-8 text-success-600" />
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Deployment Rate</p>
              <p className="text-2xl font-bold">{((totalDeployed / totalCommitted) * 100).toFixed(1)}%</p>
            </div>
            <Percent className="w-8 h-8 text-warning-600" />
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Active Deals</p>
              <p className="text-2xl font-bold">{deals.filter(d => d.stage !== 'Closed' && d.stage !== 'Rejected').length}</p>
            </div>
            <Building className="w-8 h-8 text-info-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Fund Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fundPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'NAV' ? `£${value}M` : name === 'IRR' ? `${value}%` : `${value}x`,
                name
              ]} />
              <Bar dataKey="NAV" fill="#3b82f6" />
              <Bar dataKey="IRR" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Portfolio by Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`£${(value / 1000000).toFixed(1)}M`, 'Value']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {deals.slice(0, 5).map(deal => (
            <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">{deal.companyName}</p>
                <p className="text-caption">{deal.sector} • {deal.stage}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">£{(deal.investmentAmount / 1000000).toFixed(1)}M</p>
                <p className="text-caption">{deal.dateAdded}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Funds
  const renderFunds = () => (
    <div id="funds-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="heading-2">Fund Management</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => exportToCSV(funds, 'funds.csv')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddFund(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Fund
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Fund Name</th>
              <th className="table-header-cell">Vintage</th>
              <th className="table-header-cell">Target Size</th>
              <th className="table-header-cell">Committed</th>
              <th className="table-header-cell">NAV</th>
              <th className="table-header-cell">IRR</th>
              <th className="table-header-cell">Multiple</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {funds.map(fund => (
              <tr key={fund.id} className="table-row">
                <td className="table-cell font-medium">{fund.name}</td>
                <td className="table-cell">{fund.vintage}</td>
                <td className="table-cell">£{(fund.targetSize / 1000000).toFixed(0)}M</td>
                <td className="table-cell">£{(fund.committedCapital / 1000000).toFixed(0)}M</td>
                <td className="table-cell">£{(fund.nav / 1000000).toFixed(1)}M</td>
                <td className="table-cell">{fund.irr.toFixed(1)}%</td>
                <td className="table-cell">{fund.multiple.toFixed(2)}x</td>
                <td className="table-cell">
                  <span className={`badge ${
                    fund.status === 'Investment' ? 'badge-primary' :
                    fund.status === 'Harvesting' ? 'badge-success' :
                    fund.status === 'Fundraising' ? 'badge-warning' : 'badge-gray'
                  }`}>
                    {fund.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteFund(fund.id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Deals Pipeline
  const renderDeals = () => (
    <div id="deals-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="heading-2">Deal Pipeline</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => exportToCSV(deals, 'deals.csv')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddDeal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        <select
          value={selectedFundFilter}
          onChange={(e) => setSelectedFundFilter(e.target.value)}
          className="select min-w-48"
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
              <th className="table-header-cell">Stage</th>
              <th className="table-header-cell">Investment</th>
              <th className="table-header-cell">Valuation</th>
              <th className="table-header-cell">Fund</th>
              <th className="table-header-cell">Expected Close</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredDeals.map(deal => (
              <tr key={deal.id} className="table-row">
                <td className="table-cell font-medium">{deal.companyName}</td>
                <td className="table-cell">{deal.sector}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    deal.stage === 'Closed' ? 'badge-success' :
                    deal.stage === 'Investment Committee' ? 'badge-warning' :
                    deal.stage === 'Due Diligence' ? 'badge-primary' :
                    deal.stage === 'Rejected' ? 'badge-error' : 'badge-gray'
                  }`}>
                    {deal.stage}
                  </span>
                </td>
                <td className="table-cell">£{(deal.investmentAmount / 1000000).toFixed(1)}M</td>
                <td className="table-cell">£{(deal.valuation / 1000000).toFixed(1)}M</td>
                <td className="table-cell">{funds.find(f => f.id === deal.fundId)?.name || 'N/A'}</td>
                <td className="table-cell">{deal.expectedClose}</td>
                <td className="table-cell">
                  <button 
                    onClick={() => setDeals(deals.filter(d => d.id !== deal.id))}
                    className="btn btn-error btn-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Portfolio
  const renderPortfolio = () => (
    <div id="portfolio-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="heading-2">Portfolio Companies</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => exportToCSV(portfolioCompanies, 'portfolio.csv')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddCompany(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        <select
          value={selectedFundFilter}
          onChange={(e) => setSelectedFundFilter(e.target.value)}
          className="select min-w-48"
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
              <th className="table-header-cell">Initial Investment</th>
              <th className="table-header-cell">Current Valuation</th>
              <th className="table-header-cell">Multiple</th>
              <th className="table-header-cell">Ownership</th>
              <th className="table-header-cell">Revenue</th>
              <th className="table-header-cell">EBITDA</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredCompanies.map(company => (
              <tr key={company.id} className="table-row">
                <td className="table-cell font-medium">{company.name}</td>
                <td className="table-cell">{company.sector}</td>
                <td className="table-cell">£{(company.initialInvestment / 1000000).toFixed(1)}M</td>
                <td className="table-cell">£{(company.currentValuation / 1000000).toFixed(1)}M</td>
                <td className="table-cell">{(company.currentValuation / company.initialInvestment).toFixed(2)}x</td>
                <td className="table-cell">{company.ownership}%</td>
                <td className="table-cell">£{(company.revenue / 1000000).toFixed(1)}M</td>
                <td className="table-cell">£{(company.ebitda / 1000000).toFixed(1)}M</td>
                <td className="table-cell">
                  <span className={`badge ${
                    company.status === 'Active' ? 'badge-success' :
                    company.status === 'Exited' ? 'badge-gray' : 'badge-error'
                  }`}>
                    {company.status}
                  </span>
                </td>
                <td className="table-cell">
                  <button 
                    onClick={() => setPortfolioCompanies(portfolioCompanies.filter(c => c.id !== company.id))}
                    className="btn btn-error btn-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Compliance
  const renderCompliance = () => (
    <div id="compliance-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="heading-2">Regulatory Compliance</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => exportToCSV(complianceItems, 'compliance.csv')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card card-padding">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-success-600" />
            <div>
              <p className="text-caption">Complete</p>
              <p className="text-xl font-bold">{complianceItems.filter(c => c.status === 'Complete').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card card-padding">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-warning-600" />
            <div>
              <p className="text-caption">In Progress</p>
              <p className="text-xl font-bold">{complianceItems.filter(c => c.status === 'In Progress').length}</p>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-error-600" />
            <div>
              <p className="text-caption">Overdue</p>
              <p className="text-xl font-bold">{complianceItems.filter(c => c.status === 'Overdue').length}</p>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-info-600" />
            <div>
              <p className="text-caption">Total Items</p>
              <p className="text-xl font-bold">{complianceItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Title</th>
              <th className="table-header-cell">Description</th>
              <th className="table-header-cell">Due Date</th>
              <th className="table-header-cell">Assignee</th>
              <th className="table-header-cell">Priority</th>
              <th className="table-header-cell">Status</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {complianceItems.map(item => (
              <tr key={item.id} className="table-row">
                <td className="table-cell font-medium">{item.title}</td>
                <td className="table-cell">{item.description}</td>
                <td className="table-cell">{item.dueDate}</td>
                <td className="table-cell">{item.assignee}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    item.priority === 'Critical' ? 'badge-error' :
                    item.priority === 'High' ? 'badge-warning' :
                    item.priority === 'Medium' ? 'badge-primary' : 'badge-gray'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    item.status === 'Complete' ? 'badge-success' :
                    item.status === 'In Progress' ? 'badge-primary' :
                    item.status === 'Overdue' ? 'badge-error' : 'badge-gray'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Settings
  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h1 className="heading-2">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={() => exportToCSV([...funds, ...deals, ...portfolioCompanies], 'all-data.csv')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            
            <div>
              <label className="form-label">Import Fund Data</label>
              <input
                type="file"
                accept=".csv"
                className="input w-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle CSV import logic here
                    console.log('Importing file:', file.name);
                  }
                }}
              />
            </div>

            <button
              onClick={() => showConfirmation('Are you sure you want to delete all data? This action cannot be undone.', () => {
                setFunds([]);
                setDeals([]);
                setPortfolioCompanies([]);
                setFinancialReports([]);
                setComplianceItems([]);
                localStorage.clear();
              })}
              className="btn btn-error w-full"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="form-label">Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className="btn btn-secondary"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="form-label">Default Currency</label>
              <select className="select w-full">
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Date Format</label>
              <select className="select w-full">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="heading-2 mb-4">PE Capital Navigator</h1>
          <p className="text-body">Please log in to access your private equity management platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-ghost lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="heading-5">PE Capital Navigator</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {currentUser.first_name}
              </span>
              <button
                onClick={toggleDarkMode}
                className="btn btn-ghost"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out theme-transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-2">
              <button
                onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false);}}
                className={`nav-link w-full text-left ${activeTab === 'dashboard' ? 'nav-link-active' : ''}`}
              >
                <BarChart3 className="w-4 h-4 inline mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => {setActiveTab('funds'); setSidebarOpen(false);}}
                className={`nav-link w-full text-left ${activeTab === 'funds' ? 'nav-link-active' : ''}`}
              >
                <CreditCard className="w-4 h-4 inline mr-3" />
                Funds
              </button>
              <button
                onClick={() => {setActiveTab('deals'); setSidebarOpen(false);}}
                className={`nav-link w-full text-left ${activeTab === 'deals' ? 'nav-link-active' : ''}`}
              >
                <Target className="w-4 h-4 inline mr-3" />
                Deal Pipeline
              </button>
              <button
                onClick={() => {setActiveTab('portfolio'); setSidebarOpen(false);}}
                className={`nav-link w-full text-left ${activeTab === 'portfolio' ? 'nav-link-active' : ''}`}
              >
                <Building className="w-4 h-4 inline mr-3" />
                Portfolio
              </button>
              <button
                onClick={() => {setActiveTab('compliance'); setSidebarOpen(false);}}
                className={`nav-link w-full text-left ${activeTab === 'compliance' ? 'nav-link-active' : ''}`}
              >
                <Shield className="w-4 h-4 inline mr-3" />
                Compliance
              </button>
              <button
                onClick={() => {setActiveTab('settings'); setSidebarOpen(false);}}
                className={`nav-link w-full text-left ${activeTab === 'settings' ? 'nav-link-active' : ''}`}
              >
                <Settings className="w-4 h-4 inline mr-3" />
                Settings
              </button>
            </nav>
          </div>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div id="generation_issue_fallback" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'funds' && renderFunds()}
            {activeTab === 'deals' && renderDeals()}
            {activeTab === 'portfolio' && renderPortfolio()}
            {activeTab === 'compliance' && renderCompliance()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>

      {/* Add Fund Modal */}
      {showAddFund && (
        <div className="modal-backdrop" onClick={() => setShowAddFund(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Add New Fund</h3>
              <button onClick={() => setShowAddFund(false)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Fund Name</label>
                <input
                  type="text"
                  value={newFund.name || ''}
                  onChange={(e) => setNewFund({...newFund, name: e.target.value})}
                  className="input"
                  placeholder="e.g., PE Fund V"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vintage Year</label>
                <input
                  type="number"
                  value={newFund.vintage || ''}
                  onChange={(e) => setNewFund({...newFund, vintage: parseInt(e.target.value)})}
                  className="input"
                  placeholder="2025"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Size (£)</label>
                <input
                  type="number"
                  value={newFund.targetSize || ''}
                  onChange={(e) => setNewFund({...newFund, targetSize: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="500000000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Committed Capital (£)</label>
                <input
                  type="number"
                  value={newFund.committedCapital || ''}
                  onChange={(e) => setNewFund({...newFund, committedCapital: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="400000000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={newFund.status || 'Fundraising'}
                  onChange={(e) => setNewFund({...newFund, status: e.target.value as Fund['status']})}
                  className="select"
                >
                  <option value="Fundraising">Fundraising</option>
                  <option value="Investment">Investment</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Liquidated">Liquidated</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddFund(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={addFund} className="btn btn-primary">Add Fund</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="modal-backdrop" onClick={() => setShowAddDeal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Add New Deal</h3>
              <button onClick={() => setShowAddDeal(false)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={newDeal.companyName || ''}
                  onChange={(e) => setNewDeal({...newDeal, companyName: e.target.value})}
                  className="input"
                  placeholder="Target Company Ltd"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sector</label>
                <input
                  type="text"
                  value={newDeal.sector || ''}
                  onChange={(e) => setNewDeal({...newDeal, sector: e.target.value})}
                  className="input"
                  placeholder="Technology"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Investment Amount (£)</label>
                <input
                  type="number"
                  value={newDeal.investmentAmount || ''}
                  onChange={(e) => setNewDeal({...newDeal, investmentAmount: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="50000000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valuation (£)</label>
                <input
                  type="number"
                  value={newDeal.valuation || ''}
                  onChange={(e) => setNewDeal({...newDeal, valuation: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="200000000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fund</label>
                <select
                  value={newDeal.fundId || ''}
                  onChange={(e) => setNewDeal({...newDeal, fundId: e.target.value})}
                  className="select"
                >
                  <option value="">Select Fund</option>
                  {funds.map(fund => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expected Close Date</label>
                <input
                  type="date"
                  value={newDeal.expectedClose || ''}
                  onChange={(e) => setNewDeal({...newDeal, expectedClose: e.target.value})}
                  className="input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddDeal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={addDeal} className="btn btn-primary">Add Deal</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="modal-backdrop" onClick={() => setShowAddCompany(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Add Portfolio Company</h3>
              <button onClick={() => setShowAddCompany(false)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={newCompany.name || ''}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  className="input"
                  placeholder="Portfolio Company Ltd"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sector</label>
                <input
                  type="text"
                  value={newCompany.sector || ''}
                  onChange={(e) => setNewCompany({...newCompany, sector: e.target.value})}
                  className="input"
                  placeholder="Healthcare"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Investment (£)</label>
                <input
                  type="number"
                  value={newCompany.initialInvestment || ''}
                  onChange={(e) => setNewCompany({...newCompany, initialInvestment: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="25000000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Valuation (£)</label>
                <input
                  type="number"
                  value={newCompany.currentValuation || ''}
                  onChange={(e) => setNewCompany({...newCompany, currentValuation: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="35000000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ownership (%)</label>
                <input
                  type="number"
                  value={newCompany.ownership || ''}
                  onChange={(e) => setNewCompany({...newCompany, ownership: parseFloat(e.target.value)})}
                  className="input"
                  placeholder="25"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fund</label>
                <select
                  value={newCompany.fundId || ''}
                  onChange={(e) => setNewCompany({...newCompany, fundId: e.target.value})}
                  className="select"
                >
                  <option value="">Select Fund</option>
                  {funds.map(fund => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddCompany(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={addPortfolioCompany} className="btn btn-primary">Add Company</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="modal-backdrop" onClick={() => setShowAIChat(false)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Financial Assistant
              </h3>
              <button onClick={() => setShowAIChat(false)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Upload Document (Optional)</label>
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
                {selectedFile && (
                  <p className="text-caption mt-1">Selected: {selectedFile.name}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Ask a Question</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="textarea"
                  rows={3}
                  placeholder="Ask about portfolio performance, due diligence questions, market analysis, or upload a document for analysis..."
                />
              </div>

              <button
                onClick={handleAIAnalysis}
                disabled={aiLoading || (!aiPrompt.trim() && !selectedFile)}
                className="btn btn-primary w-full"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>

              {aiError && (
                <div className="alert alert-error">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{aiError.message || 'An error occurred while processing your request.'}</span>
                </div>
              )}

              {aiResult && (
                <div className="form-group">
                  <label className="form-label">AI Analysis</label>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none">
                      {aiResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                AI analysis is for informational purposes only. Please review all insights with professional judgment and verify with additional sources before making investment decisions.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Confirm Action</h3>
            </div>
            <div className="modal-body">
              <p className="text-body">{confirmMessage}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowConfirmDialog(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleConfirm} className="btn btn-error">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;