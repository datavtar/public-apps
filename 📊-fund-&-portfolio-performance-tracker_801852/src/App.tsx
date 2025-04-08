import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Portfolio,
  X,
  ChartBar,
  ChartPie,
  ChartLine,
  WalletCards,
  Building
} from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Types
  type FundType = {
    id: string;
    name: string;
    aum: number; // Assets under management
    vintage: number; // Fund vintage year
    irr: number; // Internal rate of return
    moic: number; // Multiple on invested capital
    dpi: number; // Distributions to paid-in
    tvpi: number; // Total value to paid-in
    strategy: string;
    status: 'Active' | 'Exited' | 'Fundraising';
    portfolioCompanies: string[];
  };

  type PortfolioCompanyType = {
    id: string;
    name: string;
    sector: string;
    investmentDate: string;
    investmentAmount: number;
    currentValue: number;
    revenue: number;
    ebitda: number;
    revenueGrowth: number;
    ebitdaMargin: number;
    fundId: string;
    status: 'Active' | 'Exited' | 'In Trouble';
    exitDate?: string;
    exitValue?: number;
  };

  type PerformanceMetricType = {
    id: string;
    date: string;
    fundId?: string;
    companyId?: string;
    revenue?: number;
    ebitda?: number;
    cashflow?: number;
    valuation?: number;
    employeeCount?: number;
  };

  // States
  const [funds, setFunds] = useState<FundType[]>([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompanyType[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricType[]>([]);
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState<boolean>(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState<boolean>(false);
  const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [view, setView] = useState<'funds' | 'companies' | 'dashboard'>('dashboard');
  const [newFund, setNewFund] = useState<Partial<FundType>>({
    name: '',
    aum: 0,
    vintage: new Date().getFullYear(),
    irr: 0,
    moic: 0,
    dpi: 0,
    tvpi: 0,
    strategy: '',
    status: 'Active',
    portfolioCompanies: []
  });
  const [newCompany, setNewCompany] = useState<Partial<PortfolioCompanyType>>({
    name: '',
    sector: '',
    investmentDate: new Date().toISOString().split('T')[0],
    investmentAmount: 0,
    currentValue: 0,
    revenue: 0,
    ebitda: 0,
    revenueGrowth: 0,
    ebitdaMargin: 0,
    fundId: '',
    status: 'Active'
  });
  const [newMetric, setNewMetric] = useState<Partial<PerformanceMetricType>>({
    date: new Date().toISOString().split('T')[0],
    fundId: '',
    companyId: '',
    revenue: 0,
    ebitda: 0,
    cashflow: 0,
    valuation: 0,
    employeeCount: 0
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string>('');

  // Refs for modal handling
  const addFundModalRef = useRef<HTMLDivElement>(null);
  const addCompanyModalRef = useRef<HTMLDivElement>(null);
  const addMetricModalRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFunds = localStorage.getItem('funds');
    const savedCompanies = localStorage.getItem('portfolioCompanies');
    const savedMetrics = localStorage.getItem('performanceMetrics');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedFunds) setFunds(JSON.parse(savedFunds));
    if (savedCompanies) setPortfolioCompanies(JSON.parse(savedCompanies));
    if (savedMetrics) setPerformanceMetrics(JSON.parse(savedMetrics));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');

    // If there's no data, initialize with sample data
    if (!savedFunds) {
      const sampleFunds = getInitialFundData();
      setFunds(sampleFunds);
      localStorage.setItem('funds', JSON.stringify(sampleFunds));
    }

    if (!savedCompanies) {
      const sampleCompanies = getInitialCompanyData();
      setPortfolioCompanies(sampleCompanies);
      localStorage.setItem('portfolioCompanies', JSON.stringify(sampleCompanies));
    }

    if (!savedMetrics) {
      const sampleMetrics = getInitialMetricsData();
      setPerformanceMetrics(sampleMetrics);
      localStorage.setItem('performanceMetrics', JSON.stringify(sampleMetrics));
    }

    // Apply dark mode if saved
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('funds', JSON.stringify(funds));
  }, [funds]);

  useEffect(() => {
    localStorage.setItem('portfolioCompanies', JSON.stringify(portfolioCompanies));
  }, [portfolioCompanies]);

  useEffect(() => {
    localStorage.setItem('performanceMetrics', JSON.stringify(performanceMetrics));
  }, [performanceMetrics]);

  // Close modals when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddFundModalOpen(false);
        setIsAddCompanyModalOpen(false);
        setIsAddMetricModalOpen(false);
        document.body.classList.remove('modal-open');
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAddFundModalOpen && addFundModalRef.current && !addFundModalRef.current.contains(event.target as Node)) {
        setIsAddFundModalOpen(false);
        document.body.classList.remove('modal-open');
      }
      if (isAddCompanyModalOpen && addCompanyModalRef.current && !addCompanyModalRef.current.contains(event.target as Node)) {
        setIsAddCompanyModalOpen(false);
        document.body.classList.remove('modal-open');
      }
      if (isAddMetricModalOpen && addMetricModalRef.current && !addMetricModalRef.current.contains(event.target as Node)) {
        setIsAddMetricModalOpen(false);
        document.body.classList.remove('modal-open');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddFundModalOpen, isAddCompanyModalOpen, isAddMetricModalOpen]);

  // Initial data for funds
  const getInitialFundData = (): FundType[] => {
    return [
      {
        id: 'fund1',
        name: 'Growth Equity Fund I',
        aum: 500000000,
        vintage: 2018,
        irr: 18.5,
        moic: 2.3,
        dpi: 0.8,
        tvpi: 1.9,
        strategy: 'Growth Equity',
        status: 'Active',
        portfolioCompanies: ['company1', 'company2']
      },
      {
        id: 'fund2',
        name: 'Buyout Fund III',
        aum: 1200000000,
        vintage: 2019,
        irr: 22.1,
        moic: 1.8,
        dpi: 0.4,
        tvpi: 1.7,
        strategy: 'Buyout',
        status: 'Active',
        portfolioCompanies: ['company3', 'company4']
      },
      {
        id: 'fund3',
        name: 'Venture Capital Fund II',
        aum: 350000000,
        vintage: 2020,
        irr: 26.8,
        moic: 2.1,
        dpi: 0.3,
        tvpi: 2.0,
        strategy: 'Venture Capital',
        status: 'Active',
        portfolioCompanies: ['company5']
      }
    ];
  };

  // Initial data for portfolio companies
  const getInitialCompanyData = (): PortfolioCompanyType[] => {
    return [
      {
        id: 'company1',
        name: 'TechSolutions Inc.',
        sector: 'Technology',
        investmentDate: '2018-05-15',
        investmentAmount: 25000000,
        currentValue: 45000000,
        revenue: 30000000,
        ebitda: 8000000,
        revenueGrowth: 22.5,
        ebitdaMargin: 26.7,
        fundId: 'fund1',
        status: 'Active'
      },
      {
        id: 'company2',
        name: 'HealthCare Innovations',
        sector: 'Healthcare',
        investmentDate: '2018-09-20',
        investmentAmount: 35000000,
        currentValue: 75000000,
        revenue: 50000000,
        ebitda: 12000000,
        revenueGrowth: 30.2,
        ebitdaMargin: 24.0,
        fundId: 'fund1',
        status: 'Active'
      },
      {
        id: 'company3',
        name: 'Consumer Retail Group',
        sector: 'Retail',
        investmentDate: '2019-03-10',
        investmentAmount: 45000000,
        currentValue: 60000000,
        revenue: 120000000,
        ebitda: 22000000,
        revenueGrowth: 15.3,
        ebitdaMargin: 18.3,
        fundId: 'fund2',
        status: 'Active'
      },
      {
        id: 'company4',
        name: 'Manufacturing Solutions',
        sector: 'Industrial',
        investmentDate: '2019-11-05',
        investmentAmount: 60000000,
        currentValue: 85000000,
        revenue: 180000000,
        ebitda: 32000000,
        revenueGrowth: 12.8,
        ebitdaMargin: 17.8,
        fundId: 'fund2',
        status: 'Active'
      },
      {
        id: 'company5',
        name: 'Software Platforms Co.',
        sector: 'Technology',
        investmentDate: '2020-07-22',
        investmentAmount: 30000000,
        currentValue: 50000000,
        revenue: 25000000,
        ebitda: 5000000,
        revenueGrowth: 35.5,
        ebitdaMargin: 20.0,
        fundId: 'fund3',
        status: 'Active'
      }
    ];
  };

  // Initial data for performance metrics
  const getInitialMetricsData = (): PerformanceMetricType[] => {
    return [
      {
        id: 'metric1',
        date: '2023-01-01',
        companyId: 'company1',
        revenue: 25000000,
        ebitda: 6000000,
        cashflow: 5000000,
        valuation: 40000000,
        employeeCount: 120
      },
      {
        id: 'metric2',
        date: '2023-04-01',
        companyId: 'company1',
        revenue: 27500000,
        ebitda: 7000000,
        cashflow: 5500000,
        valuation: 42000000,
        employeeCount: 135
      },
      {
        id: 'metric3',
        date: '2023-07-01',
        companyId: 'company1',
        revenue: 29000000,
        ebitda: 7500000,
        cashflow: 6000000,
        valuation: 44000000,
        employeeCount: 145
      },
      {
        id: 'metric4',
        date: '2023-10-01',
        companyId: 'company1',
        revenue: 30000000,
        ebitda: 8000000,
        cashflow: 6500000,
        valuation: 45000000,
        employeeCount: 150
      },
      {
        id: 'metric5',
        date: '2023-01-01',
        companyId: 'company2',
        revenue: 40000000,
        ebitda: 9000000,
        cashflow: 8000000,
        valuation: 60000000,
        employeeCount: 210
      },
      {
        id: 'metric6',
        date: '2023-04-01',
        companyId: 'company2',
        revenue: 44000000,
        ebitda: 10000000,
        cashflow: 9000000,
        valuation: 65000000,
        employeeCount: 230
      },
      {
        id: 'metric7',
        date: '2023-07-01',
        companyId: 'company2',
        revenue: 47000000,
        ebitda: 11000000,
        cashflow: 10000000,
        valuation: 70000000,
        employeeCount: 245
      },
      {
        id: 'metric8',
        date: '2023-10-01',
        companyId: 'company2',
        revenue: 50000000,
        ebitda: 12000000,
        cashflow: 11000000,
        valuation: 75000000,
        employeeCount: 250
      },
      {
        id: 'metric9',
        date: '2023-01-01',
        fundId: 'fund1',
        valuation: 420000000
      },
      {
        id: 'metric10',
        date: '2023-04-01',
        fundId: 'fund1',
        valuation: 450000000
      },
      {
        id: 'metric11',
        date: '2023-07-01',
        fundId: 'fund1',
        valuation: 480000000
      },
      {
        id: 'metric12',
        date: '2023-10-01',
        fundId: 'fund1',
        valuation: 500000000
      }
    ];
  };

  // Handle form changes
  const handleFundFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | string[] = value;

    // Convert numeric values
    if (['aum', 'vintage', 'irr', 'moic', 'dpi', 'tvpi'].includes(name)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    setNewFund(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric values
    if (['investmentAmount', 'currentValue', 'revenue', 'ebitda', 'revenueGrowth', 'ebitdaMargin'].includes(name)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    setNewCompany(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleMetricFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric values
    if (['revenue', 'ebitda', 'cashflow', 'valuation', 'employeeCount'].includes(name)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    setNewMetric(prev => ({ ...prev, [name]: processedValue }));
  };

  // Handle form submissions
  const handleAddFund = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editId) {
      // Update existing fund
      const updatedFunds = funds.map(fund => 
        fund.id === editId 
          ? { ...fund, ...newFund } as FundType
          : fund
      );
      setFunds(updatedFunds);
    } else {
      // Add new fund
      const newId = `fund${Date.now()}`;
      const fundToAdd: FundType = {
        id: newId,
        ...newFund as Omit<FundType, 'id'>,
        portfolioCompanies: []
      } as FundType;
      setFunds([...funds, fundToAdd]);
    }
    
    // Reset form and close modal
    resetFundForm();
    setIsAddFundModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editId) {
      // Update existing company
      const updatedCompanies = portfolioCompanies.map(company => 
        company.id === editId 
          ? { ...company, ...newCompany } as PortfolioCompanyType
          : company
      );
      setPortfolioCompanies(updatedCompanies);

      // Update fund's portfolioCompanies array if fundId changed
      const originalCompany = portfolioCompanies.find(company => company.id === editId);
      if (originalCompany && originalCompany.fundId !== newCompany.fundId) {
        // Remove from old fund
        const updatedFunds = funds.map(fund => {
          if (fund.id === originalCompany.fundId) {
            return {
              ...fund,
              portfolioCompanies: fund.portfolioCompanies.filter(id => id !== editId)
            };
          }
          return fund;
        });

        // Add to new fund
        const finalFunds = updatedFunds.map(fund => {
          if (fund.id === newCompany.fundId) {
            return {
              ...fund,
              portfolioCompanies: [...fund.portfolioCompanies, editId]
            };
          }
          return fund;
        });

        setFunds(finalFunds);
      }
    } else {
      // Add new company
      const newId = `company${Date.now()}`;
      const companyToAdd: PortfolioCompanyType = {
        id: newId,
        ...newCompany as Omit<PortfolioCompanyType, 'id'>
      } as PortfolioCompanyType;
      setPortfolioCompanies([...portfolioCompanies, companyToAdd]);

      // Add to fund's portfolioCompanies array
      if (newCompany.fundId) {
        const updatedFunds = funds.map(fund => {
          if (fund.id === newCompany.fundId) {
            return {
              ...fund,
              portfolioCompanies: [...fund.portfolioCompanies, newId]
            };
          }
          return fund;
        });
        setFunds(updatedFunds);
      }
    }
    
    // Reset form and close modal
    resetCompanyForm();
    setIsAddCompanyModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editId) {
      // Update existing metric
      const updatedMetrics = performanceMetrics.map(metric => 
        metric.id === editId 
          ? { ...metric, ...newMetric } as PerformanceMetricType
          : metric
      );
      setPerformanceMetrics(updatedMetrics);
    } else {
      // Add new metric
      const newId = `metric${Date.now()}`;
      const metricToAdd: PerformanceMetricType = {
        id: newId,
        ...newMetric as Omit<PerformanceMetricType, 'id'>
      } as PerformanceMetricType;
      setPerformanceMetrics([...performanceMetrics, metricToAdd]);
    }
    
    // Reset form and close modal
    resetMetricForm();
    setIsAddMetricModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Handle delete operations
  const handleDeleteFund = (id: string) => {
    // Find fund to delete
    const fundToDelete = funds.find(fund => fund.id === id);

    if (!fundToDelete) return;

    // Delete associated companies
    const updatedCompanies = portfolioCompanies.filter(
      company => company.fundId !== id
    );

    // Delete associated metrics
    const updatedMetrics = performanceMetrics.filter(
      metric => metric.fundId !== id
    );

    // Delete the fund
    const updatedFunds = funds.filter(fund => fund.id !== id);

    setPortfolioCompanies(updatedCompanies);
    setPerformanceMetrics(updatedMetrics);
    setFunds(updatedFunds);
  };

  const handleDeleteCompany = (id: string) => {
    // Find company to delete
    const companyToDelete = portfolioCompanies.find(company => company.id === id);

    if (!companyToDelete) return;

    // Remove from fund's portfolioCompanies array
    const updatedFunds = funds.map(fund => {
      if (fund.id === companyToDelete.fundId) {
        return {
          ...fund,
          portfolioCompanies: fund.portfolioCompanies.filter(companyId => companyId !== id)
        };
      }
      return fund;
    });

    // Delete associated metrics
    const updatedMetrics = performanceMetrics.filter(
      metric => metric.companyId !== id
    );

    // Delete the company
    const updatedCompanies = portfolioCompanies.filter(company => company.id !== id);

    setFunds(updatedFunds);
    setPerformanceMetrics(updatedMetrics);
    setPortfolioCompanies(updatedCompanies);
  };

  const handleDeleteMetric = (id: string) => {
    setPerformanceMetrics(performanceMetrics.filter(metric => metric.id !== id));
  };

  // Handle edit operations
  const handleEditFund = (id: string) => {
    const fundToEdit = funds.find(fund => fund.id === id);
    if (fundToEdit) {
      setNewFund(fundToEdit);
      setIsEditing(true);
      setEditId(id);
      setIsAddFundModalOpen(true);
      document.body.classList.add('modal-open');
    }
  };

  const handleEditCompany = (id: string) => {
    const companyToEdit = portfolioCompanies.find(company => company.id === id);
    if (companyToEdit) {
      setNewCompany(companyToEdit);
      setIsEditing(true);
      setEditId(id);
      setIsAddCompanyModalOpen(true);
      document.body.classList.add('modal-open');
    }
  };

  const handleEditMetric = (id: string) => {
    const metricToEdit = performanceMetrics.find(metric => metric.id === id);
    if (metricToEdit) {
      setNewMetric(metricToEdit);
      setIsEditing(true);
      setEditId(id);
      setIsAddMetricModalOpen(true);
      document.body.classList.add('modal-open');
    }
  };

  // Reset form functions
  const resetFundForm = () => {
    setNewFund({
      name: '',
      aum: 0,
      vintage: new Date().getFullYear(),
      irr: 0,
      moic: 0,
      dpi: 0,
      tvpi: 0,
      strategy: '',
      status: 'Active',
      portfolioCompanies: []
    });
    setIsEditing(false);
    setEditId('');
  };

  const resetCompanyForm = () => {
    setNewCompany({
      name: '',
      sector: '',
      investmentDate: new Date().toISOString().split('T')[0],
      investmentAmount: 0,
      currentValue: 0,
      revenue: 0,
      ebitda: 0,
      revenueGrowth: 0,
      ebitdaMargin: 0,
      fundId: '',
      status: 'Active'
    });
    setIsEditing(false);
    setEditId('');
  };

  const resetMetricForm = () => {
    setNewMetric({
      date: new Date().toISOString().split('T')[0],
      fundId: '',
      companyId: '',
      revenue: 0,
      ebitda: 0,
      cashflow: 0,
      valuation: 0,
      employeeCount: 0
    });
    setIsEditing(false);
    setEditId('');
  };

  // Utility functions for rendering and calculations
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatMultiple = (value: number): string => {
    return value.toFixed(2) + 'x';
  };

  const getPortfolioCompaniesForFund = (fundId: string): PortfolioCompanyType[] => {
    return portfolioCompanies.filter(company => company.fundId === fundId);
  };

  const getMetricsForCompany = (companyId: string): PerformanceMetricType[] => {
    return performanceMetrics
      .filter(metric => metric.companyId === companyId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMetricsForFund = (fundId: string): PerformanceMetricType[] => {
    return performanceMetrics
      .filter(metric => metric.fundId === fundId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getCompanyPerformanceData = (companyId: string) => {
    const companyMetrics = getMetricsForCompany(companyId);
    const company = portfolioCompanies.find(company => company.id === companyId);

    if (!company || companyMetrics.length === 0) return [];

    return companyMetrics.map(metric => ({
      date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: metric.revenue,
      ebitda: metric.ebitda,
      valuation: metric.valuation,
    }));
  };

  const getFundPerformanceData = (fundId: string) => {
    const fundMetrics = getMetricsForFund(fundId);
    const fund = funds.find(fund => fund.id === fundId);

    if (!fund || fundMetrics.length === 0) return [];

    return fundMetrics.map(metric => ({
      date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      valuation: metric.valuation,
    }));
  };

  const calculateAggregatePortfolioMetrics = () => {
    const totalAUM = funds.reduce((total, fund) => total + fund.aum, 0);
    const totalCompanies = portfolioCompanies.length;
    
    const activeCompanies = portfolioCompanies.filter(company => company.status === 'Active').length;
    const exitedCompanies = portfolioCompanies.filter(company => company.status === 'Exited').length;
    const troubleCompanies = portfolioCompanies.filter(company => company.status === 'In Trouble').length;
    
    const activeFunds = funds.filter(fund => fund.status === 'Active').length;
    const exitedFunds = funds.filter(fund => fund.status === 'Exited').length;
    const fundraisingFunds = funds.filter(fund => fund.status === 'Fundraising').length;
    
    const avgIRR = funds.reduce((total, fund) => total + fund.irr, 0) / funds.length;
    const avgMOIC = funds.reduce((total, fund) => total + fund.moic, 0) / funds.length;
    
    const sectorDistribution = portfolioCompanies.reduce((acc, company) => {
      if (!acc[company.sector]) {
        acc[company.sector] = 0;
      }
      acc[company.sector] += company.currentValue;
      return acc;
    }, {} as Record<string, number>);
    
    const sectorAllocation = Object.entries(sectorDistribution).map(([name, value]) => ({
      name,
      value
    }));
    
    const fundSizeDistribution = funds.map(fund => ({
      name: fund.name,
      value: fund.aum
    }));
    
    return {
      totalAUM,
      totalCompanies,
      activeCompanies,
      exitedCompanies,
      troubleCompanies,
      activeFunds,
      exitedFunds,
      fundraisingFunds,
      avgIRR,
      avgMOIC,
      sectorAllocation,
      fundSizeDistribution
    };
  };

  // Filter and search functions
  const getFilteredFunds = () => {
    return funds
      .filter(fund => {
        const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            fund.strategy.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || fund.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const getFilteredCompanies = () => {
    return portfolioCompanies
      .filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            company.sector.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || company.status === filterStatus;
        const matchesFund = !selectedFund || company.fundId === selectedFund;
        return matchesSearch && matchesStatus && matchesFund;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Modal handlers
  const openAddFundModal = () => {
    resetFundForm();
    setIsAddFundModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const openAddCompanyModal = () => {
    resetCompanyForm();
    setIsAddCompanyModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const openAddMetricModal = () => {
    resetMetricForm();
    setIsAddMetricModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Color constants for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  // Dashboard calculations
  const dashboardMetrics = calculateAggregatePortfolioMetrics();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-all duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between flex-wrap gap-4">
            <div className="flex items-center">
              <WalletCards className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PE Fund Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-4">
                <button 
                  onClick={() => setView('dashboard')} 
                  className={`px-3 py-2 rounded-md font-medium ${view === 'dashboard' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                  role="tab"
                  aria-selected={view === 'dashboard'}
                >
                  <span className="flex items-center">
                    <ChartBar className="h-4 w-4 mr-1" /> Dashboard
                  </span>
                </button>
                <button 
                  onClick={() => setView('funds')} 
                  className={`px-3 py-2 rounded-md font-medium ${view === 'funds' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                  role="tab"
                  aria-selected={view === 'funds'}
                >
                  <span className="flex items-center">
                    <WalletCards className="h-4 w-4 mr-1" /> Funds
                  </span>
                </button>
                <button 
                  onClick={() => setView('companies')} 
                  className={`px-3 py-2 rounded-md font-medium ${view === 'companies' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                  role="tab"
                  aria-selected={view === 'companies'}
                >
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1" /> Portfolio Companies
                  </span>
                </button>
              </nav>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="theme-toggle"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
          {/* Mobile Navigation */}
          <div className="md:hidden mt-3">
            <div className="flex space-x-1">
              <button 
                onClick={() => setView('dashboard')} 
                className={`flex-1 px-2 py-1.5 rounded-md text-sm font-medium ${view === 'dashboard' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}
                role="tab"
                aria-selected={view === 'dashboard'}
              >
                <span className="flex items-center justify-center">
                  <ChartBar className="h-4 w-4 mr-1" /> Dashboard
                </span>
              </button>
              <button 
                onClick={() => setView('funds')} 
                className={`flex-1 px-2 py-1.5 rounded-md text-sm font-medium ${view === 'funds' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}
                role="tab"
                aria-selected={view === 'funds'}
              >
                <span className="flex items-center justify-center">
                  <WalletCards className="h-4 w-4 mr-1" /> Funds
                </span>
              </button>
              <button 
                onClick={() => setView('companies')} 
                className={`flex-1 px-2 py-1.5 rounded-md text-sm font-medium ${view === 'companies' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}
                role="tab"
                aria-selected={view === 'companies'}
              >
                <span className="flex items-center justify-center">
                  <Building className="h-4 w-4 mr-1" /> Companies
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="stat-card">
                <div className="flex-between">
                  <div className="stat-title">Total AUM</div>
                  <DollarSign className="h-5 w-5 text-primary-500" />
                </div>
                <div className="stat-value">{formatCurrency(dashboardMetrics.totalAUM)}</div>
                <div className="stat-desc">{funds.length} Active Funds</div>
              </div>
              
              <div className="stat-card">
                <div className="flex-between">
                  <div className="stat-title">Portfolio Companies</div>
                  <Building className="h-5 w-5 text-primary-500" />
                </div>
                <div className="stat-value">{dashboardMetrics.totalCompanies}</div>
                <div className="stat-desc">{dashboardMetrics.activeCompanies} Active, {dashboardMetrics.exitedCompanies} Exited</div>
              </div>
              
              <div className="stat-card">
                <div className="flex-between">
                  <div className="stat-title">Average IRR</div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="stat-value">{formatPercentage(dashboardMetrics.avgIRR)}</div>
                <div className="stat-desc">Across all funds</div>
              </div>
              
              <div className="stat-card">
                <div className="flex-between">
                  <div className="stat-title">Average MOIC</div>
                  <Percent className="h-5 w-5 text-blue-500" />
                </div>
                <div className="stat-value">{formatMultiple(dashboardMetrics.avgMOIC)}</div>
                <div className="stat-desc">Return multiple</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Allocation Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sector Allocation</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardMetrics.sectorAllocation}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardMetrics.sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Investment']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Fund Size Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fund Size Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardMetrics.fundSizeDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'AUM']} />
                      <Bar dataKey="value" fill="#8884d8">
                        {dashboardMetrics.fundSizeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fund Performance Section */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fund Performance Metrics</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Fund Name</th>
                      <th className="table-header">AUM</th>
                      <th className="table-header">Vintage</th>
                      <th className="table-header">IRR</th>
                      <th className="table-header">MOIC</th>
                      <th className="table-header">DPI</th>
                      <th className="table-header">TVPI</th>
                      <th className="table-header">Companies</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {funds.map(fund => (
                      <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{fund.name}</td>
                        <td className="table-cell">{formatCurrency(fund.aum)}</td>
                        <td className="table-cell">{fund.vintage}</td>
                        <td className="table-cell">{formatPercentage(fund.irr)}</td>
                        <td className="table-cell">{formatMultiple(fund.moic)}</td>
                        <td className="table-cell">{formatMultiple(fund.dpi)}</td>
                        <td className="table-cell">{formatMultiple(fund.tvpi)}</td>
                        <td className="table-cell">{fund.portfolioCompanies.length}</td>
                        <td className="table-cell">
                          <span className={`badge ${fund.status === 'Active' ? 'badge-success' : fund.status === 'Exited' ? 'badge-info' : 'badge-warning'}`}>
                            {fund.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Funds View */}
        {view === 'funds' && (
          <div className="space-y-6">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search funds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search funds"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Exited">Exited</option>
                    <option value="Fundraising">Fundraising</option>
                  </select>
                </div>
                <button
                  className="btn btn-primary flex items-center justify-center"
                  onClick={openAddFundModal}
                  aria-label="Add new fund"
                >
                  <Plus className="h-5 w-5 mr-1" /> Add Fund
                </button>
              </div>
            </div>

            {/* Funds Table */}
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Fund Name</th>
                      <th className="table-header px-6 py-3">AUM</th>
                      <th className="table-header px-6 py-3">Vintage</th>
                      <th className="table-header px-6 py-3">IRR</th>
                      <th className="table-header px-6 py-3">MOIC</th>
                      <th className="table-header px-6 py-3">Companies</th>
                      <th className="table-header px-6 py-3">Strategy</th>
                      <th className="table-header px-6 py-3">Status</th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredFunds().map(fund => (
                      <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell px-6 py-4 font-medium">{fund.name}</td>
                        <td className="table-cell px-6 py-4">{formatCurrency(fund.aum)}</td>
                        <td className="table-cell px-6 py-4">{fund.vintage}</td>
                        <td className="table-cell px-6 py-4">{formatPercentage(fund.irr)}</td>
                        <td className="table-cell px-6 py-4">{formatMultiple(fund.moic)}</td>
                        <td className="table-cell px-6 py-4">{fund.portfolioCompanies.length}</td>
                        <td className="table-cell px-6 py-4">{fund.strategy}</td>
                        <td className="table-cell px-6 py-4">
                          <span className={`badge ${fund.status === 'Active' ? 'badge-success' : fund.status === 'Exited' ? 'badge-info' : 'badge-warning'}`}>
                            {fund.status}
                          </span>
                        </td>
                        <td className="table-cell px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEditFund(fund.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label={`Edit ${fund.name}`}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFund(fund.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            aria-label={`Delete ${fund.name}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {getFilteredFunds().length === 0 && (
                      <tr>
                        <td colSpan={9} className="table-cell text-center py-8">
                          No funds found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fund Details (if selected) */}
            {selectedFund && (
              <div className="card">
                <div className="flex-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {funds.find(f => f.id === selectedFund)?.name || 'Fund Details'}
                  </h3>
                  <button
                    onClick={() => setSelectedFund(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label="Close fund details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Fund Performance Chart */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Fund Valuation Over Time</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getFundPerformanceData(selectedFund)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valuation']} />
                        <Legend />
                        <Line type="monotone" dataKey="valuation" stroke="#8884d8" activeDot={{ r: 8 }} name="Valuation" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Portfolio Companies in this Fund */}
                <div>
                  <div className="flex-between mb-3">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Portfolio Companies</h4>
                    <button
                      className="btn btn-sm btn-primary flex items-center"
                      onClick={() => {
                        setNewCompany(prev => ({ ...prev, fundId: selectedFund }));
                        openAddCompanyModal();
                      }}
                      aria-label="Add company to this fund"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Company
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="table-header">Name</th>
                          <th className="table-header">Sector</th>
                          <th className="table-header">Investment</th>
                          <th className="table-header">Current Value</th>
                          <th className="table-header">Multiple</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                        {getPortfolioCompaniesForFund(selectedFund).map(company => (
                          <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="table-cell font-medium">{company.name}</td>
                            <td className="table-cell">{company.sector}</td>
                            <td className="table-cell">{formatCurrency(company.investmentAmount)}</td>
                            <td className="table-cell">{formatCurrency(company.currentValue)}</td>
                            <td className="table-cell">{formatMultiple(company.currentValue / company.investmentAmount)}</td>
                            <td className="table-cell">
                              <span className={`badge ${company.status === 'Active' ? 'badge-success' : company.status === 'Exited' ? 'badge-info' : 'badge-error'}`}>
                                {company.status}
                              </span>
                            </td>
                            <td className="table-cell flex gap-2">
                              <button
                                onClick={() => setSelectedCompany(company.id)}
                                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                aria-label={`View ${company.name}`}
                              >
                                <ChartBar className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditCompany(company.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                aria-label={`Edit ${company.name}`}
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(company.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                aria-label={`Delete ${company.name}`}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {getPortfolioCompaniesForFund(selectedFund).length === 0 && (
                          <tr>
                            <td colSpan={7} className="table-cell text-center py-8">
                              No companies in this fund yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Companies View */}
        {view === 'companies' && (
          <div className="space-y-6">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search companies"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Exited">Exited</option>
                    <option value="In Trouble">In Trouble</option>
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <WalletCards className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 pr-8"
                    value={selectedFund || ''}
                    onChange={(e) => setSelectedFund(e.target.value || null)}
                    aria-label="Filter by fund"
                  >
                    <option value="">All Funds</option>
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary flex items-center justify-center"
                  onClick={openAddCompanyModal}
                  aria-label="Add new company"
                >
                  <Plus className="h-5 w-5 mr-1" /> Add Company
                </button>
              </div>
            </div>

            {/* Companies Table */}
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Company Name</th>
                      <th className="table-header px-6 py-3">Sector</th>
                      <th className="table-header px-6 py-3">Fund</th>
                      <th className="table-header px-6 py-3">Investment</th>
                      <th className="table-header px-6 py-3">Current Value</th>
                      <th className="table-header px-6 py-3">Multiple</th>
                      <th className="table-header px-6 py-3">Revenue Growth</th>
                      <th className="table-header px-6 py-3">EBITDA Margin</th>
                      <th className="table-header px-6 py-3">Status</th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredCompanies().map(company => {
                      const fund = funds.find(f => f.id === company.fundId);
                      return (
                        <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="table-cell px-6 py-4 font-medium">{company.name}</td>
                          <td className="table-cell px-6 py-4">{company.sector}</td>
                          <td className="table-cell px-6 py-4">{fund?.name || 'N/A'}</td>
                          <td className="table-cell px-6 py-4">{formatCurrency(company.investmentAmount)}</td>
                          <td className="table-cell px-6 py-4">{formatCurrency(company.currentValue)}</td>
                          <td className="table-cell px-6 py-4">{formatMultiple(company.currentValue / company.investmentAmount)}</td>
                          <td className="table-cell px-6 py-4">
                            <span className={company.revenueGrowth >= 15 ? 'text-green-600 dark:text-green-400' : company.revenueGrowth <= 5 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}>
                              {formatPercentage(company.revenueGrowth)}
                            </span>
                          </td>
                          <td className="table-cell px-6 py-4">
                            <span className={company.ebitdaMargin >= 20 ? 'text-green-600 dark:text-green-400' : company.ebitdaMargin <= 10 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}>
                              {formatPercentage(company.ebitdaMargin)}
                            </span>
                          </td>
                          <td className="table-cell px-6 py-4">
                            <span className={`badge ${company.status === 'Active' ? 'badge-success' : company.status === 'Exited' ? 'badge-info' : 'badge-error'}`}>
                              {company.status}
                            </span>
                          </td>
                          <td className="table-cell px-6 py-4 flex gap-2">
                            <button
                              onClick={() => setSelectedCompany(company.id)}
                              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                              aria-label={`View ${company.name}`}
                            >
                              <ChartBar className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditCompany(company.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              aria-label={`Edit ${company.name}`}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(company.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              aria-label={`Delete ${company.name}`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {getFilteredCompanies().length === 0 && (
                      <tr>
                        <td colSpan={10} className="table-cell text-center py-8">
                          No companies found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Company Details (if selected) */}
            {selectedCompany && (
              <div className="card">
                {(() => {
                  const company = portfolioCompanies.find(c => c.id === selectedCompany);
                  if (!company) return null;
                  
                  const fund = funds.find(f => f.id === company.fundId);
                  const companyMetrics = getMetricsForCompany(selectedCompany);
                  const performanceData = getCompanyPerformanceData(selectedCompany);
                  
                  return (
                    <>
                      <div className="flex-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {company.name}
                        </h3>
                        <button
                          onClick={() => setSelectedCompany(null)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label="Close company details"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Company Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="stat-card">
                          <div className="stat-title">Investment</div>
                          <div className="stat-value">{formatCurrency(company.investmentAmount)}</div>
                          <div className="stat-desc">Date: {new Date(company.investmentDate).toLocaleDateString()}</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-title">Current Value</div>
                          <div className="stat-value">{formatCurrency(company.currentValue)}</div>
                          <div className="stat-desc">Multiple: {formatMultiple(company.currentValue / company.investmentAmount)}</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-title">Fund</div>
                          <div className="stat-value truncate">{fund?.name || 'N/A'}</div>
                          <div className="stat-desc">{fund?.strategy || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Performance Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Financial Performance</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value) => [formatCurrency(value as number), '']} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue" />
                                <Line yAxisId="left" type="monotone" dataKey="ebitda" stroke="#82ca9d" name="EBITDA" />
                                <Line yAxisId="right" type="monotone" dataKey="valuation" stroke="#ff7300" name="Valuation" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Key Metrics</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[{ ...company, ebitdaMarginValue: company.revenue * (company.ebitdaMargin / 100) }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                                <Tooltip formatter={(value) => [formatCurrency(value as number), '']} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                                <Bar dataKey="ebitdaMarginValue" fill="#82ca9d" name="EBITDA" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div>
                        <div className="flex-between mb-3">
                          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Historical Metrics</h4>
                          <button
                            className="btn btn-sm btn-primary flex items-center"
                            onClick={() => {
                              setNewMetric(prev => ({ ...prev, companyId: selectedCompany }));
                              openAddMetricModal();
                            }}
                            aria-label="Add performance metric"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Metric
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="table">
                            <thead>
                              <tr>
                                <th className="table-header">Date</th>
                                <th className="table-header">Revenue</th>
                                <th className="table-header">EBITDA</th>
                                <th className="table-header">Cashflow</th>
                                <th className="table-header">Valuation</th>
                                <th className="table-header">Employees</th>
                                <th className="table-header">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                              {companyMetrics.map(metric => (
                                <tr key={metric.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                  <td className="table-cell">{new Date(metric.date).toLocaleDateString()}</td>
                                  <td className="table-cell">{metric.revenue ? formatCurrency(metric.revenue) : 'N/A'}</td>
                                  <td className="table-cell">{metric.ebitda ? formatCurrency(metric.ebitda) : 'N/A'}</td>
                                  <td className="table-cell">{metric.cashflow ? formatCurrency(metric.cashflow) : 'N/A'}</td>
                                  <td className="table-cell">{metric.valuation ? formatCurrency(metric.valuation) : 'N/A'}</td>
                                  <td className="table-cell">{metric.employeeCount || 'N/A'}</td>
                                  <td className="table-cell flex gap-2">
                                    <button
                                      onClick={() => handleEditMetric(metric.id)}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                      aria-label={`Edit metric from ${new Date(metric.date).toLocaleDateString()}`}
                                    >
                                      <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMetric(metric.id)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                      aria-label={`Delete metric from ${new Date(metric.date).toLocaleDateString()}`}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {companyMetrics.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="table-cell text-center py-8">
                                    No performance metrics recorded yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Add/Edit Fund Modal */}
      {isAddFundModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fund-modal-title">
          <div className="modal-content" ref={addFundModalRef}>
            <div className="modal-header">
              <h3 id="fund-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Fund' : 'Add New Fund'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddFundModalOpen(false);
                  document.body.classList.remove('modal-open');
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddFund}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="fundName" className="form-label">Fund Name</label>
                  <input 
                    id="fundName" 
                    type="text" 
                    name="name" 
                    value={newFund.name} 
                    onChange={handleFundFormChange} 
                    className="input"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fundAum" className="form-label">AUM ($)</label>
                    <input 
                      id="fundAum" 
                      type="number" 
                      name="aum" 
                      value={newFund.aum} 
                      onChange={handleFundFormChange} 
                      className="input"
                      min="0"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fundVintage" className="form-label">Vintage Year</label>
                    <input 
                      id="fundVintage" 
                      type="number" 
                      name="vintage" 
                      value={newFund.vintage} 
                      onChange={handleFundFormChange} 
                      className="input"
                      min="1980"
                      max={new Date().getFullYear()}
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fundIrr" className="form-label">IRR (%)</label>
                    <input 
                      id="fundIrr" 
                      type="number" 
                      name="irr" 
                      value={newFund.irr} 
                      onChange={handleFundFormChange} 
                      className="input"
                      step="0.1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fundMoic" className="form-label">MOIC (x)</label>
                    <input 
                      id="fundMoic" 
                      type="number" 
                      name="moic" 
                      value={newFund.moic} 
                      onChange={handleFundFormChange} 
                      className="input"
                      step="0.1"
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fundDpi" className="form-label">DPI (x)</label>
                    <input 
                      id="fundDpi" 
                      type="number" 
                      name="dpi" 
                      value={newFund.dpi} 
                      onChange={handleFundFormChange} 
                      className="input"
                      step="0.1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fundTvpi" className="form-label">TVPI (x)</label>
                    <input 
                      id="fundTvpi" 
                      type="number" 
                      name="tvpi" 
                      value={newFund.tvpi} 
                      onChange={handleFundFormChange} 
                      className="input"
                      step="0.1"
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="fundStrategy" className="form-label">Investment Strategy</label>
                  <input 
                    id="fundStrategy" 
                    type="text" 
                    name="strategy" 
                    value={newFund.strategy} 
                    onChange={handleFundFormChange} 
                    className="input"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fundStatus" className="form-label">Fund Status</label>
                  <select
                    id="fundStatus"
                    name="status"
                    value={newFund.status}
                    onChange={handleFundFormChange}
                    className="input"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Exited">Exited</option>
                    <option value="Fundraising">Fundraising</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddFundModalOpen(false);
                    document.body.classList.remove('modal-open');
                  }}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Fund' : 'Add Fund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Company Modal */}
      {isAddCompanyModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="company-modal-title">
          <div className="modal-content" ref={addCompanyModalRef}>
            <div className="modal-header">
              <h3 id="company-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddCompanyModalOpen(false);
                  document.body.classList.remove('modal-open');
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCompany}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="companyName" className="form-label">Company Name</label>
                  <input 
                    id="companyName" 
                    type="text" 
                    name="name" 
                    value={newCompany.name} 
                    onChange={handleCompanyFormChange} 
                    className="input"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="companySector" className="form-label">Sector</label>
                    <input 
                      id="companySector" 
                      type="text" 
                      name="sector" 
                      value={newCompany.sector} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyFund" className="form-label">Fund</label>
                    <select
                      id="companyFund"
                      name="fundId"
                      value={newCompany.fundId}
                      onChange={handleCompanyFormChange}
                      className="input"
                      required
                    >
                      <option value="" disabled>Select a fund</option>
                      {funds.map(fund => (
                        <option key={fund.id} value={fund.id}>{fund.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="companyInvestmentDate" className="form-label">Investment Date</label>
                    <input 
                      id="companyInvestmentDate" 
                      type="date" 
                      name="investmentDate" 
                      value={newCompany.investmentDate} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyInvestmentAmount" className="form-label">Investment Amount ($)</label>
                    <input 
                      id="companyInvestmentAmount" 
                      type="number" 
                      name="investmentAmount" 
                      value={newCompany.investmentAmount} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      min="0"
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="companyCurrentValue" className="form-label">Current Value ($)</label>
                    <input 
                      id="companyCurrentValue" 
                      type="number" 
                      name="currentValue" 
                      value={newCompany.currentValue} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      min="0"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyRevenue" className="form-label">Revenue ($)</label>
                    <input 
                      id="companyRevenue" 
                      type="number" 
                      name="revenue" 
                      value={newCompany.revenue} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      min="0"
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="companyEbitda" className="form-label">EBITDA ($)</label>
                    <input 
                      id="companyEbitda" 
                      type="number" 
                      name="ebitda" 
                      value={newCompany.ebitda} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyRevenueGrowth" className="form-label">Revenue Growth (%)</label>
                    <input 
                      id="companyRevenueGrowth" 
                      type="number" 
                      name="revenueGrowth" 
                      value={newCompany.revenueGrowth} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      step="0.1"
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="companyEbitdaMargin" className="form-label">EBITDA Margin (%)</label>
                    <input 
                      id="companyEbitdaMargin" 
                      type="number" 
                      name="ebitdaMargin" 
                      value={newCompany.ebitdaMargin} 
                      onChange={handleCompanyFormChange} 
                      className="input"
                      step="0.1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyStatus" className="form-label">Status</label>
                    <select
                      id="companyStatus"
                      name="status"
                      value={newCompany.status}
                      onChange={handleCompanyFormChange}
                      className="input"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Exited">Exited</option>
                      <option value="In Trouble">In Trouble</option>
                    </select>
                  </div>
                </div>
                
                {newCompany.status === 'Exited' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="companyExitDate" className="form-label">Exit Date</label>
                      <input 
                        id="companyExitDate" 
                        type="date" 
                        name="exitDate" 
                        value={newCompany.exitDate || ''} 
                        onChange={handleCompanyFormChange} 
                        className="input"
                        required={newCompany.status === 'Exited'}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="companyExitValue" className="form-label">Exit Value ($)</label>
                      <input 
                        id="companyExitValue" 
                        type="number" 
                        name="exitValue" 
                        value={newCompany.exitValue || 0} 
                        onChange={handleCompanyFormChange} 
                        className="input"
                        min="0"
                        required={newCompany.status === 'Exited'}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddCompanyModalOpen(false);
                    document.body.classList.remove('modal-open');
                  }}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Company' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Metric Modal */}
      {isAddMetricModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="metric-modal-title">
          <div className="modal-content" ref={addMetricModalRef}>
            <div className="modal-header">
              <h3 id="metric-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Performance Metric' : 'Add New Performance Metric'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddMetricModalOpen(false);
                  document.body.classList.remove('modal-open');
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddMetric}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="metricDate" className="form-label">Date</label>
                  <input 
                    id="metricDate" 
                    type="date" 
                    name="date" 
                    value={newMetric.date} 
                    onChange={handleMetricFormChange} 
                    className="input"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="metricType" className="form-label">Metric Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input 
                        id="metricTypeCompany" 
                        type="radio" 
                        name="metricType" 
                        checked={!!newMetric.companyId}
                        onChange={() => {
                          setNewMetric(prev => ({
                            ...prev,
                            companyId: selectedCompany || '',
                            fundId: ''
                          }));
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        required 
                      />
                      <label htmlFor="metricTypeCompany" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Company Metric
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        id="metricTypeFund" 
                        type="radio" 
                        name="metricType" 
                        checked={!!newMetric.fundId}
                        onChange={() => {
                          setNewMetric(prev => ({
                            ...prev,
                            fundId: selectedFund || '',
                            companyId: ''
                          }));
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        required 
                      />
                      <label htmlFor="metricTypeFund" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Fund Metric
                      </label>
                    </div>
                  </div>
                </div>
                
                {newMetric.companyId && (
                  <div className="form-group">
                    <label htmlFor="metricCompany" className="form-label">Company</label>
                    <select
                      id="metricCompany"
                      name="companyId"
                      value={newMetric.companyId}
                      onChange={handleMetricFormChange}
                      className="input"
                      required={!!newMetric.companyId}
                    >
                      <option value="" disabled>Select a company</option>
                      {portfolioCompanies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {newMetric.fundId && (
                  <div className="form-group">
                    <label htmlFor="metricFund" className="form-label">Fund</label>
                    <select
                      id="metricFund"
                      name="fundId"
                      value={newMetric.fundId}
                      onChange={handleMetricFormChange}
                      className="input"
                      required={!!newMetric.fundId}
                    >
                      <option value="" disabled>Select a fund</option>
                      {funds.map(fund => (
                        <option key={fund.id} value={fund.id}>{fund.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {newMetric.companyId && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="metricRevenue" className="form-label">Revenue ($)</label>
                        <input 
                          id="metricRevenue" 
                          type="number" 
                          name="revenue" 
                          value={newMetric.revenue} 
                          onChange={handleMetricFormChange} 
                          className="input"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="metricEbitda" className="form-label">EBITDA ($)</label>
                        <input 
                          id="metricEbitda" 
                          type="number" 
                          name="ebitda" 
                          value={newMetric.ebitda} 
                          onChange={handleMetricFormChange} 
                          className="input"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="metricCashflow" className="form-label">Cashflow ($)</label>
                        <input 
                          id="metricCashflow" 
                          type="number" 
                          name="cashflow" 
                          value={newMetric.cashflow} 
                          onChange={handleMetricFormChange} 
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="metricEmployeeCount" className="form-label">Employee Count</label>
                        <input 
                          id="metricEmployeeCount" 
                          type="number" 
                          name="employeeCount" 
                          value={newMetric.employeeCount} 
                          onChange={handleMetricFormChange} 
                          className="input"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label htmlFor="metricValuation" className="form-label">Valuation ($)</label>
                  <input 
                    id="metricValuation" 
                    type="number" 
                    name="valuation" 
                    value={newMetric.valuation} 
                    onChange={handleMetricFormChange} 
                    className="input"
                    min="0"
                    required 
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddMetricModalOpen(false);
                    document.body.classList.remove('modal-open');
                  }}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Metric' : 'Add Metric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm mt-8">
        <div className="container-fluid py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
