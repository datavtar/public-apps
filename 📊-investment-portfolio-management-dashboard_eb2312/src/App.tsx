import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  PlusCircle,
  Edit,
  Trash2,
  FileUp,
  FileDown,
  Filter,
  Search,
  SortDesc,
  Moon,
  Sun,
  UploadCloud,
  Download,
  ChevronDown,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PieChart as PieChartIcon,
  DollarSign,
  Euro,
  RefreshCw,
  Clipboard,
  LayoutDashboard
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript types
type InvestmentType = 'Stock' | 'Bond' | 'RealEstate' | 'Fund' | 'Commodity' | 'Cash' | 'Other';
type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'NOK' | 'SEK' | 'DKK';
type Country = 'Germany' | 'France' | 'Spain' | 'Italy' | 'Portugal' | 'Netherlands' | 'Belgium' | 'Switzerland' | 'Austria' | 'UK' | 'Norway' | 'Sweden' | 'Denmark' | 'Other';

interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  amount: number;
  currency: Currency;
  country: Country;
  purchaseDate: string;
  currentValue: number;
  notes: string;
  lastUpdated: string;
}

interface FilterState {
  type: InvestmentType | 'All';
  country: Country | 'All';
  minAmount: number | null;
  maxAmount: number | null;
}

interface SortState {
  field: keyof Investment | null;
  direction: 'asc' | 'desc';
}

type View = 'list' | 'form' | 'dashboard';

const App: React.FC = () => {
  // States
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentInvestment, setCurrentInvestment] = useState<Investment | null>(null);
  const [view, setView] = useState<View>('list');
  const [filters, setFilters] = useState<FilterState>({
    type: 'All',
    country: 'All',
    minAmount: null,
    maxAmount: null
  });
  const [sort, setSort] = useState<SortState>({
    field: 'purchaseDate',
    direction: 'desc'
  });
  const [search, setSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form handling using react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Investment>();

  // Initialize dark mode from local storage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode === 'true' || (savedMode === null && prefersDark);
    setIsDarkMode(initialDarkMode);
  }, []);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load investments from localStorage on initial load
  useEffect(() => {
    const savedInvestments = localStorage.getItem('investments');
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    } else {
      // Initialize with sample data if no investments are found
      const sampleInvestments: Investment[] = [
        {
          id: '1',
          name: 'SAP AG',
          type: 'Stock',
          amount: 15000,
          currency: 'EUR',
          country: 'Germany',
          purchaseDate: '2022-03-15',
          currentValue: 17500,
          notes: 'Tech investment',
          lastUpdated: '2023-06-10'
        },
        {
          id: '2',
          name: 'LVMH',
          type: 'Stock',
          amount: 22000,
          currency: 'EUR',
          country: 'France',
          purchaseDate: '2021-11-05',
          currentValue: 25600,
          notes: 'Luxury sector',
          lastUpdated: '2023-06-08'
        },
        {
          id: '3',
          name: 'Berlin Property',
          type: 'RealEstate',
          amount: 450000,
          currency: 'EUR',
          country: 'Germany',
          purchaseDate: '2020-05-20',
          currentValue: 520000,
          notes: 'Apartment in Mitte',
          lastUpdated: '2023-05-15'
        },
        {
          id: '4',
          name: 'Swiss Government Bond',
          type: 'Bond',
          amount: 75000,
          currency: 'CHF',
          country: 'Switzerland',
          purchaseDate: '2022-01-10',
          currentValue: 77500,
          notes: '10-year maturity',
          lastUpdated: '2023-06-01'
        },
        {
          id: '5',
          name: 'Vanguard European ETF',
          type: 'Fund',
          amount: 60000,
          currency: 'EUR',
          country: 'UK',
          purchaseDate: '2021-09-12',
          currentValue: 67500,
          notes: 'Diversified European stocks',
          lastUpdated: '2023-06-12'
        }
      ];
      setInvestments(sampleInvestments);
      localStorage.setItem('investments', JSON.stringify(sampleInvestments));
    }
  }, []);

  // Save investments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  // Set form values when editing an investment
  useEffect(() => {
    if (currentInvestment && view === 'form') {
      Object.entries(currentInvestment).forEach(([key, value]) => {
        setValue(key as keyof Investment, value);
      });
    }
  }, [currentInvestment, view, setValue]);

  // Helper functions
  const handleAddInvestment = () => {
    setCurrentInvestment(null);
    reset({
      id: '',
      name: '',
      type: 'Stock',
      amount: 0,
      currency: 'EUR',
      country: 'Germany',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      currentValue: 0,
      notes: '',
      lastUpdated: format(new Date(), 'yyyy-MM-dd')
    });
    setView('form');
  };

  const handleEditInvestment = (investment: Investment) => {
    setCurrentInvestment(investment);
    setView('form');
  };

  const handleDeleteInvestment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      setInvestments(prevInvestments => prevInvestments.filter(investment => investment.id !== id));
    }
  };

  const onSubmit = (data: Investment) => {
    const now = new Date();
    const formattedDate = format(now, 'yyyy-MM-dd');
    
    if (currentInvestment) {
      // Update existing investment
      setInvestments(prevInvestments =>
        prevInvestments.map(investment =>
          investment.id === currentInvestment.id
            ? { ...data, lastUpdated: formattedDate }
            : investment
        )
      );
    } else {
      // Add new investment
      const newInvestment: Investment = {
        ...data,
        id: Date.now().toString(),
        lastUpdated: formattedDate
      };
      setInvestments(prevInvestments => [...prevInvestments, newInvestment]);
    }
    
    setView('list');
    setCurrentInvestment(null);
    reset();
  };

  const cancelForm = () => {
    setView('list');
    setCurrentInvestment(null);
    reset();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as Investment[];
        setInvestments(data);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please make sure the file contains valid JSON.');
        console.error(error);
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportData = () => {
    const data = JSON.stringify(investments, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `investments_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template: Investment[] = [
      {
        id: "template_1",
        name: "Example Investment",
        type: "Stock",
        amount: 10000,
        currency: "EUR",
        country: "Germany",
        purchaseDate: "2023-01-01",
        currentValue: 11000,
        notes: "Example notes",
        lastUpdated: "2023-06-01"
      }
    ];
    
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investment_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter and sort investments
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(search.toLowerCase()) ||
                          investment.notes.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filters.type === 'All' || investment.type === filters.type;
    const matchesCountry = filters.country === 'All' || investment.country === filters.country;
    const matchesMinAmount = filters.minAmount === null || investment.amount >= filters.minAmount;
    const matchesMaxAmount = filters.maxAmount === null || investment.amount <= filters.maxAmount;
    
    return matchesSearch && matchesType && matchesCountry && matchesMinAmount && matchesMaxAmount;
  });

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    if (!sort.field) return 0;
    
    const fieldA = a[sort.field];
    const fieldB = b[sort.field];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sort.direction === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    // For numeric fields
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sort.direction === 'asc' 
        ? fieldA - fieldB 
        : fieldB - fieldA;
    }
    
    return 0;
  });

  // Prepare data for charts
  const prepareChartData = () => {
    // Aggregate data by investment type
    const typeData = investments.reduce((acc: Record<string, number>, investment) => {
      const { type, currentValue } = investment;
      acc[type] = (acc[type] || 0) + currentValue;
      return acc;
    }, {});

    return Object.entries(typeData).map(([name, value]) => ({
      name,
      value
    }));
  };

  const chartData = prepareChartData();
  
  // Prepare country data for charts
  const prepareCountryData = () => {
    const countryData = investments.reduce((acc: Record<string, number>, investment) => {
      const { country, currentValue } = investment;
      acc[country] = (acc[country] || 0) + currentValue;
      return acc;
    }, {});

    return Object.entries(countryData).map(([name, value]) => ({
      name,
      value
    }));
  };

  const countryChartData = prepareCountryData();

  // Calculate performance metrics
  const calculatePerformance = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalGain = totalCurrentValue - totalInvested;
    const performancePercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalGain,
      performancePercent
    };
  };

  const performance = calculatePerformance();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#CDDC39'];

  // Currency formatter
  const formatCurrency = (value: number, currency: Currency = 'EUR') => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSort = (field: keyof Investment) => {
    setSort(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate total by currency
  const getTotalsByCurrency = () => {
    return investments.reduce((acc: Record<Currency, number>, inv) => {
      acc[inv.currency] = (acc[inv.currency] || 0) + inv.currentValue;
      return acc;
    }, {} as Record<Currency, number>);
  };

  const currencyTotals = getTotalsByCurrency();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container-fluid py-4">
          <div className="flex-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary-500" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">CFO Investment Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="btn-sm btn-primary flex items-center gap-2"
                onClick={() => setView('dashboard')}
                aria-label="Dashboard"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button 
                className="btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                onClick={() => setView('list')}
                aria-label="List View"
              >
                <Clipboard size={18} />
                <span className="hidden sm:inline">Investments</span>
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {view === 'list' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Investments</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={handleAddInvestment}
                  aria-label="Add Investment"
                >
                  <PlusCircle size={18} />
                  <span>Add Investment</span>
                </button>
                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImportData} 
                    className="sr-only" 
                    accept=".json" 
                    id="importData"
                  />
                  <button 
                    className="btn bg-indigo-500 text-white hover:bg-indigo-600 flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Import Data"
                  >
                    <FileUp size={18} />
                    <span>Import</span>
                  </button>
                </div>
                <button 
                  className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
                  onClick={handleExportData}
                  aria-label="Export Data"
                >
                  <FileDown size={18} />
                  <span>Export</span>
                </button>
                <button 
                  className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                  onClick={downloadTemplate}
                  aria-label="Download Template"
                >
                  <Download size={18} />
                  <span>Template</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search investments..."
                      className="input pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search investments"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    className="input"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as InvestmentType | 'All' })}
                    aria-label="Filter by type"
                  >
                    <option value="All">All Types</option>
                    <option value="Stock">Stocks</option>
                    <option value="Bond">Bonds</option>
                    <option value="RealEstate">Real Estate</option>
                    <option value="Fund">Funds</option>
                    <option value="Commodity">Commodities</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                  <select
                    className="input"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value as Country | 'All' })}
                    aria-label="Filter by country"
                  >
                    <option value="All">All Countries</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Austria">Austria</option>
                    <option value="UK">UK</option>
                    <option value="Norway">Norway</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                    onClick={() => setFilters({ type: 'All', country: 'All', minAmount: null, maxAmount: null })}
                    aria-label="Reset filters"
                  >
                    <RefreshCw size={18} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
              
              {/* Advanced filters */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label htmlFor="minAmount" className="form-label">Min Amount</label>
                    <input
                      id="minAmount"
                      type="number"
                      className="input"
                      placeholder="Min amount"
                      value={filters.minAmount || ''}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        minAmount: e.target.value ? Number(e.target.value) : null 
                      })}
                      aria-label="Minimum amount filter"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="maxAmount" className="form-label">Max Amount</label>
                    <input
                      id="maxAmount"
                      type="number"
                      className="input"
                      placeholder="Max amount"
                      value={filters.maxAmount || ''}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        maxAmount: e.target.value ? Number(e.target.value) : null 
                      })}
                      aria-label="Maximum amount filter"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Investments Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              {sortedInvestments.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-1">
                            <span>Name</span>
                            {sort.field === 'name' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('type')}>
                          <div className="flex items-center gap-1">
                            <span>Type</span>
                            {sort.field === 'type' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('amount')}>
                          <div className="flex items-center gap-1">
                            <span>Amount</span>
                            {sort.field === 'amount' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('currency')}>
                          <div className="flex items-center gap-1">
                            <span>Currency</span>
                            {sort.field === 'currency' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('country')}>
                          <div className="flex items-center gap-1">
                            <span>Country</span>
                            {sort.field === 'country' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('currentValue')}>
                          <div className="flex items-center gap-1">
                            <span>Current Value</span>
                            {sort.field === 'currentValue' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => handleSort('purchaseDate')}>
                          <div className="flex items-center gap-1">
                            <span>Purchase Date</span>
                            {sort.field === 'purchaseDate' && (
                              <SortDesc size={14} className={sort.direction === 'asc' ? 'transform rotate-180' : ''} />
                            )}
                          </div>
                        </th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedInvestments.map((investment) => (
                        <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="table-cell font-medium">{investment.name}</td>
                          <td className="table-cell">
                            <span className={`badge ${styles.investmentType} ${styles[investment.type.toLowerCase()]}`}>
                              {investment.type}
                            </span>
                          </td>
                          <td className="table-cell">{formatCurrency(investment.amount, investment.currency)}</td>
                          <td className="table-cell">{investment.currency}</td>
                          <td className="table-cell">{investment.country}</td>
                          <td className="table-cell">
                            <span className={investment.currentValue > investment.amount ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {formatCurrency(investment.currentValue, investment.currency)}
                            </span>
                          </td>
                          <td className="table-cell">{investment.purchaseDate}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEditInvestment(investment)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                aria-label={`Edit ${investment.name}`}
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteInvestment(investment.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                aria-label={`Delete ${investment.name}`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {investments.length === 0 ? (
                    <div>
                      <p className="mb-4">No investments found. Start by adding your first investment.</p>
                      <button 
                        className="btn btn-primary inline-flex items-center gap-2"
                        onClick={handleAddInvestment}
                      >
                        <PlusCircle size={18} />
                        <span>Add Investment</span>
                      </button>
                    </div>
                  ) : (
                    <p>No investments match your filter criteria. Try adjusting your filters.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              {currentInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Investment Name</label>
                <input
                  id="name"
                  type="text"
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  {...register('name', { required: 'Name is required' })}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Type</label>
                  <select
                    id="type"
                    className="input"
                    {...register('type', { required: true })}
                    aria-invalid={errors.type ? 'true' : 'false'}
                  >
                    <option value="Stock">Stock</option>
                    <option value="Bond">Bond</option>
                    <option value="RealEstate">Real Estate</option>
                    <option value="Fund">Fund</option>
                    <option value="Commodity">Commodity</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.type && <p className="form-error">Type is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="country">Country</label>
                  <select
                    id="country"
                    className="input"
                    {...register('country', { required: true })}
                    aria-invalid={errors.country ? 'true' : 'false'}
                  >
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Austria">Austria</option>
                    <option value="UK">UK</option>
                    <option value="Norway">Norway</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.country && <p className="form-error">Country is required</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Investment Amount</label>
                  <input
                    id="amount"
                    type="number"
                    className={`input ${errors.amount ? 'border-red-500' : ''}`}
                    {...register('amount', { 
                      required: 'Amount is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    aria-invalid={errors.amount ? 'true' : 'false'}
                  />
                  {errors.amount && <p className="form-error">{errors.amount.message}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="input"
                    {...register('currency', { required: true })}
                    aria-invalid={errors.currency ? 'true' : 'false'}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                    <option value="NOK">NOK</option>
                    <option value="SEK">SEK</option>
                    <option value="DKK">DKK</option>
                  </select>
                  {errors.currency && <p className="form-error">Currency is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currentValue">Current Value</label>
                  <input
                    id="currentValue"
                    type="number"
                    className={`input ${errors.currentValue ? 'border-red-500' : ''}`}
                    {...register('currentValue', { 
                      required: 'Current value is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Value must be positive' }
                    })}
                    aria-invalid={errors.currentValue ? 'true' : 'false'}
                  />
                  {errors.currentValue && <p className="form-error">{errors.currentValue.message}</p>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="purchaseDate">Purchase Date</label>
                <input
                  id="purchaseDate"
                  type="date"
                  className={`input ${errors.purchaseDate ? 'border-red-500' : ''}`}
                  {...register('purchaseDate', { required: 'Purchase date is required' })}
                  aria-invalid={errors.purchaseDate ? 'true' : 'false'}
                />
                {errors.purchaseDate && <p className="form-error">{errors.purchaseDate.message}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="input"
                  {...register('notes')}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={cancelForm}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentInvestment ? 'Update Investment' : 'Add Investment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Investment Dashboard</h2>
              <div className="flex gap-2">
                <button 
                  className={`btn-sm ${chartType === 'bar' ? 'btn-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white'} flex items-center gap-1`}
                  onClick={() => setChartType('bar')}
                  aria-label="Show bar charts"
                >
                  <BarChart2 size={16} />
                  <span>Bar</span>
                </button>
                <button 
                  className={`btn-sm ${chartType === 'pie' ? 'btn-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white'} flex items-center gap-1`}
                  onClick={() => setChartType('pie')}
                  aria-label="Show pie charts"
                >
                  <PieChartIcon size={16} />
                  <span>Pie</span>
                </button>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total Investments</div>
                <div className="stat-value">{investments.length}</div>
                <div className="stat-desc">Across {Object.keys(currencyTotals).length} currencies</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Amount Invested</div>
                <div className="stat-value">{formatCurrency(performance.totalInvested)}</div>
                <div className="stat-desc">Initial investment</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Current Value</div>
                <div className="stat-value">{formatCurrency(performance.totalCurrentValue)}</div>
                <div className="stat-desc">Current portfolio value</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Performance</div>
                <div className={`stat-value ${performance.totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {performance.totalGain >= 0 ? '+' : ''}{performance.performancePercent.toFixed(2)}%
                </div>
                <div className="stat-desc">
                  {formatCurrency(performance.totalGain)} {performance.totalGain >= 0 ? 'profit' : 'loss'}
                </div>
              </div>
            </div>

            {/* Currency Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Currency Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(currencyTotals).map(([currency, amount]) => (
                  <div key={currency} className="flex items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                      {currency === 'EUR' ? <Euro className="text-primary-500" size={20} /> : 
                       <DollarSign className="text-primary-500" size={20} />}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{currency}</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(amount, currency as Currency)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Type Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Investment Type Distribution</h3>
                <div className="h-80">
                  {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Value']} />
                        <Legend />
                        <Bar dataKey="value" fill="#0088FE" name="Value" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Value']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Investment by Country */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Investment by Country</h3>
                <div className="h-80">
                  {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Value']} />
                        <Legend />
                        <Bar dataKey="value" fill="#00C49F" name="Value" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {countryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Value']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Investments */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Recent Investments</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Current Value</th>
                      <th className="table-header">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.slice(0, 5).map((investment) => {
                      const gain = investment.currentValue - investment.amount;
                      const percentage = ((gain / investment.amount) * 100).toFixed(2);
                      return (
                        <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="table-cell font-medium">{investment.name}</td>
                          <td className="table-cell">
                            <span className={`badge ${styles.investmentType} ${styles[investment.type.toLowerCase()]}`}>
                              {investment.type}
                            </span>
                          </td>
                          <td className="table-cell">{formatCurrency(investment.amount, investment.currency)}</td>
                          <td className="table-cell">{formatCurrency(investment.currentValue, investment.currency)}</td>
                          <td className="table-cell">
                            <span className={gain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {gain >= 0 ? '+' : ''}{percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-800 shadow-inner py-6 mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
