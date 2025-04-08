import React, { useState, useEffect, ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Plus, Trash2, Edit, Search, Filter, ArrowDown, ArrowUp, ChevronDown, ChevronUp, Wallet, TrendingUp, TrendingDown, Percent, DollarSign, Settings, Download, Moon, Sun, CreditCard, ChartLine, ChartPie, ChartBar, Building, Portfolio } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our data structures
interface Fund {
  id: string;
  name: string;
  totalCommitment: number;
  committed: number;
  vintage: number;
  IRR: number;
  MOIC: number;
  DPI: number;
  RVPI: number;
  TVPI: number;
  sector: string;
  stage: string;
  performanceRating: 'Outperforming' | 'On Target' | 'Underperforming';
}

interface PortfolioCompany {
  id: string;
  name: string;
  fundId: string;
  sector: string;
  initialInvestment: number;
  currentValuation: number;
  investmentDate: string; // ISO date string
  revenueGrowth: number;
  ebitdaMargin: number;
  status: 'Active' | 'Exited' | 'Written Off';
  exitDate?: string; // ISO date string, optional
  exitValue?: number; // optional
  performanceRating: 'Outperforming' | 'On Target' | 'Underperforming';
}

interface SectorPerformance {
  sector: string;
  averageIRR: number;
  totalInvestment: number;
  companyCount: number;
}

interface PerformanceMetrics {
  totalCommitment: number;
  totalDeployed: number;
  averageIRR: number;
  averageMOIC: number;
  fundCount: number;
  companyCount: number;
}

interface PerformanceTrend {
  month: string;
  averageIRR: number;
  averageMOIC: number;
}

// Main App Component
const App: React.FC = () => {
  // State management
  const [funds, setFunds] = useState<Fund[]>([]);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'funds' | 'companies'>('dashboard');
  const [currentFund, setCurrentFund] = useState<Fund | null>(null);
  const [currentCompany, setCurrentCompany] = useState<PortfolioCompany | null>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fundSearchTerm, setFundSearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [fundSortField, setFundSortField] = useState<keyof Fund>('name');
  const [fundSortDirection, setFundSortDirection] = useState<'asc' | 'desc'>('asc');
  const [companySortField, setCompanySortField] = useState<keyof PortfolioCompany>('name');
  const [companySortDirection, setCompanySortDirection] = useState<'asc' | 'desc'>('asc');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalCommitment: 0,
    totalDeployed: 0,
    averageIRR: 0,
    averageMOIC: 0,
    fundCount: 0,
    companyCount: 0
  });

  // Derived data for dashboards
  const sectorPerformance = React.useMemo(() => {
    const sectorMap = new Map<string, { totalIRR: number, count: number, totalInvestment: number }>();
    
    funds.forEach(fund => {
      if (!sectorMap.has(fund.sector)) {
        sectorMap.set(fund.sector, { totalIRR: 0, count: 0, totalInvestment: 0 });
      }
      const sectorData = sectorMap.get(fund.sector);
      if (sectorData) {
        sectorData.totalIRR += fund.IRR;
        sectorData.count += 1;
        sectorData.totalInvestment += fund.committed;
      }
    });
    
    companies.forEach(company => {
      if (!sectorMap.has(company.sector)) {
        sectorMap.set(company.sector, { totalIRR: 0, count: 0, totalInvestment: 0 });
      }
      const sectorData = sectorMap.get(company.sector);
      if (sectorData) {
        sectorData.totalInvestment += company.initialInvestment;
        // Companies don't have direct IRR, so we're not adding to totalIRR here
        sectorData.count += 1;
      }
    });
    
    return Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      averageIRR: data.count > 0 ? data.totalIRR / data.count : 0,
      totalInvestment: data.totalInvestment,
      companyCount: data.count
    }));
  }, [funds, companies]);

  const performanceTrends = React.useMemo(() => {
    // Simulate 12 months of trend data
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push({
        month: monthName,
        // Generate sample data based on fund performance with slight random variations
        averageIRR: funds.length > 0
          ? funds.reduce((sum, fund) => sum + fund.IRR, 0) / funds.length + (Math.random() * 2 - 1)
          : Math.random() * 15,
        averageMOIC: funds.length > 0
          ? funds.reduce((sum, fund) => sum + fund.MOIC, 0) / funds.length + (Math.random() * 0.2 - 0.1)
          : 1 + Math.random() * 1.5
      });
    }
    return months;
  }, [funds]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedFunds = localStorage.getItem('funds');
    const storedCompanies = localStorage.getItem('companies');
    
    if (storedFunds) setFunds(JSON.parse(storedFunds));
    if (storedCompanies) setCompanies(JSON.parse(storedCompanies));

    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('funds', JSON.stringify(funds));
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [funds, companies]);

  // Update performance metrics when funds or companies change
  useEffect(() => {
    const metrics: PerformanceMetrics = {
      totalCommitment: funds.reduce((sum, fund) => sum + fund.totalCommitment, 0),
      totalDeployed: funds.reduce((sum, fund) => sum + fund.committed, 0),
      averageIRR: funds.length > 0 ? funds.reduce((sum, fund) => sum + fund.IRR, 0) / funds.length : 0,
      averageMOIC: funds.length > 0 ? funds.reduce((sum, fund) => sum + fund.MOIC, 0) / funds.length : 0,
      fundCount: funds.length,
      companyCount: companies.length
    };
    setPerformanceMetrics(metrics);
  }, [funds, companies]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  };

  // Filter and sort functions
  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(fundSearchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || fund.sector === sectorFilter;
    const matchesStage = stageFilter === 'All' || fund.stage === stageFilter;
    return matchesSearch && matchesSector && matchesStage;
  });

  const sortedFunds = [...filteredFunds].sort((a, b) => {
    const aValue = a[fundSortField];
    const bValue = b[fundSortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return fundSortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      const numA = Number(aValue);
      const numB = Number(bValue);
      return fundSortDirection === 'asc' ? numA - numB : numB - numA;
    }
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(companySearchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || company.sector === sectorFilter;
    const matchesStatus = statusFilter === 'All' || company.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    const aValue = a[companySortField];
    const bValue = b[companySortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return companySortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      const numA = Number(aValue);
      const numB = Number(bValue);
      return companySortDirection === 'asc' ? numA - numB : numB - numA;
    }
  });

  // Handle column sort
  const handleFundSort = (field: keyof Fund) => {
    if (field === fundSortField) {
      setFundSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setFundSortField(field);
      setFundSortDirection('asc');
    }
  };

  const handleCompanySort = (field: keyof PortfolioCompany) => {
    if (field === companySortField) {
      setCompanySortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCompanySortField(field);
      setCompanySortDirection('asc');
    }
  };

  // CRUD operations for funds
  const handleAddFund = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const newFund: Fund = {
      id: isEditMode && currentFund ? currentFund.id : new Date().getTime().toString(),
      name: (form.fundName as HTMLInputElement).value,
      totalCommitment: parseFloat((form.totalCommitment as HTMLInputElement).value),
      committed: parseFloat((form.committed as HTMLInputElement).value),
      vintage: parseInt((form.vintage as HTMLInputElement).value),
      IRR: parseFloat((form.irr as HTMLInputElement).value),
      MOIC: parseFloat((form.moic as HTMLInputElement).value),
      DPI: parseFloat((form.dpi as HTMLInputElement).value),
      RVPI: parseFloat((form.rvpi as HTMLInputElement).value),
      TVPI: parseFloat((form.tvpi as HTMLInputElement).value),
      sector: (form.sector as HTMLSelectElement).value,
      stage: (form.stage as HTMLSelectElement).value,
      performanceRating: (form.performanceRating as HTMLSelectElement).value as 'Outperforming' | 'On Target' | 'Underperforming'
    };
    
    if (isEditMode && currentFund) {
      setFunds(funds.map(fund => fund.id === currentFund.id ? newFund : fund));
    } else {
      setFunds([...funds, newFund]);
    }
    
    setShowFundModal(false);
    setCurrentFund(null);
    setIsEditMode(false);
    form.reset();
  };

  const handleEditFund = (fund: Fund) => {
    setCurrentFund(fund);
    setIsEditMode(true);
    setShowFundModal(true);
  };

  const handleDeleteFund = (id: string) => {
    // Remove the fund
    setFunds(funds.filter(fund => fund.id !== id));
    
    // Also remove all portfolio companies associated with this fund
    setCompanies(companies.filter(company => company.fundId !== id));
  };

  // CRUD operations for portfolio companies
  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const newCompany: PortfolioCompany = {
      id: isEditMode && currentCompany ? currentCompany.id : new Date().getTime().toString(),
      name: (form.companyName as HTMLInputElement).value,
      fundId: (form.fundId as HTMLSelectElement).value,
      sector: (form.companySector as HTMLSelectElement).value,
      initialInvestment: parseFloat((form.initialInvestment as HTMLInputElement).value),
      currentValuation: parseFloat((form.currentValuation as HTMLInputElement).value),
      investmentDate: (form.investmentDate as HTMLInputElement).value,
      revenueGrowth: parseFloat((form.revenueGrowth as HTMLInputElement).value),
      ebitdaMargin: parseFloat((form.ebitdaMargin as HTMLInputElement).value),
      status: (form.status as HTMLSelectElement).value as 'Active' | 'Exited' | 'Written Off',
      performanceRating: (form.companyPerformanceRating as HTMLSelectElement).value as 'Outperforming' | 'On Target' | 'Underperforming'
    };
    
    // Add optional exit data if status is Exited
    if (newCompany.status === 'Exited') {
      newCompany.exitDate = (form.exitDate as HTMLInputElement).value;
      newCompany.exitValue = parseFloat((form.exitValue as HTMLInputElement).value);
    }
    
    if (isEditMode && currentCompany) {
      setCompanies(companies.map(company => company.id === currentCompany.id ? newCompany : company));
    } else {
      setCompanies([...companies, newCompany]);
    }
    
    setShowCompanyModal(false);
    setCurrentCompany(null);
    setIsEditMode(false);
    form.reset();
  };

  const handleEditCompany = (company: PortfolioCompany) => {
    setCurrentCompany(company);
    setIsEditMode(true);
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(companies.filter(company => company.id !== id));
  };

  // Export to CSV
  const exportFundsToCSV = () => {
    const headers = ['Name', 'Total Commitment', 'Committed', 'Vintage', 'IRR', 'MOIC', 'DPI', 'RVPI', 'TVPI', 'Sector', 'Stage', 'Performance Rating'];
    const rows = funds.map(fund => [
      fund.name,
      fund.totalCommitment,
      fund.committed,
      fund.vintage,
      fund.IRR,
      fund.MOIC,
      fund.DPI,
      fund.RVPI,
      fund.TVPI,
      fund.sector,
      fund.stage,
      fund.performanceRating
    ]);
    exportCSV('funds_export.csv', headers, rows);
  };

  const exportCompaniesToCSV = () => {
    const headers = ['Name', 'Fund', 'Sector', 'Initial Investment', 'Current Valuation', 'Investment Date', 'Revenue Growth', 'EBITDA Margin', 'Status', 'Exit Date', 'Exit Value', 'Performance Rating'];
    const rows = companies.map(company => {
      const fundName = funds.find(f => f.id === company.fundId)?.name || 'Unknown';
      return [
        company.name,
        fundName,
        company.sector,
        company.initialInvestment,
        company.currentValuation,
        company.investmentDate,
        company.revenueGrowth,
        company.ebitdaMargin,
        company.status,
        company.exitDate || '',
        company.exitValue || '',
        company.performanceRating
      ];
    });
    exportCSV('companies_export.csv', headers, rows);
  };

  const exportCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique sectors and stages for filters
  const uniqueSectors = ['All', ...new Set(funds.map(fund => fund.sector))];
  const uniqueStages = ['All', ...new Set(funds.map(fund => fund.stage))];
  const statuses = ['All', 'Active', 'Exited', 'Written Off'];

  // Handler for escape key to close modals
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFundModal(false);
        setShowCompanyModal(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Helper function to determine performance color
  const getPerformanceColor = (rating: string): string => {
    switch (rating) {
      case 'Outperforming': return 'text-green-500';
      case 'On Target': return 'text-blue-500';
      case 'Underperforming': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Render table header with sort functionality
  const renderTableHeader = (label: string, field: keyof Fund | keyof PortfolioCompany, sortField: keyof Fund | keyof PortfolioCompany, sortDirection: 'asc' | 'desc', onSort: (field: any) => void) => {
    return (
      <th 
        className="table-header px-6 py-3 cursor-pointer" 
        onClick={() => onSort(field)}
        role="columnheader"
      >
        <div className="flex items-center gap-1">
          {label}
          {sortField === field && (
            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          )}
        </div>
      </th>
    );
  };

  // Modal component for fund and company forms
  const Modal: React.FC<{ show: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ show, onClose, title, children }) => {
    if (!show) return null;
    
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
          <div className="modal-header">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Component to show trend direction
  const TrendIndicator: React.FC<{ value: number; suffix?: string }> = ({ value, suffix }) => {
    return (
      <span className={`inline-flex items-center ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {value >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        {Math.abs(value).toFixed(2)}{suffix}
      </span>
    );
  };

  // Stat Card component
  const StatCard: React.FC<{ title: string; value: string | number; trend?: number; icon: ReactNode; suffix?: string }> = ({ title, value, trend, icon, suffix }) => {
    return (
      <div className="stat-card">
        <div className="flex justify-between items-center mb-2">
          <div className="stat-title">{title}</div>
          <div className="text-gray-400 dark:text-gray-500">{icon}</div>
        </div>
        <div className="stat-value">{value}{suffix}</div>
        {trend !== undefined && (
          <div className="stat-desc">
            <TrendIndicator value={trend} suffix={suffix} />
          </div>
        )}
      </div>
    );
  };

  // Dashboard UI
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key metrics section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Commitment" 
          value={`$${performanceMetrics.totalCommitment.toLocaleString()}`} 
          icon={<Wallet className="h-5 w-5" />} 
        />
        <StatCard 
          title="Deployed Capital" 
          value={`$${performanceMetrics.totalDeployed.toLocaleString()}`} 
          trend={performanceMetrics.totalCommitment > 0 ? (performanceMetrics.totalDeployed / performanceMetrics.totalCommitment) * 100 - 100 : 0} 
          icon={<CreditCard className="h-5 w-5" />} 
          suffix="%" 
        />
        <StatCard 
          title="Average IRR" 
          value={performanceMetrics.averageIRR.toFixed(2)} 
          trend={performanceMetrics.averageIRR - 10} // Compared to 10% benchmark
          icon={<Percent className="h-5 w-5" />} 
          suffix="%" 
        />
        <StatCard 
          title="Average MOIC" 
          value={performanceMetrics.averageMOIC.toFixed(2)} 
          trend={performanceMetrics.averageMOIC - 2} // Compared to 2.0x benchmark
          icon={<DollarSign className="h-5 w-5" />} 
          suffix="x" 
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance trends chart */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <ChartLine className="mr-2 h-5 w-5" /> Performance Trends
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <YAxis yAxisId="left" tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                  labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="averageIRR" name="IRR (%)" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="averageMOIC" name="MOIC (x)" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector breakdown chart */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <ChartPie className="mr-2 h-5 w-5" /> Sector Allocation
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalInvestment"
                  nameKey="sector"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => ['Investment ($)', `$${Number(value).toLocaleString()}`]}
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                  labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector performance chart */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <ChartBar className="mr-2 h-5 w-5" /> Sector Performance
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="sector" tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <YAxis tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [name === 'averageIRR' ? `${Number(value).toFixed(2)}%` : value, name === 'averageIRR' ? 'Average IRR' : 'Company Count']}
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                  labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                />
                <Legend />
                <Bar dataKey="averageIRR" name="Average IRR (%)" fill="#8884d8" />
                <Bar dataKey="companyCount" name="Company Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fund deployment chart */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Building className="mr-2 h-5 w-5" /> Fund Deployment
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funds.map(fund => ({
                name: fund.name,
                committed: fund.committed,
                uncommitted: fund.totalCommitment - fund.committed
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <YAxis tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                  labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                />
                <Legend />
                <Area type="monotone" dataKey="committed" stackId="1" name="Committed Capital" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="uncommitted" stackId="1" name="Uncommitted Capital" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fund summary section */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4 flex items-center">Fund Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="table-header px-6 py-3">Fund</th>
                <th className="table-header px-6 py-3">Committed / Total</th>
                <th className="table-header px-6 py-3">IRR</th>
                <th className="table-header px-6 py-3">MOIC</th>
                <th className="table-header px-6 py-3">Sector</th>
                <th className="table-header px-6 py-3">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {funds.slice(0, 5).map(fund => (
                <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell">{fund.name}</td>
                  <td className="table-cell">${fund.committed.toLocaleString()} / ${fund.totalCommitment.toLocaleString()}</td>
                  <td className="table-cell">{fund.IRR.toFixed(2)}%</td>
                  <td className="table-cell">{fund.MOIC.toFixed(2)}x</td>
                  <td className="table-cell">{fund.sector}</td>
                  <td className={`table-cell ${getPerformanceColor(fund.performanceRating)}`}>{fund.performanceRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {funds.length > 5 && (
          <div className="mt-4 text-right">
            <button 
              className="btn btn-sm text-primary-600 hover:text-primary-800"
              onClick={() => setActiveTab('funds')}
            >
              View All Funds
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Funds tab UI
  const renderFundsTab = () => (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search funds..."
            className="input pl-10"
            value={fundSearchTerm}
            onChange={(e) => setFundSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="input"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            aria-label="Filter by sector"
          >
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <select 
            className="input"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            aria-label="Filter by stage"
          >
            {uniqueStages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setCurrentFund(null);
              setIsEditMode(false);
              setShowFundModal(true);
            }}
          >
            <Plus size={18} /> Add Fund
          </button>
          <button 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
            onClick={exportFundsToCSV}
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Funds table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                {renderTableHeader('Fund Name', 'name', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('Total Commitment', 'totalCommitment', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('Committed', 'committed', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('Vintage', 'vintage', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('IRR', 'IRR', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('MOIC', 'MOIC', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('DPI', 'DPI', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('RVPI', 'RVPI', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('TVPI', 'TVPI', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('Sector', 'sector', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('Stage', 'stage', fundSortField, fundSortDirection, handleFundSort)}
                {renderTableHeader('Performance', 'performanceRating', fundSortField, fundSortDirection, handleFundSort)}
                <th className="table-header px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedFunds.length > 0 ? (
                sortedFunds.map(fund => (
                  <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">{fund.name}</td>
                    <td className="table-cell">${fund.totalCommitment.toLocaleString()}</td>
                    <td className="table-cell">${fund.committed.toLocaleString()}</td>
                    <td className="table-cell">{fund.vintage}</td>
                    <td className="table-cell">{fund.IRR.toFixed(2)}%</td>
                    <td className="table-cell">{fund.MOIC.toFixed(2)}x</td>
                    <td className="table-cell">{fund.DPI.toFixed(2)}x</td>
                    <td className="table-cell">{fund.RVPI.toFixed(2)}x</td>
                    <td className="table-cell">{fund.TVPI.toFixed(2)}x</td>
                    <td className="table-cell">{fund.sector}</td>
                    <td className="table-cell">{fund.stage}</td>
                    <td className={`table-cell ${getPerformanceColor(fund.performanceRating)}`}>{fund.performanceRating}</td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditFund(fund)}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                          aria-label={`Edit ${fund.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFund(fund.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                          aria-label={`Delete ${fund.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No funds found. Add your first fund to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Portfolio companies tab UI
  const renderCompaniesTab = () => (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search companies..."
            className="input pl-10"
            value={companySearchTerm}
            onChange={(e) => setCompanySearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="input"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            aria-label="Filter by sector"
          >
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <select 
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              if (funds.length === 0) {
                alert('Please add at least one fund before adding a portfolio company.');
                return;
              }
              setCurrentCompany(null);
              setIsEditMode(false);
              setShowCompanyModal(true);
            }}
            disabled={funds.length === 0}
          >
            <Plus size={18} /> Add Company
          </button>
          <button 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
            onClick={exportCompaniesToCSV}
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Companies table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                {renderTableHeader('Company Name', 'name', companySortField, companySortDirection, handleCompanySort)}
                <th className="table-header px-6 py-3">Fund</th>
                {renderTableHeader('Sector', 'sector', companySortField, companySortDirection, handleCompanySort)}
                {renderTableHeader('Initial Investment', 'initialInvestment', companySortField, companySortDirection, handleCompanySort)}
                {renderTableHeader('Current Valuation', 'currentValuation', companySortField, companySortDirection, handleCompanySort)}
                {renderTableHeader('Investment Date', 'investmentDate', companySortField, companySortDirection, handleCompanySort)}
                {renderTableHeader('Revenue Growth', 'revenueGrowth', companySortField, companySortDirection, handleCompanySort)}
                {renderTableHeader('EBITDA Margin', 'ebitdaMargin', companySortField, companySortDirection, handleCompanySort)}
                {renderTableHeader('Status', 'status', companySortField, companySortDirection, handleCompanySort)}
                <th className="table-header px-6 py-3">Exit Details</th>
                {renderTableHeader('Performance', 'performanceRating', companySortField, companySortDirection, handleCompanySort)}
                <th className="table-header px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedCompanies.length > 0 ? (
                sortedCompanies.map(company => {
                  const fund = funds.find(f => f.id === company.fundId);
                  return (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="table-cell">{company.name}</td>
                      <td className="table-cell">{fund?.name || 'Unknown Fund'}</td>
                      <td className="table-cell">{company.sector}</td>
                      <td className="table-cell">${company.initialInvestment.toLocaleString()}</td>
                      <td className="table-cell">${company.currentValuation.toLocaleString()}</td>
                      <td className="table-cell">{new Date(company.investmentDate).toLocaleDateString()}</td>
                      <td className="table-cell">{company.revenueGrowth.toFixed(2)}%</td>
                      <td className="table-cell">{company.ebitdaMargin.toFixed(2)}%</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          company.status === 'Exited' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {company.status === 'Exited' && company.exitDate && company.exitValue ? (
                          <div>
                            <div>{new Date(company.exitDate).toLocaleDateString()}</div>
                            <div>${company.exitValue.toLocaleString()}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={`table-cell ${getPerformanceColor(company.performanceRating)}`}>{company.performanceRating}</td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditCompany(company)}
                            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                            aria-label={`Edit ${company.name}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                            aria-label={`Delete ${company.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No portfolio companies found. Add your first company to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid min-h-screen pb-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center py-4 mb-6 border-b dark:border-gray-700">
        <div className="flex items-center mb-4 sm:mb-0">
          <Wallet className="h-8 w-8 mr-2 text-primary-600" />
          <h1 className="text-2xl font-bold">Private Equity Fund Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode} 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
            onClick={() => {
              // Reset all filters
              setFundSearchTerm('');
              setCompanySearchTerm('');
              setSectorFilter('All');
              setStageFilter('All');
              setStatusFilter('All');
            }}
          >
            <Filter size={18} /> Reset Filters
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="mb-6 border-b dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'funds' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('funds')}
          >
            Funds
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'companies' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('companies')}
          >
            Portfolio Companies
          </button>
        </nav>
      </div>

      {/* Main content based on active tab */}
      <main className="mb-20">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'funds' && renderFundsTab()}
        {activeTab === 'companies' && renderCompaniesTab()}
      </main>

      {/* Fund modal */}
      <Modal 
        show={showFundModal} 
        onClose={() => {
          setShowFundModal(false);
          setCurrentFund(null);
          setIsEditMode(false);
        }} 
        title={isEditMode ? 'Edit Fund' : 'Add New Fund'}
      >
        <form onSubmit={handleAddFund} className="space-y-4">
          <div className="form-group">
            <label htmlFor="fundName" className="form-label">Fund Name</label>
            <input 
              type="text" 
              id="fundName" 
              name="fundName" 
              className="input" 
              required 
              defaultValue={currentFund?.name || ''} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="totalCommitment" className="form-label">Total Commitment ($)</label>
              <input 
                type="number" 
                id="totalCommitment" 
                name="totalCommitment" 
                className="input" 
                min="0" 
                step="1000" 
                required 
                defaultValue={currentFund?.totalCommitment || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="committed" className="form-label">Committed Amount ($)</label>
              <input 
                type="number" 
                id="committed" 
                name="committed" 
                className="input" 
                min="0" 
                step="1000" 
                required 
                defaultValue={currentFund?.committed || ''} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="vintage" className="form-label">Vintage Year</label>
              <input 
                type="number" 
                id="vintage" 
                name="vintage" 
                className="input" 
                min="1970" 
                max={new Date().getFullYear()} 
                required 
                defaultValue={currentFund?.vintage || new Date().getFullYear()} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="irr" className="form-label">IRR (%)</label>
              <input 
                type="number" 
                id="irr" 
                name="irr" 
                className="input" 
                step="0.01" 
                required 
                defaultValue={currentFund?.IRR || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="moic" className="form-label">MOIC (x)</label>
              <input 
                type="number" 
                id="moic" 
                name="moic" 
                className="input" 
                step="0.01" 
                min="0" 
                required 
                defaultValue={currentFund?.MOIC || ''} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="dpi" className="form-label">DPI (x)</label>
              <input 
                type="number" 
                id="dpi" 
                name="dpi" 
                className="input" 
                step="0.01" 
                min="0" 
                required 
                defaultValue={currentFund?.DPI || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="rvpi" className="form-label">RVPI (x)</label>
              <input 
                type="number" 
                id="rvpi" 
                name="rvpi" 
                className="input" 
                step="0.01" 
                min="0" 
                required 
                defaultValue={currentFund?.RVPI || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="tvpi" className="form-label">TVPI (x)</label>
              <input 
                type="number" 
                id="tvpi" 
                name="tvpi" 
                className="input" 
                step="0.01" 
                min="0" 
                required 
                defaultValue={currentFund?.TVPI || ''} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="sector" className="form-label">Sector</label>
              <select 
                id="sector" 
                name="sector" 
                className="input" 
                required 
                defaultValue={currentFund?.sector || ''}
              >
                <option value="">Select a sector</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Consumer">Consumer</option>
                <option value="Industrial">Industrial</option>
                <option value="Energy">Energy</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="stage" className="form-label">Investment Stage</label>
              <select 
                id="stage" 
                name="stage" 
                className="input" 
                required 
                defaultValue={currentFund?.stage || ''}
              >
                <option value="">Select a stage</option>
                <option value="Early Stage">Early Stage</option>
                <option value="Growth">Growth</option>
                <option value="Buyout">Buyout</option>
                <option value="Distressed">Distressed</option>
                <option value="Venture">Venture</option>
                <option value="Mezzanine">Mezzanine</option>
                <option value="Fund of Funds">Fund of Funds</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="performanceRating" className="form-label">Performance Rating</label>
              <select 
                id="performanceRating" 
                name="performanceRating" 
                className="input" 
                required 
                defaultValue={currentFund?.performanceRating || 'On Target'}
              >
                <option value="Outperforming">Outperforming</option>
                <option value="On Target">On Target</option>
                <option value="Underperforming">Underperforming</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => {
                setShowFundModal(false);
                setCurrentFund(null);
                setIsEditMode(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update Fund' : 'Add Fund'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Company modal */}
      <Modal 
        show={showCompanyModal} 
        onClose={() => {
          setShowCompanyModal(false);
          setCurrentCompany(null);
          setIsEditMode(false);
        }} 
        title={isEditMode ? 'Edit Portfolio Company' : 'Add New Portfolio Company'}
      >
        <form onSubmit={handleAddCompany} className="space-y-4">
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">Company Name</label>
            <input 
              type="text" 
              id="companyName" 
              name="companyName" 
              className="input" 
              required 
              defaultValue={currentCompany?.name || ''} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="fundId" className="form-label">Fund</label>
            <select 
              id="fundId" 
              name="fundId" 
              className="input" 
              required 
              defaultValue={currentCompany?.fundId || ''}
            >
              <option value="">Select a fund</option>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id}>{fund.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="companySector" className="form-label">Sector</label>
              <select 
                id="companySector" 
                name="companySector" 
                className="input" 
                required 
                defaultValue={currentCompany?.sector || ''}
              >
                <option value="">Select a sector</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Consumer">Consumer</option>
                <option value="Industrial">Industrial</option>
                <option value="Energy">Energy</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select 
                id="status" 
                name="status" 
                className="input" 
                required 
                defaultValue={currentCompany?.status || 'Active'}
                onChange={(e) => {
                  const exitFieldsContainer = document.getElementById('exitFields');
                  if (exitFieldsContainer) {
                    exitFieldsContainer.style.display = e.target.value === 'Exited' ? 'block' : 'none';
                  }
                }}
              >
                <option value="Active">Active</option>
                <option value="Exited">Exited</option>
                <option value="Written Off">Written Off</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="initialInvestment" className="form-label">Initial Investment ($)</label>
              <input 
                type="number" 
                id="initialInvestment" 
                name="initialInvestment" 
                className="input" 
                min="0" 
                step="1000" 
                required 
                defaultValue={currentCompany?.initialInvestment || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentValuation" className="form-label">Current Valuation ($)</label>
              <input 
                type="number" 
                id="currentValuation" 
                name="currentValuation" 
                className="input" 
                min="0" 
                step="1000" 
                required 
                defaultValue={currentCompany?.currentValuation || ''} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="investmentDate" className="form-label">Investment Date</label>
              <input 
                type="date" 
                id="investmentDate" 
                name="investmentDate" 
                className="input" 
                required 
                defaultValue={currentCompany?.investmentDate || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="revenueGrowth" className="form-label">Revenue Growth (%)</label>
              <input 
                type="number" 
                id="revenueGrowth" 
                name="revenueGrowth" 
                className="input" 
                step="0.01" 
                required 
                defaultValue={currentCompany?.revenueGrowth || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="ebitdaMargin" className="form-label">EBITDA Margin (%)</label>
              <input 
                type="number" 
                id="ebitdaMargin" 
                name="ebitdaMargin" 
                className="input" 
                step="0.01" 
                required 
                defaultValue={currentCompany?.ebitdaMargin || ''} 
              />
            </div>
          </div>
          <div id="exitFields" className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: currentCompany?.status === 'Exited' ? 'grid' : 'none' }}>
            <div className="form-group">
              <label htmlFor="exitDate" className="form-label">Exit Date</label>
              <input 
                type="date" 
                id="exitDate" 
                name="exitDate" 
                className="input" 
                defaultValue={currentCompany?.exitDate || ''} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="exitValue" className="form-label">Exit Value ($)</label>
              <input 
                type="number" 
                id="exitValue" 
                name="exitValue" 
                className="input" 
                min="0" 
                step="1000" 
                defaultValue={currentCompany?.exitValue || ''} 
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="companyPerformanceRating" className="form-label">Performance Rating</label>
            <select 
              id="companyPerformanceRating" 
              name="companyPerformanceRating" 
              className="input" 
              required 
              defaultValue={currentCompany?.performanceRating || 'On Target'}
            >
              <option value="Outperforming">Outperforming</option>
              <option value="On Target">On Target</option>
              <option value="Underperforming">Underperforming</option>
            </select>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => {
                setShowCompanyModal(false);
                setCurrentCompany(null);
                setIsEditMode(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update Company' : 'Add Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-10 absolute bottom-0 left-0 right-0 py-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;