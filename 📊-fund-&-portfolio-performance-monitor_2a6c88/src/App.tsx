import React, { useState, useEffect, useRef } from 'react';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import {
  PlusCircle, Trash2, Filter, Edit, ChevronDown, ChevronUp, ArrowUpDown,
  Pencil, Eye, XCircle, ArrowDown, ArrowUp, DollarSign, TrendingUp, TrendingDown,
  CreditCard, Calendar, ChartPie, Building, Search, Download, Upload, FileText
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our data models
interface Fund {
  id: string;
  name: string;
  strategy: string;
  aum: number; // Assets Under Management in millions
  vintage: number; // Fund vintage year
  irr: number; // Internal Rate of Return
  moic: number; // Multiple On Invested Capital
  dpi: number; // Distributions to Paid-In
  tvpi: number; // Total Value to Paid-In
  commitments: number; // Total commitments in millions
  called: number; // Capital called in millions
  distributed: number; // Capital distributed in millions
  nav: number; // Net Asset Value in millions
  status: 'Active' | 'Harvesting' | 'Fully Realized';
  performanceData: PerformanceData[];
}

interface PortfolioCompany {
  id: string;
  name: string;
  fundId: string;
  sector: string;
  investmentDate: string;
  initialInvestment: number; // In millions
  currentValue: number; // In millions
  ownership: number; // Percentage
  revenue: number; // In millions
  ebitda: number; // In millions
  status: 'Active' | 'Exited' | 'Written Off';
  exitDate?: string;
  exitValue?: number; // In millions
  irr?: number;
  moic?: number;
  performanceData: PerformanceData[];
}

interface PerformanceData {
  quarter: string; // e.g., "Q1 2023"
  value: number; // In millions
}

// Generate mock fund data
const generateMockFunds = (): Fund[] => {
  const strategies = ['Buyout', 'Growth Equity', 'Venture Capital', 'Distressed', 'Real Estate'];
  const statuses: Array<'Active' | 'Harvesting' | 'Fully Realized'> = ['Active', 'Harvesting', 'Fully Realized'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const vintage = 2015 + Math.floor(Math.random() * 8);
    const aum = Math.round(100 + Math.random() * 900);
    const commitments = aum * (0.8 + Math.random() * 0.4);
    const called = commitments * (0.5 + Math.random() * 0.5);
    const nav = called * (0.6 + Math.random() * 0.8);
    const distributed = called * (0.2 + Math.random() * 1.0);
    const irr = Math.round((Math.random() * 30 - 5) * 10) / 10;
    const moic = Math.round((1 + Math.random() * 2) * 10) / 10;
    const dpi = called > 0 ? Math.round((distributed / called) * 10) / 10 : 0;
    const tvpi = called > 0 ? Math.round(((nav + distributed) / called) * 10) / 10 : 0;
    
    // Generate quarterly performance data for the past 3 years
    const performanceData: PerformanceData[] = [];
    const currentYear = new Date().getFullYear();
    let baseValue = nav * 0.7; // Starting point
    
    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Skip future quarters
        if (year === currentYear && quarter > Math.ceil((new Date().getMonth() + 1) / 3)) {
          continue;
        }
        
        // Add some randomness to the data
        const change = (Math.random() * 0.2 - 0.05) * baseValue;
        baseValue += change;
        
        performanceData.push({
          quarter: `Q${quarter} ${year}`,
          value: Math.round(Math.max(0, baseValue) * 100) / 100 // Ensure value doesn't go below 0
        });
      }
    }
    
    return {
      id: `fund-${i + 1}`,
      name: `Fund ${i + 1}`,
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      aum,
      vintage,
      irr,
      moic,
      dpi,
      tvpi,
      commitments,
      called,
      distributed,
      nav,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      performanceData
    };
  });
};

// Generate mock portfolio companies data
const generateMockCompanies = (funds: Fund[]): PortfolioCompany[] => {
  const sectors = ['Technology', 'Healthcare', 'Consumer', 'Industrial', 'Financial Services', 'Energy', 'Media'];
  const statuses: Array<'Active' | 'Exited' | 'Written Off'> = ['Active', 'Exited', 'Written Off'];
  
  let companies: PortfolioCompany[] = [];
  
  funds.forEach(fund => {
    // Generate 2-5 companies per fund
    const companyCount = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < companyCount; i++) {
      const investmentYear = fund.vintage + Math.floor(Math.random() * 3);
      const investmentMonth = Math.floor(Math.random() * 12) + 1;
      const investmentDate = `${investmentYear}-${investmentMonth.toString().padStart(2, '0')}-01`;
      
      const initialInvestment = Math.round((5 + Math.random() * 45) * 10) / 10;
      const ownership = Math.round((15 + Math.random() * 60) * 10) / 10;
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      let exitDate;
      let exitValue;
      let irr = undefined;
      let moic = undefined;
      
      if (status === 'Exited' || status === 'Written Off') {
        const exitYear = investmentYear + 1 + Math.floor(Math.random() * 5);
        const exitMonth = Math.floor(Math.random() * 12) + 1;
        exitDate = `${exitYear}-${exitMonth.toString().padStart(2, '0')}-01`;
        
        if (status === 'Exited') {
          moic = Math.round((1.5 + Math.random() * 3) * 10) / 10;
          exitValue = Math.round(initialInvestment * moic * 10) / 10;
          const years = (new Date(exitDate).getTime() - new Date(investmentDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          if (years > 0) {
              irr = Math.round(((Math.pow(moic, 1 / years) - 1) * 100) * 10) / 10;
          }
        } else {
          // Written off
          moic = Math.round((Math.random() * 0.5) * 10) / 10;
          exitValue = Math.round(initialInvestment * moic * 10) / 10;
          irr = -100 + Math.round(Math.random() * 90);
        }
      }
      
      const currentValue = status === 'Active' 
        ? Math.round(initialInvestment * (0.5 + Math.random() * 2.5) * 10) / 10
        : exitValue || 0;
      
      const revenue = Math.round((initialInvestment * (0.5 + Math.random() * 1.5)) * 10) / 10;
      const ebitda = Math.round((revenue * (0.1 + Math.random() * 0.3)) * 10) / 10;
      
      // Generate quarterly performance data
      const performanceData: PerformanceData[] = [];
      const startYear = parseInt(investmentDate.split('-')[0]);
      const currentYear = new Date().getFullYear();
      const endYear = exitDate ? parseInt(exitDate.split('-')[0]) : currentYear;
      
      let baseValue = initialInvestment;
      
      for (let year = startYear; year <= endYear; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          // Skip future quarters
          if (year === currentYear && quarter > Math.ceil((new Date().getMonth() + 1) / 3)) {
            continue;
          }

          // Skip quarters before investment date
          if (year === startYear && quarter < Math.ceil((new Date(investmentDate).getMonth() + 1) / 3)) {
            continue;
          }

          // Skip quarters after exit date
          if (exitDate && year === endYear && quarter > Math.ceil((new Date(exitDate).getMonth() + 1) / 3)) {
            continue;
          }
          
          // Add some randomness to the data
          const change = (Math.random() * 0.15 - 0.05) * baseValue;
          baseValue += change;
          
          // If written off, gradually decrease value
          if (status === 'Written Off' && year === endYear - 1) {
            baseValue = baseValue * 0.5;
          }
          
          performanceData.push({
            quarter: `Q${quarter} ${year}`,
            value: Math.round(Math.max(0, baseValue) * 100) / 100 // Ensure value doesn't go below 0
          });
        }
      }
      
      companies.push({
        id: `company-${companies.length + 1}`,
        name: `Portfolio Company ${companies.length + 1}`,
        fundId: fund.id,
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        investmentDate,
        initialInvestment,
        currentValue,
        ownership,
        revenue,
        ebitda,
        status,
        exitDate,
        exitValue,
        irr,
        moic,
        performanceData
      });
    }
  });
  
  return companies;
};

// Main App component
const App: React.FC = () => {
  // State management
  const [funds, setFunds] = useState<Fund[]>([]);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'funds' | 'companies'>('dashboard');
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isEditingFund, setIsEditingFund] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // State for modal forms (hoisted from render*Modal functions)
  const [addCompanyModalStatus, setAddCompanyModalStatus] = useState<'Active' | 'Exited' | 'Written Off'>('Active');
  const [editCompanyModalStatus, setEditCompanyModalStatus] = useState<'Active' | 'Exited' | 'Written Off'>('Active');
  
  // Filter functions
  const [fundFilters, setFundFilters] = useState({
    strategy: '',
    status: '',
    vintageMin: '',
    vintageMax: '',
  });
  
  const [companyFilters, setCompanyFilters] = useState({
    sector: '',
    status: '',
    fundId: '',
  });
  
  // Initialize with mock data or load from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') { // Check if running in browser
        const savedFunds = localStorage.getItem('pe-funds');
        const savedCompanies = localStorage.getItem('pe-companies');
        
        if (savedFunds && savedCompanies) {
            try {
                setFunds(JSON.parse(savedFunds));
                setCompanies(JSON.parse(savedCompanies));
            } catch (error) {
                console.error("Error parsing data from localStorage:", error);
                // Fallback to generating mock data if parsing fails
                const newFunds = generateMockFunds();
                const newCompanies = generateMockCompanies(newFunds);
                setFunds(newFunds);
                setCompanies(newCompanies);
                localStorage.setItem('pe-funds', JSON.stringify(newFunds));
                localStorage.setItem('pe-companies', JSON.stringify(newCompanies));
            }
        } else {
            const newFunds = generateMockFunds();
            const newCompanies = generateMockCompanies(newFunds);
            setFunds(newFunds);
            setCompanies(newCompanies);
            localStorage.setItem('pe-funds', JSON.stringify(newFunds));
            localStorage.setItem('pe-companies', JSON.stringify(newCompanies));
        }
    }
  }, []);
  
  // Apply dark mode
  useEffect(() => {
    if (typeof document !== 'undefined') { // Check if running in browser
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }
  }, [isDarkMode]);
  
  // Handle Escape key press to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddingFund(false);
        setIsAddingCompany(false);
        setIsEditingFund(false);
        setIsEditingCompany(false);
        setSelectedFund(null);
        setSelectedCompany(null);
      }
    };
    
    if (typeof window !== 'undefined') { // Check if running in browser
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);
  
  // Handle clicking outside of modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsAddingFund(false);
        setIsAddingCompany(false);
        setIsEditingFund(false);
        setIsEditingCompany(false);
      }
    };
    
    if (typeof document !== 'undefined' && (isAddingFund || isAddingCompany || isEditingFund || isEditingCompany)) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [isAddingFund, isAddingCompany, isEditingFund, isEditingCompany]);

  // Reset add company modal status when closed
  useEffect(() => {
    if (!isAddingCompany) {
      setAddCompanyModalStatus('Active');
    }
  }, [isAddingCompany]);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== 'undefined' && funds.length > 0) {
      localStorage.setItem('pe-funds', JSON.stringify(funds));
    }
  }, [funds]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && companies.length > 0) {
      localStorage.setItem('pe-companies', JSON.stringify(companies));
    }
  }, [companies]);
  
  // Filter funds based on search term and filters
  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fund.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStrategy = !fundFilters.strategy || fund.strategy === fundFilters.strategy;
    const matchesStatus = !fundFilters.status || fund.status === fundFilters.status;
    const matchesVintageMin = !fundFilters.vintageMin || fund.vintage >= parseInt(fundFilters.vintageMin);
    const matchesVintageMax = !fundFilters.vintageMax || fund.vintage <= parseInt(fundFilters.vintageMax);
    
    return matchesSearch && matchesStrategy && matchesStatus && matchesVintageMin && matchesVintageMax;
  }).sort((a, b) => {
    // Dynamic sorting based on the selected field and direction
    const fieldA = a[sortField as keyof Fund];
    const fieldB = b[sortField as keyof Fund];

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    } else {
      // Handle cases where field might be missing or not sortable
      if (fieldA == null && fieldB != null) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA != null && fieldB == null) return sortDirection === 'asc' ? 1 : -1;
      if (fieldA == null && fieldB == null) return 0;
      // Fallback for other types or mixed types (might need adjustment)
      return 0;
    }
  });
  
  // Filter companies based on search term and filters
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = !companyFilters.sector || company.sector === companyFilters.sector;
    const matchesStatus = !companyFilters.status || company.status === companyFilters.status;
    const matchesFund = !companyFilters.fundId || company.fundId === companyFilters.fundId;
    
    return matchesSearch && matchesSector && matchesStatus && matchesFund;
  }).sort((a, b) => {
    // Dynamic sorting based on the selected field and direction
    const fieldA = a[sortField as keyof PortfolioCompany];
    const fieldB = b[sortField as keyof PortfolioCompany];

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    } else {
       // Handle date comparison for investmentDate
       if (sortField === 'investmentDate' && typeof fieldA === 'string' && typeof fieldB === 'string') {
         return sortDirection === 'asc' ? new Date(fieldA).getTime() - new Date(fieldB).getTime() : new Date(fieldB).getTime() - new Date(fieldA).getTime();
       }
      // Handle cases where field might be missing or not sortable
      if (fieldA == null && fieldB != null) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA != null && fieldB == null) return sortDirection === 'asc' ? 1 : -1;
      if (fieldA == null && fieldB == null) return 0;
      // Fallback for other types or mixed types (might need adjustment)
      return 0;
    }
  });
  
  // Get unique values for filters
  const uniqueStrategies = Array.from(new Set(funds.map(fund => fund.strategy))).sort();
  const uniqueFundStatuses = Array.from(new Set(funds.map(fund => fund.status))).sort();
  const uniqueSectors = Array.from(new Set(companies.map(company => company.sector))).sort();
  const uniqueCompanyStatuses = Array.from(new Set(companies.map(company => company.status))).sort();
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle adding a new fund
  const handleAddFund = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const strategy = formData.get('strategy') as string;
    const vintage = parseInt(formData.get('vintage') as string);
    const aum = parseFloat(formData.get('aum') as string);
    const irr = parseFloat(formData.get('irr') as string);
    const moic = parseFloat(formData.get('moic') as string);
    const commitments = parseFloat(formData.get('commitments') as string);
    const called = parseFloat(formData.get('called') as string);
    const distributed = parseFloat(formData.get('distributed') as string);
    const nav = parseFloat(formData.get('nav') as string);
    const status = formData.get('status') as 'Active' | 'Harvesting' | 'Fully Realized';
    
    // Calculate derived metrics
    const dpi = called > 0 ? Math.round((distributed / called) * 10) / 10 : 0;
    const tvpi = called > 0 ? Math.round(((nav + distributed) / called) * 10) / 10 : 0;
    
    const newFund: Fund = {
      id: `fund-${Date.now()}`,
      name,
      strategy,
      vintage,
      aum,
      irr,
      moic,
      dpi,
      tvpi,
      commitments,
      called,
      distributed,
      nav,
      status,
      performanceData: [
        { quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, value: nav }
      ]
    };
    
    setFunds([...funds, newFund]);
    setIsAddingFund(false);
  };
  
  // Handle adding a new portfolio company
  const handleAddCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const fundId = formData.get('fundId') as string;
    const sector = formData.get('sector') as string;
    const investmentDate = formData.get('investmentDate') as string;
    const initialInvestment = parseFloat(formData.get('initialInvestment') as string);
    const currentValue = parseFloat(formData.get('currentValue') as string);
    const ownership = parseFloat(formData.get('ownership') as string);
    const revenue = parseFloat(formData.get('revenue') as string);
    const ebitda = parseFloat(formData.get('ebitda') as string);
    const status = formData.get('status') as 'Active' | 'Exited' | 'Written Off';
    
    // Additional fields for exited companies
    let exitDate: string | undefined = undefined;
    let exitValue: number | undefined = undefined;
    let irr: number | undefined = undefined;
    let moic: number | undefined = undefined;

    if ((status === 'Exited' || status === 'Written Off') && initialInvestment > 0) {
      exitDate = formData.get('exitDate') as string;
      exitValue = parseFloat(formData.get('exitValue') as string);
      
      // Calculate metrics
      moic = Math.round((exitValue / initialInvestment) * 10) / 10;
      
      // Calculate IRR (simplified calculation for demo)
      if (investmentDate && exitDate) {
        const investmentDateObj = new Date(investmentDate);
        const exitDateObj = new Date(exitDate);
        const years = (exitDateObj.getTime() - investmentDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (years > 0 && moic > 0) {
            irr = Math.round(((Math.pow(moic, 1 / years) - 1) * 100) * 10) / 10;
        } else if (moic === 0) {
            irr = -100;
        }
      }
    }
    
    const newCompany: PortfolioCompany = {
      id: `company-${Date.now()}`,
      name,
      fundId,
      sector,
      investmentDate,
      initialInvestment,
      currentValue: status === 'Active' ? currentValue : exitValue || 0,
      ownership,
      revenue,
      ebitda,
      status,
      exitDate,
      exitValue,
      irr,
      moic,
      performanceData: [
        { quarter: `Q${Math.ceil((new Date(investmentDate).getMonth() + 1) / 3)} ${new Date(investmentDate).getFullYear()}`, value: initialInvestment },
        { quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, value: status === 'Active' ? currentValue : exitValue || 0 }
      ]
    };
    
    setCompanies([...companies, newCompany]);
    setIsAddingCompany(false);
  };
  
  // Handle editing a fund
  const handleEditFund = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFund) return;
    
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const strategy = formData.get('strategy') as string;
    const vintage = parseInt(formData.get('vintage') as string);
    const aum = parseFloat(formData.get('aum') as string);
    const irr = parseFloat(formData.get('irr') as string);
    const moic = parseFloat(formData.get('moic') as string);
    const commitments = parseFloat(formData.get('commitments') as string);
    const called = parseFloat(formData.get('called') as string);
    const distributed = parseFloat(formData.get('distributed') as string);
    const nav = parseFloat(formData.get('nav') as string);
    const status = formData.get('status') as 'Active' | 'Harvesting' | 'Fully Realized';
    
    // Calculate derived metrics
    const dpi = called > 0 ? Math.round((distributed / called) * 10) / 10 : 0;
    const tvpi = called > 0 ? Math.round(((nav + distributed) / called) * 10) / 10 : 0;
    
    const updatedFunds = funds.map(fund => {
      if (fund.id === selectedFund.id) {
        // Ensure performance data exists and has at least one entry
        const lastPerfData = fund.performanceData.length > 0 
          ? fund.performanceData[fund.performanceData.length - 1]
          : { quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, value: 0 }; // Fallback if no data
        
        return {
          ...fund,
          name,
          strategy,
          vintage,
          aum,
          irr,
          moic,
          dpi,
          tvpi,
          commitments,
          called,
          distributed,
          nav,
          status,
          // Update the latest performance point if it exists, otherwise add it
          performanceData: [
            ...fund.performanceData.slice(0, -1),
            { ...lastPerfData, value: nav } // Update value of the last entry
          ]
        };
      }
      return fund;
    });
    
    setFunds(updatedFunds);
    setIsEditingFund(false);
    setSelectedFund(null); // Deselect after edit
  };
  
  // Handle editing a company
  const handleEditCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const fundId = formData.get('fundId') as string;
    const sector = formData.get('sector') as string;
    const investmentDate = formData.get('investmentDate') as string;
    const initialInvestment = parseFloat(formData.get('initialInvestment') as string);
    const currentValueInput = parseFloat(formData.get('currentValue') as string);
    const ownership = parseFloat(formData.get('ownership') as string);
    const revenue = parseFloat(formData.get('revenue') as string);
    const ebitda = parseFloat(formData.get('ebitda') as string);
    const status = formData.get('status') as 'Active' | 'Exited' | 'Written Off';
    
    // Additional fields for exited companies
    let exitDate: string | undefined = undefined;
    let exitValue: number | undefined = undefined;
    let irr: number | undefined = undefined;
    let moic: number | undefined = undefined;
    let finalCurrentValue = currentValueInput; // Use input value for Active status

    if ((status === 'Exited' || status === 'Written Off') && initialInvestment > 0) {
      exitDate = formData.get('exitDate') as string;
      exitValue = parseFloat(formData.get('exitValue') as string);
      finalCurrentValue = exitValue; // For Exited/WrittenOff, Current Value = Exit Value
      
      // Calculate metrics
      moic = Math.round((exitValue / initialInvestment) * 10) / 10;
      
      // Calculate IRR (simplified calculation for demo)
      if (investmentDate && exitDate) {
          const investmentDateObj = new Date(investmentDate);
          const exitDateObj = new Date(exitDate);
          const years = (exitDateObj.getTime() - investmentDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          if (years > 0 && moic > 0) {
              irr = Math.round(((Math.pow(moic, 1 / years) - 1) * 100) * 10) / 10;
          } else if (moic === 0) {
              irr = -100;
          }
      }
    }
    
    const updatedCompanies = companies.map(company => {
      if (company.id === selectedCompany.id) {
        // Ensure performance data exists and has at least one entry
        const lastPerfData = company.performanceData.length > 0 
            ? company.performanceData[company.performanceData.length - 1]
            : { quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, value: 0 }; // Fallback

        return {
          ...company,
          name,
          fundId,
          sector,
          investmentDate,
          initialInvestment,
          currentValue: finalCurrentValue,
          ownership,
          revenue,
          ebitda,
          status,
          exitDate,
          exitValue,
          irr,
          moic,
          // Update the latest performance point
          performanceData: [
            ...company.performanceData.slice(0, -1),
            { ...lastPerfData, value: finalCurrentValue }
          ]
        };
      }
      return company;
    });
    
    setCompanies(updatedCompanies);
    setIsEditingCompany(false);
    setSelectedCompany(null); // Deselect after edit
  };
  
  // Handle deleting a fund
  const handleDeleteFund = (fundId: string) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this fund? This will also delete all associated portfolio companies.')) {
      // Delete the fund
      setFunds(funds.filter(fund => fund.id !== fundId));
      
      // Delete all associated companies
      setCompanies(companies.filter(company => company.fundId !== fundId));
      
      // If the deleted fund was selected, clear the selection
      if (selectedFund?.id === fundId) {
        setSelectedFund(null);
      }
    }
  };
  
  // Handle deleting a company
  const handleDeleteCompany = (companyId: string) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this portfolio company?')) {
      setCompanies(companies.filter(company => company.id !== companyId));
      
      // If the deleted company was selected, clear the selection
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
      }
    }
  };
  
  // Generate template files for export
  const generateFundTemplateData = () => {
    const template = [
      'name,strategy,vintage,aum,irr,moic,commitments,called,distributed,nav,status',
      'Fund Name,Buyout,2022,500,15,1.5,550,300,100,350,Active' // Example row
    ];
    return template.join('\n');
  };
  
  const generateCompanyTemplateData = () => {
    const template = [
      'name,fundId,sector,investmentDate,initialInvestment,currentValue,ownership,revenue,ebitda,status,exitDate,exitValue',
      `Company Name,${funds[0]?.id || 'fund-1'},Technology,2022-01-01,25,35,40,30,6,Active,,`, // Example active
      `Exited Company,${funds[0]?.id || 'fund-1'},Healthcare,2020-06-01,20,,35,25,5,Exited,2023-05-01,40` // Example exited (currentValue left blank, exitValue provided)
    ];
    return template.join('\n');
  };
  
  // Download template files
  const downloadFile = (data: string, filename: string, type: string) => {
      if (typeof window === 'undefined') return; // Check for browser environment
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const downloadFundTemplate = () => {
    const data = generateFundTemplateData();
    downloadFile(data, 'fund_template.csv', 'text/csv');
  };
  
  const downloadCompanyTemplate = () => {
    const data = generateCompanyTemplateData();
    downloadFile(data, 'company_template.csv', 'text/csv');
  };
  
  // Handle file upload
  const handleFundFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || typeof window === 'undefined') return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== ''); // Split lines and remove empty ones
        if (lines.length <= 1) {
          alert('CSV file is empty or contains only headers.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name', 'strategy', 'vintage', 'aum', 'irr', 'moic', 'commitments', 'called', 'distributed', 'nav', 'status'];
        if (!requiredHeaders.every(h => headers.includes(h))) {
            alert(`CSV file missing required headers. Required: ${requiredHeaders.join(', ')}`);
            return;
        }
        
        const newFunds: Fund[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length !== headers.length) {
              console.warn(`Skipping row ${i + 1}: Incorrect number of columns.`);
              continue;
          }
          const fundData: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            fundData[header] = values[index]?.trim() || '';
          });
          
          // Validate and parse numeric values
          const vintage = parseInt(fundData.vintage);
          const aum = parseFloat(fundData.aum);
          const irr = parseFloat(fundData.irr);
          const moic = parseFloat(fundData.moic);
          const commitments = parseFloat(fundData.commitments);
          const called = parseFloat(fundData.called);
          const distributed = parseFloat(fundData.distributed);
          const nav = parseFloat(fundData.nav);

          // Basic validation
          if (isNaN(vintage) || isNaN(aum) || isNaN(irr) || isNaN(moic) || isNaN(commitments) || isNaN(called) || isNaN(distributed) || isNaN(nav)) {
              console.warn(`Skipping row ${i + 1}: Invalid numeric data.`);
              continue;
          }

          const status = fundData.status as 'Active' | 'Harvesting' | 'Fully Realized';
          if (!['Active', 'Harvesting', 'Fully Realized'].includes(status)) {
              console.warn(`Skipping row ${i + 1}: Invalid status value.`);
              continue;
          }
          
          // Calculate derived metrics
          const dpi = called > 0 ? Math.round((distributed / called) * 10) / 10 : 0;
          const tvpi = called > 0 ? Math.round(((nav + distributed) / called) * 10) / 10 : 0;
          
          const newFund: Fund = {
            id: `fund-${Date.now()}-${i}`,
            name: fundData.name,
            strategy: fundData.strategy,
            vintage,
            aum,
            irr,
            moic,
            dpi,
            tvpi,
            commitments,
            called,
            distributed,
            nav,
            status,
            performanceData: [
              { quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, value: nav }
            ]
          };
          
          newFunds.push(newFund);
        }
        
        if (newFunds.length > 0) {
          setFunds([...funds, ...newFunds]);
          alert(`Successfully imported ${newFunds.length} funds.`);
        } else {
          alert('No valid funds found in the CSV file to import.');
        }
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        alert('Error parsing CSV file. Please check the format and try again.');
      }
      // Reset file input value to allow re-uploading the same file
      e.target.value = ''; 
    };
    reader.onerror = () => {
        alert('Error reading the file.');
        e.target.value = ''; 
    };
    reader.readAsText(file);
  };
  
  const handleCompanyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || typeof window === 'undefined') return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== ''); // Split lines and remove empty ones
        if (lines.length <= 1) {
          alert('CSV file is empty or contains only headers.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name', 'fundId', 'sector', 'investmentDate', 'initialInvestment', 'ownership', 'revenue', 'ebitda', 'status'];
        // Optional: currentValue, exitDate, exitValue
        if (!requiredHeaders.every(h => headers.includes(h))) {
            alert(`CSV file missing required headers. Required: ${requiredHeaders.join(', ')}`);
            return;
        }

        const existingFundIds = new Set(funds.map(f => f.id));
        const newCompanies: PortfolioCompany[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
           if (values.length !== headers.length) {
              console.warn(`Skipping row ${i + 1}: Incorrect number of columns.`);
              continue;
          }
          const companyData: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            companyData[header] = values[index]?.trim() || '';
          });

          // Validate Fund ID
          if (!existingFundIds.has(companyData.fundId)) {
              console.warn(`Skipping row ${i+1}: Fund ID '${companyData.fundId}' does not exist.`);
              continue;
          }
          
          // Validate and parse numeric values
          const initialInvestment = parseFloat(companyData.initialInvestment);
          const ownership = parseFloat(companyData.ownership);
          const revenue = parseFloat(companyData.revenue);
          const ebitda = parseFloat(companyData.ebitda);
          // currentValue is optional for Active, mandatory for Exited/WrittenOff (as exitValue)
          const status = companyData.status as 'Active' | 'Exited' | 'Written Off';

          if (isNaN(initialInvestment) || isNaN(ownership) || isNaN(revenue) || isNaN(ebitda)) {
              console.warn(`Skipping row ${i + 1}: Invalid numeric data for core fields.`);
              continue;
          }
          if (!['Active', 'Exited', 'Written Off'].includes(status)) {
              console.warn(`Skipping row ${i + 1}: Invalid status value.`);
              continue;
          }
          
          // Additional fields for exited companies
          let exitDate: string | undefined = undefined;
          let exitValue: number | undefined = undefined;
          let irr: number | undefined = undefined;
          let moic: number | undefined = undefined;
          let finalCurrentValue: number; 

          if (status === 'Active') {
              finalCurrentValue = parseFloat(companyData.currentValue || '0'); // Use currentValue if provided, else 0 for active
              if (isNaN(finalCurrentValue)) {
                   console.warn(`Skipping row ${i + 1}: Invalid currentValue for Active status.`);
                   continue;
              }
          } else { // Exited or Written Off
              exitDate = companyData.exitDate;
              exitValue = parseFloat(companyData.exitValue);
              if (exitDate === undefined || isNaN(exitValue)) {
                  console.warn(`Skipping row ${i + 1}: Missing or invalid exitDate/exitValue for ${status} status.`);
                  continue;
              }
              finalCurrentValue = exitValue; // Current value is exit value

              if (initialInvestment > 0) {
                  moic = Math.round((exitValue / initialInvestment) * 10) / 10;
                  if (companyData.investmentDate && exitDate) {
                      const investmentDateObj = new Date(companyData.investmentDate);
                      const exitDateObj = new Date(exitDate);
                      const years = (exitDateObj.getTime() - investmentDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
                      if (years > 0 && moic > 0) {
                          irr = Math.round(((Math.pow(moic, 1 / years) - 1) * 100) * 10) / 10;
                      } else if (moic === 0) {
                          irr = -100;
                      }
                  }
              }
          }
          
          const newCompany: PortfolioCompany = {
            id: `company-${Date.now()}-${i}`,
            name: companyData.name,
            fundId: companyData.fundId,
            sector: companyData.sector,
            investmentDate: companyData.investmentDate,
            initialInvestment,
            currentValue: finalCurrentValue,
            ownership,
            revenue,
            ebitda,
            status,
            exitDate,
            exitValue,
            irr,
            moic,
            performanceData: [
              { quarter: `Q${Math.ceil((new Date(companyData.investmentDate).getMonth() + 1) / 3)} ${new Date(companyData.investmentDate).getFullYear()}`, value: initialInvestment },
              { quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, value: finalCurrentValue }
            ]
          };
          
          newCompanies.push(newCompany);
        }
        
        if (newCompanies.length > 0) {
            setCompanies([...companies, ...newCompanies]);
            alert(`Successfully imported ${newCompanies.length} portfolio companies.`);
        } else {
            alert('No valid companies found in the CSV file to import.');
        }
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        alert('Error parsing CSV file. Please check the format and try again.');
      }
      // Reset file input value
      e.target.value = ''; 
    };
    reader.onerror = () => {
        alert('Error reading the file.');
        e.target.value = ''; 
    };
    reader.readAsText(file);
  };
  
  // Calculate fund summary metrics
  const totalAUM = funds.reduce((sum, fund) => sum + fund.aum, 0);
  // Calculate weighted averages only if totalAUM > 0 to avoid division by zero
  const weightedIRR = totalAUM > 0 ? funds.reduce((sum, fund) => sum + (fund.irr * fund.aum), 0) / totalAUM : 0;
  const weightedMOIC = totalAUM > 0 ? funds.reduce((sum, fund) => sum + (fund.moic * fund.aum), 0) / totalAUM : 0;
  
  // Calculate company summary metrics
  const totalInvestment = companies.reduce((sum, company) => sum + company.initialInvestment, 0);
  const totalCurrentValue = companies.reduce((sum, company) => sum + company.currentValue, 0);
  // Calculate portfolio MOIC only if totalInvestment > 0
  const portfolioMOIC = totalInvestment > 0 ? totalCurrentValue / totalInvestment : 0;
  
  // Get fund and sector distributions for charts
  const fundDistribution = funds.map(fund => ({
    name: fund.name,
    value: fund.aum
  }));
  
  const sectorDistribution = companies.reduce((acc: { name: string; value: number }[], company) => {
    const existingSector = acc.find(item => item.name === company.sector);
    if (existingSector) {
      existingSector.value += company.currentValue;
    } else {
      acc.push({ name: company.sector, value: company.currentValue });
    }
    return acc;
  }, []).sort((a,b) => b.value - a.value); // Sort for better pie chart display
  
  // Get status distribution for companies
  const statusDistribution = companies.reduce((acc: { name: string; value: number }[], company) => {
    const existingStatus = acc.find(item => item.name === company.status);
    if (existingStatus) {
      existingStatus.value += company.currentValue;
    } else {
      acc.push({ name: company.status, value: company.currentValue });
    }
    return acc;
  }, []);
  
  // Custom colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];
  
  // Dashboard view
  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Summary Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Fund Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total AUM</div>
            <div className="stat-value">${totalAUM.toFixed(1)}M</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Avg. IRR</div>
            <div className="stat-value">{weightedIRR.toFixed(1)}%</div>
            <div className="stat-desc flex items-center text-xs mt-1">
              {weightedIRR >= 15 ? (
                <><ArrowUp className="h-3 w-3 text-green-500 mr-1" /> Strong</>
              ) : weightedIRR >= 0 ? (
                <><TrendingUp className="h-3 w-3 text-yellow-500 mr-1" /> Positive</>
              ) : (
                <><ArrowDown className="h-3 w-3 text-red-500 mr-1" /> Negative</>
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Avg. MOIC</div>
            <div className="stat-value">{weightedMOIC.toFixed(2)}x</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Funds</div>
            <div className="stat-value">{funds.length}</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Portfolio Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Invested</div>
            <div className="stat-value">${totalInvestment.toFixed(1)}M</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Current Value</div>
            <div className="stat-value">${totalCurrentValue.toFixed(1)}M</div>
            <div className="stat-desc flex items-center text-xs mt-1">
              {totalCurrentValue >= totalInvestment ? (
                <><TrendingUp className="h-3 w-3 text-green-500 mr-1" /> {totalInvestment > 0 ? ((totalCurrentValue / totalInvestment - 1) * 100).toFixed(1) + '% gain' : 'N/A'}</>
              ) : (
                <><TrendingDown className="h-3 w-3 text-red-500 mr-1" /> {totalInvestment > 0 ? ((1 - totalCurrentValue / totalInvestment) * 100).toFixed(1) + '% loss' : 'N/A'}</>
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Overall MOIC</div>
            <div className="stat-value">{portfolioMOIC.toFixed(2)}x</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Companies</div>
            <div className="stat-value">{companies.length}</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Activity Summary
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Funds</span>
            <span className="font-semibold">{funds.filter(fund => fund.status === 'Active').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Harvesting Funds</span>
            <span className="font-semibold">{funds.filter(fund => fund.status === 'Harvesting').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Fully Realized</span>
            <span className="font-semibold">{funds.filter(fund => fund.status === 'Fully Realized').length}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Companies</span>
            <span className="font-semibold">{companies.filter(company => company.status === 'Active').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Exited Companies</span>
            <span className="font-semibold">{companies.filter(company => company.status === 'Exited').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Written Off</span>
            <span className="font-semibold">{companies.filter(company => company.status === 'Written Off').length}</span>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="card col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChartPie className="h-5 w-5 mr-2" />
          Portfolio Composition
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80">
            <h4 className="text-center text-sm font-medium mb-2">Fund Distribution (AUM)</h4>
            {fundDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                    data={fundDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        );
                    }}
                    >
                    {fundDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`$${(value as number).toFixed(1)}M`, name]} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No Fund Data</div>
            )}
          </div>
          
          <div className="h-80">
            <h4 className="text-center text-sm font-medium mb-2">Sector Allocation (Value)</h4>
            {sectorDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                    data={sectorDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        );
                    }}
                    >
                    {sectorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`$${(value as number).toFixed(1)}M`, name]} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No Company Data</div>
            )}
          </div>
          
          <div className="h-80">
            <h4 className="text-center text-sm font-medium mb-2">Investment Status (Value)</h4>
             {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        );
                    }}
                    >
                    {statusDistribution.map((entry, index) => (
                        <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Active' ? '#4ade80' : entry.name === 'Exited' ? '#3b82f6' : '#ef4444'} 
                        />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`$${(value as number).toFixed(1)}M`, name]} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No Company Data</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Fund Performance
        </h3>
        <div className="h-96"> {/* Increased height */}
          {funds.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={funds}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }} // Increased bottom margin
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    tick={{ fontSize: 10 }} // Smaller font size
                    interval={0} // Show all labels
                    height={80} // Increased height for labels
                />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'IRR (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'MOIC (x)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value, name) => [name === 'irr' ? `${value}%` : `${value}x`, name === 'irr' ? 'IRR' : 'MOIC']} />
                <Legend verticalAlign="top" height={36}/>
                <Bar yAxisId="left" dataKey="irr" name="IRR" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="moic" name="MOIC" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
          ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No Fund Data</div>
          )}
        </div>
      </div>
      
      <div className="card col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold mb-4">Top Performing Companies (by MOIC)</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="table-header px-2 py-3">Company</th>
                <th className="table-header px-2 py-3">Fund</th>
                <th className="table-header px-2 py-3">Sector</th>
                <th className="table-header px-2 py-3">Initial ($M)</th>
                <th className="table-header px-2 py-3">Current ($M)</th>
                <th className="table-header px-2 py-3">MOIC</th>
                <th className="table-header px-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {companies
                .map(company => {
                    // Calculate MOIC based on status
                    const moicValue = company.status === 'Active' 
                        ? (company.initialInvestment > 0 ? company.currentValue / company.initialInvestment : 0)
                        : company.moic || 0;
                    return { ...company, calculatedMoic: moicValue };
                })
                .sort((a, b) => b.calculatedMoic - a.calculatedMoic)
                .slice(0, 5)
                .map(company => {
                  const fund = funds.find(f => f.id === company.fundId);
                  return (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="table-cell px-2 py-3 text-sm">{company.name}</td>
                      <td className="table-cell px-2 py-3 text-sm">{fund?.name || 'Unknown'}</td>
                      <td className="table-cell px-2 py-3 text-sm">{company.sector}</td>
                      <td className="table-cell px-2 py-3 text-sm">{company.initialInvestment.toFixed(1)}</td>
                      <td className="table-cell px-2 py-3 text-sm">{company.currentValue.toFixed(1)}</td>
                      <td className="table-cell px-2 py-3 text-sm">
                        <span className={company.calculatedMoic >= 2 ? 'text-green-600 dark:text-green-400 font-semibold' : company.calculatedMoic < 1 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                          {company.calculatedMoic.toFixed(2)}x
                        </span>
                      </td>
                      <td className="table-cell px-2 py-3 text-sm">
                        <span className={`badge text-xs ${ // Smaller badge
                          company.status === 'Active' ? 'badge-success' : 
                          company.status === 'Exited' ? 'badge-info' : 'badge-error'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {companies.length === 0 && (
                    <tr>
                        <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">No companies found.</td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Render the fund detail view
  const renderFundDetail = () => {
    if (!selectedFund) return null;
    
    const fundCompanies = companies.filter(company => company.fundId === selectedFund.id);
    const totalInvested = fundCompanies.reduce((sum, company) => sum + company.initialInvestment, 0);
    const totalCurrentValue = fundCompanies.reduce((sum, company) => sum + company.currentValue, 0);
    const fundMOIC = totalInvested > 0 ? totalCurrentValue / totalInvested : 0;
    
    // Calculate called percentage
    const calledPercentage = selectedFund.commitments > 0 ? (selectedFund.called / selectedFund.commitments) * 100 : 0;
    
    // Organize performance data for charts
    const performanceData = [...selectedFund.performanceData].sort((a, b) => {
      const [aQ, aY] = a.quarter.split(' ');
      const [bQ, bY] = b.quarter.split(' ');
      return parseInt(aY) - parseInt(bY) || parseInt(aQ.substring(1)) - parseInt(bQ.substring(1));
    });
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedFund(null)}
            className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
          >
            &larr; Back to Funds
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsEditingFund(true);
              }}
              className="btn btn-sm btn-primary"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit Fund
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedFund.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="badge text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">{selectedFund.strategy}</span>
                  <span className="badge text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Vintage {selectedFund.vintage}</span>
                  <span className={`badge text-xs ${selectedFund.status === 'Active' ? 'badge-success' : selectedFund.status === 'Harvesting' ? 'badge-warning' : 'badge-info'}`}>
                    {selectedFund.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">AUM</span>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">${selectedFund.aum}M</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="stat-card">
                <div className="stat-title">IRR</div>
                <div className="stat-value">{selectedFund.irr}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">MOIC</div>
                <div className="stat-value">{selectedFund.moic.toFixed(2)}x</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">DPI</div>
                <div className="stat-value">{selectedFund.dpi.toFixed(2)}x</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">TVPI</div>
                <div className="stat-value">{selectedFund.tvpi.toFixed(2)}x</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Capital Called: ${selectedFund.called}M / ${selectedFund.commitments}M</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calledPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                  style={{ width: `${calledPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="h-64">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Fund Performance Over Time (NAV)</h4>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                    data={performanceData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`$${(value as number).toFixed(1)}M`, 'NAV']} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
                ) : (
                 <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No Performance Data</div>
                )}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Fund Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Commitments</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">${selectedFund.commitments}M</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Called Capital</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">${selectedFund.called}M</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Distributed</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">${selectedFund.distributed}M</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Current NAV</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">${selectedFund.nav}M</div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Portfolio Companies</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{fundCompanies.length}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Invested</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">${totalInvested.toFixed(1)}M</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Current Portfolio Value</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">${totalCurrentValue.toFixed(1)}M</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Portfolio MOIC</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{fundMOIC.toFixed(2)}x</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Companies in {selectedFund.name}</h3>
            <button 
              onClick={() => setIsAddingCompany(true)} // Will prefill fund in modal
              className="btn btn-sm btn-primary"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Company
            </button>
          </div>
          
          {fundCompanies.length === 0 ? (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
              No portfolio companies found for this fund.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="table-header text-xs">Company</th>
                    <th className="table-header text-xs">Sector</th>
                    <th className="table-header text-xs">Investment Date</th>
                    <th className="table-header text-xs">Initial ($M)</th>
                    <th className="table-header text-xs">Current ($M)</th>
                    <th className="table-header text-xs">MOIC</th>
                    <th className="table-header text-xs">Status</th>
                    <th className="table-header text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {fundCompanies.map(company => {
                    const moic = company.initialInvestment > 0 
                      ? (company.status === 'Active' ? company.currentValue / company.initialInvestment : company.moic || 0)
                      : 0;
                    return (
                      <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="table-cell text-sm">{company.name}</td>
                        <td className="table-cell text-sm">{company.sector}</td>
                        <td className="table-cell text-sm">{new Date(company.investmentDate).toLocaleDateString()}</td>
                        <td className="table-cell text-sm">{company.initialInvestment.toFixed(1)}</td>
                        <td className="table-cell text-sm">{company.currentValue.toFixed(1)}</td>
                        <td className="table-cell text-sm">
                          <span className={moic >= 2 ? 'text-green-600 dark:text-green-400 font-semibold' : moic < 1 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                            {moic.toFixed(2)}x
                          </span>
                        </td>
                        <td className="table-cell text-sm">
                          <span className={`badge text-xs ${ // Smaller badge
                            company.status === 'Active' ? 'badge-success' : 
                            company.status === 'Exited' ? 'badge-info' : 'badge-error'
                          }`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="table-cell text-sm">
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => setSelectedCompany(company)} // Set selected company for detail view
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 tooltip"
                              data-tip="View company details"
                              aria-label="View company details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedCompany(company);
                                setEditCompanyModalStatus(company.status); // Set initial status for edit modal
                                setIsEditingCompany(true);
                              }}
                              className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 tooltip"
                              data-tip="Edit company"
                              aria-label="Edit company"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company.id); }}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 tooltip"
                              data-tip="Delete company"
                              aria-label="Delete company"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>
    );
  };
  
  // Render the company detail view
  const renderCompanyDetail = () => {
    if (!selectedCompany) return null;
    
    const fund = funds.find(f => f.id === selectedCompany.fundId);
    const exitInfo = selectedCompany.status !== 'Active' ? (
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Exit Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Exit Date</span>
            <div className="font-medium text-sm text-gray-900 dark:text-white">{selectedCompany.exitDate ? new Date(selectedCompany.exitDate).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Exit Value</span>
            <div className="font-medium text-sm text-gray-900 dark:text-white">${selectedCompany.exitValue?.toFixed(1)}M</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Exit MOIC</span>
            <div className="font-medium text-sm text-gray-900 dark:text-white">{selectedCompany.moic?.toFixed(2)}x</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">IRR</span>
            <div className="font-medium text-sm text-gray-900 dark:text-white">{selectedCompany.irr?.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    ) : null;
    
    // Organize performance data for charts
    const performanceData = [...selectedCompany.performanceData].sort((a, b) => {
        const [aQ, aY] = a.quarter.split(' ');
        const [bQ, bY] = b.quarter.split(' ');
        return parseInt(aY) - parseInt(bY) || parseInt(aQ.substring(1)) - parseInt(bQ.substring(1));
    });

    const currentMoic = selectedCompany.initialInvestment > 0 
                        ? (selectedCompany.status === 'Active' ? selectedCompany.currentValue / selectedCompany.initialInvestment : selectedCompany.moic || 0)
                        : 0;
    const valueChangeAmount = selectedCompany.currentValue - selectedCompany.initialInvestment;
    const valueChangePercent = selectedCompany.initialInvestment > 0 ? (valueChangeAmount / selectedCompany.initialInvestment) * 100 : 0;
    const entryEvEbitda = selectedCompany.ebitda !== 0 && selectedCompany.ownership > 0 ? (selectedCompany.initialInvestment / (selectedCompany.ownership / 100)) / selectedCompany.ebitda : undefined;
    const currentEvEbitda = selectedCompany.ebitda !== 0 && selectedCompany.ownership > 0 ? (selectedCompany.currentValue / (selectedCompany.ownership / 100)) / selectedCompany.ebitda : undefined;
    
    const calculateHoldingPeriod = () => {
        try {
            const startDate = new Date(selectedCompany.investmentDate);
            const endDate = selectedCompany.status === 'Active' ? new Date() : new Date(selectedCompany.exitDate || '');
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'N/A';
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
            return `${diffYears.toFixed(1)} years`;
        } catch (e) {
            return 'N/A';
        }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setSelectedCompany(null);
              // If we came from a fund view, remain in fund view (renderFundDetail will handle this)
              // If we came from companies list, selectedFund will be null, go back to list
              if (!selectedFund) setSelectedView('companies');
            }}
            className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
          >
             &larr; {selectedFund ? 'Back to Fund' : 'Back to Companies'}
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditCompanyModalStatus(selectedCompany.status); // Set initial status
                setIsEditingCompany(true);
              }}
              className="btn btn-sm btn-primary"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit Company
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="badge text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">{selectedCompany.sector}</span>
                  <span className="badge text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{fund?.name || 'Unknown Fund'}</span>
                  <span className={`badge text-xs ${ // Smaller badge
                    selectedCompany.status === 'Active' ? 'badge-success' : 
                    selectedCompany.status === 'Exited' ? 'badge-info' : 'badge-error'
                  }`}>
                    {selectedCompany.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ownership</span>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedCompany.ownership}%</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="stat-card">
                <div className="stat-title">Investment</div>
                <div className="stat-value">${selectedCompany.initialInvestment.toFixed(1)}M</div>
                <div className="stat-desc text-xs mt-1">{new Date(selectedCompany.investmentDate).toLocaleDateString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Current Value</div>
                <div className="stat-value">${selectedCompany.currentValue.toFixed(1)}M</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Revenue</div>
                <div className="stat-value">${selectedCompany.revenue.toFixed(1)}M</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">EBITDA</div>
                <div className="stat-value">${selectedCompany.ebitda.toFixed(1)}M</div>
                <div className="stat-desc text-xs mt-1">{selectedCompany.revenue !== 0 ? `${((selectedCompany.ebitda / selectedCompany.revenue) * 100).toFixed(0)}% margin` : 'N/A'}</div>
              </div>
            </div>
            
            <div className="h-64">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Company Value Over Time</h4>
               {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                    data={performanceData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }}/>
                    <Tooltip formatter={(value) => [`$${(value as number).toFixed(1)}M`, 'Value']} />
                    <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
                 ) : (
                 <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No Performance Data</div>
                )}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Metrics</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Investment Date</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{new Date(selectedCompany.investmentDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Holding Period</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{calculateHoldingPeriod()}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">{selectedCompany.status === 'Active' ? 'Current MOIC' : 'Exit MOIC'}</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {currentMoic.toFixed(2)}x
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Value Change</span>
                <div className="font-medium text-sm flex items-center text-gray-900 dark:text-white">
                  {valueChangeAmount >= 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      +${valueChangeAmount.toFixed(1)}M
                      ({valueChangePercent > 0 ? `+${valueChangePercent.toFixed(1)}%` : '0.0%'}) 
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      -${Math.abs(valueChangeAmount).toFixed(1)}M
                      ({valueChangePercent.toFixed(1)}%)
                    </>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Entry EV/EBITDA</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {entryEvEbitda !== undefined ? `${entryEvEbitda.toFixed(1)}x` : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Current EV/EBITDA</span>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                   {currentEvEbitda !== undefined ? `${currentEvEbitda.toFixed(1)}x` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {exitInfo}
      </div>
    );
  };
  
  // Render the funds list view
  const renderFundsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Funds Overview</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <input
              type="file"
              id="fundFileUpload"
              className="hidden"
              accept=".csv"
              onChange={handleFundFileUpload}
            />
            <button 
              onClick={downloadFundTemplate}
              className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white tooltip"
              data-tip="Download CSV template for funds"
            >
              <Download className="h-4 w-4 mr-1" />
              Template
            </button>
            <label 
              htmlFor="fundFileUpload"
              className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white cursor-pointer tooltip"
              data-tip="Import funds from CSV"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </label>
          </div>
          <button 
            onClick={() => setIsAddingFund(true)}
            className="btn btn-sm btn-primary"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Fund
          </button>
        </div>
      </div>
      
      {/* Search and Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search funds by name or strategy..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
            className="input w-full"
            value={fundFilters.strategy}
            onChange={(e) => setFundFilters({ ...fundFilters, strategy: e.target.value })}
        >
            <option value="">All Strategies</option>
            {uniqueStrategies.map(strategy => (
            <option key={strategy} value={strategy}>{strategy}</option>
            ))}
        </select>
        
        <select
            className="input w-full"
            value={fundFilters.status}
            onChange={(e) => setFundFilters({ ...fundFilters, status: e.target.value })}
        >
            <option value="">All Statuses</option>
            {uniqueFundStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
            ))}
        </select>
        
        <button 
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white flex items-center justify-center w-full"
            onClick={() => { 
                setFundFilters({ strategy: '', status: '', vintageMin: '', vintageMax: '' });
                setSearchTerm('');
            }}
        >
            <Filter className="h-4 w-4 mr-1" />
            Reset Filters
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              {[ 
                 { key: 'name', label: 'Name' },
                 { key: 'strategy', label: 'Strategy' },
                 { key: 'vintage', label: 'Vintage' },
                 { key: 'aum', label: 'AUM ($M)' },
                 { key: 'irr', label: 'IRR (%)' },
                 { key: 'moic', label: 'MOIC (x)' },
                 { key: 'dpi', label: 'DPI (x)' },
                 { key: 'tvpi', label: 'TVPI (x)' },
                 { key: 'status', label: 'Status' },
              ].map(header => (
                  <th 
                    key={header.key}
                    className="table-header cursor-pointer text-xs"
                    onClick={() => handleSort(header.key)}
                  >
                    <div className="flex items-center">
                      {header.label}
                      {sortField === header.key ? 
                        (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />)
                        : <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                      }
                    </div>
                  </th>
              ))}
              <th className="table-header text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredFunds.map(fund => (
              <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedFund(fund)}>
                <td className="table-cell text-sm">{fund.name}</td>
                <td className="table-cell text-sm">{fund.strategy}</td>
                <td className="table-cell text-sm">{fund.vintage}</td>
                <td className="table-cell text-sm">{fund.aum.toFixed(1)}</td>
                <td className="table-cell text-sm">
                  <span className={fund.irr >= 15 ? 'text-green-600 dark:text-green-400 font-semibold' : fund.irr < 0 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                    {fund.irr.toFixed(1)}
                  </span>
                </td>
                <td className="table-cell text-sm">
                  <span className={fund.moic >= 2 ? 'text-green-600 dark:text-green-400 font-semibold' : fund.moic < 1 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                    {fund.moic.toFixed(2)}
                  </span>
                </td>
                <td className="table-cell text-sm">{fund.dpi.toFixed(2)}</td>
                <td className="table-cell text-sm">{fund.tvpi.toFixed(2)}</td>
                <td className="table-cell text-sm">
                  <span className={`badge text-xs ${ // Smaller badge
                    fund.status === 'Active' ? 'badge-success' : 
                    fund.status === 'Harvesting' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {fund.status}
                  </span>
                </td>
                <td className="table-cell text-sm">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        setSelectedFund(fund);
                        setIsEditingFund(true);
                      }}
                      className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 tooltip"
                      data-tip="Edit fund"
                      aria-label="Edit fund"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleDeleteFund(fund.id);
                      }}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 tooltip"
                      data-tip="Delete fund"
                      aria-label="Delete fund"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFunds.length === 0 && (
                <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-500 dark:text-gray-400">No funds match the current filters.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Render the companies list view
  const renderCompaniesView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Companies</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <input
              type="file"
              id="companyFileUpload"
              className="hidden"
              accept=".csv"
              onChange={handleCompanyFileUpload}
            />
            <button 
              onClick={downloadCompanyTemplate}
              className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white tooltip"
               data-tip="Download CSV template for companies"
            >
              <Download className="h-4 w-4 mr-1" />
              Template
            </button>
            <label 
              htmlFor="companyFileUpload"
              className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white cursor-pointer tooltip"
              data-tip="Import companies from CSV"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </label>
          </div>
          <button 
            onClick={() => setIsAddingCompany(true)}
            className="btn btn-sm btn-primary"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Company
          </button>
        </div>
      </div>
      
     {/* Search and Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search companies by name or sector..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
            className="input w-full"
            value={companyFilters.sector}
            onChange={(e) => setCompanyFilters({ ...companyFilters, sector: e.target.value })}
        >
            <option value="">All Sectors</option>
            {uniqueSectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
            ))}
        </select>
        
        <select
            className="input w-full"
            value={companyFilters.status}
            onChange={(e) => setCompanyFilters({ ...companyFilters, status: e.target.value })}
        >
            <option value="">All Statuses</option>
            {uniqueCompanyStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
            ))}
        </select>

         <select
            className="input w-full"
            value={companyFilters.fundId}
            onChange={(e) => setCompanyFilters({ ...companyFilters, fundId: e.target.value })}
          >
            <option value="">All Funds</option>
            {funds.map(fund => (
              <option key={fund.id} value={fund.id}>{fund.name}</option>
            ))}
          </select>
        
        <button 
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white flex items-center justify-center w-full"
            onClick={() => {
                setCompanyFilters({ sector: '', status: '', fundId: '' });
                setSearchTerm('');
            }}
        >
            <Filter className="h-4 w-4 mr-1" />
            Reset Filters
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
             {[ 
                 { key: 'name', label: 'Name' },
                 { key: 'sector', label: 'Sector' },
                 { key: 'fundId', label: 'Fund' }, // Sort by fund name later
                 { key: 'investmentDate', label: 'Investment Date' },
                 { key: 'initialInvestment', label: 'Initial ($M)' },
                 { key: 'currentValue', label: 'Current ($M)' },
                 { key: 'ownership', label: 'Ownership (%)' },
                 { key: 'calculatedMoic', label: 'MOIC' }, // Sort by calculated MOIC
                 { key: 'status', label: 'Status' },
              ].map(header => (
                  <th 
                    key={header.key}
                    className="table-header cursor-pointer text-xs"
                    onClick={() => handleSort(header.key === 'calculatedMoic' ? 'currentValue' : header.key === 'fundId' ? 'name' : header.key)} // Adjust sort field if needed
                  >
                    <div className="flex items-center">
                      {header.label}
                      {sortField === (header.key === 'calculatedMoic' ? 'currentValue' : header.key === 'fundId' ? 'name' : header.key) ? 
                        (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />)
                        : <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                      }
                    </div>
                  </th>
              ))}
              <th className="table-header text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredCompanies.map(company => {
              const fund = funds.find(f => f.id === company.fundId);
              const moic = company.initialInvestment > 0 
                    ? (company.status === 'Active' ? company.currentValue / company.initialInvestment : company.moic || 0)
                    : 0;
              
              return (
                <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedCompany(company)}>
                  <td className="table-cell text-sm">{company.name}</td>
                  <td className="table-cell text-sm">{company.sector}</td>
                  <td className="table-cell text-sm">{fund?.name || 'Unknown'}</td>
                  <td className="table-cell text-sm">{new Date(company.investmentDate).toLocaleDateString()}</td>
                  <td className="table-cell text-sm">{company.initialInvestment.toFixed(1)}</td>
                  <td className="table-cell text-sm">{company.currentValue.toFixed(1)}</td>
                  <td className="table-cell text-sm">{company.ownership.toFixed(1)}</td>
                  <td className="table-cell text-sm">
                    <span className={moic >= 2 ? 'text-green-600 dark:text-green-400 font-semibold' : moic < 1 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                      {moic.toFixed(2)}x
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    <span className={`badge text-xs ${ // Smaller badge
                      company.status === 'Active' ? 'badge-success' : 
                      company.status === 'Exited' ? 'badge-info' : 'badge-error'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    <div className="flex items-center space-x-1">
                     <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            setSelectedCompany(company);
                            setEditCompanyModalStatus(company.status); // Set initial status for edit modal
                            setIsEditingCompany(true);
                        }}
                        className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 tooltip"
                        data-tip="Edit company"
                        aria-label="Edit company"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleDeleteCompany(company.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 tooltip"
                        data-tip="Delete company"
                        aria-label="Delete company"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
             {filteredCompanies.length === 0 && (
                <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-500 dark:text-gray-400">No companies match the current filters.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Render the content based on the selected view and entity
  const renderContent = () => {
    // Company Detail takes precedence if selected, regardless of fund selection
    if (selectedCompany) {
      return renderCompanyDetail();
    }
    // Fund Detail takes precedence over list views if selected
    if (selectedFund) {
      return renderFundDetail();
    }
    
    // Otherwise, show list or dashboard based on selectedView
    switch (selectedView) {
      case 'funds':
        return renderFundsView();
      case 'companies':
        return renderCompaniesView();
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };
  
  // Add Fund Modal
  const renderAddFundModal = () => {
    if (!isAddingFund) return null;
    
    return (
      <div className="modal-backdrop">
        <div ref={modalRef} className="modal-content max-w-2xl">
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">Add New Fund</h3>
            <button 
              onClick={() => setIsAddingFund(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleAddFund}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 max-h-[60vh] overflow-y-auto">
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-name">Fund Name</label>
                <input 
                  id="add-fund-name"
                  name="name"
                  type="text"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-strategy">Strategy</label>
                <select 
                  id="add-fund-strategy" 
                  name="strategy"
                  className="input"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Select Strategy</option>
                  {[...uniqueStrategies, 'Buyout', 'Growth Equity', 'Venture Capital', 'Distressed', 'Real Estate'] // Include common ones if not in unique
                    .filter((value, index, self) => self.indexOf(value) === index && value) // Unique & non-empty
                    .sort()
                    .map(strategy => (
                      <option key={strategy} value={strategy}>{strategy}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-vintage">Vintage Year</label>
                <input 
                  id="add-fund-vintage"
                  name="vintage"
                  type="number"
                  min="1980"
                  max={new Date().getFullYear() + 5} // Allow slightly future vintage
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-aum">AUM ($M)</label>
                <input 
                  id="add-fund-aum"
                  name="aum"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-irr">Target/Current IRR (%)</label>
                <input 
                  id="add-fund-irr"
                  name="irr"
                  type="number"
                  step="0.1"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-moic">Target/Current MOIC (x)</label>
                <input 
                  id="add-fund-moic"
                  name="moic"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-commitments">Commitments ($M)</label>
                <input 
                  id="add-fund-commitments"
                  name="commitments"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-called">Called Capital ($M)</label>
                <input 
                  id="add-fund-called"
                  name="called"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-distributed">Distributed ($M)</label>
                <input 
                  id="add-fund-distributed"
                  name="distributed"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-fund-nav">Current NAV ($M)</label>
                <input 
                  id="add-fund-nav"
                  name="nav"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group md:col-span-2"> {/* Span status across */} 
                <label className="form-label" htmlFor="add-fund-status">Status</label>
                <select 
                  id="add-fund-status" 
                  name="status"
                  className="input"
                  required
                  defaultValue="Active"
                >
                  <option value="Active">Active</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Fully Realized">Fully Realized</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setIsAddingFund(false)}
                className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                Add Fund
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Edit Fund Modal
  const renderEditFundModal = () => {
    if (!isEditingFund || !selectedFund) return null;
    
    return (
      <div className="modal-backdrop">
        <div ref={modalRef} className="modal-content max-w-2xl">
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">Edit Fund: {selectedFund.name}</h3>
            <button 
              onClick={() => setIsEditingFund(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleEditFund}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 max-h-[60vh] overflow-y-auto">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-name">Fund Name</label>
                <input 
                  id="edit-fund-name"
                  name="name"
                  type="text"
                  className="input"
                  defaultValue={selectedFund.name}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-strategy">Strategy</label>
                <select 
                  id="edit-fund-strategy" 
                  name="strategy"
                  className="input"
                  defaultValue={selectedFund.strategy}
                  required
                >
                  {[...uniqueStrategies, 'Buyout', 'Growth Equity', 'Venture Capital', 'Distressed', 'Real Estate']
                    .filter((value, index, self) => self.indexOf(value) === index && value)
                    .sort()
                    .map(strategy => (
                      <option key={strategy} value={strategy}>{strategy}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-vintage">Vintage Year</label>
                <input 
                  id="edit-fund-vintage"
                  name="vintage"
                  type="number"
                  min="1980"
                  max={new Date().getFullYear() + 5}
                  className="input"
                  defaultValue={selectedFund.vintage}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-aum">AUM ($M)</label>
                <input 
                  id="edit-fund-aum"
                  name="aum"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedFund.aum}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-irr">Current IRR (%)</label>
                <input 
                  id="edit-fund-irr"
                  name="irr"
                  type="number"
                  step="0.1"
                  className="input"
                  defaultValue={selectedFund.irr}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-moic">Current MOIC (x)</label>
                <input 
                  id="edit-fund-moic"
                  name="moic"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedFund.moic}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-commitments">Commitments ($M)</label>
                <input 
                  id="edit-fund-commitments"
                  name="commitments"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedFund.commitments}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-called">Called Capital ($M)</label>
                <input 
                  id="edit-fund-called"
                  name="called"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedFund.called}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-distributed">Distributed ($M)</label>
                <input 
                  id="edit-fund-distributed"
                  name="distributed"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedFund.distributed}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fund-nav">Current NAV ($M)</label>
                <input 
                  id="edit-fund-nav"
                  name="nav"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedFund.nav}
                  required
                />
              </div>
              
              <div className="form-group md:col-span-2">
                <label className="form-label" htmlFor="edit-fund-status">Status</label>
                <select 
                  id="edit-fund-status" 
                  name="status"
                  className="input"
                  defaultValue={selectedFund.status}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Fully Realized">Fully Realized</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setIsEditingFund(false)}
                className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Add Company Modal
  const renderAddCompanyModal = () => {
    if (!isAddingCompany) return null;
    
    // Uses addCompanyModalStatus and setAddCompanyModalStatus from App state
    
    return (
      <div className="modal-backdrop">
        <div ref={modalRef} className="modal-content max-w-2xl">
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">Add New Portfolio Company</h3>
            <button 
              onClick={() => setIsAddingCompany(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleAddCompany}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 max-h-[60vh] overflow-y-auto">
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-name">Company Name</label>
                <input 
                  id="add-company-name"
                  name="name"
                  type="text"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-fund">Fund</label>
                <select 
                  id="add-company-fund" 
                  name="fundId"
                  className="input"
                  defaultValue={selectedFund?.id || ''} // Prefill if adding from fund detail
                  required
                >
                  <option value="" disabled={!!selectedFund?.id}>Select Fund</option>
                  {funds.map(fund => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-sector">Sector</label>
                <select 
                  id="add-company-sector" 
                  name="sector"
                  className="input"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Select Sector</option>
                   {[...uniqueSectors, 'Technology', 'Healthcare', 'Consumer', 'Industrial', 'Financial Services', 'Energy', 'Media']
                    .filter((value, index, self) => self.indexOf(value) === index && value)
                    .sort()
                    .map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-date">Investment Date</label>
                <input 
                  id="add-company-date"
                  name="investmentDate"
                  type="date"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-initial">Initial Investment ($M)</label>
                <input 
                  id="add-company-initial"
                  name="initialInvestment"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-current">Current Value ($M)</label>
                <input 
                  id="add-company-current"
                  name="currentValue"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  // Required only if status is Active
                  required={addCompanyModalStatus === 'Active'}
                  disabled={addCompanyModalStatus !== 'Active'}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-ownership">Ownership (%)</label>
                <input 
                  id="add-company-ownership"
                  name="ownership"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-revenue">Latest Annual Revenue ($M)</label>
                <input 
                  id="add-company-revenue"
                  name="revenue"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-ebitda">Latest Annual EBITDA ($M)</label>
                <input 
                  id="add-company-ebitda"
                  name="ebitda"
                  type="number"
                  step="0.1"
                  // Allow negative EBITDA
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="add-company-status">Status</label>
                <select 
                  id="add-company-status" 
                  name="status"
                  className="input"
                  value={addCompanyModalStatus} // Use hoisted state
                  onChange={(e) => setAddCompanyModalStatus(e.target.value as 'Active' | 'Exited' | 'Written Off')} // Update hoisted state
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Exited">Exited</option>
                  <option value="Written Off">Written Off</option>
                </select>
              </div>
              
              {(addCompanyModalStatus === 'Exited' || addCompanyModalStatus === 'Written Off') && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-company-exit-date">Exit Date</label>
                    <input 
                      id="add-company-exit-date"
                      name="exitDate"
                      type="date"
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-company-exit-value">Exit Value ($M)</label>
                    <input 
                      id="add-company-exit-value"
                      name="exitValue"
                      type="number"
                      step="0.1"
                      min="0"
                      className="input"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setIsAddingCompany(false)}
                className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                Add Company
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Edit Company Modal
  const renderEditCompanyModal = () => {
    if (!isEditingCompany || !selectedCompany) return null;
    
    // Uses editCompanyModalStatus and setEditCompanyModalStatus from App state
    
    return (
      <div className="modal-backdrop">
        <div ref={modalRef} className="modal-content max-w-2xl">
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">Edit Portfolio Company: {selectedCompany.name}</h3>
            <button 
              onClick={() => setIsEditingCompany(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleEditCompany}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 max-h-[60vh] overflow-y-auto">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-name">Company Name</label>
                <input 
                  id="edit-company-name"
                  name="name"
                  type="text"
                  className="input"
                  defaultValue={selectedCompany.name}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-fund">Fund</label>
                <select 
                  id="edit-company-fund" 
                  name="fundId"
                  className="input"
                  defaultValue={selectedCompany.fundId}
                  required
                >
                  {funds.map(fund => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-sector">Sector</label>
                <select 
                  id="edit-company-sector" 
                  name="sector"
                  className="input"
                  defaultValue={selectedCompany.sector}
                  required
                >
                   {[...uniqueSectors, 'Technology', 'Healthcare', 'Consumer', 'Industrial', 'Financial Services', 'Energy', 'Media']
                    .filter((value, index, self) => self.indexOf(value) === index && value)
                    .sort()
                    .map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-date">Investment Date</label>
                <input 
                  id="edit-company-date"
                  name="investmentDate"
                  type="date"
                  className="input"
                  defaultValue={selectedCompany.investmentDate}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-initial">Initial Investment ($M)</label>
                <input 
                  id="edit-company-initial"
                  name="initialInvestment"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedCompany.initialInvestment}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-current">Current Value ($M)</label>
                <input 
                  id="edit-company-current"
                  name="currentValue"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedCompany.status === 'Active' ? selectedCompany.currentValue : ''} // Only show current value for active
                  required={editCompanyModalStatus === 'Active'} // Required only if Active
                  disabled={editCompanyModalStatus !== 'Active'} // Disabled if not Active
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-ownership">Ownership (%)</label>
                <input 
                  id="edit-company-ownership"
                  name="ownership"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="input"
                  defaultValue={selectedCompany.ownership}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-revenue">Latest Annual Revenue ($M)</label>
                <input 
                  id="edit-company-revenue"
                  name="revenue"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input"
                  defaultValue={selectedCompany.revenue}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-ebitda">Latest Annual EBITDA ($M)</label>
                <input 
                  id="edit-company-ebitda"
                  name="ebitda"
                  type="number"
                  step="0.1"
                  className="input"
                  defaultValue={selectedCompany.ebitda}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-company-status">Status</label>
                <select 
                  id="edit-company-status" 
                  name="status"
                  className="input"
                  value={editCompanyModalStatus} // Use hoisted state
                  onChange={(e) => setEditCompanyModalStatus(e.target.value as 'Active' | 'Exited' | 'Written Off')} // Update hoisted state
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Exited">Exited</option>
                  <option value="Written Off">Written Off</option>
                </select>
              </div>
              
              {(editCompanyModalStatus === 'Exited' || editCompanyModalStatus === 'Written Off') && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-company-exit-date">Exit Date</label>
                    <input 
                      id="edit-company-exit-date"
                      name="exitDate"
                      type="date"
                      className="input"
                      defaultValue={selectedCompany.exitDate}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-company-exit-value">Exit Value ($M)</label>
                    <input 
                      id="edit-company-exit-value"
                      name="exitValue"
                      type="number"
                      step="0.1"
                      min="0"
                      className="input"
                      defaultValue={selectedCompany.exitValue}
                      required
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setIsEditingCompany(false)}
                className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition ${styles.appContainer || ''}`}> {/* Added optional class from module */} 
      {/* Header */} 
      <header className="bg-white dark:bg-gray-800 shadow theme-transition sticky top-0 z-40">
        <div className="container-fluid py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">PE Portfolio Monitor</h1>
            </div>
            <div className="flex items-center self-end sm:self-center">
              <label htmlFor="theme-toggle-checkbox" className="theme-toggle mr-4 tooltip tooltip-bottom" data-tip={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                 <input id="theme-toggle-checkbox" type="checkbox" className="hidden" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">Toggle theme</span>
              </label>
              {/* Placeholder for potential future header actions */}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */} 
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition sticky top-[60px] sm:top-[68px] z-30"> {/* Adjust based on header height */} 
        <div className="container-fluid px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            <button 
              onClick={() => {
                setSelectedView('dashboard');
                setSelectedFund(null);
                setSelectedCompany(null);
                setSearchTerm(''); // Reset search on view change
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${selectedView === 'dashboard' && !selectedFund && !selectedCompany ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                setSelectedView('funds');
                setSelectedFund(null);
                setSelectedCompany(null);
                 setSearchTerm(''); // Reset search
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${selectedView === 'funds' && !selectedFund && !selectedCompany ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
            >
              Funds
            </button>
            <button 
              onClick={() => {
                setSelectedView('companies');
                setSelectedFund(null);
                setSelectedCompany(null);
                 setSearchTerm(''); // Reset search
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${selectedView === 'companies' && !selectedFund && !selectedCompany ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
            >
              Portfolio Companies
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */} 
      <main className="container-fluid py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      {/* Modals */} 
      {renderAddFundModal()}
      {renderEditFundModal()}
      {renderAddCompanyModal()}
      {renderEditCompanyModal()}
      
      {/* Footer */} 
      <footer className="bg-white dark:bg-gray-800 shadow-inner border-t border-gray-200 dark:border-gray-700 py-4 theme-transition mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-xs">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved. Contact: support@datavtar.com
        </div>
      </footer>
    </div>
  );
};

export default App;
