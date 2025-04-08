import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Cog, Search, Plus, Edit, Trash2, Filter, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, Percent,
  ChartPie, ChartBar, ChartLine, Calendar, Clock, Download, Upload, X
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces for our data models
interface Fund {
  id: string;
  name: string;
  aum: number; // Assets Under Management in millions
  vintage: number; // Year the fund was established
  strategy: string;
  irr: number; // Internal Rate of Return (percentage)
  moic: number; // Multiple on Invested Capital
  dpi: number; // Distributions to Paid-In
  tvpi: number; // Total Value to Paid-In
  commitments: number; // Total commitments in millions
  drawn: number; // Capital drawn in millions
  distributions: number; // Distributions in millions
  nav: number; // Net Asset Value in millions
  portfolioCompanies: string[]; // Array of portfolio company IDs
  performanceHistory: PerformancePoint[];
  currency: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  country: string;
  investment: number; // Total investment in millions
  currentValue: number; // Current value in millions
  ownership: number; // Ownership percentage
  acquisitionDate: string; // ISO date string
  status: 'Active' | 'Exited' | 'Written Off';
  revenue: number; // Annual revenue in millions
  ebitda: number; // EBITDA in millions
  multiplier: number; // EV/EBITDA multiplier
  growthRate: number; // Annual growth rate percentage
  fundId: string; // ID of the parent fund
  performanceHistory: PerformancePoint[];
  kpis: KPI[];
}

interface PerformancePoint {
  date: string; // ISO date string
  value: number; // Value at that point in time
}

interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
}

interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

interface FilterConfig {
  strategy: string;
  status: string;
  sector: string;
  country: string;
}

const App: React.FC = () => {
  // State management for data, UI interactions, sorting, filtering, etc.
  const [funds, setFunds] = useState<Fund[]>([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);
  const [isEditFundModalOpen, setIsEditFundModalOpen] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'fund' | 'company', id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'funds' | 'companies'>('funds');
  const [searchTerm, setSearchTerm] = useState('');
  const [fundSort, setFundSort] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [companySort, setCompanySort] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    strategy: '',
    status: '',
    sector: '',
    country: ''
  });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedFunds = localStorage.getItem('funds');
    const loadedCompanies = localStorage.getItem('portfolioCompanies');

    if (loadedFunds) {
      setFunds(JSON.parse(loadedFunds));
    } else {
      // Initialize with sample data if no data exists
      setFunds(generateSampleFunds());
    }

    if (loadedCompanies) {
      setPortfolioCompanies(JSON.parse(loadedCompanies));
    } else {
      // Initialize with sample data if no data exists
      setPortfolioCompanies(generateSampleCompanies());
    }
  }, []);

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

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (funds.length > 0) {
      localStorage.setItem('funds', JSON.stringify(funds));
    }
  }, [funds]);

  useEffect(() => {
    if (portfolioCompanies.length > 0) {
      localStorage.setItem('portfolioCompanies', JSON.stringify(portfolioCompanies));
    }
  }, [portfolioCompanies]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Helper function to close all modals
  const closeAllModals = () => {
    setIsEditFundModalOpen(false);
    setIsEditCompanyModalOpen(false);
    setIsAddFundModalOpen(false);
    setIsAddCompanyModalOpen(false);
    setIsDeleteModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Helper function to generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Function to generate random sample funds
  const generateSampleFunds = (): Fund[] => {
    const strategies = ['Buyout', 'Growth Equity', 'Venture Capital', 'Real Estate', 'Infrastructure'];
    const currencies = ['USD', 'EUR', 'GBP'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const aum = Math.round(Math.random() * 1000) + 100;
      const commitments = aum * 0.8;
      const drawn = commitments * (0.6 + Math.random() * 0.3);
      const nav = drawn * (0.8 + Math.random() * 0.6);
      const distributions = drawn * (0.3 + Math.random() * 0.5);
      
      const id = generateId();
      
      return {
        id,
        name: `Fund ${i + 1}`,
        aum,
        vintage: 2010 + Math.floor(Math.random() * 13),
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        irr: Math.round((Math.random() * 25 + 5) * 10) / 10,
        moic: Math.round((Math.random() * 2.5 + 1) * 10) / 10,
        dpi: Math.round((Math.random() * 1.2) * 10) / 10,
        tvpi: Math.round((Math.random() * 1.8 + 1) * 10) / 10,
        commitments,
        drawn,
        distributions,
        nav,
        portfolioCompanies: [],
        performanceHistory: generatePerformanceHistory(),
        currency: currencies[Math.floor(Math.random() * currencies.length)],
      };
    });
  };

  // Function to generate random sample companies
  const generateSampleCompanies = (): PortfolioCompany[] => {
    const sectors = ['Technology', 'Healthcare', 'Consumer', 'Industrial', 'Financial Services', 'Energy'];
    const countries = ['USA', 'UK', 'Germany', 'France', 'China', 'Japan', 'Brazil', 'India'];
    const statuses: Array<'Active' | 'Exited' | 'Written Off'> = ['Active', 'Exited', 'Written Off'];
    
    return Array.from({ length: 12 }, (_, i) => {
      const investment = Math.round(Math.random() * 100) + 10;
      const multiplier = Math.round((Math.random() * 5 + 4) * 10) / 10;
      const ebitda = Math.round((investment / multiplier) * 10) / 10;
      const revenue = ebitda * (Math.random() * 5 + 3);
      const currentValue = investment * (Math.random() * 2.5 + 0.5);
      
      // Create acquisition date between 1 and 8 years ago
      const acquisitionDate = new Date();
      acquisitionDate.setFullYear(acquisitionDate.getFullYear() - Math.floor(Math.random() * 8) - 1);
      
      return {
        id: generateId(),
        name: `Company ${i + 1}`,
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        investment,
        currentValue,
        ownership: Math.round(Math.random() * 80 + 20),
        acquisitionDate: acquisitionDate.toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        revenue: Math.round(revenue * 10) / 10,
        ebitda,
        multiplier,
        growthRate: Math.round((Math.random() * 30 - 5) * 10) / 10,
        fundId: '', // Will be set later when assigning companies to funds
        performanceHistory: generatePerformanceHistory(),
        kpis: generateSampleKPIs(),
      };
    });
  };

  // Function to generate random performance history
  const generatePerformanceHistory = (): PerformancePoint[] => {
    const points: PerformancePoint[] = [];
    const today = new Date();
    let value = 100; // Start value
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - 11 + i);
      
      // Random change in value, between -10% and +15%
      const change = (Math.random() * 25 - 10) / 100;
      value = value * (1 + change);
      
      points.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }
    
    return points;
  };

  // Function to generate sample KPIs
  const generateSampleKPIs = (): KPI[] => {
    const kpiNames = ['Revenue Growth', 'EBITDA Margin', 'Customer Acquisition', 'Churn Rate', 'Operational Efficiency'];
    const kpiUnits = ['%', '%', 'Count', '%', '%'];
    
    return kpiNames.map((name, index) => {
      const value = Math.round(Math.random() * 100);
      const target = Math.round(value * (1 + Math.random() * 0.5));
      
      return {
        name,
        value,
        target,
        unit: kpiUnits[index]
      };
    });
  };

  // Initialize by linking portfolio companies to funds
  useEffect(() => {
    if (funds.length > 0 && portfolioCompanies.length > 0 && 
        !portfolioCompanies.some(company => company.fundId)) {
      // Only execute if companies haven't been assigned to funds yet
      
      const updatedCompanies = [...portfolioCompanies];
      const updatedFunds = [...funds];
      
      // Assign each company to a random fund
      updatedCompanies.forEach(company => {
        const fundIndex = Math.floor(Math.random() * funds.length);
        company.fundId = funds[fundIndex].id;
        
        // Add company ID to fund's portfolioCompanies array
        if (!updatedFunds[fundIndex].portfolioCompanies.includes(company.id)) {
          updatedFunds[fundIndex].portfolioCompanies.push(company.id);
        }
      });
      
      setPortfolioCompanies(updatedCompanies);
      setFunds(updatedFunds);
    }
  }, [funds, portfolioCompanies]);

  // Function to add a new fund
  const handleAddFund = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newFund: Fund = {
      id: generateId(),
      name: formData.get('name') as string,
      aum: parseFloat(formData.get('aum') as string),
      vintage: parseInt(formData.get('vintage') as string, 10),
      strategy: formData.get('strategy') as string,
      irr: parseFloat(formData.get('irr') as string),
      moic: parseFloat(formData.get('moic') as string),
      dpi: parseFloat(formData.get('dpi') as string),
      tvpi: parseFloat(formData.get('tvpi') as string),
      commitments: parseFloat(formData.get('commitments') as string),
      drawn: parseFloat(formData.get('drawn') as string),
      distributions: parseFloat(formData.get('distributions') as string),
      nav: parseFloat(formData.get('nav') as string),
      portfolioCompanies: [],
      performanceHistory: generatePerformanceHistory(),
      currency: formData.get('currency') as string,
    };
    
    setFunds([...funds, newFund]);
    closeAllModals();
    form.reset();
  };

  // Function to edit an existing fund
  const handleEditFund = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFund) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedFund: Fund = {
      ...selectedFund,
      name: formData.get('name') as string,
      aum: parseFloat(formData.get('aum') as string),
      vintage: parseInt(formData.get('vintage') as string, 10),
      strategy: formData.get('strategy') as string,
      irr: parseFloat(formData.get('irr') as string),
      moic: parseFloat(formData.get('moic') as string),
      dpi: parseFloat(formData.get('dpi') as string),
      tvpi: parseFloat(formData.get('tvpi') as string),
      commitments: parseFloat(formData.get('commitments') as string),
      drawn: parseFloat(formData.get('drawn') as string),
      distributions: parseFloat(formData.get('distributions') as string),
      nav: parseFloat(formData.get('nav') as string),
      currency: formData.get('currency') as string,
    };
    
    setFunds(funds.map(fund => fund.id === selectedFund.id ? updatedFund : fund));
    closeAllModals();
  };

  // Function to add a new portfolio company
  const handleAddCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const fundId = formData.get('fundId') as string;
    const newCompany: PortfolioCompany = {
      id: generateId(),
      name: formData.get('name') as string,
      sector: formData.get('sector') as string,
      country: formData.get('country') as string,
      investment: parseFloat(formData.get('investment') as string),
      currentValue: parseFloat(formData.get('currentValue') as string),
      ownership: parseFloat(formData.get('ownership') as string),
      acquisitionDate: formData.get('acquisitionDate') as string,
      status: formData.get('status') as 'Active' | 'Exited' | 'Written Off',
      revenue: parseFloat(formData.get('revenue') as string),
      ebitda: parseFloat(formData.get('ebitda') as string),
      multiplier: parseFloat(formData.get('multiplier') as string),
      growthRate: parseFloat(formData.get('growthRate') as string),
      fundId,
      performanceHistory: generatePerformanceHistory(),
      kpis: generateSampleKPIs(),
    };
    
    setPortfolioCompanies([...portfolioCompanies, newCompany]);
    
    // Add the company to the fund's portfolio
    setFunds(funds.map(fund => {
      if (fund.id === fundId) {
        return {
          ...fund,
          portfolioCompanies: [...fund.portfolioCompanies, newCompany.id]
        };
      }
      return fund;
    }));
    
    closeAllModals();
    form.reset();
  };

  // Function to edit an existing portfolio company
  const handleEditCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const originalFundId = selectedCompany.fundId;
    const newFundId = formData.get('fundId') as string;
    
    const updatedCompany: PortfolioCompany = {
      ...selectedCompany,
      name: formData.get('name') as string,
      sector: formData.get('sector') as string,
      country: formData.get('country') as string,
      investment: parseFloat(formData.get('investment') as string),
      currentValue: parseFloat(formData.get('currentValue') as string),
      ownership: parseFloat(formData.get('ownership') as string),
      acquisitionDate: formData.get('acquisitionDate') as string,
      status: formData.get('status') as 'Active' | 'Exited' | 'Written Off',
      revenue: parseFloat(formData.get('revenue') as string),
      ebitda: parseFloat(formData.get('ebitda') as string),
      multiplier: parseFloat(formData.get('multiplier') as string),
      growthRate: parseFloat(formData.get('growthRate') as string),
      fundId: newFundId,
    };
    
    setPortfolioCompanies(portfolioCompanies.map(company => 
      company.id === selectedCompany.id ? updatedCompany : company
    ));
    
    // Update fund references if the company changed funds
    if (originalFundId !== newFundId) {
      setFunds(funds.map(fund => {
        if (fund.id === originalFundId) {
          // Remove from original fund
          return {
            ...fund,
            portfolioCompanies: fund.portfolioCompanies.filter(id => id !== selectedCompany.id)
          };
        } else if (fund.id === newFundId) {
          // Add to new fund
          return {
            ...fund,
            portfolioCompanies: [...fund.portfolioCompanies, selectedCompany.id]
          };
        }
        return fund;
      }));
    }
    
    closeAllModals();
  };

  // Function to handle deletion confirmation
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'fund') {
      // Delete fund
      const fundToDelete = funds.find(fund => fund.id === itemToDelete.id);
      if (!fundToDelete) return;
      
      // Update portfolio companies to remove reference to this fund
      setPortfolioCompanies(portfolioCompanies.map(company => {
        if (company.fundId === fundToDelete.id) {
          return { ...company, fundId: '' };
        }
        return company;
      }));
      
      // Remove the fund
      setFunds(funds.filter(fund => fund.id !== itemToDelete.id));
    } else {
      // Delete company
      const companyToDelete = portfolioCompanies.find(company => company.id === itemToDelete.id);
      if (!companyToDelete) return;
      
      // Update the fund to remove this company from its portfolio
      setFunds(funds.map(fund => {
        if (fund.id === companyToDelete.fundId) {
          return {
            ...fund,
            portfolioCompanies: fund.portfolioCompanies.filter(id => id !== companyToDelete.id)
          };
        }
        return fund;
      }));
      
      // Remove the company
      setPortfolioCompanies(portfolioCompanies.filter(company => company.id !== itemToDelete.id));
    }
    
    closeAllModals();
  };

  // Function to open the delete confirmation modal
  const openDeleteModal = (type: 'fund' | 'company', id: string) => {
    setItemToDelete({ type, id });
    setIsDeleteModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Function to handle sort changes for funds
  const handleFundSort = (key: string) => {
    setFundSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Function to handle sort changes for companies
  const handleCompanySort = (key: string) => {
    setCompanySort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Function to handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply sorting to funds
  const sortedFunds = useMemo(() => {
    return [...funds].sort((a, b) => {
      const aValue = a[fundSort.key as keyof Fund];
      const bValue = b[fundSort.key as keyof Fund];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return fundSort.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return fundSort.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
  }, [funds, fundSort]);

  // Apply filtering to funds
  const filteredFunds = useMemo(() => {
    return sortedFunds.filter(fund => {
      // Apply strategy filter if set
      if (filterConfig.strategy && fund.strategy !== filterConfig.strategy) {
        return false;
      }
      
      // Apply search term
      if (searchTerm && !fund.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [sortedFunds, filterConfig, searchTerm]);

  // Apply sorting to companies
  const sortedCompanies = useMemo(() => {
    return [...portfolioCompanies].sort((a, b) => {
      const aValue = a[companySort.key as keyof PortfolioCompany];
      const bValue = b[companySort.key as keyof PortfolioCompany];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return companySort.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return companySort.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
  }, [portfolioCompanies, companySort]);

  // Apply filtering to companies
  const filteredCompanies = useMemo(() => {
    return sortedCompanies.filter(company => {
      // Apply sector filter if set
      if (filterConfig.sector && company.sector !== filterConfig.sector) {
        return false;
      }
      
      // Apply country filter if set
      if (filterConfig.country && company.country !== filterConfig.country) {
        return false;
      }
      
      // Apply status filter if set
      if (filterConfig.status && company.status !== filterConfig.status) {
        return false;
      }
      
      // Apply search term
      if (searchTerm && !company.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [sortedCompanies, filterConfig, searchTerm]);

  // Get unique values for filter dropdowns
  const uniqueStrategies = useMemo(() => {
    return Array.from(new Set(funds.map(fund => fund.strategy)));
  }, [funds]);

  const uniqueSectors = useMemo(() => {
    return Array.from(new Set(portfolioCompanies.map(company => company.sector)));
  }, [portfolioCompanies]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(portfolioCompanies.map(company => company.country)));
  }, [portfolioCompanies]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(portfolioCompanies.map(company => company.status)));
  }, [portfolioCompanies]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalAum = funds.reduce((sum, fund) => sum + fund.aum, 0);
    const totalNav = funds.reduce((sum, fund) => sum + fund.nav, 0);
    const weightedIRR = funds.reduce((sum, fund) => sum + (fund.irr * fund.nav), 0) / totalNav || 0;
    const weightedMOIC = funds.reduce((sum, fund) => sum + (fund.moic * fund.nav), 0) / totalNav || 0;
    const activeCompanies = portfolioCompanies.filter(company => company.status === 'Active').length;
    const exitedCompanies = portfolioCompanies.filter(company => company.status === 'Exited').length;
    
    return {
      totalAum,
      totalNav,
      weightedIRR,
      weightedMOIC,
      totalCompanies: portfolioCompanies.length,
      activeCompanies,
      exitedCompanies
    };
  }, [funds, portfolioCompanies]);

  // Function to download data as JSON
  const handleExportData = () => {
    const data = {
      funds,
      portfolioCompanies
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'private_equity_portfolio_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Function to import data from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const importedData = JSON.parse(result);
        
        if (importedData.funds && Array.isArray(importedData.funds) &&
            importedData.portfolioCompanies && Array.isArray(importedData.portfolioCompanies)) {
          setFunds(importedData.funds);
          setPortfolioCompanies(importedData.portfolioCompanies);
        } else {
          alert('Invalid data format in the imported file.');
        }
      } catch (error) {
        console.error('Error parsing imported data:', error);
        alert('Failed to parse the imported file. Please ensure it is a valid JSON file.');
      }
    };
    
    reader.readAsText(file);
    // Reset the file input
    e.target.value = '';
  };

  // Download template file
  const handleDownloadTemplate = () => {
    const templateData = {
      funds: [
        {
          id: "template_fund_id",
          name: "Template Fund",
          aum: 500,
          vintage: 2020,
          strategy: "Growth Equity",
          irr: 15.5,
          moic: 2.0,
          dpi: 0.5,
          tvpi: 1.5,
          commitments: 400,
          drawn: 300,
          distributions: 100,
          nav: 500,
          portfolioCompanies: ["template_company_id"],
          performanceHistory: [
            { date: "2023-01-01", value: 100 },
            { date: "2023-06-01", value: 120 }
          ],
          currency: "USD"
        }
      ],
      portfolioCompanies: [
        {
          id: "template_company_id",
          name: "Template Company",
          sector: "Technology",
          country: "USA",
          investment: 50,
          currentValue: 75,
          ownership: 60,
          acquisitionDate: "2021-05-15",
          status: "Active",
          revenue: 100,
          ebitda: 20,
          multiplier: 10,
          growthRate: 25,
          fundId: "template_fund_id",
          performanceHistory: [
            { date: "2023-01-01", value: 100 },
            { date: "2023-06-01", value: 110 }
          ],
          kpis: [
            { name: "Revenue Growth", value: 25, target: 30, unit: "%" }
          ]
        }
      ]
    };
    
    const dataStr = JSON.stringify(templateData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'pe_portfolio_template.json');
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
              Private Equity Portfolio Manager
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExportData}
                className="btn-sm md:btn flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500"
                aria-label="Export data"
              >
                <Download size={16} />
                <span className="hidden md:inline">Export</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="btn-sm md:btn flex items-center gap-2 bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500"
                  aria-label="Import data"
                >
                  <Upload size={16} />
                  <span className="hidden md:inline">Import</span>
                </button>
                <input 
                  type="file" 
                  id="import-file" 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleImportData}
                  aria-label="Import data file"
                />
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard Summary */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-title">Total AUM</div>
              <div className="stat-value flex items-center">
                <DollarSign size={18} className="text-primary-500 mr-1" />
                {summaryMetrics.totalAum.toLocaleString()} M
              </div>
              <div className="stat-desc">Across {funds.length} funds</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Weighted IRR</div>
              <div className="stat-value flex items-center">
                <Percent size={18} className="text-green-500 mr-1" />
                {summaryMetrics.weightedIRR.toFixed(1)}%
              </div>
              <div className="stat-desc">NAV-weighted average</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Portfolio Size</div>
              <div className="stat-value flex items-center">
                <ChartPie size={18} className="text-blue-500 mr-1" />
                {summaryMetrics.totalCompanies}
              </div>
              <div className="stat-desc">
                {summaryMetrics.activeCompanies} Active, {summaryMetrics.exitedCompanies} Exited
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Weighted MOIC</div>
              <div className="stat-value flex items-center">
                <TrendingUp size={18} className="text-indigo-500 mr-1" />
                {summaryMetrics.weightedMOIC.toFixed(2)}x
              </div>
              <div className="stat-desc">NAV-weighted average</div>
            </div>
          </div>
        </section>

        {/* Fund and Company Performance Chart */}
        <section className="card mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Performance Overview</h2>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={funds.flatMap(fund => fund.performanceHistory.map(point => ({
                  date: point.date,
                  [fund.name]: point.value,
                })))
                .reduce((acc, item) => {
                  const existing = acc.find(i => i.date === item.date);
                  if (existing) {
                    return acc.map(i => i.date === item.date ? { ...i, ...item } : i);
                  }
                  return [...acc, item];
                }, [] as any[])
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                    color: isDarkMode ? '#e2e8f0' : '#1f2937'
                  }} 
                />
                <Legend />
                {funds.map((fund, index) => (
                  <Line
                    key={fund.id}
                    type="monotone"
                    dataKey={fund.name}
                    stroke={`hsl(${(index * 60) % 360}, 70%, ${isDarkMode ? '60%' : '45%'})`}
                    strokeWidth={2}
                    dot={{ stroke: `hsl(${(index * 60) % 360}, 70%, ${isDarkMode ? '60%' : '45%'})`, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Tabs for Funds and Portfolio Companies */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'funds' 
                ? 'text-primary-600 border-b-2 border-primary-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('funds')}
              aria-label="Show funds"
              aria-selected={activeTab === 'funds'}
              role="tab"
            >
              <span className="flex items-center gap-1">
                <DollarSign size={16} />
                Funds ({filteredFunds.length})
              </span>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'companies' 
                ? 'text-primary-600 border-b-2 border-primary-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('companies')}
              aria-label="Show portfolio companies"
              aria-selected={activeTab === 'companies'}
              role="tab"
            >
              <span className="flex items-center gap-1">
                <ChartPie size={16} />
                Portfolio Companies ({filteredCompanies.length})
              </span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Search */}
            <div className="w-full lg:w-1/3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'funds' ? 'funds' : 'companies'}...`}
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={`Search ${activeTab === 'funds' ? 'funds' : 'companies'}`}
                />
              </div>
            </div>

            {/* Filters Button */}
            <div className="flex items-center gap-4">
              <button
                className="btn btn-sm flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                aria-expanded={isFiltersVisible}
                aria-controls="filters-panel"
              >
                <Filter size={16} />
                Filters
                {isFiltersVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Add Button */}
              <button
                className="btn btn-sm btn-primary flex items-center gap-2"
                onClick={() => {
                  if (activeTab === 'funds') {
                    setIsAddFundModalOpen(true);
                  } else {
                    setIsAddCompanyModalOpen(true);
                  }
                  document.body.classList.add('modal-open');
                }}
                aria-label={`Add new ${activeTab === 'funds' ? 'fund' : 'company'}`}
              >
                <Plus size={16} />
                Add {activeTab === 'funds' ? 'Fund' : 'Company'}
              </button>

              {/* Download Template Button */}
              <button 
                onClick={handleDownloadTemplate}
                className="btn btn-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hidden md:flex items-center gap-2"
                aria-label="Download template"
              >
                <Download size={16} />
                Template
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {isFiltersVisible && (
            <div id="filters-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Fund-specific Filters */}
              {activeTab === 'funds' && (
                <div>
                  <label htmlFor="strategy-filter" className="form-label">Strategy</label>
                  <select
                    id="strategy-filter"
                    name="strategy"
                    className="input"
                    value={filterConfig.strategy}
                    onChange={handleFilterChange}
                    aria-label="Filter by strategy"
                  >
                    <option value="">All Strategies</option>
                    {uniqueStrategies.map(strategy => (
                      <option key={strategy} value={strategy}>{strategy}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Company-specific Filters */}
              {activeTab === 'companies' && (
                <>
                  <div>
                    <label htmlFor="sector-filter" className="form-label">Sector</label>
                    <select
                      id="sector-filter"
                      name="sector"
                      className="input"
                      value={filterConfig.sector}
                      onChange={handleFilterChange}
                      aria-label="Filter by sector"
                    >
                      <option value="">All Sectors</option>
                      {uniqueSectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="country-filter" className="form-label">Country</label>
                    <select
                      id="country-filter"
                      name="country"
                      className="input"
                      value={filterConfig.country}
                      onChange={handleFilterChange}
                      aria-label="Filter by country"
                    >
                      <option value="">All Countries</option>
                      {uniqueCountries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status-filter" className="form-label">Status</label>
                    <select
                      id="status-filter"
                      name="status"
                      className="input"
                      value={filterConfig.status}
                      onChange={handleFilterChange}
                      aria-label="Filter by status"
                    >
                      <option value="">All Statuses</option>
                      {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  className="btn btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setFilterConfig({ strategy: '', status: '', sector: '', country: '' })}
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Funds Table */}
        {activeTab === 'funds' && (
          <div className="relative">
            {filteredFunds.length === 0 ? (
              <div className="card flex-center p-8">
                <div className="text-center">
                  <ChartPie size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No funds found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || filterConfig.strategy ? 
                      "Try adjusting your search or filters to find what you're looking for." : 
                      "You haven't added any funds yet. Get started by adding your first fund."}
                  </p>
                  {!searchTerm && !filterConfig.strategy && (
                    <button 
                      className="btn btn-primary flex-center mx-auto gap-2"
                      onClick={() => {
                        setIsAddFundModalOpen(true);
                        document.body.classList.add('modal-open');
                      }}
                      aria-label="Add your first fund"
                    >
                      <Plus size={16} />
                      Add Your First Fund
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="table" aria-label="Funds table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3" onClick={() => handleFundSort('name')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Fund Name</span>
                          {fundSort.key === 'name' && (
                            <span className="ml-1">
                              {fundSort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleFundSort('vintage')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Vintage</span>
                          {fundSort.key === 'vintage' && (
                            <span className="ml-1">
                              {fundSort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleFundSort('strategy')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Strategy</span>
                          {fundSort.key === 'strategy' && (
                            <span className="ml-1">
                              {fundSort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleFundSort('aum')}>
                        <div className="flex items-center cursor-pointer">
                          <span>AUM (M)</span>
                          {fundSort.key === 'aum' && (
                            <span className="ml-1">
                              {fundSort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleFundSort('irr')}>
                        <div className="flex items-center cursor-pointer">
                          <span>IRR (%)</span>
                          {fundSort.key === 'irr' && (
                            <span className="ml-1">
                              {fundSort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleFundSort('moic')}>
                        <div className="flex items-center cursor-pointer">
                          <span>MOIC</span>
                          {fundSort.key === 'moic' && (
                            <span className="ml-1">
                              {fundSort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3">
                        <span>Companies</span>
                      </th>
                      <th className="table-header px-4 py-3">
                        <span>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredFunds.map(fund => {
                      const fundCompanies = portfolioCompanies.filter(company => 
                        fund.portfolioCompanies.includes(company.id)
                      );
                      
                      return (
                        <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="table-cell px-4 py-4 font-medium text-gray-900 dark:text-white">
                            {fund.name}
                          </td>
                          <td className="table-cell px-4 py-4">{fund.vintage}</td>
                          <td className="table-cell px-4 py-4">
                            <span className="badge badge-info">{fund.strategy}</span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            {fund.aum.toLocaleString()} {fund.currency}
                          </td>
                          <td className="table-cell px-4 py-4">
                            <span 
                              className={`flex items-center ${fund.irr >= 15 ? 'text-green-500' : fund.irr >= 10 ? 'text-amber-500' : 'text-red-500'}`}
                            >
                              {fund.irr >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                              {fund.irr.toFixed(1)}%
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            <span 
                              className={`${fund.moic >= 2.0 ? 'text-green-500' : fund.moic >= 1.5 ? 'text-amber-500' : 'text-red-500'}`}
                            >
                              {fund.moic.toFixed(2)}x
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            {fundCompanies.length}
                          </td>
                          <td className="table-cell px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                onClick={() => {
                                  setSelectedFund(fund);
                                  setIsEditFundModalOpen(true);
                                  document.body.classList.add('modal-open');
                                }}
                                aria-label={`Edit ${fund.name}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                onClick={() => openDeleteModal('fund', fund.id)}
                                aria-label={`Delete ${fund.name}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Companies Table */}
        {activeTab === 'companies' && (
          <div className="relative">
            {filteredCompanies.length === 0 ? (
              <div className="card flex-center p-8">
                <div className="text-center">
                  <ChartBar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No companies found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || filterConfig.sector || filterConfig.country || filterConfig.status ? 
                      "Try adjusting your search or filters to find what you're looking for." : 
                      "You haven't added any portfolio companies yet. Get started by adding your first company."}
                  </p>
                  {!searchTerm && !filterConfig.sector && !filterConfig.country && !filterConfig.status && (
                    <button 
                      className="btn btn-primary flex-center mx-auto gap-2"
                      onClick={() => {
                        setIsAddCompanyModalOpen(true);
                        document.body.classList.add('modal-open');
                      }}
                      aria-label="Add your first company"
                    >
                      <Plus size={16} />
                      Add Your First Company
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="table" aria-label="Portfolio companies table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('name')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Company Name</span>
                          {companySort.key === 'name' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('sector')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Sector</span>
                          {companySort.key === 'sector' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('country')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Country</span>
                          {companySort.key === 'country' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('investment')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Investment (M)</span>
                          {companySort.key === 'investment' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('currentValue')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Current Value (M)</span>
                          {companySort.key === 'currentValue' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('multiplier')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Multiple</span>
                          {companySort.key === 'multiplier' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('status')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Status</span>
                          {companySort.key === 'status' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3" onClick={() => handleCompanySort('fundId')}>
                        <div className="flex items-center cursor-pointer">
                          <span>Fund</span>
                          {companySort.key === 'fundId' && (
                            <span className="ml-1">
                              {companySort.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3">
                        <span>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredCompanies.map(company => {
                      const parentFund = funds.find(fund => fund.id === company.fundId);
                      const multiple = company.currentValue / company.investment;
                      
                      return (
                        <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="table-cell px-4 py-4 font-medium text-gray-900 dark:text-white">
                            {company.name}
                          </td>
                          <td className="table-cell px-4 py-4">
                            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              {company.sector}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">{company.country}</td>
                          <td className="table-cell px-4 py-4">
                            {company.investment.toLocaleString()} {parentFund?.currency || 'USD'}
                          </td>
                          <td className="table-cell px-4 py-4">
                            {company.currentValue.toLocaleString()} {parentFund?.currency || 'USD'}
                          </td>
                          <td className="table-cell px-4 py-4">
                            <span 
                              className={`${multiple >= 2.0 ? 'text-green-500' : multiple >= 1.0 ? 'text-amber-500' : 'text-red-500'}`}
                            >
                              {multiple.toFixed(2)}x
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            <span 
                              className={`
                                badge 
                                ${company.status === 'Active' ? 'badge-success' : 
                                  company.status === 'Exited' ? 'badge-info' : 
                                  'badge-error'}
                              `}
                            >
                              {company.status}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            {parentFund?.name || 'N/A'}
                          </td>
                          <td className="table-cell px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setIsEditCompanyModalOpen(true);
                                  document.body.classList.add('modal-open');
                                }}
                                aria-label={`Edit ${company.name}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                onClick={() => openDeleteModal('company', company.id)}
                                aria-label={`Delete ${company.name}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm mt-auto py-4 theme-transition">
        <div className="container-fluid text-center text-gray-600 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Add Fund Modal */}
      {isAddFundModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-fund-title"
        >
          <div 
            className={`modal-content ${styles.modalAnimation}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="add-fund-title" className="text-lg font-medium text-gray-900 dark:text-white">Add New Fund</h3>
              <button 
                onClick={closeAllModals} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFund}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Fund Name</label>
                  <input type="text" id="name" name="name" className="input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="vintage" className="form-label">Vintage Year</label>
                  <input type="number" id="vintage" name="vintage" className="input" required min="1980" max={new Date().getFullYear()} />
                </div>
                <div className="form-group">
                  <label htmlFor="strategy" className="form-label">Investment Strategy</label>
                  <select id="strategy" name="strategy" className="input" required>
                    <option value="">Select Strategy</option>
                    <option value="Buyout">Buyout</option>
                    <option value="Growth Equity">Growth Equity</option>
                    <option value="Venture Capital">Venture Capital</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Debt">Debt</option>
                    <option value="Fund of Funds">Fund of Funds</option>
                    <option value="Special Situations">Special Situations</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="aum" className="form-label">Assets Under Management (M)</label>
                  <input type="number" id="aum" name="aum" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="irr" className="form-label">IRR (%)</label>
                  <input type="number" id="irr" name="irr" className="input" required step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="moic" className="form-label">MOIC</label>
                  <input type="number" id="moic" name="moic" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="dpi" className="form-label">DPI</label>
                  <input type="number" id="dpi" name="dpi" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="tvpi" className="form-label">TVPI</label>
                  <input type="number" id="tvpi" name="tvpi" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="commitments" className="form-label">Total Commitments (M)</label>
                  <input type="number" id="commitments" name="commitments" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="drawn" className="form-label">Capital Drawn (M)</label>
                  <input type="number" id="drawn" name="drawn" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="distributions" className="form-label">Distributions (M)</label>
                  <input type="number" id="distributions" name="distributions" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="nav" className="form-label">Net Asset Value (M)</label>
                  <input type="number" id="nav" name="nav" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="currency" className="form-label">Currency</label>
                  <select id="currency" name="currency" className="input" required>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeAllModals} className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fund Modal */}
      {isEditFundModalOpen && selectedFund && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-fund-title"
        >
          <div 
            className={`modal-content ${styles.modalAnimation}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="edit-fund-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Fund</h3>
              <button 
                onClick={closeAllModals} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFund}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">Fund Name</label>
                  <input type="text" id="edit-name" name="name" className="input" defaultValue={selectedFund.name} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-vintage" className="form-label">Vintage Year</label>
                  <input type="number" id="edit-vintage" name="vintage" className="input" defaultValue={selectedFund.vintage} required min="1980" max={new Date().getFullYear()} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-strategy" className="form-label">Investment Strategy</label>
                  <select id="edit-strategy" name="strategy" className="input" defaultValue={selectedFund.strategy} required>
                    <option value="">Select Strategy</option>
                    <option value="Buyout">Buyout</option>
                    <option value="Growth Equity">Growth Equity</option>
                    <option value="Venture Capital">Venture Capital</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Debt">Debt</option>
                    <option value="Fund of Funds">Fund of Funds</option>
                    <option value="Special Situations">Special Situations</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-aum" className="form-label">Assets Under Management (M)</label>
                  <input type="number" id="edit-aum" name="aum" className="input" defaultValue={selectedFund.aum} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-irr" className="form-label">IRR (%)</label>
                  <input type="number" id="edit-irr" name="irr" className="input" defaultValue={selectedFund.irr} required step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-moic" className="form-label">MOIC</label>
                  <input type="number" id="edit-moic" name="moic" className="input" defaultValue={selectedFund.moic} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-dpi" className="form-label">DPI</label>
                  <input type="number" id="edit-dpi" name="dpi" className="input" defaultValue={selectedFund.dpi} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-tvpi" className="form-label">TVPI</label>
                  <input type="number" id="edit-tvpi" name="tvpi" className="input" defaultValue={selectedFund.tvpi} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-commitments" className="form-label">Total Commitments (M)</label>
                  <input type="number" id="edit-commitments" name="commitments" className="input" defaultValue={selectedFund.commitments} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-drawn" className="form-label">Capital Drawn (M)</label>
                  <input type="number" id="edit-drawn" name="drawn" className="input" defaultValue={selectedFund.drawn} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-distributions" className="form-label">Distributions (M)</label>
                  <input type="number" id="edit-distributions" name="distributions" className="input" defaultValue={selectedFund.distributions} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-nav" className="form-label">Net Asset Value (M)</label>
                  <input type="number" id="edit-nav" name="nav" className="input" defaultValue={selectedFund.nav} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-currency" className="form-label">Currency</label>
                  <select id="edit-currency" name="currency" className="input" defaultValue={selectedFund.currency} required>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeAllModals} className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Fund
                </button>
              </div>
            </form>
            
            {/* Fund Performance Chart */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Performance History</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedFund.performanceHistory}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short' })}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} 
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937'
                      }}
                      formatter={(value: any) => [`${value}`, 'Value']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Value"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ stroke: '#3b82f6', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Fund Capital Distribution */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Capital Distribution</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Capital Drawn', value: selectedFund.drawn },
                        { name: 'Undrawn Capital', value: selectedFund.commitments - selectedFund.drawn },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#93c5fd" />
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value.toLocaleString()} ${selectedFund.currency}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Portfolio Companies */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Portfolio Companies</h4>
              {portfolioCompanies.filter(company => selectedFund.portfolioCompanies.includes(company.id)).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No companies in this fund yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {portfolioCompanies
                    .filter(company => selectedFund.portfolioCompanies.includes(company.id))
                    .map(company => (
                      <div key={company.id} className="flex items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{company.sector} | {company.status}</p>
                        </div>
                        <span className={`badge ${company.currentValue > company.investment ? 'badge-success' : 'badge-error'}`}>
                          {(company.currentValue / company.investment).toFixed(1)}x
                        </span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isAddCompanyModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-company-title"
        >
          <div 
            className={`modal-content ${styles.modalAnimation}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="add-company-title" className="text-lg font-medium text-gray-900 dark:text-white">Add New Portfolio Company</h3>
              <button 
                onClick={closeAllModals} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCompany}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="company-name" className="form-label">Company Name</label>
                  <input type="text" id="company-name" name="name" className="input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="company-sector" className="form-label">Sector</label>
                  <select id="company-sector" name="sector" className="input" required>
                    <option value="">Select Sector</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Energy">Energy</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Materials">Materials</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="company-country" className="form-label">Country</label>
                  <select id="company-country" name="country" className="input" required>
                    <option value="">Select Country</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="China">China</option>
                    <option value="Japan">Japan</option>
                    <option value="India">India</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="company-investment" className="form-label">Investment Amount (M)</label>
                  <input type="number" id="company-investment" name="investment" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="company-currentValue" className="form-label">Current Value (M)</label>
                  <input type="number" id="company-currentValue" name="currentValue" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="company-ownership" className="form-label">Ownership (%)</label>
                  <input type="number" id="company-ownership" name="ownership" className="input" required min="0" max="100" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="company-acquisitionDate" className="form-label">Acquisition Date</label>
                  <input type="date" id="company-acquisitionDate" name="acquisitionDate" className="input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="company-status" className="form-label">Status</label>
                  <select id="company-status" name="status" className="input" required>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Exited">Exited</option>
                    <option value="Written Off">Written Off</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="company-revenue" className="form-label">Annual Revenue (M)</label>
                  <input type="number" id="company-revenue" name="revenue" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="company-ebitda" className="form-label">EBITDA (M)</label>
                  <input type="number" id="company-ebitda" name="ebitda" className="input" required step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="company-multiplier" className="form-label">EV/EBITDA Multiple</label>
                  <input type="number" id="company-multiplier" name="multiplier" className="input" required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="company-growthRate" className="form-label">Growth Rate (%)</label>
                  <input type="number" id="company-growthRate" name="growthRate" className="input" required step="0.1" />
                </div>
                <div className="form-group md:col-span-2">
                  <label htmlFor="company-fundId" className="form-label">Parent Fund</label>
                  <select id="company-fundId" name="fundId" className="input" required>
                    <option value="">Select Fund</option>
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeAllModals} className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditCompanyModalOpen && selectedCompany && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-company-title"
        >
          <div 
            className={`modal-content ${styles.modalAnimation}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="edit-company-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Portfolio Company</h3>
              <button 
                onClick={closeAllModals} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditCompany}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="edit-company-name" className="form-label">Company Name</label>
                  <input type="text" id="edit-company-name" name="name" className="input" defaultValue={selectedCompany.name} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-sector" className="form-label">Sector</label>
                  <select id="edit-company-sector" name="sector" className="input" defaultValue={selectedCompany.sector} required>
                    <option value="">Select Sector</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Energy">Energy</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Materials">Materials</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-country" className="form-label">Country</label>
                  <select id="edit-company-country" name="country" className="input" defaultValue={selectedCompany.country} required>
                    <option value="">Select Country</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="China">China</option>
                    <option value="Japan">Japan</option>
                    <option value="India">India</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-investment" className="form-label">Investment Amount (M)</label>
                  <input type="number" id="edit-company-investment" name="investment" className="input" defaultValue={selectedCompany.investment} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-currentValue" className="form-label">Current Value (M)</label>
                  <input type="number" id="edit-company-currentValue" name="currentValue" className="input" defaultValue={selectedCompany.currentValue} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-ownership" className="form-label">Ownership (%)</label>
                  <input type="number" id="edit-company-ownership" name="ownership" className="input" defaultValue={selectedCompany.ownership} required min="0" max="100" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-acquisitionDate" className="form-label">Acquisition Date</label>
                  <input type="date" id="edit-company-acquisitionDate" name="acquisitionDate" className="input" defaultValue={selectedCompany.acquisitionDate} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-status" className="form-label">Status</label>
                  <select id="edit-company-status" name="status" className="input" defaultValue={selectedCompany.status} required>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Exited">Exited</option>
                    <option value="Written Off">Written Off</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-revenue" className="form-label">Annual Revenue (M)</label>
                  <input type="number" id="edit-company-revenue" name="revenue" className="input" defaultValue={selectedCompany.revenue} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-ebitda" className="form-label">EBITDA (M)</label>
                  <input type="number" id="edit-company-ebitda" name="ebitda" className="input" defaultValue={selectedCompany.ebitda} required step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-multiplier" className="form-label">EV/EBITDA Multiple</label>
                  <input type="number" id="edit-company-multiplier" name="multiplier" className="input" defaultValue={selectedCompany.multiplier} required min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company-growthRate" className="form-label">Growth Rate (%)</label>
                  <input type="number" id="edit-company-growthRate" name="growthRate" className="input" defaultValue={selectedCompany.growthRate} required step="0.1" />
                </div>
                <div className="form-group md:col-span-2">
                  <label htmlFor="edit-company-fundId" className="form-label">Parent Fund</label>
                  <select id="edit-company-fundId" name="fundId" className="input" defaultValue={selectedCompany.fundId} required>
                    <option value="">Select Fund</option>
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeAllModals} className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Company
                </button>
              </div>
            </form>
            
            {/* Company Performance Chart */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Performance History</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedCompany.performanceHistory}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short' })}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }} 
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937'
                      }}
                      formatter={(value: any) => [`${value}`, 'Value']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Value"
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ stroke: '#10b981', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Company KPIs */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Key Performance Indicators</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedCompany.kpis}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#1f2937'
                      }}
                      formatter={(value: any, name: any, props: any) => {
                        const kpi = selectedCompany.kpis[props.payload.payload.name];
                        return [`${value} ${props.payload.unit}`, name];
                      }}
                    />
                    <Legend />
                    <Bar name="Actual" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar name="Target" dataKey="target" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Parent Fund */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Parent Fund</h4>
              {funds.find(fund => fund.id === selectedCompany.fundId) ? (
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {funds.find(fund => fund.id === selectedCompany.fundId)?.name}
                  </h5>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Strategy: </span>
                      <span className="text-gray-900 dark:text-white">
                        {funds.find(fund => fund.id === selectedCompany.fundId)?.strategy}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Vintage: </span>
                      <span className="text-gray-900 dark:text-white">
                        {funds.find(fund => fund.id === selectedCompany.fundId)?.vintage}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">IRR: </span>
                      <span className="text-gray-900 dark:text-white">
                        {funds.find(fund => fund.id === selectedCompany.fundId)?.irr.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">MOIC: </span>
                      <span className="text-gray-900 dark:text-white">
                        {funds.find(fund => fund.id === selectedCompany.fundId)?.moic.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No parent fund assigned.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div 
            className={`modal-content max-w-md ${styles.modalAnimation}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="delete-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button 
                onClick={closeAllModals} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
              </p>
              {itemToDelete.type === 'fund' && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900 rounded text-amber-800 dark:text-amber-200 text-sm">
                  <p className="font-medium">Warning:</p>
                  <p>Deleting this fund will remove all its data. Portfolio companies assigned to this fund will no longer be associated with any fund.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={closeAllModals} 
                className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete {itemToDelete.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
