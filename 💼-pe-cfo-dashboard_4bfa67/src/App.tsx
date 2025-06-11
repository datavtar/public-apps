import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Building, 
  TrendingUp, 
  FileText, 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  PoundSterling,
  Calendar,
  ChartBar,
  ChartPie,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Menu,
  X,
  Brain
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: 'Sourcing' | 'Due Diligence' | 'Investment Committee' | 'Closed' | 'Passed';
  dealSize: number;
  equity: number;
  valuation: number;
  dateAdded: string;
  exitDate?: string;
  irr?: number;
  multiple?: number;
  status: 'Active' | 'Exited' | 'Written Off';
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
  employeeCount: number;
  status: 'Active' | 'Exited' | 'Under Review';
  lastUpdated: string;
}

interface FinancialReport {
  id: string;
  reportType: 'Quarterly' | 'Annual' | 'Monthly';
  period: string;
  portfolioValue: number;
  totalDeployed: number;
  irr: number;
  tvpi: number;
  dpi: number;
  createdDate: string;
}

interface RiskAssessment {
  id: string;
  companyId: string;
  companyName: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  categories: {
    market: number;
    operational: number;
    financial: number;
    regulatory: number;
  };
  notes: string;
  lastAssessed: string;
}

interface AppSettings {
  currency: 'GBP' | 'USD' | 'EUR';
  reportingPeriod: 'Monthly' | 'Quarterly' | 'Annual';
  theme: 'light' | 'dark';
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

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Data states
  const [deals, setDeals] = useState<Deal[]>([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'GBP',
    reportingPeriod: 'Quarterly',
    theme: 'light'
  });

  // Form states
  const [showDealForm, setShowDealForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    saveDataToStorage();
  }, [deals, portfolioCompanies, financialReports, riskAssessments, settings]);

  const loadStoredData = () => {
    try {
      const storedDeals = localStorage.getItem('pe_deals');
      const storedCompanies = localStorage.getItem('pe_companies');
      const storedReports = localStorage.getItem('pe_reports');
      const storedRisks = localStorage.getItem('pe_risks');
      const storedSettings = localStorage.getItem('pe_settings');

      if (storedDeals) setDeals(JSON.parse(storedDeals));
      if (storedCompanies) setPortfolioCompanies(JSON.parse(storedCompanies));
      if (storedReports) setFinancialReports(JSON.parse(storedReports));
      if (storedRisks) setRiskAssessments(JSON.parse(storedRisks));
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      // Initialize with sample data if empty
      if (!storedDeals || JSON.parse(storedDeals).length === 0) {
        initializeSampleData();
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      initializeSampleData();
    }
  };

  const saveDataToStorage = () => {
    try {
      localStorage.setItem('pe_deals', JSON.stringify(deals));
      localStorage.setItem('pe_companies', JSON.stringify(portfolioCompanies));
      localStorage.setItem('pe_reports', JSON.stringify(financialReports));
      localStorage.setItem('pe_risks', JSON.stringify(riskAssessments));
      localStorage.setItem('pe_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const initializeSampleData = () => {
    const sampleDeals: Deal[] = [
      {
        id: '1',
        companyName: 'TechCorp Ltd',
        sector: 'Technology',
        stage: 'Due Diligence',
        dealSize: 25000000,
        equity: 35,
        valuation: 71400000,
        dateAdded: '2025-05-15',
        status: 'Active'
      },
      {
        id: '2',
        companyName: 'Healthcare Solutions',
        sector: 'Healthcare',
        stage: 'Investment Committee',
        dealSize: 40000000,
        equity: 25,
        valuation: 160000000,
        dateAdded: '2025-04-22',
        status: 'Active'
      },
      {
        id: '3',
        companyName: 'GreenEnergy PLC',
        sector: 'Energy',
        stage: 'Closed',
        dealSize: 60000000,
        equity: 40,
        valuation: 150000000,
        dateAdded: '2024-11-10',
        exitDate: '2025-03-15',
        irr: 28.5,
        multiple: 2.1,
        status: 'Exited'
      }
    ];

    const sampleCompanies: PortfolioCompany[] = [
      {
        id: '1',
        name: 'DataFlow Systems',
        sector: 'Technology',
        investmentDate: '2023-06-15',
        initialInvestment: 30000000,
        currentValuation: 45000000,
        ownership: 30,
        ebitda: 8500000,
        revenue: 25000000,
        employeeCount: 145,
        status: 'Active',
        lastUpdated: '2025-06-01'
      },
      {
        id: '2',
        name: 'MedTech Innovations',
        sector: 'Healthcare',
        investmentDate: '2022-09-20',
        initialInvestment: 50000000,
        currentValuation: 75000000,
        ownership: 40,
        ebitda: 12000000,
        revenue: 35000000,
        employeeCount: 220,
        status: 'Active',
        lastUpdated: '2025-05-28'
      }
    ];

    const sampleReports: FinancialReport[] = [
      {
        id: '1',
        reportType: 'Quarterly',
        period: 'Q1 2025',
        portfolioValue: 450000000,
        totalDeployed: 320000000,
        irr: 22.8,
        tvpi: 1.41,
        dpi: 0.65,
        createdDate: '2025-04-15'
      }
    ];

    setDeals(sampleDeals);
    setPortfolioCompanies(sampleCompanies);
    setFinancialReports(sampleReports);
  };

  // AI Functions
  const handleAiAnalysis = (type: 'due_diligence' | 'financial_statement' | 'investment_memo') => {
    if (!selectedFile && !aiPrompt.trim()) {
      setAiError('Please provide a file or text input for analysis.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    let prompt = '';
    let additionalContext = '';

    switch (type) {
      case 'due_diligence':
        additionalContext = `Analyze this due diligence document and extract key information. Return JSON with fields: "company_name", "sector", "revenue", "ebitda", "valuation", "key_risks", "investment_highlights", "management_quality", "market_position", "financial_health_score"`;
        prompt = aiPrompt || 'Analyze this due diligence document for investment decision-making.';
        break;
      case 'financial_statement':
        additionalContext = `Process this financial statement and extract key metrics. Return JSON with fields: "company_name", "revenue", "gross_profit", "ebitda", "net_income", "total_assets", "total_debt", "cash_position", "working_capital", "growth_rate", "profitability_ratios"`;
        prompt = aiPrompt || 'Extract financial metrics from this statement.';
        break;
      case 'investment_memo':
        additionalContext = `Analyze this investment memorandum and extract deal terms. Return JSON with fields: "company_name", "deal_size", "equity_stake", "valuation", "investment_thesis", "projected_irr", "projected_multiple", "exit_strategy", "key_terms", "risk_factors"`;
        prompt = aiPrompt || 'Extract investment terms and analysis from this memo.';
        break;
    }

    const fullPrompt = `${prompt}\n\n${additionalContext}`;

    try {
      aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const processAiResult = (result: string, type: string) => {
    try {
      const parsedResult = JSON.parse(result);
      
      if (type === 'due_diligence' || type === 'investment_memo') {
        // Auto-fill deal form
        const newDeal: Deal = {
          id: Date.now().toString(),
          companyName: parsedResult.company_name || 'Unknown Company',
          sector: parsedResult.sector || 'Other',
          stage: 'Due Diligence',
          dealSize: parsedResult.deal_size || 0,
          equity: parsedResult.equity_stake || 0,
          valuation: parsedResult.valuation || 0,
          dateAdded: new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        
        setDeals(prev => [...prev, newDeal]);
        setShowDealForm(false);
      } else if (type === 'financial_statement') {
        // Auto-fill portfolio company form
        const newCompany: PortfolioCompany = {
          id: Date.now().toString(),
          name: parsedResult.company_name || 'Unknown Company',
          sector: 'Technology', // Default
          investmentDate: new Date().toISOString().split('T')[0],
          initialInvestment: 0,
          currentValuation: parsedResult.valuation || 0,
          ownership: 0,
          ebitda: parsedResult.ebitda || 0,
          revenue: parsedResult.revenue || 0,
          employeeCount: 0,
          status: 'Active',
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        setPortfolioCompanies(prev => [...prev, newCompany]);
        setShowCompanyForm(false);
      }
      
      setSelectedFile(null);
      setAiPrompt('');
    } catch (error) {
      // If not JSON, just display as markdown
      console.log('AI result is not JSON, displaying as markdown');
    }
  };

  // CRUD Functions
  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(deal => deal.id !== id));
    setShowConfirmDelete(null);
  };

  const deleteCompany = (id: string) => {
    setPortfolioCompanies(prev => prev.filter(company => company.id !== id));
    setShowConfirmDelete(null);
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDFReport = () => {
    // Simple PDF-like report generation (HTML that can be printed)
    const reportContent = `
      <html>
        <head>
          <title>PE Portfolio Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Portfolio Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Portfolio Summary</h2>
            <p>Total Companies: ${portfolioCompanies.length}</p>
            <p>Total Portfolio Value: £${portfolioCompanies.reduce((sum, company) => sum + company.currentValuation, 0).toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h2>Portfolio Companies</h2>
            <table>
              <tr>
                <th>Company</th>
                <th>Sector</th>
                <th>Investment</th>
                <th>Current Value</th>
                <th>Status</th>
              </tr>
              ${portfolioCompanies.map(company => `
                <tr>
                  <td>${company.name}</td>
                  <td>${company.sector}</td>
                  <td>£${company.initialInvestment.toLocaleString()}</td>
                  <td>£${company.currentValuation.toLocaleString()}</td>
                  <td>${company.status}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_report.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import template download
  const downloadTemplate = (type: 'deals' | 'companies') => {
    let templateData: any[] = [];
    let filename = '';
    
    if (type === 'deals') {
      templateData = [{
        companyName: 'Example Corp',
        sector: 'Technology',
        stage: 'Due Diligence',
        dealSize: 25000000,
        equity: 35,
        valuation: 71400000,
        dateAdded: '2025-06-11',
        status: 'Active'
      }];
      filename = 'deals_template';
    } else {
      templateData = [{
        name: 'Example Company',
        sector: 'Technology',
        investmentDate: '2025-06-11',
        initialInvestment: 30000000,
        currentValuation: 45000000,
        ownership: 30,
        ebitda: 8500000,
        revenue: 25000000,
        employeeCount: 145,
        status: 'Active'
      }];
      filename = 'companies_template';
    }
    
    exportToCSV(templateData, filename);
  };

  // Calculate dashboard metrics
  const totalPortfolioValue = portfolioCompanies.reduce((sum, company) => sum + company.currentValuation, 0);
  const totalDeployed = portfolioCompanies.reduce((sum, company) => sum + company.initialInvestment, 0);
  const activeDealCount = deals.filter(deal => deal.status === 'Active').length;
  const avgIRR = deals.filter(deal => deal.irr).reduce((sum, deal) => sum + (deal.irr || 0), 0) / deals.filter(deal => deal.irr).length || 0;

  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-title">Total Portfolio Value</div>
          <div className="stat-value">£{totalPortfolioValue.toLocaleString()}</div>
          <div className="stat-change stat-increase flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            12.5% from last quarter
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Deployed</div>
          <div className="stat-value">£{totalDeployed.toLocaleString()}</div>
          <div className="stat-change">
            Deployment rate: 85%
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active Deals</div>
          <div className="stat-value">{activeDealCount}</div>
          <div className="stat-change">
            Pipeline: {deals.filter(d => d.stage !== 'Closed' && d.stage !== 'Passed').length} deals
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Portfolio IRR</div>
          <div className="stat-value">{avgIRR.toFixed(1)}%</div>
          <div className="stat-change stat-increase flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            Above target
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Recent Deal Activity</h3>
          <div className="space-y-3">
            {deals.slice(0, 5).map(deal => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">{deal.companyName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{deal.sector} • {deal.stage}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">£{deal.dealSize.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{deal.equity}% equity</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Portfolio Performance</h3>
          <div className="space-y-3">
            {portfolioCompanies.slice(0, 5).map(company => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{company.sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">£{company.currentValuation.toLocaleString()}</div>
                  <div className={`text-sm ${company.currentValuation > company.initialInvestment ? 'text-green-600' : 'text-red-600'}`}>
                    {((company.currentValuation / company.initialInvestment - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeals = () => (
    <div id="deals-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="heading-3">Deal Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadTemplate('deals')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => exportToCSV(deals, 'deals')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowDealForm(true)}
            className="btn btn-primary btn-sm"
            id="add-deal-btn"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select select-sm"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Exited">Exited</option>
          <option value="Written Off">Written Off</option>
        </select>
      </div>

      {/* Deals Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Company</th>
              <th className="table-header-cell">Sector</th>
              <th className="table-header-cell">Stage</th>
              <th className="table-header-cell">Deal Size</th>
              <th className="table-header-cell">Equity %</th>
              <th className="table-header-cell">Valuation</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {deals
              .filter(deal => 
                deal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filterStatus === '' || deal.status === filterStatus)
              )
              .map(deal => (
                <tr key={deal.id} className="table-row">
                  <td className="table-cell font-medium">{deal.companyName}</td>
                  <td className="table-cell">{deal.sector}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      deal.stage === 'Closed' ? 'badge-success' :
                      deal.stage === 'Investment Committee' ? 'badge-warning' :
                      deal.stage === 'Due Diligence' ? 'badge-primary' : 'badge-gray'
                    }`}>
                      {deal.stage}
                    </span>
                  </td>
                  <td className="table-cell">£{deal.dealSize.toLocaleString()}</td>
                  <td className="table-cell">{deal.equity}%</td>
                  <td className="table-cell">£{deal.valuation.toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      deal.status === 'Active' ? 'badge-success' :
                      deal.status === 'Exited' ? 'badge-primary' : 'badge-error'
                    }`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(deal)}
                        className="btn btn-ghost btn-xs"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(deal.id)}
                        className="btn btn-ghost btn-xs text-red-600"
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

  const renderPortfolio = () => (
    <div id="portfolio-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="heading-3">Portfolio Companies</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadTemplate('companies')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => exportToCSV(portfolioCompanies, 'portfolio')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCompanyForm(true)}
            className="btn btn-primary btn-sm"
            id="add-company-btn"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioCompanies.map(company => (
          <div key={company.id} className="card card-padding hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="heading-6">{company.name}</h3>
                <p className="text-caption">{company.sector}</p>
              </div>
              <span className={`badge ${
                company.status === 'Active' ? 'badge-success' :
                company.status === 'Exited' ? 'badge-primary' : 'badge-warning'
              }`}>
                {company.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-caption">Current Valuation</span>
                <span className="font-medium">£{company.currentValuation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-caption">Initial Investment</span>
                <span className="font-medium">£{company.initialInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-caption">Ownership</span>
                <span className="font-medium">{company.ownership}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-caption">Revenue</span>
                <span className="font-medium">£{company.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-caption">EBITDA</span>
                <span className="font-medium">£{company.ebitda.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">
                Updated: {new Date(company.lastUpdated).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingItem(company)}
                  className="btn btn-ghost btn-xs"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(company.id)}
                  className="btn btn-ghost btn-xs text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div id="reports-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="heading-3">Financial Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={generatePDFReport}
            className="btn btn-primary btn-sm"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* AI Document Analysis */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Document Analysis
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleAiAnalysis('due_diligence')}
              className="btn btn-secondary"
              disabled={isAiLoading}
            >
              {isAiLoading ? 'Processing...' : 'Analyze Due Diligence'}
            </button>
            <button
              onClick={() => handleAiAnalysis('financial_statement')}
              className="btn btn-secondary"
              disabled={isAiLoading}
            >
              {isAiLoading ? 'Processing...' : 'Process Financials'}
            </button>
            <button
              onClick={() => handleAiAnalysis('investment_memo')}
              className="btn btn-secondary"
              disabled={isAiLoading}
            >
              {isAiLoading ? 'Processing...' : 'Analyze Memo'}
            </button>
          </div>
          
          <div className="form-group">
            <label className="form-label">Upload Document</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional Instructions (Optional)</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Any specific analysis requirements..."
              className="textarea"
              rows={3}
            />
          </div>
          
          {aiError && (
            <div className="alert alert-error">
              <AlertTriangle className="w-4 h-4" />
              <span>{aiError}</span>
            </div>
          )}
          
          {aiResult && (
            <div className="card card-padding bg-green-50 dark:bg-green-900/20">
              <h4 className="font-medium mb-2">Analysis Result:</h4>
              <div className="prose prose-sm max-w-none">
                {aiResult}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Recent Reports</h3>
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Portfolio Value</th>
                <th className="table-header-cell">IRR</th>
                <th className="table-header-cell">TVPI</th>
                <th className="table-header-cell">Created</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {financialReports.map(report => (
                <tr key={report.id} className="table-row">
                  <td className="table-cell font-medium">{report.period}</td>
                  <td className="table-cell">{report.reportType}</td>
                  <td className="table-cell">£{report.portfolioValue.toLocaleString()}</td>
                  <td className="table-cell">{report.irr}%</td>
                  <td className="table-cell">{report.tvpi}x</td>
                  <td className="table-cell">{new Date(report.createdDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h2 className="heading-3">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value as any }))}
                className="select"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Reporting Period</label>
              <select
                value={settings.reportingPeriod}
                onChange={(e) => setSettings(prev => ({ ...prev, reportingPeriod: e.target.value as any }))}
                className="select"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Theme</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={() => exportToCSV([...deals, ...portfolioCompanies], 'all_data')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure? This will delete all data permanently.')) {
                  setDeals([]);
                  setPortfolioCompanies([]);
                  setFinancialReports([]);
                  setRiskAssessments([]);
                  localStorage.clear();
                }
              }}
              className="btn btn-error w-full"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAiResult(result, 'analysis');
        }}
        onError={setAiError}
        onLoading={setIsAiLoading}
      />

      {/* Navigation */}
      <nav className="navbar shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-sm lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Building className="w-8 h-8 text-primary-600" />
            <h1 className="heading-6 text-primary-600">PE CFO Dashboard</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Welcome, {currentUser?.first_name}
          </span>
          <button
            onClick={toggleDarkMode}
            className="btn btn-ghost btn-sm"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-closed'} lg:transform-none`}>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className={`nav-link w-full text-left ${activeTab === 'dashboard' ? 'nav-link-active' : ''}`}
              id="generation_issue_fallback"
            >
              <ChartBar className="w-4 h-4 mr-2 inline" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('deals');
                setSidebarOpen(false);
              }}
              className={`nav-link w-full text-left ${activeTab === 'deals' ? 'nav-link-active' : ''}`}
            >
              <Target className="w-4 h-4 mr-2 inline" />
              Deal Pipeline
            </button>
            <button
              onClick={() => {
                setActiveTab('portfolio');
                setSidebarOpen(false);
              }}
              className={`nav-link w-full text-left ${activeTab === 'portfolio' ? 'nav-link-active' : ''}`}
            >
              <Building className="w-4 h-4 mr-2 inline" />
              Portfolio
            </button>
            <button
              onClick={() => {
                setActiveTab('reports');
                setSidebarOpen(false);
              }}
              className={`nav-link w-full text-left ${activeTab === 'reports' ? 'nav-link-active' : ''}`}
            >
              <FileText className="w-4 h-4 mr-2 inline" />
              Reports & AI
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
              className={`nav-link w-full text-left ${activeTab === 'settings' ? 'nav-link-active' : ''}`}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Settings
            </button>
          </nav>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'deals' && renderDeals()}
          {activeTab === 'portfolio' && renderPortfolio()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>

      {/* Modals */}
      {showDealForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Add New Deal</h3>
              <button
                onClick={() => setShowDealForm(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="input" placeholder="Enter company name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sector</label>
                  <select className="select">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Energy</option>
                    <option>Financial Services</option>
                    <option>Consumer</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Deal Size (£)</label>
                    <input type="number" className="input" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Equity %</label>
                    <input type="number" className="input" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDealForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Add Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompanyForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Add Portfolio Company</h3>
              <button
                onClick={() => setShowCompanyForm(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="input" placeholder="Enter company name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sector</label>
                  <select className="select">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Energy</option>
                    <option>Financial Services</option>
                    <option>Consumer</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Initial Investment (£)</label>
                    <input type="number" className="input" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Valuation (£)</label>
                    <input type="number" className="input" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowCompanyForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deals.find(d => d.id === showConfirmDelete)) {
                    deleteDeal(showConfirmDelete);
                  } else {
                    deleteCompany(showConfirmDelete);
                  }
                }}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 lg:ml-64">
        <div className="container text-center text-sm text-gray-600 dark:text-gray-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;