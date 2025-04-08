import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, Filter, Plus, X, Edit, Trash2, Search, Sun, Moon, ChevronDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types
interface Fund {
  id: string;
  name: string;
  aum: number; // Assets under management in millions
  vintage: number; // Year the fund was raised
  strategy: string;
  irr: number; // Internal rate of return as percentage
  moic: number; // Multiple on invested capital
  tvpi: number; // Total value to paid-in
  dpi: number; // Distributions to paid-in
  rvpi: number; // Residual value to paid-in
  currentStatus: 'Active' | 'Harvesting' | 'Closed';
  performanceData: PerformanceData[];
}

interface PortfolioCompany {
  id: string;
  fundId: string;
  name: string;
  sector: string;
  region: string;
  investmentDate: string;
  investmentAmount: number; // in millions
  valuationMultiple: number;
  currentValue: number; // in millions
  exitStatus: 'Holding' | 'Partial Exit' | 'Exited';
  revenueData: PerformanceData[];
  ebitdaData: PerformanceData[];
}

interface PerformanceData {
  date: string;
  value: number;
}

// Sample colors for charts
const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1',
  '#A4DE6C', '#D0ED57', '#FF66CC', '#7D4CDB'
];

const App: React.FC = () => {
  // State for funds and portfolio companies
  const [funds, setFunds] = useState<Fund[]>([]);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  
  // UI state
  const [activeView, setActiveView] = useState<'dashboard' | 'funds' | 'companies'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [showFundModal, setShowFundModal] = useState<boolean>(false);
  const [showCompanyModal, setShowCompanyModal] = useState<boolean>(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [editingCompany, setEditingCompany] = useState<PortfolioCompany | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fundFilter, setFundFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // New fund form state
  const [newFund, setNewFund] = useState<Omit<Fund, 'id' | 'performanceData'>>(() => ({
    name: '',
    aum: 0,
    vintage: new Date().getFullYear(),
    strategy: '',
    irr: 0,
    moic: 0,
    tvpi: 0,
    dpi: 0,
    rvpi: 0,
    currentStatus: 'Active'
  }));
  
  // New company form state
  const [newCompany, setNewCompany] = useState<Omit<PortfolioCompany, 'id' | 'revenueData' | 'ebitdaData'>>(() => ({
    fundId: '',
    name: '',
    sector: '',
    region: '',
    investmentDate: new Date().toISOString().substring(0, 10),
    investmentAmount: 0,
    valuationMultiple: 0,
    currentValue: 0,
    exitStatus: 'Holding'
  }));

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedFunds = localStorage.getItem('funds');
    const savedCompanies = localStorage.getItem('companies');
    
    if (savedFunds) {
      setFunds(JSON.parse(savedFunds));
    } else {
      // Set sample data if no data exists
      setFunds(generateSampleFunds());
    }
    
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    } else {
      // Set sample data if no data exists
      setTimeout(() => {
        const sampleFunds = generateSampleFunds();
        setCompanies(generateSampleCompanies(sampleFunds));
      }, 100);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (funds.length > 0) {
      localStorage.setItem('funds', JSON.stringify(funds));
    }
  }, [funds]);

  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [companies]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Generate sample funds for initial data
  function generateSampleFunds(): Fund[] {
    return [
      {
        id: '1',
        name: 'Growth Fund I',
        aum: 500,
        vintage: 2018,
        strategy: 'Growth Equity',
        irr: 18.5,
        moic: 2.1,
        tvpi: 1.8,
        dpi: 0.7,
        rvpi: 1.1,
        currentStatus: 'Active',
        performanceData: generatePerformanceData(8, 100, 200)
      },
      {
        id: '2',
        name: 'Buyout Fund III',
        aum: 1200,
        vintage: 2020,
        strategy: 'Leveraged Buyout',
        irr: 22.3,
        moic: 1.8,
        tvpi: 1.5,
        dpi: 0.3,
        rvpi: 1.2,
        currentStatus: 'Active',
        performanceData: generatePerformanceData(6, 120, 220)
      },
      {
        id: '3',
        name: 'Venture Fund II',
        aum: 350,
        vintage: 2019,
        strategy: 'Early Stage Venture',
        irr: 25.7,
        moic: 2.4,
        tvpi: 1.9,
        dpi: 0.5,
        rvpi: 1.4,
        currentStatus: 'Harvesting',
        performanceData: generatePerformanceData(7, 80, 250)
      },
      {
        id: '4',
        name: 'Distressed Fund I',
        aum: 700,
        vintage: 2017,
        strategy: 'Distressed Debt',
        irr: 15.2,
        moic: 1.9,
        tvpi: 1.6,
        dpi: 1.2,
        rvpi: 0.4,
        currentStatus: 'Harvesting',
        performanceData: generatePerformanceData(9, 90, 180)
      },
      {
        id: '5',
        name: 'Infrastructure Fund IV',
        aum: 1500,
        vintage: 2021,
        strategy: 'Infrastructure',
        irr: 11.8,
        moic: 1.4,
        tvpi: 1.3,
        dpi: 0.1,
        rvpi: 1.2,
        currentStatus: 'Active',
        performanceData: generatePerformanceData(5, 150, 180)
      }
    ];
  }

  // Generate sample companies for initial data
  function generateSampleCompanies(funds: Fund[]): PortfolioCompany[] {
    const companies: PortfolioCompany[] = [];
    
    const sectors = ['Technology', 'Healthcare', 'Consumer', 'Industrial', 'Energy', 'Financial Services'];
    const regions = ['North America', 'Europe', 'Asia', 'Latin America', 'Middle East'];
    
    funds.forEach(fund => {
      // Generate 2-4 companies per fund
      const companyCount = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < companyCount; i++) {
        const investmentYear = fund.vintage + Math.floor(Math.random() * 3);
        const investmentMonth = 1 + Math.floor(Math.random() * 11);
        const investmentDay = 1 + Math.floor(Math.random() * 27);
        const investmentDate = `${investmentYear}-${investmentMonth.toString().padStart(2, '0')}-${investmentDay.toString().padStart(2, '0')}`;
        
        const investmentAmount = 10 + Math.floor(Math.random() * 90);
        const valuationMultiple = 1 + Math.random() * 3;
        const currentValue = Math.round(investmentAmount * valuationMultiple * 10) / 10;
        
        companies.push({
          id: `c${companies.length + 1}`,
          fundId: fund.id,
          name: `Portfolio Company ${companies.length + 1}`,
          sector: sectors[Math.floor(Math.random() * sectors.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          investmentDate,
          investmentAmount,
          valuationMultiple,
          currentValue,
          exitStatus: Math.random() > 0.8 ? 'Partial Exit' : Math.random() > 0.95 ? 'Exited' : 'Holding',
          revenueData: generatePerformanceData(12, 10, 100),
          ebitdaData: generatePerformanceData(12, 2, 30)
        });
      }
    });
    
    return companies;
  }

  // Helper function to generate performance data points
  function generatePerformanceData(count: number, min: number, max: number): PerformanceData[] {
    const data: PerformanceData[] = [];
    let currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - count);
    
    let lastValue = min + Math.random() * (max - min) / 2;
    
    for (let i = 0; i < count; i++) {
      // Add some randomness to data trend, but with an overall upward trajectory
      const change = (Math.random() - 0.3) * (max - min) * 0.1;
      lastValue = Math.max(min, Math.min(max, lastValue + change));
      
      currentDate.setMonth(currentDate.getMonth() + 1);
      const dateString = currentDate.toISOString().substring(0, 7); // YYYY-MM format
      
      data.push({
        date: dateString,
        value: Math.round(lastValue * 10) / 10
      });
    }
    
    return data;
  }

  // Add a new fund
  const handleAddFund = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFundItem: Fund = {
      id: `f${Date.now()}`,
      ...newFund,
      performanceData: generatePerformanceData(8, 100, 200)
    };
    
    setFunds([...funds, newFundItem]);
    setShowFundModal(false);
    setNewFund({
      name: '',
      aum: 0,
      vintage: new Date().getFullYear(),
      strategy: '',
      irr: 0,
      moic: 0,
      tvpi: 0,
      dpi: 0,
      rvpi: 0,
      currentStatus: 'Active'
    });
  };

  // Update an existing fund
  const handleUpdateFund = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFund) {
      const updatedFunds = funds.map(fund => 
        fund.id === editingFund.id ? editingFund : fund
      );
      
      setFunds(updatedFunds);
      setShowFundModal(false);
      setEditingFund(null);
    }
  };

  // Delete a fund
  const handleDeleteFund = (id: string) => {
    if (window.confirm('Are you sure you want to delete this fund? This will also delete all associated portfolio companies.')) {
      const updatedFunds = funds.filter(fund => fund.id !== id);
      // Also remove all companies associated with this fund
      const updatedCompanies = companies.filter(company => company.fundId !== id);
      
      setFunds(updatedFunds);
      setCompanies(updatedCompanies);
    }
  };

  // Add a new portfolio company
  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCompanyItem: PortfolioCompany = {
      id: `c${Date.now()}`,
      ...newCompany,
      revenueData: generatePerformanceData(12, 10, 100),
      ebitdaData: generatePerformanceData(12, 2, 30)
    };
    
    setCompanies([...companies, newCompanyItem]);
    setShowCompanyModal(false);
    setNewCompany({
      fundId: '',
      name: '',
      sector: '',
      region: '',
      investmentDate: new Date().toISOString().substring(0, 10),
      investmentAmount: 0,
      valuationMultiple: 0,
      currentValue: 0,
      exitStatus: 'Holding'
    });
  };

  // Update an existing portfolio company
  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      const updatedCompanies = companies.map(company => 
        company.id === editingCompany.id ? editingCompany : company
      );
      
      setCompanies(updatedCompanies);
      setShowCompanyModal(false);
      setEditingCompany(null);
    }
  };

  // Delete a portfolio company
  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio company?')) {
      const updatedCompanies = companies.filter(company => company.id !== id);
      setCompanies(updatedCompanies);
    }
  };

  // Calculate fund-level statistics
  const calculateFundStats = () => {
    const totalAUM = funds.reduce((sum, fund) => sum + fund.aum, 0);
    const avgIRR = funds.length > 0 
      ? funds.reduce((sum, fund) => sum + fund.irr, 0) / funds.length
      : 0;
    const avgMOIC = funds.length > 0
      ? funds.reduce((sum, fund) => sum + fund.moic, 0) / funds.length
      : 0;
    
    // Count by strategy
    const strategyData = funds.reduce((acc: {name: string, value: number}[], fund) => {
      const existingIndex = acc.findIndex(item => item.name === fund.strategy);
      if (existingIndex >= 0) {
        acc[existingIndex].value += fund.aum;
      } else {
        acc.push({ name: fund.strategy, value: fund.aum });
      }
      return acc;
    }, []);
    
    // Count by status
    const statusCounts = funds.reduce((acc: Record<string, number>, fund) => {
      acc[fund.currentStatus] = (acc[fund.currentStatus] || 0) + 1;
      return acc;
    }, {});
    
    return { totalAUM, avgIRR, avgMOIC, strategyData, statusCounts };
  };

  // Calculate company-level statistics
  const calculateCompanyStats = () => {
    const totalInvested = companies.reduce((sum, company) => sum + company.investmentAmount, 0);
    const totalValue = companies.reduce((sum, company) => sum + company.currentValue, 0);
    const unrealizedGain = totalValue - totalInvested;
    const portfolioMOIC = totalInvested > 0 ? totalValue / totalInvested : 0;
    
    // Count by sector
    const sectorData = companies.reduce((acc: {name: string, value: number}[], company) => {
      const existingIndex = acc.findIndex(item => item.name === company.sector);
      if (existingIndex >= 0) {
        acc[existingIndex].value += company.currentValue;
      } else {
        acc.push({ name: company.sector, value: company.currentValue });
      }
      return acc;
    }, []);
    
    // Count by region
    const regionData = companies.reduce((acc: {name: string, value: number}[], company) => {
      const existingIndex = acc.findIndex(item => item.name === company.region);
      if (existingIndex >= 0) {
        acc[existingIndex].value += company.currentValue;
      } else {
        acc.push({ name: company.region, value: company.currentValue });
      }
      return acc;
    }, []);
    
    return { totalInvested, totalValue, unrealizedGain, portfolioMOIC, sectorData, regionData };
  };

  // Handle input change for fund form
  const handleFundInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) : value;
    
    if (editingFund) {
      setEditingFund({ ...editingFund, [name]: processedValue });
    } else {
      setNewFund({ ...newFund, [name]: processedValue });
    }
  };

  // Handle input change for company form
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) : value;
    
    if (editingCompany) {
      setEditingCompany({ ...editingCompany, [name]: processedValue });
    } else {
      setNewCompany({ ...newCompany, [name]: processedValue });
    }
  };

  // Filter functions
  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        fund.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fund.currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFund = fundFilter === 'all' || company.fundId === fundFilter;
    const matchesSector = sectorFilter === 'all' || company.sector === sectorFilter;
    
    return matchesSearch && matchesFund && matchesSector;
  });

  // Get all sectors for filtering
  const allSectors = Array.from(new Set(companies.map(company => company.sector))).filter(Boolean);

  // Get fund stats
  const fundStats = calculateFundStats();
  
  // Get company stats
  const companyStats = calculateCompanyStats();

  // Close modals with Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFundModal) setShowFundModal(false);
        if (showCompanyModal) setShowCompanyModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showFundModal, showCompanyModal]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Private Equity Portfolio Monitor</h1>
            <div className="flex items-center gap-4">
              <button 
                className="theme-toggle" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                {isDarkMode ? <Sun className="h-4 w-4 ml-6" /> : <Moon className="h-4 w-4 ml-1" />}
              </button>
            </div>
          </div>
          <div className="flex mt-4 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-2 font-medium ${activeView === 'dashboard' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeView === 'funds' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveView('funds')}
            >
              Funds
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeView === 'companies' ? 'text-primary-600 border-b-2 border-primary-500 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveView('companies')}
            >
              Portfolio Companies
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total AUM</div>
                <div className="stat-value">${fundStats.totalAUM.toLocaleString()}M</div>
                <div className="stat-desc">Across {funds.length} funds</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Average IRR</div>
                <div className="stat-value">{fundStats.avgIRR.toFixed(1)}%</div>
                <div className="stat-desc">Realized & Unrealized</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Portfolio Value</div>
                <div className="stat-value">${companyStats.totalValue.toLocaleString()}M</div>
                <div className="stat-desc">Across {companies.length} companies</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Portfolio MOIC</div>
                <div className="stat-value">{companyStats.portfolioMOIC.toFixed(2)}x</div>
                <div className="stat-desc">
                  <span className={companyStats.unrealizedGain >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {companyStats.unrealizedGain >= 0 ? '+' : ''}
                    ${companyStats.unrealizedGain.toLocaleString()}M
                  </span>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fund AUM by Strategy */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">AUM by Strategy</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fundStats.strategyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fundStats.strategyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}M`, 'AUM']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Portfolio Value by Sector */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Portfolio Value by Sector</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={companyStats.sectorData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {companyStats.sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}M`, 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Fund Performance Over Time */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Fund Performance Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={funds[0]?.performanceData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}M`, 'Value']} />
                      <Legend />
                      {funds.slice(0, 5).map((fund, index) => (
                        <Line 
                          key={fund.id}
                          type="monotone" 
                          dataKey="value" 
                          data={fund.performanceData}
                          name={fund.name}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Portfolio Value by Region */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Portfolio Value by Region</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyStats.regionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}M`, 'Value']} />
                      <Legend />
                      <Bar dataKey="value" name="Portfolio Value" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Funds View */}
        {activeView === 'funds' && (
          <div className="space-y-6">
            {/* Filters and Add button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search funds..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select 
                    className="input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Harvesting">Harvesting</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <button 
                className="btn btn-primary flex items-center justify-center gap-2"
                onClick={() => {
                  setEditingFund(null);
                  setShowFundModal(true);
                }}
              >
                <Plus className="h-5 w-5" />
                Add Fund
              </button>
            </div>
            
            {/* Funds Table */}
            <div className="table-container overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header py-3">Fund Name</th>
                    <th className="table-header py-3">AUM ($M)</th>
                    <th className="table-header py-3">Vintage</th>
                    <th className="table-header py-3">Strategy</th>
                    <th className="table-header py-3">IRR (%)</th>
                    <th className="table-header py-3">MOIC</th>
                    <th className="table-header py-3">Status</th>
                    <th className="table-header py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredFunds.map(fund => (
                    <tr 
                      key={fund.id} 
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="table-cell font-medium">{fund.name}</td>
                      <td className="table-cell">{fund.aum.toLocaleString()}</td>
                      <td className="table-cell">{fund.vintage}</td>
                      <td className="table-cell">{fund.strategy}</td>
                      <td className="table-cell">{fund.irr.toFixed(1)}%</td>
                      <td className="table-cell">{fund.moic.toFixed(2)}x</td>
                      <td className="table-cell">
                        <span className={`badge ${fund.currentStatus === 'Active' ? 'badge-success' : fund.currentStatus === 'Harvesting' ? 'badge-warning' : 'badge-info'}`}>
                          {fund.currentStatus}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                            onClick={() => {
                              setSelectedFund(fund);
                              setEditingFund(fund);
                              setShowFundModal(true);
                            }}
                            aria-label={`Edit ${fund.name}`}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteFund(fund.id)}
                            aria-label={`Delete ${fund.name}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredFunds.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No funds found matching your filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Companies View */}
        {activeView === 'companies' && (
          <div className="space-y-6">
            {/* Filters and Add button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select 
                      className="input"
                      value={fundFilter}
                      onChange={(e) => setFundFilter(e.target.value)}
                    >
                      <option value="all">All Funds</option>
                      {funds.map(fund => (
                        <option key={fund.id} value={fund.id}>{fund.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select 
                      className="input"
                      value={sectorFilter}
                      onChange={(e) => setSectorFilter(e.target.value)}
                    >
                      <option value="all">All Sectors</option>
                      {allSectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-primary flex items-center justify-center gap-2"
                onClick={() => {
                  setEditingCompany(null);
                  setShowCompanyModal(true);
                }}
                disabled={funds.length === 0}
              >
                <Plus className="h-5 w-5" />
                Add Company
              </button>
            </div>
            
            {/* Companies Table */}
            <div className="table-container overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header py-3">Company Name</th>
                    <th className="table-header py-3">Fund</th>
                    <th className="table-header py-3">Sector</th>
                    <th className="table-header py-3">Region</th>
                    <th className="table-header py-3">Investment ($M)</th>
                    <th className="table-header py-3">Current Value ($M)</th>
                    <th className="table-header py-3">Multiple</th>
                    <th className="table-header py-3">Status</th>
                    <th className="table-header py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredCompanies.map(company => {
                    const fund = funds.find(f => f.id === company.fundId);
                    const multiple = company.currentValue / company.investmentAmount;
                    return (
                      <tr 
                        key={company.id} 
                        className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="table-cell font-medium">{company.name}</td>
                        <td className="table-cell">{fund?.name || 'N/A'}</td>
                        <td className="table-cell">{company.sector}</td>
                        <td className="table-cell">{company.region}</td>
                        <td className="table-cell">{company.investmentAmount.toLocaleString()}</td>
                        <td className="table-cell">{company.currentValue.toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={multiple >= 2 ? 'text-green-600 dark:text-green-400' : multiple >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>
                            {multiple.toFixed(2)}x
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${company.exitStatus === 'Exited' ? 'badge-success' : company.exitStatus === 'Partial Exit' ? 'badge-warning' : 'badge-info'}`}>
                            {company.exitStatus}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                              onClick={() => {
                                setEditingCompany(company);
                                setShowCompanyModal(true);
                              }}
                              aria-label={`Edit ${company.name}`}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteCompany(company.id)}
                              aria-label={`Delete ${company.name}`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredCompanies.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No companies found matching your filters.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Fund Modal */}
      {showFundModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => {
            setShowFundModal(false);
            setEditingFund(null);
          }}
        >
          <div 
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fund-modal-title"
          >
            <div className="modal-header">
              <h3 id="fund-modal-title" className="text-xl font-semibold">
                {editingFund ? 'Edit Fund' : 'Add New Fund'}
              </h3>
              <button 
                onClick={() => {
                  setShowFundModal(false);
                  setEditingFund(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={editingFund ? handleUpdateFund : handleAddFund}>
              <div className="grid grid-cols-1 gap-4 my-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Fund Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input"
                    value={editingFund ? editingFund.name : newFund.name}
                    onChange={handleFundInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="aum">AUM (in $M)</label>
                    <input
                      id="aum"
                      name="aum"
                      type="number"
                      min="0"
                      step="0.1"
                      className="input"
                      value={editingFund ? editingFund.aum : newFund.aum}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="vintage">Vintage Year</label>
                    <input
                      id="vintage"
                      name="vintage"
                      type="number"
                      min="1980"
                      max={new Date().getFullYear()}
                      className="input"
                      value={editingFund ? editingFund.vintage : newFund.vintage}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="strategy">Investment Strategy</label>
                  <input
                    id="strategy"
                    name="strategy"
                    type="text"
                    className="input"
                    value={editingFund ? editingFund.strategy : newFund.strategy}
                    onChange={handleFundInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="irr">IRR (%)</label>
                    <input
                      id="irr"
                      name="irr"
                      type="number"
                      min="-100"
                      max="100"
                      step="0.1"
                      className="input"
                      value={editingFund ? editingFund.irr : newFund.irr}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="moic">MOIC</label>
                    <input
                      id="moic"
                      name="moic"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={editingFund ? editingFund.moic : newFund.moic}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tvpi">TVPI</label>
                    <input
                      id="tvpi"
                      name="tvpi"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={editingFund ? editingFund.tvpi : newFund.tvpi}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="dpi">DPI</label>
                    <input
                      id="dpi"
                      name="dpi"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={editingFund ? editingFund.dpi : newFund.dpi}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="rvpi">RVPI</label>
                    <input
                      id="rvpi"
                      name="rvpi"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={editingFund ? editingFund.rvpi : newFund.rvpi}
                      onChange={handleFundInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currentStatus">Fund Status</label>
                  <select
                    id="currentStatus"
                    name="currentStatus"
                    className="input"
                    value={editingFund ? editingFund.currentStatus : newFund.currentStatus}
                    onChange={handleFundInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Harvesting">Harvesting</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    setShowFundModal(false);
                    setEditingFund(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFund ? 'Update Fund' : 'Add Fund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Company Modal */}
      {showCompanyModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => {
            setShowCompanyModal(false);
            setEditingCompany(null);
          }}
        >
          <div 
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-modal-title"
          >
            <div className="modal-header">
              <h3 id="company-modal-title" className="text-xl font-semibold">
                {editingCompany ? 'Edit Portfolio Company' : 'Add New Portfolio Company'}
              </h3>
              <button 
                onClick={() => {
                  setShowCompanyModal(false);
                  setEditingCompany(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={editingCompany ? handleUpdateCompany : handleAddCompany}>
              <div className="grid grid-cols-1 gap-4 my-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="company-name">Company Name</label>
                  <input
                    id="company-name"
                    name="name"
                    type="text"
                    className="input"
                    value={editingCompany ? editingCompany.name : newCompany.name}
                    onChange={handleCompanyInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="fundId">Fund</label>
                  <select
                    id="fundId"
                    name="fundId"
                    className="input"
                    value={editingCompany ? editingCompany.fundId : newCompany.fundId}
                    onChange={handleCompanyInputChange}
                    required
                  >
                    <option value="" disabled>
                      Select a fund
                    </option>
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="sector">Sector</label>
                    <input
                      id="sector"
                      name="sector"
                      type="text"
                      className="input"
                      value={editingCompany ? editingCompany.sector : newCompany.sector}
                      onChange={handleCompanyInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="region">Region</label>
                    <input
                      id="region"
                      name="region"
                      type="text"
                      className="input"
                      value={editingCompany ? editingCompany.region : newCompany.region}
                      onChange={handleCompanyInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="investmentDate">Investment Date</label>
                  <input
                    id="investmentDate"
                    name="investmentDate"
                    type="date"
                    className="input"
                    value={editingCompany ? editingCompany.investmentDate : newCompany.investmentDate}
                    onChange={handleCompanyInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="investmentAmount">Investment Amount ($M)</label>
                    <input
                      id="investmentAmount"
                      name="investmentAmount"
                      type="number"
                      min="0"
                      step="0.1"
                      className="input"
                      value={editingCompany ? editingCompany.investmentAmount : newCompany.investmentAmount}
                      onChange={handleCompanyInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="currentValue">Current Value ($M)</label>
                    <input
                      id="currentValue"
                      name="currentValue"
                      type="number"
                      min="0"
                      step="0.1"
                      className="input"
                      value={editingCompany ? editingCompany.currentValue : newCompany.currentValue}
                      onChange={handleCompanyInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="valuationMultiple">Valuation Multiple</label>
                  <input
                    id="valuationMultiple"
                    name="valuationMultiple"
                    type="number"
                    min="0"
                    step="0.1"
                    className="input"
                    value={editingCompany ? editingCompany.valuationMultiple : newCompany.valuationMultiple}
                    onChange={handleCompanyInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="exitStatus">Exit Status</label>
                  <select
                    id="exitStatus"
                    name="exitStatus"
                    className="input"
                    value={editingCompany ? editingCompany.exitStatus : newCompany.exitStatus}
                    onChange={handleCompanyInputChange}
                    required
                  >
                    <option value="Holding">Holding</option>
                    <option value="Partial Exit">Partial Exit</option>
                    <option value="Exited">Exited</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    setShowCompanyModal(false);
                    setEditingCompany(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCompany ? 'Update Company' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm theme-transition mt-auto py-4">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
