import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Sun, Moon, Plus, Edit, Trash2, Search, X, ArrowUp, ArrowDown, DollarSign, Calendar, Tag, List, Building, BarChart2, Filter, Download, Upload, Check } from 'lucide-react'; // Added Check icon
import styles from './styles/styles.module.css';

// Types
interface Investment {
  id: string;
  companyName: string;
  investmentAmount: number;
  investmentDate: string; // YYYY-MM-DD
  fundName: string;
  sector: string;
  status: 'Active' | 'Exited' | 'Written Off';
}

type InvestmentFormData = Omit<Investment, 'id'>;

type SortKey = keyof Investment;
type SortOrder = 'asc' | 'desc';

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Consumer Goods', 'Industrials', 'Real Estate', 'Energy'];
const STATUSES: Investment['status'][] = ['Active', 'Exited', 'Written Off'];

// Helper Functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00'); // Ensure parsing as local date
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initial Data (Optional - for demonstration)
const initialInvestments: Investment[] = [
  {
    id: generateId(),
    companyName: 'Innovate Solutions',
    investmentAmount: 5000000,
    investmentDate: '2022-08-15',
    fundName: 'Growth Fund I',
    sector: 'Technology',
    status: 'Active',
  },
  {
    id: generateId(),
    companyName: 'HealthWell Pharma',
    investmentAmount: 10000000,
    investmentDate: '2021-05-20',
    fundName: 'BioTech Ventures',
    sector: 'Healthcare',
    status: 'Active',
  },
  {
    id: generateId(),
    companyName: 'FinSecure Capital',
    investmentAmount: 7500000,
    investmentDate: '2023-01-10',
    fundName: 'Fintech Fund II',
    sector: 'Finance',
    status: 'Active',
  },
  {
    id: generateId(),
    companyName: 'EcoGoods Retail',
    investmentAmount: 3000000,
    investmentDate: '2020-11-01',
    fundName: 'Sustainable Future Fund',
    sector: 'Consumer Goods',
    status: 'Exited',
  },
];

// Main App Component
const App: React.FC = () => {
  // State Hooks
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<Investment['status'] | ''>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'companyName', order: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InvestmentFormData>();

  // Effects
  // Load data and theme preference from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedInvestments = localStorage.getItem('pe_investments');
      const savedDarkMode = localStorage.getItem('darkMode');

      if (savedInvestments) {
        setInvestments(JSON.parse(savedInvestments));
      } else {
        // Set initial data if nothing is saved
        setInvestments(initialInvestments);
      }

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : prefersDark;
      setIsDarkMode(initialDarkMode);
      if (initialDarkMode) {
        document.documentElement.classList.add('dark');
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load data from local storage:', err);
      setError('Failed to load data. Please try refreshing the page.');
      setInvestments(initialInvestments); // Fallback to initial data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save investments to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) { // Avoid saving during initial load
      try {
        localStorage.setItem('pe_investments', JSON.stringify(investments));
      } catch (err) {
        console.error('Failed to save investments to local storage:', err);
        setError('Failed to save changes.');
      }
    }
  }, [investments, isLoading]);

  // Update dark mode class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Add ESC key listener for modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]); // Dependency: isModalOpen

  // Memoized Data
  const filteredAndSortedInvestments = useMemo(() => {
    let filtered = investments.filter(inv => {
      const nameMatch = inv.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const sectorMatch = filterSector === '' || inv.sector === filterSector;
      const statusMatch = filterStatus === '' || inv.status === filterStatus;
      return nameMatch && sectorMatch && statusMatch;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        // Basic fallback for other types or mixed types
        const stringA = String(aValue);
        const stringB = String(bValue);
        comparison = stringA.localeCompare(stringB);
      }

      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  }, [investments, searchTerm, filterSector, filterStatus, sortConfig]);

  const dashboardStats = useMemo(() => {
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'Active').length;
    const exitedInvestments = investments.filter(inv => inv.status === 'Exited').length;
    const uniqueFunds = new Set(investments.map(inv => inv.fundName)).size;
    return {
      totalInvestment,
      activeInvestments,
      exitedInvestments,
      uniqueFunds,
      totalCount: investments.length,
    };
  }, [investments]);

  const sectorDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    investments.forEach(inv => {
      distribution[inv.sector] = (distribution[inv.sector] || 0) + inv.investmentAmount;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [investments]);

  // Event Handlers
  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterSector = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSector(event.target.value);
  };

  const handleFilterStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(event.target.value as Investment['status'] | '');
  };

  const openModal = (investment: Investment | null = null) => {
    if (investment) {
      setEditingInvestment(investment);
      // Pre-fill form with investment data
      setValue('companyName', investment.companyName);
      setValue('investmentAmount', investment.investmentAmount);
      // Ensure date is in YYYY-MM-DD format for the input
      setValue('investmentDate', investment.investmentDate);
      setValue('fundName', investment.fundName);
      setValue('sector', investment.sector);
      setValue('status', investment.status);
    } else {
      setEditingInvestment(null);
      reset(); // Clear form for new entry
    }
    document.body.classList.add('modal-open');
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    document.body.classList.remove('modal-open');
    setIsModalOpen(false);
    setEditingInvestment(null);
    reset(); // Reset form state on close
  }, [reset]);

  const onSubmit: SubmitHandler<InvestmentFormData> = (data) => {
    try {
      if (editingInvestment) {
        // Update existing investment
        setInvestments(prev =>
          prev.map(inv => (inv.id === editingInvestment.id ? { ...inv, ...data } : inv))
        );
      } else {
        // Add new investment
        const newInvestment: Investment = { ...data, id: generateId() };
        setInvestments(prev => [...prev, newInvestment]);
      }
      setError(null); // Clear previous errors on success
      closeModal();
    } catch (err) {
      console.error('Failed to save investment:', err);
      setError('Failed to save investment. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        setInvestments(prev => prev.filter(inv => inv.id !== id));
        setError(null);
      } catch (err) {
        console.error('Failed to delete investment:', err);
        setError('Failed to delete investment. Please try again.');
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const exportData = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(investments, null, 2)
      )}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'private_equity_investments.json';
      link.click();
      setError(null);
    } catch (err) {
      console.error('Failed to export data:', err);
      setError('Failed to export data.');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Failed to read file content.');
        }
        const importedData = JSON.parse(text);
        // Basic validation (can be expanded)
        if (Array.isArray(importedData) && importedData.every(item =>
          item && typeof item === 'object' && 'id' in item && 'companyName' in item
        )) {
          setInvestments(importedData);
          setError(null);
        } else {
          throw new Error('Invalid file format.');
        }
      } catch (err: any) {
        console.error('Failed to import data:', err);
        setError(`Failed to import data: ${err.message || 'Invalid format'}. Please upload a valid JSON file.`);
      }
      // Reset file input value to allow re-uploading the same file
      event.target.value = '';
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
       event.target.value = '';
    };
    reader.readAsText(file);
  };

   // Pie Chart Custom Active Shape
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="var(--color-text-base)" className="text-xs">{`${formatCurrency(value)}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

   const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const onPieLeave = () => {
    setActivePieIndex(null);
  };

  // Colors for Pie Chart Sectors
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  // JSX Rendering
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appContainer}`}> 
      {/* Header */} 
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide py-3 px-4 sm:px-6 lg:px-8 flex-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Building size={24} />
            <span>Private Equity Portfolio</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Sun size={16} className="text-yellow-500"/>
                <button
                  onClick={toggleDarkMode}
                  className="theme-toggle"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  role="switch"
                  aria-checked={isDarkMode}
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
                <Moon size={16} className="text-blue-500" />
            </div>
             {/* Import/Export Buttons */} 
            <input
              type="file"
              id="import-file"
              accept=".json"
              onChange={importData}
              className="hidden"
              aria-label="Import data"
            />
            <label
              htmlFor="import-file"
              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 flex items-center gap-1 cursor-pointer"
              role="button"
              tabIndex={0} // Make label focusable
            >
              <Upload size={16} />
              <span>Import</span>
            </label>
            <button
              onClick={exportData}
              className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 flex items-center gap-1"
              aria-label="Export data"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="flex-grow container-wide py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="alert alert-error mb-4" role="alert">
            <X size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200" aria-label="Close error message">
              <X size={16} />
            </button>
          </div>
        )}

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="stat-card">
                  <div className="skeleton-text w-1/3 h-4 mb-2"></div>
                  <div className="skeleton-text w-1/2 h-8 mb-1"></div>
                  <div className="skeleton-text w-1/4 h-4"></div>
                  </div>
              ))}
           </div>
        ) : (
          <> 
          {/* Dashboard Stats */} 
          <section aria-labelledby="dashboard-title" className="mb-6">
             <h2 id="dashboard-title" className="text-lg font-semibold mb-3 dark:text-slate-200">Dashboard Overview</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="stat-card">
                  <div className="stat-title flex items-center gap-1"><DollarSign size={14} /> Total Investment</div>
                  <div className="stat-value">{formatCurrency(dashboardStats.totalInvestment)}</div>
                  <div className="stat-desc">Across {dashboardStats.totalCount} investments</div>
                </div>
                 <div className="stat-card">
                  <div className="stat-title flex items-center gap-1"><List size={14} /> Active Investments</div>
                  <div className="stat-value">{dashboardStats.activeInvestments}</div>
                   <div className="stat-desc">Currently managed</div>
                </div>
                 <div className="stat-card">
                  <div className="stat-title flex items-center gap-1"><Check size={14} /> Exited Investments</div>
                  <div className="stat-value">{dashboardStats.exitedInvestments}</div>
                   <div className="stat-desc">Successfully realized</div>
                </div>
                 <div className="stat-card">
                  <div className="stat-title flex items-center gap-1"><Building size={14} /> Unique Funds</div>
                  <div className="stat-value">{dashboardStats.uniqueFunds}</div>
                  <div className="stat-desc">Deployed capital</div>
                </div>
                 <div className="stat-card lg:col-span-1">
                   <div className="stat-title flex items-center gap-1"><BarChart2 size={14} /> Investment by Sector</div>
                    <div className="h-24 mt-2 theme-transition-all">
                      <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={sectorDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={25} // Make it a donut chart
                            outerRadius={40}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            activeIndex={activePieIndex ?? undefined} // Handle null case
                            activeShape={renderActiveShape}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            nameKey="name"
                          >
                            {sectorDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={isDarkMode ? { backgroundColor: '#1e293b', border: 'none', borderRadius: 'var(--radius-md)' } : { borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0'}}
                             itemStyle={isDarkMode ? { color: '#e2e8f0'} : { color: '#1f2937' }}
                             formatter={(value: number) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
             </div>
          </section>

          {/* Controls: Add Button, Search, Filters */} 
          <section aria-labelledby="controls-title" className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 id="controls-title" className="sr-only">Investment Controls</h2>
              <button
                onClick={() => openModal()}
                className="btn btn-primary btn-responsive flex-center gap-1 w-full sm:w-auto"
                aria-label="Add new investment"
                name="add-investment-button"
              >
                <Plus size={18} />
                <span>Add Investment</span>
              </button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow">
                      <input
                      type="text"
                      placeholder="Search by Company Name..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="input input-responsive pl-8 w-full"
                      aria-label="Search investments by company name"
                      name="search-input"
                      />
                      <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                  </div>
                  <div className="flex gap-2">
                      <select
                          value={filterSector}
                          onChange={handleFilterSector}
                          className="input input-responsive"
                          aria-label="Filter by sector"
                          name="filter-sector"
                      >
                          <option value="">All Sectors</option>
                          {SECTORS.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                      </select>
                      <select
                          value={filterStatus}
                          onChange={handleFilterStatus}
                          className="input input-responsive"
                          aria-label="Filter by status"
                          name="filter-status"
                      >
                          <option value="">All Statuses</option>
                          {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <button 
                        onClick={() => { setSearchTerm(''); setFilterSector(''); setFilterStatus(''); }}
                        className="btn bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 text-gray-700 hover:bg-gray-300 p-2"
                        aria-label="Clear filters and search"
                        title="Clear filters and search"
                      >
                        <Filter size={16} />
                      </button>
                  </div>
              </div>
          </section>

          {/* Investment Table */} 
          <section aria-labelledby="investment-table-title">
              <h2 id="investment-table-title" className="sr-only">Investment Details</h2>
              <div className="table-container">
                <table className="table" aria-live="polite"> 
                  <thead className="table-header">
                    <tr>
                      {[ 
                        { key: 'companyName', label: 'Company', icon: Building },
                        { key: 'investmentAmount', label: 'Amount', icon: DollarSign },
                        { key: 'investmentDate', label: 'Date', icon: Calendar },
                        { key: 'fundName', label: 'Fund', icon: Building },
                        { key: 'sector', label: 'Sector', icon: Tag },
                        { key: 'status', label: 'Status', icon: List }, 
                      ].map(({ key, label, icon: Icon }) => (
                        <th key={key} scope="col" className="table-cell px-4 py-3 sm:px-6">
                          <button 
                            onClick={() => handleSort(key as SortKey)}
                            className="flex items-center gap-1 font-medium hover:text-gray-700 dark:hover:text-slate-100 group"
                            aria-label={`Sort by ${label}`}
                          >
                            <Icon size={14} className="inline-block"/>
                            <span>{label}</span>
                            {sortConfig.key === key && (
                              sortConfig.order === 'asc' ? <ArrowUp size={14} className="ml-1 group-hover:opacity-100 opacity-70" /> : <ArrowDown size={14} className="ml-1 group-hover:opacity-100 opacity-70" />
                            )}
                          </button>
                        </th>
                      ))}
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 theme-transition-all">
                     {filteredAndSortedInvestments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">
                          {investments.length === 0 ? 'No investments added yet.' : 'No investments match your criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedInvestments.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition-bg fade-in">
                          <td className="table-cell px-4 py-3 sm:px-6 font-medium text-gray-900 dark:text-white">{inv.companyName}</td>
                          <td className="table-cell px-4 py-3 sm:px-6 text-right">{formatCurrency(inv.investmentAmount)}</td>
                          <td className="table-cell px-4 py-3 sm:px-6">{formatDate(inv.investmentDate)}</td>
                          <td className="table-cell px-4 py-3 sm:px-6">{inv.fundName}</td>
                          <td className="table-cell px-4 py-3 sm:px-6">{inv.sector}</td>
                          <td className="table-cell px-4 py-3 sm:px-6">
                            <span className={`badge 
                              ${inv.status === 'Active' ? 'badge-success' : ''}
                              ${inv.status === 'Exited' ? 'badge-info' : ''}
                              ${inv.status === 'Written Off' ? 'badge-error' : ''}
                            `}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-3 sm:px-6 text-right whitespace-nowrap">
                            <button 
                              onClick={() => openModal(inv)} 
                              className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 mr-2 flex-center gap-1 inline-flex"
                              aria-label={`Edit investment for ${inv.companyName}`}
                              name={`edit-${inv.id}`}
                            >
                              <Edit size={14} /> 
                              <span className="responsive-hide">Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(inv.id)} 
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex-center gap-1 inline-flex"
                              aria-label={`Delete investment for ${inv.companyName}`}
                              name={`delete-${inv.id}`}
                            >
                              <Trash2 size={14} /> 
                              <span className="responsive-hide">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                     )} 
                  </tbody>
                </table>
              </div>
          </section>
        </> 
        )} 
      </main>

      {/* Footer */} 
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 mt-auto theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modal for Add/Edit Investment */} 
      {isModalOpen && (
        <div
          className="modal-backdrop fade-in"
          onClick={closeModal} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content slide-in w-full max-w-lg theme-transition-all" 
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            role="document"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
                </h3>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" 
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form Fields */} 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                      <label htmlFor="companyName" className="form-label">Company Name</label>
                      <input
                      id="companyName"
                      {...register('companyName', { required: 'Company name is required' })}
                      className={`input ${errors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={errors.companyName ? "true" : "false"}
                      />
                      {errors.companyName && <p className="form-error" role="alert">{errors.companyName.message}</p>}
                  </div>
                  <div className="form-group">
                      <label htmlFor="investmentAmount" className="form-label">Investment Amount ($)</label>
                      <input
                      id="investmentAmount"
                      type="number"
                      step="any"
                      {...register('investmentAmount', { 
                          required: 'Investment amount is required', 
                          valueAsNumber: true, 
                          min: { value: 0, message: 'Amount cannot be negative' } 
                      })}
                      className={`input ${errors.investmentAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={errors.investmentAmount ? "true" : "false"}
                      />
                      {errors.investmentAmount && <p className="form-error" role="alert">{errors.investmentAmount.message}</p>}
                  </div>
                   <div className="form-group">
                      <label htmlFor="investmentDate" className="form-label">Investment Date</label>
                      <input
                      id="investmentDate"
                      type="date"
                      {...register('investmentDate', { required: 'Investment date is required' })}
                      className={`input ${errors.investmentDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={errors.investmentDate ? "true" : "false"}
                      />
                      {errors.investmentDate && <p className="form-error" role="alert">{errors.investmentDate.message}</p>}
                  </div>
                  <div className="form-group">
                      <label htmlFor="fundName" className="form-label">Fund Name</label>
                      <input
                      id="fundName"
                      {...register('fundName', { required: 'Fund name is required' })}
                      className={`input ${errors.fundName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={errors.fundName ? "true" : "false"}
                      />
                      {errors.fundName && <p className="form-error" role="alert">{errors.fundName.message}</p>}
                  </div>
                   <div className="form-group">
                      <label htmlFor="sector" className="form-label">Sector</label>
                      <select
                      id="sector"
                      {...register('sector', { required: 'Sector is required' })}
                      className={`input ${errors.sector ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                       aria-invalid={errors.sector ? "true" : "false"}
                      >
                          <option value="">Select Sector...</option>
                          {SECTORS.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                      </select>
                      {errors.sector && <p className="form-error" role="alert">{errors.sector.message}</p>}
                  </div>
                  <div className="form-group">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                      id="status"
                      {...register('status', { required: 'Status is required' })}
                      className={`input ${errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={errors.status ? "true" : "false"}
                      >
                          <option value="">Select Status...</option>
                          {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                      {errors.status && <p className="form-error" role="alert">{errors.status.message}</p>}
                  </div>
              </div>

              {/* Modal Footer */} 
              <div className="modal-footer">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 text-gray-700 hover:bg-gray-300"
                  name="cancel-button"
                 >Cancel</button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  name="submit-button"
                 >{editingInvestment ? 'Save Changes' : 'Add Investment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
