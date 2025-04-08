import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Briefcase, TrendingUp, TrendingDown, BarChart2, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
  Filter, Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, X, Settings, Moon, Sun
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types
interface Fund {
  id: string;
  name: string;
  aum: number; // Assets under management (in millions)
  vintage: number; // Fund vintage year
  strategy: string;
  irr: number; // Internal Rate of Return
  moic: number; // Multiple on Invested Capital
  distributions: number; // Total distributions (in millions)
  status: 'active' | 'fundraising' | 'closed';
  companies: string[]; // Array of portfolio company IDs
  quarterlyPerformance: QuarterlyPerformance[];
}

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  investmentAmount: number; // In millions
  currentValuation: number; // In millions
  revenue: number; // Annual revenue in millions
  ebitda: number; // Earnings before interest, taxes, depreciation, and amortization
  status: 'active' | 'exited' | 'distressed';
  exitDate?: string;
  exitValue?: number;
  profitLoss?: number;
  growthRate: number;
  fundId: string; // ID of the parent fund
  quarterlyPerformance: QuarterlyPerformance[];
}

interface QuarterlyPerformance {
  quarter: string; // Format: "Q1 2023", "Q2 2023", etc.
  value: number; // Relevant value (could be AUM, revenue, etc.)
  growthRate?: number; // Optional quarter-over-quarter growth rate
}

interface FundModalData {
  id: string;
  name: string;
  aum: number;
  vintage: number;
  strategy: string;
  irr: number;
  moic: number;
  distributions: number;
  status: 'active' | 'fundraising' | 'closed';
}

interface CompanyModalData {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  investmentAmount: number;
  currentValuation: number;
  revenue: number;
  ebitda: number;
  status: 'active' | 'exited' | 'distressed';
  exitDate?: string;
  exitValue?: number;
  growthRate: number;
  fundId: string;
}

type TabType = 'dashboard' | 'funds' | 'companies' | 'performance';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface FilterConfig {
  funds: {
    status: string[];
    vintage: number[];
    strategy: string[];
  };
  companies: {
    sector: string[];
    status: string[];
    fundId: string[];
  };
}

interface PeriodOption {
  label: string;
  value: string;
}

const App: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // State for funds and companies
  const [funds, setFunds] = useState<Fund[]>([]);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);

  // State for modals
  const [isFundModalOpen, setIsFundModalOpen] = useState<boolean>(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);
  const [fundModalData, setFundModalData] = useState<FundModalData>({
    id: '',
    name: '',
    aum: 0,
    vintage: new Date().getFullYear(),
    strategy: '',
    irr: 0,
    moic: 0,
    distributions: 0,
    status: 'active',
  });
  const [companyModalData, setCompanyModalData] = useState<CompanyModalData>({
    id: '',
    name: '',
    sector: '',
    investmentDate: '',
    investmentAmount: 0,
    currentValuation: 0,
    revenue: 0,
    ebitda: 0,
    status: 'active',
    growthRate: 0,
    fundId: '',
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    funds: {
      status: [],
      vintage: [],
      strategy: [],
    },
    companies: {
      sector: [],
      status: [],
      fundId: [],
    },
  });

  // State for dashboard metrics
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1Y');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Refs for modal handling and click outside
  const fundModalRef = useRef<HTMLDivElement>(null);
  const companyModalRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Available period options
  const periodOptions: PeriodOption[] = [
    { label: '3 Months', value: '3M' },
    { label: '6 Months', value: '6M' },
    { label: '1 Year', value: '1Y' },
    { label: '3 Years', value: '3Y' },
    { label: '5 Years', value: '5Y' },
    { label: 'All Time', value: 'ALL' },
  ];

  // Load demo data on first render
  useEffect(() => {
    const savedFunds = localStorage.getItem('funds');
    const savedCompanies = localStorage.getItem('companies');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedFunds) {
      setFunds(JSON.parse(savedFunds));
    } else {
      setFunds(generateDemoFunds());
    }

    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    } else {
      setCompanies(generateDemoCompanies());
    }

    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      // Default to system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('funds', JSON.stringify(funds));
  }, [funds]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Handle escape key press to close modals
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFundModalOpen(false);
        setIsCompanyModalOpen(false);
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Handle click outside to close modals and filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFundModalOpen && fundModalRef.current && !fundModalRef.current.contains(event.target as Node)) {
        setIsFundModalOpen(false);
      }
      if (isCompanyModalOpen && companyModalRef.current && !companyModalRef.current.contains(event.target as Node)) {
        setIsCompanyModalOpen(false);
      }
      if (isFilterOpen && filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFundModalOpen, isCompanyModalOpen, isFilterOpen]);

  // Get unique values for filters
  const getUniqueStrategies = () => {
    return [...new Set(funds.map(fund => fund.strategy))];
  };

  const getUniqueVintages = () => {
    return [...new Set(funds.map(fund => fund.vintage))].sort((a, b) => a - b);
  };

  const getUniqueSectors = () => {
    return [...new Set(companies.map(company => company.sector))];
  };

  // Generate unique ID
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Generate quarterly performance data
  const generateQuarterlyData = (length: number, baseValue: number, volatility: number): QuarterlyPerformance[] => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const currentYear = new Date().getFullYear();
    const data: QuarterlyPerformance[] = [];
    
    let value = baseValue;
    
    for (let i = 0; i < length; i++) {
      const yearOffset = Math.floor(i / 4);
      const year = currentYear - Math.floor((length - i - 1) / 4);
      const quarterIndex = (i % 4);
      const quarter = quarters[quarterIndex];
      
      // Random change with volatility factor
      const change = (Math.random() - 0.3) * volatility * baseValue;
      value = Math.max(value + change, baseValue * 0.5); // Ensure value doesn't go too low
      
      const prevValue = data[i-1]?.value || value - change;
      const growthRate = ((value - prevValue) / prevValue) * 100;
      
      data.push({
        quarter: `${quarter} ${year}`,
        value: Number(value.toFixed(2)),
        growthRate: Number(growthRate.toFixed(2))
      });
    }
    
    return data;
  };

  // Generate demo funds and companies data
  const generateDemoFunds = (): Fund[] => {
    return [
      {
        id: 'fund-1',
        name: 'Growth Equity Fund I',
        aum: 250,
        vintage: 2018,
        strategy: 'Growth Equity',
        irr: 18.5,
        moic: 2.1,
        distributions: 75,
        status: 'active',
        companies: ['company-1', 'company-2', 'company-3'],
        quarterlyPerformance: generateQuarterlyData(16, 200, 0.05),
      },
      {
        id: 'fund-2',
        name: 'Venture Capital Fund II',
        aum: 180,
        vintage: 2020,
        strategy: 'Venture Capital',
        irr: 22.7,
        moic: 1.8,
        distributions: 25,
        status: 'active',
        companies: ['company-4', 'company-5'],
        quarterlyPerformance: generateQuarterlyData(12, 150, 0.08),
      },
      {
        id: 'fund-3',
        name: 'Buyout Fund III',
        aum: 500,
        vintage: 2016,
        strategy: 'Buyout',
        irr: 15.3,
        moic: 2.4,
        distributions: 200,
        status: 'active',
        companies: ['company-6', 'company-7', 'company-8', 'company-9'],
        quarterlyPerformance: generateQuarterlyData(20, 400, 0.04),
      },
      {
        id: 'fund-4',
        name: 'Special Situations Fund',
        aum: 120,
        vintage: 2019,
        strategy: 'Special Situations',
        irr: 13.8,
        moic: 1.6,
        distributions: 40,
        status: 'active',
        companies: ['company-10'],
        quarterlyPerformance: generateQuarterlyData(14, 100, 0.06),
      },
      {
        id: 'fund-5',
        name: 'Tech Growth Fund IV',
        aum: 300,
        vintage: 2021,
        strategy: 'Growth Equity',
        irr: 25.1,
        moic: 1.3,
        distributions: 0, // New fund, no distributions yet
        status: 'fundraising',
        companies: [],
        quarterlyPerformance: generateQuarterlyData(8, 250, 0.07),
      },
    ];
  };

  const generateDemoCompanies = (): PortfolioCompany[] => {
    return [
      {
        id: 'company-1',
        name: 'TechCloud Solutions',
        sector: 'SaaS',
        investmentDate: '2018-05-15',
        investmentAmount: 25,
        currentValuation: 75,
        revenue: 30,
        ebitda: 6,
        status: 'active',
        growthRate: 32.5,
        fundId: 'fund-1',
        quarterlyPerformance: generateQuarterlyData(16, 20, 0.1),
      },
      {
        id: 'company-2',
        name: 'HealthTech Innovations',
        sector: 'Healthcare',
        investmentDate: '2018-08-23',
        investmentAmount: 18,
        currentValuation: 45,
        revenue: 22,
        ebitda: 3.5,
        status: 'active',
        growthRate: 25.0,
        fundId: 'fund-1',
        quarterlyPerformance: generateQuarterlyData(16, 15, 0.08),
      },
      {
        id: 'company-3',
        name: 'GreenEnergy Systems',
        sector: 'CleanTech',
        investmentDate: '2019-02-11',
        investmentAmount: 20,
        currentValuation: 18,
        revenue: 12,
        ebitda: -1.5,
        status: 'distressed',
        growthRate: -8.2,
        fundId: 'fund-1',
        quarterlyPerformance: generateQuarterlyData(14, 22, 0.15),
      },
      {
        id: 'company-4',
        name: 'AI Analytics Platform',
        sector: 'AI/ML',
        investmentDate: '2020-04-05',
        investmentAmount: 12,
        currentValuation: 40,
        revenue: 15,
        ebitda: 1.8,
        status: 'active',
        growthRate: 68.3,
        fundId: 'fund-2',
        quarterlyPerformance: generateQuarterlyData(12, 10, 0.12),
      },
      {
        id: 'company-5',
        name: 'FinTech Payment Solutions',
        sector: 'FinTech',
        investmentDate: '2020-10-18',
        investmentAmount: 15,
        currentValuation: 35,
        revenue: 18,
        ebitda: 2.2,
        status: 'active',
        growthRate: 45.7,
        fundId: 'fund-2',
        quarterlyPerformance: generateQuarterlyData(10, 12, 0.1),
      },
      {
        id: 'company-6',
        name: 'Industrial Manufacturing Co.',
        sector: 'Manufacturing',
        investmentDate: '2016-06-30',
        investmentAmount: 80,
        currentValuation: 160,
        revenue: 95,
        ebitda: 25,
        status: 'active',
        growthRate: 12.4,
        fundId: 'fund-3',
        quarterlyPerformance: generateQuarterlyData(20, 70, 0.05),
      },
      {
        id: 'company-7',
        name: 'Retail Chain Group',
        sector: 'Retail',
        investmentDate: '2017-01-15',
        investmentAmount: 65,
        currentValuation: 95,
        revenue: 120,
        ebitda: 18,
        status: 'active',
        growthRate: 8.5,
        fundId: 'fund-3',
        quarterlyPerformance: generateQuarterlyData(18, 60, 0.04),
      },
      {
        id: 'company-8',
        name: 'Logistics Solutions Inc.',
        sector: 'Logistics',
        investmentDate: '2017-08-22',
        investmentAmount: 50,
        currentValuation: 120,
        revenue: 85,
        ebitda: 22,
        status: 'active',
        growthRate: 18.9,
        fundId: 'fund-3',
        quarterlyPerformance: generateQuarterlyData(18, 45, 0.06),
      },
      {
        id: 'company-9',
        name: 'Consumer Brands Holdings',
        sector: 'Consumer',
        investmentDate: '2018-03-10',
        investmentAmount: 75,
        exitDate: '2022-04-18',
        exitValue: 180,
        profitLoss: 105,
        revenue: 110,
        ebitda: 30,
        currentValuation: 180,
        status: 'exited',
        growthRate: 22.5,
        fundId: 'fund-3',
        quarterlyPerformance: generateQuarterlyData(16, 70, 0.07),
      },
      {
        id: 'company-10',
        name: 'Restructuring Opportunities LLC',
        sector: 'Real Estate',
        investmentDate: '2019-11-08',
        investmentAmount: 35,
        currentValuation: 55,
        revenue: 28,
        ebitda: 8,
        status: 'active',
        growthRate: 15.7,
        fundId: 'fund-4',
        quarterlyPerformance: generateQuarterlyData(12, 30, 0.08),
      },
    ];
  };

  // Fund CRUD operations
  const addFund = () => {
    const quarterlyData = generateQuarterlyData(8, fundModalData.aum * 0.9, 0.05);
    const newFund: Fund = {
      ...fundModalData,
      id: generateId(),
      companies: [],
      quarterlyPerformance: quarterlyData,
    };
    setFunds([...funds, newFund]);
    setIsFundModalOpen(false);
    resetFundModalData();
  };

  const updateFund = () => {
    const updatedFunds = funds.map(fund => 
      fund.id === fundModalData.id ? { ...fund, ...fundModalData } : fund
    );
    setFunds(updatedFunds);
    setIsFundModalOpen(false);
    resetFundModalData();
  };

  const deleteFund = (id: string) => {
    // First remove all companies associated with this fund
    const updatedCompanies = companies.filter(company => company.fundId !== id);
    setCompanies(updatedCompanies);
    
    // Then remove the fund
    const updatedFunds = funds.filter(fund => fund.id !== id);
    setFunds(updatedFunds);
  };

  // Company CRUD operations
  const addCompany = () => {
    const quarterlyData = generateQuarterlyData(8, companyModalData.currentValuation * 0.8, 0.1);
    const newCompany: PortfolioCompany = {
      ...companyModalData,
      id: generateId(),
      quarterlyPerformance: quarterlyData,
    };
    setCompanies([...companies, newCompany]);
    
    // Update the fund to include this new company
    const updatedFunds = funds.map(fund => {
      if (fund.id === companyModalData.fundId) {
        return {
          ...fund,
          companies: [...fund.companies, newCompany.id]
        };
      }
      return fund;
    });
    setFunds(updatedFunds);
    
    setIsCompanyModalOpen(false);
    resetCompanyModalData();
  };

  const updateCompany = () => {
    // Check if company is being moved to a different fund
    const company = companies.find(c => c.id === companyModalData.id);
    
    if (company && company.fundId !== companyModalData.fundId) {
      // Remove company from old fund
      const oldFund = funds.find(f => f.id === company.fundId);
      if (oldFund) {
        const updatedOldFund = {
          ...oldFund,
          companies: oldFund.companies.filter(id => id !== company.id)
        };
        
        // Add company to new fund
        const newFund = funds.find(f => f.id === companyModalData.fundId);
        if (newFund) {
          const updatedNewFund = {
            ...newFund,
            companies: [...newFund.companies, company.id]
          };
          
          // Update funds
          const updatedFunds = funds.map(fund => {
            if (fund.id === oldFund.id) return updatedOldFund;
            if (fund.id === newFund.id) return updatedNewFund;
            return fund;
          });
          
          setFunds(updatedFunds);
        }
      }
    }
    
    // Update the company
    const updatedCompanies = companies.map(company => 
      company.id === companyModalData.id ? { ...company, ...companyModalData } : company
    );
    setCompanies(updatedCompanies);
    setIsCompanyModalOpen(false);
    resetCompanyModalData();
  };

  const deleteCompany = (id: string) => {
    // Find the company to remove
    const companyToDelete = companies.find(company => company.id === id);
    
    if (companyToDelete) {
      // Remove the company from its fund
      const updatedFunds = funds.map(fund => {
        if (fund.id === companyToDelete.fundId) {
          return {
            ...fund,
            companies: fund.companies.filter(companyId => companyId !== id)
          };
        }
        return fund;
      });
      
      setFunds(updatedFunds);
    }
    
    // Remove the company
    const updatedCompanies = companies.filter(company => company.id !== id);
    setCompanies(updatedCompanies);
  };

  // Modal helpers
  const openAddFundModal = () => {
    resetFundModalData();
    setIsEditMode(false);
    setIsFundModalOpen(true);
  };

  const openEditFundModal = (fund: Fund) => {
    setFundModalData({
      id: fund.id,
      name: fund.name,
      aum: fund.aum,
      vintage: fund.vintage,
      strategy: fund.strategy,
      irr: fund.irr,
      moic: fund.moic,
      distributions: fund.distributions,
      status: fund.status,
    });
    setIsEditMode(true);
    setIsFundModalOpen(true);
  };

  const openAddCompanyModal = () => {
    resetCompanyModalData();
    
    // Set default fund if available
    if (funds.length > 0) {
      setCompanyModalData(prev => ({
        ...prev,
        fundId: funds[0].id,
        investmentDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      }));
    }
    
    setIsEditMode(false);
    setIsCompanyModalOpen(true);
  };

  const openEditCompanyModal = (company: PortfolioCompany) => {
    setCompanyModalData({
      id: company.id,
      name: company.name,
      sector: company.sector,
      investmentDate: company.investmentDate,
      investmentAmount: company.investmentAmount,
      currentValuation: company.currentValuation,
      revenue: company.revenue,
      ebitda: company.ebitda,
      status: company.status,
      exitDate: company.exitDate || '',
      exitValue: company.exitValue || 0,
      growthRate: company.growthRate,
      fundId: company.fundId,
    });
    setIsEditMode(true);
    setIsCompanyModalOpen(true);
  };

  const resetFundModalData = () => {
    setFundModalData({
      id: '',
      name: '',
      aum: 0,
      vintage: new Date().getFullYear(),
      strategy: '',
      irr: 0,
      moic: 0,
      distributions: 0,
      status: 'active',
    });
  };

  const resetCompanyModalData = () => {
    setCompanyModalData({
      id: '',
      name: '',
      sector: '',
      investmentDate: '',
      investmentAmount: 0,
      currentValuation: 0,
      revenue: 0,
      ebitda: 0,
      status: 'active',
      growthRate: 0,
      fundId: '',
    });
  };

  // Filter and sort helpers
  const handleSortChange = (key: string) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (type: 'funds' | 'companies', category: string, value: string | number) => {
    setFilterConfig(prevConfig => {
      const updatedConfig = { ...prevConfig };
      
      // @ts-ignore: category is a valid key
      const currentValues = [...updatedConfig[type][category]];
      const valueIndex = currentValues.indexOf(value);
      
      if (valueIndex === -1) {
        currentValues.push(value);
      } else {
        currentValues.splice(valueIndex, 1);
      }
      
      // @ts-ignore: category is a valid key
      updatedConfig[type][category] = currentValues;
      
      return updatedConfig;
    });
  };

  const clearFilters = () => {
    setFilterConfig({
      funds: {
        status: [],
        vintage: [],
        strategy: [],
      },
      companies: {
        sector: [],
        status: [],
        fundId: [],
      },
    });
  };

  // Apply filters and sort
  const filteredFunds = funds.filter(fund => {
    const { status, vintage, strategy } = filterConfig.funds;
    
    const statusMatch = status.length === 0 || status.includes(fund.status);
    const vintageMatch = vintage.length === 0 || vintage.includes(fund.vintage);
    const strategyMatch = strategy.length === 0 || strategy.includes(fund.strategy);
    const searchMatch = fund.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && vintageMatch && strategyMatch && searchMatch;
  }).sort((a, b) => {
    const { key, direction } = sortConfig;
    const aValue = a[key as keyof Fund];
    const bValue = b[key as keyof Fund];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return direction === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    }
  });

  const filteredCompanies = companies.filter(company => {
    const { sector, status, fundId } = filterConfig.companies;
    
    const sectorMatch = sector.length === 0 || sector.includes(company.sector);
    const statusMatch = status.length === 0 || status.includes(company.status);
    const fundMatch = fundId.length === 0 || fundId.includes(company.fundId);
    const searchMatch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return sectorMatch && statusMatch && fundMatch && searchMatch;
  }).sort((a, b) => {
    const { key, direction } = sortConfig;
    const aValue = a[key as keyof PortfolioCompany];
    const bValue = b[key as keyof PortfolioCompany];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return direction === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    }
  });

  // Calculate dashboard metrics
  const totalAUM = funds.reduce((sum, fund) => sum + fund.aum, 0);
  const totalCompanies = companies.length;
  const avgIRR = funds.length > 0 
    ? funds.reduce((sum, fund) => sum + fund.irr, 0) / funds.length 
    : 0;
  const avgMOIC = funds.length > 0 
    ? funds.reduce((sum, fund) => sum + fund.moic, 0) / funds.length 
    : 0;
  const totalDistributions = funds.reduce((sum, fund) => sum + fund.distributions, 0);

  const exitedCompanies = companies.filter(company => company.status === 'exited');
  const totalReturns = exitedCompanies.reduce((sum, company) => sum + (company.profitLoss || 0), 0);
  const totalInvested = companies.reduce((sum, company) => sum + company.investmentAmount, 0);
  const portfolioValue = companies.filter(company => company.status !== 'exited')
    .reduce((sum, company) => sum + company.currentValuation, 0);

  // Prepare data for charts
  const preparePerformanceData = (period: string) => {
    let quarters = 0;
    
    switch (period) {
      case '3M':
        quarters = 1;
        break;
      case '6M':
        quarters = 2;
        break;
      case '1Y':
        quarters = 4;
        break;
      case '3Y':
        quarters = 12;
        break;
      case '5Y':
        quarters = 20;
        break;
      default: // ALL
        quarters = 100; // All available data
    }
    
    // Get performance data for funds
    const fundsPerformance = funds.map(fund => {
      const data = fund.quarterlyPerformance.slice(-quarters);
      return {
        id: fund.id,
        name: fund.name,
        data: data,
      };
    });
    
    return fundsPerformance;
  };

  const performanceData = preparePerformanceData(selectedPeriod);

  // Prepare sector allocation data
  const sectorAllocationData = getUniqueSectors().map(sector => {
    const sectorCompanies = companies.filter(company => company.sector === sector && company.status !== 'exited');
    const sectorValue = sectorCompanies.reduce((sum, company) => sum + company.currentValuation, 0);
    return {
      sector,
      value: sectorValue,
    };
  });

  // Prepare vintage distribution data
  const vintageDistributionData = getUniqueVintages().map(vintage => {
    const vintageFunds = funds.filter(fund => fund.vintage === vintage);
    const vintageAUM = vintageFunds.reduce((sum, fund) => sum + fund.aum, 0);
    return {
      vintage: vintage.toString(),
      aum: vintageAUM,
    };
  });

  // Prepare exit multiples data for exited companies
  const exitMultiplesData = exitedCompanies.map(company => {
    const multiple = (company.exitValue || 0) / company.investmentAmount;
    return {
      name: company.name,
      multiple: Number(multiple.toFixed(2)),
    };
  }).sort((a, b) => b.multiple - a.multiple);

  // COLORS
  const CHART_COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#e11d48', '#ea580c',
    '#16a34a', '#059669', '#0891b2', '#4338ca', '#7e22ce'
  ];
  
  const SECTOR_COLORS = {
    'SaaS': '#2563eb',
    'Healthcare': '#7c3aed',
    'CleanTech': '#16a34a',
    'AI/ML': '#06b6d4',
    'FinTech': '#eab308',
    'Manufacturing': '#ea580c',
    'Retail': '#db2777',
    'Logistics': '#4338ca',
    'Consumer': '#ef4444',
    'Real Estate': '#059669'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                Private Equity Portfolio Monitor
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <button
                  className="theme-toggle"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb">
                    {isDarkMode ? (
                      <Moon className="h-3 w-3 text-gray-800" />
                    ) : (
                      <Sun className="h-3 w-3 text-amber-500" />
                    )}
                  </span>
                </button>
              </div>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setActiveTab('dashboard')}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex mt-6 border-b border-gray-200 dark:border-slate-700">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-600 dark:text-slate-400'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'funds' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-600 dark:text-slate-400'}`}
              onClick={() => setActiveTab('funds')}
            >
              Funds
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'companies' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-600 dark:text-slate-400'}`}
              onClick={() => setActiveTab('companies')}
            >
              Portfolio Companies
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'performance' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-600 dark:text-slate-400'}`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-title">Total AUM</span>
                  <Briefcase className="h-5 w-5 text-primary-500" />
                </div>
                <div className="stat-value">${totalAUM.toFixed(1)}M</div>
                <div className="stat-desc flex items-center">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {(funds.length > 0 ? funds[0].quarterlyPerformance[funds[0].quarterlyPerformance.length - 1].growthRate : 0).toFixed(1)}%
                  </span>
                  <span className="ml-1">from last quarter</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-title">Avg. Fund IRR</span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="stat-value">{avgIRR.toFixed(1)}%</div>
                <div className="stat-desc">{funds.length} active funds</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-title">Portfolio Companies</span>
                  <Briefcase className="h-5 w-5 text-primary-500" />
                </div>
                <div className="stat-value">{totalCompanies}</div>
                <div className="stat-desc">
                  {exitedCompanies.length} exited, {companies.filter(c => c.status === 'distressed').length} distressed
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-title">Total Distributions</span>
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                </div>
                <div className="stat-value">${totalDistributions.toFixed(1)}M</div>
                <div className="stat-desc">MOIC: {avgMOIC.toFixed(1)}x</div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Fund Performance Over Time</h2>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  {periodOptions.map(option => (
                    <button
                      key={option.value}
                      className={`px-2 py-1 text-xs rounded-md ${selectedPeriod === option.value ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}
                      onClick={() => setSelectedPeriod(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="quarter" 
                      type="category" 
                      allowDuplicatedCategory={false} 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Value ($M)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: isDarkMode ? '#94a3b8' : '#64748b' }
                      }} 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                      }}
                    />
                    <Legend />
                    {performanceData.map((fund, index) => (
                      <Line
                        key={fund.id}
                        dataKey="value"
                        name={fund.name}
                        data={fund.data}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Allocation */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Portfolio by Sector</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="value"
                        nameKey="sector"
                        label={({ sector, percent }) => `${sector} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sectorAllocationData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={SECTOR_COLORS[entry.sector as keyof typeof SECTOR_COLORS] || CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value}M`, 'Value']}
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          color: isDarkMode ? '#e2e8f0' : '#1f2937',
                          borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fund Vintage Distribution */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AUM by Vintage Year</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vintageDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="vintage" 
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'AUM ($M)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: isDarkMode ? '#94a3b8' : '#64748b' }
                        }}
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value}M`, 'AUM']}
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          color: isDarkMode ? '#e2e8f0' : '#1f2937',
                          borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                        }}
                      />
                      <Bar dataKey="aum" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            {exitMultiplesData.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exit Multiples</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={exitMultiplesData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number"
                        domain={[0, 'dataMax + 1']} 
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}x`, 'Multiple']}
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          color: isDarkMode ? '#e2e8f0' : '#1f2937',
                          borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                        }}
                      />
                      <Bar dataKey="multiple" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Funds Tab */}
        {activeTab === 'funds' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Funds</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-4 w-4" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search funds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <button
                    className="btn btn-secondary flex items-center gap-2"
                    onClick={toggleFilter}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                  
                  {isFilterOpen && (
                    <div 
                      ref={filterPanelRef}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-md shadow-lg overflow-hidden z-10 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
                          <button 
                            className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                            onClick={clearFilters}
                          >
                            Clear all
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</h4>
                            <div className="space-y-1">
                              {['active', 'fundraising', 'closed'].map(status => (
                                <label key={status} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                    checked={filterConfig.funds.status.includes(status)}
                                    onChange={() => handleFilterChange('funds', 'status', status)}
                                  />
                                  <span className="ml-2 text-gray-700 dark:text-slate-300 capitalize">{status}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Vintage Year</h4>
                            <div className="space-y-1">
                              {getUniqueVintages().map(year => (
                                <label key={year} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                    checked={filterConfig.funds.vintage.includes(year)}
                                    onChange={() => handleFilterChange('funds', 'vintage', year)}
                                  />
                                  <span className="ml-2 text-gray-700 dark:text-slate-300">{year}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Strategy</h4>
                            <div className="space-y-1">
                              {getUniqueStrategies().map(strategy => (
                                <label key={strategy} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                    checked={filterConfig.funds.strategy.includes(strategy)}
                                    onChange={() => handleFilterChange('funds', 'strategy', strategy)}
                                  />
                                  <span className="ml-2 text-gray-700 dark:text-slate-300">{strategy}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={openAddFundModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Fund
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('name')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Fund Name
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('aum')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        AUM ($M)
                        {sortConfig.key === 'aum' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('vintage')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Vintage
                        {sortConfig.key === 'vintage' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('strategy')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Strategy
                        {sortConfig.key === 'strategy' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('irr')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        IRR (%)
                        {sortConfig.key === 'irr' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('moic')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        MOIC
                        {sortConfig.key === 'moic' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('status')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredFunds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-cell text-center py-4 text-gray-500 dark:text-slate-400">
                        No funds found. Add a new fund to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredFunds.map(fund => (
                      <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="table-cell font-medium text-gray-900 dark:text-white">{fund.name}</td>
                        <td className="table-cell">${fund.aum.toFixed(1)}M</td>
                        <td className="table-cell">{fund.vintage}</td>
                        <td className="table-cell">{fund.strategy}</td>
                        <td className="table-cell">
                          <span className={`font-medium ${fund.irr >= 15 ? 'text-green-600 dark:text-green-400' : fund.irr <= 5 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {fund.irr.toFixed(1)}%
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`font-medium ${fund.moic >= 2 ? 'text-green-600 dark:text-green-400' : fund.moic <= 1 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {fund.moic.toFixed(1)}x
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${fund.status === 'active' ? 'badge-success' : fund.status === 'fundraising' ? 'badge-info' : 'badge-warning'}`}>
                            {fund.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                              onClick={() => openEditFundModal(fund)}
                              aria-label={`Edit ${fund.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => deleteFund(fund.id)}
                              aria-label={`Delete ${fund.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Portfolio Companies Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Companies</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-4 w-4" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <button
                    className="btn btn-secondary flex items-center gap-2"
                    onClick={toggleFilter}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                  
                  {isFilterOpen && (
                    <div 
                      ref={filterPanelRef}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-md shadow-lg overflow-hidden z-10 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
                          <button 
                            className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                            onClick={clearFilters}
                          >
                            Clear all
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sector</h4>
                            <div className="space-y-1">
                              {getUniqueSectors().map(sector => (
                                <label key={sector} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                    checked={filterConfig.companies.sector.includes(sector)}
                                    onChange={() => handleFilterChange('companies', 'sector', sector)}
                                  />
                                  <span className="ml-2 text-gray-700 dark:text-slate-300">{sector}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</h4>
                            <div className="space-y-1">
                              {['active', 'exited', 'distressed'].map(status => (
                                <label key={status} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                    checked={filterConfig.companies.status.includes(status)}
                                    onChange={() => handleFilterChange('companies', 'status', status)}
                                  />
                                  <span className="ml-2 text-gray-700 dark:text-slate-300 capitalize">{status}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fund</h4>
                            <div className="space-y-1">
                              {funds.map(fund => (
                                <label key={fund.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                    checked={filterConfig.companies.fundId.includes(fund.id)}
                                    onChange={() => handleFilterChange('companies', 'fundId', fund.id)}
                                  />
                                  <span className="ml-2 text-gray-700 dark:text-slate-300">{fund.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={openAddCompanyModal}
                >
                  <Plus className="h-4 w-4" />
                  Add Company
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('name')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Company Name
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('sector')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Sector
                        {sortConfig.key === 'sector' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('fundId')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Fund
                        {sortConfig.key === 'fundId' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('investmentAmount')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Investment ($M)
                        {sortConfig.key === 'investmentAmount' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('currentValuation')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Current Value ($M)
                        {sortConfig.key === 'currentValuation' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('growthRate')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Growth (%)
                        {sortConfig.key === 'growthRate' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3" onClick={() => handleSortChange('status')}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-cell text-center py-4 text-gray-500 dark:text-slate-400">
                        No companies found. Add a new company to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map(company => (
                      <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="table-cell font-medium text-gray-900 dark:text-white">{company.name}</td>
                        <td className="table-cell">{company.sector}</td>
                        <td className="table-cell">
                          {funds.find(fund => fund.id === company.fundId)?.name || 'Unknown Fund'}
                        </td>
                        <td className="table-cell">${company.investmentAmount.toFixed(1)}M</td>
                        <td className="table-cell">${company.currentValuation.toFixed(1)}M</td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            {company.growthRate > 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`${company.growthRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-medium`}>
                              {company.growthRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${company.status === 'active' ? 'badge-success' : company.status === 'exited' ? 'badge-info' : 'badge-error'}`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                              onClick={() => openEditCompanyModal(company)}
                              aria-label={`Edit ${company.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => deleteCompany(company.id)}
                              aria-label={`Delete ${company.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Analysis</h2>
            
            {/* Period Selector */}
            <div className="flex flex-wrap gap-2">
              {periodOptions.map(option => (
                <button
                  key={option.value}
                  className={`px-3 py-2 rounded-md ${selectedPeriod === option.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Fund Performance Chart */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fund Value Evolution</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                    <defs>
                      {performanceData.map((fund, index) => (
                        <linearGradient key={fund.id} id={`color-${fund.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="quarter" 
                      type="category" 
                      allowDuplicatedCategory={false}
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Value ($M)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: isDarkMode ? '#94a3b8' : '#64748b' }
                      }}
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                      }}
                    />
                    <Legend />
                    {performanceData.map((fund, index) => (
                      <Area
                        key={fund.id}
                        type="monotone"
                        dataKey="value"
                        name={fund.name}
                        data={fund.data}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        fillOpacity={1}
                        fill={`url(#color-${fund.id})`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Investment vs Current Value */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investment vs Current Value</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={companies.filter(company => company.status !== 'exited').slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Value ($M)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: isDarkMode ? '#94a3b8' : '#64748b' }
                      }}
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}M`, '']}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="investmentAmount" name="Investment" fill="#3b82f6" />
                    <Bar dataKey="currentValuation" name="Current Value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Revenue vs EBITDA */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue vs EBITDA</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={companies.filter(company => company.status !== 'exited').slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Value ($M)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: isDarkMode ? '#94a3b8' : '#64748b' }
                      }}
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}M`, '']}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" />
                    <Bar dataKey="ebitda" name="EBITDA" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-md mt-auto py-4 theme-transition">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Fund Modal */}
      {isFundModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={fundModalRef}
            className="modal-content max-w-md w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fund-modal-title"
          >
            <div className="modal-header">
              <h3 id="fund-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Fund' : 'Add New Fund'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => setIsFundModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              isEditMode ? updateFund() : addFund();
            }}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="fund-name" className="form-label">Fund Name</label>
                  <input
                    id="fund-name"
                    type="text"
                    className="input"
                    value={fundModalData.name}
                    onChange={(e) => setFundModalData({...fundModalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-aum" className="form-label">AUM (in millions $)</label>
                  <input
                    id="fund-aum"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={fundModalData.aum}
                    onChange={(e) => setFundModalData({...fundModalData, aum: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-vintage" className="form-label">Vintage Year</label>
                  <input
                    id="fund-vintage"
                    type="number"
                    min="1980"
                    max={new Date().getFullYear()}
                    className="input"
                    value={fundModalData.vintage}
                    onChange={(e) => setFundModalData({...fundModalData, vintage: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-strategy" className="form-label">Strategy</label>
                  <input
                    id="fund-strategy"
                    type="text"
                    className="input"
                    value={fundModalData.strategy}
                    onChange={(e) => setFundModalData({...fundModalData, strategy: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-irr" className="form-label">IRR (%)</label>
                  <input
                    id="fund-irr"
                    type="number"
                    step="0.1"
                    className="input"
                    value={fundModalData.irr}
                    onChange={(e) => setFundModalData({...fundModalData, irr: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-moic" className="form-label">MOIC</label>
                  <input
                    id="fund-moic"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={fundModalData.moic}
                    onChange={(e) => setFundModalData({...fundModalData, moic: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-distributions" className="form-label">Distributions (in millions $)</label>
                  <input
                    id="fund-distributions"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={fundModalData.distributions}
                    onChange={(e) => setFundModalData({...fundModalData, distributions: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fund-status" className="form-label">Status</label>
                  <select
                    id="fund-status"
                    className="input"
                    value={fundModalData.status}
                    onChange={(e) => setFundModalData({...fundModalData, status: e.target.value as 'active' | 'fundraising' | 'closed'})}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  onClick={() => setIsFundModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {isCompanyModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={companyModalRef}
            className="modal-content max-w-lg w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-modal-title"
          >
            <div className="modal-header">
              <h3 id="company-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => setIsCompanyModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              isEditMode ? updateCompany() : addCompany();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="company-name" className="form-label">Company Name</label>
                  <input
                    id="company-name"
                    type="text"
                    className="input"
                    value={companyModalData.name}
                    onChange={(e) => setCompanyModalData({...companyModalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-sector" className="form-label">Sector</label>
                  <input
                    id="company-sector"
                    type="text"
                    className="input"
                    value={companyModalData.sector}
                    onChange={(e) => setCompanyModalData({...companyModalData, sector: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-fund" className="form-label">Fund</label>
                  <select
                    id="company-fund"
                    className="input"
                    value={companyModalData.fundId}
                    onChange={(e) => setCompanyModalData({...companyModalData, fundId: e.target.value})}
                    required
                  >
                    <option value="">Select a fund...</option>
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-investment-date" className="form-label">Investment Date</label>
                  <input
                    id="company-investment-date"
                    type="date"
                    className="input"
                    value={companyModalData.investmentDate}
                    onChange={(e) => setCompanyModalData({...companyModalData, investmentDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-investment-amount" className="form-label">Investment Amount ($M)</label>
                  <input
                    id="company-investment-amount"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={companyModalData.investmentAmount}
                    onChange={(e) => setCompanyModalData({...companyModalData, investmentAmount: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-current-valuation" className="form-label">Current Valuation ($M)</label>
                  <input
                    id="company-current-valuation"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={companyModalData.currentValuation}
                    onChange={(e) => setCompanyModalData({...companyModalData, currentValuation: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-revenue" className="form-label">Revenue ($M)</label>
                  <input
                    id="company-revenue"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={companyModalData.revenue}
                    onChange={(e) => setCompanyModalData({...companyModalData, revenue: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-ebitda" className="form-label">EBITDA ($M)</label>
                  <input
                    id="company-ebitda"
                    type="number"
                    step="0.1"
                    className="input"
                    value={companyModalData.ebitda}
                    onChange={(e) => setCompanyModalData({...companyModalData, ebitda: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-growth-rate" className="form-label">Growth Rate (%)</label>
                  <input
                    id="company-growth-rate"
                    type="number"
                    step="0.1"
                    className="input"
                    value={companyModalData.growthRate}
                    onChange={(e) => setCompanyModalData({...companyModalData, growthRate: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company-status" className="form-label">Status</label>
                  <select
                    id="company-status"
                    className="input"
                    value={companyModalData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'active' | 'exited' | 'distressed';
                      setCompanyModalData({...companyModalData, status: newStatus});
                    }}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="exited">Exited</option>
                    <option value="distressed">Distressed</option>
                  </select>
                </div>
                
                {companyModalData.status === 'exited' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="company-exit-date" className="form-label">Exit Date</label>
                      <input
                        id="company-exit-date"
                        type="date"
                        className="input"
                        value={companyModalData.exitDate}
                        onChange={(e) => setCompanyModalData({...companyModalData, exitDate: e.target.value})}
                        required={companyModalData.status === 'exited'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="company-exit-value" className="form-label">Exit Value ($M)</label>
                      <input
                        id="company-exit-value"
                        type="number"
                        step="0.1"
                        min="0"
                        className="input"
                        value={companyModalData.exitValue}
                        onChange={(e) => setCompanyModalData({...companyModalData, exitValue: parseFloat(e.target.value)})}
                        required={companyModalData.status === 'exited'}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  onClick={() => setIsCompanyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;