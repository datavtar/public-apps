import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Plus, Trash2, Edit, Download, Upload, Filter, Search, ChevronsUpDown,
  Moon, Sun, AlertTriangle, X, FileText, Briefcase, PieChart as PieChartIcon,
  BarChart as BarChartIcon, LineChart as LineChartIcon, Euro, DollarSign, 
  Save, ChevronRight, ChevronLeft, Eye
} from 'lucide-react';

type InvestmentType = 'stocks' | 'bonds' | 'realEstate' | 'cryptocurrency' | 'commodities' | 'cash' | 'other';
type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'SEK' | 'NOK' | 'DKK';
type Country = 'Germany' | 'France' | 'Italy' | 'Spain' | 'Netherlands' | 'Belgium' | 'Sweden' | 'Switzerland' | 'UK' | 'Other';

interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  amount: number;
  currency: Currency;
  purchaseDate: string;
  country: Country;
  performance: number; // Percentage
  notes: string;
  lastUpdated: string;
}

interface FilterState {
  type: InvestmentType | '';
  country: Country | '';
  currency: Currency | '';
  dateFrom: string;
  dateTo: string;
  performanceMin: string;
  performanceMax: string;
}

interface ExcelTemplateData {
  name: string;
  type: string;
  amount: string;
  currency: string;
  purchaseDate: string;
  country: string;
  performance: string;
  notes: string;
}

interface PieChartData {
  name: string;
  value: number;
}

interface BarChartData {
  country: string;
  amount: number;
}

interface LineChartData {
  date: string;
  performance: number;
}

const App: React.FC = () => {
  // State
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentInvestment, setCurrentInvestment] = useState<Investment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'dashboard'>('investments');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Investment, direction: 'ascending' | 'descending' } | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [showImportSuccess, setShowImportSuccess] = useState<boolean>(false);
  const [viewInvestment, setViewInvestment] = useState<Investment | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    country: '',
    currency: '',
    dateFrom: '',
    dateTo: '',
    performanceMin: '',
    performanceMax: ''
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const INVESTMENT_TYPES: InvestmentType[] = ['stocks', 'bonds', 'realEstate', 'cryptocurrency', 'commodities', 'cash', 'other'];
  const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK'];
  const COUNTRIES: Country[] = ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Switzerland', 'UK', 'Other'];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#E57373'];

  // Load investments and theme preference from localStorage on component mount
  useEffect(() => {
    const savedInvestments = localStorage.getItem('investments');
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedDarkMode === 'true' || (savedDarkMode === null && prefersDarkMode);
    
    setIsDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update localStorage when investments change
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  // Update theme class and localStorage when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Reset import messages
  useEffect(() => {
    if (showImportSuccess || importError) {
      const timer = setTimeout(() => {
        setShowImportSuccess(false);
        setImportError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showImportSuccess, importError]);

  // Functions
  const openModal = (investment?: Investment) => {
    if (investment) {
      setCurrentInvestment(investment);
    } else {
      setCurrentInvestment({
        id: crypto.randomUUID(),
        name: '',
        type: 'stocks',
        amount: 0,
        currency: 'EUR',
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        country: 'Germany',
        performance: 0,
        notes: '',
        lastUpdated: new Date().toISOString()
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentInvestment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInvestment) {
      const updatedInvestment = {
        ...currentInvestment,
        lastUpdated: new Date().toISOString()
      };

      if (investments.some(inv => inv.id === updatedInvestment.id)) {
        setInvestments(investments.map(inv => 
          inv.id === updatedInvestment.id ? updatedInvestment : inv
        ));
      } else {
        setInvestments([...investments, updatedInvestment]);
      }
      closeModal();
    }
  };

  const handleDelete = (id: string) => {
    const investmentToDelete = investments.find(inv => inv.id === id);
    if (investmentToDelete) {
      setCurrentInvestment(investmentToDelete);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (currentInvestment) {
      setInvestments(investments.filter(inv => inv.id !== currentInvestment.id));
      setIsDeleteModalOpen(false);
      setCurrentInvestment(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCurrentInvestment(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      country: '',
      currency: '',
      dateFrom: '',
      dateTo: '',
      performanceMin: '',
      performanceMax: ''
    });
    setIsFilterModalOpen(false);
  };

  const sortedInvestments = () => {
    let filteredData = [...investments];

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(inv => 
        inv.name.toLowerCase().includes(term) ||
        inv.notes.toLowerCase().includes(term) ||
        inv.country.toLowerCase().includes(term) ||
        inv.type.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.type) {
      filteredData = filteredData.filter(inv => inv.type === filters.type);
    }
    if (filters.country) {
      filteredData = filteredData.filter(inv => inv.country === filters.country);
    }
    if (filters.currency) {
      filteredData = filteredData.filter(inv => inv.currency === filters.currency);
    }
    if (filters.dateFrom) {
      filteredData = filteredData.filter(inv => new Date(inv.purchaseDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filteredData = filteredData.filter(inv => new Date(inv.purchaseDate) <= new Date(filters.dateTo));
    }
    if (filters.performanceMin) {
      filteredData = filteredData.filter(inv => inv.performance >= parseFloat(filters.performanceMin));
    }
    if (filters.performanceMax) {
      filteredData = filteredData.filter(inv => inv.performance <= parseFloat(filters.performanceMax));
    }

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const requestSort = (key: keyof Investment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: keyof Investment) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'none';
    }
    return sortConfig.direction;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(investments, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `investment-portfolio-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadTemplate = () => {
    const templateData: ExcelTemplateData[] = [
      {
        name: 'Example Stock Investment',
        type: 'stocks',
        amount: '10000',
        currency: 'EUR',
        purchaseDate: '2023-01-15',
        country: 'Germany',
        performance: '7.5',
        notes: 'Tech company shares'
      },
      {
        name: 'Example Bond Investment',
        type: 'bonds',
        amount: '5000',
        currency: 'USD',
        purchaseDate: '2023-02-20',
        country: 'France',
        performance: '3.2',
        notes: 'Government bonds'
      }
    ];

    const header = Object.keys(templateData[0]).join(',');
    const csvRows = templateData.map(row => {
      return Object.values(row).map(value => `"${value}"`).join(',');
    });
    
    const csvContent = [header, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'investment-template.csv');
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Check if it's a CSV file
        if (file.name.endsWith('.csv')) {
          const csvText = event.target?.result as string;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(header => header.trim().replace(/\"/g, ''));
          
          const importedInvestments: Investment[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(value => value.trim().replace(/\"/g, ''));
            const entry: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              entry[header] = values[index];
            });

            // Validate required fields
            if (!entry.name || !entry.type || !entry.amount || !entry.currency || !entry.purchaseDate || !entry.country) {
              throw new Error(`Row ${i} is missing required fields`);
            }

            // Validate investment type
            if (!INVESTMENT_TYPES.includes(entry.type as InvestmentType)) {
              throw new Error(`Invalid investment type in row ${i}: ${entry.type}`);
            }

            // Validate currency
            if (!CURRENCIES.includes(entry.currency as Currency)) {
              throw new Error(`Invalid currency in row ${i}: ${entry.currency}`);
            }

            // Validate country
            if (!COUNTRIES.includes(entry.country as Country)) {
              throw new Error(`Invalid country in row ${i}: ${entry.country}`);
            }

            importedInvestments.push({
              id: crypto.randomUUID(),
              name: entry.name,
              type: entry.type as InvestmentType,
              amount: parseFloat(entry.amount),
              currency: entry.currency as Currency,
              purchaseDate: entry.purchaseDate,
              country: entry.country as Country,
              performance: parseFloat(entry.performance || '0'),
              notes: entry.notes || '',
              lastUpdated: new Date().toISOString()
            });
          }
          
          setInvestments(prev => [...prev, ...importedInvestments]);
          setShowImportSuccess(true);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else if (file.name.endsWith('.json')) {
          // JSON file import
          const jsonData = JSON.parse(event.target?.result as string) as Investment[];
          
          // Validate the JSON structure
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid JSON format. Expected an array of investments.');
          }
          
          for (const item of jsonData) {
            if (!item.id || !item.name || !item.type || isNaN(item.amount) || !item.currency || 
                !item.purchaseDate || !item.country || isNaN(item.performance)) {
              throw new Error('One or more investments are missing required fields.');
            }
          }
          
          setInvestments(prev => [...prev, ...jsonData]);
          setShowImportSuccess(true);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          throw new Error('Unsupported file format. Please use CSV or JSON files.');
        }
      } catch (error) {
        console.error('Import error:', error);
        setImportError(error instanceof Error ? error.message : 'Failed to import file');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      setImportError('Unsupported file format. Please use CSV or JSON files.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Dashboard data calculations
  const getTotalInvestmentsByType = (): PieChartData[] => {
    const result: Record<InvestmentType, number> = {
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      cryptocurrency: 0,
      commodities: 0,
      cash: 0,
      other: 0
    };

    investments.forEach(inv => {
      result[inv.type] += inv.amount;
    });

    return Object.entries(result)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };

  const getInvestmentsByCountry = (): BarChartData[] => {
    const countryData: Record<string, number> = {};
    
    investments.forEach(inv => {
      if (countryData[inv.country]) {
        countryData[inv.country] += inv.amount;
      } else {
        countryData[inv.country] = inv.amount;
      }
    });

    return Object.entries(countryData)
      .map(([country, amount]) => ({ country, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 countries
  };

  const getPerformanceData = (): LineChartData[] => {
    // Group investments by month
    const monthlyData: Record<string, { total: number, count: number }> = {};
    
    investments.forEach(inv => {
      const date = inv.purchaseDate.substring(0, 7); // YYYY-MM format
      if (!monthlyData[date]) {
        monthlyData[date] = { total: 0, count: 0 };
      }
      monthlyData[date].total += inv.performance;
      monthlyData[date].count += 1;
    });

    // Calculate average performance per month
    return Object.entries(monthlyData)
      .map(([date, data]) => ({
        date,
        performance: data.total / data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getTotalAmount = (): number => {
    return investments.reduce((total, inv) => total + inv.amount, 0);
  };

  const getAveragePerformance = (): number => {
    if (investments.length === 0) return 0;
    const totalPerformance = investments.reduce((total, inv) => total + inv.performance, 0);
    return totalPerformance / investments.length;
  };

  const getCurrencyDistribution = (): PieChartData[] => {
    const result: Record<string, number> = {};
    
    investments.forEach(inv => {
      if (result[inv.currency]) {
        result[inv.currency] += inv.amount;
      } else {
        result[inv.currency] = inv.amount;
      }
    });

    return Object.entries(result)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const activeInvestmentsCount = investments.length;
  const totalInvestmentAmount = getTotalAmount();
  const averagePerformance = getAveragePerformance();
  const pieChartData = getTotalInvestmentsByType();
  const barChartData = getInvestmentsByCountry();
  const lineChartData = getPerformanceData();
  const currencyDistributionData = getCurrencyDistribution();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-fluid py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CFO Investment Portfolio</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? 
                <Sun className="h-5 w-5 text-amber-500" /> : 
                <Moon className="h-5 w-5 text-indigo-700" />
              }
            </button>
            
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('investments')}
                className={`px-4 py-2 rounded-l-md ${activeTab === 'investments' ? 
                  'bg-primary-600 text-white dark:bg-primary-700' : 
                  'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} hover:bg-opacity-90 transition-colors`}
              >
                Investments
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-r-md ${activeTab === 'dashboard' ? 
                  'bg-primary-600 text-white dark:bg-primary-700' : 
                  'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} hover:bg-opacity-90 transition-colors`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6 px-4 sm:px-6 lg:px-8">
        {/* Alerts */}
        {importError && (
          <div className="alert alert-error mb-4 fade-in">
            <AlertTriangle className="h-5 w-5" />
            <p>{importError}</p>
            <button onClick={() => setImportError('')} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {showImportSuccess && (
          <div className="alert alert-success mb-4 fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Investments successfully imported!</p>
            <button onClick={() => setShowImportSuccess(false)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeTab === 'investments' ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Search investments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  {Object.values(filters).some(val => val !== '') && (
                    <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-primary-600 rounded-full">
                      {Object.values(filters).filter(val => val !== '').length}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={handleImportClick}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".csv,.json"
                  className="hidden"
                />
                
                <button 
                  onClick={downloadTemplate}
                  className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Template</span>
                </button>
                
                <button 
                  onClick={exportData}
                  className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                
                <button 
                  onClick={() => openModal()}
                  className="btn btn-primary flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Investment</span>
                </button>
              </div>
            </div>
            
            <div className="table-container overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th 
                      className="table-header cursor-pointer"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        <ChevronsUpDown 
                          className={`ml-1 h-4 w-4 ${getSortDirection('name') !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} 
                        />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer"
                      onClick={() => requestSort('type')}
                    >
                      <div className="flex items-center">
                        <span>Type</span>
                        <ChevronsUpDown 
                          className={`ml-1 h-4 w-4 ${getSortDirection('type') !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} 
                        />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer"
                      onClick={() => requestSort('amount')}
                    >
                      <div className="flex items-center">
                        <span>Amount</span>
                        <ChevronsUpDown 
                          className={`ml-1 h-4 w-4 ${getSortDirection('amount') !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} 
                        />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer"
                      onClick={() => requestSort('purchaseDate')}
                    >
                      <div className="flex items-center">
                        <span>Purchase Date</span>
                        <ChevronsUpDown 
                          className={`ml-1 h-4 w-4 ${getSortDirection('purchaseDate') !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} 
                        />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer"
                      onClick={() => requestSort('country')}
                    >
                      <div className="flex items-center">
                        <span>Country</span>
                        <ChevronsUpDown 
                          className={`ml-1 h-4 w-4 ${getSortDirection('country') !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} 
                        />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer"
                      onClick={() => requestSort('performance')}
                    >
                      <div className="flex items-center">
                        <span>Performance</span>
                        <ChevronsUpDown 
                          className={`ml-1 h-4 w-4 ${getSortDirection('performance') !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} 
                        />
                      </div>
                    </th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {sortedInvestments().length > 0 ? sortedInvestments().map(investment => (
                    <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="table-cell">{investment.name}</td>
                      <td className="table-cell">
                        <span className={`${styles.investmentType} ${styles[investment.type]}`}>
                          {investment.type.charAt(0).toUpperCase() + investment.type.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          {investment.currency === 'EUR' ? (
                            <Euro className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <DollarSign className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          )}
                          {formatCurrency(investment.amount, investment.currency)}
                        </div>
                      </td>
                      <td className="table-cell">{format(new Date(investment.purchaseDate), 'dd MMM yyyy')}</td>
                      <td className="table-cell">{investment.country}</td>
                      <td className="table-cell">
                        <span className={`${investment.performance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-semibold`}>
                          {investment.performance > 0 ? '+' : ''}{investment.performance.toFixed(2)}%
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setViewInvestment(investment)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="View investment details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openModal(investment)}
                            className="p-1.5 rounded-md text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            aria-label="Edit investment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(investment.id)}
                            className="p-1.5 rounded-md text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="Delete investment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                        {investments.length === 0 ? (
                          <div className="flex flex-col items-center">
                            <p className="mb-2">No investments found. Get started by adding your first investment.</p>
                            <button 
                              onClick={() => openModal()}
                              className="btn btn-primary flex items-center justify-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Investment</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <p>No investments match your search or filters.</p>
                            <button 
                              onClick={resetFilters}
                              className="btn btn-secondary mt-2 flex items-center justify-center gap-2"
                            >
                              <Filter className="h-4 w-4" />
                              <span>Reset Filters</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          // Dashboard
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="stat-title">Active Investments</div>
                <div className="stat-value">{activeInvestmentsCount}</div>
                <div className="stat-desc">Across {[...new Set(investments.map(inv => inv.country))].length} countries</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Investment Amount</div>
                <div className="stat-value">{formatCurrency(totalInvestmentAmount, 'EUR')}</div>
                <div className="stat-desc">
                  {investments.length > 0 ? 
                    `${formatCurrency(totalInvestmentAmount / investments.length, 'EUR')} average per investment` : 
                    'No investments yet'}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Average Performance</div>
                <div className="stat-value">
                  <span className={averagePerformance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {averagePerformance > 0 ? '+' : ''}{averagePerformance.toFixed(2)}%
                  </span>
                </div>
                <div className="stat-desc">
                  {investments.length > 0 ?
                    `Based on ${investments.length} investments` :
                    'No performance data yet'}
                </div>
              </div>
            </div>
            
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment distribution by type */}
              <div className="card h-96">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Investment Distribution by Type</h3>
                </div>
                
                {pieChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number, 'EUR')} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No investment data available</p>
                  </div>
                )}
              </div>
              
              {/* Investments by country */}
              <div className="card h-96">
                <div className="flex items-center mb-4">
                  <BarChartIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top 5 Countries by Investment</h3>
                </div>
                
                {barChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                        <XAxis dataKey="country" />
                        <YAxis tickFormatter={(value) => formatCurrency(value, 'EUR').split('.')[0]} />
                        <Tooltip formatter={(value) => formatCurrency(value as number, 'EUR')} />
                        <Bar dataKey="amount" fill="#4f46e5">
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No country data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Second row of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance over time */}
              <div className="card h-96">
                <div className="flex items-center mb-4">
                  <LineChartIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Average Performance by Month</h3>
                </div>
                
                {lineChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                        <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="performance" 
                          stroke="#4f46e5" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                          name="Performance %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
                  </div>
                )}
              </div>
              
              {/* Currency distribution */}
              <div className="card h-96">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Currency Distribution</h3>
                </div>
                
                {currencyDistributionData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currencyDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {currencyDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number, 'EUR')} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No currency data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 mt-auto">
        <div className="container-fluid text-center text-gray-600 dark:text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>

      {/* Investment Modal */}
      {isModalOpen && currentInvestment && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentInvestment.id ? 'Edit Investment' : 'Add New Investment'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Investment Name <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  type="text"
                  required
                  value={currentInvestment.name}
                  onChange={(e) => setCurrentInvestment({...currentInvestment, name: e.target.value})}
                  className="input"
                  placeholder="e.g., Tesla Stock, Government Bond"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="type" className="form-label">Type <span className="text-red-500">*</span></label>
                  <select
                    id="type"
                    required
                    value={currentInvestment.type}
                    onChange={(e) => setCurrentInvestment({...currentInvestment, type: e.target.value as InvestmentType})}
                    className="input"
                  >
                    {INVESTMENT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country <span className="text-red-500">*</span></label>
                  <select
                    id="country"
                    required
                    value={currentInvestment.country}
                    onChange={(e) => setCurrentInvestment({...currentInvestment, country: e.target.value as Country})}
                    className="input"
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">Amount <span className="text-red-500">*</span></label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={currentInvestment.amount}
                    onChange={(e) => setCurrentInvestment({...currentInvestment, amount: parseFloat(e.target.value)})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="currency" className="form-label">Currency <span className="text-red-500">*</span></label>
                  <select
                    id="currency"
                    required
                    value={currentInvestment.currency}
                    onChange={(e) => setCurrentInvestment({...currentInvestment, currency: e.target.value as Currency})}
                    className="input"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="purchaseDate" className="form-label">Purchase Date <span className="text-red-500">*</span></label>
                  <input
                    id="purchaseDate"
                    type="date"
                    required
                    value={currentInvestment.purchaseDate}
                    onChange={(e) => setCurrentInvestment({...currentInvestment, purchaseDate: e.target.value})}
                    className="input"
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="performance" className="form-label">Performance (%) <span className="text-red-500">*</span></label>
                  <input
                    id="performance"
                    type="number"
                    step="0.01"
                    required
                    value={currentInvestment.performance}
                    onChange={(e) => setCurrentInvestment({...currentInvestment, performance: parseFloat(e.target.value)})}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  rows={4}
                  value={currentInvestment.notes}
                  onChange={(e) => setCurrentInvestment({...currentInvestment, notes: e.target.value})}
                  className="input"
                  placeholder="Additional details about this investment..."
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Investment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentInvestment && (
        <div className="modal-backdrop" onClick={cancelDelete}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <div className="mt-2">
                <p className="text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete the investment <span className="font-semibold text-gray-900 dark:text-white">{currentInvestment.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                onClick={cancelDelete} 
                className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete} 
                className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Investment Modal */}
      {viewInvestment && (
        <div className="modal-backdrop" onClick={() => setViewInvestment(null)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {viewInvestment.name}
              </h3>
              <button 
                onClick={() => setViewInvestment(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card-responsive text-gray-600 dark:text-gray-400">
                  <p className="text-sm font-medium">Type</p>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">
                    <span className={`${styles.investmentType} ${styles[viewInvestment.type]}`}>
                      {viewInvestment.type.charAt(0).toUpperCase() + viewInvestment.type.slice(1)}
                    </span>
                  </p>
                </div>
                
                <div className="card-responsive text-gray-600 dark:text-gray-400">
                  <p className="text-sm font-medium">Country</p>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{viewInvestment.country}</p>
                </div>
                
                <div className="card-responsive text-gray-600 dark:text-gray-400">
                  <p className="text-sm font-medium">Amount</p>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">
                    <span className="flex items-center">
                      {viewInvestment.currency === 'EUR' ? (
                        <Euro className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <DollarSign className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      )}
                      {formatCurrency(viewInvestment.amount, viewInvestment.currency)}
                    </span>
                  </p>
                </div>
                
                <div className="card-responsive text-gray-600 dark:text-gray-400">
                  <p className="text-sm font-medium">Currency</p>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{viewInvestment.currency}</p>
                </div>
                
                <div className="card-responsive text-gray-600 dark:text-gray-400">
                  <p className="text-sm font-medium">Purchase Date</p>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">
                    {format(new Date(viewInvestment.purchaseDate), 'dd MMMM yyyy')}
                  </p>
                </div>
                
                <div className="card-responsive text-gray-600 dark:text-gray-400">
                  <p className="text-sm font-medium">Performance</p>
                  <p className="mt-1 text-base">
                    <span className={`${viewInvestment.performance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-semibold`}>
                      {viewInvestment.performance > 0 ? '+' : ''}{viewInvestment.performance.toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="card-responsive text-gray-600 dark:text-gray-400">
                <p className="text-sm font-medium">Notes</p>
                <p className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-line">
                  {viewInvestment.notes || 'No additional notes available.'}
                </p>
              </div>
              
              <div className="card-responsive text-gray-600 dark:text-gray-400">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {format(new Date(viewInvestment.lastUpdated), 'dd MMM yyyy, HH:mm:ss')}
                </p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setViewInvestment(null)} 
                  className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setViewInvestment(null);
                    openModal(viewInvestment);
                  }} 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  <span>Filter Investments</span>
                </div>
              </h3>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="filterType" className="form-label">Investment Type</label>
                  <select
                    id="filterType"
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Types</option>
                    {INVESTMENT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="filterCountry" className="form-label">Country</label>
                  <select
                    id="filterCountry"
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Countries</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="filterCurrency" className="form-label">Currency</label>
                  <select
                    id="filterCurrency"
                    name="currency"
                    value={filters.currency}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Currencies</option>
                    {CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="filterPerformanceMin" className="form-label">Min Performance (%)</label>
                  <input
                    id="filterPerformanceMin"
                    type="number"
                    name="performanceMin"
                    value={filters.performanceMin}
                    onChange={handleFilterChange}
                    className="input"
                    placeholder="Minimum"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="filterDateFrom" className="form-label">Purchase Date From</label>
                  <input
                    id="filterDateFrom"
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="filterDateTo" className="form-label">Purchase Date To</label>
                  <input
                    id="filterDateTo"
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="filterPerformanceMax" className="form-label">Max Performance (%)</label>
                <input
                  id="filterPerformanceMax"
                  type="number"
                  name="performanceMax"
                  value={filters.performanceMax}
                  onChange={handleFilterChange}
                  className="input"
                  placeholder="Maximum"
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={resetFilters} 
                  className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Reset
                </button>
                <button 
                  type="button" 
                  onClick={applyFilters} 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
