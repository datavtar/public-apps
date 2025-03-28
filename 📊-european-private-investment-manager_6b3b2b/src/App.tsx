import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { Chart, registerables } from 'chart.js';
import { 
  Home, 
  Settings, 
  Wallet, 
  PieChart, 
  BarChart, 
  FileUp, 
  FileDown, 
  Plus, 
  Edit, 
  Trash, 
  Filter, 
  Search, 
  MoonStar, 
  Sun, 
  Eye, 
  RefreshCw,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Register Chart.js components
Chart.register(...registerables);

// Define types
type Investment = {
  id: string;
  name: string;
  type: InvestmentType;
  country: string;
  amount: number;
  currency: Currency;
  date: string; // ISO date string
  status: InvestmentStatus;
  notes?: string;
  returns?: number;
  returnPercentage?: number;
};

enum InvestmentType {
  STOCK = 'Stock',
  BOND = 'Bond',
  REAL_ESTATE = 'Real Estate',
  PRIVATE_EQUITY = 'Private Equity',
  MUTUAL_FUND = 'Mutual Fund',
  ETF = 'ETF',
  CRYPTO = 'Cryptocurrency',
  OTHER = 'Other'
}

enum InvestmentStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  CLOSED = 'Closed',
  UNDERPERFORMING = 'Underperforming',
  OUTPERFORMING = 'Outperforming'
}

enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
  SEK = 'SEK',
  NOK = 'NOK',
  DKK = 'DKK'
}

enum AppView {
  DASHBOARD = 'dashboard',
  INVESTMENTS = 'investments',
  REPORTS = 'reports',
  SETTINGS = 'settings'
}

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
};

type FilterOptions = {
  type: InvestmentType | '';
  country: string;
  status: InvestmentStatus | '';
  minAmount: number | null;
  maxAmount: number | null;
  dateFrom: string;
  dateTo: string;
};

const App: React.FC = () => {
  // States
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Investment; direction: 'asc' | 'desc' } | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: '',
    country: '',
    status: '',
    minAmount: null,
    maxAmount: null,
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [countries, setCountries] = useState<string[]>([]);
  
  // Refs for charts
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  // Form handling with react-hook-form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Investment>();

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

  // Load investments from localStorage on initial load
  useEffect(() => {
    const savedInvestments = localStorage.getItem('investments');
    if (savedInvestments) {
      try {
        const parsedInvestments = JSON.parse(savedInvestments) as Investment[];
        setInvestments(parsedInvestments);
        
        // Extract unique countries
        const uniqueCountries = Array.from(new Set(parsedInvestments.map(inv => inv.country)));
        setCountries(uniqueCountries);
      } catch (error) {
        console.error('Error parsing saved investments:', error);
      }
    }
  }, []);

  // Save investments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
    
    // Extract unique countries
    const uniqueCountries = Array.from(new Set(investments.map(inv => inv.country)));
    setCountries(uniqueCountries);
  }, [investments]);

  // Update charts when investments change
  useEffect(() => {
    if (currentView === AppView.DASHBOARD) {
      updateCharts();
    }
  }, [investments, currentView, isDarkMode]);

  const updateCharts = () => {
    if (pieChartRef.current && barChartRef.current) {
      // Clean up existing chart instances
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      // Prepare data for pie chart by investment type
      const typeData: Record<string, number> = {};
      investments.forEach(inv => {
        if (typeData[inv.type]) {
          typeData[inv.type] += inv.amount;
        } else {
          typeData[inv.type] = inv.amount;
        }
      });

      const pieChartData: ChartData = {
        labels: Object.keys(typeData),
        datasets: [{
          label: 'Investment Distribution',
          data: Object.values(typeData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)'
          ]
        }]
      };

      // Prepare data for bar chart by country
      const countryData: Record<string, number> = {};
      investments.forEach(inv => {
        if (countryData[inv.country]) {
          countryData[inv.country] += inv.amount;
        } else {
          countryData[inv.country] = inv.amount;
        }
      });

      const barChartData: ChartData = {
        labels: Object.keys(countryData),
        datasets: [{
          label: 'Investment by Country',
          data: Object.values(countryData),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };

      // Set up dark mode compatible charts
      const textColor = isDarkMode ? '#fff' : '#666';
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      // Create pie chart
      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: pieChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: textColor
              }
            },
            title: {
              display: true,
              text: 'Investment Distribution by Type',
              color: textColor
            }
          }
        }
      });

      // Create bar chart
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: barChartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            },
            x: {
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: textColor
              }
            },
            title: {
              display: true,
              text: 'Investment by Country',
              color: textColor
            }
          }
        }
      });
    }
  };

  const handleAddInvestment = (data: Investment) => {
    const newInvestment: Investment = {
      ...data,
      id: Date.now().toString()
    };
    
    setInvestments(prevInvestments => [...prevInvestments, newInvestment]);
    setIsModalOpen(false);
    reset();
  };

  const handleUpdateInvestment = (data: Investment) => {
    if (selectedInvestment) {
      const updatedInvestments = investments.map(inv => 
        inv.id === selectedInvestment.id ? { ...data, id: selectedInvestment.id } : inv
      );
      setInvestments(updatedInvestments);
      setIsModalOpen(false);
      setSelectedInvestment(null);
      reset();
    }
  };

  const handleDeleteInvestment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      setInvestments(prevInvestments => prevInvestments.filter(inv => inv.id !== id));
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    // Set form values
    Object.entries(investment).forEach(([key, value]) => {
      setValue(key as keyof Investment, value);
    });
    setIsModalOpen(true);
  };

  const handleSort = (key: keyof Investment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedInvestments = () => {
    let sortableInvestments = [...investments];
    if (searchQuery) {
      sortableInvestments = sortableInvestments.filter(inv => 
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (isFiltering) {
      sortableInvestments = sortableInvestments.filter(inv => {
        let meetsConditions = true;
        
        if (filterOptions.type && inv.type !== filterOptions.type) {
          meetsConditions = false;
        }
        
        if (filterOptions.country && inv.country !== filterOptions.country) {
          meetsConditions = false;
        }
        
        if (filterOptions.status && inv.status !== filterOptions.status) {
          meetsConditions = false;
        }
        
        if (filterOptions.minAmount !== null && inv.amount < filterOptions.minAmount) {
          meetsConditions = false;
        }
        
        if (filterOptions.maxAmount !== null && inv.amount > filterOptions.maxAmount) {
          meetsConditions = false;
        }
        
        if (filterOptions.dateFrom && new Date(inv.date) < new Date(filterOptions.dateFrom)) {
          meetsConditions = false;
        }
        
        if (filterOptions.dateTo && new Date(inv.date) > new Date(filterOptions.dateTo)) {
          meetsConditions = false;
        }
        
        return meetsConditions;
      });
    }
    
    if (sortConfig !== null) {
      sortableInvestments.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableInvestments;
  };

  const applyFilters = () => {
    setIsFiltering(true);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterOptions({
      type: '',
      country: '',
      status: '',
      minAmount: null,
      maxAmount: null,
      dateFrom: '',
      dateTo: ''
    });
    setIsFiltering(false);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileInput(files[0]);
    }
  };

  const importExcelData = () => {
    if (!fileInput) {
      setImportError('Please select a file to import');
      return;
    }

    // Mock Excel import - in a real app, you would use a library like xlsx
    // For demo purposes, we'll use a timeout to simulate processing
    setTimeout(() => {
      try {
        // Mock successful import
        const mockImportedData: Investment[] = [
          {
            id: 'import1',
            name: 'Imported Stock Investment',
            type: InvestmentType.STOCK,
            country: 'Germany',
            amount: 15000,
            currency: Currency.EUR,
            date: new Date().toISOString(),
            status: InvestmentStatus.ACTIVE,
            returns: 750,
            returnPercentage: 5
          },
          {
            id: 'import2',
            name: 'Imported Real Estate Investment',
            type: InvestmentType.REAL_ESTATE,
            country: 'France',
            amount: 250000,
            currency: Currency.EUR,
            date: new Date().toISOString(),
            status: InvestmentStatus.ACTIVE,
            returns: 12500,
            returnPercentage: 5
          }
        ];
        
        setInvestments(prevInvestments => [...prevInvestments, ...mockImportedData]);
        setImportSuccess(true);
        setImportError('');
        setFileInput(null);
        
        // Reset success message after a few seconds
        setTimeout(() => {
          setImportSuccess(false);
        }, 3000);
      } catch (error) {
        setImportError('Failed to import data. Please check your file format.');
      }
    }, 1000);
  };

  const exportInvestmentsData = () => {
    // In a real application, you would format the data properly for Excel
    // For this demo, we'll simply create a JSON file
    const dataStr = JSON.stringify(investments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'investments-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getTotalInvestmentAmount = () => {
    return investments.reduce((total, inv) => total + inv.amount, 0);
  };

  const getTotalReturns = () => {
    return investments.reduce((total, inv) => total + (inv.returns || 0), 0);
  };

  const getAverageReturnPercentage = () => {
    if (investments.length === 0) return 0;
    const totalPercentage = investments.reduce((total, inv) => total + (inv.returnPercentage || 0), 0);
    return totalPercentage / investments.length;
  };

  // Modal for add/edit investment
  const renderModal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 md:mx-auto">
          <div className="modal-header border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h3>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedInvestment(null);
                reset();
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit(selectedInvestment ? handleUpdateInvestment : handleAddInvestment)}>
            <div className="modal-body px-6 py-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Investment Name</label>
                <input 
                  id="name" 
                  className="input w-full" 
                  {...register('name', { required: 'Investment name is required' })} 
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="type">Investment Type</label>
                <select 
                  id="type" 
                  className="input w-full" 
                  {...register('type', { required: 'Investment type is required' })}
                >
                  {Object.values(InvestmentType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <p className="form-error">{errors.type.message}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="country">Country</label>
                <input 
                  id="country" 
                  className="input w-full" 
                  list="countries"
                  {...register('country', { required: 'Country is required' })} 
                />
                <datalist id="countries">
                  {countries.map(country => (
                    <option key={country} value={country} />
                  ))}
                </datalist>
                {errors.country && <p className="form-error">{errors.country.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Amount</label>
                  <input 
                    id="amount" 
                    type="number" 
                    className="input w-full" 
                    step="0.01"
                    min="0"
                    {...register('amount', { 
                      required: 'Amount is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Amount must be positive' }
                    })} 
                  />
                  {errors.amount && <p className="form-error">{errors.amount.message}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select 
                    id="currency" 
                    className="input w-full" 
                    {...register('currency', { required: 'Currency is required' })}
                  >
                    {Object.values(Currency).map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  {errors.currency && <p className="form-error">{errors.currency.message}</p>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input 
                  id="date" 
                  type="date" 
                  className="input w-full" 
                  {...register('date', { required: 'Date is required' })} 
                />
                {errors.date && <p className="form-error">{errors.date.message}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select 
                  id="status" 
                  className="input w-full" 
                  {...register('status', { required: 'Status is required' })}
                >
                  {Object.values(InvestmentStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && <p className="form-error">{errors.status.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="returns">Returns</label>
                  <input 
                    id="returns" 
                    type="number" 
                    className="input w-full" 
                    step="0.01"
                    {...register('returns', { valueAsNumber: true })} 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="returnPercentage">Return %</label>
                  <input 
                    id="returnPercentage" 
                    type="number" 
                    className="input w-full" 
                    step="0.01"
                    {...register('returnPercentage', { valueAsNumber: true })} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea 
                  id="notes" 
                  className="input w-full" 
                  rows={3}
                  {...register('notes')} 
                />
              </div>
            </div>
            
            <div className="modal-footer border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button 
                type="button"
                className="btn bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 mt-2 sm:mt-0"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedInvestment(null);
                  reset();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                {selectedInvestment ? 'Update' : 'Add'} Investment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Filters panel
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Investments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="filterType">Investment Type</label>
            <select
              id="filterType"
              className="input w-full"
              value={filterOptions.type}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, type: e.target.value as InvestmentType | '' }))}
            >
              <option value="">All Types</option>
              {Object.values(InvestmentType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="filterCountry">Country</label>
            <select
              id="filterCountry"
              className="input w-full"
              value={filterOptions.country}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, country: e.target.value }))}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="filterStatus">Status</label>
            <select
              id="filterStatus"
              className="input w-full"
              value={filterOptions.status}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value as InvestmentStatus | '' }))}
            >
              <option value="">All Statuses</option>
              {Object.values(InvestmentStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="form-label" htmlFor="filterMinAmount">Min Amount</label>
              <input
                id="filterMinAmount"
                type="number"
                className="input w-full"
                value={filterOptions.minAmount || ''}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, minAmount: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="filterMaxAmount">Max Amount</label>
              <input
                id="filterMaxAmount"
                type="number"
                className="input w-full"
                value={filterOptions.maxAmount || ''}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, maxAmount: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="filterDateFrom">From Date</label>
            <input
              id="filterDateFrom"
              type="date"
              className="input w-full"
              value={filterOptions.dateFrom}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="filterDateTo">To Date</label>
            <input
              id="filterDateTo"
              type="date"
              className="input w-full"
              value={filterOptions.dateTo}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
          <button
            className="btn bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            onClick={() => setShowFilters(false)}
          >
            Cancel
          </button>
          <button
            className="btn bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
          <button
            className="btn btn-primary"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  // Render dashboard view
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Investments</div>
            <div className="stat-value">{investments.length}</div>
            <div className="stat-desc">Number of investments</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Amount</div>
            <div className="stat-value">{getTotalInvestmentAmount().toLocaleString()} €</div>
            <div className="stat-desc">Combined value of all investments</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Returns</div>
            <div className="stat-value">{getTotalReturns().toLocaleString()} €</div>
            <div className="stat-desc">Combined returns</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Average Return</div>
            <div className="stat-value">{getAverageReturnPercentage().toFixed(2)}%</div>
            <div className="stat-desc">Average return percentage</div>
          </div>
        </div>
        
        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-80">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investment by Type</h3>
            <div className="h-64">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
          
          <div className="card h-80">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investment by Country</h3>
            <div className="h-64">
              <canvas ref={barChartRef}></canvas>
            </div>
          </div>
        </div>
        
        {/* Recent investments section */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Investments</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {sortedInvestments().slice(0, 5).map(investment => (
                  <tr key={investment.id}>
                    <td className="table-cell font-medium">{investment.name}</td>
                    <td className="table-cell">{investment.type}</td>
                    <td className="table-cell">{investment.amount.toLocaleString()} {investment.currency}</td>
                    <td className="table-cell">{format(parseISO(investment.date), 'dd MMM yyyy')}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        investment.status === InvestmentStatus.ACTIVE ? 'badge-success' :
                        investment.status === InvestmentStatus.PENDING ? 'badge-warning' :
                        investment.status === InvestmentStatus.CLOSED ? 'badge-error' :
                        investment.status === InvestmentStatus.UNDERPERFORMING ? 'badge-info' :
                        'badge-info'
                      }`}>
                        {investment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedInvestments().length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-cell text-center py-4">No investments found. Add your first investment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentView(AppView.INVESTMENTS)}
            >
              View All Investments
            </button>
          </div>
        </div>
        
        {/* Data import/export section */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Import/Export Data</h3>
          
          {importError && (
            <div className="alert alert-error mb-4">
              <AlertTriangle className="h-5 w-5" />
              <p>{importError}</p>
            </div>
          )}
          
          {importSuccess && (
            <div className="alert alert-success mb-4">
              <CheckCircle className="h-5 w-5" />
              <p>Data imported successfully!</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="form-group flex-1">
              <label className="form-label">Import Excel Data</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv"
                  className="input flex-1" 
                  onChange={handleFileImport}
                />
                <button 
                  className="btn btn-primary flex items-center justify-center gap-2"
                  onClick={importExcelData}
                  disabled={!fileInput}
                >
                  <FileUp className="h-4 w-4" /> Import
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Upload Excel (.xlsx, .xls) or CSV files</p>
            </div>
            
            <div className="form-group flex-1">
              <label className="form-label">Export Investment Data</label>
              <button 
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                onClick={exportInvestmentsData}
                disabled={investments.length === 0}
              >
                <FileDown className="h-4 w-4" /> Export to File
              </button>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Download all your investment data</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render investments view (table listing)
  const renderInvestments = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Investments</h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search investments..."
                className="input pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={`btn ${isFiltering ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200'} flex items-center justify-center gap-2`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" /> {isFiltering ? 'Filtered' : 'Filter'}
            </button>
            <button
              className="btn btn-primary flex items-center justify-center gap-2"
              onClick={() => {
                reset();
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Investment
            </button>
          </div>
        </div>
        
        {/* Render filters panel if shown */}
        {renderFilters()}
        
        {/* Display filtering applied notice */}
        {isFiltering && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Filters applied - showing {sortedInvestments().length} of {investments.length} investments
            </p>
            <button
              className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1"
              onClick={clearFilters}
            >
              <RefreshCw className="h-3 w-3" /> Clear filters
            </button>
          </div>
        )}
        
        {/* Investments table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortConfig?.key === 'name' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {sortConfig?.key === 'type' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('country')}
                  >
                    <div className="flex items-center gap-2">
                      Country
                      {sortConfig?.key === 'country' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      {sortConfig?.key === 'amount' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortConfig?.key === 'date' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortConfig?.key === 'status' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('returns')}
                  >
                    <div className="flex items-center gap-2">
                      Returns
                      {sortConfig?.key === 'returns' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {sortedInvestments().map(investment => (
                  <tr key={investment.id}>
                    <td className="table-cell font-medium">{investment.name}</td>
                    <td className="table-cell">{investment.type}</td>
                    <td className="table-cell">{investment.country}</td>
                    <td className="table-cell">{investment.amount.toLocaleString()} {investment.currency}</td>
                    <td className="table-cell">{format(parseISO(investment.date), 'dd MMM yyyy')}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        investment.status === InvestmentStatus.ACTIVE ? 'badge-success' :
                        investment.status === InvestmentStatus.PENDING ? 'badge-warning' :
                        investment.status === InvestmentStatus.CLOSED ? 'badge-error' :
                        investment.status === InvestmentStatus.UNDERPERFORMING ? 'badge-info' :
                        'badge-info'
                      }`}>
                        {investment.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {investment.returns ? (
                        <div>
                          <div>{investment.returns.toLocaleString()} {investment.currency}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {investment.returnPercentage}%
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="p-1 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                          onClick={() => handleEditInvestment(investment)}
                          aria-label="Edit investment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                          onClick={() => handleDeleteInvestment(investment.id)}
                          aria-label="Delete investment"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                          onClick={() => {
                            setSelectedInvestment(investment);
                            // In a real app, you'd open a detailed view modal
                            alert(`Details for ${investment.name}:\n${investment.notes || 'No notes available'}`);
                          }}
                          aria-label="View investment details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedInvestments().length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-8">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Wallet className="h-12 w-12 text-gray-300 dark:text-slate-600" />
                        <p className="text-gray-500 dark:text-slate-400">No investments found</p>
                        <button 
                          className="btn btn-primary flex items-center justify-center gap-2 mt-2"
                          onClick={() => {
                            reset();
                            setIsModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" /> Add Your First Investment
                        </button>
                      </div>
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

  // Render reports view
  const renderReports = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Investment Reports</h2>
        
        {/* Performance summary */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Investment</h4>
              <p className="text-2xl font-bold mt-1">{getTotalInvestmentAmount().toLocaleString()} €</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Returns</h4>
              <p className="text-2xl font-bold mt-1">{getTotalReturns().toLocaleString()} €</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Return Rate</h4>
              <p className="text-2xl font-bold mt-1">{getAverageReturnPercentage().toFixed(2)}%</p>
            </div>
          </div>
        </div>
        
        {/* Investment Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investment Distribution</h3>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="table-header">Investment Type</th>
                  <th className="table-header">Total Amount</th>
                  <th className="table-header">Number of Investments</th>
                  <th className="table-header">Percentage of Portfolio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {Object.values(InvestmentType).map(type => {
                  const investmentsOfType = investments.filter(inv => inv.type === type);
                  const totalAmount = investmentsOfType.reduce((sum, inv) => sum + inv.amount, 0);
                  const portfolioPercentage = getTotalInvestmentAmount() > 0 
                    ? (totalAmount / getTotalInvestmentAmount() * 100).toFixed(2) 
                    : '0.00';
                  
                  return investmentsOfType.length > 0 ? (
                    <tr key={type}>
                      <td className="table-cell font-medium">{type}</td>
                      <td className="table-cell">{totalAmount.toLocaleString()} €</td>
                      <td className="table-cell">{investmentsOfType.length}</td>
                      <td className="table-cell">{portfolioPercentage}%</td>
                    </tr>
                  ) : null;
                })}
                {investments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="table-cell text-center py-4">No investments found. Add investments to see reports.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Country Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Country Distribution</h3>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="table-header">Country</th>
                  <th className="table-header">Total Amount</th>
                  <th className="table-header">Number of Investments</th>
                  <th className="table-header">Percentage of Portfolio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {countries.map(country => {
                  const investmentsInCountry = investments.filter(inv => inv.country === country);
                  const totalAmount = investmentsInCountry.reduce((sum, inv) => sum + inv.amount, 0);
                  const portfolioPercentage = getTotalInvestmentAmount() > 0 
                    ? (totalAmount / getTotalInvestmentAmount() * 100).toFixed(2) 
                    : '0.00';
                  
                  return investmentsInCountry.length > 0 ? (
                    <tr key={country}>
                      <td className="table-cell font-medium">{country}</td>
                      <td className="table-cell">{totalAmount.toLocaleString()} €</td>
                      <td className="table-cell">{investmentsInCountry.length}</td>
                      <td className="table-cell">{portfolioPercentage}%</td>
                    </tr>
                  ) : null;
                })}
                {investments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="table-cell text-center py-4">No investments found. Add investments to see reports.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Export Reports */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Reports</h3>
          
          <p className="text-gray-500 dark:text-slate-400 mb-4">Generate and download investment reports for your records or financial analysis.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="btn btn-primary flex items-center justify-center gap-2"
              onClick={exportInvestmentsData}
              disabled={investments.length === 0}
            >
              <FileDown className="h-4 w-4" /> Export Full Report
            </button>
            
            <button 
              className="btn bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center gap-2"
              disabled={investments.length === 0}
              onClick={() => {
                // In a real app, you would generate a summary report
                alert('Summary report generation would be implemented here');
              }}
            >
              <FileDown className="h-4 w-4" /> Export Summary
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render settings view
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        
        {/* Appearance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
          
          <div className="form-group">
            <label className="form-label">Theme</label>
            <div className="flex items-center space-x-4">
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                  ${!isDarkMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}
                onClick={() => setIsDarkMode(false)}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                  ${isDarkMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}
                onClick={() => setIsDarkMode(true)}
              >
                <MoonStar className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Import Data</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv,.json"
                  className="input flex-1" 
                  onChange={handleFileImport}
                />
                <button 
                  className="btn btn-primary flex items-center justify-center gap-2"
                  onClick={importExcelData}
                  disabled={!fileInput}
                >
                  <FileUp className="h-4 w-4" /> Import
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Upload Excel (.xlsx, .xls), CSV, or JSON files</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Export Data</label>
              <button 
                className="btn btn-primary flex items-center justify-center gap-2"
                onClick={exportInvestmentsData}
                disabled={investments.length === 0}
              >
                <FileDown className="h-4 w-4" /> Export All Data
              </button>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Download all your investment data</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Clear Data</label>
              <button 
                className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center justify-center gap-2"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all investment data? This action cannot be undone.')) {
                    setInvestments([]);
                  }
                }}
                disabled={investments.length === 0}
              >
                <Trash className="h-4 w-4" /> Clear All Data
              </button>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Warning: This will delete all your investment data</p>
            </div>
          </div>
        </div>
        
        {/* Currency Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Currency Settings</h3>
          
          <div className="form-group">
            <label className="form-label" htmlFor="defaultCurrency">Default Currency</label>
            <select 
              id="defaultCurrency" 
              className="input w-full max-w-xs" 
              defaultValue={Currency.EUR}
            >
              {Object.values(Currency).map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">This will be the default currency for new investments</p>
          </div>
        </div>
        
        {/* About */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About</h3>
          
          <div className="space-y-2">
            <p className="text-gray-500 dark:text-slate-400">Investment Portfolio Manager</p>
            <p className="text-gray-500 dark:text-slate-400">Version 1.0.0</p>
            <p className="text-gray-500 dark:text-slate-400">Built for financial professionals to manage investments across Europe</p>
          </div>
        </div>
      </div>
    );
  };

  // Main app layout
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all ${styles.appContainer}`}>
      {/* Sidebar for navigation */}
      <aside className={`${styles.sidebar} fixed inset-y-0 left-0 z-10 w-64 transform bg-white dark:bg-slate-800 overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-gray-200 dark:border-slate-700 shadow-sm ${styles.sidebarMobile}`}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your investments</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          <ul>
            <li>
              <button 
                className={`flex items-center px-6 py-3 w-full text-left ${currentView === AppView.DASHBOARD ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                onClick={() => setCurrentView(AppView.DASHBOARD)}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`flex items-center px-6 py-3 w-full text-left ${currentView === AppView.INVESTMENTS ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                onClick={() => setCurrentView(AppView.INVESTMENTS)}
              >
                <Wallet className="h-5 w-5 mr-3" />
                Investments
              </button>
            </li>
            <li>
              <button 
                className={`flex items-center px-6 py-3 w-full text-left ${currentView === AppView.REPORTS ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                onClick={() => setCurrentView(AppView.REPORTS)}
              >
                <BarChart className="h-5 w-5 mr-3" />
                Reports
              </button>
            </li>
            <li>
              <button 
                className={`flex items-center px-6 py-3 w-full text-left ${currentView === AppView.SETTINGS ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                onClick={() => setCurrentView(AppView.SETTINGS)}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-slate-400">Theme</span>
              <button 
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex items-center">
              <button 
                className="btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                onClick={() => exportInvestmentsData()}
                disabled={investments.length === 0}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={`${styles.mainContent} pt-6 pb-16 md:ml-64`}>
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Conditional rendering based on current view */}
          {currentView === AppView.DASHBOARD && renderDashboard()}
          {currentView === AppView.INVESTMENTS && renderInvestments()}
          {currentView === AppView.REPORTS && renderReports()}
          {currentView === AppView.SETTINGS && renderSettings()}
          
          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-slate-700">
            <p className="text-center text-sm text-gray-500 dark:text-slate-500">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
      
      {/* Render modal if open */}
      {renderModal()}
      
      {/* Mobile navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-around items-center p-3 z-10">
        <button 
          className={`flex flex-col items-center justify-center p-2 ${currentView === AppView.DASHBOARD ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}
          onClick={() => setCurrentView(AppView.DASHBOARD)}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center p-2 ${currentView === AppView.INVESTMENTS ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}
          onClick={() => setCurrentView(AppView.INVESTMENTS)}
        >
          <Wallet className="h-5 w-5" />
          <span className="text-xs mt-1">Investments</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center p-2 ${currentView === AppView.REPORTS ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}
          onClick={() => setCurrentView(AppView.REPORTS)}
        >
          <BarChart className="h-5 w-5" />
          <span className="text-xs mt-1">Reports</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center p-2 ${currentView === AppView.SETTINGS ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}
          onClick={() => setCurrentView(AppView.SETTINGS)}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default App;
