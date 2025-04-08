import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import {
  Plus, Trash2, Edit, Search, Filter, ArrowDown, ArrowUp, ChevronDown, ChevronUp,
  Wallet, TrendingUp, TrendingDown, DollarSign, Percent, Calendar, Building, ChartPie,
  Moon, Sun, X, FileText, Download, ArrowRight, UserRound, Briefcase, ArrowUpDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface Fund {
  id: string;
  name: string;
  aum: number; // Assets Under Management in millions
  vintage: number; // Year the fund was established
  irr: number; // Internal Rate of Return percentage
  moic: number; // Multiple On Invested Capital
  dpi: number; // Distributions to Paid-In
  rvpi: number; // Remaining Value to Paid-In
  tvpi: number; // Total Value to Paid-In (DPI + RVPI)
  strategy: string;
  status: 'active' | 'exited' | 'fundraising';
  investmentPeriodEnd: string; // Date
  termEnd: string; // Date
  commitments: number; // Total commitments in millions
  called: number; // Capital called in millions
  distributed: number; // Capital distributed in millions
  nav: number; // Net Asset Value in millions
  portfolioCompanies: string[]; // Array of portfolio company IDs
}

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  geography: string;
  entryDate: string; // Acquisition date
  entryEv: number; // Entry Enterprise Value in millions
  currentEv: number; // Current Enterprise Value in millions
  ownership: number; // Ownership percentage
  revenue: number; // Annual revenue in millions
  ebitda: number; // Annual EBITDA in millions
  ebitdaMargin: number; // EBITDA margin percentage
  netDebt: number; // Net debt in millions
  investmentThesis: string;
  status: 'active' | 'exited' | 'held-for-sale';
  exitDate?: string; // Exit date if exited
  exitMultiple?: number; // Exit multiple if exited
  exitIrr?: number; // Exit IRR if exited
  fundId: string; // Associated fund ID
}

interface FinancialMetric {
  date: string;
  revenue: number;
  ebitda: number;
  netDebt: number;
  companyId: string;
}

interface FundMetric {
  date: string;
  nav: number;
  called: number;
  distributed: number;
  irr: number;
  fundId: string;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface FilterConfig {
  funds: {
    status: string[];
    strategy: string[];
    search: string;
  };
  companies: {
    status: string[];
    sector: string[];
    search: string;
  };
}

// Modal types
type ModalType = 'fund' | 'company' | 'fundMetric' | 'companyMetric' | null;
type EditMode = 'add' | 'edit';

const App: React.FC = () => {
  // State for funds and portfolio companies
  const [funds, setFunds] = useState<Fund[]>([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([]);
  const [fundMetrics, setFundMetrics] = useState<FundMetric[]>([]);
  
  // State for active view and current selections
  const [activeView, setActiveView] = useState<'dashboard' | 'funds' | 'companies'>('dashboard');
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);
  
  // State for modals
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editMode, setEditMode] = useState<EditMode>('add');
  
  // State for sorting and filtering
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    funds: { status: [], strategy: [], search: '' },
    companies: { status: [], sector: [], search: '' }
  });
  
  // State for dark mode
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFunds = localStorage.getItem('funds');
    const savedCompanies = localStorage.getItem('portfolioCompanies');
    const savedFinancialMetrics = localStorage.getItem('financialMetrics');
    const savedFundMetrics = localStorage.getItem('fundMetrics');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedFunds) setFunds(JSON.parse(savedFunds));
    if (savedCompanies) setPortfolioCompanies(JSON.parse(savedCompanies));
    if (savedFinancialMetrics) setFinancialMetrics(JSON.parse(savedFinancialMetrics));
    if (savedFundMetrics) setFundMetrics(JSON.parse(savedFundMetrics));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    else {
      // Check system preference for dark mode
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
    
    // If no data exists, populate with sample data
    if (!savedFunds && !savedCompanies) {
      const sampleData = generateSampleData();
      setFunds(sampleData.funds);
      setPortfolioCompanies(sampleData.companies);
      setFinancialMetrics(sampleData.financialMetrics);
      setFundMetrics(sampleData.fundMetrics);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('funds', JSON.stringify(funds));
  }, [funds]);

  useEffect(() => {
    localStorage.setItem('portfolioCompanies', JSON.stringify(portfolioCompanies));
  }, [portfolioCompanies]);

  useEffect(() => {
    localStorage.setItem('financialMetrics', JSON.stringify(financialMetrics));
  }, [financialMetrics]);

  useEffect(() => {
    localStorage.setItem('fundMetrics', JSON.stringify(fundMetrics));
  }, [fundMetrics]);

  // Update dark mode class on document and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Listen for escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [modalOpen]);

  // Generate sample data for initial load
  const generateSampleData = () => {
    // Sample funds
    const sampleFunds: Fund[] = [
      {
        id: 'fund1',
        name: 'Growth Equity Fund I',
        aum: 750,
        vintage: 2018,
        irr: 24.5,
        moic: 2.3,
        dpi: 0.8,
        rvpi: 1.5,
        tvpi: 2.3,
        strategy: 'Growth Equity',
        status: 'active',
        investmentPeriodEnd: '2023-12-31',
        termEnd: '2028-12-31',
        commitments: 800,
        called: 600,
        distributed: 480,
        nav: 900,
        portfolioCompanies: ['company1', 'company2', 'company3']
      },
      {
        id: 'fund2',
        name: 'Buyout Fund II',
        aum: 1200,
        vintage: 2020,
        irr: 18.2,
        moic: 1.8,
        dpi: 0.3,
        rvpi: 1.5,
        tvpi: 1.8,
        strategy: 'Buyout',
        status: 'active',
        investmentPeriodEnd: '2025-12-31',
        termEnd: '2030-12-31',
        commitments: 1500,
        called: 900,
        distributed: 270,
        nav: 1350,
        portfolioCompanies: ['company4', 'company5']
      },
      {
        id: 'fund3',
        name: 'Venture Capital Fund I',
        aum: 350,
        vintage: 2016,
        irr: 32.1,
        moic: 3.1,
        dpi: 1.5,
        rvpi: 1.6,
        tvpi: 3.1,
        strategy: 'Venture Capital',
        status: 'active',
        investmentPeriodEnd: '2021-12-31',
        termEnd: '2026-12-31',
        commitments: 400,
        called: 370,
        distributed: 555,
        nav: 592,
        portfolioCompanies: ['company6', 'company7']
      }
    ];

    // Sample portfolio companies
    const sampleCompanies: PortfolioCompany[] = [
      {
        id: 'company1',
        name: 'TechSolutions Inc.',
        sector: 'Technology',
        geography: 'United States',
        entryDate: '2019-03-15',
        entryEv: 150,
        currentEv: 300,
        ownership: 65,
        revenue: 80,
        ebitda: 20,
        ebitdaMargin: 25,
        netDebt: 40,
        investmentThesis: 'Market leader in enterprise software with strong recurring revenue.',
        status: 'active',
        fundId: 'fund1'
      },
      {
        id: 'company2',
        name: 'HealthTech Solutions',
        sector: 'Healthcare',
        geography: 'United Kingdom',
        entryDate: '2018-07-22',
        entryEv: 85,
        currentEv: 220,
        ownership: 51,
        revenue: 45,
        ebitda: 9,
        ebitdaMargin: 20,
        netDebt: 15,
        investmentThesis: 'Digital health platform with scalable SaaS model.',
        status: 'active',
        fundId: 'fund1'
      },
      {
        id: 'company3',
        name: 'EcoPackaging',
        sector: 'Manufacturing',
        geography: 'Germany',
        entryDate: '2019-10-05',
        entryEv: 110,
        currentEv: 95,
        ownership: 70,
        revenue: 60,
        ebitda: 12,
        ebitdaMargin: 20,
        netDebt: 35,
        investmentThesis: 'Sustainable packaging solutions with strong ESG profile.',
        status: 'held-for-sale',
        fundId: 'fund1'
      },
      {
        id: 'company4',
        name: 'RetailTech Group',
        sector: 'Retail',
        geography: 'France',
        entryDate: '2020-05-18',
        entryEv: 290,
        currentEv: 380,
        ownership: 80,
        revenue: 150,
        ebitda: 30,
        ebitdaMargin: 20,
        netDebt: 120,
        investmentThesis: 'Omnichannel retail platform with AI-driven customer insights.',
        status: 'active',
        fundId: 'fund2'
      },
      {
        id: 'company5',
        name: 'LogisticsMaster',
        sector: 'Transportation',
        geography: 'Spain',
        entryDate: '2021-02-10',
        entryEv: 220,
        currentEv: 240,
        ownership: 75,
        revenue: 100,
        ebitda: 22,
        ebitdaMargin: 22,
        netDebt: 70,
        investmentThesis: 'Last-mile logistics provider with disruptive technology.',
        status: 'active',
        fundId: 'fund2'
      },
      {
        id: 'company6',
        name: 'FintechPay',
        sector: 'Financial Services',
        geography: 'Netherlands',
        entryDate: '2016-09-12',
        entryEv: 35,
        currentEv: 250,
        ownership: 40,
        revenue: 60,
        ebitda: 15,
        ebitdaMargin: 25,
        netDebt: 0,
        investmentThesis: 'Payment processing platform with strong international growth.',
        status: 'exited',
        exitDate: '2022-08-30',
        exitMultiple: 7.1,
        exitIrr: 58.3,
        fundId: 'fund3'
      },
      {
        id: 'company7',
        name: 'AgroTech Systems',
        sector: 'Agriculture',
        geography: 'Australia',
        entryDate: '2017-11-08',
        entryEv: 42,
        currentEv: 90,
        ownership: 55,
        revenue: 35,
        ebitda: 7,
        ebitdaMargin: 20,
        netDebt: 15,
        investmentThesis: 'Precision agriculture technology with data-driven solutions.',
        status: 'active',
        fundId: 'fund3'
      }
    ];

    // Sample financial metrics (quarterly data for 2 years)
    const sampleFinancialMetrics: FinancialMetric[] = [];
    sampleCompanies.forEach(company => {
      const baseRevenue = company.revenue;
      const baseEbitda = company.ebitda;
      const baseNetDebt = company.netDebt;
      
      for (let i = 0; i < 8; i++) { // 8 quarters = 2 years
        const quarterDate = new Date();
        quarterDate.setMonth(quarterDate.getMonth() - (i * 3)); // Go back i quarters
        
        // Add some randomness to the metrics
        const revenueFactor = 1 + ((Math.random() * 0.1) - 0.05) * (i + 1); // +/- 5% per quarter
        const ebitdaFactor = 1 + ((Math.random() * 0.15) - 0.07) * (i + 1); // +/- 7% per quarter
        const debtReduction = (Math.random() * 0.05) * i; // Reduce debt by up to 5% per quarter
        
        sampleFinancialMetrics.push({
          date: quarterDate.toISOString().split('T')[0],
          revenue: Number((baseRevenue * (1 / revenueFactor)).toFixed(1)),
          ebitda: Number((baseEbitda * (1 / ebitdaFactor)).toFixed(1)),
          netDebt: Number((baseNetDebt * (1 - debtReduction)).toFixed(1)),
          companyId: company.id
        });
      }
    });

    // Sample fund metrics (quarterly data for 2 years)
    const sampleFundMetrics: FundMetric[] = [];
    sampleFunds.forEach(fund => {
      const baseNav = fund.nav;
      const baseCalled = fund.called;
      const baseDistributed = fund.distributed;
      const baseIrr = fund.irr;
      
      for (let i = 0; i < 8; i++) { // 8 quarters = 2 years
        const quarterDate = new Date();
        quarterDate.setMonth(quarterDate.getMonth() - (i * 3)); // Go back i quarters
        
        // Add some randomness to the metrics
        const navFactor = 1 + ((Math.random() * 0.1) - 0.05) * (i + 1); // +/- 5% per quarter
        const calledFactor = 1 - (Math.random() * 0.05) * (i + 1); // Increase called capital over time
        const distributedFactor = 1 - (Math.random() * 0.1) * (i + 1); // Increase distributions over time
        const irrFactor = 1 + ((Math.random() * 0.08) - 0.04) * (i + 1); // +/- 4% per quarter
        
        sampleFundMetrics.push({
          date: quarterDate.toISOString().split('T')[0],
          nav: Number((baseNav * (1 / navFactor)).toFixed(1)),
          called: Number((baseCalled * (1 / calledFactor)).toFixed(1)),
          distributed: Number((baseDistributed * (1 / distributedFactor)).toFixed(1)),
          irr: Number((baseIrr * (1 / irrFactor)).toFixed(1)),
          fundId: fund.id
        });
      }
    });

    return {
      funds: sampleFunds,
      companies: sampleCompanies,
      financialMetrics: sampleFinancialMetrics,
      fundMetrics: sampleFundMetrics
    };
  };

  // Helper function to format currency in millions
  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(1)}M`;
  };

  // Helper function to format percentage
  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Helper function to calculate total AUM
  const calculateTotalAUM = (): number => {
    return funds.reduce((total, fund) => total + fund.aum, 0);
  };

  // Helper function to get average IRR
  const calculateAverageIRR = (): number => {
    if (funds.length === 0) return 0;
    return funds.reduce((total, fund) => total + fund.irr, 0) / funds.length;
  };

  // Helper function to get portfolio companies for a fund
  const getPortfolioCompaniesForFund = (fundId: string): PortfolioCompany[] => {
    return portfolioCompanies.filter(company => company.fundId === fundId);
  };

  // Helper function to get financial metrics for a company
  const getFinancialMetricsForCompany = (companyId: string): FinancialMetric[] => {
    return financialMetrics
      .filter(metric => metric.companyId === companyId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Helper function to get fund metrics for a fund
  const getFundMetricsForFund = (fundId: string): FundMetric[] => {
    return fundMetrics
      .filter(metric => metric.fundId === fundId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Sorting functions
  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = (items: any[], key: string, direction: SortDirection) => {
    if (key === '') return items;
    
    return [...items].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1" /> 
      : <ArrowDown size={14} className="ml-1" />;
  };

  // Filtering functions
  const handleFilterChange = (category: 'funds' | 'companies', filterType: 'status' | 'strategy' | 'sector' | 'search', value: string) => {
    if (filterType === 'search') {
      setFilterConfig({
        ...filterConfig,
        [category]: {
          ...filterConfig[category],
          search: value
        }
      });
      return;
    }
    
    const currentFilters = filterConfig[category][filterType as keyof typeof filterConfig[typeof category]] as string[];
    const updatedFilters = currentFilters.includes(value)
      ? currentFilters.filter(filter => filter !== value)
      : [...currentFilters, value];
    
    setFilterConfig({
      ...filterConfig,
      [category]: {
        ...filterConfig[category],
        [filterType]: updatedFilters
      }
    });
  };

  // Apply filters to funds
  const getFilteredFunds = (): Fund[] => {
    let result = funds;
    
    // Apply status filter
    if (filterConfig.funds.status.length > 0) {
      result = result.filter(fund => filterConfig.funds.status.includes(fund.status));
    }
    
    // Apply strategy filter
    if (filterConfig.funds.strategy.length > 0) {
      result = result.filter(fund => filterConfig.funds.strategy.includes(fund.strategy));
    }
    
    // Apply search filter
    if (filterConfig.funds.search) {
      const searchTerm = filterConfig.funds.search.toLowerCase();
      result = result.filter(fund => 
        fund.name.toLowerCase().includes(searchTerm) ||
        fund.strategy.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    return getSortedItems(result, sortConfig.key, sortConfig.direction);
  };

  // Apply filters to companies
  const getFilteredCompanies = (): PortfolioCompany[] => {
    let result = selectedFund 
      ? portfolioCompanies.filter(company => company.fundId === selectedFund.id)
      : portfolioCompanies;
    
    // Apply status filter
    if (filterConfig.companies.status.length > 0) {
      result = result.filter(company => filterConfig.companies.status.includes(company.status));
    }
    
    // Apply sector filter
    if (filterConfig.companies.sector.length > 0) {
      result = result.filter(company => filterConfig.companies.sector.includes(company.sector));
    }
    
    // Apply search filter
    if (filterConfig.companies.search) {
      const searchTerm = filterConfig.companies.search.toLowerCase();
      result = result.filter(company => 
        company.name.toLowerCase().includes(searchTerm) ||
        company.sector.toLowerCase().includes(searchTerm) ||
        company.geography.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    return getSortedItems(result, sortConfig.key, sortConfig.direction);
  };

  // Get unique values for filters
  const getUniqueStrategies = (): string[] => {
    return [...new Set(funds.map(fund => fund.strategy))];
  };

  const getUniqueSectors = (): string[] => {
    return [...new Set(portfolioCompanies.map(company => company.sector))];
  };

  // Modal functions
  const openModal = (type: ModalType, mode: EditMode = 'add') => {
    setModalType(type);
    setEditMode(mode);
    setModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.classList.remove('modal-open');
    setModalType(null);
  };

  // Handle fund creation or update
  const handleFundSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const newFund: Fund = {
      id: editMode === 'add' ? `fund${Date.now()}` : selectedFund!.id,
      name: (form.elements.namedItem('fundName') as HTMLInputElement).value,
      aum: parseFloat((form.elements.namedItem('fundAum') as HTMLInputElement).value),
      vintage: parseInt((form.elements.namedItem('fundVintage') as HTMLInputElement).value),
      irr: parseFloat((form.elements.namedItem('fundIrr') as HTMLInputElement).value),
      moic: parseFloat((form.elements.namedItem('fundMoic') as HTMLInputElement).value),
      dpi: parseFloat((form.elements.namedItem('fundDpi') as HTMLInputElement).value),
      rvpi: parseFloat((form.elements.namedItem('fundRvpi') as HTMLInputElement).value),
      tvpi: parseFloat((form.elements.namedItem('fundTvpi') as HTMLInputElement).value),
      strategy: (form.elements.namedItem('fundStrategy') as HTMLInputElement).value,
      status: (form.elements.namedItem('fundStatus') as HTMLInputElement).value as 'active' | 'exited' | 'fundraising',
      investmentPeriodEnd: (form.elements.namedItem('fundInvestmentPeriodEnd') as HTMLInputElement).value,
      termEnd: (form.elements.namedItem('fundTermEnd') as HTMLInputElement).value,
      commitments: parseFloat((form.elements.namedItem('fundCommitments') as HTMLInputElement).value),
      called: parseFloat((form.elements.namedItem('fundCalled') as HTMLInputElement).value),
      distributed: parseFloat((form.elements.namedItem('fundDistributed') as HTMLInputElement).value),
      nav: parseFloat((form.elements.namedItem('fundNav') as HTMLInputElement).value),
      portfolioCompanies: editMode === 'add' ? [] : selectedFund!.portfolioCompanies
    };
    
    if (editMode === 'add') {
      setFunds([...funds, newFund]);
    } else {
      setFunds(funds.map(fund => fund.id === newFund.id ? newFund : fund));
    }
    
    closeModal();
  };

  // Handle company creation or update
  const handleCompanySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const fundId = (form.elements.namedItem('companyFundId') as HTMLSelectElement).value;
    
    const newCompany: PortfolioCompany = {
      id: editMode === 'add' ? `company${Date.now()}` : selectedCompany!.id,
      name: (form.elements.namedItem('companyName') as HTMLInputElement).value,
      sector: (form.elements.namedItem('companySector') as HTMLInputElement).value,
      geography: (form.elements.namedItem('companyGeography') as HTMLInputElement).value,
      entryDate: (form.elements.namedItem('companyEntryDate') as HTMLInputElement).value,
      entryEv: parseFloat((form.elements.namedItem('companyEntryEv') as HTMLInputElement).value),
      currentEv: parseFloat((form.elements.namedItem('companyCurrentEv') as HTMLInputElement).value),
      ownership: parseFloat((form.elements.namedItem('companyOwnership') as HTMLInputElement).value),
      revenue: parseFloat((form.elements.namedItem('companyRevenue') as HTMLInputElement).value),
      ebitda: parseFloat((form.elements.namedItem('companyEbitda') as HTMLInputElement).value),
      ebitdaMargin: parseFloat((form.elements.namedItem('companyEbitdaMargin') as HTMLInputElement).value),
      netDebt: parseFloat((form.elements.namedItem('companyNetDebt') as HTMLInputElement).value),
      investmentThesis: (form.elements.namedItem('companyInvestmentThesis') as HTMLTextAreaElement).value,
      status: (form.elements.namedItem('companyStatus') as HTMLSelectElement).value as 'active' | 'exited' | 'held-for-sale',
      fundId
    };
    
    // Add exit details if the company is exited
    if (newCompany.status === 'exited') {
      newCompany.exitDate = (form.elements.namedItem('companyExitDate') as HTMLInputElement)?.value;
      newCompany.exitMultiple = parseFloat((form.elements.namedItem('companyExitMultiple') as HTMLInputElement)?.value || '0');
      newCompany.exitIrr = parseFloat((form.elements.namedItem('companyExitIrr') as HTMLInputElement)?.value || '0');
    }
    
    if (editMode === 'add') {
      setPortfolioCompanies([...portfolioCompanies, newCompany]);
      
      // Update the fund's portfolio companies list
      const updatedFunds = funds.map(fund => {
        if (fund.id === fundId) {
          return {
            ...fund,
            portfolioCompanies: [...fund.portfolioCompanies, newCompany.id]
          };
        }
        return fund;
      });
      
      setFunds(updatedFunds);
    } else {
      // If the fund has changed, update both funds' portfolio companies lists
      if (selectedCompany!.fundId !== fundId) {
        const updatedFunds = funds.map(fund => {
          if (fund.id === selectedCompany!.fundId) {
            // Remove from old fund
            return {
              ...fund,
              portfolioCompanies: fund.portfolioCompanies.filter(id => id !== selectedCompany!.id)
            };
          } else if (fund.id === fundId) {
            // Add to new fund
            return {
              ...fund,
              portfolioCompanies: [...fund.portfolioCompanies, selectedCompany!.id]
            };
          }
          return fund;
        });
        
        setFunds(updatedFunds);
      }
      
      setPortfolioCompanies(portfolioCompanies.map(company => 
        company.id === newCompany.id ? newCompany : company
      ));
    }
    
    closeModal();
  };

  // Handle deletion of a fund
  const handleDeleteFund = (fundId: string) => {
    if (window.confirm('Are you sure you want to delete this fund? This will also delete all associated portfolio companies.')) {
      // Delete associated companies
      const fundCompanies = portfolioCompanies.filter(company => company.fundId === fundId);
      const companyIds = fundCompanies.map(company => company.id);
      
      // Delete related metrics
      const updatedFinancialMetrics = financialMetrics.filter(
        metric => !companyIds.includes(metric.companyId)
      );
      
      const updatedFundMetrics = fundMetrics.filter(
        metric => metric.fundId !== fundId
      );
      
      setFinancialMetrics(updatedFinancialMetrics);
      setFundMetrics(updatedFundMetrics);
      
      // Delete companies
      setPortfolioCompanies(portfolioCompanies.filter(company => company.fundId !== fundId));
      
      // Delete fund
      setFunds(funds.filter(fund => fund.id !== fundId));
      
      if (selectedFund?.id === fundId) {
        setSelectedFund(null);
      }
    }
  };

  // Handle deletion of a company
  const handleDeleteCompany = (companyId: string, fundId: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio company?')) {
      // Delete company metrics
      setFinancialMetrics(financialMetrics.filter(
        metric => metric.companyId !== companyId
      ));
      
      // Remove company from fund's portfolioCompanies
      const updatedFunds = funds.map(fund => {
        if (fund.id === fundId) {
          return {
            ...fund,
            portfolioCompanies: fund.portfolioCompanies.filter(id => id !== companyId)
          };
        }
        return fund;
      });
      
      setFunds(updatedFunds);
      
      // Delete the company
      setPortfolioCompanies(portfolioCompanies.filter(company => company.id !== companyId));
      
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
      }
    }
  };

  // Handle fund metric submission
  const handleFundMetricSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const fundId = (form.elements.namedItem('metricFundId') as HTMLSelectElement).value;
    const date = (form.elements.namedItem('metricDate') as HTMLInputElement).value;
    
    const newMetric: FundMetric = {
      date,
      nav: parseFloat((form.elements.namedItem('metricNav') as HTMLInputElement).value),
      called: parseFloat((form.elements.namedItem('metricCalled') as HTMLInputElement).value),
      distributed: parseFloat((form.elements.namedItem('metricDistributed') as HTMLInputElement).value),
      irr: parseFloat((form.elements.namedItem('metricIrr') as HTMLInputElement).value),
      fundId
    };
    
    // Check if a metric for this date and fund already exists
    const existingIndex = fundMetrics.findIndex(
      m => m.fundId === fundId && m.date === date
    );
    
    if (existingIndex >= 0) {
      // Update existing metric
      const updatedMetrics = [...fundMetrics];
      updatedMetrics[existingIndex] = newMetric;
      setFundMetrics(updatedMetrics);
    } else {
      // Add new metric
      setFundMetrics([...fundMetrics, newMetric]);
    }
    
    // Update fund with latest metrics
    const updatedFunds = funds.map(fund => {
      if (fund.id === fundId) {
        return {
          ...fund,
          nav: newMetric.nav,
          called: newMetric.called,
          distributed: newMetric.distributed,
          irr: newMetric.irr
        };
      }
      return fund;
    });
    
    setFunds(updatedFunds);
    closeModal();
  };

  // Handle company metric submission
  const handleCompanyMetricSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const companyId = (form.elements.namedItem('metricCompanyId') as HTMLSelectElement).value;
    const date = (form.elements.namedItem('metricDate') as HTMLInputElement).value;
    
    const newMetric: FinancialMetric = {
      date,
      revenue: parseFloat((form.elements.namedItem('metricRevenue') as HTMLInputElement).value),
      ebitda: parseFloat((form.elements.namedItem('metricEbitda') as HTMLInputElement).value),
      netDebt: parseFloat((form.elements.namedItem('metricNetDebt') as HTMLInputElement).value),
      companyId
    };
    
    // Check if a metric for this date and company already exists
    const existingIndex = financialMetrics.findIndex(
      m => m.companyId === companyId && m.date === date
    );
    
    if (existingIndex >= 0) {
      // Update existing metric
      const updatedMetrics = [...financialMetrics];
      updatedMetrics[existingIndex] = newMetric;
      setFinancialMetrics(updatedMetrics);
    } else {
      // Add new metric
      setFinancialMetrics([...financialMetrics, newMetric]);
    }
    
    // Update company with latest metrics
    const ebitdaMargin = (newMetric.ebitda / newMetric.revenue) * 100;
    
    const updatedCompanies = portfolioCompanies.map(company => {
      if (company.id === companyId) {
        return {
          ...company,
          revenue: newMetric.revenue,
          ebitda: newMetric.ebitda,
          ebitdaMargin,
          netDebt: newMetric.netDebt
        };
      }
      return company;
    });
    
    setPortfolioCompanies(updatedCompanies);
    closeModal();
  };

  // Generate template for financial metrics
  const generateFinancialMetricsTemplate = () => {
    const template = [
      'date,companyId,revenue,ebitda,netDebt',
      'YYYY-MM-DD,company_id,0.0,0.0,0.0'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial_metrics_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate template for fund metrics
  const generateFundMetricsTemplate = () => {
    const template = [
      'date,fundId,nav,called,distributed,irr',
      'YYYY-MM-DD,fund_id,0.0,0.0,0.0,0.0'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fund_metrics_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Dashboard view
  const renderDashboard = () => {
    const fundPerformanceData = funds.map(fund => ({
      name: fund.name,
      irr: fund.irr,
      tvpi: fund.tvpi
    }));
    
    const sectorDistribution = getUniqueSectors().map(sector => {
      const companies = portfolioCompanies.filter(company => company.sector === sector);
      const totalValue = companies.reduce((sum, company) => sum + company.currentEv, 0);
      return {
        sector,
        value: totalValue
      };
    }).sort((a, b) => b.value - a.value);
    
    const totalAUM = calculateTotalAUM();
    const averageIRR = calculateAverageIRR();
    const activeCompanies = portfolioCompanies.filter(company => company.status === 'active').length;
    const exitedCompanies = portfolioCompanies.filter(company => company.status === 'exited').length;
    
    // Calculate portfolio value growth over time
    const navOverTime = fundMetrics
      .reduce((acc: {date: string, nav: number}[], metric) => {
        const existingDateIndex = acc.findIndex(item => item.date === metric.date);
        if (existingDateIndex >= 0) {
          acc[existingDateIndex].nav += metric.nav;
        } else {
          acc.push({date: metric.date, nav: metric.nav});
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate colors for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFCC99', '#B2DFDB'];
    
    return (
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Summary Cards */}
          <div className="stat-card">
            <div className="stat-title">Total AUM</div>
            <div className="stat-value">{formatCurrency(totalAUM)}</div>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-slate-400">
              <Wallet size={16} className="mr-1" />
              <span>Across {funds.length} funds</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Average IRR</div>
            <div className="stat-value">{formatPercent(averageIRR)}</div>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-slate-400">
              <TrendingUp size={16} className="mr-1" />
              <span>{averageIRR > 20 ? 'Strong performance' : 'Moderate performance'}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Portfolio Companies</div>
            <div className="stat-value">{portfolioCompanies.length}</div>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-slate-400">
              <Building size={16} className="mr-1" />
              <span>{activeCompanies} active, {exitedCompanies} exited</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Unrealized Value</div>
            <div className="stat-value">{formatCurrency(funds.reduce((sum, fund) => sum + fund.nav, 0))}</div>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-slate-400">
              <DollarSign size={16} className="mr-1" />
              <span>Current NAV</span>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Value Over Time */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Portfolio Value Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={navOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}M`} />
                  <Tooltip formatter={(value) => [`$${value}M`, 'NAV']} />
                  <Area type="monotone" dataKey="nav" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Fund Performance */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Fund Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'IRR (%)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'TVPI (x)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="irr" fill="#8884d8" name="IRR (%)" />
                  <Bar yAxisId="right" dataKey="tvpi" fill="#82ca9d" name="TVPI (x)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Sector Distribution */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Portfolio by Sector</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sectorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}M`, 'Enterprise Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                className="btn btn-primary flex items-center justify-center"
                onClick={() => openModal('fund', 'add')}
              >
                <Plus size={16} className="mr-1" />
                Add New Fund
              </button>
              
              <button 
                className="btn btn-primary flex items-center justify-center"
                onClick={() => openModal('company', 'add')}
              >
                <Plus size={16} className="mr-1" />
                Add Portfolio Company
              </button>
              
              <button 
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
                onClick={() => openModal('fundMetric')}
              >
                <ChartPie size={16} className="mr-1" />
                Update Fund Metrics
              </button>
              
              <button 
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
                onClick={() => openModal('companyMetric')}
              >
                <TrendingUp size={16} className="mr-1" />
                Update Company Metrics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Funds list view
  const renderFundsList = () => {
    const filteredFunds = getFilteredFunds();
    
    return (
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search funds..."
                className="input pr-8"
                value={filterConfig.funds.search}
                onChange={(e) => handleFilterChange('funds', 'search', e.target.value)}
              />
              <Search size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 flex items-center"
                onClick={() => document.getElementById('fundFilters')?.classList.toggle('hidden')}
              >
                <Filter size={16} className="mr-1" />
                Filters
              </button>
              
              <div id="fundFilters" className="hidden absolute z-10 mt-2 w-64 bg-white dark:bg-slate-800 shadow-lg rounded-md p-4 border border-gray-200 dark:border-slate-700">
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-slate-300">Status</h4>
                  <div className="space-y-1">
                    {['active', 'exited', 'fundraising'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterConfig.funds.status.includes(status)}
                          onChange={() => handleFilterChange('funds', 'status', status)}
                        />
                        <span className="text-sm capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-slate-300">Strategy</h4>
                  <div className="space-y-1">
                    {getUniqueStrategies().map(strategy => (
                      <label key={strategy} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterConfig.funds.strategy.includes(strategy)}
                          onChange={() => handleFilterChange('funds', 'strategy', strategy)}
                        />
                        <span className="text-sm">{strategy}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className="btn btn-primary flex-shrink-0 flex items-center justify-center"
            onClick={() => openModal('fund', 'add')}
          >
            <Plus size={16} className="mr-1" />
            Add Fund
          </button>
        </div>
        
        {/* Funds Table */}
        <div className="overflow-x-auto">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header" onClick={() => requestSort('name')}>
                    <div className="flex items-center cursor-pointer">
                      Fund Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('vintage')}>
                    <div className="flex items-center cursor-pointer">
                      Vintage {getSortIcon('vintage')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('aum')}>
                    <div className="flex items-center cursor-pointer">
                      AUM {getSortIcon('aum')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('irr')}>
                    <div className="flex items-center cursor-pointer">
                      IRR {getSortIcon('irr')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('tvpi')}>
                    <div className="flex items-center cursor-pointer">
                      TVPI {getSortIcon('tvpi')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('strategy')}>
                    <div className="flex items-center cursor-pointer">
                      Strategy {getSortIcon('strategy')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('status')}>
                    <div className="flex items-center cursor-pointer">
                      Status {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="table-header">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredFunds.map(fund => (
                  <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="table-cell font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
                        onClick={() => {
                          setSelectedFund(fund);
                          setActiveView('companies');
                        }}
                      >
                        {fund.name}
                      </button>
                    </td>
                    <td className="table-cell">{fund.vintage}</td>
                    <td className="table-cell">{formatCurrency(fund.aum)}</td>
                    <td className="table-cell">{formatPercent(fund.irr)}</td>
                    <td className="table-cell">{fund.tvpi.toFixed(1)}x</td>
                    <td className="table-cell">{fund.strategy}</td>
                    <td className="table-cell">
                      <span className={`badge ${fund.status === 'active' ? 'badge-success' : fund.status === 'exited' ? 'badge-info' : 'badge-warning'}`}>
                        {fund.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => {
                            setSelectedFund(fund);
                            openModal('fund', 'edit');
                          }}
                          aria-label={`Edit ${fund.name}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteFund(fund.id)}
                          aria-label={`Delete ${fund.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredFunds.length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-slate-400">
                      No funds found. Try adjusting your filters or add a new fund.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Portfolio companies view
  const renderCompaniesView = () => {
    const filteredCompanies = getFilteredCompanies();
    
    return (
      <div className="space-y-4">
        {/* Breadcrumb and Header */}
        {selectedFund && (
          <div className="flex items-center mb-4 gap-1 text-sm text-gray-500 dark:text-slate-400">
            <button 
              className="hover:text-gray-700 dark:hover:text-slate-300"
              onClick={() => {
                setSelectedFund(null);
                setActiveView('funds');
              }}
            >
              Funds
            </button>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-white">{selectedFund.name}</span>
          </div>
        )}
        
        {/* Fund Summary Card (if a fund is selected) */}
        {selectedFund && (
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedFund.name}</h2>
                <p className="text-gray-500 dark:text-slate-400">{selectedFund.strategy} | Vintage {selectedFund.vintage}</p>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">AUM</div>
                    <div className="text-lg font-semibold">{formatCurrency(selectedFund.aum)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">IRR</div>
                    <div className="text-lg font-semibold">{formatPercent(selectedFund.irr)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">TVPI</div>
                    <div className="text-lg font-semibold">{selectedFund.tvpi.toFixed(1)}x</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">DPI</div>
                    <div className="text-lg font-semibold">{selectedFund.dpi.toFixed(1)}x</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  className="btn btn-primary flex items-center justify-center"
                  onClick={() => openModal('company', 'add')}
                >
                  <Plus size={16} className="mr-1" />
                  Add Company
                </button>
                <button 
                  className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
                  onClick={() => {
                    setSelectedFund(selectedFund);
                    openModal('fundMetric');
                  }}
                >
                  <ChartPie size={16} className="mr-1" />
                  Update Metrics
                </button>
              </div>
            </div>
            
            {/* Fund Performance Chart */}
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFundMetricsForFund(selectedFund.id)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="nav" stroke="#8884d8" name="NAV ($M)" />
                  <Line yAxisId="right" type="monotone" dataKey="irr" stroke="#82ca9d" name="IRR (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search companies..."
                className="input pr-8"
                value={filterConfig.companies.search}
                onChange={(e) => handleFilterChange('companies', 'search', e.target.value)}
              />
              <Search size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 flex items-center"
                onClick={() => document.getElementById('companyFilters')?.classList.toggle('hidden')}
              >
                <Filter size={16} className="mr-1" />
                Filters
              </button>
              
              <div id="companyFilters" className="hidden absolute z-10 mt-2 w-64 bg-white dark:bg-slate-800 shadow-lg rounded-md p-4 border border-gray-200 dark:border-slate-700">
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-slate-300">Status</h4>
                  <div className="space-y-1">
                    {['active', 'exited', 'held-for-sale'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterConfig.companies.status.includes(status)}
                          onChange={() => handleFilterChange('companies', 'status', status)}
                        />
                        <span className="text-sm capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-slate-300">Sector</h4>
                  <div className="space-y-1">
                    {getUniqueSectors().map(sector => (
                      <label key={sector} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterConfig.companies.sector.includes(sector)}
                          onChange={() => handleFilterChange('companies', 'sector', sector)}
                        />
                        <span className="text-sm">{sector}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {!selectedFund && (
            <button 
              className="btn btn-primary flex-shrink-0 flex items-center justify-center"
              onClick={() => openModal('company', 'add')}
            >
              <Plus size={16} className="mr-1" />
              Add Company
            </button>
          )}
        </div>
        
        {/* Companies Table */}
        <div className="overflow-x-auto">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header" onClick={() => requestSort('name')}>
                    <div className="flex items-center cursor-pointer">
                      Company Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('sector')}>
                    <div className="flex items-center cursor-pointer">
                      Sector {getSortIcon('sector')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('geography')}>
                    <div className="flex items-center cursor-pointer">
                      Geography {getSortIcon('geography')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('currentEv')}>
                    <div className="flex items-center cursor-pointer">
                      Current EV {getSortIcon('currentEv')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('ebitdaMargin')}>
                    <div className="flex items-center cursor-pointer">
                      EBITDA Margin {getSortIcon('ebitdaMargin')}
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('status')}>
                    <div className="flex items-center cursor-pointer">
                      Status {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="table-header">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredCompanies.map(company => {
                  const fund = funds.find(f => f.id === company.fundId);
                  return (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
                          onClick={() => setSelectedCompany(company)}
                        >
                          {company.name}
                        </button>
                      </td>
                      <td className="table-cell">{company.sector}</td>
                      <td className="table-cell">{company.geography}</td>
                      <td className="table-cell">{formatCurrency(company.currentEv)}</td>
                      <td className="table-cell">{formatPercent(company.ebitdaMargin)}</td>
                      <td className="table-cell">
                        <span className={`badge ${company.status === 'active' ? 'badge-success' : company.status === 'exited' ? 'badge-info' : 'badge-warning'}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => {
                              setSelectedCompany(company);
                              openModal('company', 'edit');
                            }}
                            aria-label={`Edit ${company.name}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteCompany(company.id, company.fundId)}
                            aria-label={`Delete ${company.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-slate-400">
                      No companies found. Try adjusting your filters or add a new company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Selected Company Details */}
        {selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                    <p className="text-gray-500 dark:text-slate-400">
                      {selectedCompany.sector} | {selectedCompany.geography}
                    </p>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                    onClick={() => setSelectedCompany(null)}
                    aria-label="Close details"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">Entry Date</div>
                        <div className="font-medium">{new Date(selectedCompany.entryDate).toLocaleDateString()}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">Entry EV</div>
                          <div className="font-medium">{formatCurrency(selectedCompany.entryEv)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">Current EV</div>
                          <div className="font-medium">{formatCurrency(selectedCompany.currentEv)}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">Ownership</div>
                        <div className="font-medium">{formatPercent(selectedCompany.ownership)}</div>
                      </div>
                      
                      {selectedCompany.status === 'exited' && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">Exit Date</div>
                            <div className="font-medium">{new Date(selectedCompany.exitDate!).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-slate-400">Exit Multiple</div>
                              <div className="font-medium">{selectedCompany.exitMultiple!.toFixed(1)}x</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-slate-400">Exit IRR</div>
                              <div className="font-medium">{formatPercent(selectedCompany.exitIrr!)}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">Investment Thesis</div>
                        <div className="text-sm mt-1 bg-gray-50 dark:bg-slate-700 p-3 rounded">{selectedCompany.investmentThesis}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button 
                        className="btn btn-primary flex items-center justify-center"
                        onClick={() => {
                          setSelectedCompany(selectedCompany);
                          openModal('company', 'edit');
                        }}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit Company
                      </button>
                      
                      <button 
                        className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
                        onClick={() => {
                          setSelectedCompany(selectedCompany);
                          openModal('companyMetric');
                        }}
                      >
                        <TrendingUp size={16} className="mr-1" />
                        Update Metrics
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Performance</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">Revenue</div>
                        <div className="font-medium">{formatCurrency(selectedCompany.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">EBITDA</div>
                        <div className="font-medium">{formatCurrency(selectedCompany.ebitda)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">EBITDA Margin</div>
                        <div className="font-medium">{formatPercent(selectedCompany.ebitdaMargin)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">Net Debt</div>
                        <div className="font-medium">{formatCurrency(selectedCompany.netDebt)}</div>
                      </div>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getFinancialMetricsForCompany(selectedCompany.id)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip formatter={(value) => [`$${value}M`]} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($M)" />
                          <Line yAxisId="left" type="monotone" dataKey="ebitda" stroke="#82ca9d" name="EBITDA ($M)" />
                          <Line yAxisId="right" type="monotone" dataKey="netDebt" stroke="#ff7300" name="Net Debt ($M)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render modals
  const renderModals = () => {
    if (!modalOpen) return null;
    
    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {modalType === 'fund' && (
            <div>
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  {editMode === 'add' ? 'Add New Fund' : 'Edit Fund'}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleFundSubmit}>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group md:col-span-2">
                    <label className="form-label" htmlFor="fundName">Fund Name</label>
                    <input 
                      id="fundName"
                      name="fundName"
                      type="text" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.name : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundVintage">Vintage Year</label>
                    <input 
                      id="fundVintage"
                      name="fundVintage"
                      type="number" 
                      min="1900"
                      max="2099"
                      step="1"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.vintage : new Date().getFullYear()}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundStrategy">Strategy</label>
                    <input 
                      id="fundStrategy"
                      name="fundStrategy"
                      type="text" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.strategy : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundStatus">Status</label>
                    <select 
                      id="fundStatus"
                      name="fundStatus"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.status : 'active'}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="exited">Exited</option>
                      <option value="fundraising">Fundraising</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundAum">AUM ($M)</label>
                    <input 
                      id="fundAum"
                      name="fundAum"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.aum : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundIrr">IRR (%)</label>
                    <input 
                      id="fundIrr"
                      name="fundIrr"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.irr : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundMoic">MOIC (x)</label>
                    <input 
                      id="fundMoic"
                      name="fundMoic"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.moic : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundTvpi">TVPI (x)</label>
                    <input 
                      id="fundTvpi"
                      name="fundTvpi"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.tvpi : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundDpi">DPI (x)</label>
                    <input 
                      id="fundDpi"
                      name="fundDpi"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.dpi : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundRvpi">RVPI (x)</label>
                    <input 
                      id="fundRvpi"
                      name="fundRvpi"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.rvpi : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundInvestmentPeriodEnd">Investment Period End</label>
                    <input 
                      id="fundInvestmentPeriodEnd"
                      name="fundInvestmentPeriodEnd"
                      type="date" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.investmentPeriodEnd : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundTermEnd">Term End</label>
                    <input 
                      id="fundTermEnd"
                      name="fundTermEnd"
                      type="date" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.termEnd : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundCommitments">Commitments ($M)</label>
                    <input 
                      id="fundCommitments"
                      name="fundCommitments"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.commitments : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundCalled">Called ($M)</label>
                    <input 
                      id="fundCalled"
                      name="fundCalled"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.called : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundDistributed">Distributed ($M)</label>
                    <input 
                      id="fundDistributed"
                      name="fundDistributed"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.distributed : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="fundNav">NAV ($M)</label>
                    <input 
                      id="fundNav"
                      name="fundNav"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedFund?.nav : ''}
                      required 
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editMode === 'add' ? 'Add Fund' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {modalType === 'company' && (
            <div>
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  {editMode === 'add' ? 'Add New Portfolio Company' : 'Edit Portfolio Company'}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCompanySubmit} className="max-h-[70vh] overflow-y-auto">
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group md:col-span-2">
                    <label className="form-label" htmlFor="companyName">Company Name</label>
                    <input 
                      id="companyName"
                      name="companyName"
                      type="text" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.name : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companySector">Sector</label>
                    <input 
                      id="companySector"
                      name="companySector"
                      type="text" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.sector : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyGeography">Geography</label>
                    <input 
                      id="companyGeography"
                      name="companyGeography"
                      type="text" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.geography : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyEntryDate">Entry Date</label>
                    <input 
                      id="companyEntryDate"
                      name="companyEntryDate"
                      type="date" 
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.entryDate : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyEntryEv">Entry EV ($M)</label>
                    <input 
                      id="companyEntryEv"
                      name="companyEntryEv"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.entryEv : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyCurrentEv">Current EV ($M)</label>
                    <input 
                      id="companyCurrentEv"
                      name="companyCurrentEv"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.currentEv : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyOwnership">Ownership (%)</label>
                    <input 
                      id="companyOwnership"
                      name="companyOwnership"
                      type="number" 
                      step="0.1"
                      min="0"
                      max="100"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.ownership : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyRevenue">Revenue ($M)</label>
                    <input 
                      id="companyRevenue"
                      name="companyRevenue"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.revenue : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyEbitda">EBITDA ($M)</label>
                    <input 
                      id="companyEbitda"
                      name="companyEbitda"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.ebitda : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyEbitdaMargin">EBITDA Margin (%)</label>
                    <input 
                      id="companyEbitdaMargin"
                      name="companyEbitdaMargin"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.ebitdaMargin : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyNetDebt">Net Debt ($M)</label>
                    <input 
                      id="companyNetDebt"
                      name="companyNetDebt"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.netDebt : ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyStatus">Status</label>
                    <select 
                      id="companyStatus"
                      name="companyStatus"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.status : 'active'}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="exited">Exited</option>
                      <option value="held-for-sale">Held for Sale</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyFundId">Fund</label>
                    <select 
                      id="companyFundId"
                      name="companyFundId"
                      className="input" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.fundId : selectedFund?.id || ''}
                      required
                    >
                      {funds.map(fund => (
                        <option key={fund.id} value={fund.id}>{fund.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Exit details - show only when status is 'exited' */}
                  {(editMode === 'edit' && selectedCompany?.status === 'exited') ||
                   document.getElementById('companyStatus')?.value === 'exited' ? (
                    <>
                      <div className="form-group">
                        <label className="form-label" htmlFor="companyExitDate">Exit Date</label>
                        <input 
                          id="companyExitDate"
                          name="companyExitDate"
                          type="date" 
                          className="input" 
                          defaultValue={editMode === 'edit' ? selectedCompany?.exitDate : ''}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="companyExitMultiple">Exit Multiple (x)</label>
                        <input 
                          id="companyExitMultiple"
                          name="companyExitMultiple"
                          type="number" 
                          step="0.1"
                          min="0"
                          className="input" 
                          defaultValue={editMode === 'edit' ? selectedCompany?.exitMultiple : ''}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="companyExitIrr">Exit IRR (%)</label>
                        <input 
                          id="companyExitIrr"
                          name="companyExitIrr"
                          type="number" 
                          step="0.1"
                          className="input" 
                          defaultValue={editMode === 'edit' ? selectedCompany?.exitIrr : ''}
                        />
                      </div>
                    </>
                  ) : null}
                  
                  <div className="form-group md:col-span-2">
                    <label className="form-label" htmlFor="companyInvestmentThesis">Investment Thesis</label>
                    <textarea 
                      id="companyInvestmentThesis"
                      name="companyInvestmentThesis"
                      className="input min-h-[100px]" 
                      defaultValue={editMode === 'edit' ? selectedCompany?.investmentThesis : ''}
                      required 
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editMode === 'add' ? 'Add Company' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {modalType === 'fundMetric' && (
            <div>
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  Update Fund Metrics
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleFundMetricSubmit}>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricFundId">Fund</label>
                    <select 
                      id="metricFundId"
                      name="metricFundId"
                      className="input" 
                      defaultValue={selectedFund?.id || ''}
                      required
                    >
                      {funds.map(fund => (
                        <option key={fund.id} value={fund.id}>{fund.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricDate">Date</label>
                    <input 
                      id="metricDate"
                      name="metricDate"
                      type="date" 
                      className="input" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricNav">NAV ($M)</label>
                    <input 
                      id="metricNav"
                      name="metricNav"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={selectedFund?.nav || ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricCalled">Called ($M)</label>
                    <input 
                      id="metricCalled"
                      name="metricCalled"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={selectedFund?.called || ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricDistributed">Distributed ($M)</label>
                    <input 
                      id="metricDistributed"
                      name="metricDistributed"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={selectedFund?.distributed || ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricIrr">IRR (%)</label>
                    <input 
                      id="metricIrr"
                      name="metricIrr"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={selectedFund?.irr || ''}
                      required 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <button 
                    type="button"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={generateFundMetricsTemplate}
                  >
                    <Download size={16} className="mr-1" />
                    Download template
                  </button>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Metrics
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {modalType === 'companyMetric' && (
            <div>
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  Update Company Metrics
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCompanyMetricSubmit}>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricCompanyId">Company</label>
                    <select 
                      id="metricCompanyId"
                      name="metricCompanyId"
                      className="input" 
                      defaultValue={selectedCompany?.id || ''}
                      required
                    >
                      {portfolioCompanies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricDate">Date</label>
                    <input 
                      id="metricDate"
                      name="metricDate"
                      type="date" 
                      className="input" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricRevenue">Revenue ($M)</label>
                    <input 
                      id="metricRevenue"
                      name="metricRevenue"
                      type="number" 
                      step="0.1"
                      min="0"
                      className="input" 
                      defaultValue={selectedCompany?.revenue || ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricEbitda">EBITDA ($M)</label>
                    <input 
                      id="metricEbitda"
                      name="metricEbitda"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={selectedCompany?.ebitda || ''}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="metricNetDebt">Net Debt ($M)</label>
                    <input 
                      id="metricNetDebt"
                      name="metricNetDebt"
                      type="number" 
                      step="0.1"
                      className="input" 
                      defaultValue={selectedCompany?.netDebt || ''}
                      required 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <button 
                    type="button"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={generateFinancialMetricsTemplate}
                  >
                    <Download size={16} className="mr-1" />
                    Download template
                  </button>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Metrics
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-slate-800 dark:shadow-slate-700/40">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Private Equity Portfolio Monitor</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Track performance across funds and portfolio companies</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="sr-only">{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </button>
              
              <div className="hidden md:flex items-center space-x-1">
                <div className="rounded-full bg-gray-200 dark:bg-slate-700 w-8 h-8 flex items-center justify-center text-gray-600 dark:text-slate-300">
                  <UserRound size={16} />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300">Fund Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeView === 'dashboard' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeView === 'funds' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => {
                setActiveView('funds');
                setSelectedFund(null);
              }}
            >
              Funds
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeView === 'companies' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => {
                setActiveView('companies');
                setSelectedFund(null);
              }}
            >
              Portfolio Companies
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'funds' && renderFundsList()}
        {activeView === 'companies' && renderCompaniesView()}
        
        {/* Modals */}
        {renderModals()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 dark:bg-slate-800 dark:border-slate-700 py-4 mt-auto">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App; // Added default export
